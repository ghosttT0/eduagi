# exam_grader.py (最终AI阅卷特级教师版)
import json
import re

def parse_json_array_robust(result_text, prompts_for_ai):
    """
    超强化版JSON数组解析函数 - 支持多种AI响应格式
    """
    if not result_text or not result_text.strip():
        print("📝 AI响应为空，使用默认评分")
        return create_default_results(prompts_for_ai)

    # 添加调试信息
    print(f"🔍 AI批改响应长度: {len(result_text)} 字符")
    print(f"🔍 AI响应前100字符: {result_text[:100]}")

    # 方法1: 直接JSON解析
    try:
        json_data = json.loads(result_text)
        if isinstance(json_data, list):
            print("✅ 方法1成功: 直接JSON数组解析")
            return json_data
        elif isinstance(json_data, dict) and 'results' in json_data:
            print("✅ 方法1成功: 提取results字段")
            return json_data['results']
    except Exception as e:
        print(f"❌ 方法1失败: {str(e)}")

    # 方法2: 提取方括号内容
    try:
        match = re.search(r'\[.*\]', result_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            json_data = json.loads(json_str)
            if isinstance(json_data, list):
                print("✅ 方法2成功: 提取方括号内容")
                return json_data
    except Exception as e:
        print(f"❌ 方法2失败: {str(e)}")

    # 方法3: 清理后解析
    try:
        match = re.search(r'\[.*\]', result_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            # 清理常见问题
            json_str = json_str.replace('\n', ' ').replace('\r', ' ')
            json_str = re.sub(r'\s+', ' ', json_str)
            json_str = json_str.replace("'", '"')  # 单引号改双引号

            # 尝试修复缺少引号的键
            json_str = re.sub(r'(\w+):', r'"\1":', json_str)

            json_data = json.loads(json_str)
            if isinstance(json_data, list):
                print("✅ 方法3成功: 清理后解析")
                return json_data
    except Exception as e:
        print(f"❌ 方法3失败: {str(e)}")

    # 方法4: 提取大括号内容并包装成数组
    try:
        match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            json_data = json.loads(json_str)
            if isinstance(json_data, dict):
                # 如果是单个对象，包装成数组
                print("✅ 方法4成功: 包装单个对象为数组")
                return [json_data]
    except Exception as e:
        print(f"❌ 方法4失败: {str(e)}")

    # 方法5: 智能文本解析
    try:
        parsed_results = parse_text_to_grading_results(result_text, prompts_for_ai)
        if parsed_results:
            print("✅ 方法5成功: 智能文本解析")
            return parsed_results
    except Exception as e:
        print(f"❌ 方法5失败: {str(e)}")

    # 方法6: 创建默认结果
    print("⚠️ AI批改响应格式异常，使用默认评分")
    return create_default_results(prompts_for_ai)

def create_default_results(prompts_for_ai):
    """创建默认评分结果"""
    default_results = []
    for item in prompts_for_ai:
        # 根据题目类型给出不同的默认分数
        if item['question_type'] == 'multiple_choice':
            # 选择题：根据是否正确给分
            score = item['max_score'] if item.get('was_correct', False) else 0
            feedback = "回答正确。" if item.get('was_correct', False) else "回答错误，请查看正确答案。"
        else:
            # 主观题：给中等分数
            score = max(1, item['max_score'] // 2)
            feedback = "AI批改系统暂时无法处理此题，已给予部分分数。建议联系教师进行人工批改。"
        
        default_results.append({
            "question_id": item['question_id'],
            "score": score,
            "feedback": feedback,
            "knowledge_point": "待确定",
            "allow_dispute": True
        })
    return default_results

def parse_text_to_grading_results(text, prompts_for_ai):
    """从文本中智能解析批改结果"""
    results = []
    
    # 尝试按题目分割文本
    lines = text.split('\n')
    current_result = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # 检测题目开始
        question_match = re.search(r'题目?\s*(\d+)|question\s*(\d+)', line, re.IGNORECASE)
        if question_match:
            if current_result:
                results.append(current_result)
            
            question_id = int(question_match.group(1) or question_match.group(2))
            current_result = {
                "question_id": question_id,
                "score": 0,
                "feedback": "",
                "knowledge_point": "待确定",
                "allow_dispute": True
            }
        
        # 检测分数
        elif current_result:
            score_match = re.search(r'分数[:：]\s*(\d+)|得分[:：]\s*(\d+)|score[:：]\s*(\d+)', line, re.IGNORECASE)
            if score_match:
                current_result['score'] = int(score_match.group(1) or score_match.group(2) or score_match.group(3))
            
            # 检测反馈
            elif '反馈' in line or '评语' in line or 'feedback' in line.lower():
                current_result['feedback'] = line.split(':', 1)[-1].split('：', 1)[-1].strip()
            
            # 检测知识点
            elif '知识点' in line or '考点' in line:
                current_result['knowledge_point'] = line.split(':', 1)[-1].split('：', 1)[-1].strip()
    
    # 添加最后一个结果
    if current_result:
        results.append(current_result)
    
    # 如果解析出的结果数量与题目数量匹配，返回结果
    if len(results) == len(prompts_for_ai):
        return results
    
    return None


def grade_exam(questions, user_answers, qa_chain):
    """
    使用"AI阅卷特级教师"模式，对所有题目进行批量、深度、智能的分析和评分。
    """
    all_results = []
    prompts_for_ai = []

    # 1. 收集所有题目信息，并预先判断客观题对错
    user_answers_dict = {ua['question_id']: ua['student_answer'] for ua in user_answers}
    for q in questions:
        student_ans = user_answers_dict.get(q['id'], "")
        # 对所有题型都先进行一次基于规则的对错判断
        is_correct = (str(student_ans).lower().strip() == str(q['answer']).lower().strip())

        prompts_for_ai.append({
            "question_id": q['id'],
            "question_text": q['question_text'],
            "question_type": q['type'],
            "options": q.get('options', []),
            "standard_answer": q['answer'],
            "student_answer": student_ans,
            "was_correct": is_correct,
            "max_score": q['score']
        })

    # 2. 设计简洁明确的AI批改Prompt
    if prompts_for_ai:
        prompt = f"""
你是一位资深的教学专家，请为以下{len(prompts_for_ai)}道题目进行详细的批改分析。

要求：
1. 对每道题给出详细的分析和反馈
2. 反馈要具有教育价值，帮助学生理解知识点
3. 对于错误答案，要分析错误原因并给出正确解析
4. 对于正确答案，要进行知识点巩固和扩展

返回JSON数组格式，每个对象包含：
- question_id: 题目ID
- score: 得分（选择题：正确得满分，错误得0分；主观题：根据质量给分）
- feedback: 详细的教学反馈（至少100字，包含分析、解释、建议）
- knowledge_point: 核心知识点

示例格式：
[
  {{
    "question_id": 1,
    "score": 5,
    "feedback": "智能导学评语：1. 学生的回答基础理解正确，正确答案是A，当前题目千个训练样本中，同学已经对了"机器学习基础理论"的主要概念理解。2. 学生选择的这个错误选项反映出对机器学习的基本概念理解不够深入，具体表现在对机器学习的定义理解不够准确，而实际学习过程中需要更深入理解机器学习的核心概念。3. 正确答案解析：深度学习是机器学习的一个重要分支，它使用多层神经网络来学习数据的复杂模式和表示。建议学生进一步学习神经网络的基本原理和深度学习的核心概念。",
    "knowledge_point": "深度学习基础概念"
  }}
]

题目信息：
{json.dumps(prompts_for_ai, ensure_ascii=False, indent=2)}

请直接返回JSON数组：
        """
        try:
            response = qa_chain.invoke({"question": prompt})
            result_text = response.get('answer', '').strip()

            # 使用强化版JSON数组解析
            all_results = parse_json_array_robust(result_text, prompts_for_ai)

            if all_results:
                # 为主观题加上可质疑标记，并补充max_score字段
                for res in all_results:
                    q_info = next(
                        (p for p in prompts_for_ai if p['question_id'] == res['question_id']),
                        None)
                    if q_info:
                        q_type = q_info['question_type']
                        res["allow_dispute"] = (q_type != "multiple_choice")
                        res["max_score"] = q_info['max_score']  # 添加max_score字段
            else:
                raise ValueError("AI未能返回有效的JSON数组格式。")
        except Exception as e:
            # 如果AI批改失败，为所有题目返回一个错误信息
            print(f"❌ AI批改异常: {str(e)}")
            all_results = create_default_results(prompts_for_ai)

    return sorted(all_results, key=lambda x: x['question_id'])
