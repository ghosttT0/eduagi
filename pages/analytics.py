import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from database import SessionLocal, Exercise, Question, User, StudentDispute, ExamQuestion


def render():
    """渲染包含疑问处理的学情数据分析页面"""
    st.title("👨‍🏫 学情数据分析中心")
    
    # 添加自动刷新控制
    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        st.markdown("实时监控学生学习数据，助力精准教学")
    with col2:
        auto_refresh = st.checkbox("🔄 自动刷新", value=False, help="每30秒自动刷新数据")
    with col3:
        if st.button("🔄 手动刷新", help="立即刷新所有数据"):
            st.rerun()
    
    # 自动刷新逻辑
    if auto_refresh:
        import time
        time.sleep(30)
        st.rerun()
    
    st.markdown("---")

    # --- 使用Tabs来组织不同的分析模块 ---
    tab_exercise, tab_question, tab_dispute = st.tabs(
        ["**📊 学生练习分析**", "**❓ 学生提问分析**", "**📨 学生疑问处理**"]
    )

    db = SessionLocal()
    try:
        # --- Tab 1: 学生练习情况分析 (增强版) ---
        with tab_exercise:
            st.subheader("📊 学生练习情况分析")
            exercises = db.query(Exercise).all()
            if not exercises:
                st.info("暂无学生练习记录。")
            else:
                # 安全处理时间数据，防止None值
                exercise_data = []
                for e in exercises:
                    timestamp = e.timestamp if e.timestamp else "时间未知"
                    exercise_data.append((e.topic, e.result, timestamp))
                
                df_exercises = pd.DataFrame(
                    exercise_data,
                    columns=["知识点", "结果", "时间"]
                )

                # 添加统计概览
                col1, col2, col3, col4 = st.columns(4)
                total_exercises = len(df_exercises)
                correct_count = len(df_exercises[df_exercises["结果"] == "正确"])
                error_count = len(df_exercises[df_exercises["结果"] == "错误"])
                accuracy_rate = (correct_count / total_exercises * 100) if total_exercises > 0 else 0
                
                with col1:
                    st.metric("总练习数", total_exercises)
                with col2:
                    st.metric("正确数", correct_count, delta=f"{accuracy_rate:.1f}%")
                with col3:
                    st.metric("错误数", error_count)
                with col4:
                    st.metric("正确率", f"{accuracy_rate:.1f}%")

                st.markdown("#### 📈 各知识点错误分析")
                error_df = df_exercises[df_exercises["结果"] == "错误"]
                if not error_df.empty:
                    error_counts = error_df["知识点"].value_counts().reset_index()
                    error_counts.columns = ["知识点", "错误次数"]
                    fig_bar = px.bar(
                        error_counts, x="知识点", y="错误次数", 
                        title="各知识点错误次数分布",
                        labels={"知识点": "知识点/章节", "错误次数": "累计错误次数"},
                        color="错误次数",
                        color_continuous_scale="Reds"
                    )
                    fig_bar.update_layout(showlegend=False)
                    st.plotly_chart(fig_bar, use_container_width=True, key="error_chart")
                    
                    # 添加正确率分析
                    st.markdown("#### 📊 各知识点正确率分析")
                    topic_stats = df_exercises.groupby('知识点')['结果'].agg(['count', lambda x: (x == '正确').sum()]).reset_index()
                    topic_stats.columns = ['知识点', '总数', '正确数']
                    topic_stats['正确率'] = (topic_stats['正确数'] / topic_stats['总数'] * 100).round(1)
                    
                    fig_accuracy = px.bar(
                        topic_stats, x="知识点", y="正确率",
                        title="各知识点正确率 (%)",
                        labels={"知识点": "知识点", "正确率": "正确率 (%)"},
                        color="正确率",
                        color_continuous_scale="RdYlGn",
                        range_color=[0, 100]
                    )
                    st.plotly_chart(fig_accuracy, use_container_width=True, key="accuracy_chart")
                else:
                    st.success("🎉 太棒了！目前没有发现任何错误记录。")

        # --- Tab 2: 学生提问情况分析 (增强版) ---
        with tab_question:
            st.subheader("❓ 学生提问情况分析")
            questions = db.query(Question).all()
            if not questions:
                st.info("暂无学生提问记录。")
            else:
                # 安全处理问题数据的时间字段
                question_data = []
                for q in questions:
                    timestamp = q.timestamp if q.timestamp else "时间未知"
                    question_data.append((q.content, timestamp))

                df_questions = pd.DataFrame(question_data, columns=["提问内容", "时间"])

                # 提问统计概览
                col1, col2 = st.columns(2)
                with col1:
                    st.metric("总提问数", len(df_questions))
                with col2:
                    unique_topics = df_questions["提问内容"].nunique()
                    st.metric("涉及话题数", unique_topics)

                st.markdown("#### 🎯 高频提问知识点分布")
                question_topics = df_questions["提问内容"].value_counts().reset_index()
                question_topics.columns = ["知识点", "提问次数"]

                if not question_topics.empty and len(question_topics) > 0:
                    # 限制显示前10个最热门的话题
                    top_topics = question_topics.head(10)
                    
                    # 雷达图
                    fig_radar = go.Figure(
                        data=go.Scatterpolar(
                            r=top_topics["提问次数"], 
                            theta=top_topics["知识点"],
                            fill='toself', 
                            name='提问次数',
                            line_color='rgb(32, 201, 151)'
                        )
                    )
                    fig_radar.update_layout(
                        title="高频提问知识点雷达图",
                        polar=dict(
                            radialaxis=dict(
                                visible=True,
                                range=[0, max(top_topics["提问次数"])]
                            )
                        )
                    )
                    st.plotly_chart(fig_radar, use_container_width=True, key="question_radar")
                    
                    # 柱状图
                    fig_bar_q = px.bar(
                        top_topics, x="提问次数", y="知识点",
                        title="热门提问话题排行",
                        labels={"提问次数": "提问次数", "知识点": "知识点"},
                        color="提问次数",
                        color_continuous_scale="Blues",
                        orientation='h'
                    )
                    fig_bar_q.update_layout(yaxis={'categoryorder':'total ascending'})
                    st.plotly_chart(fig_bar_q, use_container_width=True, key="question_bar")
                else:
                    st.info("暂无提问数据可供分析。")

        # --- Tab 3: 学生疑问处理 (增强版) ---
        with tab_dispute:
            st.subheader("📨 学生疑问处理中心")
            
            # 统计信息
            total_disputes = db.query(StudentDispute).count()
            resolved_disputes = db.query(StudentDispute).filter(StudentDispute.status == "已处理").count()
            pending_count = db.query(StudentDispute).filter(StudentDispute.status == "待处理").count()
            
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("待处理疑问", pending_count)
            with col2:
                st.metric("已处理疑问", resolved_disputes)
            with col3:
                resolution_rate = (resolved_disputes / total_disputes * 100) if total_disputes > 0 else 0
                st.metric("处理率", f"{resolution_rate:.1f}%")

            # 从数据库查询所有状态为"待处理"的疑问，并关联学生和题目信息
            pending_disputes = db.query(
                StudentDispute.id,
                StudentDispute.timestamp,
                StudentDispute.message,
                User.display_name,
                ExamQuestion.question_text
            ).join(User, User.id == StudentDispute.student_id) \
                .join(ExamQuestion, ExamQuestion.id == StudentDispute.question_id) \
                .filter(StudentDispute.status == "待处理").all()

            if not pending_disputes:
                st.success("🎉 非常棒！当前没有待处理的学生疑问。")
                st.info("💡 学生可以在考试结果页面对题目批改结果提出疑问，疑问会在这里显示。")
            else:
                st.warning(f"⚠️ 您有 {len(pending_disputes)} 条新的学生疑问待处理。")
                
                for dispute in pending_disputes:
                    with st.container(border=True):
                        col1, col2 = st.columns([3, 1])
                        with col1:
                            st.markdown(f"**👨‍🎓 学生:** {dispute.display_name}")
                            st.markdown(f"**📝 题目:** {dispute.question_text[:80]}...")
                            if hasattr(dispute, 'message') and dispute.message:
                                st.markdown(f"**💬 疑问:** {dispute.message}")
                            # 安全处理时间格式化，防止None值错误
                            if dispute.timestamp:
                                time_str = dispute.timestamp.strftime('%Y-%m-%d %H:%M')
                            else:
                                time_str = "时间未知"
                            st.caption(f"⏰ 提交时间: {time_str}")
                        with col2:
                            if st.button("✅ 标记已处理", key=f"dispute_resolve_{dispute.id}", use_container_width=True):
                                # 更新数据库中的状态
                                dispute_to_update = db.query(StudentDispute).filter(
                                    StudentDispute.id == dispute.id).first()
                                if dispute_to_update:
                                    dispute_to_update.status = "已处理"
                                    from datetime import datetime
                                    dispute_to_update.reply_timestamp = datetime.now()
                                    db.commit()
                                    st.success(f"✅ 疑问 ID:{dispute.id} 已成功标记为已处理。")
                                    st.rerun()

    except Exception as e:
        st.error(f"加载学情数据时出错: {e}")
    finally:
        db.close()
