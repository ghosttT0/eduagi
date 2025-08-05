# utils.py (升级为带记忆的对话链)
import os
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
    """
    加载并缓存带记忆的RAG对话链。
    """
    print("--- 正在加载带记忆的AI核心组件... ---")

    embedding_model = HuggingFaceEmbeddings(
        model_name=os.getenv("EMBEDDING_MODEL_PATH"),
        encode_kwargs={'normalize_embeddings': True}
    )
    vectordb = Chroma(
        persist_directory=os.getenv("DB_PATH"),
        embedding_function=embedding_model
    )
    llm = ChatOpenAI(
        openai_api_key=os.getenv("DEEPSEEK_API_KEY"),
        openai_api_base="https://api.deepseek.com/v1",
        model_name="deepseek-chat", temperature=0.7
    )

    # 创建一个对话记忆缓冲区
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True
    )

    # 创建带记忆的对话检索链
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectordb.as_retriever(),
        memory=memory
    )
    print("--- 带记忆的AI核心组件加载完毕 ---")
    return chain