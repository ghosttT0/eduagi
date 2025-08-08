#!/bin/bash

# EduAGI Hugging Face Spaces 部署脚本

set -e

echo "🚀 开始部署 EduAGI 到 Hugging Face Spaces..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
SPACE_NAME="eduagi"
USERNAME=""

# 获取用户名
echo -e "${BLUE}请输入你的Hugging Face用户名:${NC}"
read USERNAME

if [ -z "$USERNAME" ]; then
    echo -e "${RED}❌ 用户名不能为空${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 用户名: $USERNAME${NC}"

# 检查git是否安装
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git未安装，请先安装Git${NC}"
    exit 1
fi

# 检查是否在git仓库中
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  当前目录不是git仓库，正在初始化...${NC}"
    git init
    git add .
    git commit -m "Initial commit"
fi

# 克隆Space仓库
echo -e "${YELLOW}📥 克隆Hugging Face Space仓库...${NC}"
SPACE_URL="https://huggingface.co/spaces/$USERNAME/$SPACE_NAME"

if [ -d "$SPACE_NAME" ]; then
    echo -e "${YELLOW}⚠️  目录 $SPACE_NAME 已存在，正在删除...${NC}"
    rm -rf "$SPACE_NAME"
fi

git clone "$SPACE_URL" "$SPACE_NAME" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Space仓库不存在，正在创建...${NC}"
    mkdir -p "$SPACE_NAME"
    cd "$SPACE_NAME"
    git init
    git remote add origin "$SPACE_URL"
    cd ..
}

# 复制项目文件
echo -e "${YELLOW}📋 复制项目文件...${NC}"
cp -r frontend/ "$SPACE_NAME/"
cp -r backend/ "$SPACE_NAME/"
cp Dockerfile "$SPACE_NAME/"
cp start.sh "$SPACE_NAME/"
cp nginx.conf "$SPACE_NAME/"
cp README-SPACES.md "$SPACE_NAME/README.md"

# 创建.gitignore
echo -e "${YELLOW}📝 创建.gitignore文件...${NC}"
cat > "$SPACE_NAME/.gitignore" << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
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
EOF

# 进入Space目录
cd "$SPACE_NAME"

# 提交更改
echo -e "${YELLOW}📝 提交更改...${NC}"
git add .
git commit -m "Deploy EduAGI to Hugging Face Spaces" || {
    echo -e "${YELLOW}⚠️  没有新的更改需要提交${NC}"
}

# 推送到Hugging Face
echo -e "${YELLOW}🚀 推送到Hugging Face Spaces...${NC}"
git push origin main || git push origin master || {
    echo -e "${RED}❌ 推送失败，请检查：${NC}"
    echo -e "${YELLOW}1. 确认Space仓库已创建${NC}"
    echo -e "${YELLOW}2. 确认有推送权限${NC}"
    echo -e "${YELLOW}3. 确认网络连接正常${NC}"
    exit 1
}

echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}🌐 访问地址: https://$USERNAME-$SPACE_NAME.hf.space${NC}"
echo -e "${GREEN}📚 API文档: https://$USERNAME-$SPACE_NAME.hf.space/docs${NC}"
echo -e "${GREEN}🔧 健康检查: https://$USERNAME-$SPACE_NAME.hf.space/health${NC}"

echo -e "${YELLOW}📝 后续步骤:${NC}"
echo -e "${YELLOW}1. 等待构建完成（约5-10分钟）${NC}"
echo -e "${YELLOW}2. 在Space设置中配置环境变量${NC}"
echo -e "${YELLOW}3. 测试系统功能${NC}"

echo -e "${GREEN}🎉 部署脚本执行完成！${NC}" 