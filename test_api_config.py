#!/usr/bin/env python3
"""
API配置测试脚本
用于验证AI API密钥是否正确配置
"""

import os
import asyncio
import sys

# 添加backend目录到Python路径
sys.path.append('backend')

# 尝试加载 backend/.env
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join('backend', '.env'))
except Exception:
    pass

from services.ai_service import AIService

async def test_api_config():
    """测试API配置"""
    print("检查AI API配置...")
    print("=" * 50)
    
    # 检查环境变量
    deepseek_key = os.getenv("DEEPSEEK_API_KEY")
    qwen_key = os.getenv("QWEN_API_KEY")
    
    print(f"DeepSeek API Key: {'已配置' if deepseek_key else '未配置'}")
    print(f"通义千问 API Key: {'已配置' if qwen_key else '未配置'}")
    
    # 测试AI服务
    print("\n测试AI服务...")
    ai_service = AIService()
    
    test_prompt = "请简单介绍一下Python编程语言的特点"
    print(f"\n测试提示词: {test_prompt}")
    
    try:
        response = await ai_service.call_deepseek_api(test_prompt)
        print(f"响应模型: {response.model}")
        
        if response.model and 'mock' in str(response.model).lower():
            print("判定：使用模拟回复（可能未配置有效API密钥或API调用失败）")
        else:
            print("判定：已使用真实AI服务")
            
    except Exception as e:
        print(f"API调用失败: {e}")
    
    await ai_service.close()
    print("\n" + "=" * 50)

if __name__ == "__main__":
    asyncio.run(test_api_config()) 