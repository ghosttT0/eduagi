# 🚀 EduAGI 智能教学系统 - Hugging Face Spaces 部署

## 📋 项目简介

EduAGI 是一个基于AI的智能教学管理系统，集成了：
- 🎨 现代化React前端界面
- ⚙️ FastAPI后端API服务
- 🤖 AI驱动的教学功能
- 📊 数据分析和可视化

## 🌐 在线访问

部署完成后，你可以通过以下地址访问：

- **主界面**: https://your-username-eduagi.hf.space
- **API文档**: https://your-username-eduagi.hf.space/docs
- **健康检查**: https://your-username-eduagi.hf.space/health

## 🛠️ 技术架构

### 前端技术栈
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Ant Design** - UI组件库
- **Vite** - 构建工具
- **Axios** - HTTP客户端

### 后端技术栈
- **FastAPI** - 高性能API框架
- **SQLAlchemy** - ORM数据库操作
- **SQLite** - 轻量级数据库
- **Uvicorn** - ASGI服务器

## 📁 项目结构

```
eduagi/
├── frontend/                 # React前端
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # FastAPI后端
│   ├── api/                 # API路由
│   ├── main.py             # 应用入口
│   └── requirements.txt    # Python依赖
├── Dockerfile              # Docker构建文件
├── start.sh               # 启动脚本
├── nginx.conf             # Nginx配置
└── README-SPACES.md       # 部署说明
```

## 🚀 部署步骤

### 1. 创建Hugging Face Space

1. 访问 [Hugging Face Spaces](https://huggingface.co/spaces)
2. 点击 "Create new Space"
3. 选择 **Docker** 类型
4. 填写Space名称（如：eduagi）
5. 选择可见性（Public或Private）

### 2. 推送代码

```bash
# 克隆你的Space仓库
git clone https://huggingface.co/spaces/your-username/eduagi

# 复制项目文件
cp -r your-project/* eduagi/

# 提交并推送
cd eduagi
git add .
git commit -m "Initial deployment"
git push
```

### 3. 等待构建

- Hugging Face会自动构建Docker镜像
- 构建时间约5-10分钟
- 可以在Space页面查看构建日志

## 🔧 配置说明

### 环境变量

在Space设置中可以配置以下环境变量：

```env
# 数据库配置
DATABASE_URL=sqlite:///./teaching.db

# 安全配置
SECRET_KEY=your-secret-key-here

# AI服务配置
OPENAI_API_KEY=your-openai-api-key
DASHSCOPE_API_KEY=your-dashscope-api-key
```

### 端口配置

- **主端口**: 7860 (Hugging Face Spaces要求)
- **前端**: 静态文件服务
- **后端**: FastAPI API服务

## 📊 功能特性

### 🎓 教学管理
- 班级管理
- 学生管理
- 课程资源管理
- 考试管理

### 🤖 AI功能
- 视频内容分析
- 智能PPT生成
- 笔记智能整理
- 学习数据分析

### 📈 数据分析
- 学习进度跟踪
- 成绩统计分析
- 资源使用统计
- 用户行为分析

## 🔍 故障排除

### 常见问题

1. **构建失败**
   - 检查Dockerfile语法
   - 确认所有依赖文件存在
   - 查看构建日志

2. **前端无法访问后端**
   - 确认API路径使用相对路径 `/api`
   - 检查CORS配置
   - 验证端口配置

3. **数据库问题**
   - 确认SQLite文件权限
   - 检查数据库初始化
   - 验证数据目录存在

### 日志查看

在Space页面可以查看：
- 构建日志
- 运行日志
- 错误信息

## 🔄 更新部署

### 代码更新

```bash
# 拉取最新代码
git pull

# 提交更改
git add .
git commit -m "Update: 描述你的更改"
git push
```

### 环境变量更新

在Space设置页面更新环境变量，然后重新部署。

## 📞 技术支持

如果遇到问题：

1. 📖 查看构建日志
2. 🔍 检查配置文件
3. 💬 在Hugging Face社区寻求帮助
4. 🐛 提交Issue到项目仓库

## 🎉 部署完成

恭喜！你的EduAGI智能教学系统已经成功部署到Hugging Face Spaces。

现在你可以：
- 🌐 通过公网访问系统
- 👥 邀请用户使用
- 📊 监控系统运行状态
- �� 持续更新和维护

祝你使用愉快！🎊 