from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 导入路由模块
from api.auth import auth_router
from api.users import users_router
from api.classes import classes_router
from api.resources import resources_router
from api.videos import videos_router
from api.analytics import analytics_router
from api.exams import exams_router
from api.notes import notes_router
from api.pptgen import pptgen_router
from api.clouds import clouds_router
from api.manage import manage_router

# 导入数据库初始化
from database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    print("🚀 启动 EduAGI 后端服务...")
    init_db()
    print("✅ 数据库初始化完成")
    yield
    # 关闭时执行
    print("🛑 关闭 EduAGI 后端服务...")

# 创建FastAPI应用
app = FastAPI(
    title="EduAGI 智能教学系统 API",
    description="基于AI的教育管理系统后端API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React开发服务器
        "http://localhost:5173",  # Vite开发服务器
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        # Hugging Face Spaces
        "https://*.hf.space",
        # Render部署
        "https://*.onrender.com",
        "https://eduagi-frontend.onrender.com",
        # 生产环境域名
        "https://your-frontend-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件目录
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# 注册路由
app.include_router(auth_router, prefix="/api/auth", tags=["认证"])
app.include_router(users_router, prefix="/api/users", tags=["用户管理"])
app.include_router(classes_router, prefix="/api/classes", tags=["班级管理"])
app.include_router(resources_router, prefix="/api/resources", tags=["资源管理"])
app.include_router(videos_router, prefix="/api/videos", tags=["视频分析"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["数据分析"])
app.include_router(exams_router, prefix="/api/exams", tags=["考试管理"])
app.include_router(notes_router, prefix="/api/notes", tags=["笔记管理"])
app.include_router(pptgen_router, prefix="/api/pptgen", tags=["PPT生成"])
app.include_router(clouds_router, prefix="/api/clouds", tags=["云存储"])
app.include_router(manage_router, prefix="/api/manage", tags=["系统管理"])

@app.get("/")
async def root():
    """根路径 - API信息"""
    return {
        "message": "EduAGI 智能教学系统 API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy", "message": "服务运行正常"}

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    ) 