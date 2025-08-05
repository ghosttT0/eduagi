"""
AutoGen替代LangChain的示例代码
AutoGen是一个更稳定、功能更强大的多智能体框架
"""

import autogen
from typing import List, Dict, Any
import json

class AutoGenManager:
    def __init__(self, openai_api_key: str):
        """初始化AutoGen管理器"""
        self.config_list = [
            {
                "model": "gpt-4",
                "api_key": openai_api_key,
            }
        ]
        
        # 配置LLM
        self.llm_config = {
            "config_list": self.config_list,
            "temperature": 0.7,
            "timeout": 120,
        }
        
        # 创建智能体
        self.user_proxy = autogen.UserProxyAgent(
            name="user_proxy",
            human_input_mode="NEVER",
            max_consecutive_auto_reply=10,
            is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
            code_execution_config={"work_dir": "workspace"},
            llm_config=self.llm_config,
            system_message="你是一个有用的AI助手，专门帮助用户解决编程和教育相关的问题。"
        )
        
        self.assistant = autogen.AssistantAgent(
            name="assistant",
            llm_config=self.llm_config,
            system_message="你是一个专业的编程和教育专家，能够提供详细的技术指导和教学建议。"
        )
        
        self.coder = autogen.AssistantAgent(
            name="coder",
            llm_config=self.llm_config,
            system_message="你是一个专业的程序员，擅长编写高质量的代码和解决技术问题。"
        )
        
        self.reviewer = autogen.AssistantAgent(
            name="reviewer",
            llm_config=self.llm_config,
            system_message="你是一个代码审查专家，能够检查代码质量并提供改进建议。"
        )

    async def chat_with_agents(self, message: str) -> str:
        """与多个智能体进行对话"""
        try:
            # 启动群聊
            chat_result = await self.user_proxy.a_initiate_chat(
                self.assistant,
                message=message,
                max_turns=5
            )
            
            # 提取回复内容
            if chat_result and hasattr(chat_result, 'chat_history'):
                return chat_result.chat_history[-1].get('content', '')
            return "对话完成"
            
        except Exception as e:
            return f"对话出错: {str(e)}"

    async def code_generation(self, requirements: str) -> Dict[str, Any]:
        """代码生成功能"""
        try:
            # 创建代码生成任务
            task = f"""
            请根据以下需求生成代码：
            {requirements}
            
            请提供：
            1. 代码实现
            2. 使用说明
            3. 测试建议
            """
            
            # 使用coder智能体生成代码
            code_result = await self.user_proxy.a_initiate_chat(
                self.coder,
                message=task,
                max_turns=3
            )
            
            # 使用reviewer智能体审查代码
            review_result = await self.user_proxy.a_initiate_chat(
                self.reviewer,
                message=f"请审查以下代码：\n{code_result.chat_history[-1].get('content', '')}",
                max_turns=2
            )
            
            return {
                "code": code_result.chat_history[-1].get('content', ''),
                "review": review_result.chat_history[-1].get('content', ''),
                "status": "success"
            }
            
        except Exception as e:
            return {
                "code": "",
                "review": "",
                "status": "error",
                "message": str(e)
            }

    async def teaching_assistant(self, question: str, subject: str) -> str:
        """教学助手功能"""
        try:
            # 创建教学任务
            task = f"""
            作为{subject}科目的教学助手，请回答以下问题：
            {question}
            
            请提供：
            1. 详细解释
            2. 相关示例
            3. 学习建议
            """
            
            # 使用assistant智能体回答
            result = await self.user_proxy.a_initiate_chat(
                self.assistant,
                message=task,
                max_turns=3
            )
            
            return result.chat_history[-1].get('content', '')
            
        except Exception as e:
            return f"教学助手出错: {str(e)}"

    async def multi_agent_discussion(self, topic: str) -> List[Dict[str, str]]:
        """多智能体讨论功能"""
        try:
            # 创建讨论任务
            task = f"""
            请就以下话题进行深入讨论：
            {topic}
            
            请从不同角度分析这个问题。
            """
            
            # 启动多智能体讨论
            discussion = await self.user_proxy.a_initiate_chat(
                [self.assistant, self.coder, self.reviewer],
                message=task,
                max_turns=6
            )
            
            # 整理讨论记录
            discussion_history = []
            for msg in discussion.chat_history:
                discussion_history.append({
                    "agent": msg.get("name", "unknown"),
                    "content": msg.get("content", ""),
                    "timestamp": msg.get("timestamp", "")
                })
            
            return discussion_history
            
        except Exception as e:
            return [{"agent": "error", "content": f"讨论出错: {str(e)}", "timestamp": ""}]

# 使用示例
async def main():
    """使用示例"""
    # 初始化AutoGen管理器
    autogen_manager = AutoGenManager("your-openai-api-key")
    
    # 1. 简单对话
    response = await autogen_manager.chat_with_agents("请解释什么是机器学习？")
    print("对话回复:", response)
    
    # 2. 代码生成
    code_result = await autogen_manager.code_generation("创建一个Python函数来计算斐波那契数列")
    print("代码生成结果:", code_result)
    
    # 3. 教学助手
    teaching_response = await autogen_manager.teaching_assistant(
        "什么是递归？", "计算机科学"
    )
    print("教学回复:", teaching_response)
    
    # 4. 多智能体讨论
    discussion = await autogen_manager.multi_agent_discussion("人工智能的未来发展")
    print("讨论记录:", discussion)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main()) 