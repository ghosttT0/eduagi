#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试time模块导入问题
"""

import sys
import os

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_time_import():
    """测试time模块导入"""
    
    print("🚀 开始测试time模块导入...")
    
    try:
        # 测试全局导入
        import time
        print("✅ 全局time模块导入成功")
        
        # 测试使用
        print("⏰ 测试time.sleep()...")
        time.sleep(0.1)
        print("✅ time.sleep()工作正常")
        
        # 测试局部导入
        def test_local_import():
            import time as time_module
            print("✅ 局部time模块导入成功")
            time_module.sleep(0.1)
            print("✅ 局部time_module.sleep()工作正常")
        
        test_local_import()
        
        # 测试pages.teacher模块导入
        print("📚 测试pages.teacher模块导入...")
        try:
            from pages import teacher
            print("✅ pages.teacher模块导入成功")
        except Exception as e:
            print(f"❌ pages.teacher模块导入失败: {e}")
            return False
        
        print("🎉 所有测试通过！")
        return True
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_time_import()
