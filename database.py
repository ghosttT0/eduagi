import os
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Class(Base):
    """班级模型"""
    __tablename__ = 'classes'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)  # 班级名称，如"计算机科学1班"
    description = Column(Text)  # 班级描述
    created_at = Column(DateTime, default=datetime.now)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    # --- 核心修改 ---
    account_id = Column(String, unique=True, nullable=False) # 用于登录的唯一账号 (如学号/工号)
    display_name = Column(String, nullable=False)           # 用于显示的名称 (如姓名)
    # --- 修改结束 ---
    role = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    # 班级关联
    class_id = Column(Integer, ForeignKey('classes.id'), nullable=True)  # 学生和教师都可以关联班级

class TeachingPlan(Base):
    __tablename__ = 'teaching_plans'
    id = Column(Integer, primary_key=True, autoincrement=True)
    teacher_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    input_prompt = Column(Text, nullable=False)
    output_content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.now)

class Question(Base):
    __tablename__ = 'questions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    content = Column(Text)
    answer = Column(Text)
    timestamp = Column(DateTime, default=datetime.now)

class Exercise(Base):
    __tablename__ = 'exercises'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    topic = Column(String)
    generated_question = Column(Text)
    student_answer = Column(Text)
    result = Column(Text) # Should store '正确' or '错误'
    timestamp = Column(DateTime, default=datetime.now)
class Exam(Base):
    __tablename__ = 'exams'
    id = Column(Integer, primary_key=True, autoincrement=True)
    teacher_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    scope = Column(Text, nullable=False) # 试卷的考察范围
    timestamp = Column(DateTime, default=datetime.now)

class ExamQuestion(Base):
    __tablename__ = 'exam_questions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    exam_id = Column(Integer, ForeignKey('exams.id'), nullable=False)
    question_type = Column(String) # "multiple_choice", "short_answer", "coding"
    question_text = Column(Text)
    options = Column(Text) # JSON string of options for multiple choice
    answer = Column(Text)
    explanation = Column(Text)
    score = Column(Integer, default=5)

class Submission(Base):
    """存储一次完整的考试提交记录"""
    __tablename__ = 'submissions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    exam_id = Column(Integer, ForeignKey('exams.id'), nullable=False)
    total_score = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.now)

class SubmissionAnswer(Base):
    """存储每一次考试中，学生对具体某道题的答案和得分"""
    __tablename__ = 'submission_answers'
    id = Column(Integer, primary_key=True, autoincrement=True)
    submission_id = Column(Integer, ForeignKey('submissions.id'), nullable=False)
    question_id = Column(Integer, ForeignKey('exam_questions.id'), nullable=False)
    student_answer = Column(Text)
    score = Column(Integer)
    feedback = Column(Text)

class ChatHistory(Base):
    """存储学生与AI的对话历史"""
    __tablename__ = 'chat_history'
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    message = Column(Text, nullable=False) # 存储用户或AI说的话
    is_user = Column(Boolean, default=True) # 标记是用户消息还是AI消息
    timestamp = Column(DateTime, default=datetime.now)

class KnowledgePoint(Base):
    """存储被学生查询过的知识点，用于生成词云"""
    __tablename__ = 'knowledge_points'
    id = Column(Integer, primary_key=True, autoincrement=True)
    topic = Column(String, nullable=False)
    query_count = Column(Integer, default=1) # 查询次数
    last_queried = Column(DateTime, default=datetime.now)

class StudentDispute(Base):
    """存储学生对题目批改的疑问"""
    __tablename__ = 'student_disputes'
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    question_id = Column(Integer, ForeignKey('exam_questions.id'), nullable=True)  # 可以为空，支持一般性疑问
    class_id = Column(Integer, ForeignKey('classes.id'), nullable=False)  # 班级关联，确保疑问发给正确的班级
    message = Column(Text) # 学生可以附上疑问信息
    status = Column(String, default="待处理") # 状态：待处理、已回复
    teacher_reply = Column(Text)  # 教师回复内容
    timestamp = Column(DateTime, default=datetime.now)
    reply_timestamp = Column(DateTime)  # 回复时间

class MindMap(Base):
    """存储用户保存的思维导图"""
    __tablename__ = 'mindmaps'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String, nullable=False)  # 思维导图标题
    topic = Column(String, nullable=False)  # 原始主题
    data = Column(Text, nullable=False)  # JSON格式的思维导图数据
    description = Column(Text)  # 描述
    is_public = Column(Boolean, default=False)  # 是否公开
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class KnowledgeMastery(Base):
    """存储学生对知识点的掌握程度"""
    __tablename__ = 'knowledge_mastery'
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    knowledge_point = Column(String, nullable=False)  # 知识点名称
    mastery_level = Column(Integer, nullable=False)  # 掌握程度：1=薄弱，2=基本掌握，3=熟练掌握
    self_assessment = Column(Text)  # 学生自我评估说明
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class VideoResource(Base):
    __tablename__ = 'video_resources'
    id = Column(Integer, primary_key=True, autoincrement=True)
    teacher_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
        # The path can be an external URL or a local file path
    path = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.now)
    status = Column(String, default="草稿")

    # 添加唯一约束，确保每个学生对每个知识点只有一条记录
    __table_args__ = (
        # 创建复合唯一索引
        # UniqueConstraint('student_id', 'knowledge_point', name='unique_student_knowledge'),
    )

class Note(Base):
    """学生笔记模型"""
    __tablename__ = 'notes'
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String, nullable=False)  # 笔记标题
    content = Column(Text, nullable=False)  # 笔记内容（支持Markdown格式）
    category = Column(String, default="自主笔记")  # 笔记分类：自主笔记、知识导入、错题笔记
    source_type = Column(String)  # 来源类型：manual、knowledge、wrong_question、chat_history
    source_id = Column(Integer)  # 来源ID（如题目ID、聊天记录ID等）
    tags = Column(Text)  # 标签，JSON格式存储
    is_favorite = Column(Boolean, default=False)  # 是否收藏
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class NoteTemplate(Base):
    """笔记模板"""
    __tablename__ = 'note_templates'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)  # 模板名称
    description = Column(Text)  # 模板描述
    template_content = Column(Text, nullable=False)  # 模板内容
    category = Column(String, nullable=False)  # 模板分类
    is_system = Column(Boolean, default=True)  # 是否为系统模板
    created_at = Column(DateTime, default=datetime.now)

# --- 数据库连接与会话管理 ---
DB_URL = "sqlite:///data/teaching.db"
# `check_same_thread` is necessary for Streamlit with SQLite
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initializes the database and creates all tables if they don't exist."""
    # Ensure the 'data' directory exists
    if not os.path.exists('data'):
        os.makedirs('data')
    Base.metadata.create_all(bind=engine)
    print("Database and tables created/verified successfully.")

def get_db():
    """Generator function to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# This allows the script to be run directly to initialize the database
if __name__ == '__main__':
    init_db()