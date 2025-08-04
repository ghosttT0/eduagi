#!/usr/bin/env python3
"""
EduAGI 后端安装脚本
"""

import subprocess
import sys
import os

def install_core_dependencies():
    """安装核心依赖"""
    print("📦 安装核心依赖...")
    
    core_packages = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "sqlalchemy==2.0.23",
        "python-multipart==0.0.6",
        "python-jose[cryptography]==3.3.0",
        "passlib[bcrypt]==1.7.4",
        "python-dotenv==1.0.0",
        "pydantic==2.5.0",
        "httpx==0.25.2",
        "requests==2.31.0",
        "aiofiles==23.2.1",
        "openai==1.3.7",
        "dashscope==1.23.9",
        "qiniu==7.13.0",
        "pandas==2.1.4",
        "numpy==1.25.2",
        "python-docx==1.1.0",
        "jinja2==3.1.2",
        "pillow==10.1.0"
    ]
    
    for package in core_packages:
        try:
            print(f"📦 安装 {package}...")
            subprocess.run([sys.executable, "-m", "pip", "install", package], check=True)
        except subprocess.CalledProcessError as e:
            print(f"⚠️  安装 {package} 失败，跳过: {e}")
            continue
    
    print("✅ 核心依赖安装完成")
    return True

def install_optional_dependencies():
    """安装可选依赖"""
    print("📦 安装可选依赖...")
    
    optional_packages = [
        "chromadb==0.4.18",
        "langchain==0.0.350",
        "langchain-openai==0.0.2",
        "langchain-chroma==0.2.5",
        "langchain-huggingface==0.3.1"
    ]
    
    for package in optional_packages:
        try:
            print(f"📦 安装 {package}...")
            subprocess.run([sys.executable, "-m", "pip", "install", package], check=True)
        except subprocess.CalledProcessError as e:
            print(f"⚠️  安装 {package} 失败，跳过: {e}")
            continue
    
    print("✅ 可选依赖安装完成")
    return True

def setup_environment():
    """设置环境"""
    print("🔧 设置环境...")
    
    # 创建数据目录
    os.makedirs("data", exist_ok=True)
    
    # 检查环境变量文件
    if not os.path.exists(".env"):
        if os.path.exists("env.example"):
            print("📝 创建环境变量文件...")
            subprocess.run(["cp", "env.example", ".env"])
            print("⚠️  请编辑 .env 文件，配置必要的API密钥")
        else:
            print("❌ 未找到 env.example 文件")
            return False
    
    print("✅ 环境设置完成")
    return True

def main():
    """主函数"""
    print("🚀 EduAGI 后端安装程序")
    print("=" * 40)
    
    # 安装核心依赖
    if not install_core_dependencies():
        print("❌ 核心依赖安装失败")
        return
    
    # 安装可选依赖
    install_optional_dependencies()
    
    # 设置环境
    if not setup_environment():
        print("❌ 环境设置失败")
        return
    
    print("\n🎉 安装完成！")
    print("=" * 40)
    print("📝 下一步:")
    print("1. 编辑 .env 文件配置API密钥")
    print("2. 运行: python start.py")
    print("3. 访问: http://localhost:8000/docs")

if __name__ == "__main__":
    main() 