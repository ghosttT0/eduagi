"""
AI服务集成模块
集成通义千问等AI服务，提供智能教学设计、知识图谱生成、智能出题、视频分析等功能
"""

import json
import asyncio
import re
from typing import Dict, List, Any, Optional
import httpx
from pydantic import BaseModel
import os
from datetime import datetime

# AI服务配置
class AIConfig:
    # DeepSeek配置
    DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1/chat/completions"

    # 通义千问配置（仅用于视频分析）
    QWEN_API_KEY = os.getenv("QWEN_API_KEY", "")
    QWEN_BASE_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"

    # 模型配置
    DEFAULT_MODEL = "deepseek-chat"  # DeepSeek主模型
    VIDEO_MODEL = "qwen-turbo"       # 视频分析专用模型
    MAX_TOKENS = 2000
    TEMPERATURE = 0.7

class AIRequest(BaseModel):
    prompt: str
    model: str = AIConfig.DEFAULT_MODEL
    max_tokens: int = AIConfig.MAX_TOKENS
    temperature: float = AIConfig.TEMPERATURE

class AIResponse(BaseModel):
    content: str
    usage: Dict[str, Any]
    model: str
    timestamp: datetime

class AIService:
    """AI服务主类"""

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=60.0)

    def _get_mock_response(self, prompt: str) -> AIResponse:
        """生成模拟AI回复"""
        import random

        # 根据提示词内容生成相应的模拟回复
        if "深度学习" in prompt or "神经网络" in prompt:
            mock_responses = [
                "深度学习是机器学习的一个分支，它使用多层神经网络来学习数据的复杂模式。神经网络的基本单元是神经元，通过前向传播和反向传播算法来训练模型。",
                "神经网络由输入层、隐藏层和输出层组成。每一层都包含多个神经元，神经元之间通过权重连接。训练过程中，我们通过调整这些权重来优化模型性能。",
                "深度学习在计算机视觉、自然语言处理等领域都有广泛应用。常见的深度学习模型包括卷积神经网络(CNN)、循环神经网络(RNN)和Transformer等。"
            ]
        elif "机器学习" in prompt or "算法" in prompt:
            mock_responses = [
                "机器学习是人工智能的核心技术之一，主要分为监督学习、无监督学习和强化学习三大类。监督学习使用标记数据训练模型，无监督学习从未标记数据中发现模式。",
                "常见的机器学习算法包括线性回归、决策树、支持向量机、随机森林等。选择合适的算法需要考虑数据特征、问题类型和性能要求。",
                "机器学习的关键步骤包括数据预处理、特征工程、模型选择、训练和评估。数据质量对模型性能有重要影响，特征工程往往决定了模型的上限。"
            ]
        elif "Python" in prompt or "编程" in prompt:
            mock_responses = [
                "Python是一种高级编程语言，语法简洁易读，在数据科学、机器学习、Web开发等领域广泛应用。Python的核心特点是简洁性和可读性。",
                "Python中的数据结构包括列表、元组、字典和集合。列表是可变的有序序列，元组是不可变的有序序列，字典是键值对的映射，集合是无序的唯一元素集合。",
                "Python的面向对象编程支持类和对象的概念。类是对象的模板，对象是类的实例。通过继承、封装和多态，可以构建复杂的程序结构。"
            ]
        else:
            # 根据问题类型生成更智能的回复
            if "什么是" in prompt or "定义" in prompt:
                mock_responses = [
                    "这是一个很好的概念性问题！让我从定义开始，然后逐步深入：\n\n1. **基本定义**：[核心概念解释]\n2. **关键特征**：[主要特点]\n3. **应用场景**：[实际用途]\n4. **学习建议**：建议您先掌握基础概念，然后通过实例加深理解。\n\n您还想了解这个概念的哪个方面呢？",
                    "很好的问题！这个概念在计算机科学中非常重要。\n\n**简单来说**：[通俗解释]\n**技术角度**：[专业解释]\n**实际应用**：[具体例子]\n\n建议您可以通过编程实践来加深理解，有什么具体的实现问题可以继续问我。"
                ]
            elif "如何" in prompt or "怎么" in prompt:
                mock_responses = [
                    "这是一个实践性很强的问题！让我为您提供一个系统的方法：\n\n**步骤分解**：\n1. [第一步]\n2. [第二步]\n3. [第三步]\n\n**注意事项**：\n- [重要提醒1]\n- [重要提醒2]\n\n**实践建议**：建议您先从简单的例子开始，逐步增加复杂度。",
                    "很实用的问题！我来给您一个完整的解决方案：\n\n**方法一**：[基础方法]\n**方法二**：[进阶方法]\n**最佳实践**：[推荐做法]\n\n建议您根据自己的水平选择合适的方法，有问题随时问我！"
                ]
            elif "为什么" in prompt or "原理" in prompt:
                mock_responses = [
                    "这是一个很深入的问题！让我从原理层面为您解释：\n\n**根本原因**：[核心原理]\n**技术背景**：[技术基础]\n**设计考虑**：[设计思路]\n\n**深入理解**：要真正掌握这个概念，建议您了解其历史发展和设计哲学。",
                    "很好的深度思考！这涉及到计算机科学的核心原理：\n\n**理论基础**：[理论支撑]\n**实现机制**：[具体机制]\n**优势分析**：[为什么这样设计]\n\n建议您结合具体例子来理解这些原理。"
                ]
            else:
                mock_responses = [
                    "这是一个很有价值的问题！让我为您详细分析：\n\n**问题分析**：[问题核心]\n**解决思路**：[解决方案]\n**扩展思考**：[相关知识]\n\n**学习建议**：建议您将理论与实践相结合，通过项目来巩固知识。",
                    "很好的问题！这体现了您对知识的深入思考。\n\n**核心要点**：[关键信息]\n**实际应用**：[应用场景]\n**进阶学习**：[深入方向]\n\n如果您想了解更多细节，可以继续提问！"
                ]

        content = random.choice(mock_responses)

        return AIResponse(
            content=content,
            usage={"total_tokens": len(content)},
            model="mock-model",
            timestamp=datetime.now()
        )

    async def call_deepseek_api(self, prompt: str) -> AIResponse:
        """调用DeepSeek API"""
        # 如果未配置API密钥，返回模拟回复
        if not AIConfig.DEEPSEEK_API_KEY:
            return self._get_mock_response(prompt)

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {AIConfig.DEEPSEEK_API_KEY}"
        }

        payload = {
            "model": AIConfig.DEFAULT_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": AIConfig.MAX_TOKENS,
            "temperature": AIConfig.TEMPERATURE
        }

        try:
            response = await self.client.post(
                AIConfig.DEEPSEEK_BASE_URL,
                headers=headers,
                json=payload
            )
            response.raise_for_status()

            data = response.json()
            content = data["choices"][0]["message"]["content"]
            usage = data.get("usage", {})

            return AIResponse(
                content=content,
                usage=usage,
                model=data.get("model", AIConfig.DEFAULT_MODEL),
                timestamp=datetime.now()
            )
        except Exception as e:
            print(f"DeepSeek API调用失败: {e}")
            return self._get_mock_response(prompt)

    async def call_qwen_api(self, prompt: str) -> AIResponse:
        """调用通义千问API"""
        if not AIConfig.QWEN_API_KEY:
            return self._get_mock_response(prompt)

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {AIConfig.QWEN_API_KEY}"
        }

        payload = {
            "model": AIConfig.VIDEO_MODEL,
            "input": {"messages": [{"role": "user", "content": prompt}]},
            "parameters": {
                "max_tokens": AIConfig.MAX_TOKENS,
                "temperature": AIConfig.TEMPERATURE
            }
        }

        try:
            response = await self.client.post(
                AIConfig.QWEN_BASE_URL,
                headers=headers,
                json=payload
            )
            response.raise_for_status()

            data = response.json()
            content = data["output"]["text"]
            usage = data.get("usage", {})

            return AIResponse(
                content=content,
                usage=usage,
                model=AIConfig.VIDEO_MODEL,
                timestamp=datetime.now()
            )
        except Exception as e:
            print(f"通义千问API调用失败: {e}")
            return self._get_mock_response(prompt)

    async def chat_with_student(self, question: str, ai_mode: str = "直接问答", 
                               chat_history: List = None) -> str:
        """与学生聊天"""
        if chat_history is None:
            chat_history = []

        # 根据AI模式构建提示词
        mode_prompts = {
            "直接问答": f"请直接、清晰地回答以下问题：{question}",
            "苏格拉底式引导": f"请扮演苏格拉底，不要直接回答问题，而是通过反问来引导我思考这个问题：{question}",
            "关联知识分析": f"请分析这个问题 '{question}' 主要涉及了哪些关联知识点，并对这些关联点进行简要说明。"
        }

        final_question = mode_prompts.get(ai_mode, question)

        # 调用AI服务
        response = await self.call_deepseek_api(final_question)
        return response.content

    async def generate_practice_question(self, topic: str) -> Dict[str, str]:
        """生成练习题 - 健壮的智能解析逻辑"""

        # 改进的Prompt：更明确的指令
        prompt = f"""
你是一位出题专家。请根据知识点"{topic}"生成一道练习题。

要求：
1. 题目应具有思考性，能够检验学生对该知识点的理解
2. 标准答案要详细且准确
3. 回复格式必须严格按照以下JSON格式：

{{
    "question_text": "这里是题目内容",
    "standard_answer": "这里是详细的标准答案"
}}

请直接返回JSON，不要包含任何其他文字。
"""

        response = await self.call_deepseek_api(prompt)
        result_text = response.content.strip()

        # 多层降级的智能解析逻辑
        json_data = None

        # 第一层：直接JSON解析
        try:
            json_data = json.loads(result_text)
            if self._validate_question_json(json_data):
                return self._clean_question_data(json_data, topic)
        except json.JSONDecodeError:
            pass

        # 第二层：提取代码块中的JSON
        if not json_data:
            code_block_patterns = [
                r'```json\s*({.*?})\s*```',
                r'```\s*({.*?})\s*```',
                r'`({.*?})`'
            ]

            for pattern in code_block_patterns:
                match = re.search(pattern, result_text, re.DOTALL | re.IGNORECASE)
                if match:
                    try:
                        json_str = match.group(1).strip()
                        json_data = json.loads(json_str)
                        if self._validate_question_json(json_data):
                            return self._clean_question_data(json_data, topic)
                    except:
                        continue

        # 第三层：查找任何大括号包裹的内容
        if not json_data:
            brace_matches = re.findall(r'{[^{}]*}', result_text, re.DOTALL)
            for match in brace_matches:
                try:
                    # 清理和标准化JSON字符串
                    json_str = self._normalize_json_string(match)
                    json_data = json.loads(json_str)
                    if self._validate_question_json(json_data):
                        return self._clean_question_data(json_data, topic)
                except:
                    continue

        # 第四层：关键词提取
        if not json_data:
            question_patterns = [
                r'题目[：:：]\s*[""""]?([^"""\n]+)[""""]?',
                r'question_text[：:：\s]*[""""]?([^"""\n]+)[""""]?',
                r'问题[：:：]\s*[""""]?([^"""\n]+)[""""]?'
            ]

            answer_patterns = [
                r'答案[：:：]\s*[""""]?([^"""\n]+)[""""]?',
                r'standard_answer[：:：\s]*[""""]?([^"""\n]+)[""""]?',
                r'标准答案[：:：]\s*[""""]?([^"""\n]+)[""""]?'
            ]

            question_text = self._extract_with_patterns(result_text, question_patterns)
            answer_text = self._extract_with_patterns(result_text, answer_patterns)

            if question_text and answer_text:
                json_data = {
                    "question_text": question_text,
                    "standard_answer": answer_text
                }
                return self._clean_question_data(json_data, topic)

        # 第五层：最后的默认题目
        return self._create_default_question(topic)

    def _validate_question_json(self, data: Dict) -> bool:
        """验证题目JSON的有效性"""
        if not isinstance(data, dict):
            return False

        required_keys = ["question_text", "standard_answer"]
        return all(key in data and isinstance(data[key], str) and data[key].strip() for key in required_keys)

    def _normalize_json_string(self, json_str: str) -> str:
        """标准化JSON字符串"""
        # 移除多余的空白字符
        json_str = re.sub(r'\s+', ' ', json_str.strip())

        # 处理单引号
        json_str = json_str.replace("'", '"')

        # 处理可能的换行符问题
        json_str = json_str.replace('\n', ' ').replace('\r', ' ')

        # 修复可能的键值对格式问题
        json_str = re.sub(r'(\w+)\s*:', r'"\1":', json_str)

        return json_str

    def _extract_with_patterns(self, text: str, patterns: List[str]) -> Optional[str]:
        """使用模式列表提取内容"""
        for pattern in patterns:
            match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if match:
                content = match.group(1).strip()
                if content:
                    return content
        return None

    def _clean_question_data(self, data: Dict, topic: str) -> Dict[str, str]:
        """清理和验证题目数据"""
        question_text = str(data.get("question_text", "")).strip()
        standard_answer = str(data.get("standard_answer", "")).strip()

        # 确保内容不为空
        if not question_text:
            question_text = f"请详细解释{topic}的核心概念和应用场景。"

        if not standard_answer:
            standard_answer = f"{topic}是一个重要的概念，需要从多个角度进行理解和掌握。"

        return {
            "question_text": question_text,
            "standard_answer": standard_answer
        }

    def _create_default_question(self, topic: str) -> Dict[str, str]:
        """创建默认题目"""
        return {
            "question_text": f"请详细阐述{topic}的核心概念、主要特点和实际应用场景。",
            "standard_answer": f"""关于{topic}：

1. **核心概念**：{topic}是[在此领域中的基本定义和核心思想]

2. **主要特点**：
   - 特点一：[具体描述]
   - 特点二：[具体描述]
   - 特点三：[具体描述]

3. **实际应用**：
   - 应用场景一：[具体说明]
   - 应用场景二：[具体说明]

4. **学习要点**：建议重点理解其原理，并通过实践加深认识。"""
        }

    async def evaluate_practice_answer(self, question: str, standard_answer: str,
                                     student_answer: str, topic: str = "") -> str:
        """评估练习答案 - 提供详细的教学反馈"""

        prompt = f"""
你是一位经验丰富的教学助手和智能导师。请对比标准答案和学生的回答，并提供一份内容饱满、富有建设性的详细反馈。

**练习信息：**
- 考察知识点：{topic if topic else "综合知识"}
- 题目：{question}
- 标准答案：{standard_answer}
- 学生回答：{student_answer}

**反馈要求：**
请按照以下结构提供详细的教学反馈：

1. **回答亮点分析**：首先指出学生回答中的优秀之处、正确理解的部分，给予积极鼓励

2. **知识掌握评估**：分析学生对该知识点的理解程度，是否抓住了核心概念

3. **不足之处指正**：具体指出回答中的错误、遗漏或不够准确的地方

4. **改进建议**：提供具体的学习建议，告诉学生如何提高和完善答案

5. **知识拓展**：补充相关的重要知识点，帮助学生建立更完整的知识体系

6. **学习指导**：给出后续学习的方向和建议

7. **综合评分**：给出1-10分的评分（10分为满分），并详细说明评分理由

**注意事项：**
- 语言要温和鼓励，既要指出问题也要给予肯定
- 反馈要具体详细，避免空泛的评价
- 要有教育价值，真正帮助学生提高
- 评分要公正合理，有明确的评分依据

请开始你的详细反馈：
"""

        response = await self.call_deepseek_api(prompt)
        return response.content

    async def generate_teaching_plan(self, topic: str, duration: int, 
                                   students_level: str) -> str:
        """生成教学计划"""
        prompt = f"""
        请为"{topic}"设计一个{duration}分钟的教学计划。
        学生水平：{students_level}

        请包含以下内容：
        1. 教学目标
        2. 教学重难点
        3. 教学过程（时间分配）
        4. 教学方法
        5. 教学评价
        """

        response = await self.call_deepseek_api(prompt)
        return response.content

    async def generate_mind_map(self, topic: str) -> Dict[str, Any]:
        """生成知识图谱"""
        prompt = f"""
        请为"{topic}"生成一个知识图谱。

        请以JSON格式返回，包含以下结构：
        {{
            "topic": "主题",
            "subtopics": [
                {{
                    "name": "子主题1",
                    "description": "描述",
                    "concepts": ["概念1", "概念2"]
                }},
                ...
            ]
        }}
        """

        response = await self.call_deepseek_api(prompt)

        try:
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]

            return json.loads(content)
        except json.JSONDecodeError:
            return {
                "topic": topic,
                "subtopics": [
                    {
                        "name": "基本概念",
                        "description": "基本概念和定义",
                        "concepts": ["概念1", "概念2"]
                    }
                ]
            }

    async def generate_exam_questions(self, topic: str, count: int, 
                                    difficulty: str, question_types: List[str]) -> List[Dict]:
        """生成考试题目"""
        prompt = f"""
        请为"{topic}"生成{count}道{difficulty}难度的考试题目。
        题目类型：{', '.join(question_types)}

        请以JSON数组格式返回，每个题目包含以下字段：
        - question_text: 题目内容
        - question_type: 题目类型
        - options: 选项（如果是选择题）
        - correct_answer: 正确答案
        - difficulty: 难度
        """

        response = await self.call_deepseek_api(prompt)

        try:
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]

            return json.loads(content)
        except json.JSONDecodeError:
            # 返回默认题目
            return [
                {
                    "question_text": f"请解释{topic}的基本概念。",
                    "question_type": "简答题",
                    "correct_answer": f"{topic}的基本概念是...",
                    "difficulty": difficulty
                }
            ]

    async def analyze_video(self, video_path: str) -> Dict[str, Any]:
        """分析视频内容"""
        # 这里简化实现，实际应用中可能需要先提取视频音频，然后转文字，再分析
        prompt = f"""
        请分析以下视频内容，提取关键知识点：

        视频路径：{video_path}

        请返回以下信息：
        1. 视频主题
        2. 关键知识点
        3. 教学重点和难点
        4. 建议的学习方法
        """

        response = await self.call_qwen_api(prompt)

        # 简化返回结果
        return {
            "video_path": video_path,
            "analysis": response.content,
            "key_points": ["知识点1", "知识点2"],
            "difficulty_points": ["难点1", "难点2"]
        }

    async def close(self):
        """关闭连接"""
        await self.client.aclose()


# 创建全局AI服务实例
ai_service = AIService()
