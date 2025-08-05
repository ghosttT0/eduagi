from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import get_db, User, Class
from api.auth import get_current_user, get_password_hash

# 创建路由器
users_router = APIRouter()

# Pydantic模型
class UserCreate(BaseModel):
    account_id: str
    display_name: str
    role: str
    password: str
    class_id: Optional[int] = None

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    role: Optional[str] = None
    class_id: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    account_id: str
    display_name: str
    role: str
    class_id: Optional[int] = None

    class Config:
        from_attributes = True

@users_router.get("/", response_model=List[UserResponse])
async def get_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    role: Optional[str] = None,
    class_id: Optional[int] = None
):
    """获取用户列表"""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    if class_id:
        query = query.filter(User.class_id == class_id)
    
    users = query.all()
    return [UserResponse.from_orm(user) for user in users]

@users_router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取特定用户信息"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return UserResponse.from_orm(user)

@users_router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新用户"""
    # 检查权限
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 检查账号是否已存在
    existing_user = db.query(User).filter(User.account_id == user_data.account_id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="账号已存在")
    
    # 创建用户
    new_user = User(
        account_id=user_data.account_id,
        display_name=user_data.display_name,
        role=user_data.role,
        hashed_password=get_password_hash(user_data.password),
        class_id=user_data.class_id
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return UserResponse.from_orm(new_user)

@users_router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户信息"""
    # 检查权限
    if current_user.role != "管理员" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="权限不足")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 更新字段
    if user_data.display_name is not None:
        user.display_name = user_data.display_name
    if user_data.role is not None and current_user.role == "管理员":
        user.role = user_data.role
    if user_data.class_id is not None:
        user.class_id = user_data.class_id
    
    db.commit()
    db.refresh(user)
    
    return UserResponse.from_orm(user)

@users_router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除用户"""
    # 检查权限
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    db.delete(user)
    db.commit()
    
    return {"message": "用户删除成功"} 