from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime

from database import (
    get_db, User, TeachingPlan, MindMap, VideoResource,
    StudentDispute, KnowledgePoint
)
from api.auth import get_current_user
from services.ai_service import ai_service

# 创建路由器
teacher_router = APIRouter()

# Pydantic模型
class TeachingPlanCreate(BaseModel):
    course_name: str
    chapter: str
    topic: Optional[str] = None
    class_hours: int = 2
    teaching_time: int = 90

class TeachingPlanResponse(BaseModel):
    id: int
    teacher_id: int
    input_prompt: str
    output_content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class MindMapCreate(BaseModel):
    title: str
    topic: str
    description: Optional[str] = None
    is_public: bool = False

class MindMapResponse(BaseModel):
    id: int
    user_id: int
    title: str
    topic: str
    data: str
    description: Optional[str] = None
    is_public: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class VideoResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    path: str
    status: str = "草稿"

class VideoResourceResponse(BaseModel):
    id: int
    teacher_id: int
    title: str
    description: Optional[str] = None
    path: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class StudentDisputeResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    class_id: int
    question_id: Optional[int] = None
    message: str
    status: str
    teacher_reply: Optional[str] = None
    created_at: datetime
    replied_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ExamGenerateRequest(BaseModel):
    exam_scope: str
    num_mcq: int = 5
    num_saq: int = 3
    num_code: int = 1

# 智能教学设计相关接口
@teacher_router.post("/teaching-plans", response_model=TeachingPlanResponse)
async def create_teaching_plan(
    plan_data: TeachingPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建教学计划"""
    if current_user.role != "教师":
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 调用AI服务生成教学计划
    topic_text = plan_data.topic if plan_data.topic else f"{plan_data.course_name} - {plan_data.chapter} 整体大纲"

    try:
        ai_response = await ai_service.generate_teaching_plan(
            course_name=plan_data.course_name,
            chapter=plan_data.chapter,
            topic=plan_data.topic,
            class_hours=plan_data.class_hours,
            teaching_time=plan_data.teaching_time
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI服务调用失败: {str(e)}。请检查API密钥配置。"
        )
    
    # 保存到数据库
    new_plan = TeachingPlan(
        teacher_id=current_user.id,
        input_prompt=topic_text,
        output_content=json.dumps(ai_response, ensure_ascii=False)
    )
    
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    
    return TeachingPlanResponse.from_orm(new_plan)

@teacher_router.get("/teaching-plans", response_model=List[TeachingPlanResponse])
async def get_teaching_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取教师的教学计划列表"""
    if current_user.role != "教师":
        raise HTTPException(status_code=403, detail="权限不足")
    
    plans = db.query(TeachingPlan).filter(
        TeachingPlan.teacher_id == current_user.id
    ).order_by(TeachingPlan.created_at.desc()).all()
    
    return [TeachingPlanResponse.from_orm(plan) for plan in plans]

@teacher_router.get("/teaching-plans/{plan_id}", response_model=TeachingPlanResponse)
async def get_teaching_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取特定教学计划"""
    if current_user.role != "教师":
        raise HTTPException(status_code=403, detail="权限不足")
    
    plan = db.query(TeachingPlan).filter(
        TeachingPlan.id == plan_id,
        TeachingPlan.teacher_id == current_user.id
    ).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="教学计划不存在")
    
    return TeachingPlanResponse.from_orm(plan)

# 知识图谱相关接口
@teacher_router.post("/mindmaps", response_model=MindMapResponse)
async def create_mindmap(
    mindmap_data: MindMapCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建思维导图"""
    if current_user.role != "教师":
        raise HTTPException(status_code=403, detail="权限不足")
    
    try:
        # 调用AI服务生成思维导图
        mindmap_json = await ai_service.generate_mindmap(
            topic=mindmap_data.topic,
            description=mindmap_data.description
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI服务调用失败: {str(e)}。请检查API密钥配置。"
        )
    
    new_mindmap = MindMap(
        user_id=current_user.id,
        title=mindmap_data.title,
        topic=mindmap_data.topic,
        data=json.dumps(mindmap_json, ensure_ascii=False),
        description=mindmap_data.description,
        is_public=mindmap_data.is_public
    )
    
    db.add(new_mindmap)
    db.commit()
    db.refresh(new_mindmap)
    
    return MindMapResponse.from_orm(new_mindmap)

@teacher_router.get("/mindmaps", response_model=List[MindMapResponse])
async def get_mindmaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取教师的思维导图列表"""
    if current_user.role != "教师":
        raise HTTPException(status_code=403, detail="权限不足")
    
    mindmaps = db.query(MindMap).filter(
        MindMap.user_id == current_user.id
    ).order_by(MindMap.created_at.desc()).all()
    
    return [MindMapResponse.from_orm(mindmap) for mindmap in mindmaps]

# 智能出题接口
@teacher_router.post("/generate-exam")
async def generate_exam(
    exam_data: ExamGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """智能生成试卷"""
    if current_user.role != "教师":
        raise HTTPException(status_code=403, detail="权限不足")
    
    try:
        # 调用AI服务生成试卷
        exam_questions = await ai_service.generate_exam_questions(
            exam_scope=exam_data.exam_scope,
            num_mcq=exam_data.num_mcq,
            num_saq=exam_data.num_saq,
            num_code=exam_data.num_code
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI服务调用失败: {str(e)}。请检查API密钥配置。"
        )
    
    return {
        "message": "试卷生成成功",
        "exam_data": exam_questions
    }

# 学生疑问处理接口
@teacher_router.get("/disputes", response_model=List[StudentDisputeResponse])
async def get_student_disputes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取学生疑问列表"""
    if current_user.role != "教师":
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 获取教师所在班级的学生疑问
    disputes = db.query(StudentDispute).join(User).filter(
        StudentDispute.class_id == current_user.class_id
    ).order_by(StudentDispute.created_at.desc()).all()
    
    result = []
    for dispute in disputes:
        student = db.query(User).filter(User.id == dispute.student_id).first()
        result.append(StudentDisputeResponse(
            id=dispute.id,
            student_id=dispute.student_id,
            student_name=student.display_name if student else "未知学生",
            class_id=dispute.class_id,
            question_id=dispute.question_id,
            message=dispute.message,
            status=dispute.status,
            teacher_reply=dispute.teacher_reply,
            created_at=dispute.created_at,
            replied_at=dispute.replied_at
        ))
    
    return result

@teacher_router.post("/disputes/{dispute_id}/reply")
async def reply_to_dispute(
    dispute_id: int,
    reply: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """回复学生疑问"""
    if current_user.role != "教师":
        raise HTTPException(status_code=403, detail="权限不足")
    
    dispute = db.query(StudentDispute).filter(
        StudentDispute.id == dispute_id,
        StudentDispute.class_id == current_user.class_id
    ).first()
    
    if not dispute:
        raise HTTPException(status_code=404, detail="疑问不存在")
    
    dispute.teacher_reply = reply
    dispute.status = "已回复"
    dispute.replied_at = datetime.now()
    
    db.commit()
    
    return {"message": "回复成功"}

# 视频管理接口
@teacher_router.post("/videos", response_model=VideoResourceResponse)
async def create_video_resource(
    video_data: VideoResourceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建视频资源"""
    if current_user.role != "教师":
        raise HTTPException(status_code=403, detail="权限不足")
    
    new_video = VideoResource(
        teacher_id=current_user.id,
        title=video_data.title,
        description=video_data.description,
        path=video_data.path,
        status=video_data.status
    )
    
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    
    return VideoResourceResponse.from_orm(new_video)

@teacher_router.get("/videos", response_model=List[VideoResourceResponse])
async def get_video_resources(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取教师的视频资源列表"""
    if current_user.role != "教师":
        raise HTTPException(status_code=403, detail="权限不足")
    
    videos = db.query(VideoResource).filter(
        VideoResource.teacher_id == current_user.id
    ).order_by(VideoResource.created_at.desc()).all()
    
    return [VideoResourceResponse.from_orm(video) for video in videos]

@teacher_router.post("/videos/{video_id}/analyze")
async def analyze_video(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI分析视频内容"""
    if current_user.role != "教师":
        raise HTTPException(status_code=403, detail="权限不足")

    video = db.query(VideoResource).filter(
        VideoResource.id == video_id,
        VideoResource.teacher_id == current_user.id
    ).first()

    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")

    try:
        # 调用AI服务分析视频
        analysis_result = await ai_service.analyze_video(
            video_path=video.path
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI服务调用失败: {str(e)}。请检查API密钥配置。"
        )

    return {
        "video_id": video_id,
        "analysis": analysis_result,
        "timestamp": datetime.now()
    }
