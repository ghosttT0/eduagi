# 🚀 EduAGI 构建部署指南

## 🐛 常见构建错误及解决方案

### 1. 前端构建错误

#### ❌ 错误：Multiple exports with the same name
```
ERROR: Multiple exports with the same name "teacherAPI"
ERROR: Multiple exports with the same name "studentAPI"  
ERROR: Multiple exports with the same name "adminAPI"
```

#### ✅ 解决方案
这个错误已经在最新版本中修复。如果仍然遇到，请：

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 清理前端缓存
cd frontend
rm -rf node_modules
rm package-lock.json
npm install

# 3. 重新构建
npm run build
```

### 2. 后端构建错误

#### ❌ 错误：ModuleNotFoundError
```
ModuleNotFoundError: No module named 'xxx'
```

#### ✅ 解决方案
```bash
# 1. 确保在虚拟环境中
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 2. 安装依赖
pip install -r requirements.txt

# 3. 如果仍有问题，升级pip
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## 🔧 完整构建流程

### 方式一：开发环境（推荐）

#### 1. 后端启动
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. 前端启动
```bash
cd frontend
npm install
npm start
```

#### 3. 访问应用
- 前端：http://localhost:3000
- 后端API：http://localhost:8000/docs

### 方式二：生产环境构建

#### 1. 前端构建
```bash
cd frontend
npm install
npm run build
```

#### 2. 后端生产启动
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 方式三：Docker部署

#### 1. 创建 docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./eduagi.db
      - SECRET_KEY=your-secret-key
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

#### 2. 启动服务
```bash
docker-compose up -d
```

## 🔍 故障排除

### 前端问题

#### 问题1：npm install 失败
```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 问题2：TypeScript 编译错误
```bash
# 检查 TypeScript 版本
npm list typescript
# 如果版本不匹配，重新安装
npm install typescript@latest
```

#### 问题3：端口占用
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000
# 杀死进程（Windows）
taskkill /PID <PID> /F
```

### 后端问题

#### 问题1：Python 版本不兼容
```bash
# 检查 Python 版本（需要 3.8+）
python --version
# 如果版本过低，请升级 Python
```

#### 问题2：数据库连接失败
```bash
# 检查数据库文件权限
ls -la backend/
# 确保 uploads 目录存在
mkdir -p uploads
```

#### 问题3：AI API 调用失败
```bash
# 检查环境变量
echo $QWEN_API_KEY
# 如果为空，设置环境变量
export QWEN_API_KEY=your-api-key
```

## 📋 环境检查清单

### 开发环境要求
- [ ] Python 3.8+
- [ ] Node.js 16+
- [ ] npm 或 yarn
- [ ] Git

### 配置检查
- [ ] 后端依赖安装完成
- [ ] 前端依赖安装完成
- [ ] 环境变量配置正确
- [ ] 端口 3000 和 8000 可用

### 功能测试
- [ ] 后端 API 文档可访问 (http://localhost:8000/docs)
- [ ] 前端页面正常加载 (http://localhost:3000)
- [ ] 用户登录功能正常
- [ ] AI 功能响应正常

## 🚀 快速修复命令

### 一键重置开发环境
```bash
# 后端重置
cd backend
deactivate 2>/dev/null || true
rm -rf venv
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 前端重置
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### 一键启动开发环境
```bash
# 启动脚本（Windows）
# start_dev.bat
@echo off
start cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload"
start cmd /k "cd frontend && npm start"
echo "开发环境启动中..."
echo "前端: http://localhost:3000"
echo "后端: http://localhost:8000/docs"
```

```bash
# 启动脚本（Linux/Mac）
# start_dev.sh
#!/bin/bash
cd backend
source venv/bin/activate
uvicorn main:app --reload &

cd ../frontend
npm start &

echo "开发环境启动中..."
echo "前端: http://localhost:3000"
echo "后端: http://localhost:8000/docs"
```

## 📞 获取帮助

如果遇到其他问题：

1. 检查 [GitHub Issues](https://github.com/ghosttT0/eduagi/issues)
2. 查看详细日志输出
3. 确认环境配置正确
4. 提交新的 Issue 并附上错误信息

---

💡 **提示**: 建议使用开发环境进行测试，确认功能正常后再进行生产部署。
