# views/visualization_view.py (增加D3图谱生成过程展示)
import json
import re
import uuid
from streamlit.components.v1 import html
from jinja2 import Template
from utils import load_conversational_chain
import streamlit as st
import stylecloud
import jieba
from database import SessionLocal, ChatHistory, KnowledgeMastery
import os
from PIL import Image
import numpy as np

def parse_d3_graph_json(result_text, keyword):
    """
    强化版D3图谱JSON解析函数
    """
    if not result_text or not result_text.strip():
        return create_default_graph(keyword)

    # 方法1: 直接JSON解析
    try:
        json_data = json.loads(result_text)
        if isinstance(json_data, dict) and 'name' in json_data:
            return json_data
    except:
        pass

    # 方法2: 提取大括号内容
    try:
        match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            json_data = json.loads(json_str)
            if isinstance(json_data, dict) and 'name' in json_data:
                return json_data
    except:
        pass

    # 方法3: 清理后解析
    try:
        match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            # 清理常见问题
            json_str = json_str.replace('\n', ' ').replace('\r', ' ')
            json_str = re.sub(r'\s+', ' ', json_str)
            json_str = json_str.replace("'", '"')  # 单引号改双引号

            # 尝试修复缺少引号的键
            json_str = re.sub(r'(\w+):', r'"\1":', json_str)

            json_data = json.loads(json_str)
            if isinstance(json_data, dict) and 'name' in json_data:
                return json_data
    except:
        pass

    # 方法4: 查找第一个完整的JSON对象
    try:
        # 查找所有可能的JSON对象
        brace_count = 0
        start_pos = -1

        for i, char in enumerate(result_text):
            if char == '{':
                if start_pos == -1:
                    start_pos = i
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0 and start_pos != -1:
                    # 找到完整的JSON对象
                    json_str = result_text[start_pos:i+1]
                    json_data = json.loads(json_str)
                    if isinstance(json_data, dict) and 'name' in json_data:
                        return json_data
                    start_pos = -1
    except:
        pass

    # 方法5: 返回默认图谱
    return create_default_graph(keyword)

def create_default_graph(keyword):
    """创建默认的D3图谱结构"""
    return {
        "name": keyword,
        "children": [
            {
                "name": "基本概念",
                "children": [
                    {"name": "定义与特点"},
                    {"name": "发展历史"},
                    {"name": "应用领域"}
                ]
            },
            {
                "name": "核心原理",
                "children": [
                    {"name": "工作机制"},
                    {"name": "算法流程"},
                    {"name": "技术要点"}
                ]
            },
            {
                "name": "实际应用",
                "children": [
                    {"name": "典型案例"},
                    {"name": "实现方法"},
                    {"name": "发展趋势"}
                ]
            }
        ]
    }

def add_generation_id(node, gen_id):
    """递归函数，为图谱中的每个节点添加一个批次ID"""
    node['generation_id'] = gen_id
    if 'children' in node:
        for child in node['children']:
            add_generation_id(child, gen_id)

def add_mastery_info(node, mastery_dict):
    """递归函数，为图谱中的每个节点添加掌握程度信息"""
    knowledge_point = node['name']
    if knowledge_point in mastery_dict:
        mastery_level = mastery_dict[knowledge_point]
        node['mastery_level'] = mastery_level
        # 根据掌握程度设置颜色和大小
        if mastery_level == 1:  # 薄弱环节
            node['color'] = '#ff4444'  # 红色
            node['size'] = 12
        elif mastery_level == 2:  # 基本掌握
            node['color'] = '#ffaa00'  # 黄色
            node['size'] = 15
        else:  # 熟练掌握
            node['color'] = '#44ff44'  # 绿色
            node['size'] = 18
    else:
        # 未评估的知识点使用默认颜色
        node['mastery_level'] = 0
        node['color'] = '#888888'  # 灰色
        node['size'] = 15

    if 'children' in node:
        for child in node['children']:
            add_mastery_info(child, mastery_dict)

def render():
    """渲染包含词云和D3知识图谱的数据可视化页面"""
    st.title("📊 数据可视化中心")

    tab1, tab2 = st.tabs(["**☁️ 知识点词云**", "**🧠 AI知识图谱 (D3.js)**"])

    # --- Tab 1: 知识点词云 (使用您的灯泡图片) ---
    with tab1:
        st.info("AI通过分析所有学生的提问，智能提取出当前最受关注的知识焦点。")

        # 预设AI/机器学习关键词
        preset_keywords = {
            "循环神经网络": 25, "卷积神经网络": 23, "深度学习": 20, "机器学习": 18,
            "人工智能": 16, "神经网络": 15, "自然语言处理": 14, "计算机视觉": 13,
            "数据挖掘": 12, "算法优化": 11, "Python编程": 10, "数据结构": 9,
            "线性代数": 8, "概率统计": 7, "反向传播": 6, "梯度下降": 5,
            "特征提取": 4, "模型训练": 3, "过拟合": 2, "正则化": 1
        }

        # 生成词云按钮
        if st.button("🎯 生成知识点词云", key="generate_wordcloud", use_container_width=True):

            with st.spinner("正在生成知识点词云..."):
                try:
                    # 获取学生提问数据
                    db = SessionLocal()
                    all_questions = db.query(ChatHistory.message).filter(ChatHistory.is_user == True).all()

                    # 合并预设关键词和学生提问
                    combined_keywords = preset_keywords.copy()

                    if all_questions:
                        # 分析学生提问
                        text = " ".join([q[0] for q in all_questions])
                        word_list = jieba.cut(text, cut_all=False)

                        # 过滤停用词
                        filtered_words = [word for word in word_list
                                        if len(word) >= 2 and word not in ['什么', '怎么', '如何', '为什么', '可以', '这个', '那个', '请问', '老师', '同学']]

                        # 统计词频
                        from collections import Counter
                        word_freq = Counter(filtered_words)

                        # 合并到预设关键词中
                        for word, freq in word_freq.items():
                            if word in combined_keywords:
                                combined_keywords[word] += freq
                            else:
                                combined_keywords[word] = freq

                    db.close()

                    # 使用WordCloud生成灯泡形状词云
                    from wordcloud import WordCloud
                    import matplotlib.pyplot as plt

                    # 加载正确的灯泡蒙版（文字填充在灯泡内部）
                    try:
                        # 优先尝试加载正确的灯泡蒙版
                        mask_files = [
                            "correct_lightbulb_mask.png",      # 标准版
                            "detailed_lightbulb_mask.png",     # 详细版
                            "simple_filled_lightbulb.png"      # 简单版
                        ]

                        mask_array = None
                        mask_used = None

                        for mask_file in mask_files:
                            try:
                                mask_image = Image.open(mask_file)
                                mask_array = np.array(mask_image)

                                # 转换为灰度
                                if len(mask_array.shape) == 3:
                                    mask_array = np.mean(mask_array, axis=2)

                                # 确保蒙版格式正确
                                mask_array = mask_array.astype(np.uint8)
                                mask_used = mask_file
                                break
                            except:
                                continue

                    except Exception as e:
                        st.warning(f"无法加载灯泡蒙版，使用默认形状: {e}")
                        mask_array = None

                    # 生成词云
                    # 尝试找到正确的字体路径
                    font_paths = ['SimHei.ttf', 'simhei.ttf', 'C:/Windows/Fonts/simhei.ttf']
                    font_path = None
                    for fp in font_paths:
                        if os.path.exists(fp):
                            font_path = fp
                            break

                    wordcloud_params = {
                        'font_path': font_path,
                        'width': 800,
                        'height': 800,
                        'background_color': 'white',
                        'max_words': 60,  # 增加词汇数量
                        'colormap': 'viridis',  # 使用科技感配色
                        'relative_scaling': 0.5,  # 调整相对缩放
                        'random_state': 42,
                        'collocations': False,  # 避免重复词组
                        'prefer_horizontal': 0.6,  # 平衡水平和垂直文字
                        'min_font_size': 8,  # 设置最小字体
                        'max_font_size': 100,  # 设置最大字体
                        'scale': 2  # 提高清晰度
                    }

                    # 如果有蒙版，添加蒙版参数
                    if mask_array is not None:
                        wordcloud_params['mask'] = mask_array
                        wordcloud_params['contour_width'] = 1
                        wordcloud_params['contour_color'] = '#FFD700'  # 金色轮廓
                        # 根据蒙版调整尺寸
                        wordcloud_params['width'] = mask_array.shape[1]
                        wordcloud_params['height'] = mask_array.shape[0]

                    wordcloud = WordCloud(**wordcloud_params).generate_from_frequencies(combined_keywords)

                    # 转换为图片并显示
                    fig, ax = plt.subplots(figsize=(10, 10))  # 正方形画布适应灯泡形状
                    ax.imshow(wordcloud, interpolation='bilinear')
                    ax.axis('off')

                    # 设置紧凑布局
                    plt.tight_layout()

                    st.success("💡 灯泡形状知识点词云生成完成！")
                    st.pyplot(fig)
                    plt.close()

                    # 添加说明
                    st.markdown("💡 **创意说明**: 词云采用灯泡形状，象征着知识的启发和创新思维！")

                    # 显示关键词统计
                    with st.expander("📊 词云统计信息", expanded=False):
                        st.markdown(f"**总关键词数**: {len(combined_keywords)}")
                        st.markdown(f"**学生提问数**: {len(all_questions) if all_questions else 0}")

                        # 显示热门关键词
                        top_keywords = sorted(combined_keywords.items(), key=lambda x: x[1], reverse=True)[:10]
                        st.markdown("##### 🔥 热门关键词 TOP 10")
                        for i, (word, freq) in enumerate(top_keywords, 1):
                            st.markdown(f"{i}. **{word}** - 权重 {freq}")

                except Exception as e:
                    st.error(f"生成词云时出错: {e}")
                    # 显示预设关键词作为备选
                    st.markdown("##### 📋 预设AI/机器学习关键词")
                    cols = st.columns(4)
                    keywords_list = list(preset_keywords.keys())
                    for i, keyword in enumerate(keywords_list):
                        with cols[i % 4]:
                            st.markdown(f"• **{keyword}**")



        # --- Tab 2: D3知识图谱 (已修复) ---
    with tab2:
        """渲染包含D3径向树状图的数据可视化页面"""
        st.title("📊 数据可视化中心")

        # 我们暂时专注于D3图谱，您可以之后把词云的Tab加回来
        st.info("请输入一个核心主题，AI将围绕它生成一个层级清晰、从中心发散的知识图谱。")

        qa_chain = load_conversational_chain()

        # 初始化用于存储所有图谱的会话状态
        if "d3_constellation" not in st.session_state:
            st.session_state.d3_constellation = None

        # --- 输入与生成表单 ---
        col1, col2 = st.columns([2, 1])
        with col1:
            keyword = st.text_input("请输入新的核心知识点：", placeholder="例如：循环神经网络")
        with col2:
            # 允许用户选择一个已有的图谱作为连接点
            if st.session_state.d3_constellation:
                # 递归函数，用于获取所有节点的名称
                def get_all_node_names(node, names):
                    names.append(node['name'])
                    if 'children' in node:
                        for child in node['children']:
                            get_all_node_names(child, names)
                    return names

                existing_nodes = get_all_node_names(st.session_state.d3_constellation, [])
                connection_point = st.selectbox(
                    "可选：将新图谱连接到已有节点上",
                    options=["（不连接，作为新的中心）"] + existing_nodes
                )
            else:
                connection_point = "（不连接，作为新的中心）"

        if st.button("生成并连接D3知识图谱", use_container_width=True):
            if keyword:
                with st.spinner(f"AI正在围绕“{keyword}”构建知识节点..."):
                    try:
                        # 设计Prompt，让AI生成D3树状图需要的层级JSON
                        prompt = f"""
                            你是一位知识结构化专家。请为主题 “{keyword}” 创建一个符合D3层级布局的JSON对象。
                            JSON对象必须有 "name" 键作为根节点名称，以及一个 "children" 数组存放所有子节点。
                            """
                        response = qa_chain.invoke({"question": prompt, "chat_history": []})
                        result_text = response['answer'].strip()

                        # 使用强化版JSON解析
                        new_graph_data = parse_d3_graph_json(result_text, keyword)

                        if new_graph_data:

                            if connection_point != "（不连接，作为新的中心）":
                                # 递归函数，用于在星座中查找并插入新节点
                                def find_and_insert(node, parent_name, new_child):
                                    if node['name'] == parent_name:
                                        if 'children' not in node:
                                            node['children'] = []
                                        node['children'].append(new_child)
                                        return True
                                    if 'children' in node:
                                        for child in node['children']:
                                            if find_and_insert(child, parent_name, new_child):
                                                return True
                                    return False

                                find_and_insert(st.session_state.d3_constellation, connection_point, new_graph_data)
                            else:
                                # 如果不连接，就将新图谱作为第一个或新的中心
                                st.session_state.d3_constellation = new_graph_data

                            st.success("知识图谱已成功生成/连接！")
                        else:
                            st.warning("AI返回格式异常，使用默认图谱模板")
                            # 使用默认图谱
                            default_graph = create_default_graph(keyword)
                            if connection_point != "（不连接，作为新的中心）":
                                find_and_insert(st.session_state.d3_constellation, connection_point, default_graph)
                            else:
                                st.session_state.d3_constellation = default_graph
                            st.success("已使用默认模板生成知识图谱！")
                    except Exception as e:
                        st.error(f"生成图谱时出错: {e}")
                        # 显示AI原始返回内容用于调试
                        with st.expander("🔍 调试信息", expanded=False):
                            st.code(result_text if 'result_text' in locals() else "无返回内容", language="text")
            else:
                st.warning("请输入关键词！")

        # --- 渲染知识星座图 ---
        if st.session_state.d3_constellation:
            st.markdown("---")
            st.subheader("可交互的D3知识星座图")

            # 添加掌握程度可视化选项（仅对学生显示）
            show_mastery = False
            current_user_role = st.session_state.get("role", "")
            if current_user_role == "学生":
                show_mastery = st.checkbox("显示知识掌握程度", value=False, help="根据您的自我评估显示不同颜色")

            # 准备图谱数据
            graph_data = st.session_state.d3_constellation.copy()

            if show_mastery and current_user_role == "学生":
                # 获取当前用户的知识掌握程度数据
                current_user_id = st.session_state.get("user_id")
                if current_user_id:
                    db = SessionLocal()
                    try:
                        mastery_records = db.query(KnowledgeMastery).filter(
                            KnowledgeMastery.student_id == current_user_id
                        ).all()

                        # 创建掌握程度字典
                        mastery_dict = {record.knowledge_point: record.mastery_level for record in mastery_records}

                        # 为图谱节点添加掌握程度信息
                        add_mastery_info(graph_data, mastery_dict)

                        # 显示图例
                        st.markdown("**图例：** 🔴 薄弱环节 | 🟡 基本掌握 | 🟢 熟练掌握 | ⚪ 未评估")

                    finally:
                        db.close()

            template_path = os.path.join("templates", "d3_graph.html")
            with open(template_path, "r", encoding="utf-8") as f:
                template = Template(f.read())

            graph_json = json.dumps(graph_data)
            unique_id = str(uuid.uuid4())
            html_content = template.render(
                graph_data=graph_json,
                unique_id=unique_id,
                show_mastery=show_mastery
            )

            html(html_content, height=800, scrolling=False)