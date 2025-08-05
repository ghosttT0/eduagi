# pages/__init__.py
# EduAGI 页面模块初始化文件

# 导入所有页面模块
from . import teacher
from . import student
from . import admin
from . import analytics
from . import manage
from . import resource
from . import exam
from . import clouds
from . import video
from . import pptgen
from . import notes

# 定义模块的公开接口
__all__ = [
    'teacher',
    'student',
    'admin',
    'analytics',
    'manage',
    'resource',
    'exam',
    'clouds',
    'video',
    'pptgen',
    'notes'
]
