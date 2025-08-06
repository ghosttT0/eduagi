"""
AI服务集成模块
集成通义千问等AI服务，提供智能教学设计、知识图谱生成、智能出题、视频分析等功能
"""

import json
import asyncio
from typing import Dict, List, Any, Optional
import httpx
from pydantic import BaseModel
import os
from datetime import datetime

# AI服务配置
class AIConfig:
    # 通义千问配置
    QWEN_API_KEY = os.getenv("QWEN_API_KEY", "")
    QWEN_BASE_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
    
    # 模型配置
    DEFAULT_MODEL = "qwen-turbo"
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
        
    async def call_qwen_api(self, prompt: str, **kwargs) -> AIResponse:
        """调用通义千问API"""
        
        headers = {
            "Authorization": f"Bearer {AIConfig.QWEN_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": kwargs.get("model", AIConfig.DEFAULT_MODEL),
            "input": {
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            },
            "parameters": {
                "max_tokens": kwargs.get("max_tokens", AIConfig.MAX_TOKENS),
                "temperature": kwargs.get("temperature", AIConfig.TEMPERATURE)
            }
        }
        
        try:
            response = await self.client.post(
                AIConfig.QWEN_BASE_URL,
                headers=headers,
                json=data
            )
            response.raise_for_status()
            
            result = response.json()
            
            if result.get("output") and result["output"].get("text"):
                return AIResponse(
                    content=result["output"]["text"],
                    usage=result.get("usage", {}),
                    model=data["model"],
                    timestamp=datetime.now()
                )
            else:
                raise Exception(f"AI API返回异常: {result}")
                
        except Exception as e:
            # 如果API调用失败，返回模拟响应
            return AIResponse(
                content=f"AI服务暂时不可用，这是一个模拟响应。原始请求：{prompt[:100]}...",
                usage={"total_tokens": 0},
                model=data["model"],
                timestamp=datetime.now()
            )
    
    async def generate_teaching_plan(self, course_name: str, chapter: str, topic: str = None, 
                                   class_hours: int = 2, teaching_time: int = 90) -> Dict[str, Any]:
        """生成教学计划"""
        
        topic_text = topic if topic else f"{course_name} - {chapter} 整体大纲"
        
        prompt = f"""
请为以下教学内容生成专业教案：

课程名称：{course_name}
章节：{chapter}
教学主题：{topic_text}
课时：{class_hours}
授课时间：{teaching_time}分钟

请生成包含以下内容的JSON格式教案：
{{
    "title": "教案标题",
    "objectives": ["教学目标1", "教学目标2", "教学目标3"],
    "key_points": ["重点1", "重点2", "重点3"],
    "difficulties": ["难点1", "难点2"],
    "teaching_methods": ["方法1", "方法2", "方法3"],
    "content": "详细教学内容，包括引入、讲解、练习、总结等环节",
    "assessment": "评估方案，包括课堂提问、作业、考试等",
    "resources": ["教学资源1", "教学资源2"],
    "homework": "课后作业安排"
}}

请确保内容专业、详细、实用。
"""
        
        response = await self.call_qwen_api(prompt)
        
        try:
            # 尝试解析JSON
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
            
            teaching_plan = json.loads(content)
            return teaching_plan
        except json.JSONDecodeError:
            # 如果解析失败，返回结构化的默认内容
            return {
                "title": f"{course_name} - {chapter}教案",
                "objectives": ["掌握基本概念", "理解核心原理", "能够实际应用"],
                "key_points": ["概念定义", "原理分析", "应用场景"],
                "difficulties": ["理论理解", "实践应用"],
                "teaching_methods": ["讲授法", "案例分析", "实践操作"],
                "content": f"关于{topic_text}的详细教学内容...\n\n{response.content}",
                "assessment": "课堂提问、作业评估、实践考核",
                "resources": ["教材", "课件", "实验环境"],
                "homework": "完成相关练习题和实践作业"
            }
    
    async def generate_mindmap(self, topic: str, description: str = None) -> Dict[str, Any]:
        """生成思维导图"""
        
        prompt = f"""
请为主题"{topic}"生成一个结构化的思维导图。

{f"描述：{description}" if description else ""}

请生成JSON格式的思维导图数据，结构如下：
{{
    "name": "主题名称",
    "children": [
        {{
            "name": "分支1",
            "children": [
                {{"name": "子节点1"}},
                {{"name": "子节点2"}},
                {{"name": "子节点3"}}
            ]
        }},
        {{
            "name": "分支2", 
            "children": [
                {{"name": "子节点1"}},
                {{"name": "子节点2"}}
            ]
        }}
    ]
}}

请确保思维导图层次清晰，内容丰富，至少包含3个主要分支，每个分支至少3个子节点。
"""
        
        response = await self.call_qwen_api(prompt)
        
        try:
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
            
            mindmap_data = json.loads(content)
            return mindmap_data
        except json.JSONDecodeError:
            # 返回默认的思维导图结构
            return {
                "name": topic,
                "children": [
                    {
                        "name": "基本概念",
                        "children": [
                            {"name": "定义"},
                            {"name": "特点"},
                            {"name": "分类"}
                        ]
                    },
                    {
                        "name": "核心原理",
                        "children": [
                            {"name": "工作机制"},
                            {"name": "算法流程"},
                            {"name": "技术要点"}
                        ]
                    },
                    {
                        "name": "实际应用",
                        "children": [
                            {"name": "应用场景"},
                            {"name": "案例分析"},
                            {"name": "发展趋势"}
                        ]
                    }
                ]
            }
    
    async def generate_exam_questions(self, exam_scope: str, num_mcq: int = 5, 
                                    num_saq: int = 3, num_code: int = 1) -> Dict[str, Any]:
        """生成考试题目"""
        
        prompt = f"""
请根据考试范围"{exam_scope}"生成试卷，包含：
- {num_mcq}道选择题
- {num_saq}道简答题  
- {num_code}道编程题

请生成JSON格式的试卷数据：
{{
    "title": "试卷标题",
    "questions": [
        {{
            "type": "multiple_choice",
            "question_text": "题目内容",
            "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
            "answer": "A",
            "explanation": "答案解析"
        }},
        {{
            "type": "short_answer", 
            "question_text": "题目内容",
            "answer": "参考答案",
            "points": 10
        }},
        {{
            "type": "programming",
            "question_text": "编程题目描述",
            "answer": "参考代码",
            "test_cases": ["测试用例1", "测试用例2"],
            "points": 20
        }}
    ]
}}
"""
        
        response = await self.call_qwen_api(prompt)
        
        try:
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
            
            exam_data = json.loads(content)
            return exam_data
        except json.JSONDecodeError:
            # 返回默认的试卷结构
            return {
                "title": f"{exam_scope}考试试卷",
                "questions": [
                    {
                        "type": "multiple_choice",
                        "question_text": f"关于{exam_scope}，以下说法正确的是？",
                        "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
                        "answer": "A",
                        "explanation": "这是正确答案的解析"
                    }
                ]
            }
    
    async def analyze_video(self, video_title: str, video_description: str = None) -> str:
        """分析视频内容"""
        
        prompt = f"""
请对视频"{video_title}"进行AI分析。

{f"视频描述：{video_description}" if video_description else ""}

请从以下几个方面进行分析：
1. 核心主题和内容概要
2. 主要知识点梳理
3. 学习重点和难点
4. 适合的学习对象
5. 学习建议和方法
6. 相关知识扩展

请提供详细、专业的分析报告。
"""
        
        response = await self.call_qwen_api(prompt)
        return response.content
    
    async def chat_with_student(self, question: str, ai_mode: str = "直接问答", 
                              chat_history: List[tuple] = None) -> str:
        """与学生对话"""
        
        mode_prompts = {
            "直接问答": "请直接、清晰地回答学生的问题。",
            "苏格拉底式引导": "请扮演苏格拉底，不要直接回答问题，而是通过反问来引导学生思考。",
            "关联知识分析": "请分析这个问题主要涉及了哪些关联知识点，并对这些关联点进行简要说明。"
        }
        
        context = ""
        if chat_history:
            context = "\n\n对话历史：\n"
            for q, a in chat_history[-5:]:  # 只取最近5轮对话
                context += f"学生：{q}\nAI：{a}\n\n"
        
        prompt = f"""
{mode_prompts.get(ai_mode, mode_prompts["直接问答"])}

{context}

学生问题：{question}

请提供有帮助的回答。
"""
        
        response = await self.call_qwen_api(prompt)
        return response.content
    
    async def generate_practice_question(self, topic: str) -> Dict[str, str]:
        """生成练习题"""
        
        prompt = f"""
请为主题"{topic}"生成一道练习题。

要求：
1. 题目要有一定的思考性和实用性
2. 提供标准答案
3. 适合学生练习和巩固知识

请生成JSON格式：
{{
    "question_text": "题目内容",
    "standard_answer": "标准答案"
}}
"""
        
        response = await self.call_qwen_api(prompt)
        
        try:
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
            
            question_data = json.loads(content)
            return question_data
        except json.JSONDecodeError:
            return {
                "question_text": f"请解释{topic}的核心概念和应用场景。",
                "standard_answer": f"{topic}是一个重要的概念，其核心在于..."
            }
    
    async def evaluate_practice_answer(self, question: str, standard_answer: str, 
                                     student_answer: str) -> str:
        """评估练习答案"""
        
        prompt = f"""
请评估学生的练习答案：

题目：{question}
标准答案：{standard_answer}
学生答案：{student_answer}

请从以下方面进行评估：
1. 答案的正确性
2. 理解的深度
3. 表达的清晰度
4. 改进建议
5. 评分（1-10分）

请提供详细的反馈。
"""
        
        response = await self.call_qwen_api(prompt)
        return response.content

# 创建全局AI服务实例
ai_service = AIService()
