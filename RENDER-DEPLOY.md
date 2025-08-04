# 🚀 EduAGI Render 部署指南

## 📋 部署步骤

### 1. 准备GitHub仓库
确保项目已推送到GitHub

### 2. 注册Render账号
访问 [Render](https://render.com) 使用GitHub注册

### 3. 创建服务

#### 方法一：使用render.yaml（推荐）
1. 登录Render控制台
2. 点击 "New +" → "Blueprint"
3. 连接GitHub仓库
4. Render自动读取render.yaml配置

#### 方法二：手动创建
**后端服务：**
- 类型：Web Service
- 环境：Python
- 构建命令：`pip install -r backend/requirements.txt`
- 启动命令：`cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

**前端服务：**
- 类型：Static Site
- 构建命令：`cd frontend && npm install && npm run build`
- 发布目录：`frontend/dist`

### 4. 配置环境变量

**后端：**
```env
DATABASE_URL=sqlite:///./teaching.db
SECRET_KEY=your-secret-key
CORS_ORIGINS=https://eduagi-frontend.onrender.com
```

**前端：**
```env
REACT_APP_API_URL=https://eduagi-backend.onrender.com/api
```

### 5. 访问地址
- 前端：`https://eduagi-frontend.onrender.com`
- 后端：`https://eduagi-backend.onrender.com`
- API文档：`https://eduagi-backend.onrender.com/docs`

## 🎉 部署完成！ 