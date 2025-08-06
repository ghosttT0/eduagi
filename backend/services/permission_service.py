"""
权限管理服务
提供基于角色的权限控制
"""

from typing import List, Dict, Any, Optional
from functools import wraps
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db, User
from api.auth import get_current_user

# 权限定义
class Permissions:
    # 教师权限
    TEACHER_CREATE_PLAN = "teacher:create_plan"
    TEACHER_CREATE_MINDMAP = "teacher:create_mindmap"
    TEACHER_CREATE_EXAM = "teacher:create_exam"
    TEACHER_MANAGE_VIDEO = "teacher:manage_video"
    TEACHER_REPLY_DISPUTE = "teacher:reply_dispute"
    TEACHER_VIEW_ANALYTICS = "teacher:view_analytics"
    
    # 学生权限
    STUDENT_CHAT_AI = "student:chat_ai"
    STUDENT_PRACTICE = "student:practice"
    STUDENT_SUBMIT_DISPUTE = "student:submit_dispute"
    STUDENT_VIEW_VIDEO = "student:view_video"
    STUDENT_SELF_ASSESS = "student:self_assess"
    
    # 管理员权限
    ADMIN_MANAGE_USER = "admin:manage_user"
    ADMIN_MANAGE_CLASS = "admin:manage_class"
    ADMIN_VIEW_ANALYTICS = "admin:view_analytics"
    ADMIN_MANAGE_SYSTEM = "admin:manage_system"
    ADMIN_MANAGE_RESOURCE = "admin:manage_resource"
    
    # 文件权限
    FILE_UPLOAD = "file:upload"
    FILE_DELETE = "file:delete"
    FILE_VIEW = "file:view"

# 角色权限映射
ROLE_PERMISSIONS = {
    "学生": [
        Permissions.STUDENT_CHAT_AI,
        Permissions.STUDENT_PRACTICE,
        Permissions.STUDENT_SUBMIT_DISPUTE,
        Permissions.STUDENT_VIEW_VIDEO,
        Permissions.STUDENT_SELF_ASSESS,
        Permissions.FILE_VIEW,
    ],
    "教师": [
        # 教师权限
        Permissions.TEACHER_CREATE_PLAN,
        Permissions.TEACHER_CREATE_MINDMAP,
        Permissions.TEACHER_CREATE_EXAM,
        Permissions.TEACHER_MANAGE_VIDEO,
        Permissions.TEACHER_REPLY_DISPUTE,
        Permissions.TEACHER_VIEW_ANALYTICS,
        # 文件权限
        Permissions.FILE_UPLOAD,
        Permissions.FILE_DELETE,
        Permissions.FILE_VIEW,
        # 部分学生权限（教师可以体验学生功能）
        Permissions.STUDENT_CHAT_AI,
        Permissions.STUDENT_PRACTICE,
        Permissions.STUDENT_VIEW_VIDEO,
    ],
    "管理员": [
        # 管理员权限
        Permissions.ADMIN_MANAGE_USER,
        Permissions.ADMIN_MANAGE_CLASS,
        Permissions.ADMIN_VIEW_ANALYTICS,
        Permissions.ADMIN_MANAGE_SYSTEM,
        Permissions.ADMIN_MANAGE_RESOURCE,
        # 文件权限
        Permissions.FILE_UPLOAD,
        Permissions.FILE_DELETE,
        Permissions.FILE_VIEW,
        # 教师权限
        Permissions.TEACHER_CREATE_PLAN,
        Permissions.TEACHER_CREATE_MINDMAP,
        Permissions.TEACHER_CREATE_EXAM,
        Permissions.TEACHER_MANAGE_VIDEO,
        Permissions.TEACHER_REPLY_DISPUTE,
        Permissions.TEACHER_VIEW_ANALYTICS,
        # 学生权限
        Permissions.STUDENT_CHAT_AI,
        Permissions.STUDENT_PRACTICE,
        Permissions.STUDENT_SUBMIT_DISPUTE,
        Permissions.STUDENT_VIEW_VIDEO,
        Permissions.STUDENT_SELF_ASSESS,
    ]
}

class PermissionService:
    """权限服务类"""
    
    @staticmethod
    def get_user_permissions(user: User) -> List[str]:
        """获取用户权限列表"""
        return ROLE_PERMISSIONS.get(user.role, [])
    
    @staticmethod
    def has_permission(user: User, permission: str) -> bool:
        """检查用户是否有特定权限"""
        user_permissions = PermissionService.get_user_permissions(user)
        return permission in user_permissions
    
    @staticmethod
    def has_any_permission(user: User, permissions: List[str]) -> bool:
        """检查用户是否有任意一个权限"""
        user_permissions = PermissionService.get_user_permissions(user)
        return any(perm in user_permissions for perm in permissions)
    
    @staticmethod
    def has_all_permissions(user: User, permissions: List[str]) -> bool:
        """检查用户是否有所有权限"""
        user_permissions = PermissionService.get_user_permissions(user)
        return all(perm in user_permissions for perm in permissions)
    
    @staticmethod
    def check_permission(user: User, permission: str) -> None:
        """检查权限，如果没有权限则抛出异常"""
        if not PermissionService.has_permission(user, permission):
            raise HTTPException(
                status_code=403,
                detail=f"权限不足，需要权限: {permission}"
            )
    
    @staticmethod
    def check_role(user: User, allowed_roles: List[str]) -> None:
        """检查角色，如果角色不匹配则抛出异常"""
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"角色权限不足，需要角色: {', '.join(allowed_roles)}"
            )

# 权限装饰器
def require_permission(permission: str):
    """权限装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 从kwargs中获取current_user
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="未认证")
            
            PermissionService.check_permission(current_user, permission)
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_role(allowed_roles: List[str]):
    """角色装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 从kwargs中获取current_user
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="未认证")
            
            PermissionService.check_role(current_user, allowed_roles)
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# 权限依赖函数
def require_teacher_permission():
    """要求教师权限的依赖"""
    def check_permission(current_user: User = Depends(get_current_user)):
        PermissionService.check_role(current_user, ["教师", "管理员"])
        return current_user
    return check_permission

def require_admin_permission():
    """要求管理员权限的依赖"""
    def check_permission(current_user: User = Depends(get_current_user)):
        PermissionService.check_role(current_user, ["管理员"])
        return current_user
    return check_permission

def require_student_permission():
    """要求学生权限的依赖"""
    def check_permission(current_user: User = Depends(get_current_user)):
        PermissionService.check_role(current_user, ["学生", "教师", "管理员"])
        return current_user
    return check_permission

def require_specific_permission(permission: str):
    """要求特定权限的依赖"""
    def check_permission(current_user: User = Depends(get_current_user)):
        PermissionService.check_permission(current_user, permission)
        return current_user
    return check_permission

# 资源访问控制
class ResourceAccessControl:
    """资源访问控制"""
    
    @staticmethod
    def can_access_teaching_plan(user: User, plan_teacher_id: int) -> bool:
        """检查是否可以访问教学计划"""
        if user.role == "管理员":
            return True
        if user.role == "教师" and user.id == plan_teacher_id:
            return True
        return False
    
    @staticmethod
    def can_access_student_data(user: User, student_id: int) -> bool:
        """检查是否可以访问学生数据"""
        if user.role == "管理员":
            return True
        if user.role == "学生" and user.id == student_id:
            return True
        # 教师可以访问同班级学生数据
        if user.role == "教师" and user.class_id:
            # 这里需要查询学生的班级信息
            return True  # 简化处理，实际需要查询数据库
        return False
    
    @staticmethod
    def can_access_class_data(user: User, class_id: int) -> bool:
        """检查是否可以访问班级数据"""
        if user.role == "管理员":
            return True
        if user.class_id == class_id:
            return True
        return False
    
    @staticmethod
    def can_manage_video(user: User, video_teacher_id: int) -> bool:
        """检查是否可以管理视频"""
        if user.role == "管理员":
            return True
        if user.role == "教师" and user.id == video_teacher_id:
            return True
        return False

# 数据过滤器
class DataFilter:
    """数据过滤器，根据用户权限过滤数据"""
    
    @staticmethod
    def filter_teaching_plans(user: User, query):
        """过滤教学计划查询"""
        if user.role == "管理员":
            return query  # 管理员可以看到所有
        elif user.role == "教师":
            return query.filter_by(teacher_id=user.id)  # 教师只能看到自己的
        else:
            return query.filter(False)  # 学生不能看到
    
    @staticmethod
    def filter_student_data(user: User, query):
        """过滤学生数据查询"""
        if user.role == "管理员":
            return query  # 管理员可以看到所有
        elif user.role == "教师" and user.class_id:
            return query.filter_by(class_id=user.class_id)  # 教师只能看到同班级的
        elif user.role == "学生":
            return query.filter_by(id=user.id)  # 学生只能看到自己的
        else:
            return query.filter(False)
    
    @staticmethod
    def filter_videos(user: User, query):
        """过滤视频查询"""
        if user.role == "管理员":
            return query  # 管理员可以看到所有
        elif user.role == "教师":
            # 教师可以看到自己的和已发布的
            from database import VideoResource
            return query.filter(
                (VideoResource.teacher_id == user.id) | 
                (VideoResource.status == "已发布")
            )
        else:
            # 学生只能看到已发布的
            from database import VideoResource
            return query.filter(VideoResource.status == "已发布")

# 创建权限服务实例
permission_service = PermissionService()
