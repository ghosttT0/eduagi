#!/bin/bash

# EduAGI 快速部署脚本
# 适用于已有服务器的快速部署

set -e

echo "🚀 EduAGI 快速部署脚本"

# 配置
PROJECT_NAME="eduagi"
BACKEND_PORT=8000
DOMAIN="localhost"  # 请修改为你的域名

# 创建项目目录
echo "📁 创建项目目录..."
sudo mkdir -p /var/www/$PROJECT_NAME
sudo chown $USER:$USER /var/www/$PROJECT_NAME

# 复制项目文件
echo "📋 复制项目文件..."
cp -r . /var/www/$PROJECT_NAME/

cd /var/www/$PROJECT_NAME

# 部署前端
echo "🎨 部署前端..."
cd frontend
npm install
npm run build
cd ..

# 部署后端
echo "⚙️ 部署后端..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 创建环境配置
if [ ! -f .env ]; then
    cp env.example .env
    echo "⚠️  请编辑 .env 文件配置数据库设置"
fi

cd ..

# 创建后端服务
echo "🔧 创建后端服务..."
sudo tee /etc/systemd/system/$PROJECT_NAME-backend.service > /dev/null <<EOF
[Unit]
Description=EduAGI Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/var/www/$PROJECT_NAME/backend
Environment=PATH=/var/www/$PROJECT_NAME/backend/venv/bin
ExecStart=/var/www/$PROJECT_NAME/backend/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable $PROJECT_NAME-backend
sudo systemctl start $PROJECT_NAME-backend

# 配置Nginx
echo "🌐 配置Nginx..."
sudo tee /etc/nginx/sites-available/$PROJECT_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        root /var/www/$PROJECT_NAME/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "✅ 部署完成！"
echo "🌐 访问地址: http://$DOMAIN"
echo "📚 API文档: http://$DOMAIN/docs" 
 
 