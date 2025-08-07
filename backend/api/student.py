from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime, timedelta
from io import BytesIO
import docx
from docx.shared import Inches

from database import (
    get_db, User, ChatHistory, KnowledgePoint, StudentDispute,
    KnowledgeMastery, VideoResource, Class
)
from api.auth import get_current_user
from services.ai_service import ai_service

# 创建路由器
student_router = APIRouter()

# Pydantic模型
class ChatMessage(BaseModel):
    question: str
    ai_mode: str = "直接问答"  # 直接问答、苏格拉底式引导、关联知识分析

class ChatResponse(BaseModel):
    answer: str
    timestamp: datetime

class ChatHistoryResponse(BaseModel):
    id: int
    question: str
    answer: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class PracticeRequest(BaseModel):
    topic: str

class PracticeQuestion(BaseModel):
    question_text: str
    standard_answer: str
    topic: str

class PracticeAnswer(BaseModel):
    student_answer: str

class PracticeFeedback(BaseModel):
    feedback: str
    score: Optional[int] = None

class DisputeCreate(BaseModel):
    message: str

class DisputeResponse(BaseModel):
    id: int
    message: str
    status: str
    teacher_reply: Optional[str] = None
    created_at: datetime
    replied_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class KnowledgeMasteryCreate(BaseModel):
    knowledge_point: str
    mastery_level: int  # 1-薄弱, 2-基本, 3-熟练
    self_assessment: Optional[str] = None

class KnowledgeMasteryResponse(BaseModel):
    id: int
    knowledge_point: str
    mastery_level: int
    self_assessment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class VideoResourceResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    path: str
    status: str
    created_at: datetime
    teacher_name: str
    
    class Config:
        from_attributes = True

# AI学习伙伴相关接口
@student_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """与AI学习伙伴对话"""
    if current_user.role != "学生":
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 获取最近的对话历史作为上下文
    recent_chats = db.query(ChatHistory).filter(
        ChatHistory.student_id == current_user.id
    ).order_by(ChatHistory.timestamp.desc()).limit(10).all()
    
    # 构建对话上下文
    chat_history = []
    for chat in reversed(recent_chats):
        chat_history.append((chat.question, chat.answer))
    
    # 根据AI模式构建提示词
    mode_prompts = {
        "直接问答": f"请直接、清晰地回答以下问题：{message.question}",
        "苏格拉底式引导": f"请扮演苏格拉底，不要直接回答问题，而是通过反问来引导我思考这个问题：{message.question}",
        "关联知识分析": f"请分析这个问题 '{message.question}' 主要涉及了哪些关联知识点，并对这些关联点进行简要说明。"
    }
    
    # 调用AI服务生成回答
    ai_answer = await ai_service.chat_with_student(
        question=message.question,
        ai_mode=message.ai_mode,
        chat_history=chat_history
    )
    
    # 保存对话历史
    chat_record = ChatHistory(
        student_id=current_user.id,
        question=message.question,
        answer=ai_answer
    )
    
    db.add(chat_record)
    db.commit()
    
    return ChatResponse(answer=ai_answer, timestamp=datetime.now())

@student_router.get("/chat/history", response_model=List[ChatHistoryResponse])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """获取聊天历史"""
    if current_user.role != "学生":
        raise HTTPException(status_code=403, detail="权限不足")
    
    chats = db.query(ChatHistory).filter(
        ChatHistory.student_id == current_user.id
    ).order_by(ChatHistory.timestamp.desc()).limit(limit).all()
    
    return [ChatHistoryResponse.from_orm(chat) for chat in chats]

@student_router.delete("/chat/history")
async def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """清空聊天历史"""
    if current_user.role != "学生":
        raise HTTPException(status_code=403, detail="权限不足")
    
    db.query(ChatHistory).filter(
        ChatHistory.student_id == current_user.id
    ).delete()
    
    db.commit()
    
    return {"message": "聊天历史已清空"}

# 自主练习相关接口
@student_router.post("/practice/generate", response_model=PracticeQuestion)
async def generate_practice_question(
    request: PracticeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """生成练习题"""
    if current_user.role != "学生":
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 更新知识点查询次数
    kp = db.query(KnowledgePoint).filter(
        KnowledgePoint.topic == request.topic
    ).first()
    
    if kp:
        kp.query_count += 1
    else:
        kp = KnowledgePoint(topic=request.topic, query_count=1)
        db.add(kp)
    
    db.commit()
    
    # 调用AI服务生成练习题
    question_data = await ai_service.generate_practice_question(request.topic)

    practice_question = PracticeQuestion(
        question_text=question_data["question_text"],
        standard_answer=question_data["standard_answer"],
        topic=request.topic
    )
    
    return practice_question

@student_router.post("/practice/submit", response_model=PracticeFeedback)
async def submit_practice_answer(
    answer: PracticeAnswer,
    question_data: PracticeQuestion,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """提交练习答案并获取反馈"""
    if current_user.role != "学生":
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 调用AI服务生成反馈
    feedback_text = await ai_service.evaluate_practice_answer(
        question=question_data.question_text,
        standard_answer=question_data.standard_answer,
        student_answer=answer.student_answer
    )
    
    return PracticeFeedback(feedback=feedback_text, score=8)

# 向老师提问相关接口
@student_router.post("/disputes", response_model=DisputeResponse)
async def create_dispute(
    dispute_data: DisputeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """向老师提交疑问"""
    if current_user.role != "学生":
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 检查学生是否有班级
    if not current_user.class_id:
        raise HTTPException(status_code=400, detail="您还没有被分配到任何班级")
    
    # 检查班级是否有教师
    class_teacher = db.query(User).filter(
        User.class_id == current_user.class_id,
        User.role == "教师"
    ).first()
    
    if not class_teacher:
        raise HTTPException(status_code=400, detail="您的班级还没有分配教师")
    
    # 创建疑问记录
    new_dispute = StudentDispute(
        student_id=current_user.id,
        class_id=current_user.class_id,
        message=dispute_data.message,
        status="待处理"
    )
    
    db.add(new_dispute)
    db.commit()
    db.refresh(new_dispute)
    
    return DisputeResponse.from_orm(new_dispute)

@student_router.get("/disputes", response_model=List[DisputeResponse])
async def get_my_disputes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取我的疑问列表"""
    if current_user.role != "学生":
        raise HTTPException(status_code=403, detail="权限不足")
    
    disputes = db.query(StudentDispute).filter(
        StudentDispute.student_id == current_user.id
    ).order_by(StudentDispute.created_at.desc()).all()
    
    return [DisputeResponse.from_orm(dispute) for dispute in disputes]

# 知识掌握评估相关接口
@student_router.post("/knowledge-mastery", response_model=KnowledgeMasteryResponse)
async def create_or_update_knowledge_mastery(
    mastery_data: KnowledgeMasteryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建或更新知识掌握评估"""
    if current_user.role != "学生":
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 检查是否已存在该知识点的评估
    existing = db.query(KnowledgeMastery).filter(
        KnowledgeMastery.student_id == current_user.id,
        KnowledgeMastery.knowledge_point == mastery_data.knowledge_point
    ).first()
    
    if existing:
        # 更新现有记录
        existing.mastery_level = mastery_data.mastery_level
        existing.self_assessment = mastery_data.self_assessment
        existing.updated_at = datetime.now()
        db.commit()
        db.refresh(existing)
        return KnowledgeMasteryResponse.from_orm(existing)
    else:
        # 创建新记录
        new_mastery = KnowledgeMastery(
            student_id=current_user.id,
            knowledge_point=mastery_data.knowledge_point,
            mastery_level=mastery_data.mastery_level,
            self_assessment=mastery_data.self_assessment
        )
        db.add(new_mastery)
        db.commit()
        db.refresh(new_mastery)
        return KnowledgeMasteryResponse.from_orm(new_mastery)

@student_router.get("/knowledge-mastery", response_model=List[KnowledgeMasteryResponse])
async def get_knowledge_mastery(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取知识掌握评估列表"""
    if current_user.role != "学生":
        raise HTTPException(status_code=403, detail="权限不足")
    
    masteries = db.query(KnowledgeMastery).filter(
        KnowledgeMastery.student_id == current_user.id
    ).order_by(KnowledgeMastery.updated_at.desc()).all()
    
    return [KnowledgeMasteryResponse.from_orm(mastery) for mastery in masteries]

# 视频学习相关接口
@student_router.get("/videos", response_model=List[VideoResourceResponse])
async def get_available_videos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取可用的视频资源"""
    if current_user.role != "学生":
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 获取已发布的视频资源
    videos = db.query(VideoResource).filter(
        VideoResource.status == "已发布"
    ).order_by(VideoResource.created_at.desc()).all()
    
    result = []
    for video in videos:
        teacher = db.query(User).filter(User.id == video.teacher_id).first()
        result.append(VideoResourceResponse(
            id=video.id,
            title=video.title,
            description=video.description,
            path=video.path,
            status=video.status,
            created_at=video.created_at,
            teacher_name=teacher.display_name if teacher else "未知教师"
        ))
    
    return result

@student_router.get("/videos/{video_id}", response_model=VideoResourceResponse)
async def get_video_detail(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取视频详情"""
    if current_user.role != "学生":
        raise HTTPException(status_code=403, detail="权限不足")
    
    video = db.query(VideoResource).filter(
        VideoResource.id == video_id,
        VideoResource.status == "已发布"
    ).first()
    
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在或未发布")
    
    teacher = db.query(User).filter(User.id == video.teacher_id).first()
    
    return VideoResourceResponse(
        id=video.id,
        title=video.title,
        description=video.description,
        path=video.path,
        status=video.status,
        created_at=video.created_at,
        teacher_name=teacher.display_name if teacher else "未知教师"
    )

# ==================== 学习计划相关模型 ====================

class StudyEventCreate(BaseModel):
    title: str
    start: datetime
    end: datetime
    type: str  # study, exam, assignment, review
    subject: str
    description: Optional[str] = None

class StudyEventUpdate(BaseModel):
    title: Optional[str] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    type: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

class StudyEventResponse(BaseModel):
    id: int
    title: str
    start: datetime
    end: datetime
    type: str
    subject: str
    description: Optional[str]
    completed: bool
    user_id: int
    created_at: datetime

class StudyPlanCreate(BaseModel):
    title: str
    description: str
    subject: str
    difficulty: str  # beginner, intermediate, advanced
    duration: int  # 天数
    goals: List[str]

class StudyPlanResponse(BaseModel):
    id: int
    title: str
    description: str
    subject: str
    difficulty: str
    duration: int
    goals: List[str]
    progress: float
    user_id: int
    created_at: datetime

class AIStudyPlanRequest(BaseModel):
    subject: str
    goal: str
    level: str  # beginner, intermediate, advanced
    duration: int
    preferences: Optional[List[str]] = []
    daily_time: Optional[int] = 2
    requirements: Optional[str] = ""

# ==================== 学习计划API ====================

@student_router.get("/study-events", response_model=List[StudyEventResponse])
async def get_study_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取学生的学习事件列表"""
    # 这里需要在数据库中添加StudyEvent表，暂时返回模拟数据
    return []

@student_router.post("/study-events", response_model=StudyEventResponse)
async def create_study_event(
    event: StudyEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建学习事件"""
    # 这里需要在数据库中添加StudyEvent表，暂时返回模拟数据
    return StudyEventResponse(
        id=1,
        title=event.title,
        start=event.start,
        end=event.end,
        type=event.type,
        subject=event.subject,
        description=event.description,
        completed=False,
        user_id=current_user.id,
        created_at=datetime.now()
    )

@student_router.get("/study-plans", response_model=List[StudyPlanResponse])
async def get_study_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取学生的学习计划列表"""
    # 这里需要在数据库中添加StudyPlan表，暂时返回模拟数据
    return []

@student_router.post("/ai-study-plan", response_model=StudyPlanResponse)
async def generate_ai_study_plan(
    request: AIStudyPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI生成学习计划"""
    try:
        # 构建AI提示
        prompt = f"""
        请为学生生成一个详细的学习计划：

        学习科目：{request.subject}
        学习目标：{request.goal}
        当前水平：{request.level}
        计划时长：{request.duration}天
        每日可用时间：{request.daily_time}小时
        学习偏好：{', '.join(request.preferences) if request.preferences else '无特殊偏好'}
        特殊要求：{request.requirements or '无'}

        请生成一个包含以下内容的学习计划：
        1. 计划标题
        2. 详细描述
        3. 学习目标（3-5个）
        4. 分阶段学习安排

        请以JSON格式返回，包含title, description, goals字段。
        """

        # 调用AI服务生成计划
        ai_response = await ai_service.generate_response(prompt, "教学计划生成")

        # 解析AI响应（这里简化处理）
        plan_data = {
            "title": f"{request.subject} - {request.goal}学习计划",
            "description": f"基于AI分析生成的个性化{request.subject}学习计划",
            "goals": [
                f"掌握{request.subject}核心概念",
                f"完成实践项目",
                f"通过相关考试",
                f"达到{request.goal}水平"
            ]
        }

        return StudyPlanResponse(
            id=1,
            title=plan_data["title"],
            description=plan_data["description"],
            subject=request.subject,
            difficulty=request.level,
            duration=request.duration,
            goals=plan_data["goals"],
            progress=0.0,
            user_id=current_user.id,
            created_at=datetime.now()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI生成学习计划失败: {str(e)}")

@student_router.get("/study-plans/{plan_id}/export")
async def export_study_plan_to_word(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """导出学习计划为Word文档"""
    try:
        # 创建Word文档
        doc = docx.Document()

        # 添加标题
        title = doc.add_heading('个性化学习计划', 0)
        title.alignment = 1  # 居中对齐

        # 添加基本信息
        doc.add_heading('基本信息', level=1)
        doc.add_paragraph(f'学生姓名：{current_user.display_name}')
        doc.add_paragraph(f'生成时间：{datetime.now().strftime("%Y年%m月%d日")}')
        doc.add_paragraph(f'计划编号：{plan_id}')

        # 添加学习目标
        doc.add_heading('学习目标', level=1)
        goals = [
            '掌握核心知识点和概念',
            '提高实践应用能力',
            '培养独立思考和解决问题的能力',
            '达到预期的学习效果'
        ]
        for goal in goals:
            doc.add_paragraph(f'• {goal}')

        # 添加学习安排
        doc.add_heading('学习安排', level=1)
        doc.add_paragraph('本学习计划采用循序渐进的方式，分为以下几个阶段：')

        stages = [
            '第一阶段：基础知识学习（1-2周）',
            '第二阶段：实践练习（2-3周）',
            '第三阶段：综合应用（1-2周）',
            '第四阶段：总结复习（1周）'
        ]
        for stage in stages:
            doc.add_paragraph(f'• {stage}')

        # 添加学习建议
        doc.add_heading('学习建议', level=1)
        suggestions = [
            '制定每日学习计划，保持学习的连续性',
            '及时复习所学内容，巩固知识点',
            '多做练习题，提高实践能力',
            '遇到问题及时向老师或同学请教',
            '定期自我评估学习效果'
        ]
        for suggestion in suggestions:
            doc.add_paragraph(f'• {suggestion}')

        # 保存到内存
        buffer = BytesIO()
        doc.save(buffer)
        buffer.seek(0)

        from fastapi.responses import StreamingResponse

        return StreamingResponse(
            BytesIO(buffer.read()),
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            headers={'Content-Disposition': f'attachment; filename="学习计划_{plan_id}.docx"'}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导出Word文档失败: {str(e)}")
