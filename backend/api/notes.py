from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db, Note, User
from api.auth import get_current_user

# 创建路由器
notes_router = APIRouter()

# Pydantic模型
class NoteCreate(BaseModel):
    title: str
    content: str
    is_public: bool = False
    tags: Optional[str] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_public: Optional[bool] = None
    tags: Optional[str] = None

class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    author_id: int
    created_at: datetime
    updated_at: datetime
    is_public: bool
    tags: Optional[str] = None

    class Config:
        from_attributes = True

@notes_router.get("/", response_model=List[NoteResponse])
async def get_notes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    is_public: Optional[bool] = None,
    author_id: Optional[int] = None
):
    """获取笔记列表"""
    query = db.query(Note)
    
    # 根据用户角色过滤
    if current_user.role == "学生":
        # 学生只能看到自己的笔记和公开笔记
        query = query.filter(
            (Note.author_id == current_user.id) | (Note.is_public == True)
        )
    elif current_user.role == "教师":
        # 教师可以看到自己的笔记、公开笔记和本班学生的笔记
        if current_user.class_id:
            from database import User as UserModel
            class_students = db.query(UserModel.id).filter(
                UserModel.class_id == current_user.class_id
            ).subquery()
            query = query.filter(
                (Note.author_id == current_user.id) | 
                (Note.is_public == True) |
                (Note.author_id.in_(class_students))
            )
        else:
            query = query.filter(
                (Note.author_id == current_user.id) | (Note.is_public == True)
            )
    
    if is_public is not None:
        query = query.filter(Note.is_public == is_public)
    if author_id:
        query = query.filter(Note.author_id == author_id)
    
    notes = query.order_by(Note.updated_at.desc()).all()
    return [NoteResponse.from_orm(note) for note in notes]

@notes_router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取特定笔记"""
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    # 权限检查
    if note.author_id != current_user.id and not note.is_public:
        if current_user.role == "教师":
            # 教师可以查看本班学生的笔记
            from database import User as UserModel
            author = db.query(UserModel).filter(UserModel.id == note.author_id).first()
            if not author or author.class_id != current_user.class_id:
                raise HTTPException(status_code=403, detail="权限不足")
        else:
            raise HTTPException(status_code=403, detail="权限不足")
    
    return NoteResponse.from_orm(note)

@notes_router.post("/", response_model=NoteResponse)
async def create_note(
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新笔记"""
    new_note = Note(
        title=note_data.title,
        content=note_data.content,
        author_id=current_user.id,
        is_public=note_data.is_public,
        tags=note_data.tags
    )
    
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    
    return NoteResponse.from_orm(new_note)

@notes_router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_data: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新笔记"""
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    # 权限检查
    if note.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 更新字段
    if note_data.title is not None:
        note.title = note_data.title
    if note_data.content is not None:
        note.content = note_data.content
    if note_data.is_public is not None:
        note.is_public = note_data.is_public
    if note_data.tags is not None:
        note.tags = note_data.tags
    
    db.commit()
    db.refresh(note)
    
    return NoteResponse.from_orm(note)

@notes_router.delete("/{note_id}")
async def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除笔记"""
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    # 权限检查
    if note.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="权限不足")
    
    db.delete(note)
    db.commit()
    
    return {"message": "笔记删除成功"}

@notes_router.get("/search/")
async def search_notes(
    q: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """搜索笔记"""
    query = db.query(Note)
    
    # 根据用户角色过滤
    if current_user.role == "学生":
        query = query.filter(
            (Note.author_id == current_user.id) | (Note.is_public == True)
        )
    elif current_user.role == "教师":
        if current_user.class_id:
            from database import User as UserModel
            class_students = db.query(UserModel.id).filter(
                UserModel.class_id == current_user.class_id
            ).subquery()
            query = query.filter(
                (Note.author_id == current_user.id) | 
                (Note.is_public == True) |
                (Note.author_id.in_(class_students))
            )
        else:
            query = query.filter(
                (Note.author_id == current_user.id) | (Note.is_public == True)
            )
    
    # 搜索标题和内容
    search_filter = (
        Note.title.contains(q) | 
        Note.content.contains(q) | 
        Note.tags.contains(q)
    )
    query = query.filter(search_filter)
    
    notes = query.order_by(Note.updated_at.desc()).all()
    return [NoteResponse.from_orm(note) for note in notes] 