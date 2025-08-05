# 引入所有我们需要的库
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.vectorstores import Chroma
import os

# --- 配置区 ---
# PDF文件路径 (请替换为你自己的真实路径)
# 提示：如果PDF文件和这个脚本在同一个文件夹，可以直接写文件名 "嵌入式Linux开发实践教程.pdf"
PDF_PATH = "D:/eduagi/upload/d2l-zh.pdf"

# Embedding 模型路径 (之后我们会下载模型到这个路径)
# 推荐使用 BAAI/bge-large-zh-v1.5
EMBEDDING_MODEL_PATH = "D:/bge-large-zh-v1.5"

# 向量数据库存储路径
DB_PATH = "E:/chroma_db"


# --- 主程序 ---
def create_vector_db():
    """
    函数：读取PDF，分割文本，创建并持久化向量数据库
    """
    print("开始处理知识库文档...")

    # 1. 加载PDF
    if not os.path.exists(PDF_PATH):
        print(f"错误：找不到PDF文件，请检查路径配置：{PDF_PATH}")
        return

    loader = PyPDFLoader(PDF_PATH)
    documents = loader.load()
    print(f"成功加载 {len(documents)} 页文档。")

    # 2. 文本分割
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    texts = text_splitter.split_documents(documents)
    print(f"文档被分割成 {len(texts)} 个文本块。")

    # 3. 初始化并加载Embedding模型
    print(f"正在加载Embedding模型，路径：{EMBEDDING_MODEL_PATH}")
    if not os.path.exists(EMBEDDING_MODEL_PATH):
        print(f"错误：找不到Embedding模型，请先下载模型并配置正确路径：{EMBEDDING_MODEL_PATH}")
        print("你可以从 Hugging Face 下载 'BAAI/bge-large-zh-v1.5'")
        return

    embedding_model = HuggingFaceBgeEmbeddings(model_name=EMBEDDING_MODEL_PATH)
    print("Embedding模型加载成功。")

    # 4. 创建并持久化向量数据库
    print("正在创建向量数据库...")
    vectordb = Chroma.from_documents(documents=texts,
                                     embedding=embedding_model,
                                     persist_directory=DB_PATH)
    vectordb.persist()
    print(f"向量数据库创建成功，并已保存至：{DB_PATH}")


if __name__ == "__main__":
    # 当直接运行这个脚本时，执行create_vector_db函数
    create_vector_db()