# 🚀 EduAGI 快速部署到 Hugging Face Spaces

## 📋 部署前准备

1. **Hugging Face 账号**
   - 注册 [Hugging Face](https://huggingface.co) 账号
   - 确保账号已激活

2. **本地环境**
   - Git 已安装
   - 项目文件完整

## 🎯 一键部署

### 方法一：使用自动部署脚本

```bash
# 运行部署脚本
./deploy-to-spaces.sh
```

脚本会自动：
- ✅ 创建Hugging Face Space
- ✅ 复制项目文件
- ✅ 配置Docker环境
- ✅ 推送到远程仓库

### 方法二：手动部署

1. **创建Space**
   - 访问 https://huggingface.co/spaces
   - 点击 "Create new Space"
   - 选择 **Docker** 类型
   - 填写Space名称：`eduagi`

2. **推送代码**
   ```bash
   # 克隆Space仓库
   git clone https://huggingface.co/spaces/your-username/eduagi
   
   # 复制项目文件
   cp -r frontend/ eduagi/
   cp -r backend/ eduagi/
   cp Dockerfile eduagi/
   cp start.sh eduagi/
   cp nginx.conf eduagi/
   
   # 提交并推送
   cd eduagi
   git add .
   git commit -m "Initial deployment"
   git push
   ```

## ⏱️ 部署时间

- **构建时间**: 5-10分钟
- **首次部署**: 可能需要更长时间
- **后续更新**: 3-5分钟

## 🌐 访问地址

部署完成后，访问：
- **主界面**: `https://your-username-eduagi.hf.space`
- **API文档**: `https://your-username-eduagi.hf.space/docs`
- **健康检查**: `https://your-username-eduagi.hf.space/health`

## 🔧 环境变量配置

在Space设置页面配置：

```env
# 数据库配置
DATABASE_URL=sqlite:///./teaching.db

# 安全配置
SECRET_KEY=your-secret-key-here

# AI服务配置（可选）
OPENAI_API_KEY=your-openai-api-key
DASHSCOPE_API_KEY=your-dashscope-api-key
```

## 📊 部署状态检查

1. **构建状态**
   - 绿色 ✅ = 构建成功
   - 红色 ❌ = 构建失败
   - 黄色 ⏳ = 构建中

2. **运行状态**
   - 绿色 ✅ = 运行正常
   - 红色 ❌ = 运行异常

## 🔍 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 检查Dockerfile语法
   docker build -t test .
   
   # 查看构建日志
   # 在Space页面查看详细错误信息
   ```

2. **前端无法访问**
   - 确认API路径使用相对路径 `/api`
   - 检查CORS配置
   - 验证端口配置

3. **数据库问题**
   - 确认SQLite文件权限
   - 检查数据库初始化
   - 验证数据目录存在

### 日志查看

在Space页面可以查看：
- 📋 构建日志
- 📊 运行日志
- ❌ 错误信息

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

1. 📖 查看详细文档：`README-SPACES.md`
2. 🔍 检查构建日志
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