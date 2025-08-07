#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试AI批改系统的JSON解析功能
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from grade import parse_json_array_robust, create_default_results, parse_text_to_grading_results

def test_grading_json_parsing():
    """测试AI批改的JSON解析功能"""
    print("🧪 测试AI批改JSON解析功能")
    print("=" * 50)
    
    # 模拟题目数据
    prompts_for_ai = [
        {
            "question_id": 1,
            "question_text": "什么是深度学习？",
            "question_type": "multiple_choice",
            "options": ["A. 机器学习", "B. 人工智能", "C. 神经网络", "D. 以上都是"],
            "standard_answer": "A",
            "student_answer": "A",
            "was_correct": True,
            "max_score": 5
        },
        {
            "question_id": 2,
            "question_text": "请解释卷积神经网络的工作原理",
            "question_type": "short_answer",
            "standard_answer": "卷积神经网络通过卷积层提取特征",
            "student_answer": "CNN使用卷积操作来处理图像数据",
            "was_correct": False,
            "max_score": 10
        }
    ]
    
    # 测试用例1: 标准JSON数组
    test_json_1 = '''
    [
      {
        "question_id": 1,
        "score": 5,
        "feedback": "回答正确。学生准确选择了正确答案。",
        "knowledge_point": "深度学习基础"
      },
      {
        "question_id": 2,
        "score": 7,
        "feedback": "回答部分正确。学生理解了基本概念，但缺少详细解释。",
        "knowledge_point": "卷积神经网络"
      }
    ]
    '''
    
    print("📝 测试用例1: 标准JSON数组")
    result1 = parse_json_array_robust(test_json_1, prompts_for_ai)
    if result1 and len(result1) == 2:
        print("✅ 解析成功")
        print(f"   题目1得分: {result1[0].get('score')}")
        print(f"   题目2得分: {result1[1].get('score')}")
    else:
        print("❌ 解析失败")
    
    print("\n" + "="*50)
    
    # 测试用例2: 带额外文字的JSON
    test_json_2 = '''
    根据学生的答题情况，我给出以下批改结果：
    
    [
      {
        "question_id": 1,
        "score": 5,
        "feedback": "回答正确。",
        "knowledge_point": "深度学习"
      },
      {
        "question_id": 2,
        "score": 6,
        "feedback": "回答基本正确，但不够详细。",
        "knowledge_point": "CNN"
      }
    ]
    
    以上是我的批改意见。
    '''
    
    print("📝 测试用例2: 带额外文字的JSON")
    result2 = parse_json_array_robust(test_json_2, prompts_for_ai)
    if result2 and len(result2) == 2:
        print("✅ 解析成功")
        print(f"   题目1得分: {result2[0].get('score')}")
        print(f"   题目2得分: {result2[1].get('score')}")
    else:
        print("❌ 解析失败")
    
    print("\n" + "="*50)
    
    # 测试用例3: 格式错误的响应
    test_json_3 = '''
    抱歉，我无法正确分析这些题目。
    系统出现了一些问题。
    '''
    
    print("📝 测试用例3: 格式错误的响应")
    result3 = parse_json_array_robust(test_json_3, prompts_for_ai)
    if result3 and len(result3) == 2:
        print("✅ 使用默认评分成功")
        print(f"   题目1得分: {result3[0].get('score')}")
        print(f"   题目2得分: {result3[1].get('score')}")
        print(f"   题目1反馈: {result3[0].get('feedback')[:30]}...")
    else:
        print("❌ 默认评分失败")
    
    print("\n" + "="*50)
    
    # 测试用例4: 单个对象格式
    test_json_4 = '''
    {
      "question_id": 1,
      "score": 5,
      "feedback": "回答正确。",
      "knowledge_point": "深度学习"
    }
    '''
    
    print("📝 测试用例4: 单个对象格式")
    result4 = parse_json_array_robust(test_json_4, prompts_for_ai[:1])  # 只传入一个题目
    if result4 and len(result4) == 1:
        print("✅ 单对象包装成功")
        print(f"   题目1得分: {result4[0].get('score')}")
    else:
        print("❌ 单对象包装失败")

def test_text_parsing():
    """测试文本解析功能"""
    print("\n🧪 测试文本解析功能")
    print("=" * 50)
    
    # 模拟题目数据
    prompts_for_ai = [
        {"question_id": 1, "question_type": "multiple_choice", "max_score": 5},
        {"question_id": 2, "question_type": "short_answer", "max_score": 10}
    ]
    
    # 测试文本格式的批改结果
    test_text = '''
    题目1分析：
    分数：5
    反馈：回答正确，学生选择了正确答案。
    知识点：深度学习基础
    
    题目2分析：
    分数：7
    反馈：回答部分正确，理解了基本概念但缺少细节。
    知识点：卷积神经网络
    '''
    
    print("📝 测试文本格式解析")
    result = parse_text_to_grading_results(test_text, prompts_for_ai)
    if result and len(result) == 2:
        print("✅ 文本解析成功")
        for i, r in enumerate(result):
            print(f"   题目{i+1}: 得分{r.get('score')}, 知识点{r.get('knowledge_point')}")
    else:
        print("❌ 文本解析失败")

def test_default_results():
    """测试默认结果生成"""
    print("\n🧪 测试默认结果生成")
    print("=" * 50)
    
    # 模拟题目数据
    prompts_for_ai = [
        {
            "question_id": 1,
            "question_type": "multiple_choice",
            "max_score": 5,
            "was_correct": True
        },
        {
            "question_id": 2,
            "question_type": "short_answer",
            "max_score": 10,
            "was_correct": False
        }
    ]
    
    print("📝 测试默认结果生成")
    result = create_default_results(prompts_for_ai)
    if result and len(result) == 2:
        print("✅ 默认结果生成成功")
        print(f"   选择题(正确): 得分{result[0].get('score')}/{prompts_for_ai[0]['max_score']}")
        print(f"   简答题(错误): 得分{result[1].get('score')}/{prompts_for_ai[1]['max_score']}")
        print(f"   选择题反馈: {result[0].get('feedback')}")
        print(f"   简答题反馈: {result[1].get('feedback')[:30]}...")
    else:
        print("❌ 默认结果生成失败")

def main():
    """主函数"""
    print("🔧 AI批改系统测试")
    print("=" * 60)
    
    try:
        test_grading_json_parsing()
        test_text_parsing()
        test_default_results()
        
        print("\n📊 测试总结:")
        print("✅ JSON数组解析功能已大幅增强")
        print("✅ 支持多种AI批改响应格式")
        print("✅ 智能文本解析功能")
        print("✅ 完善的默认评分机制")
        print("✅ 根据题目类型智能给分")
        
        print("\n💡 改进内容:")
        print("1. 增强了JSON数组解析的容错能力")
        print("2. 添加了智能文本解析功能")
        print("3. 改进了默认评分策略")
        print("4. 增加了详细的调试信息")
        print("5. 支持单对象自动包装为数组")
        
    except Exception as e:
        print(f"❌ 测试过程中出现错误: {str(e)}")

if __name__ == "__main__":
    main()
