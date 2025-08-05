from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
        "https://*.zeabur.app",
        "https://*.onrender.com",
        "https://*.hf.space"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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