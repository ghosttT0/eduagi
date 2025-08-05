from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# 数据库配置
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/teaching.db")

# 创建数据库引擎
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基础模型类
Base = declarative_base()

# 用户模型
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String(50), unique=True, index=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False)  # 管理员、教师、学生
    hashed_password = Column(String(255), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关系
    class_rel = relationship("Class", back_populates="users")
    resources = relationship("Resource", back_populates="uploader")
    exams = relationship("Exam", back_populates="creator")
    notes = relationship("Note", back_populates="author")

# 班级模型
class Class(Base):
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关系
    users = relationship("User", back_populates="class_rel")
    resources = relationship("Resource", back_populates="class_rel")
    exams = relationship("Exam", back_populates="class_rel")

# 资源模型
class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)
    upload_time = Column(DateTime, default=func.now())
    download_count = Column(Integer, default=0)
    is_public = Column(Boolean, default=True)
    
    # 关系
    uploader = relationship("User", back_populates="resources")
    class_rel = relationship("Class", back_populates="resources")

# 考试模型
class Exam(Base):
    __tablename__ = "exams"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True)  # 考试时长（分钟）
    total_score = Column(Float, default=100.0)
    created_at = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
    
    # 关系
    creator = relationship("User", back_populates="exams")
    class_rel = relationship("Class", back_populates="exams")

# 笔记模型
class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    is_public = Column(Boolean, default=False)
    tags = Column(String(500), nullable=True)  # 标签，用逗号分隔
    
    # 关系
    author = relationship("User", back_populates="notes")

# 视频分析记录模型
class VideoAnalysis(Base):
    __tablename__ = "video_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    video_url = Column(String(500), nullable=False)
    analysis_result = Column(Text, nullable=False)
    analyzed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    analyzed_at = Column(DateTime, default=func.now())
    status = Column(String(20), default="completed")  # completed, failed, processing
    
    # 关系
    user = relationship("User")

# 系统配置模型
class SystemConfig(Base):
    __tablename__ = "system_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

def init_db():
    """初始化数据库"""
    # 确保数据目录存在
    os.makedirs("data", exist_ok=True)
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    
    # 创建默认用户和班级
    db = SessionLocal()
    try:
        # 检查是否需要创建初始数据
        if db.query(User).count() == 0:
            print("正在创建初始班级和用户...")
            
            # 创建班级
            class1 = Class(name="计算机科学1班", description="计算机科学与技术专业1班")
            class2 = Class(name="软件工程1班", description="软件工程专业1班")
            db.add_all([class1, class2])
            db.flush()  # 获取班级ID
            
            # 创建默认用户（密码需要在auth.py中处理）
            from auth import get_password_hash
            
            users_to_add = [
                User(account_id="admin", display_name="管理员", role="管理员",
                     hashed_password=get_password_hash("admin123"), class_id=None),
                User(account_id="T001", display_name="张老师", role="教师",
                     hashed_password=get_password_hash("teacher123"), class_id=class1.id),
                User(account_id="T002", display_name="李老师", role="教师",
                     hashed_password=get_password_hash("teacher123"), class_id=class2.id),
                User(account_id="S001", display_name="李同学", role="学生",
                     hashed_password=get_password_hash("student123"), class_id=class1.id),
                User(account_id="S002", display_name="王同学", role="学生",
                     hashed_password=get_password_hash("student123"), class_id=class1.id),
                User(account_id="S003", display_name="赵同学", role="学生",
                     hashed_password=get_password_hash("student123"), class_id=class2.id),
            ]
            
            db.add_all(users_to_add)
            db.commit()
            print("✅ 初始用户和班级创建完成")
            
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        db.rollback()
    finally:
        db.close()

def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 