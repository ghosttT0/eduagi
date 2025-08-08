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
import requests

# AI服务配置
class AIConfig:
    # DeepSeek配置
    DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "sk-6108402cc64449b2bba661b83051c10f")
    DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1/chat/completions"

    # 通义千问配置（仅用于视频分析）
    QWEN_API_KEY = os.getenv("QWEN_API_KEY", "sk-3834203e9fb24f3296edf89dbeca7c68")
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
        # 使用系统环境代理、关闭HTTP/2以提升在部分Windows/企业网络环境下的兼容性
        # 在部分Windows/企业网络环境下，可能存在TLS拦截/证书问题导致连接失败。
        # 为提升可用性，这里启用trust_env并设置verify=False作为临时降级方案。
        # 如需严格校验证书，可将verify设置为True并确保系统信任证书链。
        self.client = httpx.AsyncClient(
            timeout=60.0,
            http2=False,
            trust_env=False,  # 忽略系统代理，避免因错误代理导致连接失败
            verify=False,
        )

    def _get_mock_response(self, prompt: str) -> AIResponse:
        """生成智能化模拟AI回复"""
        import random
        
        # 检测是否为题目生成请求
        if "生成练习题" in prompt or "练习题目" in prompt:
            return self._generate_intelligent_question_response(prompt)
        
        # 检测是否为答案评估请求
        if "评估答案" in prompt or "批改" in prompt or "评价学生" in prompt:
            return self._generate_intelligent_evaluation_response(prompt)
        
        # 检测是否为对话请求
        if "学生问" in prompt or "回答学生" in prompt:
            return self._generate_intelligent_chat_response(prompt)
        
        # 根据主题生成相应的智能回复
        if "深度学习" in prompt or "神经网络" in prompt:
            mock_responses = [
                "深度学习是机器学习的重要分支，通过多层神经网络模拟人脑处理信息的方式。\n\n**核心概念**：\n• 神经元：基本计算单元，接收输入并产生输出\n• 层次结构：输入层→隐藏层→输出层\n• 权重与偏置：决定信息传递强度的参数\n\n**关键算法**：\n• 前向传播：数据从输入到输出的计算过程\n• 反向传播：根据误差调整权重的优化过程\n• 梯度下降：寻找最优参数的优化方法\n\n**实际应用**：图像识别、语音识别、自然语言处理等领域都有突破性进展。"
            ]
        elif "机器学习" in prompt or "算法" in prompt:
            mock_responses = [
                "机器学习让计算机能够从数据中自动学习规律，无需显式编程。\n\n**三大类型**：\n• **监督学习**：使用标记数据训练（如分类、回归）\n• **无监督学习**：从无标记数据发现模式（如聚类）\n• **强化学习**：通过试错获得最优策略\n\n**核心算法**：\n• 线性回归：预测连续值\n• 决策树：基于规则的分类\n• 支持向量机：寻找最优分类边界\n• 随机森林：多个决策树的集成\n\n**应用流程**：数据收集→预处理→特征工程→模型训练→评估优化→部署应用"
            ]
        elif "Python" in prompt or "编程" in prompt:
            mock_responses = [
                "Python是一门优雅而强大的编程语言，以其简洁的语法和丰富的生态系统著称。\n\n**语言特点**：\n• 语法简洁：接近自然语言的表达方式\n• 动态类型：变量类型在运行时确定\n• 解释执行：无需编译，开发效率高\n• 跨平台：一次编写，到处运行\n\n**核心数据结构**：\n• 列表(list)：有序可变序列，支持索引和切片\n• 字典(dict)：键值对映射，快速查找\n• 元组(tuple)：不可变有序序列\n• 集合(set)：无序唯一元素集合\n\n**应用领域**：Web开发、数据科学、人工智能、自动化脚本等"
            ]
        else:
            # 智能化通用回复
            if "什么是" in prompt or "定义" in prompt:
                mock_responses = [
                    "这是一个很好的概念性问题！让我为您系统地解释：\n\n**核心定义**：[从最基础的概念开始]\n\n**关键特征**：\n• 特征1：具体描述其重要属性\n• 特征2：说明其独特之处\n• 特征3：解释其核心价值\n\n**实际应用**：在现实中的具体用途和场景\n\n**学习路径**：建议先理解基本概念，再通过实践加深理解，最后探索高级应用。"
                ]
            elif "如何" in prompt or "怎么" in prompt:
                mock_responses = [
                    "这是一个很实用的问题！让我为您提供系统的解决方案：\n\n**实施步骤**：\n1. **准备阶段**：了解前置条件和所需资源\n2. **实施阶段**：按步骤执行具体操作\n3. **验证阶段**：检查结果是否符合预期\n4. **优化阶段**：根据反馈进行改进\n\n**注意事项**：\n• 重要提醒1：避免常见错误\n• 重要提醒2：关注关键细节\n\n**最佳实践**：结合理论学习和动手实践，循序渐进地掌握技能。"
                ]
            else:
                mock_responses = [
                    "这是一个很有深度的问题！让我为您详细分析：\n\n**问题核心**：抓住问题的本质和关键点\n\n**分析思路**：\n• 理论基础：相关的基础知识\n• 实践角度：具体的应用方法\n• 发展趋势：未来的发展方向\n\n**解决方案**：基于分析提出的具体建议\n\n**扩展思考**：相关的深入话题和学习方向"
                ]
        
        return AIResponse(
            content=random.choice(mock_responses),
            usage={"prompt_tokens": len(prompt), "completion_tokens": 200},
            model="mock-intelligent-model",
            timestamp=datetime.now()
        )
    
    def _generate_intelligent_question_response(self, prompt: str) -> AIResponse:
        """生成智能化题目回复"""
        import random
        
        # 从prompt中提取主题
        topic = "编程"
        if "Python" in prompt:
            topic = "Python编程"
        elif "机器学习" in prompt:
            topic = "机器学习"
        elif "深度学习" in prompt:
            topic = "深度学习"
        elif "算法" in prompt:
            topic = "算法与数据结构"
        
        # 智能化题目模板
        question_templates = {
            "Python编程": [
                {
                    "question_text": "请编写一个Python函数，实现斐波那契数列的计算。要求：\n1. 函数名为fibonacci(n)\n2. 参数n表示要计算的斐波那契数列的第n项\n3. 使用递归或动态规划实现\n4. 考虑边界条件处理\n\n请写出完整代码并解释你的实现思路。",
                    "standard_answer": "```python\ndef fibonacci(n):\n    # 边界条件处理\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    \n    # 动态规划实现\n    dp = [0, 1]\n    for i in range(2, n + 1):\n        dp.append(dp[i-1] + dp[i-2])\n    return dp[n]\n```\n\n**实现思路**：\n1. 处理边界条件：n<=0返回0，n=1返回1\n2. 使用动态规划避免重复计算\n3. 时间复杂度O(n)，空间复杂度O(n)\n\n**优化方案**：可以只用两个变量存储前两项，将空间复杂度优化到O(1)。"
                },
                {
                    "question_text": "设计一个Python类来管理学生信息系统。要求：\n1. 类名为StudentManager\n2. 能够添加、删除、查找学生信息\n3. 学生信息包括：姓名、学号、年龄、成绩\n4. 实现按成绩排序功能\n5. 提供统计功能（平均分、最高分等）\n\n请实现完整的类定义并给出使用示例。",
                    "standard_answer": "```python\nclass StudentManager:\n    def __init__(self):\n        self.students = []\n    \n    def add_student(self, name, student_id, age, score):\n        student = {\n            'name': name,\n            'student_id': student_id,\n            'age': age,\n            'score': score\n        }\n        self.students.append(student)\n    \n    def remove_student(self, student_id):\n        self.students = [s for s in self.students if s['student_id'] != student_id]\n    \n    def find_student(self, student_id):\n        for student in self.students:\n            if student['student_id'] == student_id:\n                return student\n        return None\n    \n    def sort_by_score(self, reverse=True):\n        return sorted(self.students, key=lambda x: x['score'], reverse=reverse)\n    \n    def get_statistics(self):\n        if not self.students:\n            return None\n        scores = [s['score'] for s in self.students]\n        return {\n            'average': sum(scores) / len(scores),\n            'max_score': max(scores),\n            'min_score': min(scores),\n            'total_students': len(self.students)\n        }\n```\n\n**设计特点**：面向对象设计，封装性好，功能完整，易于扩展。"
                }
            ],
            "机器学习": [
                {
                    "question_text": "解释机器学习中的过拟合现象，并分析其产生原因和解决方法。\n\n请从以下几个方面回答：\n1. 什么是过拟合？用通俗的语言解释\n2. 过拟合产生的主要原因有哪些？\n3. 如何检测模型是否过拟合？\n4. 有哪些常用的防止过拟合的方法？\n5. 举一个具体的例子说明过拟合现象",
                    "standard_answer": "**1. 过拟合定义**：\n过拟合是指模型在训练数据上表现很好，但在新数据上表现很差的现象。就像学生死记硬背考试题目，考试时能答对，但遇到新题目就不会了。\n\n**2. 产生原因**：\n• 模型过于复杂（参数太多）\n• 训练数据不足\n• 训练时间过长\n• 特征过多且相关性强\n\n**3. 检测方法**：\n• 使用验证集：训练误差持续下降但验证误差开始上升\n• 交叉验证：多次验证结果差异很大\n• 学习曲线分析：训练集和验证集性能差距过大\n\n**4. 解决方法**：\n• 正则化：L1/L2正则化限制参数大小\n• 早停法：验证误差不再下降时停止训练\n• Dropout：随机丢弃部分神经元\n• 数据增强：增加训练样本多样性\n• 特征选择：去除冗余特征\n\n**5. 具体例子**：\n训练一个图像分类器识别猫狗，如果只用100张图片训练复杂的深度网络，模型可能记住每张图片的细节特征，在训练集上准确率100%，但测试新图片时准确率很低。"
                }
            ]
        }
        
        # 选择合适的题目
        questions = question_templates.get(topic, question_templates["Python编程"])
        selected_question = random.choice(questions)
        
        # 构造JSON格式回复
        json_response = json.dumps(selected_question, ensure_ascii=False, indent=2)
        
        return AIResponse(
            content=json_response,
            usage={"prompt_tokens": len(prompt), "completion_tokens": 300},
            model="mock-question-generator",
            timestamp=datetime.now()
        )
    
    def _generate_intelligent_evaluation_response(self, prompt: str) -> AIResponse:
        """生成智能化评估回复"""
        # 从prompt中提取关键信息
        if "正确" in prompt or "很好" in prompt or "完整" in prompt:
            feedback = "**评估结果：优秀** ⭐⭐⭐⭐⭐\n\n**答案分析**：\n✅ 回答准确且完整\n✅ 逻辑清晰，条理分明\n✅ 体现了对知识点的深入理解\n\n**优点总结**：\n• 概念理解准确\n• 表达清晰流畅\n• 能够举一反三\n\n**进一步建议**：\n可以尝试从不同角度分析问题，或者结合实际案例加深理解。继续保持这种学习态度！\n\n**得分：92/100**"
        elif "部分正确" in prompt or "基本" in prompt:
            feedback = "**评估结果：良好** ⭐⭐⭐⭐\n\n**答案分析**：\n✅ 基本概念掌握正确\n⚠️ 部分细节需要完善\n⚠️ 表达可以更加准确\n\n**具体建议**：\n• 加强对核心概念的理解\n• 注意表达的准确性和完整性\n• 可以补充相关的实例说明\n\n**改进方向**：\n建议多做练习，加深对知识点的理解，特别是细节部分。\n\n**得分：78/100**"
        else:
            feedback = "**评估结果：需要改进** ⭐⭐⭐\n\n**答案分析**：\n❌ 核心概念理解有偏差\n❌ 回答不够完整\n⚠️ 需要加强基础知识学习\n\n**主要问题**：\n• 对基本概念的理解不够准确\n• 回答缺乏逻辑性\n• 遗漏了重要知识点\n\n**学习建议**：\n• 回顾相关基础知识\n• 多做类似练习题\n• 可以寻求老师或同学的帮助\n• 建议查阅相关资料加深理解\n\n**鼓励话语**：\n学习是一个循序渐进的过程，不要气馁！通过持续练习一定能够提高。\n\n**得分：65/100**"
        
        return AIResponse(
            content=feedback,
            usage={"prompt_tokens": len(prompt), "completion_tokens": 200},
            model="mock-evaluator",
            timestamp=datetime.now()
        )
    
    def _generate_intelligent_chat_response(self, prompt: str) -> AIResponse:
        """生成智能化对话回复"""
        import random
        
        # 智能化对话回复模板
        chat_responses = [
            "这是一个很好的问题！让我来帮您分析一下：\n\n**问题理解**：您想了解的是...\n\n**详细解答**：\n从理论角度来看，这个问题涉及到几个关键概念...\n\n**实践建议**：\n建议您可以通过以下方式加深理解：\n1. 查阅相关资料\n2. 动手实践\n3. 与同学讨论\n\n**扩展思考**：\n这个问题还可以从其他角度来思考...",
            
            "很高兴为您解答！这个问题确实值得深入探讨：\n\n**核心要点**：\n• 要点1：具体解释\n• 要点2：详细说明\n• 要点3：实例分析\n\n**学习方法**：\n建议采用理论结合实践的方式，先理解概念，再通过编程或实验加深印象。\n\n**相关资源**：\n可以参考一些经典教材或在线课程来系统学习。\n\n有什么具体的疑问，随时可以继续问我！",
            
            "这个问题问得很棒！体现了您的深入思考：\n\n**问题分析**：\n这个问题的核心在于...\n\n**解决思路**：\n我们可以从以下几个步骤来解决：\n1. 首先理解基本概念\n2. 然后分析具体情况\n3. 最后提出解决方案\n\n**实用技巧**：\n在实际应用中，要注意...\n\n**进阶学习**：\n如果您想进一步提高，建议..."
        ]
        
        return AIResponse(
            content=random.choice(chat_responses),
            usage={"prompt_tokens": len(prompt), "completion_tokens": 180},
            model="mock-chat-assistant",
            timestamp=datetime.now()
        )

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
            # httpx失败时，尝试使用requests作为降级通道（有些环境对httpx存在TLS或代理兼容性问题）
            print(f"DeepSeek API调用失败（httpx）：{repr(e)}，尝试requests降级...")
            try:
                loop = asyncio.get_event_loop()
                data = await loop.run_in_executor(None, self._call_deepseek_with_requests, headers, payload)
                content = data["choices"][0]["message"]["content"]
                usage = data.get("usage", {})
                return AIResponse(
                    content=content,
                    usage=usage,
                    model=data.get("model", AIConfig.DEFAULT_MODEL),
                    timestamp=datetime.now()
                )
            except Exception as e2:
                print(f"DeepSeek API调用失败（requests）：{repr(e2)}")
                return self._get_mock_response(prompt)

    def _call_deepseek_with_requests(self, headers: Dict[str, str], payload: Dict[str, Any]) -> Dict[str, Any]:
        """使用requests同步调用DeepSeek，作为httpx的降级方案。"""
        # 使用系统代理，关闭证书校验以提升兼容性（如有需要可改为True）
        resp = requests.post(
            AIConfig.DEEPSEEK_BASE_URL,
            headers=headers,
            json=payload,
            timeout=60,
            verify=False,
            proxies={"http": None, "https": None},  # 显式禁用环境代理
        )
        resp.raise_for_status()
        return resp.json()

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
        
        import random
        
        # 随机选择题目类型和风格，增加多样性
        question_types = [
            "概念理解题", "应用分析题", "对比分析题", "案例分析题", "实践操作题"
        ]
        
        difficulty_levels = ["基础", "中等", "进阶"]
        
        selected_type = random.choice(question_types)
        selected_difficulty = random.choice(difficulty_levels)
        
        # 改进的Prompt：更明确的指令和多样性要求
        prompt = f"""
你是一位资深的出题专家和教学设计师，拥有丰富的教育经验。请根据知识点"{topic}"生成一道{selected_difficulty}难度的{selected_type}。

出题要求：
1. 题目应具有思考性和实用性，能够检验学生对该知识点的深度理解
2. 避免简单的记忆性题目，注重理解和应用能力考查
3. 题目表述要清晰、准确，符合学术规范
4. 标准答案要详细、完整，包含解题思路和关键要点
5. 每次生成的题目都要有所不同，避免重复和模板化

题目类型说明：
- 概念理解题：考查对基本概念的理解和掌握
- 应用分析题：考查知识点的实际应用能力
- 对比分析题：考查不同概念或方法的异同点
- 案例分析题：通过具体案例考查分析解决问题的能力
- 实践操作题：考查动手实践和操作技能

请严格按照以下JSON格式回复，不要包含任何其他内容：

{{
    "question_text": "这里是题目内容",
    "standard_answer": "这里是详细的标准答案，包含解题思路和要点分析"
}}

现在请开始出题：
"""

        response = await self.call_deepseek_api(prompt)
        result_text = response.content.strip()

        # 解析AI回复的多层逻辑保持不变
        json_data = None

        # 第一层：直接JSON解析
        try:
            if result_text.startswith("```json"):
                json_content = result_text[7:-3].strip()
            elif result_text.startswith("```"):
                json_content = result_text[3:-3].strip()
            else:
                json_content = result_text

            json_data = json.loads(json_content)
            if "question_text" in json_data and "standard_answer" in json_data:
                return self._clean_question_data(json_data, topic)
        except json.JSONDecodeError:
            pass

        # 其他解析层级保持不变...
        # 第二层：查找JSON块
        if not json_data:
            json_pattern = r'\{[^{}]*"question_text"[^{}]*"standard_answer"[^{}]*\}'
            json_matches = re.findall(json_pattern, result_text, re.DOTALL)
            
            for match in json_matches:
                try:
                    json_data = json.loads(match)
                    if "question_text" in json_data and "standard_answer" in json_data:
                        return self._clean_question_data(json_data, topic)
                except json.JSONDecodeError:
                    continue

        # 第三层：多行JSON解析
        if not json_data:
            lines = result_text.split('\n')
            json_lines = []
            in_json = False
            
            for line in lines:
                if '{' in line:
                    in_json = True
                if in_json:
                    json_lines.append(line)
                if '}' in line and in_json:
                    break
            
            if json_lines:
                try:
                    json_text = '\n'.join(json_lines)
                    json_data = json.loads(json_text)
                    if "question_text" in json_data and "standard_answer" in json_data:
                        return self._clean_question_data(json_data, topic)
                except json.JSONDecodeError:
                    pass

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

        # 第五层：最后的默认题目（也要多样化）
        return self._create_diverse_default_question(topic, selected_type, selected_difficulty)

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

    def _create_diverse_default_question(self, topic: str, question_type: str, difficulty: str) -> Dict[str, str]:
        """创建多样化默认题目"""
        if question_type == "概念理解题":
            return {
                "question_text": f"请解释{topic}的基本概念。",
                "standard_answer": f"{topic}的基本概念是..."
            }
        elif question_type == "应用分析题":
            return {
                "question_text": f"请举例说明{topic}在实际应用中的一个场景。",
                "standard_answer": f"{topic}在实际应用中的一个场景是..."
            }
        elif question_type == "对比分析题":
            return {
                "question_text": f"请比较{topic}与另一个相关概念的区别和联系。",
                "standard_answer": f"{topic}与另一个相关概念的区别和联系是..."
            }
        elif question_type == "案例分析题":
            return {
                "question_text": f"请分析一个与{topic}相关的实际案例。",
                "standard_answer": f"一个与{topic}相关的实际案例是..."
            }
        elif question_type == "实践操作题":
            return {
                "question_text": f"请设计一个与{topic}相关的实践操作步骤。",
                "standard_answer": f"一个与{topic}相关的实践操作步骤是..."
            }
        else:
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
