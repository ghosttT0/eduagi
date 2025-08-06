from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import os
from pathlib import Path

from database import get_db, User
from api.auth import get_current_user
from services.file_service import file_service

# 创建路由器
files_router = APIRouter()

# Pydantic模型
class FileInfo(BaseModel):
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    mime_type: Optional[str] = None
    file_type: str
    storage_type: str
    url: str
    upload_time: str

class UploadResponse(BaseModel):
    success: bool
    message: str
    file_info: Optional[FileInfo] = None

@files_router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    file_type: str = Form("any"),
    storage_type: str = Form("local"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传文件"""
    
    try:
        # 上传文件
        file_info = await file_service.upload_file(
            file=file,
            file_type=file_type,
            storage_type=storage_type
        )
        
        return UploadResponse(
            success=True,
            message="文件上传成功",
            file_info=FileInfo(**file_info)
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")

@files_router.post("/upload/video", response_model=UploadResponse)
async def upload_video(
    file: UploadFile = File(...),
    storage_type: str = Form("local"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传视频文件"""
    
    if current_user.role not in ["教师", "管理员"]:
        raise HTTPException(status_code=403, detail="权限不足")
    
    try:
        file_info = await file_service.upload_file(
            file=file,
            file_type="video",
            storage_type=storage_type
        )
        
        return UploadResponse(
            success=True,
            message="视频上传成功",
            file_info=FileInfo(**file_info)
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"视频上传失败: {str(e)}")

@files_router.post("/upload/image", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    storage_type: str = Form("local"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传图片文件"""
    
    try:
        file_info = await file_service.upload_file(
            file=file,
            file_type="image",
            storage_type=storage_type
        )
        
        return UploadResponse(
            success=True,
            message="图片上传成功",
            file_info=FileInfo(**file_info)
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"图片上传失败: {str(e)}")

@files_router.post("/upload/document", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    storage_type: str = Form("local"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传文档文件"""
    
    try:
        file_info = await file_service.upload_file(
            file=file,
            file_type="document",
            storage_type=storage_type
        )
        
        return UploadResponse(
            success=True,
            message="文档上传成功",
            file_info=FileInfo(**file_info)
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文档上传失败: {str(e)}")

@files_router.get("/list", response_model=List[FileInfo])
async def list_files(
    file_type: str = "any",
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取文件列表"""
    
    try:
        files = file_service.list_files(file_type=file_type, limit=limit)
        return [FileInfo(**file_info) for file_info in files]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取文件列表失败: {str(e)}")

@files_router.get("/download/{file_type}/{filename}")
async def download_file(
    file_type: str,
    filename: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """下载文件"""
    
    # 构建文件路径
    file_path = Path("uploads") / f"{file_type}s" / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type='application/octet-stream'
    )

@files_router.delete("/delete/{file_type}/{filename}")
async def delete_file(
    file_type: str,
    filename: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除文件"""
    
    if current_user.role not in ["教师", "管理员"]:
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 构建文件路径
    file_path = Path("uploads") / f"{file_type}s" / filename
    
    try:
        success = file_service.delete_local_file(str(file_path))
        if success:
            return {"success": True, "message": "文件删除成功"}
        else:
            raise HTTPException(status_code=404, detail="文件不存在或删除失败")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")

@files_router.get("/info/{file_type}/{filename}")
async def get_file_info(
    file_type: str,
    filename: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取文件信息"""
    
    # 构建文件路径
    file_path = Path("uploads") / f"{file_type}s" / filename
    
    file_info = file_service.get_file_info(str(file_path))
    if not file_info:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return file_info

# 七牛云相关接口
@files_router.post("/qiniu/upload", response_model=UploadResponse)
async def upload_to_qiniu(
    file: UploadFile = File(...),
    file_type: str = Form("any"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传文件到七牛云"""
    
    if current_user.role not in ["教师", "管理员"]:
        raise HTTPException(status_code=403, detail="权限不足")
    
    try:
        file_info = await file_service.upload_to_qiniu(
            file=file,
            file_type=file_type
        )
        
        return UploadResponse(
            success=True,
            message="文件上传到七牛云成功",
            file_info=FileInfo(**file_info)
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"七牛云上传失败: {str(e)}")

@files_router.get("/qiniu/token")
async def get_qiniu_upload_token(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取七牛云上传token（前端直传用）"""
    
    if current_user.role not in ["教师", "管理员"]:
        raise HTTPException(status_code=403, detail="权限不足")
    
    try:
        if not file_service.qiniu_auth:
            raise HTTPException(status_code=500, detail="七牛云服务未配置")
        
        from services.file_service import FileConfig
        
        # 生成上传token，有效期1小时
        token = file_service.qiniu_auth.upload_token(
            FileConfig.QINIU_BUCKET_NAME, 
            None, 
            3600
        )
        
        return {
            "token": token,
            "domain": FileConfig.QINIU_DOMAIN,
            "bucket": FileConfig.QINIU_BUCKET_NAME,
            "expires": 3600
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取上传token失败: {str(e)}")

# 静态文件服务（用于本地文件访问）
@files_router.get("/uploads/{file_type}/{filename}")
async def serve_uploaded_file(file_type: str, filename: str):
    """提供上传文件的访问服务"""
    
    file_path = Path("uploads") / f"{file_type}s" / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return FileResponse(path=str(file_path))
