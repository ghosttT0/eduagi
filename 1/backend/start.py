#!/usr/bin/env python3
"""
EduAGI 后端启动脚本
"""

import uvicorn
import os
import sys
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

def check_dependencies():
    """检查依赖是否安装"""
    try:
        import fastapi
        import sqlalchemy
        import openai
        print("✅ 核心依赖检查通过")
        return True
    except ImportError as e:
        print(f"❌ 缺少依赖: {e}")
        print("请运行: pip install -r requirements-minimal.txt")
        return False

if __name__ == "__main__":
    # 检查依赖
    if not check_dependencies():
        sys.exit(1)
    
    # 获取配置
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    print(f"🚀 启动 EduAGI 后端服务...")
    print(f"📍 服务地址: http://{host}:{port}")
    print(f"📚 API文档: http://{host}:{port}/docs")
    print(f"🔄 热重载: {'启用' if reload else '禁用'}")
    
    # 启动服务
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    ) 