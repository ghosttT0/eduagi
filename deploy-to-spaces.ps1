# EduAGI Hugging Face Spaces 部署脚本 (PowerShell版本)

Write-Host "🚀 开始部署 EduAGI 到 Hugging Face Spaces..." -ForegroundColor Green

# 配置变量
$SPACE_NAME = "eduagi"
$USERNAME = ""

# 获取用户名
Write-Host "请输入你的Hugging Face用户名:" -ForegroundColor Blue
$USERNAME = Read-Host

if ([string]::IsNullOrEmpty($USERNAME)) {
    Write-Host "❌ 用户名不能为空" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 用户名: $USERNAME" -ForegroundColor Green

# 检查git是否安装
try {
    git --version | Out-Null
    Write-Host "✅ Git已安装" -ForegroundColor Green
} catch {
    Write-Host "❌ Git未安装，请先安装Git" -ForegroundColor Red
    exit 1
}

# 检查是否在git仓库中
if (-not (Test-Path ".git")) {
    Write-Host "⚠️  当前目录不是git仓库，正在初始化..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit"
}

# 克隆Space仓库
Write-Host "📥 克隆Hugging Face Space仓库..." -ForegroundColor Yellow
$SPACE_URL = "https://huggingface.co/spaces/$USERNAME/$SPACE_NAME"

if (Test-Path $SPACE_NAME) {
    Write-Host "⚠️  目录 $SPACE_NAME 已存在，正在删除..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $SPACE_NAME
}

# 尝试克隆仓库
$cloneResult = git clone $SPACE_URL $SPACE_NAME 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Space仓库不存在，正在创建..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $SPACE_NAME -Force | Out-Null
    Set-Location $SPACE_NAME
    git init
    git remote add origin $SPACE_URL
    Set-Location ..
} else {
    Write-Host "✅ Space仓库克隆成功" -ForegroundColor Green
}

# 复制项目文件
Write-Host "📋 复制项目文件..." -ForegroundColor Yellow
Copy-Item -Recurse -Force "frontend" "$SPACE_NAME/"
Copy-Item -Recurse -Force "backend" "$SPACE_NAME/"
Copy-Item -Force "Dockerfile" "$SPACE_NAME/"
Copy-Item -Force "start.sh" "$SPACE_NAME/"
Copy-Item -Force "nginx.conf" "$SPACE_NAME/"
Copy-Item -Force "README-SPACES.md" "$SPACE_NAME/README.md"

# 创建.gitignore
Write-Host "📝 创建.gitignore文件..." -ForegroundColor Yellow
$gitignoreContent = @"
# Python
__pycache__/
*.py[cod]
*`$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Database
*.db
*.sqlite
*.sqlite3

# Uploads
upload/
data/
"@

Set-Content -Path "$SPACE_NAME/.gitignore" -Value $gitignoreContent

# 进入Space目录
Set-Location $SPACE_NAME

# 提交更改
Write-Host "📝 提交更改..." -ForegroundColor Yellow
git add .
$commitResult = git commit -m "Deploy EduAGI to Hugging Face Spaces" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 更改已提交" -ForegroundColor Green
} else {
    Write-Host "⚠️  没有新的更改需要提交" -ForegroundColor Yellow
}

# 推送到Hugging Face
Write-Host "🚀 推送到Hugging Face Spaces..." -ForegroundColor Yellow
$pushResult = git push origin main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 推送成功" -ForegroundColor Green
} else {
    $pushResult = git push origin master 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 推送成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 推送失败，请检查：" -ForegroundColor Red
        Write-Host "1. 确认Space仓库已创建" -ForegroundColor Yellow
        Write-Host "2. 确认有推送权限" -ForegroundColor Yellow
        Write-Host "3. 确认网络连接正常" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "🌐 访问地址: https://$USERNAME-$SPACE_NAME.hf.space" -ForegroundColor Green
Write-Host "📚 API文档: https://$USERNAME-$SPACE_NAME.hf.space/docs" -ForegroundColor Green
Write-Host "🔧 健康检查: https://$USERNAME-$SPACE_NAME.hf.space/health" -ForegroundColor Green

Write-Host "📝 后续步骤:" -ForegroundColor Yellow
Write-Host "1. 等待构建完成（约5-10分钟）" -ForegroundColor Yellow
Write-Host "2. 在Space设置中配置环境变量" -ForegroundColor Yellow
Write-Host "3. 测试系统功能" -ForegroundColor Yellow

Write-Host "🎉 部署脚本执行完成！" -ForegroundColor Green 