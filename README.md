# EduAGI 智能教学系统

基于AI的教育管理系统，采用前后端分离架构。

## 系统架构

### 后端 (Backend)
- **技术栈**: FastAPI + SQLAlchemy + SQLite/PostgreSQL
- **主要功能**: 
  - RESTful API 接口
  - 用户认证与授权 (JWT)
  - 数据库操作
  - AI 视频分析 (通义千问)
  - 文件上传与管理

### 前端 (Frontend)
- **技术栈**: React + TypeScript + Ant Design + Vite
- **主要功能**:
  - 响应式用户界面
  - 角色权限管理
  - 实时数据展示
  - 文件上传下载

## 快速开始

### 1. 后端部署

#### 环境要求
- Python 3.8+
- pip

#### 安装步骤

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp env.example .env
# 编辑 .env 文件，填入你的配置信息

# 启动服务
python start.py
```

#### 环境变量配置 (.env)
```env
# 数据库配置
DATABASE_URL=sqlite:///./data/teaching.db

# JWT配置
SECRET_KEY=your-secret-key-here-change-this-in-production

# 通义千问API配置
TONGYI_API_KEY=your-tongyi-api-key-here

# 七牛云配置
QINIU_ACCESS_KEY=your-qiniu-access-key
QINIU_SECRET_KEY=your-qiniu-secret-key
QINIU_BUCKET_NAME=your-bucket-name
QINIU_DOMAIN=your-domain.com

# 其他API配置
DEEPSEEK_API_KEY=your-deepseek-api-key
```

### 2. 前端部署

#### 环境要求
- Node.js 16+
- npm 或 yarn

#### 安装步骤

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 3. 访问系统

- **前端地址**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs

## 默认账号

系统初始化时会创建以下默认账号：

| 角色 | 账号 | 密码 | 说明 |
|------|------|------|------|
| 管理员 | admin | admin123 | 系统管理员 |
| 教师 | T001 | teacher123 | 计算机科学1班教师 |
| 教师 | T002 | teacher123 | 软件工程1班教师 |
| 学生 | S001 | student123 | 计算机科学1班学生 |
| 学生 | S002 | student123 | 计算机科学1班学生 |
| 学生 | S003 | student123 | 软件工程1班学生 |

## 功能模块

### 管理员端
- **仪表板**: 系统概览和统计数据
- **用户管理**: 增删改查用户信息
- **班级管理**: 管理班级信息
- **资源管理**: 管理教学资源
- **视频分析**: AI视频内容分析
- **数据分析**: 系统使用统计
- **系统设置**: 系统配置管理

### 教师端
- **仪表板**: 教学数据概览
- **资源管理**: 上传和管理教学资源
- **视频分析**: 分析教学视频内容
- **考试管理**: 创建和管理考试
- **笔记管理**: 个人笔记管理
- **个人设置**: 个人信息设置

### 学生端
- **学习中心**: 学习进度和统计
- **学习资源**: 查看和下载资源
- **视频学习**: 观看和分析视频
- **考试中心**: 参加考试
- **我的笔记**: 个人笔记管理
- **个人设置**: 个人信息设置

## API 接口

### 认证相关
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 用户管理
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `PUT /api/users/{id}` - 更新用户
- `DELETE /api/users/{id}` - 删除用户

### 视频分析
- `POST /api/videos/analyze` - 分析视频
- `GET /api/videos/history` - 获取分析历史
- `GET /api/videos/{id}` - 获取分析结果

### 其他接口
更多API接口请查看: http://localhost:8000/docs

## 部署到云服务器

### 后端部署

1. **上传代码到服务器**
```bash
# 使用 git 或 scp 上传代码
git clone <your-repo-url>
cd eduagi/backend
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **配置环境变量**
```bash
cp env.example .env
# 编辑 .env 文件
```

4. **使用 Gunicorn 启动**
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

5. **配置 Nginx 反向代理**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 前端部署

1. **构建生产版本**
```bash
cd frontend
npm run build
```

2. **上传到服务器**
```bash
# 将 dist 目录上传到服务器
scp -r dist/ user@server:/var/www/eduagi/
```

3. **配置 Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/eduagi;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 开发指南

### 后端开发

1. **添加新的API路由**
```python
# 在 backend/api/ 目录下创建新的路由文件
from fastapi import APIRouter
router = APIRouter()

@router.get("/example")
async def example():
    return {"message": "Hello World"}
```

2. **在 main.py 中注册路由**
```python
from api.example import router as example_router
app.include_router(example_router, prefix="/api/example", tags=["示例"])
```

### 前端开发

1. **添加新的页面组件**
```typescript
// 在 src/pages/ 目录下创建新页面
import React from 'react'

const NewPage: React.FC = () => {
  return <div>新页面</div>
}

export default NewPage
```

2. **配置路由**
```typescript
// 在对应的布局组件中添加路由
<Route path="/new-page" element={<NewPage />} />
```

## 技术栈

### 后端
- **FastAPI**: 现代、快速的Web框架
- **SQLAlchemy**: ORM数据库操作
- **Pydantic**: 数据验证
- **JWT**: 用户认证
- **Uvicorn**: ASGI服务器

### 前端
- **React 18**: 用户界面库
- **TypeScript**: 类型安全
- **Ant Design**: UI组件库
- **Vite**: 构建工具
- **React Router**: 路由管理
- **Axios**: HTTP客户端
- **Zustand**: 状态管理

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请联系开发团队。
