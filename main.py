# main.py (最终稳定版)
import os
from dotenv import load_dotenv

# --- 1. 初始化与配置 ---
print("正在加载环境变量...")
load_dotenv()

# --- 配置区 ---
# 这个脚本将专门使用 DeepSeek 模型
EMBEDDING_MODEL_PATH = "D:/bge-large-zh-v1.5"

# 向量数据库存储路径
DB_PATH = "E:/chroma_db"

# --- 2. 导入模块 ---
from langchain.chains import RetrievalQA
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI  # 我们将使用这个最稳定的类


def main():
    """主函数，包含加载、创建链和问答循环的全部逻辑"""

    # --- 3. 加载核心组件 ---
    print("正在加载Embedding模型...")
    embedding_model = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_PATH,
                                            encode_kwargs={'normalize_embeddings': True})

    print("正在加载向量数据库...")
    vectordb = Chroma(persist_directory=DB_PATH, embedding_function=embedding_model)

    print("准备加载 DeepSeek 模型 (通过OpenAI接口)...")

    deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
    if not deepseek_api_key:
        print("错误：未找到DEEPSEEK_API_KEY，请检查.env文件。")
        return

    # !!! 核心部分：使用 ChatOpenAI 类来调用 DeepSeek API !!!
    llm = ChatOpenAI(
        openai_api_key=deepseek_api_key,  # <-- 这里传入的是 DeepSeek 的 Key
        openai_api_base="https://api.deepseek.com/v1",  # <-- 这里指向 DeepSeek 的服务器地址
        model_name="deepseek-chat",  # <-- 这里使用 DeepSeek 的模型名
        temperature=0.5
    )
    print("DeepSeek 模型加载成功！")

    # --- 4. 构建RAG QA链 ---
    print("正在构建RAG问答链...")
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=vectordb.as_retriever(),
        chain_type="stuff"
    )
    print("RAG问答链构建完毕！\n---")

    # --- 5. 问答交互循环 ---
    while True:
        question = input("请输入您的问题 (输入'exit'退出): ")
        if question.lower() == "exit":
            print("感谢使用，再见！")
            break
        if not question.strip():
            continue

        print("\n正在思考中...")
        try:
            response = qa_chain.invoke(question)
            print("\nAI 回答:")
            print(response['result'])
            print("\n---")
        except Exception as e:
            print(f"请求出错了，错误信息: {e}")


if __name__ == "__main__":
    main()