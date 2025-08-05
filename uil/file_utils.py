# file_utils.py - 简化的文件上传工具
import os
import base64
from typing import Optional

def upload_file_simple(file_data: bytes, file_name: str) -> Optional[str]:
    """
    简化的文件上传功能
    暂时返回本地文件路径，后续可以集成其他云存储
    """
    try:
        # 创建上传目录
        upload_dir = "uploads"
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
        
        # 保存文件到本地
        file_path = os.path.join(upload_dir, file_name)
        with open(file_path, "wb") as f:
            f.write(file_data)
        
        # 返回文件路径（后续可以改为云存储URL）
        return f"/uploads/{file_name}"
        
    except Exception as e:
        print(f"文件上传失败: {str(e)}")
        return None

def upload_to_qiniu(file_data: bytes, file_name: str, max_retries: int = 3) -> Optional[str]:
    """
    兼容性函数 - 暂时使用简化版本
    """
    return upload_file_simple(file_data, file_name) 