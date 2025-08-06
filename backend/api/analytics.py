from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from database import (
    get_db, User, Class, Resource, VideoResource, TeachingPlan,
    ChatHistory, KnowledgePoint, StudentDispute, KnowledgeMastery
)
from api.auth import get_current_user

# 创建路由器
analytics_router = APIRouter()

# Pydantic模型
class DashboardStats(BaseModel):
    total_users: int
    total_classes: int
    total_resources: int
    total_videos: int
    active_students_today: int
    active_teachers_today: int
    pending_disputes: int

class UserStats(BaseModel):
    total_students: int
    total_teachers: int
    total_admins: int
    active_students_today: int
    active_students_week: int
    student_activity_trend: List[Dict[str, Any]]

class TeacherStats(BaseModel):
    total_teachers: int
    active_teachers_today: int
    active_teachers_week: int
    total_teaching_plans: int
    total_videos: int
    teacher_activity_trend: List[Dict[str, Any]]

class ClassStats(BaseModel):
    total_classes: int
    class_distribution: List[Dict[str, Any]]
    class_student_count: List[Dict[str, Any]]

class SystemActivity(BaseModel):
    timestamp: datetime
    activity_type: str
    description: str
    user_name: str

@analytics_router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取仪表板数据"""
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")

    today = datetime.now().date()

    # 基础统计
    total_users = db.query(User).count()
    total_classes = db.query(Class).count()
    total_resources = db.query(Resource).count()
    total_videos = db.query(VideoResource).count()

    # 今日活跃学生数（基于聊天记录）
    active_students_today = db.query(ChatHistory.student_id).filter(
        func.date(ChatHistory.timestamp) == today
    ).distinct().count()

    # 今日活跃教师数（基于教学计划创建）
    active_teachers_today = db.query(TeachingPlan.teacher_id).filter(
        func.date(TeachingPlan.created_at) == today
    ).distinct().count()

    # 待处理疑问数
    pending_disputes = db.query(StudentDispute).filter(
        StudentDispute.status == "待处理"
    ).count()

    return DashboardStats(
        total_users=total_users,
        total_classes=total_classes,
        total_resources=total_resources,
        total_videos=total_videos,
        active_students_today=active_students_today,
        active_teachers_today=active_teachers_today,
        pending_disputes=pending_disputes
    )

@analytics_router.get("/students", response_model=UserStats)
async def get_student_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取学生数据分析"""
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")

    today = datetime.now().date()
    week_ago = today - timedelta(days=7)

    # 基础统计
    total_students = db.query(User).filter(User.role == "学生").count()
    total_teachers = db.query(User).filter(User.role == "教师").count()
    total_admins = db.query(User).filter(User.role == "管理员").count()

    # 活跃度统计
    active_students_today = db.query(ChatHistory.student_id).filter(
        func.date(ChatHistory.timestamp) == today
    ).distinct().count()

    active_students_week = db.query(ChatHistory.student_id).filter(
        func.date(ChatHistory.timestamp) >= week_ago
    ).distinct().count()

    # 活跃度趋势（最近7天）
    activity_trend = []
    for i in range(7):
        date = today - timedelta(days=i)
        count = db.query(ChatHistory.student_id).filter(
            func.date(ChatHistory.timestamp) == date
        ).distinct().count()
        activity_trend.append({
            "date": date.strftime("%Y-%m-%d"),
            "count": count
        })

    return UserStats(
        total_students=total_students,
        total_teachers=total_teachers,
        total_admins=total_admins,
        active_students_today=active_students_today,
        active_students_week=active_students_week,
        student_activity_trend=list(reversed(activity_trend))
    )

@analytics_router.get("/teachers", response_model=TeacherStats)
async def get_teacher_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取教师数据分析"""
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")

    today = datetime.now().date()
    week_ago = today - timedelta(days=7)

    # 基础统计
    total_teachers = db.query(User).filter(User.role == "教师").count()
    total_teaching_plans = db.query(TeachingPlan).count()
    total_videos = db.query(VideoResource).count()

    # 活跃度统计
    active_teachers_today = db.query(TeachingPlan.teacher_id).filter(
        func.date(TeachingPlan.created_at) == today
    ).distinct().count()

    active_teachers_week = db.query(TeachingPlan.teacher_id).filter(
        func.date(TeachingPlan.created_at) >= week_ago
    ).distinct().count()

    # 活跃度趋势（最近7天）
    activity_trend = []
    for i in range(7):
        date = today - timedelta(days=i)
        count = db.query(TeachingPlan.teacher_id).filter(
            func.date(TeachingPlan.created_at) == date
        ).distinct().count()
        activity_trend.append({
            "date": date.strftime("%Y-%m-%d"),
            "count": count
        })

    return TeacherStats(
        total_teachers=total_teachers,
        active_teachers_today=active_teachers_today,
        active_teachers_week=active_teachers_week,
        total_teaching_plans=total_teaching_plans,
        total_videos=total_videos,
        teacher_activity_trend=list(reversed(activity_trend))
    )

@analytics_router.get("/classes", response_model=ClassStats)
async def get_class_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取班级数据分析"""
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")

    # 基础统计
    total_classes = db.query(Class).count()

    # 班级分布
    classes = db.query(Class).all()
    class_distribution = []
    class_student_count = []

    for cls in classes:
        student_count = db.query(User).filter(
            User.class_id == cls.id,
            User.role == "学生"
        ).count()

        teacher_count = db.query(User).filter(
            User.class_id == cls.id,
            User.role == "教师"
        ).count()

        class_distribution.append({
            "class_name": cls.name,
            "student_count": student_count,
            "teacher_count": teacher_count
        })

        class_student_count.append({
            "name": cls.name,
            "value": student_count
        })

    return ClassStats(
        total_classes=total_classes,
        class_distribution=class_distribution,
        class_student_count=class_student_count
    )

@analytics_router.get("/activities", response_model=List[SystemActivity])
async def get_system_activities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20
):
    """获取系统活动记录"""
    if current_user.role != "管理员":
        raise HTTPException(status_code=403, detail="权限不足")

    activities = []

    # 获取最近的教学计划创建记录
    recent_plans = db.query(TeachingPlan).join(User).order_by(
        TeachingPlan.created_at.desc()
    ).limit(limit // 2).all()

    for plan in recent_plans:
        activities.append(SystemActivity(
            timestamp=plan.created_at,
            activity_type="teaching_plan",
            description=f"创建了教学计划：{plan.input_prompt[:30]}...",
            user_name=plan.teacher.display_name
        ))

    # 获取最近的视频上传记录
    recent_videos = db.query(VideoResource).join(User).order_by(
        VideoResource.created_at.desc()
    ).limit(limit // 2).all()

    for video in recent_videos:
        activities.append(SystemActivity(
            timestamp=video.created_at,
            activity_type="video_upload",
            description=f"上传了视频：{video.title}",
            user_name=video.teacher.display_name
        ))

    # 按时间排序
    activities.sort(key=lambda x: x.timestamp, reverse=True)

    return activities[:limit]

@analytics_router.get("/teacher-dashboard")
async def get_teacher_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取教师仪表板数据"""
    if current_user.role != "教师":
        raise HTTPException(status_code=403, detail="只有教师可以访问此端点")
    
    # TODO: 实现教师仪表板数据获取逻辑
    return {
        "total_resources": 0,
        "total_videos": 0,
        "total_students": 0,
        "recent_activities": []
    }

@analytics_router.get("/student-dashboard")
async def get_student_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取学生仪表板数据"""
    if current_user.role != "学生":
        raise HTTPException(status_code=403, detail="只有学生可以访问此端点")
    
    # TODO: 实现学生仪表板数据获取逻辑
    return {
        "total_courses": 0,
        "total_assignments": 0,
        "total_notes": 0,
        "recent_activities": []
    }

@analytics_router.get("/user-stats")
async def get_user_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户统计信息"""
    # TODO: 实现用户统计逻辑
    return {
        "total_users": 0,
        "teachers": 0,
        "students": 0,
        "admins": 0
    }

@analytics_router.get("/resource-stats")
async def get_resource_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取资源统计信息"""
    # TODO: 实现资源统计逻辑
    return {
        "total_resources": 0,
        "by_type": {},
        "by_class": {}
    } 