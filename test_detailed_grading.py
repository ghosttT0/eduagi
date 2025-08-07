#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试详细AI批改功能
"""

import json
import sys
import os

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils import load_conversational_chain
from grade import grade_exam

def test_detailed_grading():
    """测试详细的AI批改功能"""
    
    print("🚀 开始测试详细AI批改功能...")
    
    # 1. 加载AI链
    print("📚 正在加载AI模型...")
    qa_chain = load_conversational_chain()
    print("✅ AI模型加载完成")
    
    # 2. 准备测试数据
    test_questions = [
        {
            'id': 1,
            'type': 'choice',
            'question_text': '什么是深度学习？',
            'options': ['A. 机器学习的一个分支', 'B. 数据挖掘技术', 'C. 统计学方法', 'D. 编程语言'],
            'answer': 'A',
            'score': 5
        },
        {
            'id': 2,
            'type': 'subjective',
            'question_text': '请解释神经网络的工作原理',
            'answer': '神经网络通过多层节点处理信息，每个节点接收输入，进行加权求和，然后通过激活函数输出结果。',
            'score': 10
        },
        {
            'id': 3,
            'type': 'choice',
            'question_text': '以下哪个不是机器学习的主要类型？',
            'options': ['A. 监督学习', 'B. 无监督学习', 'C. 强化学习', 'D. 量子学习'],
            'answer': 'D',
            'score': 5
        }
    ]
    
    test_answers = [
        {'question_id': 1, 'student_answer': 'B'},  # 错误答案
        {'question_id': 2, 'student_answer': '神经网络是模仿人脑的计算模型，通过层层处理实现智能'},  # 简单但基本正确的答案
        {'question_id': 3, 'student_answer': 'D'}   # 正确答案
    ]
    
    print("📝 测试题目：")
    for q in test_questions:
        # 找到对应的学生答案
        student_answer = next((ans['student_answer'] for ans in test_answers if ans['question_id'] == q['id']), "")

        print(f"  题目{q['id']}: {q['question_text']}")
        if q['type'] == 'choice':
            print(f"    选项: {q['options']}")
            print(f"    标准答案: {q['answer']}")
            print(f"    学生答案: {student_answer}")
        else:
            print(f"    标准答案: {q['answer']}")
            print(f"    学生答案: {student_answer}")
        print()
    
    # 3. 调用批改函数
    print("🤖 正在进行AI批改...")
    try:
        results = grade_exam(test_questions, test_answers, qa_chain)
        
        if results:
            print("✅ 批改完成！详细结果：")
            print("=" * 80)
            
            for result in results:
                print(f"\n📋 题目 {result['question_id']}:")
                print(f"   得分: {result['score']}/{result['max_score']}")
                print(f"   知识点: {result['knowledge_point']}")
                print(f"   详细反馈:")
                print(f"   {result['feedback']}")
                print("-" * 60)
            
            # 4. 保存结果到文件
            with open('detailed_grading_results.json', 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            print(f"\n💾 详细批改结果已保存到 detailed_grading_results.json")
            
            # 5. 计算总分
            total_score = sum(r['score'] for r in results)
            max_total = sum(r['max_score'] for r in results)
            print(f"\n📊 总分统计: {total_score}/{max_total} ({total_score/max_total*100:.1f}%)")
            
        else:
            print("❌ 批改失败，未获得有效结果")
            
    except Exception as e:
        print(f"❌ 批改过程中出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_detailed_grading()
