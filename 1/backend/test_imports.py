#!/usr/bin/env python3
"""
测试所有模块的导入
"""

def test_imports():
    """测试所有必要的导入"""
    print("🔍 测试模块导入...")
    
    try:
        # 测试核心模块
        print("📦 测试核心模块...")
        import fastapi
        import uvicorn
        import sqlalchemy
        print("✅ 核心模块导入成功")
        
        # 测试认证模块
        print("🔐 测试认证模块...")
        from auth import verify_password, get_password_hash, create_access_token, verify_token
        print("✅ 认证模块导入成功")
        
        # 测试数据库模块
        print("🗄️ 测试数据库模块...")
        from database import get_db, User, Class, init_db
        print("✅ 数据库模块导入成功")
        
        # 测试API路由
        print("🌐 测试API路由...")
        from api.auth import auth_router, get_current_user
        from api.users import users_router
        from api.classes import classes_router
        from api.videos import videos_router
        print("✅ API路由导入成功")
        
        # 测试工具模块
        print("🛠️ 测试工具模块...")
        from utilstongyi import analyze_video_with_tongyi, get_video_info
        print("✅ 工具模块导入成功")
        
        print("\n🎉 所有模块导入成功！")
        return True
        
    except ImportError as e:
        print(f"❌ 导入失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 其他错误: {e}")
        return False

if __name__ == "__main__":
    test_imports() 