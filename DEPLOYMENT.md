# EduAGI 智能教学系统部署指南

## 🚀 部署方案

本项目提供了三种部署方案：

### 1. Docker 部署（推荐）

最简单的部署方式，适合任何环境。

#### 前置要求
- Docker
- Docker Compose

#### 部署步骤

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd eduagi

# 2. 配置环境变量
cp backend/env.example backend/.env
# 编辑 backend/.env 文件配置数据库等设置

# 3. 启动服务
docker-compose up -d

# 4. 查看服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f
```

#### 访问地址
- 前端：http://localhost
- API文档：http://localhost/docs
- 健康检查：http://localhost/health

### 2. 传统服务器部署

适合已有服务器的部署方式。

#### 前置要求
- Ubuntu/CentOS 服务器
- Node.js 18+
- Python 3.11+
- Nginx

#### 部署步骤

```bash
# 1. 给脚本执行权限
chmod +x quick-deploy.sh

# 2. 修改域名配置
# 编辑 quick-deploy.sh 中的 DOMAIN 变量

# 3. 运行部署脚本
./quick-deploy.sh

# 4. 配置环境变量
sudo nano /var/www/eduagi/backend/.env
```

### 3. 完整服务器部署

包含完整的环境配置和优化。

#### 部署步骤

```bash
# 1. 给脚本执行权限
chmod +x deploy.sh

# 2. 修改配置
# 编辑 deploy.sh 中的配置变量

# 3. 运行部署脚本
./deploy.sh
```

## 🔧 配置说明

### 环境变量配置

编辑 `backend/.env` 文件：

```env
# 数据库配置
DATABASE_URL=sqlite:///./teaching.db

# 安全配置
SECRET_KEY=your-secret-key-here

# CORS配置
CORS_ORIGINS=http://localhost:3001,http://localhost:3000

# 文件上传配置
UPLOAD_DIR=./upload
MAX_FILE_SIZE=100MB

# AI服务配置
OPENAI_API_KEY=your-openai-key
DASHSCOPE_API_KEY=your-dashscope-key
```

### 域名配置

1. 修改部署脚本中的 `DOMAIN` 变量
2. 配置DNS解析
3. 配置SSL证书（推荐使用Let's Encrypt）

## 📊 服务管理

### Docker 方式

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f [service-name]

# 更新服务
docker-compose pull
docker-compose up -d
```

### 传统部署方式

```bash
# 后端服务管理
sudo systemctl start eduagi-backend
sudo systemctl stop eduagi-backend
sudo systemctl restart eduagi-backend
sudo systemctl status eduagi-backend

# Nginx服务管理
sudo systemctl start nginx
sudo systemctl restart nginx
sudo systemctl status nginx
```

## 🔍 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   sudo netstat -tlnp | grep :8000
   
   # 杀死进程
   sudo kill -9 <PID>
   ```

2. **权限问题**
   ```bash
   # 修复文件权限
   sudo chown -R $USER:$USER /var/www/eduagi
   sudo chmod -R 755 /var/www/eduagi
   ```

3. **数据库问题**
   ```bash
   # 重新初始化数据库
   cd /var/www/eduagi/backend
   source venv/bin/activate
   python -c "from database import init_db; init_db()"
   ```

4. **前端构建失败**
   ```bash
   # 清理缓存
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### 日志查看

```bash
# Docker日志
docker-compose logs -f

# 系统日志
sudo journalctl -u eduagi-backend -f
sudo journalctl -u nginx -f

# Nginx访问日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔒 安全配置

### SSL证书配置

使用Let's Encrypt免费SSL证书：

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

### 防火墙配置

```bash
# 配置UFW防火墙
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 📈 性能优化

### Nginx优化

```nginx
# 在nginx配置中添加
client_max_body_size 100M;
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 数据库优化

```python
# 在backend/database.py中配置
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}
```

## 🔄 更新部署

### Docker方式

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 传统方式

```bash
# 更新代码
cd /var/www/eduagi
git pull

# 更新前端
cd frontend
npm install
npm run build

# 更新后端
cd ../backend
source venv/bin/activate
pip install -r requirements.txt

# 重启服务
sudo systemctl restart eduagi-backend
sudo systemctl restart nginx
```

## 📞 技术支持

如果遇到部署问题，请：

1. 查看日志文件
2. 检查配置文件
3. 确认网络连接
4. 验证依赖安装

更多帮助请参考项目文档或提交Issue。 
 
 