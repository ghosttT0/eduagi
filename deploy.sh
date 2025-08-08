#!/bin/bash

# EduAGI 智能教学系统部署脚本
# 适用于 Ubuntu/CentOS 服务器

set -e

echo "🚀 开始部署 EduAGI 智能教学系统..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="eduagi"
FRONTEND_PORT=3001
BACKEND_PORT=8000
DOMAIN="your-domain.com"  # 请替换为你的域名

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}请不要使用root用户运行此脚本${NC}"
    exit 1
fi

# 更新系统包
echo -e "${YELLOW}📦 更新系统包...${NC}"
sudo apt update && sudo apt upgrade -y

# 安装必要的软件
echo -e "${YELLOW}🔧 安装必要的软件...${NC}"
sudo apt install -y curl wget git nginx python3 python3-pip python3-venv nodejs npm

# 检查Node.js版本
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js 版本: $NODE_VERSION${NC}"

# 检查npm版本
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm 版本: $NPM_VERSION${NC}"

# 创建项目目录
echo -e "${YELLOW}📁 创建项目目录...${NC}"
sudo mkdir -p /var/www/$PROJECT_NAME
sudo chown $USER:$USER /var/www/$PROJECT_NAME

# 复制项目文件
echo -e "${YELLOW}📋 复制项目文件...${NC}"
cp -r . /var/www/$PROJECT_NAME/

# 进入项目目录
cd /var/www/$PROJECT_NAME

# 部署前端
echo -e "${YELLOW}🎨 部署前端...${NC}"
cd frontend

# 安装前端依赖
echo -e "${YELLOW}📦 安装前端依赖...${NC}"
npm install

# 构建前端
echo -e "${YELLOW}🔨 构建前端...${NC}"
npm run build

# 返回项目根目录
cd ..

# 部署后端
echo -e "${YELLOW}⚙️ 部署后端...${NC}"
cd backend

# 创建Python虚拟环境
echo -e "${YELLOW}🐍 创建Python虚拟环境...${NC}"
python3 -m venv venv
source venv/bin/activate

# 安装后端依赖
echo -e "${YELLOW}📦 安装后端依赖...${NC}"
pip install -r requirements.txt

# 创建环境配置文件
echo -e "${YELLOW}⚙️ 创建环境配置...${NC}"
if [ ! -f .env ]; then
    cp env.example .env
    echo -e "${YELLOW}请编辑 .env 文件配置数据库和其他设置${NC}"
fi

# 返回项目根目录
cd ..

# 创建systemd服务文件
echo -e "${YELLOW}🔧 创建系统服务...${NC}"
sudo tee /etc/systemd/system/$PROJECT_NAME-backend.service > /dev/null <<EOF
[Unit]
Description=EduAGI Backend Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/var/www/$PROJECT_NAME/backend
Environment=PATH=/var/www/$PROJECT_NAME/backend/venv/bin
ExecStart=/var/www/$PROJECT_NAME/backend/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 重新加载systemd
sudo systemctl daemon-reload

# 启动后端服务
echo -e "${YELLOW}🚀 启动后端服务...${NC}"
sudo systemctl enable $PROJECT_NAME-backend
sudo systemctl start $PROJECT_NAME-backend

# 配置Nginx
echo -e "${YELLOW}🌐 配置Nginx...${NC}"
sudo tee /etc/nginx/sites-available/$PROJECT_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # 前端静态文件
    location / {
        root /var/www/$PROJECT_NAME/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root /var/www/$PROJECT_NAME/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用站点
sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/

# 测试Nginx配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 配置防火墙
echo -e "${YELLOW}🔥 配置防火墙...${NC}"
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22

# 检查服务状态
echo -e "${YELLOW}📊 检查服务状态...${NC}"
sudo systemctl status $PROJECT_NAME-backend --no-pager
sudo systemctl status nginx --no-pager

echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}🌐 前端访问地址: http://$DOMAIN${NC}"
echo -e "${GREEN}📚 API文档地址: http://$DOMAIN/docs${NC}"
echo -e "${GREEN}🔧 后端健康检查: http://$DOMAIN/health${NC}"

echo -e "${YELLOW}📝 后续步骤:${NC}"
echo -e "${YELLOW}1. 编辑 /var/www/$PROJECT_NAME/backend/.env 文件配置数据库${NC}"
echo -e "${YELLOW}2. 配置SSL证书 (推荐使用Let's Encrypt)${NC}"
echo -e "${YELLOW}3. 设置域名DNS解析${NC}"
echo -e "${YELLOW}4. 配置数据库备份${NC}"

echo -e "${GREEN}🎉 部署脚本执行完成！${NC}" 
 
 