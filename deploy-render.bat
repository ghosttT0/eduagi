@echo off
chcp 65001 >nul
echo 🚀 EduAGI Render 部署准备脚本

echo.
echo 📋 检查项目文件...

REM 检查必要文件是否存在
if not exist "render.yaml" (
    echo ❌ render.yaml 文件不存在
    pause
    exit /b 1
)

if not exist "backend\requirements.txt" (
    echo ❌ backend\requirements.txt 文件不存在
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ❌ frontend\package.json 文件不存在
    pause
    exit /b 1
)

echo ✅ 所有必要文件存在

echo.
echo 📝 准备Git提交...

REM 检查git状态
git status

echo.
echo 🔧 下一步操作：
echo 1. 确保项目已推送到GitHub
echo 2. 访问 https://render.com 注册账号
echo 3. 创建Blueprint服务，连接GitHub仓库
echo 4. Render会自动读取render.yaml配置
echo 5. 等待部署完成（约5-10分钟）

echo.
echo 🌐 部署完成后访问：
echo - 前端：https://eduagi-frontend.onrender.com
echo - 后端：https://eduagi-backend.onrender.com
echo - API文档：https://eduagi-backend.onrender.com/docs

echo.
echo 📖 详细说明请查看 RENDER-DEPLOY.md
echo.
pause 