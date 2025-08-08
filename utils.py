"""RAG 对话工具

提供一个带记忆的 ConversationalRetrievalChain，自动处理环境变量兜底、
向量库目录创建与更清晰的错误提示。
"""

import os
import pathlib
import streamlit as st
from dotenv import load_dotenv
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI


load_dotenv()


@st.cache_resource
def load_conversational_chain():
    """加载并缓存带记忆的RAG对话链。

    环境变量（支持兜底）：
    - DEEPSEEK_API_KEY: DeepSeek 密钥（必须）
    - EMBEDDING_MODEL_PATH: HuggingFace 向量模型（默认 all-MiniLM-L6-v2）
    - DB_PATH: Chroma 向量库目录（默认 ./data/chroma）
    - RETRIEVER_TOP_K: 检索条数（默认 4）
    - LLM_TEMPERATURE: 生成温度（默认 0.7）
    - LLM_MAX_TOKENS: 最大生成长度（可选）
    """
    print("--- 正在加载带记忆的AI核心组件... ---")

    # 读取配置并提供兜底
    deepseek_api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    if not deepseek_api_key:
        st.error("未配置 DEEPSEEK_API_KEY，请在 backend/.env 中设置后重试。")
        raise RuntimeError("DEEPSEEK_API_KEY missing")

    embedding_model_name = (
        os.getenv("EMBEDDING_MODEL_PATH", "sentence-transformers/all-MiniLM-L6-v2").strip()
    )
    db_path = pathlib.Path(os.getenv("DB_PATH", "data/chroma").strip() or "data/chroma")
    db_path.mkdir(parents=True, exist_ok=True)
    retriever_top_k = int(os.getenv("RETRIEVER_TOP_K", "4"))
    llm_temperature = float(os.getenv("LLM_TEMPERATURE", "0.7"))
    llm_max_tokens_env = os.getenv("LLM_MAX_TOKENS")
    llm_kwargs = {
        "model_name": "deepseek-chat",
        "temperature": llm_temperature,
        "openai_api_base": "https://api.deepseek.com/v1",
        "openai_api_key": deepseek_api_key,
        "max_retries": 2,
        "request_timeout": 60,
    }
    if llm_max_tokens_env and llm_max_tokens_env.isdigit():
        llm_kwargs["max_tokens"] = int(llm_max_tokens_env)

    # 构建组件
    embedding_model = HuggingFaceEmbeddings(
        model_name=embedding_model_name,
        encode_kwargs={"normalize_embeddings": True},
    )
    vectordb = Chroma(
        persist_directory=str(db_path),
        embedding_function=embedding_model,
    )
    llm = ChatOpenAI(**llm_kwargs)

    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
    )

    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectordb.as_retriever(search_kwargs={"k": retriever_top_k}),
        memory=memory,
    )
    print(
        f"--- 带记忆的AI核心组件加载完毕 | emb='{embedding_model_name}' | db='{db_path}' | top_k={retriever_top_k} ---"
    )
    return chain