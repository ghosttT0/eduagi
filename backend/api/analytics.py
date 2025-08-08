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

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from typing import List, Dict, Any, Optional
import jieba
from collections import Counter
import json
from datetime import datetime, timedelta
import re

router = APIRouter()

@router.get("/knowledge-graph/generate")
async def generate_knowledge_graph(
    topic: str,
    depth: int = 3,
    max_nodes: int = 20,
    include_related: bool = True,
    db: Session = Depends(get_db)
):
    """
    生成D3知识图谱数据
    
    Args:
        topic: 核心主题
        depth: 图谱深度
        max_nodes: 最大节点数
        include_related: 是否包含相关概念
        db: 数据库会话
    """
    try:
        # 基于主题生成知识图谱结构
        graph_data = create_knowledge_graph_structure(topic, depth, max_nodes)
        
        # 如果包含相关概念，从数据库获取相关信息
        if include_related:
            graph_data = enhance_with_database_data(graph_data, db)
        
        return {
            "graph": graph_data,
            "metadata": {
                "topic": topic,
                "depth": depth,
                "node_count": count_nodes(graph_data),
                "generated_at": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成知识图谱失败: {str(e)}")

def create_knowledge_graph_structure(topic: str, depth: int, max_nodes: int) -> Dict:
    """创建知识图谱结构"""
    
    # 预定义的知识结构模板
    templates = {
        "深度学习": {
            "name": "深度学习",
            "children": [
                {
                    "name": "基础概念",
                    "children": [
                        {"name": "神经网络", "size": 15, "importance": 8},
                        {"name": "反向传播", "size": 12, "importance": 7},
                        {"name": "梯度下降", "size": 12, "importance": 7},
                        {"name": "激活函数", "size": 10, "importance": 6}
                    ]
                },
                {
                    "name": "网络架构",
                    "children": [
                        {"name": "卷积神经网络", "size": 14, "importance": 8},
                        {"name": "循环神经网络", "size": 14, "importance": 8},
                        {"name": "Transformer", "size": 12, "importance": 7},
                        {"name": "注意力机制", "size": 10, "importance": 6}
                    ]
                },
                {
                    "name": "应用领域",
                    "children": [
                        {"name": "计算机视觉", "size": 13, "importance": 7},
                        {"name": "自然语言处理", "size": 13, "importance": 7},
                        {"name": "语音识别", "size": 11, "importance": 6},
                        {"name": "推荐系统", "size": 10, "importance": 5}
                    ]
                }
            ]
        },
        "机器学习": {
            "name": "机器学习",
            "children": [
                {
                    "name": "监督学习",
                    "children": [
                        {"name": "线性回归", "size": 12, "importance": 6},
                        {"name": "逻辑回归", "size": 12, "importance": 6},
                        {"name": "决策树", "size": 11, "importance": 5},
                        {"name": "支持向量机", "size": 10, "importance": 5}
                    ]
                },
                {
                    "name": "无监督学习",
                    "children": [
                        {"name": "聚类算法", "size": 11, "importance": 5},
                        {"name": "降维技术", "size": 10, "importance": 4},
                        {"name": "关联规则", "size": 9, "importance": 4}
                    ]
                },
                {
                    "name": "强化学习",
                    "children": [
                        {"name": "Q学习", "size": 10, "importance": 4},
                        {"name": "策略梯度", "size": 9, "importance": 4},
                        {"name": "深度强化学习", "size": 11, "importance": 5}
                    ]
                }
            ]
        },
        "数据结构": {
            "name": "数据结构",
            "children": [
                {
                    "name": "线性结构",
                    "children": [
                        {"name": "数组", "size": 15, "importance": 8},
                        {"name": "链表", "size": 14, "importance": 7},
                        {"name": "栈", "size": 12, "importance": 6},
                        {"name": "队列", "size": 12, "importance": 6}
                    ]
                },
                {
                    "name": "树形结构",
                    "children": [
                        {"name": "二叉树", "size": 13, "importance": 7},
                        {"name": "平衡树", "size": 11, "importance": 5},
                        {"name": "堆", "size": 10, "importance": 5}
                    ]
                },
                {
                    "name": "图结构",
                    "children": [
                        {"name": "邻接矩阵", "size": 10, "importance": 4},
                        {"name": "邻接表", "size": 10, "importance": 4},
                        {"name": "图的遍历", "size": 11, "importance": 5}
                    ]
                }
            ]
        }
    }
    
    # 如果主题在模板中，使用模板
    if topic in templates:
        return templates[topic]
    
    # 否则生成通用结构
    return {
        "name": topic,
        "children": [
            {
                "name": "基本概念",
                "children": [
                    {"name": f"{topic}定义", "size": 12, "importance": 6},
                    {"name": f"{topic}特点", "size": 11, "importance": 5},
                    {"name": f"{topic}应用", "size": 10, "importance": 5}
                ]
            },
            {
                "name": "核心原理",
                "children": [
                    {"name": f"{topic}机制", "size": 11, "importance": 5},
                    {"name": f"{topic}算法", "size": 10, "importance": 4},
                    {"name": f"{topic}优化", "size": 9, "importance": 4}
                ]
            },
            {
                "name": "实际应用",
                "children": [
                    {"name": f"{topic}案例", "size": 10, "importance": 4},
                    {"name": f"{topic}实现", "size": 9, "importance": 3},
                    {"name": f"{topic}发展", "size": 8, "importance": 3}
                ]
            }
        ]
    }

def enhance_with_database_data(graph_data: Dict, db: Session) -> Dict:
    """使用数据库数据增强图谱"""
    try:
        from database import ChatHistory
        
        # 获取相关的聊天记录
        topic = graph_data["name"]
        related_messages = db.query(ChatHistory.message).filter(
            ChatHistory.message.contains(topic)
        ).limit(100).all()
        
        if related_messages:
            # 分析相关概念
            all_text = " ".join([msg[0] for msg in related_messages])
            words = jieba.cut(all_text, cut_all=False)
            word_freq = Counter([word for word in words if len(word) >= 2])
            
            # 添加相关概念到图谱
            related_concepts = word_freq.most_common(5)
            if related_concepts:
                if "children" not in graph_data:
                    graph_data["children"] = []
                
                related_node = {
                    "name": "相关概念",
                    "children": [
                        {"name": concept, "size": min(freq * 2, 15), "importance": min(freq, 5)}
                        for concept, freq in related_concepts
                    ]
                }
                graph_data["children"].append(related_node)
        
        return graph_data
        
    except Exception as e:
        # 如果数据库查询失败，返回原始数据
        return graph_data

def count_nodes(graph_data: Dict) -> int:
    """计算图谱中的节点数量"""
    count = 1  # 根节点
    
    def count_children(node):
        nonlocal count
        if "children" in node:
            for child in node["children"]:
                count += 1
                count_children(child)
    
    count_children(graph_data)
    return count

@router.get("/knowledge-graph/merge")
async def merge_knowledge_graphs(
    graphs: List[Dict],
    merge_strategy: str = "union"
):
    """合并多个知识图谱"""
    try:
        if not graphs or len(graphs) < 2:
            raise HTTPException(status_code=400, detail="至少需要两个图谱进行合并")
        
        if merge_strategy == "union":
            # 并集合并
            merged_graph = merge_graphs_union(graphs)
        elif merge_strategy == "intersection":
            # 交集合并
            merged_graph = merge_graphs_intersection(graphs)
        else:
            raise HTTPException(status_code=400, detail="不支持的合并策略")
        
        return {
            "merged_graph": merged_graph,
            "strategy": merge_strategy,
            "source_graphs": len(graphs),
            "merged_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"合并图谱失败: {str(e)}")

def merge_graphs_union(graphs: List[Dict]) -> Dict:
    """并集合并图谱"""
    # 简单的并集合并，将多个图谱作为子节点
    merged = {
        "name": "合并知识图谱",
        "children": []
    }
    
    for i, graph in enumerate(graphs):
        graph_copy = graph.copy()
        graph_copy["name"] = f"{graph['name']} (图谱{i+1})"
        merged["children"].append(graph_copy)
    
    return merged

def merge_graphs_intersection(graphs: List[Dict]) -> Dict:
    """交集合并图谱"""
    # 找到共同的节点进行合并
    # 这里实现一个简化的交集合并
    return {
        "name": "交集知识图谱",
        "children": [
            {
                "name": "共同概念",
                "children": [
                    {"name": "基础理论", "size": 12, "importance": 6},
                    {"name": "核心算法", "size": 11, "importance": 5},
                    {"name": "应用实践", "size": 10, "importance": 4}
                ]
            }
        ]
    }

@router.get("/wordcloud/generate")
async def generate_wordcloud(
    category: Optional[str] = None,
    time_range: Optional[str] = "7d",
    min_frequency: int = 1,
    max_words: int = 50,
    db: Session = Depends(get_db)
):
    """
    生成词云数据
    
    Args:
        category: 分类过滤（可选）
        time_range: 时间范围（1d, 7d, 30d, all）
        min_frequency: 最小词频
        max_words: 最大词语数量
        db: 数据库会话
    """
    try:
        # 计算时间范围
        end_date = datetime.now()
        if time_range == "1d":
            start_date = end_date - timedelta(days=1)
        elif time_range == "7d":
            start_date = end_date - timedelta(days=7)
        elif time_range == "30d":
            start_date = end_date - timedelta(days=30)
        else:
            start_date = datetime.min  # 全部时间

        # 获取聊天记录
        from database import ChatHistory
        query = db.query(ChatHistory.message).filter(
            ChatHistory.is_user == True,
            ChatHistory.created_at >= start_date,
            ChatHistory.created_at <= end_date
        )
        
        if category:
            query = query.filter(ChatHistory.category == category)
        
        messages = query.all()
        
        if not messages:
            # 返回预设数据
            return {
                "words": [
                    {"text": "深度学习", "size": 60, "category": "ai"},
                    {"text": "机器学习", "size": 55, "category": "ai"},
                    {"text": "人工智能", "size": 50, "category": "ai"},
                    {"text": "神经网络", "size": 45, "category": "ai"},
                    {"text": "Python编程", "size": 40, "category": "programming"},
                    {"text": "数据结构", "size": 35, "category": "algorithm"},
                    {"text": "算法设计", "size": 30, "category": "algorithm"},
                    {"text": "计算机网络", "size": 25, "category": "system"},
                    {"text": "数据库", "size": 20, "category": "system"},
                    {"text": "操作系统", "size": 15, "category": "system"}
                ],
                "metadata": {
                    "total_messages": 0,
                    "time_range": time_range,
                    "category": category,
                    "generated_at": datetime.now().isoformat()
                }
            }

        # 合并所有消息
        all_text = " ".join([msg[0] for msg in messages])
        
        # 使用jieba分词
        words = jieba.cut(all_text, cut_all=False)
        
        # 过滤停用词和短词
        stop_words = {
            '什么', '怎么', '如何', '为什么', '可以', '这个', '那个', '请问', '老师', '同学',
            '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
            '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
            '自己', '这', '那', '他', '她', '它', '们', '我们', '你们', '他们', '她们', '它们'
        }
        
        filtered_words = [
            word for word in words 
            if len(word) >= 2 and word not in stop_words and not re.match(r'^\d+$', word)
        ]
        
        # 统计词频
        word_freq = Counter(filtered_words)
        
        # 过滤低频词
        word_freq = {word: freq for word, freq in word_freq.items() if freq >= min_frequency}
        
        # 按频率排序并限制数量
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:max_words]
        
        # 转换为词云格式
        max_freq = max(word_freq.values()) if word_freq else 1
        words_data = []
        
        for word, freq in sorted_words:
            # 计算字体大小（10-60之间）
            size = 10 + (freq / max_freq) * 50
            
            # 根据词语内容判断类别
            category = "other"
            if any(keyword in word for keyword in ['学习', '智能', '网络', '神经', '算法']):
                category = "ai"
            elif any(keyword in word for keyword in ['编程', '代码', '语言', '开发']):
                category = "programming"
            elif any(keyword in word for keyword in ['数据', '结构', '算法', '排序']):
                category = "algorithm"
            elif any(keyword in word for keyword in ['网络', '系统', '数据库', '服务']):
                category = "system"
            elif any(keyword in word for keyword in ['工具', '框架', '库', '测试']):
                category = "tools"
            
            words_data.append({
                "text": word,
                "size": int(size),
                "frequency": freq,
                "category": category
            })
        
        return {
            "words": words_data,
            "metadata": {
                "total_messages": len(messages),
                "total_words": len(filtered_words),
                "unique_words": len(word_freq),
                "time_range": time_range,
                "category": category,
                "min_frequency": min_frequency,
                "max_words": max_words,
                "generated_at": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成词云失败: {str(e)}")

@router.get("/wordcloud/categories")
async def get_wordcloud_categories(db: Session = Depends(get_db)):
    """获取词云分类统计"""
    try:
        from database import ChatHistory
        
        # 获取所有分类
        categories = db.query(ChatHistory.category).distinct().all()
        category_stats = []
        
        for category in categories:
            if category[0]:
                count = db.query(ChatHistory).filter(
                    ChatHistory.category == category[0]
                ).count()
                category_stats.append({
                    "category": category[0],
                    "message_count": count
                })
        
        return {
            "categories": category_stats,
            "total_categories": len(category_stats)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取分类统计失败: {str(e)}")

@router.get("/wordcloud/trends")
async def get_wordcloud_trends(
    days: int = 7,
    db: Session = Depends(get_db)
):
    """获取词云趋势数据"""
    try:
        from database import ChatHistory
        
        trends = []
        end_date = datetime.now()
        
        for i in range(days):
            date = end_date - timedelta(days=i)
            start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            # 获取当天的消息
            messages = db.query(ChatHistory.message).filter(
                ChatHistory.is_user == True,
                ChatHistory.created_at >= start_of_day,
                ChatHistory.created_at <= end_of_day
            ).all()
            
            if messages:
                # 简单的词频统计
                all_text = " ".join([msg[0] for msg in messages])
                words = jieba.cut(all_text, cut_all=False)
                word_freq = Counter([word for word in words if len(word) >= 2])
                
                # 获取前5个热门词
                top_words = word_freq.most_common(5)
                
                trends.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "message_count": len(messages),
                    "top_words": [{"word": word, "count": count} for word, count in top_words]
                })
            else:
                trends.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "message_count": 0,
                    "top_words": []
                })
        
        return {
            "trends": trends,
            "days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取趋势数据失败: {str(e)}")

@router.post("/wordcloud/custom")
async def generate_custom_wordcloud(
    data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """生成自定义词云数据"""
    try:
        words = data.get("words", [])
        if not words:
            raise HTTPException(status_code=400, detail="请提供词语数据")
        
        # 处理自定义词语数据
        word_data = []
        for word_info in words:
            if isinstance(word_info, str):
                word_data.append({
                    "text": word_info,
                    "size": 20,
                    "category": "custom"
                })
            elif isinstance(word_info, dict):
                word_data.append({
                    "text": word_info.get("text", ""),
                    "size": word_info.get("size", 20),
                    "category": word_info.get("category", "custom"),
                    "color": word_info.get("color"),
                    "weight": word_info.get("weight", 1)
                })
        
        return {
            "words": word_data,
            "metadata": {
                "type": "custom",
                "total_words": len(word_data),
                "generated_at": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成自定义词云失败: {str(e)}") 