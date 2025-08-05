# views/exam_view.py (已修正函数调用逻辑)
import streamlit as st
import json
import re
import pandas as pd
import plotly.graph_objects as go
from datetime import datetime
from utils import load_conversational_chain
from database import SessionLocal, Exam, ExamQuestion, Submission, SubmissionAnswer,StudentDispute, User
from grade import grade_exam


def render():
    """渲染包含正确批改逻辑的学生在线考试页面"""
    qa_chain = load_conversational_chain()
    st.title("✍️ 我的考试与成绩分析")

    tab_new_exam, tab_history = st.tabs(["**开始新考试**", "**历史成绩与分析**"])

    db = SessionLocal()
    try:
        # --- Tab 1: 开始新考试 ---
        with tab_new_exam:
            st.info("请从下面的列表中选择一场考试开始作答。")
            available_exams = db.query(Exam.id, Exam.scope).order_by(Exam.timestamp.desc()).all()

            if not available_exams:
                st.warning("目前没有已发布的试卷。")
            else:
                exam_options = {f"ID: {e.id} - {e.scope}": e.id for e in available_exams}
                selected_exam_label = st.selectbox("请选择要参加的考试：", list(exam_options.keys()))

                if st.button("开始考试", key="start_exam"):
                    st.session_state.selected_exam_id = exam_options[selected_exam_label]
                    st.session_state.exam_questions = None
                    st.session_state.exam_results = None
                    st.rerun()

                if "selected_exam_id" in st.session_state and st.session_state.selected_exam_id:
                    exam_id = st.session_state.selected_exam_id

                    if "exam_questions" not in st.session_state or st.session_state.exam_questions is None:
                        questions_from_db = db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam_id).all()
                        st.session_state.exam_questions = [
                            {"id": q.id, "type": q.question_type, "question_text": q.question_text,
                             "options": json.loads(q.options) if q.question_type == 'multiple_choice' else [],
                             "answer": q.answer, "score": q.score}
                            for q in questions_from_db
                        ]

                    questions = st.session_state.get('exam_questions', [])
                    if not questions:
                        st.error("此试卷没有题目，请联系管理员。")
                    else:
                        st.markdown(f"--- \n#### 正在作答 - 试卷ID: {exam_id}")
                        with st.form("exam_answer_form"):
                            user_answers = []
                            for i, q in enumerate(questions):
                                st.markdown(f"**第 {i + 1} 题 ({q['type']}) - [{q['score']}分]**")
                                st.markdown(q["question_text"])
                                answer = st.radio("请选择你的答案：", q["options"], key=f"q_{q['id']}") if q[
                                                                                                              "type"] == "multiple_choice" else st.text_area(
                                    "请在此作答：", key=f"q_{q['id']}", height=150)
                                user_answers.append({"question_id": q['id'], "student_answer": answer})
                            submit_exam = st.form_submit_button("提交试卷并等待AI批改")

                        if submit_exam:
                            with st.spinner("系统正在进行智能批改，请稍候..."):
                                try:
                                    # --- 核心修复：在循环外一次性调用批改函数，并传入所有参数 ---
                                    results = grade_exam(questions, user_answers, qa_chain)

                                    # --- 结果存档到数据库 ---
                                    student_id = st.session_state.get("user_id")
                                    total_score = sum(res.get("score", 0) for res in results)
                                    new_submission = Submission(student_id=student_id, exam_id=exam_id,
                                                                total_score=total_score)
                                    db.add(new_submission)
                                    db.flush()

                                    for i, res in enumerate(results):
                                        db.add(SubmissionAnswer(
                                            submission_id=new_submission.id,
                                            question_id=res['question_id'],
                                            student_answer=user_answers[i]['student_answer'],
                                            score=res['score'],
                                            feedback=res['feedback']
                                        ))
                                    db.commit()

                                    st.session_state.exam_results = results
                                    st.success("试卷批改完成！结果已存档。")
                                    st.rerun()

                                except Exception as e:
                                    db.rollback()
                                    st.error(f"批改过程中发生错误: {e}")

                # --- 显示批改结果 ---
                if "exam_results" in st.session_state and st.session_state.exam_results:
                    results_to_display = st.session_state.exam_results
                    total_score_display = sum(res.get("score", 0) for res in results_to_display)
                    max_score_display = sum(q.get("score", 0) for q in st.session_state.exam_questions)

                    st.balloons()
                    st.header(f"🎉 恭喜你，本次考试总得分: {total_score_display} / {max_score_display}")
                    st.markdown("---")

                    for res in results_to_display:
                        with st.container(border=True):
                            question_info = next(
                                (q for q in st.session_state.exam_questions if q['id'] == res['question_id']), {})
                            st.markdown(
                                f"**题目ID: {res['question_id']} | 得分: {res['score']}/{question_info.get('score', 5)}**")
                            st.info(f"**智能导师评语:** {res['feedback']}")

                            # 操作按钮
                            col_dispute, col_note = st.columns(2)

                            with col_dispute:
                                if res.get("allow_dispute", False):
                                    if st.button(f"❓ 提出疑问", key=f"dispute_{res['question_id']}", use_container_width=True):
                                        # --- 核心修改：将疑问存入数据库 ---
                                        db = SessionLocal()
                                        try:
                                            # 获取学生的班级ID
                                            student_id = st.session_state.get("user_id")
                                            student = db.query(User).filter(User.id == student_id).first()

                                            if student and student.class_id:
                                                new_dispute = StudentDispute(
                                                    student_id=student_id,
                                                    question_id=res['question_id'],
                                                    class_id=student.class_id,
                                                    message="学生对本题的AI批改结果有疑问。"
                                                )
                                                db.add(new_dispute)
                                                db.commit()
                                                st.success("📨 已将您的疑问成功提交给教师，请耐心等待反馈！")
                                            else:
                                                st.error("无法获取您的班级信息，请联系管理员。")
                                        except Exception as e:
                                            st.error(f"提交疑问时出错: {e}")
                                            db.rollback()
                                        finally:
                                            db.close()

                            with col_note:
                                # 如果是错题（得分低于满分），显示导入笔记按钮
                                if res['score'] < question_info.get('score', 5):
                                    if st.button(f"📝 导入错题笔记", key=f"import_wrong_{res['question_id']}", use_container_width=True):
                                        import_wrong_question_to_note(res, question_info)

        # --- Tab 2: 历史成绩与分析 ---
        with tab_history:
            st.subheader("历史考试记录与成绩分析")
            current_user_id = st.session_state.get("user_id")
            submissions = db.query(Submission).filter(Submission.student_id == current_user_id).order_by(
                Submission.timestamp.desc()).all()

            if not submissions:
                st.info("您还没有完成过任何考试。")
            else:
                st.markdown("##### 历次考试成绩单")
                history_data = {"考试提交ID": [s.id for s in submissions], "考试ID": [s.exam_id for s in submissions],
                                "提交时间": [s.timestamp.strftime('%Y-%m-%d %H:%M') if s.timestamp else "时间未知" for s in submissions],
                                "总分": [s.total_score for s in submissions]}
                st.dataframe(pd.DataFrame(history_data), use_container_width=True, hide_index=True)

                st.divider()
                st.markdown("##### 成绩趋势分析")
                if len(submissions) > 1:
                    df_scores = pd.DataFrame({"考试时间": [s.timestamp for s in submissions],
                                              "得分": [s.total_score for s in submissions]}).sort_values(by="考试时间")
                    fig = go.Figure()
                    fig.add_trace(go.Bar(x=df_scores["考试时间"], y=df_scores["得分"], name="当次得分"))
                    fig.add_trace(
                        go.Scatter(x=df_scores["考试时间"], y=df_scores["得分"].rolling(window=2, min_periods=1).mean(),
                                   name="成绩趋势", mode='lines+markers'))
                    fig.update_layout(title="历次考试成绩及趋势分析", xaxis_title="考试时间", yaxis_title="得分")
                    st.plotly_chart(fig, use_container_width=True)
                else:
                    st.info("完成至少两次考试后，这里将展示您的成绩趋势分析。")
    finally:
        db.close()


def import_wrong_question_to_note(result, question_info):
    """将错题导入到笔记"""
    from database import Note
    import json
    from datetime import datetime

    # 生成笔记标题
    title = f"错题记录 - 题目ID {result['question_id']}"

    # 获取学生答案
    student_answer = "未作答"
    if "exam_answers" in st.session_state:
        for q_id, answer in st.session_state.exam_answers.items():
            if str(q_id) == str(result['question_id']):
                student_answer = answer
                break

    # 格式化笔记内容
    formatted_content = f"""# {title}

## 📝 题目内容
{question_info.get('question_text', '题目内容未找到')}

## ❌ 我的答案
{student_answer}

## ✅ 正确答案
{question_info.get('answer', '正确答案未找到')}

## 📚 题目解析
{question_info.get('explanation', '暂无解析')}

## 🤖 AI评语
{result.get('feedback', '暂无评语')}

## 💡 错误分析
*分析错误原因：*
- [ ] 概念理解错误
- [ ] 计算错误
- [ ] 审题不仔细
- [ ] 知识点遗忘
- [ ] 其他: ___________

## 🎯 知识点总结
*相关知识点：*
-
-
-

## 📈 改进计划
*如何避免类似错误：*
1.
2.
3.

## 🔄 复习提醒
- [ ] 一周后复习
- [ ] 一个月后复习
- [ ] 考前重点复习

---
📅 导入时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
📍 来源: 考试错题
📊 得分: {result['score']}/{question_info.get('score', 5)}
"""

    db = SessionLocal()
    try:
        new_note = Note(
            student_id=st.session_state.get("user_id"),
            title=title,
            content=formatted_content,
            category="错题笔记",
            source_type="wrong_question",
            source_id=result['question_id'],
            tags=json.dumps(["错题", "考试", "复习"])
        )

        db.add(new_note)
        db.commit()

        st.success("📝 错题已成功导入到我的笔记！")
        st.info("💡 您可以在我的笔记页面查看和完善这条错题笔记")

    except Exception as e:
        st.error(f"导入错题笔记失败: {e}")
    finally:
        db.close()