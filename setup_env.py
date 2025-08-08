#!/usr/bin/env python3
"""
环境变量设置脚本
用于在本地开发环境中设置API密钥
"""

import os
import sys

def setup_environment():
    """设置环境变量"""
    print("=== 设置本地环境变量 ===")
    
    # 从环境变量或配置文件读取API密钥
    deepseek_key = os.getenv("DEEPSEEK_API_KEY")
    if not deepseek_key:
        print("⚠️  警告: DEEPSEEK_API_KEY 环境变量未设置")
        print("请设置环境变量或创建 .env 文件")
        return False
    
    print(f"✅ 已设置 DEEPSEEK_API_KEY")
    
    # 可选：设置通义千问API密钥
    qwen_key = os.getenv("QWEN_API_KEY")
    if qwen_key:
        print(f"✅ 已设置 QWEN_API_KEY")
    
    print("=== 环境变量设置完成 ===")
    print("现在可以运行AI服务了！")
    
    # 验证设置
    print("\n=== 验证设置 ===")
    test_key = os.getenv("DEEPSEEK_API_KEY")
    print(f"DEEPSEEK_API_KEY: {'已设置' if test_key else '未设置'}")
    
    return True

if __name__ == "__main__":
    setup_environment() 