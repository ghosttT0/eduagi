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
    
    # 设置DeepSeek API密钥
    deepseek_key = "sk-6108402cc64449b2bba661b83051c10f"
    os.environ["DEEPSEEK_API_KEY"] = deepseek_key
    print(f"✅ 已设置 DEEPSEEK_API_KEY")
    
    # 可选：设置通义千问API密钥
    # qwen_key = "your-qwen-api-key-here"
    # os.environ["QWEN_API_KEY"] = qwen_key
    # print(f"✅ 已设置 QWEN_API_KEY")
    
    print("=== 环境变量设置完成 ===")
    print("现在可以运行AI服务了！")
    
    # 验证设置
    print("\n=== 验证设置 ===")
    test_key = os.getenv("DEEPSEEK_API_KEY")
    print(f"DEEPSEEK_API_KEY: {'已设置' if test_key else '未设置'}")

if __name__ == "__main__":
    setup_environment() 