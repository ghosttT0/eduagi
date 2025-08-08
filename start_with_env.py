#!/usr/bin/env python3
"""
启动脚本 - 带环境变量设置
"""

import os
import sys
import subprocess

def main():
    """主函数"""
    print("=== 启动教育AI系统 ===")
    
    # 检查环境变量
    deepseek_key = os.getenv("DEEPSEEK_API_KEY")
    if not deepseek_key:
        print("⚠️  警告: DEEPSEEK_API_KEY 环境变量未设置")
        print("请先设置环境变量或运行 setup_env.py")
        return
    
    print("✅ 环境变量检查通过")
    
    # 启动后端服务
    print("\n=== 启动后端服务 ===")
    try:
        subprocess.run([sys.executable, "backend/main.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ 后端服务启动失败: {e}")
    except KeyboardInterrupt:
        print("\n🛑 用户中断，正在关闭服务...")

if __name__ == "__main__":
    main() 