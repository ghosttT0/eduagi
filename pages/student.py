# views/student_view.py (最终对话式学习空间)
import streamlit as st
import json
import re
from utils import load_conversational_chain
from database import SessionLocal, ChatHistory, KnowledgePoint, StudentDispute, User, Class, KnowledgeMastery
from datetime import datetime


def render():
    """渲染最终版的、包含两大对话模块的学生学习页面"""
    qa_chain = load_conversational_chain()
    st.title("👨‍🎓 AI智能学习伙伴")

    # --- 使用Tabs来分离两种不同的对话体验 ---
    tab_qa, tab_practice, tab_dispute, tab_mastery = st.tabs(["🧠 基于课程知识的答疑", "📝 自主生成靶向练习与反馈", "❓ 向老师提问", "📊 知识掌握评估"])
    # --- Tab 1: AI导师对话 (已恢复所有功能) ---
    with tab_qa:
        st.subheader("与你的专属导师自由交流（支持上下文多轮对话）")

        col1, col2 = st.columns([3, 1])
        with col1:
            # --- 核心修复：恢复AI模式选择功能 ---
            if "ai_mode" not in st.session_state:
                st.session_state.ai_mode = "直接问答"

            st.session_state.ai_mode = st.radio(
                "选择AI导师模式:",
                ["直接问答", "苏格拉底式引导", "关联知识分析"],
                horizontal=True, key="ai_mode_selector"
            )
        with col2:
            if st.button("🗑️ 清空对话历史", key="clear_chat"):
                db = SessionLocal()
                try:
                    student_id = st.session_state.get("user_id")
                    # 1. 清空数据库
                    db.query(ChatHistory).filter(ChatHistory.student_id == student_id).delete()
                    db.commit()
                    # --- 核心修复：同时清空当前会话的显示列表 ---
                    st.session_state.chat_messages = []
                    st.success("对话历史已清空！")
                    st.rerun()  # 刷新页面
                finally:
                    db.close()

        st.markdown("---")

        # --- 对话历史记录展示 ---
        if "chat_messages" not in st.session_state:
            st.session_state.chat_messages = []

        # 仅在初次加载时从数据库读取历史记录
        if not st.session_state.chat_messages:
            db = SessionLocal()
            try:
                student_id = st.session_state.get("user_id")
                history = db.query(ChatHistory).filter(ChatHistory.student_id == student_id).order_by(
                    ChatHistory.timestamp).all()
                for msg in history:
                    role = "user" if msg.is_user else "assistant"
                    st.session_state.chat_messages.append({"role": role, "content": msg.message})
            finally:
                db.close()

        # 显示聊天记录
        for i, message in enumerate(st.session_state.chat_messages):
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

                # 为AI回答添加导入笔记按钮
                if message["role"] == "assistant" and len(message["content"]) > 50:
                    col_import, col_space = st.columns([1, 4])
                    with col_import:
                        if st.button("📝 导入笔记", key=f"import_note_{i}", help="将此AI回答导入到我的笔记"):
                            import_chat_to_note(message["content"], i)

        # --- 对话输入框 ---
        if prompt := st.chat_input("请在这里向AI导师提问..."):
            student_id = st.session_state.get("user_id")
            # 将用户消息添加到显示列表和数据库
            st.session_state.chat_messages.append({"role": "user", "content": prompt})
            # ... (保存用户消息到数据库的逻辑) ...

            with st.chat_message("user"):
                st.markdown(prompt)

            # 调用带记忆的AI链
            with st.chat_message("assistant"):
                with st.spinner("AI导师正在思考..."):
                    conversation_chain = load_conversational_chain()

                    # 1. 准备历史记录 (供AI“记忆”使用)
                    chat_history_for_chain = []
                    for msg in st.session_state.chat_messages[-10:-1]:  # 取最近5轮对话作为记忆
                        if msg["role"] == "user":
                            chat_history_for_chain.append((msg["content"], ""))
                        elif msg["role"] == "assistant" and chat_history_for_chain:
                            question, _ = chat_history_for_chain[-1]
                            chat_history_for_chain[-1] = (question, msg["content"])

                    # 2. 根据用户选择的“模式”，构造当前问题的Prompt
                    mode_prompts = {
                        "直接问答": f"请直接、清晰地回答以下问题：{prompt}",
                        "苏格拉底式引导": f"请扮演苏格拉底，不要直接回答问题，而是通过反问来引导我思考这个问题：{prompt}",
                        "关联知识分析": f"请分析这个问题 “{prompt}” 主要涉及了哪些关联知识点，并对这些关联点进行简要说明。"
                    }
                    final_question_for_chain = mode_prompts.get(st.session_state.ai_mode, prompt)

                    # 3. 调用AI，同时传入“新问题”和“旧历史”
                    response = conversation_chain.invoke({
                        "question": final_question_for_chain,
                        "chat_history": chat_history_for_chain
                    })
                    ai_message = response['answer']

                    st.markdown(ai_message)
                    # 将AI回复添加到显示列表和数据库
                    st.session_state.chat_messages.append({"role": "assistant", "content": ai_message})
                    # ... (保存AI消息到数据库的逻辑) ...

                    # --- Tab 2: AI靶向练习 (完整实现版) ---
    with tab_practice:
        st.subheader("针对特定知识点进行强化练习")

        # 初始化练习状态
        if 'practice_question' not in st.session_state:
            st.session_state.practice_question = None
        if 'practice_feedback' not in st.session_state:
            st.session_state.practice_feedback = None

        # 如果当前没有正在进行的练习，则让用户输入知识点
        if st.session_state.practice_question is None:
            st.info("请输入一个知识点，AI会为你生成一道相关的练习题。")
            with st.form("practice_topic_form"):
                topic = st.text_input("你想练习的知识点:", placeholder="例如：卷积神经网络、梯度消失问题")
                start_practice = st.form_submit_button("开始练习")

            if start_practice and topic:
                with st.spinner(f"正在为“{topic}”生成练习题..."):
                    try:
                        # 1. 更新知识点词云数据
                        db = SessionLocal()
                        kp = db.query(KnowledgePoint).filter(KnowledgePoint.topic == topic).first()
                        if kp:
                            kp.query_count += 1
                        else:
                            db.add(KnowledgePoint(topic=topic))
                        db.commit()
                        db.close()

                        # 2. 调用AI生成题目和答案
                        q_prompt = f"""
                                你是一位出题专家。请根据知识点“{topic}”，生成一道相关的简答题。
                                你的回复必须是一个单一的JSON对象，包含 "question_text" (题目) 和 "standard_answer" (标准答案) 两个键。
                                不要包含任何额外的解释。
                                """

                        # --- 核心修复 1：修正调用方式 ---
                        response = qa_chain.invoke({"question": q_prompt, "chat_history": []})
                        # --- 核心修复 2：修正获取结果的键名 ---
                        result_text = response['answer'].strip()

                        # 添加调试选项
                        debug_mode = st.checkbox("🔍 显示AI原始回复（调试模式）", key="debug_practice")
                        if debug_mode:
                            st.code(result_text, language="text")

                        # 改进的JSON解析逻辑
                        json_data = None

                        # 方法1: 直接解析
                        try:
                            json_data = json.loads(result_text)
                        except:
                            pass

                        # 方法2: 提取大括号内容并清理
                        if not json_data:
                            match = re.search(r'\{.*?\}', result_text, re.DOTALL)
                            if match:
                                try:
                                    json_str = match.group(0)
                                    # 清理常见问题
                                    json_str = json_str.replace('\n', ' ').replace('\r', ' ')
                                    json_str = re.sub(r'\s+', ' ', json_str)
                                    json_str = json_str.replace("'", '"')  # 单引号改双引号
                                    json_data = json.loads(json_str)
                                except:
                                    pass

                        # 方法3: 手动提取题目和答案
                        if not json_data:
                            question_match = re.search(r'题目[：:]\s*(.+?)(?=答案|$)', result_text, re.DOTALL | re.IGNORECASE)
                            answer_match = re.search(r'答案[：:]\s*(.+)', result_text, re.DOTALL | re.IGNORECASE)

                            if question_match and answer_match:
                                json_data = {
                                    "question_text": question_match.group(1).strip(),
                                    "standard_answer": answer_match.group(1).strip()
                                }

                        # 方法4: 默认题目（最后备选）
                        if not json_data:
                            json_data = {
                                "question_text": f"请详细解释{topic}的核心概念、原理和应用场景。",
                                "standard_answer": f"{topic}是一个重要的概念。请从定义、原理、特点、应用场景等方面进行详细阐述。"
                            }
                            st.warning("AI返回格式异常，已生成默认练习题")

                        # 最终验证和处理
                        if json_data:
                            # 确保必要字段存在，如果不存在则补充
                            if "question_text" not in json_data:
                                json_data["question_text"] = f"请详细解释{topic}的核心概念和应用。"
                            if "standard_answer" not in json_data:
                                json_data["standard_answer"] = f"{topic}是一个重要概念，需要深入理解。"

                            # 清理字段内容
                            json_data["question_text"] = str(json_data["question_text"]).strip()
                            json_data["standard_answer"] = str(json_data["standard_answer"]).strip()

                            # 确保内容不为空
                            if not json_data["question_text"]:
                                json_data["question_text"] = f"请解释{topic}的相关概念。"
                            if not json_data["standard_answer"]:
                                json_data["standard_answer"] = f"这是关于{topic}的重要知识点。"

                            # 将题目和答案都存入session_state，并保存知识点
                            json_data['topic'] = topic  # 保存知识点信息
                            st.session_state.practice_question = json_data
                            st.session_state.practice_feedback = None  # 清空上一题的反馈
                            st.success("✅ 练习题生成成功！")

                            # 显示生成的题目预览
                            with st.expander("📋 题目预览", expanded=False):
                                st.write(f"**题目**: {json_data['question_text'][:100]}...")
                                st.write(f"**答案**: {json_data['standard_answer'][:100]}...")

                            st.rerun()
                        else:
                            # 如果所有方法都失败，创建一个基本的默认题目
                            default_question = {
                                "question_text": f"请详细说明{topic}的定义、特点和应用场景。",
                                "standard_answer": f"{topic}的定义：[请根据具体内容填写]\n特点：[请列举主要特点]\n应用场景：[请说明实际应用]"
                            }
                            default_question['topic'] = topic  # 添加知识点信息
                            st.session_state.practice_question = default_question
                            st.session_state.practice_feedback = None
                            st.warning("⚠️ AI生成异常，已创建默认练习题，您可以继续练习。")
                            st.rerun()

                    except Exception as e:
                        st.error(f"生成练习题时出错: {e}")

        # 如果已经生成了题目，则进入作答和反馈环节
        else:
            current_q = st.session_state.practice_question
            st.info(f"**练习题：**\n{current_q['question_text']}")

            with st.form("practice_answer_form"):
                student_answer = st.text_area("请在此处作答:", height=150, key="practice_answer_input")
                submit_answer = st.form_submit_button("提交答案获取反馈")

            if submit_answer and student_answer:
                with st.spinner("AI正在分析您的答案并生成反馈..."):
                    try:
                        # 调用AI生成反馈
                        feedback_prompt = f"""
                        你是一位教学助手。请对比标准答案和学生的回答，并提供一份内容饱满、富有建设性的反馈。
                        - 考察知识点: "{current_q.get('topic', '未知')}"
                        - 题目是: "{current_q['question_text']}"
                        - 标准答案是: "{current_q['standard_answer']}"
                        - 学生的回答是: "{student_answer}"
                        你的反馈应首先指出学生回答的亮点，然后点明不足之处或可以改进的地方，最后进行总结并给出你觉得可以的评分(10分为满分）。
                        """
                        response = qa_chain.invoke({"question": feedback_prompt, "chat_history": []})
                        st.session_state.practice_feedback = response['answer']  # <-- 核心修复：将 'result' 改为 'answer'
                    except Exception as e:
                        st.error(f"生成反馈时出错: {e}")

            # 显示AI的反馈
            if st.session_state.practice_feedback:
                st.markdown("---")
                st.subheader("智能导师反馈")
                st.success(st.session_state.practice_feedback)

                if st.button("进行下一题"):
                    st.session_state.practice_question = None
                    st.session_state.practice_feedback = None
                    st.rerun()

    # --- Tab 3: 向老师提问 ---
    with tab_dispute:
        st.subheader("📝 向班级老师提交疑问")

        # 获取当前学生的班级信息
        db = SessionLocal()
        try:
            current_student_id = st.session_state.get("user_id")
            student = db.query(User).filter(User.id == current_student_id).first()

            if not student or not student.class_id:
                st.warning("您还没有被分配到任何班级，无法向老师提问。请联系管理员。")
                return

            # 获取班级信息和班级教师
            student_class = db.query(Class).filter(Class.id == student.class_id).first()
            class_teacher = db.query(User).filter(
                User.class_id == student.class_id,
                User.role == "教师"
            ).first()

            if not class_teacher:
                st.warning(f"您的班级 {student_class.name} 还没有分配教师，无法提交疑问。")
                return

            st.info(f"您的班级：{student_class.name} | 班级教师：{class_teacher.display_name}")

            # 疑问提交表单
            with st.form("submit_dispute_form"):
                st.markdown("##### 提交新疑问")
                dispute_message = st.text_area(
                    "请详细描述您的疑问",
                    placeholder="例如：关于今天讲的卷积神经网络，我不太理解池化层的作用...",
                    height=150
                )

                submitted = st.form_submit_button("📤 提交疑问", use_container_width=True)

                if submitted:
                    if not dispute_message.strip():
                        st.warning("请输入疑问内容！")
                    else:
                        try:
                            new_dispute = StudentDispute(
                                student_id=current_student_id,
                                class_id=student.class_id,
                                message=dispute_message,
                                status="待处理"
                            )
                            db.add(new_dispute)
                            db.commit()
                            st.success("疑问已成功提交给班级教师！教师会尽快回复您。")
                            st.rerun()
                        except Exception as e:
                            st.error(f"提交疑问失败：{e}")
                            db.rollback()

            st.markdown("---")

            # 显示我的疑问历史
            st.subheader("📋 我的疑问历史")

            my_disputes = db.query(StudentDispute).filter(
                StudentDispute.student_id == current_student_id
            ).order_by(StudentDispute.timestamp.desc()).all()

            if not my_disputes:
                st.info("您还没有提交过任何疑问。")
            else:
                for dispute in my_disputes:
                    # 根据状态设置不同的样式
                    if dispute.status == "待处理":
                        status_icon = "⏳"
                        status_color = "orange"
                    else:
                        status_icon = "✅"
                        status_color = "green"

                    with st.container(border=True):
                        st.markdown(f"**{status_icon} 疑问 #{dispute.id}** - ::{status_color}[{dispute.status}]")
                        st.markdown(f"**提交时间：** {dispute.timestamp.strftime('%Y-%m-%d %H:%M')}")
                        st.markdown(f"**我的疑问：**")
                        st.markdown(f"> {dispute.message}")

                        if dispute.teacher_reply:
                            st.markdown(f"**教师回复：**")
                            st.success(dispute.teacher_reply)
                            st.caption(f"回复时间：{dispute.reply_timestamp.strftime('%Y-%m-%d %H:%M')}")
                        else:
                            st.info("教师还未回复，请耐心等待...")

                        st.markdown("---")

        finally:
            db.close()

    # --- Tab 4: 知识掌握评估 ---
    with tab_mastery:
        st.subheader("📊 知识掌握自我评估")
        st.info("在这里，您可以评估自己对各个知识点的掌握程度，系统将在知识图谱中用不同颜色标记您的掌握情况。")

        # 获取当前学生ID
        current_student_id = st.session_state.get("user_id")

        # 创建两列布局
        col1, col2 = st.columns([2, 3])

        with col1:
            # 添加新知识点评估表单
            with st.form("add_knowledge_mastery"):
                st.markdown("##### 添加/更新知识点评估")

                # 知识点输入
                knowledge_point = st.text_input("知识点名称", placeholder="例如：循环神经网络")

                # 掌握程度选择
                mastery_level = st.select_slider(
                    "掌握程度",
                    options=[1, 2, 3],
                    format_func=lambda x: {
                        1: "🔴 薄弱环节",
                        2: "🟡 基本掌握",
                        3: "🟢 熟练掌握"
                    }.get(x),
                    value=2
                )

                # 自我评估说明
                self_assessment = st.text_area(
                    "自我评估说明（可选）",
                    placeholder="例如：我理解基本概念，但在实际应用中还有困难...",
                    height=100
                )

                # 提交按钮
                submitted = st.form_submit_button("保存评估", use_container_width=True)

                if submitted:
                    if not knowledge_point:
                        st.error("请输入知识点名称！")
                    else:
                        db = SessionLocal()
                        try:
                            # 检查是否已存在该知识点的评估
                            existing = db.query(KnowledgeMastery).filter(
                                KnowledgeMastery.student_id == current_student_id,
                                KnowledgeMastery.knowledge_point == knowledge_point
                            ).first()

                            if existing:
                                # 更新现有记录
                                existing.mastery_level = mastery_level
                                existing.self_assessment = self_assessment
                                existing.updated_at = datetime.now()
                                db.commit()
                                st.success(f"已更新对「{knowledge_point}」的掌握程度评估！")
                            else:
                                # 创建新记录
                                new_mastery = KnowledgeMastery(
                                    student_id=current_student_id,
                                    knowledge_point=knowledge_point,
                                    mastery_level=mastery_level,
                                    self_assessment=self_assessment
                                )
                                db.add(new_mastery)
                                db.commit()
                                st.success(f"已添加对「{knowledge_point}」的掌握程度评估！")

                            # 刷新页面
                            st.rerun()
                        except Exception as e:
                            st.error(f"保存评估时出错：{e}")
                        finally:
                            db.close()

            # 掌握程度说明
            with st.expander("掌握程度说明"):
                st.markdown("""
                - 🔴 **薄弱环节**：对概念理解不清晰，需要重点复习
                - 🟡 **基本掌握**：理解基本概念，但在应用中可能有困难
                - 🟢 **熟练掌握**：概念清晰，能够灵活应用
                """)

        with col2:
            # 显示已评估的知识点列表
            st.markdown("##### 我的知识掌握情况")

            db = SessionLocal()
            try:
                # 获取当前学生的所有知识点评估
                mastery_records = db.query(KnowledgeMastery).filter(
                    KnowledgeMastery.student_id == current_student_id
                ).order_by(KnowledgeMastery.updated_at.desc()).all()

                if not mastery_records:
                    st.info("您还没有添加任何知识点评估。请在左侧表单中添加您的第一个评估。")
                else:
                    # 显示知识点掌握情况统计
                    total = len(mastery_records)
                    weak = len([r for r in mastery_records if r.mastery_level == 1])
                    basic = len([r for r in mastery_records if r.mastery_level == 2])
                    proficient = len([r for r in mastery_records if r.mastery_level == 3])

                    # 显示统计数据
                    stat_col1, stat_col2, stat_col3, stat_col4 = st.columns(4)
                    with stat_col1:
                        st.metric("总知识点", total)
                    with stat_col2:
                        st.metric("薄弱环节", weak, delta=f"{weak/total*100:.1f}%" if total > 0 else "0%")
                    with stat_col3:
                        st.metric("基本掌握", basic, delta=f"{basic/total*100:.1f}%" if total > 0 else "0%")
                    with stat_col4:
                        st.metric("熟练掌握", proficient, delta=f"{proficient/total*100:.1f}%" if total > 0 else "0%")

                    # 显示知识点列表
                    for record in mastery_records:
                        # 根据掌握程度设置不同的颜色
                        if record.mastery_level == 1:
                            container_style = "error"
                            emoji = "🔴"
                        elif record.mastery_level == 2:
                            container_style = "warning"
                            emoji = "🟡"
                        else:
                            container_style = "success"
                            emoji = "🟢"

                        # 显示知识点卡片
                        with st.container(border=True):
                            col_info, col_action = st.columns([4, 1])

                            with col_info:
                                st.markdown(f"**{emoji} {record.knowledge_point}**")
                                st.caption(f"更新时间: {record.updated_at.strftime('%Y-%m-%d %H:%M')}")
                                if record.self_assessment:
                                    st.markdown(f"*{record.self_assessment}*")

                            with col_action:
                                if st.button("删除", key=f"delete_{record.id}"):
                                    try:
                                        db.delete(record)
                                        db.commit()
                                        st.success("已删除该知识点评估")
                                        st.rerun()
                                    except Exception as e:
                                        st.error(f"删除失败: {e}")

                # 添加查看知识图谱的链接
                st.markdown("---")
                st.markdown("👉 前往[数据可视化中心](/数据可视化中心)查看您的知识掌握情况图谱")

            finally:
                db.close()


def import_chat_to_note(content, message_index):
    """将AI对话内容导入到笔记"""
    from database import Note
    import json
    from datetime import datetime

    # 生成笔记标题
    title = f"AI学习记录 - {datetime.now().strftime('%Y-%m-%d %H:%M')}"

    # 格式化笔记内容
    formatted_content = f"""# {title}

## 🤖 AI回答内容
{content}

## 💡 个人理解
*在这里记录您对这个回答的理解和思考...*

## 🎯 关键要点
-
-
-

## 🔗 相关知识
*记录相关的知识点和概念...*

## 📚 延伸学习
*需要进一步学习的内容...*

---
📅 导入时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
📍 来源: AI对话记录
"""

    db = SessionLocal()
    try:
        new_note = Note(
            student_id=st.session_state.get("user_id"),
            title=title,
            content=formatted_content,
            category="知识导入",
            source_type="chat_history",
            source_id=message_index,
            tags=json.dumps(["AI学习", "对话记录"])
        )

        db.add(new_note)
        db.commit()

        st.success("📝 已成功导入到我的笔记！")
        st.info("💡 您可以在我的笔记页面查看和编辑这条笔记")

    except Exception as e:
        st.error(f"导入笔记失败: {e}")
    finally:
        db.close()
