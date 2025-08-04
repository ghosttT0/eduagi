from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import get_db, User, SystemConfig
from api.auth import get_current_user

# 创建路由器
manage_router = APIRouter()

# Pydantic模型
class SystemConfigResponse(BaseModel):
    key: str
    value: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True

@manage_router.get("/system-info")
async def get_system_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取系统信息"""
    # 检查权限
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")
    
    # TODO: 实现系统信息获取逻辑
    return {
        "version": "1.0.0",
        "status": "running",
        "total_users": 0,
        "total_resources": 0
    }

@manage_router.get("/configs", response_model=List[SystemConfigResponse])
async def get_system_configs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取系统配置"""
    # 检查权限
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")
    
    configs = db.query(SystemConfig).all()
    return [SystemConfigResponse.from_orm(config) for config in configs]

@manage_router.put("/configs/{key}")
async def update_system_config(
    key: str,
    value: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新系统配置"""
    # 检查权限
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")
    
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if not config:
        raise HTTPException(status_code=404, detail="配置不存在")
    
    config.value = value
    db.commit()
    
    return {"message": "配置更新成功"}

@manage_router.post("/backup")
async def create_backup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建系统备份"""
    # 检查权限
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")
    
    # TODO: 实现系统备份逻辑
    return {"message": "备份功能待实现"}

@manage_router.post("/restore")
async def restore_backup(
    backup_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """恢复系统备份"""
    # 检查权限
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")
    
    # TODO: 实现系统恢复逻辑
    return {"message": "恢复功能待实现"} 