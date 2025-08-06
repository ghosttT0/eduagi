# EduAGI 前后端分离版本部署指南

## 🎉 项目概述

EduAGI智能教学系统已成功从Streamlit单体应用转换为现代化的前后端分离架构：

- **后端**: FastAPI + SQLAlchemy + PostgreSQL/SQLite
- **前端**: React + TypeScript + Ant Design
- **AI服务**: 集成通义千问大模型
- **文件存储**: 支持本地存储和七牛云存储

## 📁 项目结构

```
eduagi/
├── backend/                 # 后端API服务
│   ├── api/                # API路由
│   │   ├── auth.py        # 认证相关
│   │   ├── teacher.py     # 教师端功能
│   │   ├── student.py     # 学生端功能
│   │   ├── analytics.py   # 管理员数据分析
│   │   └── files.py       # 文件管理
│   ├── services/          # 业务服务
│   │   ├── ai_service.py  # AI服务集成
│   │   ├── file_service.py # 文件服务
│   │   └── permission_service.py # 权限管理
│   ├── database.py        # 数据库模型
│   ├── main.py           # FastAPI应用入口
│   └── requirements.txt   # Python依赖
├── frontend/              # 前端React应用
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   ├── services/     # API服务
│   │   └── stores/       # 状态管理
│   └── package.json      # Node.js依赖
└── uploads/              # 文件上传目录
```

## 🚀 快速开始

### 1. 环境准备

确保您的系统已安装：
- Python 3.8+
- Node.js 16+
- npm 或 yarn

### 2. 后端部署

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 设置环境变量（可选）
# 创建 .env 文件
cat > .env << EOF
# 数据库配置
DATABASE_URL=sqlite:///./eduagi.db

# JWT配置
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI服务配置
QWEN_API_KEY=your-qwen-api-key

# 七牛云配置（可选）
QINIU_ACCESS_KEY=your-qiniu-access-key
QINIU_SECRET_KEY=your-qiniu-secret-key
QINIU_BUCKET_NAME=your-bucket-name
QINIU_DOMAIN=your-domain.com
EOF

# 启动后端服务
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. 前端部署

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
# 或使用 yarn
yarn install

# 设置环境变量
# 创建 .env 文件
cat > .env << EOF
REACT_APP_API_BASE_URL=http://localhost:8000
EOF

# 启动前端开发服务器
npm start
# 或使用 yarn
yarn start
```

### 4. 访问应用

- 前端应用: http://localhost:3000
- 后端API文档: http://localhost:8000/docs
- 后端管理界面: http://localhost:8000/redoc

## 👥 默认用户账号

系统预设了以下测试账号：

| 角色 | 账号 | 密码 | 说明 |
|------|------|------|------|
| 管理员 | admin | admin123 | 系统管理员，拥有所有权限 |
| 教师 | T001 | teacher123 | 教师账号，可使用教学功能 |
| 学生 | S001 | student123 | 学生账号，可使用学习功能 |

## 🔧 核心功能

### 教师端功能
- ✅ **智能教学设计**: AI生成专业教案
- ✅ **AI知识图谱**: 自动构建知识结构图
- ✅ **智能出题**: 生成选择题、简答题、编程题
- ✅ **学生疑问处理**: 集中处理学生提问
- ✅ **视频管理中心**: 上传视频并AI分析

### 学生端功能
- ✅ **AI学习伙伴**: 多模式智能对话
- ✅ **自主练习**: 针对性练习和反馈
- ✅ **向老师提问**: 直接向教师提交疑问
- ✅ **知识掌握评估**: 自我评估学习情况
- ✅ **视频学习中心**: 观看教学视频

### 管理员端功能
- ✅ **数据智能驾驶舱**: 全面的数据分析
- ✅ **用户管理**: 管理学生、教师账号
- ✅ **班级管理**: 班级分配和统计
- ✅ **系统监控**: 活动记录和性能监控

## 🔐 权限系统

系统采用基于角色的权限控制（RBAC）：

- **学生**: 只能访问学习相关功能
- **教师**: 可使用教学功能 + 部分学生功能
- **管理员**: 拥有所有权限

## 📁 文件管理

支持两种存储方式：

1. **本地存储**: 文件保存在 `uploads/` 目录
2. **七牛云存储**: 配置七牛云后自动上传

支持的文件类型：
- 视频: .mp4, .avi, .mov, .wmv, .flv, .webm
- 图片: .jpg, .jpeg, .png, .gif, .bmp, .webp
- 文档: .pdf, .doc, .docx, .ppt, .pptx, .txt

## 🤖 AI功能配置

### 通义千问配置

1. 获取API密钥：访问 [阿里云DashScope](https://dashscope.aliyun.com/)
2. 设置环境变量：`QWEN_API_KEY=your-api-key`
3. 重启后端服务

### AI功能说明

- **智能教学设计**: 根据课程信息生成结构化教案
- **知识图谱生成**: 自动构建层次化知识结构
- **智能出题**: 生成多类型试题和标准答案
- **视频内容分析**: 分析视频内容并生成学习报告
- **学习对话**: 支持多种对话模式的AI导师

## 🔧 生产环境部署

### 使用Docker部署

```bash
# 构建后端镜像
cd backend
docker build -t eduagi-backend .

# 构建前端镜像
cd frontend
docker build -t eduagi-frontend .

# 使用docker-compose启动
docker-compose up -d
```

### 使用Nginx反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # 后端API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 文件上传
    location /uploads/ {
        alias /path/to/uploads/;
    }
}
```

## 📊 性能优化

1. **数据库优化**: 添加适当的索引
2. **缓存策略**: 使用Redis缓存热点数据
3. **文件CDN**: 使用七牛云CDN加速文件访问
4. **API限流**: 防止API滥用

## 🐛 故障排除

### 常见问题

1. **后端启动失败**
   - 检查Python版本和依赖
   - 确认数据库连接配置
   - 查看错误日志

2. **前端无法连接后端**
   - 检查API_BASE_URL配置
   - 确认后端服务正在运行
   - 检查CORS配置

3. **AI功能不可用**
   - 检查QWEN_API_KEY配置
   - 确认网络连接
   - 查看AI服务日志

4. **文件上传失败**
   - 检查uploads目录权限
   - 确认文件大小限制
   - 检查存储空间

## 📝 开发指南

### 添加新功能

1. **后端API**: 在 `backend/api/` 中添加新的路由
2. **前端页面**: 在 `frontend/src/pages/` 中添加新组件
3. **数据库**: 在 `backend/database.py` 中添加新模型
4. **权限**: 在 `backend/services/permission_service.py` 中配置权限

### 代码规范

- 后端遵循PEP 8规范
- 前端使用ESLint和Prettier
- 提交前运行测试用例

## 📞 技术支持

如有问题，请：
1. 查看本文档的故障排除部分
2. 检查GitHub Issues
3. 联系技术支持团队

---

🎉 **恭喜！您已成功部署EduAGI智能教学系统的前后端分离版本！**
