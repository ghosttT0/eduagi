# 简化的EduAGI Hugging Face Spaces部署脚本

Write-Host "🚀 开始部署 EduAGI 到 Hugging Face Spaces..." -ForegroundColor Green

# 获取用户名
Write-Host "请输入你的Hugging Face用户名:" -ForegroundColor Blue
$USERNAME = Read-Host

if ([string]::IsNullOrEmpty($USERNAME)) {
    Write-Host "❌ 用户名不能为空" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 用户名: $USERNAME" -ForegroundColor Green

# 检查git
try {
    git --version | Out-Null
    Write-Host "✅ Git已安装" -ForegroundColor Green
} catch {
    Write-Host "❌ Git未安装，请先安装Git" -ForegroundColor Red
    exit 1
}

# 创建Space目录
$SPACE_NAME = "eduagi"
if (Test-Path $SPACE_NAME) {
    Remove-Item -Recurse -Force $SPACE_NAME
}

Write-Host "📁 创建Space目录..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $SPACE_NAME -Force | Out-Null

# 复制文件
Write-Host "📋 复制项目文件..." -ForegroundColor Yellow
Copy-Item -Recurse -Force "frontend" "$SPACE_NAME/"
Copy-Item -Recurse -Force "backend" "$SPACE_NAME/"
Copy-Item -Force "Dockerfile" "$SPACE_NAME/"
Copy-Item -Force "start.sh" "$SPACE_NAME/"
Copy-Item -Force "nginx.conf" "$SPACE_NAME/"
Copy-Item -Force "README-SPACES.md" "$SPACE_NAME/README.md"

# 创建.gitignore
$gitignore = @"
# Python
__pycache__/
*.py[cod]
*.so
.Python
build/
dist/
*.egg-info/

# Node.js
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Database
*.db
*.sqlite

# Uploads
upload/
data/
"@

Set-Content -Path "$SPACE_NAME/.gitignore" -Value $gitignore

# 进入Space目录
Set-Location $SPACE_NAME

# 初始化git
Write-Host "📝 初始化Git仓库..." -ForegroundColor Yellow
git init
git remote add origin "https://huggingface.co/spaces/$USERNAME/$SPACE_NAME"

# 提交
git add .
git commit -m "Initial deployment of EduAGI"

# 推送
Write-Host "🚀 推送到Hugging Face Spaces..." -ForegroundColor Yellow
git push -u origin main

Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "🌐 访问地址: https://$USERNAME-$SPACE_NAME.hf.space" -ForegroundColor Green
Write-Host "📚 API文档: https://$USERNAME-$SPACE_NAME.hf.space/docs" -ForegroundColor Green

Write-Host "📝 后续步骤:" -ForegroundColor Yellow
Write-Host "1. 等待构建完成（约5-10分钟）" -ForegroundColor Yellow
Write-Host "2. 在Space设置中配置环境变量" -ForegroundColor Yellow
Write-Host "3. 测试系统功能" -ForegroundColor Yellow

Write-Host "🎉 部署脚本执行完成！" -ForegroundColor Green 