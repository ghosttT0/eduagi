from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import get_db, Class, User
from api.auth import get_current_user

# 创建路由器
classes_router = APIRouter()

# Pydantic模型
class ClassCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ClassResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

@classes_router.get("/", response_model=List[ClassResponse])
async def get_classes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取班级列表"""
    classes = db.query(Class).all()
    return [ClassResponse.from_orm(cls) for cls in classes]

@classes_router.get("/{class_id}", response_model=ClassResponse)
async def get_class(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取特定班级信息"""
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="班级不存在")
    
    return ClassResponse.from_orm(cls)

@classes_router.post("/", response_model=ClassResponse)
async def create_class(
    class_data: ClassCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新班级"""
    # 检查权限
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")
    
    new_class = Class(
        name=class_data.name,
        description=class_data.description
    )
    
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    
    return ClassResponse.from_orm(new_class)

@classes_router.put("/{class_id}", response_model=ClassResponse)
async def update_class(
    class_id: int,
    class_data: ClassUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新班级信息"""
    # 检查权限
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")
    
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="班级不存在")
    
    # 更新字段
    if class_data.name is not None:
        cls.name = class_data.name
    if class_data.description is not None:
        cls.description = class_data.description
    
    db.commit()
    db.refresh(cls)
    
    return ClassResponse.from_orm(cls)

@classes_router.delete("/{class_id}")
async def delete_class(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除班级"""
    # 检查权限
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")
    
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="班级不存在")
    
    db.delete(cls)
    db.commit()
    
    return {"message": "班级删除成功"} 