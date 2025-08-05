from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 创建FastAPI应用
app = FastAPI(
    title="EduAGI API",
    description="智能教学系统API",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://eduagi.zeabur.app",
        "https://eduagi-fullstack.zeabur.app",
        "https://*.zeabur.app",
        "https://*.onrender.com",
        "https://*.hf.space"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 导入API路由
from api.auth import auth_router
from api.users import users_router
from api.classes import classes_router
from api.videos import videos_router
from api.exams import exams_router
from api.notes import notes_router
from api.resources import resources_router
from api.analytics import analytics_router
from api.pptgen import pptgen_router
from api.clouds import clouds_router
from api.manage import manage_router

# 注册路由
app.include_router(auth_router, prefix="/api/auth", tags=["认证"])
app.include_router(users_router, prefix="/api/users", tags=["用户管理"])
app.include_router(classes_router, prefix="/api/classes", tags=["班级管理"])
app.include_router(videos_router, prefix="/api/videos", tags=["视频分析"])
app.include_router(exams_router, prefix="/api/exams", tags=["考试管理"])
app.include_router(notes_router, prefix="/api/notes", tags=["笔记管理"])
app.include_router(resources_router, prefix="/api/resources", tags=["资源管理"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["数据分析"])
app.include_router(pptgen_router, prefix="/api/pptgen", tags=["PPT生成"])
app.include_router(clouds_router, prefix="/api/clouds", tags=["云存储"])
app.include_router(manage_router, prefix="/api/manage", tags=["系统管理"])

@app.get("/")
async def root():
    """根路径"""
    return {"message": "EduAGI API 运行正常", "status": "success"}

@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "healthy"}

@app.get("/api/test")
async def test():
    """测试端点"""
    return {"message": "API连接成功！"} 