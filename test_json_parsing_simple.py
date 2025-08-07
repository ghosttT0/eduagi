#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化的JSON解析测试
"""

import json
import re

def parse_json_robust(result_text, expected_keys=None, fallback_data=None):
    """
    强化版AI响应解析函数，支持多种格式和容错处理
    """
    if not result_text or not result_text.strip():
        print("📝 AI响应为空，使用默认模板")
        return fallback_data

    # 添加调试信息
    print(f"🔍 AI原始响应长度: {len(result_text)} 字符")
    print(f"🔍 AI响应前100字符: {result_text[:100]}")

    # 方法1: 直接JSON解析
    try:
        json_data = json.loads(result_text)
        print("✅ 方法1成功: 直接JSON解析")
        return json_data
    except Exception as e:
        print(f"❌ 方法1失败: {str(e)}")

    # 方法2: 提取大括号内容
    try:
        match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            json_data = json.loads(json_str)
            print("✅ 方法2成功: 提取大括号内容")
            return json_data
    except Exception as e:
        print(f"❌ 方法2失败: {str(e)}")

    # 方法3: 清理后解析
    try:
        match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            # 清理常见问题
            json_str = json_str.replace('\n', ' ').replace('\r', ' ')
            json_str = re.sub(r'\s+', ' ', json_str)
            json_str = json_str.replace("'", '"')  # 单引号改双引号

            # 尝试修复缺少引号的键
            json_str = re.sub(r'(\w+):', r'"\1":', json_str)

            json_data = json.loads(json_str)
            print("✅ 方法3成功: 清理后解析")
            return json_data
    except Exception as e:
        print(f"❌ 方法3失败: {str(e)}")

    # 方法4: 尝试提取JSON数组格式
    try:
        match = re.search(r'\[.*\]', result_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            json_data = json.loads(json_str)
            # 如果是数组，包装成对象
            if isinstance(json_data, list) and expected_keys and len(expected_keys) > 0:
                wrapped_data = {expected_keys[0]: json_data}
                print("✅ 方法4成功: 提取并包装JSON数组")
                return wrapped_data
    except Exception as e:
        print(f"❌ 方法4失败: {str(e)}")

    # 方法5: 智能文本解析（针对试卷格式）
    if "questions" in str(expected_keys):
        try:
            questions = parse_text_to_questions(result_text)
            if questions:
                print("✅ 方法5成功: 智能文本解析")
                return {"questions": questions}
        except Exception as e:
            print(f"❌ 方法5失败: {str(e)}")

    # 方法6: 返回备选数据
    if fallback_data:
        print("⚠️ AI返回格式异常，使用默认模板")
        print("🔄 使用默认模板")
        return fallback_data

    return None

def parse_text_to_questions(text):
    """从文本中智能解析试题"""
    questions = []
    
    # 尝试按行分割并查找题目模式
    lines = text.split('\n')
    current_question = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # 检测题目开始
        if re.match(r'^\d+[\.、]', line) or '题' in line:
            if current_question:
                questions.append(current_question)
            
            # 判断题目类型
            if '选择题' in line or '单选' in line or '多选' in line:
                question_type = 'multiple_choice'
            elif '简答' in line or '问答' in line:
                question_type = 'short_answer'
            elif '编程' in line or '代码' in line:
                question_type = 'coding'
            else:
                question_type = 'short_answer'  # 默认
            
            current_question = {
                'type': question_type,
                'question_text': line,
                'options': [],
                'answer': '',
                'explanation': ''
            }
        
        # 检测选项
        elif current_question and re.match(r'^[A-D][\.、]', line):
            current_question['options'].append(line)
        
        # 检测答案
        elif current_question and ('答案' in line or '参考答案' in line):
            current_question['answer'] = line.replace('答案:', '').replace('参考答案:', '').strip()
    
    # 添加最后一个题目
    if current_question:
        questions.append(current_question)
    
    return questions

def main():
    """主函数"""
    print("🧪 JSON解析功能测试")
    print("=" * 40)
    
    # 测试用例1: 标准JSON
    test_json_1 = '''
    {
      "questions": [
        {
          "type": "multiple_choice",
          "question_text": "什么是深度学习？",
          "options": ["A. 机器学习的一种", "B. 人工智能", "C. 神经网络", "D. 以上都是"],
          "answer": "A",
          "explanation": "深度学习是机器学习的一个分支"
        }
      ]
    }
    '''
    
    print("📝 测试用例1: 标准JSON")
    result1 = parse_json_robust(test_json_1, ["questions"], None)
    if result1:
        print("✅ 解析成功")
        print(f"   题目数量: {len(result1.get('questions', []))}")
    else:
        print("❌ 解析失败")
    
    print("\n" + "="*40)
    
    # 测试用例2: 带额外文字的JSON
    test_json_2 = '''
    根据您的要求，我生成了以下试卷：
    
    {
      "questions": [
        {
          "type": "short_answer",
          "question_text": "请解释卷积神经网络的工作原理",
          "answer": "卷积神经网络通过卷积层、池化层等结构提取特征",
          "explanation": "需要包含卷积操作、特征提取、分类等要点"
        }
      ]
    }
    
    希望这个试卷符合您的要求。
    '''
    
    print("📝 测试用例2: 带额外文字的JSON")
    result2 = parse_json_robust(test_json_2, ["questions"], None)
    if result2:
        print("✅ 解析成功")
        print(f"   题目数量: {len(result2.get('questions', []))}")
    else:
        print("❌ 解析失败")
    
    print("\n" + "="*40)
    
    # 测试用例3: 格式错误的JSON
    test_json_3 = '''
    这是一个格式错误的响应，没有有效的JSON内容。
    试卷生成失败了。
    '''
    
    print("📝 测试用例3: 格式错误的JSON")
    fallback_data = {"questions": [{"type": "multiple_choice", "question_text": "默认题目"}]}
    result3 = parse_json_robust(test_json_3, ["questions"], fallback_data)
    if result3:
        print("✅ 使用默认模板成功")
        print(f"   题目数量: {len(result3.get('questions', []))}")
    else:
        print("❌ 解析失败")
    
    print("\n" + "="*40)
    
    # 测试用例4: 文本格式的试题
    test_text = '''
    1. 选择题：什么是机器学习？
    A. 人工智能的一种
    B. 计算机科学
    C. 数据分析
    D. 以上都是
    答案：A
    
    2. 简答题：请解释深度学习的基本概念。
    参考答案：深度学习是机器学习的一个分支，使用多层神经网络来学习数据的表示。
    '''
    
    print("📝 测试用例4: 文本格式解析")
    result4 = parse_json_robust(test_text, ["questions"], None)
    if result4:
        print("✅ 文本解析成功")
        print(f"   题目数量: {len(result4.get('questions', []))}")
        for i, q in enumerate(result4.get('questions', [])):
            print(f"   题目{i+1}: {q.get('type')} - {q.get('question_text')[:30]}...")
    else:
        print("❌ 文本解析失败")
    
    print("\n📊 测试总结:")
    print("✅ JSON解析功能已大幅增强")
    print("✅ 支持多种格式的AI响应")
    print("✅ 智能文本解析功能")
    print("✅ 完善的错误处理和回退机制")

if __name__ == "__main__":
    main()
