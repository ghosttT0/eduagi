from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db, Exam, User
from api.auth import get_current_user

# 创建路由器
exams_router = APIRouter()

# Pydantic模型
class ExamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    class_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    total_score: float = 100.0

class ExamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    class_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    total_score: Optional[float] = None
    is_active: Optional[bool] = None

class ExamResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    class_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    total_score: float
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

@exams_router.get("/", response_model=List[ExamResponse])
async def get_exams(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    class_id: Optional[int] = None,
    is_active: Optional[bool] = None
):
    """获取考试列表"""
    query = db.query(Exam)
    
    # 根据用户角色过滤
    if current_user.role == "学生":
        # 学生只能看到自己班级的考试
        query = query.filter(Exam.class_id == current_user.class_id)
    elif current_user.role == "教师":
        # 教师只能看到自己创建的考试
        query = query.filter(Exam.creator_id == current_user.id)
    
    if class_id:
        query = query.filter(Exam.class_id == class_id)
    if is_active is not None:
        query = query.filter(Exam.is_active == is_active)
    
    exams = query.order_by(Exam.created_at.desc()).all()
    return [ExamResponse.from_orm(exam) for exam in exams]

@exams_router.get("/{exam_id}", response_model=ExamResponse)
async def get_exam(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取特定考试信息"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="考试不存在")
    
    # 权限检查
    if current_user.role == "学生" and exam.class_id != current_user.class_id:
        raise HTTPException(status_code=403, detail="权限不足")
    elif current_user.role == "教师" and exam.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="权限不足")
    
    return ExamResponse.from_orm(exam)

@exams_router.post("/", response_model=ExamResponse)
async def create_exam(
    exam_data: ExamCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新考试"""
    # 检查权限
    if current_user.role not in ["教师", "管理员"]:
        raise HTTPException(status_code=403, detail="权限不足")
    
    new_exam = Exam(
        title=exam_data.title,
        description=exam_data.description,
        creator_id=current_user.id,
        class_id=exam_data.class_id,
        start_time=exam_data.start_time,
        end_time=exam_data.end_time,
        duration=exam_data.duration,
        total_score=exam_data.total_score
    )
    
    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)
    
    return ExamResponse.from_orm(new_exam)

@exams_router.put("/{exam_id}", response_model=ExamResponse)
async def update_exam(
    exam_id: int,
    exam_data: ExamUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新考试信息"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="考试不存在")
    
    # 权限检查
    if current_user.role == "教师" and exam.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="权限不足")
    elif current_user.role == "学生":
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 更新字段
    if exam_data.title is not None:
        exam.title = exam_data.title
    if exam_data.description is not None:
        exam.description = exam_data.description
    if exam_data.class_id is not None:
        exam.class_id = exam_data.class_id
    if exam_data.start_time is not None:
        exam.start_time = exam_data.start_time
    if exam_data.end_time is not None:
        exam.end_time = exam_data.end_time
    if exam_data.duration is not None:
        exam.duration = exam_data.duration
    if exam_data.total_score is not None:
        exam.total_score = exam_data.total_score
    if exam_data.is_active is not None:
        exam.is_active = exam_data.is_active
    
    db.commit()
    db.refresh(exam)
    
    return ExamResponse.from_orm(exam)

@exams_router.delete("/{exam_id}")
async def delete_exam(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除考试"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="考试不存在")
    
    # 权限检查
    if current_user.role == "教师" and exam.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="权限不足")
    elif current_user.role == "学生":
        raise HTTPException(status_code=403, detail="权限不足")
    
    db.delete(exam)
    db.commit()
    
    return {"message": "考试删除成功"} 