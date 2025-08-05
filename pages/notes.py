# pages/notes.py - 学生笔记功能
import streamlit as st
import json
from datetime import datetime
from database import SessionLocal, Note, NoteTemplate, ExamQuestion, SubmissionAnswer, ChatHistory
from sqlalchemy import func
import re

def render():
    """渲染学生笔记页面"""
    st.title("📝 我的笔记")
    st.markdown("---")
    
    # 创建标签页
    tab1, tab2, tab3, tab4 = st.tabs(["📚 我的笔记", "✍️ 新建笔记", "📋 笔记模板", "📊 笔记统计"])
    
    with tab1:
        render_my_notes()
    
    with tab2:
        render_create_note()
    
    with tab3:
        render_note_templates()
    
    with tab4:
        render_note_statistics()


def render_my_notes():
    """渲染我的笔记列表"""
    st.subheader("📚 我的笔记")
    
    # 搜索和筛选
    col_search, col_category, col_sort = st.columns([2, 1, 1])
    
    with col_search:
        search_query = st.text_input("🔍 搜索笔记", placeholder="输入关键词搜索标题或内容...")
    
    with col_category:
        category_filter = st.selectbox(
            "📂 分类筛选",
            ["全部", "自主笔记", "知识导入", "错题笔记", "聊天记录"]
        )
    
    with col_sort:
        sort_option = st.selectbox(
            "📅 排序方式",
            ["最新创建", "最近更新", "标题A-Z", "收藏优先"]
        )
    
    # 获取笔记数据
    db = SessionLocal()
    try:
        query = db.query(Note).filter(Note.student_id == st.session_state.get("user_id"))
        
        # 应用筛选条件
        if category_filter != "全部":
            query = query.filter(Note.category == category_filter)
        
        if search_query:
            query = query.filter(
                (Note.title.contains(search_query)) |
                (Note.content.contains(search_query))
            )
        
        # 应用排序
        if sort_option == "最新创建":
            query = query.order_by(Note.created_at.desc())
        elif sort_option == "最近更新":
            query = query.order_by(Note.updated_at.desc())
        elif sort_option == "标题A-Z":
            query = query.order_by(Note.title)
        elif sort_option == "收藏优先":
            query = query.order_by(Note.is_favorite.desc(), Note.updated_at.desc())
        
        notes = query.all()
        
        if not notes:
            st.info("📝 还没有任何笔记，点击上方新建笔记开始记录吧！")
            return
        
        st.success(f"📊 共找到 {len(notes)} 条笔记")
        
        # 显示笔记列表
        for note in notes:
            with st.container(border=True):
                col_main, col_actions = st.columns([4, 1])
                
                with col_main:
                    # 笔记标题和基本信息
                    title_col, fav_col = st.columns([5, 1])
                    with title_col:
                        st.subheader(f"{'⭐' if note.is_favorite else '📝'} {note.title}")
                    with fav_col:
                        if st.button("⭐" if not note.is_favorite else "☆", 
                                   key=f"fav_{note.id}", 
                                   help="收藏/取消收藏"):
                            note.is_favorite = not note.is_favorite
                            db.commit()
                            st.rerun()
                    
                    created_time = note.created_at.strftime('%Y-%m-%d %H:%M') if note.created_at else "时间未知"
                    updated_time = note.updated_at.strftime('%Y-%m-%d %H:%M') if note.updated_at else "时间未知"
                    st.caption(f"📂 {note.category} | 📅 创建: {created_time} | 📝 更新: {updated_time}")
                    
                    # 显示标签
                    if note.tags:
                        try:
                            tags = json.loads(note.tags)
                            if tags:
                                tag_str = " ".join([f"`{tag}`" for tag in tags])
                                st.markdown(f"🏷️ **标签**: {tag_str}")
                        except:
                            pass
                    
                    # 笔记内容预览
                    content_preview = note.content[:200] + "..." if len(note.content) > 200 else note.content
                    st.markdown(content_preview)
                
                with col_actions:
                    if st.button("👁️ 查看", key=f"view_{note.id}", use_container_width=True):
                        st.session_state[f"view_note_{note.id}"] = True
                    
                    if st.button("✏️ 编辑", key=f"edit_{note.id}", use_container_width=True):
                        st.session_state[f"edit_note_{note.id}"] = True
                    
                    if st.button("🗑️ 删除", key=f"delete_{note.id}", use_container_width=True):
                        if st.session_state.get(f"confirm_delete_{note.id}", False):
                            db.delete(note)
                            db.commit()
                            st.success("笔记已删除！")
                            st.rerun()
                        else:
                            st.session_state[f"confirm_delete_{note.id}"] = True
                            st.warning("再次点击确认删除")
                
                # 查看笔记详情
                if st.session_state.get(f"view_note_{note.id}", False):
                    with st.expander("📖 笔记详情", expanded=True):
                        st.markdown("### " + note.title)
                        st.markdown(note.content)
                        
                        if st.button("❌ 关闭", key=f"close_view_{note.id}"):
                            st.session_state[f"view_note_{note.id}"] = False
                            st.rerun()
                
                # 编辑笔记
                if st.session_state.get(f"edit_note_{note.id}", False):
                    with st.expander("✏️ 编辑笔记", expanded=True):
                        with st.form(f"edit_note_form_{note.id}"):
                            new_title = st.text_input("标题", value=note.title)
                            new_content = st.text_area("内容", value=note.content, height=300)
                            new_category = st.selectbox(
                                "分类", 
                                ["自主笔记", "知识导入", "错题笔记", "聊天记录"],
                                index=["自主笔记", "知识导入", "错题笔记", "聊天记录"].index(note.category)
                            )
                            
                            # 标签编辑
                            current_tags = []
                            if note.tags:
                                try:
                                    current_tags = json.loads(note.tags)
                                except:
                                    pass
                            
                            new_tags_str = st.text_input(
                                "标签 (用逗号分隔)", 
                                value=", ".join(current_tags) if current_tags else ""
                            )
                            
                            col_save, col_cancel = st.columns(2)
                            with col_save:
                                save_edit = st.form_submit_button("💾 保存修改", use_container_width=True)
                            with col_cancel:
                                cancel_edit = st.form_submit_button("❌ 取消", use_container_width=True)
                            
                            if save_edit:
                                note.title = new_title
                                note.content = new_content
                                note.category = new_category
                                note.updated_at = datetime.now()
                                
                                # 处理标签
                                if new_tags_str.strip():
                                    new_tags = [tag.strip() for tag in new_tags_str.split(",") if tag.strip()]
                                    note.tags = json.dumps(new_tags)
                                else:
                                    note.tags = None
                                
                                db.commit()
                                st.success("笔记已更新！")
                                st.session_state[f"edit_note_{note.id}"] = False
                                st.rerun()
                            
                            if cancel_edit:
                                st.session_state[f"edit_note_{note.id}"] = False
                                st.rerun()
    
    finally:
        db.close()


def render_create_note():
    """渲染新建笔记页面"""
    st.subheader("✍️ 新建笔记")
    
    # 快速导入选项
    st.markdown("#### 🚀 快速导入")
    col_import1, col_import2, col_import3 = st.columns(3)
    
    with col_import1:
        if st.button("📚 导入知识点", use_container_width=True):
            st.session_state["import_type"] = "knowledge"
    
    with col_import2:
        if st.button("❌ 导入错题", use_container_width=True):
            st.session_state["import_type"] = "wrong_question"
    
    with col_import3:
        if st.button("💬 导入聊天记录", use_container_width=True):
            st.session_state["import_type"] = "chat_history"
    
    # 处理导入逻辑
    if "import_type" in st.session_state:
        render_import_section(st.session_state["import_type"])
        if st.button("🔙 返回手动创建"):
            del st.session_state["import_type"]
            st.rerun()
    else:
        # 手动创建笔记
        render_manual_create_note()


def render_import_section(import_type):
    """渲染导入部分"""
    if import_type == "knowledge":
        render_knowledge_import()
    elif import_type == "wrong_question":
        render_wrong_question_import()
    elif import_type == "chat_history":
        render_chat_history_import()


def render_knowledge_import():
    """渲染知识点导入"""
    st.markdown("#### 📚 导入知识点")
    st.info("💡 从您的学习记录中选择知识点，一键生成笔记")
    
    # 这里可以从聊天记录或其他地方获取知识点
    knowledge_text = st.text_area(
        "知识点内容",
        placeholder="请输入或粘贴您想要记录的知识点内容...",
        height=200
    )
    
    if knowledge_text:
        title = st.text_input("笔记标题", value="知识点学习笔记")
        
        # 使用模板格式化内容
        formatted_content = f"""# {title}

## 📚 知识点内容
{knowledge_text}

## 🎯 学习要点
- [ ] 理解核心概念
- [ ] 掌握应用方法
- [ ] 完成相关练习

## 💡 个人理解
*在这里记录您的个人理解和思考...*

## 🔗 相关链接
*记录相关的学习资源链接...*

---
📅 创建时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
        
        if st.button("📝 创建知识点笔记", use_container_width=True):
            create_note(title, formatted_content, "知识导入", "knowledge")


def render_wrong_question_import():
    """渲染错题导入"""
    st.markdown("#### ❌ 导入错题")
    st.info("💡 从您的考试记录中选择错题，生成错题笔记")
    
    db = SessionLocal()
    try:
        # 获取学生的错题
        wrong_answers = db.query(SubmissionAnswer, ExamQuestion).join(
            ExamQuestion, SubmissionAnswer.question_id == ExamQuestion.id
        ).filter(
            SubmissionAnswer.score < ExamQuestion.score  # 得分低于满分的题目
        ).all()
        
        if not wrong_answers:
            st.warning("📝 暂无错题记录")
            return
        
        # 选择错题
        selected_questions = []
        st.markdown("##### 选择要导入的错题:")
        
        for i, (answer, question) in enumerate(wrong_answers):
            with st.container(border=True):
                col_check, col_content = st.columns([1, 5])
                
                with col_check:
                    if st.checkbox(f"题目 {i+1}", key=f"wrong_q_{i}"):
                        selected_questions.append((answer, question))
                
                with col_content:
                    st.markdown(f"**题目**: {question.question_text[:100]}...")
                    st.caption(f"得分: {answer.score}/{question.score}")
        
        if selected_questions and st.button("📝 创建错题笔记", use_container_width=True):
            create_wrong_question_note(selected_questions)
    
    finally:
        db.close()


def render_chat_history_import():
    """渲染聊天记录导入"""
    st.markdown("#### 💬 导入聊天记录")
    st.info("💡 从您与AI的对话中选择有价值的内容生成笔记")
    
    db = SessionLocal()
    try:
        # 获取最近的聊天记录
        chat_records = db.query(ChatHistory).filter(
            ChatHistory.student_id == st.session_state.get("user_id")
        ).order_by(ChatHistory.timestamp.desc()).limit(20).all()
        
        if not chat_records:
            st.warning("📝 暂无聊天记录")
            return
        
        # 按对话分组显示
        conversations = []
        current_conv = []
        
        for record in reversed(chat_records):  # 按时间正序
            if record.is_user and current_conv:
                conversations.append(current_conv)
                current_conv = [record]
            else:
                current_conv.append(record)
        
        if current_conv:
            conversations.append(current_conv)
        
        selected_conversations = []
        st.markdown("##### 选择要导入的对话:")
        
        for i, conv in enumerate(conversations):
            with st.container(border=True):
                col_check, col_content = st.columns([1, 5])
                
                with col_check:
                    if st.checkbox(f"对话 {i+1}", key=f"chat_conv_{i}"):
                        selected_conversations.append(conv)
                
                with col_content:
                    # 显示对话预览
                    user_msg = next((msg for msg in conv if msg.is_user), None)
                    if user_msg:
                        st.markdown(f"**问题**: {user_msg.message[:100]}...")
                        time_str = user_msg.timestamp.strftime('%Y-%m-%d %H:%M') if user_msg.timestamp else "时间未知"
                        st.caption(f"时间: {time_str}")
        
        if selected_conversations and st.button("📝 创建聊天笔记", use_container_width=True):
            create_chat_history_note(selected_conversations)
    
    finally:
        db.close()


def render_manual_create_note():
    """渲染手动创建笔记"""
    st.markdown("#### ✍️ 手动创建笔记")
    
    with st.form("create_note_form"):
        title = st.text_input("📝 笔记标题", placeholder="请输入笔记标题...")
        
        col_category, col_template = st.columns(2)
        with col_category:
            category = st.selectbox("📂 笔记分类", ["自主笔记", "知识导入", "错题笔记", "聊天记录"])
        
        with col_template:
            # 获取模板选项
            template_options = get_note_templates()
            template_choice = st.selectbox("📋 选择模板", ["空白笔记"] + list(template_options.keys()))
        
        # 如果选择了模板，显示模板内容
        template_content = ""
        if template_choice != "空白笔记":
            template_content = template_options[template_choice]
            st.info(f"📋 已选择模板: {template_choice}")
        
        content = st.text_area(
            "📄 笔记内容", 
            value=template_content,
            placeholder="请输入笔记内容，支持Markdown格式...",
            height=400
        )
        
        tags_input = st.text_input("🏷️ 标签 (用逗号分隔)", placeholder="例如: Python, 基础, 重要")
        
        submitted = st.form_submit_button("📝 创建笔记", use_container_width=True)
        
        if submitted:
            if not title or not content:
                st.error("请填写标题和内容！")
            else:
                create_note(title, content, category, "manual", tags_input)


def create_note(title, content, category, source_type, tags_input="", source_id=None):
    """创建笔记"""
    db = SessionLocal()
    try:
        # 处理标签
        tags = None
        if tags_input.strip():
            tag_list = [tag.strip() for tag in tags_input.split(",") if tag.strip()]
            if tag_list:
                tags = json.dumps(tag_list)
        
        new_note = Note(
            student_id=st.session_state.get("user_id"),
            title=title,
            content=content,
            category=category,
            source_type=source_type,
            source_id=source_id,
            tags=tags
        )
        
        db.add(new_note)
        db.commit()
        
        st.success("📝 笔记创建成功！")
        st.balloons()
        
        # 清除导入状态
        if "import_type" in st.session_state:
            del st.session_state["import_type"]
        
        st.rerun()
    
    except Exception as e:
        st.error(f"创建笔记失败: {e}")
    finally:
        db.close()


def create_wrong_question_note(selected_questions):
    """创建错题笔记"""
    content = f"""# 错题整理笔记

📅 整理时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

"""
    
    for i, (answer, question) in enumerate(selected_questions):
        content += f"""## 错题 {i+1}

### 📝 题目
{question.question_text}

### ❌ 我的答案
{answer.student_answer or "未作答"}

### ✅ 正确答案
{question.answer}

### 📚 解析
{question.explanation or "暂无解析"}

### 💡 错误分析
*在这里分析错误原因...*

### 🎯 知识点
*相关知识点总结...*

---

"""
    
    content += """## 📊 总结反思

### 🔍 错误类型分析
- [ ] 概念理解错误
- [ ] 计算错误
- [ ] 审题不仔细
- [ ] 知识点遗忘
- [ ] 其他: ___________

### 📈 改进计划
1. 
2. 
3. 

### 🎯 重点复习
- 
- 
- 
"""
    
    create_note("错题整理笔记", content, "错题笔记", "wrong_question")


def create_chat_history_note(selected_conversations):
    """创建聊天记录笔记"""
    content = f"""# 学习对话记录

📅 整理时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

"""
    
    for i, conv in enumerate(selected_conversations):
        content += f"""## 对话 {i+1}

"""
        for msg in conv:
            if msg.is_user:
                content += f"""### 🙋 我的问题
{msg.message}

"""
            else:
                content += f"""### 🤖 AI回答
{msg.message}

"""
        
        content += """### 💡 学习要点
*从这个对话中学到的关键点...*

### 🎯 延伸思考
*相关的问题和思考...*

---

"""
    
    content += """## 📚 知识总结

### 🔑 核心概念
- 
- 
- 

### 🎯 应用场景
- 
- 
- 

### 📖 进一步学习
- 
- 
- 
"""
    
    create_note("学习对话记录", content, "聊天记录", "chat_history")


def get_note_templates():
    """获取笔记模板"""
    return {
        "学习笔记模板": """# 学习笔记

## 📚 主题
*学习的主要内容*

## 🎯 学习目标
- [ ] 目标1
- [ ] 目标2
- [ ] 目标3

## 📝 核心内容
### 重点1
*详细说明*

### 重点2
*详细说明*

## 💡 个人理解
*自己的理解和思考*

## 🔗 相关资源
- [链接1](url)
- [链接2](url)

## ✅ 学习检查
- [ ] 理解了核心概念
- [ ] 能够应用到实际问题
- [ ] 完成了相关练习
""",
        
        "项目笔记模板": """# 项目笔记

## 📋 项目信息
- **项目名称**: 
- **开始时间**: 
- **预计完成**: 
- **项目状态**: 

## 🎯 项目目标
*项目要达成的目标*

## 📝 实现步骤
1. 步骤1
2. 步骤2
3. 步骤3

## 🛠️ 技术栈
- 技术1
- 技术2
- 技术3

## 🐛 问题记录
### 问题1
- **描述**: 
- **解决方案**: 
- **学到的**: 

## 📈 进度跟踪
- [ ] 任务1
- [ ] 任务2
- [ ] 任务3

## 🎉 项目总结
*项目完成后的总结和反思*
""",
        
        "读书笔记模板": """# 读书笔记

## 📖 书籍信息
- **书名**: 
- **作者**: 
- **出版社**: 
- **阅读时间**: 

## 📝 内容摘要
*书籍的主要内容概述*

## 🌟 精彩片段
> 引用1

> 引用2

## 💡 个人感悟
*阅读后的思考和感悟*

## 🎯 实践应用
*如何将书中的知识应用到实际中*

## ⭐ 评分
**推荐指数**: ⭐⭐⭐⭐⭐

**推荐理由**: 
"""
    }


def render_note_templates():
    """渲染笔记模板页面"""
    st.subheader("📋 笔记模板")
    st.info("💡 使用模板可以帮助您更好地组织笔记内容")
    
    templates = get_note_templates()
    
    for template_name, template_content in templates.items():
        with st.expander(f"📋 {template_name}", expanded=False):
            st.markdown("##### 模板预览:")
            st.code(template_content, language="markdown")
            
            if st.button(f"📝 使用此模板", key=f"use_template_{template_name}"):
                st.session_state["selected_template"] = template_content
                st.session_state["selected_template_name"] = template_name
                st.success(f"已选择模板: {template_name}，请前往新建笔记页面使用")


def render_note_statistics():
    """渲染笔记统计页面"""
    st.subheader("📊 笔记统计")
    
    db = SessionLocal()
    try:
        # 获取统计数据
        total_notes = db.query(Note).filter(Note.student_id == st.session_state.get("user_id")).count()
        
        if total_notes == 0:
            st.info("📝 还没有笔记数据可以统计")
            return
        
        # 基本统计
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("📝 总笔记数", total_notes)
        
        with col2:
            favorite_count = db.query(Note).filter(
                Note.student_id == st.session_state.get("user_id"),
                Note.is_favorite == True
            ).count()
            st.metric("⭐ 收藏笔记", favorite_count)
        
        with col3:
            # 本月新增
            from datetime import datetime, timedelta
            month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_notes = db.query(Note).filter(
                Note.student_id == st.session_state.get("user_id"),
                Note.created_at >= month_start
            ).count()
            st.metric("📅 本月新增", month_notes)
        
        with col4:
            # 最近更新
            week_start = datetime.now() - timedelta(days=7)
            week_updates = db.query(Note).filter(
                Note.student_id == st.session_state.get("user_id"),
                Note.updated_at >= week_start
            ).count()
            st.metric("🔄 本周更新", week_updates)
        
        st.markdown("---")
        
        # 分类统计
        st.markdown("#### 📂 分类统计")
        category_stats = db.query(Note.category, func.count(Note.id)).filter(
            Note.student_id == st.session_state.get("user_id")
        ).group_by(Note.category).all()
        
        if category_stats:
            categories = [stat[0] for stat in category_stats]
            counts = [stat[1] for stat in category_stats]
            
            # 使用Streamlit的图表功能
            import pandas as pd
            df = pd.DataFrame({
                '分类': categories,
                '数量': counts
            })
            st.bar_chart(df.set_index('分类'))
        
        # 最近活动
        st.markdown("#### 📈 最近活动")
        recent_notes = db.query(Note).filter(
            Note.student_id == st.session_state.get("user_id")
        ).order_by(Note.updated_at.desc()).limit(5).all()
        
        for note in recent_notes:
            with st.container(border=True):
                st.markdown(f"**{note.title}**")
                updated_time = note.updated_at.strftime('%Y-%m-%d %H:%M') if note.updated_at else "时间未知"
                st.caption(f"📂 {note.category} | 📅 {updated_time}")
    
    finally:
        db.close()
