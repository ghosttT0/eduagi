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
    使用“AI阅卷特级教师”模式，对所有题目进行批量、深度、智能的分析和评分。
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

    # 2. 设计“终极版”的、手把手教AI如何批改的Prompt
    if prompts_for_ai:
        prompt = f"""
        你是一位顶级的、富有经验的AI教学与阅卷专家。你的任务是为以下每一道题生成一份结构化的JSON分析报告。

        **你的核心指令:**
        1. 你的回复必须是一个JSON数组，数组中的每个对象对应一道题的报告。
        2. 每个报告对象必须包含以下键: "question_id"(整数), "score"(整数), "feedback"(字符串), "knowledge_point"(字符串)。

        **针对每一道题，请严格遵循以下评分和评语生成规则:**

        **对于 `score` (分数):**
        - 如果题目是客观题(`multiple_choice`), 并且 `was_correct` 为 `true`，则 `score` 等于 `max_score`；如果 `was_correct` 为 `false`，则 `score` 为 0。
        - 如果题目是主观题(`short_answer`, `coding`), 请你根据学生答案的质量、准确性和完整性，在 0 到 `max_score` 之间给出一个最合理的 **整数部分分数**。

        **对于 `feedback` (评语):**
        - 如果 `was_correct` 是 `true` (无论主客观题): 你的 `feedback` 必须以“回答正确。”开头，然后简要概括学生回答的要点，并对该知识点进行巩固性解析或适当扩展。
        - 如果 `was_correct` 是 `false`: 你的 `feedback` 必须深入分析学生为什么会犯错。例如，对于选择题，要分析“为什么学生会倾向于选择他那个错误的选项，这个选项迷惑性在哪里，反映了什么概念不清的问题？”。对于简答题，要指出回答中缺失或错误的关键点。最后，再给出正确答案的详细解析。

        **对于 `knowledge_point` (考点):**
        - 请用一个简短的核心词组，精确概括出这道题考察的知识点。

        **待分析的题目列表如下:**
        {json.dumps(prompts_for_ai, ensure_ascii=False, indent=2)}

        **重要提醒：请严格按照JSON数组格式返回{len(prompts_for_ai)}个批改结果，直接返回JSON数组，不要包含其他解释文字。**
        """
        try:
            response = qa_chain.invoke({"question": prompt})
            result_text = response.get('answer', '').strip()

            # 使用强化版JSON数组解析
            all_results = parse_json_array_robust(result_text, prompts_for_ai)

            if all_results:
                # 为主观题加上可质疑标记
                for res in all_results:
                    q_type = next(
                        (p['question_type'] for p in prompts_for_ai if p['question_id'] == res['question_id']),
                        "multiple_choice")
                    res["allow_dispute"] = (q_type != "multiple_choice")
            else:
                raise ValueError("AI未能返回有效的JSON数组格式。")
        except Exception as e:
            # 如果AI批改失败，为所有题目返回一个错误信息
            all_results = [{"question_id": item['question_id'], "score": 0, "feedback": f"AI批改时发生严重错误: {e}",
                            "knowledge_point": "未知", "allow_dispute": True} for item in prompts_for_ai]

    return sorted(all_results, key=lambda x: x['question_id'])