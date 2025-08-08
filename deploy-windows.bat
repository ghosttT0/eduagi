@echo off
chcp 65001 >nul
echo 🚀 EduAGI Windows 部署脚本

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker未安装，请先安装Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker已安装

REM 检查Docker Compose是否可用
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose不可用
    pause
    exit /b 1
)

echo ✅ Docker Compose可用

REM 创建必要的目录
if not exist "data" mkdir data
if not exist "upload" mkdir upload

REM 复制环境配置文件
if not exist "backend\.env" (
    copy "backend\env.example" "backend\.env"
    echo ⚠️  请编辑 backend\.env 文件配置数据库设置
)

REM 构建并启动服务
echo 🔨 构建并启动服务...
docker-compose up -d --build

if errorlevel 1 (
    echo ❌ 部署失败
    pause
    exit /b 1
)

echo ✅ 部署成功！
echo.
echo 🌐 访问地址:
echo   前端: http://localhost
echo   API文档: http://localhost/docs
echo   健康检查: http://localhost/health
echo.
echo 📊 查看服务状态: docker-compose ps
echo 📝 查看日志: docker-compose logs -f
echo 🛑 停止服务: docker-compose down
echo.
pause 
 
 