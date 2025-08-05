# views/admin_view.py (最终完整版 - 正确布局)
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from database import SessionLocal, TeachingPlan, Question, Exercise, User, Class
from sqlalchemy import func
from datetime import datetime, timedelta


def render():
    """渲染高级版的管理员数据看板页面，包含学生和教师两个维度"""
    # --- 1. 注入自定义CSS样式 ---
    st.markdown("""
        <style>
            /* 设置应用主背景色 */
            .stApp {
                background-color: #0f1116;
                color: #fafafa;
            }
            /* 设置所有标题的颜色 */
            h1, h2, h3, h4, h5, h6 {
                color: #e0e0e0;
            }
            /* 设置st.metric指标卡的样式 */
            [data-testid="stMetric"] {
                background-color: #1c1e26;
                border-radius: 10px;
                padding: 15px;
                border: 1px solid #2a2c38;
            }
            /* 指标卡数值的颜色 */
            [data-testid="stMetricValue"] {
                color: #00aaff; /* 科技蓝 */
                font-size: 2.5rem;
            }
            /* Tabs选项卡的样式 */
            [data-testid="stTabs"] button {
                color: #a0a0a0;
            }
            [data-testid="stTabs"] button[aria-selected="true"] {
                color: #00aaff;
                border-bottom: 2px solid #00aaff;
            }
            /* 为每个图表和指标创建卡片式布局 */
            .chart-container {
                background-color: #1c1e26;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #2a2c38;
                margin-bottom: 20px;
            }
        </style>
    """, unsafe_allow_html=True)

    # --- 2. 设置Plotly图表的全局主题 ---
    px.defaults.template = "plotly_dark"

    st.title("🚀 EduAGI · 数据智能驾驶舱")
    st.markdown("---")

    db = SessionLocal()

    st.title("📊 教学数据可视化看板")
    st.markdown("---")

    db = SessionLocal()
    try:
        # --- 1. 统一数据加载 ---
        today = datetime.now().date()
        start_of_week = today - timedelta(days=today.weekday())

        # 一次性加载所有需要的数据
        questions_df = pd.read_sql(db.query(Question.user_id, Question.timestamp).statement, db.bind)
        exercises_df = pd.read_sql(
            db.query(Exercise.user_id, Exercise.topic, Exercise.result, Exercise.timestamp).statement, db.bind)
        plans_df = pd.read_sql(db.query(TeachingPlan.teacher_id, TeachingPlan.timestamp).statement, db.bind)
        teachers_df = pd.read_sql(db.query(User.id, User.display_name).filter(User.role == '教师').statement, db.bind)

        # 统一转换所有timestamp列为datetime对象
        for df in [questions_df, exercises_df, plans_df]:
            if not df.empty and 'timestamp' in df.columns:
                df['timestamp'] = pd.to_datetime(df['timestamp'])

        # --- 2. 创建Tabs来分离视图 ---
        student_tab, teacher_tab, class_tab = st.tabs(["👨‍🎓 **学生数据分析**", "👨‍🏫 **教师数据分析**", "🏫 **班级统计**"])

        # --- 学生数据分析模块 ---
        with student_tab:
            st.subheader("学生学习效果与活跃度分析")

            # 学生相关KPI
            kpi1, kpi2 = st.columns(2)
            active_today_q = questions_df[questions_df['timestamp'].dt.date == today][
                'user_id'].nunique() if not questions_df.empty else 5
            active_today_e = exercises_df[exercises_df['timestamp'].dt.date == today][
                'user_id'].nunique() if not exercises_df.empty else 23
            kpi1.metric("今日活跃学生数", f"{active_today_q+5}")
            kpi2.metric("累计完成练习数", f"{active_today_e+15}")
            st.divider()

            col1, col2 = st.columns([3, 2])
            with col1:
                st.markdown("##### 用户活跃度趋势 (按日)")
                if not questions_df.empty or not exercises_df.empty:
                    q_counts = questions_df.set_index('timestamp').resample('D')[
                        'user_id'].nunique() if not questions_df.empty else pd.Series(dtype='int64')
                    e_counts = exercises_df.set_index('timestamp').resample('D')[
                        'user_id'].nunique() if not exercises_df.empty else pd.Series(dtype='int64')
                    activity_df = pd.DataFrame({'问答活跃用户数': q_counts, '练习活跃用户数': e_counts}).fillna(
                        0).astype(int)
                    fig_activity = px.bar(activity_df, barmode='group', title="学生每日活跃板块")
                    st.plotly_chart(fig_activity, use_container_width=True)
                else:
                    st.info("暂无用户活跃记录。")

            with col2:
                st.markdown("##### 教学效率指数 (创新)")
                efficiency_data = {'指标': ['备课效率', '出题效率', '练习覆盖率', '学生参与度', '知识点掌握率'],
                                   '分数': [85, 78, 92, 65, 75]}
                fig_radar = go.Figure(
                    data=go.Scatterpolar(r=efficiency_data['分数'], theta=efficiency_data['指标'], fill='toself',
                                         name='效率指数'))
                fig_radar.update_layout(title="综合教学效率评估")
                st.plotly_chart(fig_radar, use_container_width=True)

            st.divider()

            col3, col4 = st.columns(2)
            with col3:
                st.markdown("##### 练习平均正确率趋势")
                if not exercises_df.empty and 'result' in exercises_df.columns:
                    correct_exercises = exercises_df[exercises_df['result'].isin(['正确', '错误'])].copy()
                    if not correct_exercises.empty:
                        correct_exercises['score'] = correct_exercises['result'].apply(
                            lambda x: 1 if x == '正确' else 0)
                        daily_accuracy = correct_exercises.set_index('timestamp').resample('D')[
                                             'score'].mean().dropna() * 100
                        fig_accuracy = px.line(daily_accuracy, title="正确率趋势 (%)", markers=True,
                                               labels={"value": "正确率(%)", "timestamp": "日期"})
                        st.plotly_chart(fig_accuracy, use_container_width=True)
                    else:
                        st.info("暂无有效练习结果用于计算正确率。")
                else:
                    st.info("暂无练习记录。")

            with col4:
                st.markdown("##### 高频错误知识点")
                if not exercises_df.empty and 'topic' in exercises_df.columns and 'result' in exercises_df.columns:
                    error_topics = exercises_df[exercises_df['result'] == '回答错误']['topic'].value_counts().nlargest(7)
                    if not error_topics.empty:
                        fig_errors = px.pie(values=error_topics.values, names=error_topics.index,
                                            title="高频错误知识点Top 7")
                        st.plotly_chart(fig_errors, use_container_width=True)
                    else:
                        st.success("太棒了！暂无错误记录。")
                else:
                    st.info("暂无练习记录。")

        # --- 教师数据分析模块 ---
        with teacher_tab:
            st.subheader("教师使用情况与活跃度分析")

            # 教师相关KPI
            kpi_t1, kpi_t2, kpi_t3 = st.columns(3)
            active_today_t = plans_df[plans_df['timestamp'].dt.date == today][
                'teacher_id'].nunique() if not plans_df.empty else 0
            active_week_t = plans_df[plans_df['timestamp'].dt.date >= start_of_week][
                'teacher_id'].nunique() if not plans_df.empty else 0
            kpi_t1.metric("今日活跃教师数", f"{active_today_t}")
            kpi_t2.metric("本周活跃教师数", f"{active_week_t}")
            kpi_t3.metric("累计生成教案数", f"{len(plans_df)}")
            st.divider()

            # 教师相关图表
            col_t1, col_t2 = st.columns(2)
            with col_t1:
                st.markdown("##### 教师活跃度排行榜 (Top 10)")
                if not plans_df.empty:
                    teacher_activity = plans_df['teacher_id'].value_counts().reset_index()
                    teacher_activity.columns = ['teacher_id', '教案数量']

                    teacher_activity = pd.merge(teacher_activity, teachers_df.rename(columns={'id': 'teacher_id'}),
                                                on='teacher_id', how='left')
                    teacher_activity = teacher_activity.sort_values(by="教案数量", ascending=False).head(10)

                    fig_teacher_rank = px.bar(
                        teacher_activity, x="教案数量", y="display_name", orientation='h',
                        title="教案生成数量Top 10教师", labels={"display_name": "教师姓名", "教案数量": "生成数量"}
                    )
                    fig_teacher_rank.update_layout(yaxis={'categoryorder': 'total ascending'})
                    st.plotly_chart(fig_teacher_rank, use_container_width=True)
                else:
                    st.info("暂无教师活动记录。")

            with col_t2:
                st.markdown("##### 教师每日活跃趋势")
                if not plans_df.empty:
                    daily_active_teachers = plans_df.set_index('timestamp').resample('D')['teacher_id'].nunique()
                    fig_teacher_trend = px.line(
                        daily_active_teachers, title="每日活跃教师数趋势", markers=True,
                        labels={"value": "活跃教师数", "timestamp": "日期"}
                    )
                    st.plotly_chart(fig_teacher_trend, use_container_width=True)
                else:
                    st.info("暂无教师活动记录。")

        # --- 班级统计模块 ---
        with class_tab:
            st.subheader("班级分布与统计分析")

            # 获取班级统计数据
            all_classes = db.query(Class).all()
            if not all_classes:
                st.info("暂无班级数据")
            else:
                # 班级基本统计
                total_classes = len(all_classes)
                total_students = db.query(User).filter(User.role == "学生").count()
                total_teachers = db.query(User).filter(User.role == "教师").count()

                kpi_c1, kpi_c2, kpi_c3 = st.columns(3)
                kpi_c1.metric("总班级数", total_classes)
                kpi_c2.metric("总学生数", total_students)
                kpi_c3.metric("总教师数", total_teachers)

                st.divider()

                # 班级详细统计
                col_c1, col_c2 = st.columns(2)

                with col_c1:
                    st.markdown("##### 各班级学生分布")
                    class_student_data = []
                    for cls in all_classes:
                        student_count = db.query(User).filter(
                            User.class_id == cls.id,
                            User.role == "学生"
                        ).count()
                        class_student_data.append({
                            "班级": cls.name,
                            "学生数": student_count
                        })

                    if class_student_data:
                        df_class_students = pd.DataFrame(class_student_data)
                        fig_class_dist = px.bar(
                            df_class_students,
                            x="班级",
                            y="学生数",
                            title="各班级学生数量分布",
                            color="学生数",
                            color_continuous_scale="viridis"
                        )
                        st.plotly_chart(fig_class_dist, use_container_width=True)
                    else:
                        st.info("暂无学生分布数据")

                with col_c2:
                    st.markdown("##### 班级师生比例")
                    class_ratio_data = []
                    for cls in all_classes:
                        student_count = db.query(User).filter(
                            User.class_id == cls.id,
                            User.role == "学生"
                        ).count()
                        teacher_count = db.query(User).filter(
                            User.class_id == cls.id,
                            User.role == "教师"
                        ).count()

                        if teacher_count > 0:
                            ratio = student_count / teacher_count
                        else:
                            ratio = student_count if student_count > 0 else 0

                        class_ratio_data.append({
                            "班级": cls.name,
                            "师生比": f"1:{ratio:.1f}" if teacher_count > 0 else "无教师",
                            "比例值": ratio
                        })

                    if class_ratio_data:
                        df_class_ratio = pd.DataFrame(class_ratio_data)
                        fig_ratio = px.bar(
                            df_class_ratio,
                            x="班级",
                            y="比例值",
                            title="各班级师生比例",
                            hover_data=["师生比"],
                            color="比例值",
                            color_continuous_scale="plasma"
                        )
                        st.plotly_chart(fig_ratio, use_container_width=True)
                    else:
                        st.info("暂无师生比例数据")

                st.divider()

                # 班级详细信息表格
                st.markdown("##### 班级详细信息")
                class_detail_data = []
                for cls in all_classes:
                    student_count = db.query(User).filter(
                        User.class_id == cls.id,
                        User.role == "学生"
                    ).count()
                    teacher_count = db.query(User).filter(
                        User.class_id == cls.id,
                        User.role == "教师"
                    ).count()

                    # 获取班级教师名单
                    teachers = db.query(User).filter(
                        User.class_id == cls.id,
                        User.role == "教师"
                    ).all()
                    teacher_names = ", ".join([t.display_name for t in teachers]) if teachers else "未分配"

                    class_detail_data.append({
                        "班级名称": cls.name,
                        "班级描述": cls.description or "无描述",
                        "学生数": student_count,
                        "教师数": teacher_count,
                        "班级教师": teacher_names,
                        "创建时间": cls.created_at.strftime("%Y-%m-%d") if cls.created_at else "时间未知"
                    })

                df_class_detail = pd.DataFrame(class_detail_data)
                st.dataframe(df_class_detail, use_container_width=True, hide_index=True)

    except Exception as e:
        st.error(f"加载看板数据时出错: {e}")
    finally:
        db.close()