#!/usr/bin/env python3
"""
EduAGI 智能教学系统启动脚本
前后端分离架构启动器
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

def print_banner():
    """打印系统横幅"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                    EduAGI 智能教学系统                        ║
    ║                    前后端分离架构启动器                        ║
    ║                                                              ║
    ║  🚀 后端: FastAPI + SQLAlchemy + JWT                        ║
    ║  🎨 前端: React + TypeScript + Ant Design                   ║
    ║  🤖 AI: 通义千问视频分析                                      ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_requirements():
    """检查系统要求"""
    print("🔍 检查系统要求...")
    
    # 检查Python版本
    if sys.version_info < (3, 8):
        print("❌ Python版本过低，需要Python 3.8+")
        return False
    
    # 检查Node.js
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ 未找到Node.js，请先安装Node.js 16+")
            return False
        print(f"✅ Node.js版本: {result.stdout.strip()}")
    except FileNotFoundError:
        print("❌ 未找到Node.js，请先安装Node.js 16+")
        return False
    
    # 检查npm
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ 未找到npm，请先安装npm")
            return False
        print(f"✅ npm版本: {result.stdout.strip()}")
    except FileNotFoundError:
        print("❌ 未找到npm，请先安装npm")
        return False
    
    print("✅ 系统要求检查通过")
    return True

def setup_backend():
    """设置后端"""
    print("\n🔧 设置后端...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ 后端目录不存在")
        return False
    
    # 检查虚拟环境
    venv_dir = backend_dir / "venv"
    if not venv_dir.exists():
        print("📦 创建Python虚拟环境...")
        subprocess.run([sys.executable, "-m", "venv", str(venv_dir)], cwd=backend_dir)
    
    # 激活虚拟环境并安装依赖
    if os.name == 'nt':  # Windows
        python_path = venv_dir / "Scripts" / "python.exe"
        pip_path = venv_dir / "Scripts" / "pip.exe"
    else:  # Linux/Mac
        python_path = venv_dir / "bin" / "python"
        pip_path = venv_dir / "bin" / "pip"
    
    print("📦 安装后端依赖...")
    subprocess.run([str(pip_path), "install", "-r", "requirements.txt"], cwd=backend_dir)
    
    # 检查环境变量文件
    env_file = backend_dir / ".env"
    env_example = backend_dir / "env.example"
    if not env_file.exists() and env_example.exists():
        print("📝 创建环境变量文件...")
        subprocess.run(["cp", str(env_example), str(env_file)], cwd=backend_dir)
        print("⚠️  请编辑 backend/.env 文件，配置必要的API密钥")
    
    print("✅ 后端设置完成")
    return True

def setup_frontend():
    """设置前端"""
    print("\n🎨 设置前端...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ 前端目录不存在")
        return False
    
    # 安装前端依赖
    print("📦 安装前端依赖...")
    subprocess.run(["npm", "install"], cwd=frontend_dir)
    
    print("✅ 前端设置完成")
    return True

def start_backend():
    """启动后端服务"""
    print("\n🚀 启动后端服务...")
    
    backend_dir = Path("backend")
    if os.name == 'nt':  # Windows
        python_path = backend_dir / "venv" / "Scripts" / "python.exe"
    else:  # Linux/Mac
        python_path = backend_dir / "venv" / "bin" / "python"
    
    try:
        # 启动后端服务
        process = subprocess.Popen([str(python_path), "start.py"], cwd=backend_dir)
        print("✅ 后端服务启动成功 (PID: {})".format(process.pid))
        return process
    except Exception as e:
        print(f"❌ 后端服务启动失败: {e}")
        return None

def start_frontend():
    """启动前端服务"""
    print("\n🎨 启动前端服务...")
    
    frontend_dir = Path("frontend")
    try:
        # 启动前端开发服务器
        process = subprocess.Popen(["npm", "run", "dev"], cwd=frontend_dir)
        print("✅ 前端服务启动成功 (PID: {})".format(process.pid))
        return process
    except Exception as e:
        print(f"❌ 前端服务启动失败: {e}")
        return None

def main():
    """主函数"""
    print_banner()
    
    # 检查系统要求
    if not check_requirements():
        print("\n❌ 系统要求检查失败，请解决上述问题后重试")
        return
    
    # 设置后端
    if not setup_backend():
        print("\n❌ 后端设置失败")
        return
    
    # 设置前端
    if not setup_frontend():
        print("\n❌ 前端设置失败")
        return
    
    # 启动服务
    print("\n🚀 启动系统服务...")
    
    backend_process = start_backend()
    if not backend_process:
        return
    
    # 等待后端启动
    print("⏳ 等待后端服务启动...")
    time.sleep(3)
    
    frontend_process = start_frontend()
    if not frontend_process:
        backend_process.terminate()
        return
    
    print("\n" + "="*60)
    print("🎉 EduAGI 智能教学系统启动成功！")
    print("="*60)
    print("📱 前端地址: http://localhost:3000")
    print("🔧 后端API: http://localhost:8000")
    print("📚 API文档: http://localhost:8000/docs")
    print("="*60)
    print("💡 提示:")
    print("   - 首次使用请先配置 backend/.env 文件")
    print("   - 默认管理员账号: admin / admin123")
    print("   - 按 Ctrl+C 停止所有服务")
    print("="*60)
    
    # 自动打开浏览器
    try:
        time.sleep(2)
        webbrowser.open("http://localhost:3000")
    except:
        pass
    
    try:
        # 等待用户中断
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 正在停止服务...")
        
        if backend_process:
            backend_process.terminate()
            print("✅ 后端服务已停止")
        
        if frontend_process:
            frontend_process.terminate()
            print("✅ 前端服务已停止")
        
        print("👋 感谢使用 EduAGI 智能教学系统！")

if __name__ == "__main__":
    main() 