#!/usr/bin/env python3
"""
带环境变量的启动脚本
自动设置API密钥并启动AI服务
"""

import os
import sys
import subprocess

def main():
    """主函数"""
    print("=== EduAGI AI服务启动器 ===")
    
    # 设置环境变量
    os.environ["DEEPSEEK_API_KEY"] = "sk-6108402cc64449b2bba661b83051c10f"
    print("✅ 已设置 DEEPSEEK_API_KEY")
    
    # 验证设置
    test_key = os.getenv("DEEPSEEK_API_KEY")
    if not test_key:
        print("❌ 环境变量设置失败")
        return
    
    print("✅ 环境变量设置成功")
    
    # 测试AI服务
    print("\n=== 测试AI服务 ===")
    try:
        from test_api_config import test_api_config
        import asyncio
        asyncio.run(test_api_config())
    except Exception as e:
        print(f"❌ AI服务测试失败: {e}")
        return
    
    print("\n=== AI服务启动成功！===")
    print("现在可以正常使用AI功能了：")
    print("- 智能聊天")
    print("- 题目生成")
    print("- 答案批改")
    print("- 教学计划生成")
    print("- 知识图谱生成")

if __name__ == "__main__":
    main() 