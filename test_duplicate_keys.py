#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试重复key问题修复
"""

import sys
import os
import re

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_duplicate_keys():
    """检查pages/teacher.py中是否还有重复的key"""
    
    print("🚀 开始检查重复key问题...")
    
    try:
        with open('pages/teacher.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取所有的key值
        key_pattern = r'key=f?"([^"]+)"'
        keys = re.findall(key_pattern, content)
        
        print(f"📊 找到 {len(keys)} 个key")
        
        # 检查重复
        key_counts = {}
        for key in keys:
            # 简化key模式检查（去掉变量部分）
            simplified_key = re.sub(r'\{[^}]+\}', '{ID}', key)
            if simplified_key in key_counts:
                key_counts[simplified_key] += 1
            else:
                key_counts[simplified_key] = 1
        
        # 找出可能重复的key模式
        potential_duplicates = {k: v for k, v in key_counts.items() if v > 1}
        
        if potential_duplicates:
            print("⚠️ 发现可能重复的key模式：")
            for key, count in potential_duplicates.items():
                print(f"   {key}: {count} 次")
        else:
            print("✅ 没有发现重复的key模式")
        
        # 检查具体的key前缀
        prefixes = {}
        for key in keys:
            if '{' in key:
                prefix = key.split('{')[0]
                if prefix in prefixes:
                    prefixes[prefix] += 1
                else:
                    prefixes[prefix] = 1
        
        print("\n📋 Key前缀统计：")
        for prefix, count in sorted(prefixes.items()):
            print(f"   {prefix}: {count} 个")
        
        # 检查特定的问题key
        problem_patterns = [
            r'delete_\d+',
            r'view_\d+', 
            r'update_\d+',
            r'reply_\d+'
        ]
        
        print("\n🔍 检查问题模式：")
        for pattern in problem_patterns:
            matches = re.findall(pattern, content)
            if matches:
                print(f"   ❌ 发现问题模式 {pattern}: {len(matches)} 个")
            else:
                print(f"   ✅ 模式 {pattern}: 无问题")
        
        print("\n🎉 重复key检查完成！")
        return len(potential_duplicates) == 0
        
    except Exception as e:
        print(f"❌ 检查失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_duplicate_keys()
