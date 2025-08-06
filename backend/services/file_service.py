"""
文件上传和管理服务
支持本地存储和七牛云存储
"""

import os
import uuid
import shutil
from typing import Optional, Dict, Any, List
from fastapi import UploadFile, HTTPException
from pathlib import Path
import mimetypes
from datetime import datetime

# 七牛云配置（如果需要）
try:
    from qiniu import Auth, put_file, put_data
    QINIU_AVAILABLE = True
except ImportError:
    QINIU_AVAILABLE = False

class FileConfig:
    # 本地存储配置
    UPLOAD_DIR = "uploads"
    MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
    ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"}
    ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"}
    ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"}
    
    # 七牛云配置
    QINIU_ACCESS_KEY = os.getenv("QINIU_ACCESS_KEY", "")
    QINIU_SECRET_KEY = os.getenv("QINIU_SECRET_KEY", "")
    QINIU_BUCKET_NAME = os.getenv("QINIU_BUCKET_NAME", "")
    QINIU_DOMAIN = os.getenv("QINIU_DOMAIN", "")

class FileService:
    """文件服务类"""
    
    def __init__(self):
        # 确保上传目录存在
        self.upload_dir = Path(FileConfig.UPLOAD_DIR)
        self.upload_dir.mkdir(exist_ok=True)
        
        # 创建子目录
        (self.upload_dir / "videos").mkdir(exist_ok=True)
        (self.upload_dir / "images").mkdir(exist_ok=True)
        (self.upload_dir / "documents").mkdir(exist_ok=True)
        (self.upload_dir / "temp").mkdir(exist_ok=True)
        
        # 初始化七牛云
        if QINIU_AVAILABLE and FileConfig.QINIU_ACCESS_KEY:
            self.qiniu_auth = Auth(FileConfig.QINIU_ACCESS_KEY, FileConfig.QINIU_SECRET_KEY)
        else:
            self.qiniu_auth = None
    
    def validate_file(self, file: UploadFile, file_type: str = "any") -> bool:
        """验证文件"""
        
        # 检查文件大小
        if hasattr(file, 'size') and file.size > FileConfig.MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="文件大小超过限制")
        
        # 检查文件扩展名
        file_ext = Path(file.filename).suffix.lower()
        
        if file_type == "video":
            allowed_extensions = FileConfig.ALLOWED_VIDEO_EXTENSIONS
        elif file_type == "image":
            allowed_extensions = FileConfig.ALLOWED_IMAGE_EXTENSIONS
        elif file_type == "document":
            allowed_extensions = FileConfig.ALLOWED_DOCUMENT_EXTENSIONS
        else:
            allowed_extensions = (
                FileConfig.ALLOWED_VIDEO_EXTENSIONS |
                FileConfig.ALLOWED_IMAGE_EXTENSIONS |
                FileConfig.ALLOWED_DOCUMENT_EXTENSIONS
            )
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"不支持的文件类型: {file_ext}"
            )
        
        return True
    
    def generate_filename(self, original_filename: str) -> str:
        """生成唯一文件名"""
        file_ext = Path(original_filename).suffix.lower()
        unique_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{timestamp}_{unique_id}{file_ext}"
    
    async def save_file_local(self, file: UploadFile, file_type: str = "any") -> Dict[str, Any]:
        """保存文件到本地"""
        
        # 验证文件
        self.validate_file(file, file_type)
        
        # 确定保存目录
        if file_type == "video":
            save_dir = self.upload_dir / "videos"
        elif file_type == "image":
            save_dir = self.upload_dir / "images"
        elif file_type == "document":
            save_dir = self.upload_dir / "documents"
        else:
            save_dir = self.upload_dir / "temp"
        
        # 生成文件名
        filename = self.generate_filename(file.filename)
        file_path = save_dir / filename
        
        # 保存文件
        try:
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # 获取文件信息
            file_size = os.path.getsize(file_path)
            mime_type = mimetypes.guess_type(str(file_path))[0]
            
            return {
                "filename": filename,
                "original_filename": file.filename,
                "file_path": str(file_path),
                "file_size": file_size,
                "mime_type": mime_type,
                "file_type": file_type,
                "storage_type": "local",
                "url": f"/uploads/{file_type}s/{filename}",
                "upload_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            # 如果保存失败，删除可能创建的文件
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")
    
    async def upload_to_qiniu(self, file: UploadFile, file_type: str = "any") -> Dict[str, Any]:
        """上传文件到七牛云"""
        
        if not self.qiniu_auth:
            raise HTTPException(status_code=500, detail="七牛云服务未配置")
        
        # 验证文件
        self.validate_file(file, file_type)
        
        # 生成文件名
        filename = self.generate_filename(file.filename)
        key = f"{file_type}s/{filename}"
        
        # 生成上传token
        token = self.qiniu_auth.upload_token(FileConfig.QINIU_BUCKET_NAME, key, 3600)
        
        try:
            # 读取文件内容
            content = await file.read()
            
            # 上传到七牛云
            ret, info = put_data(token, key, content)
            
            if info.status_code == 200:
                # 构建访问URL
                url = f"http://{FileConfig.QINIU_DOMAIN}/{key}"
                
                return {
                    "filename": filename,
                    "original_filename": file.filename,
                    "file_path": key,
                    "file_size": len(content),
                    "mime_type": mimetypes.guess_type(file.filename)[0],
                    "file_type": file_type,
                    "storage_type": "qiniu",
                    "url": url,
                    "upload_time": datetime.now().isoformat(),
                    "qiniu_key": key,
                    "qiniu_hash": ret.get("hash", "")
                }
            else:
                raise HTTPException(
                    status_code=500, 
                    detail=f"七牛云上传失败: {info.text_body}"
                )
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")
    
    async def upload_file(self, file: UploadFile, file_type: str = "any", 
                         storage_type: str = "local") -> Dict[str, Any]:
        """上传文件（统一接口）"""
        
        if storage_type == "qiniu" and self.qiniu_auth:
            return await self.upload_to_qiniu(file, file_type)
        else:
            return await self.save_file_local(file, file_type)
    
    def delete_local_file(self, file_path: str) -> bool:
        """删除本地文件"""
        try:
            path = Path(file_path)
            if path.exists() and path.is_file():
                path.unlink()
                return True
            return False
        except Exception:
            return False
    
    def delete_qiniu_file(self, qiniu_key: str) -> bool:
        """删除七牛云文件"""
        if not self.qiniu_auth:
            return False
        
        try:
            from qiniu import BucketManager
            bucket_manager = BucketManager(self.qiniu_auth)
            ret, info = bucket_manager.delete(FileConfig.QINIU_BUCKET_NAME, qiniu_key)
            return info.status_code == 200
        except Exception:
            return False
    
    def get_file_info(self, file_path: str) -> Optional[Dict[str, Any]]:
        """获取文件信息"""
        try:
            path = Path(file_path)
            if not path.exists():
                return None
            
            stat = path.stat()
            mime_type = mimetypes.guess_type(str(path))[0]
            
            return {
                "filename": path.name,
                "file_path": str(path),
                "file_size": stat.st_size,
                "mime_type": mime_type,
                "created_time": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified_time": datetime.fromtimestamp(stat.st_mtime).isoformat()
            }
        except Exception:
            return None
    
    def list_files(self, file_type: str = "any", limit: int = 100) -> List[Dict[str, Any]]:
        """列出文件"""
        files = []
        
        if file_type == "any":
            search_dirs = ["videos", "images", "documents"]
        else:
            search_dirs = [f"{file_type}s"]
        
        for dir_name in search_dirs:
            dir_path = self.upload_dir / dir_name
            if dir_path.exists():
                for file_path in dir_path.iterdir():
                    if file_path.is_file():
                        file_info = self.get_file_info(str(file_path))
                        if file_info:
                            file_info["file_type"] = dir_name[:-1]  # 去掉复数s
                            file_info["url"] = f"/uploads/{dir_name}/{file_path.name}"
                            files.append(file_info)
        
        # 按修改时间排序，最新的在前
        files.sort(key=lambda x: x["modified_time"], reverse=True)
        
        return files[:limit]

# 创建全局文件服务实例
file_service = FileService()
