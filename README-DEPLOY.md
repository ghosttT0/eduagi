# 🚀 EduAGI 智能教学系统 - 服务器部署指南

## 📋 部署方案概览

由于本地运行遇到问题，我们提供了多种服务器部署方案：

### 🐳 方案一：Docker部署（推荐）

**优点：**
- ✅ 环境隔离，避免依赖冲突
- ✅ 一键部署，简单快捷
- ✅ 跨平台兼容
- ✅ 易于维护和更新

**适用场景：**
- 任何Linux/Windows/macOS服务器
- 云服务器（阿里云、腾讯云、AWS等）
- 本地开发环境

### 🖥️ 方案二：传统服务器部署

**优点：**
- ✅ 性能更好
- ✅ 资源占用更少
- ✅ 完全控制

**适用场景：**
- 专用服务器
- 对性能要求较高的环境

## 🐳 Docker部署详细步骤

### 1. 安装Docker

#### Windows用户：
1. 下载 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. 安装并重启电脑
3. 启动Docker Desktop

#### Linux用户：
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# CentOS/RHEL
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 2. 部署项目

```bash
# 1. 克隆项目到服务器
git clone <your-repo-url>
cd eduagi

# 2. 配置环境变量
cp backend/env.example backend/.env
# 编辑 backend/.env 文件

# 3. 启动服务
docker-compose up -d

# 4. 查看服务状态
docker-compose ps
```

### 3. 访问应用

- 🌐 前端界面：http://your-server-ip
- 📚 API文档：http://your-server-ip/docs
- 🔧 健康检查：http://your-server-ip/health

## 🖥️ 传统服务器部署

### 1. 服务器环境要求

- **操作系统：** Ubuntu 20.04+ / CentOS 8+
- **内存：** 至少2GB RAM
- **存储：** 至少10GB可用空间
- **网络：** 公网IP或域名

### 2. 快速部署

```bash
# 1. 上传项目文件到服务器
scp -r ./eduagi user@your-server:/home/user/

# 2. 登录服务器
ssh user@your-server

# 3. 运行部署脚本
cd eduagi
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### 3. 配置域名和SSL

```bash
# 1. 配置DNS解析
# 将域名解析到服务器IP

# 2. 安装SSL证书
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔧 环境配置

### 数据库配置

编辑 `backend/.env` 文件：

```env
# SQLite数据库（默认）
DATABASE_URL=sqlite:///./teaching.db

# 或使用MySQL/PostgreSQL
# DATABASE_URL=mysql://user:password@localhost/eduagi
# DATABASE_URL=postgresql://user:password@localhost/eduagi

# 安全密钥
SECRET_KEY=your-super-secret-key-here

# CORS设置
CORS_ORIGINS=http://localhost:3001,http://your-domain.com

# 文件上传
UPLOAD_DIR=./upload
MAX_FILE_SIZE=100MB

# AI服务配置
OPENAI_API_KEY=your-openai-api-key
DASHSCOPE_API_KEY=your-dashscope-api-key
```

### 前端配置

编辑 `frontend/src/services/api.ts`：

```typescript
// 修改API基础URL
const API_BASE_URL = 'http://your-domain.com/api';
```

## 📊 服务管理

### Docker方式

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 更新服务
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 传统方式

```bash
# 后端服务
sudo systemctl start eduagi-backend
sudo systemctl stop eduagi-backend
sudo systemctl restart eduagi-backend
sudo systemctl status eduagi-backend

# Nginx服务
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

3. **Docker构建失败**
   ```bash
   # 清理Docker缓存
   docker system prune -a
   
   # 重新构建
   docker-compose build --no-cache
   ```

4. **前端无法访问后端**
   ```bash
   # 检查网络连接
   docker-compose exec frontend ping backend
   
   # 检查API响应
   curl http://localhost:8000/health
   ```

### 日志查看

```bash
# Docker日志
docker-compose logs -f [service-name]

# 系统日志
sudo journalctl -u eduagi-backend -f
sudo journalctl -u nginx -f

# Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔒 安全建议

1. **防火墙配置**
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

2. **SSL证书**
   - 使用Let's Encrypt免费证书
   - 配置自动续期

3. **数据库安全**
   - 使用强密码
   - 限制数据库访问IP
   - 定期备份

4. **应用安全**
   - 定期更新依赖
   - 使用环境变量存储敏感信息
   - 启用HTTPS

## 📈 性能优化

### Nginx优化

```nginx
# 在nginx配置中添加
client_max_body_size 100M;
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# 静态文件缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 数据库优化

```python
# 在backend/database.py中配置
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "pool_size": 10,
    "max_overflow": 20,
}
```

## 🚀 云服务器推荐

### 国内云服务器

1. **阿里云**
   - 轻量应用服务器：2核2GB，40GB SSD
   - 价格：约60元/月

2. **腾讯云**
   - 轻量应用服务器：2核2GB，40GB SSD
   - 价格：约65元/月

3. **华为云**
   - 弹性云服务器：2核2GB，40GB SSD
   - 价格：约70元/月

### 国外云服务器

1. **AWS EC2**
   - t3.small：2核2GB
   - 价格：约$15/月

2. **DigitalOcean**
   - Basic Droplet：2核2GB，50GB SSD
   - 价格：约$12/月

3. **Vultr**
   - Cloud Compute：2核2GB，55GB SSD
   - 价格：约$10/月

## 📞 技术支持

如果遇到部署问题：

1. 📖 查看详细文档：`DEPLOYMENT.md`
2. 🔍 检查日志文件
3. 🌐 搜索常见问题
4. 💬 提交Issue获取帮助

## 🎉 部署完成

恭喜！你的EduAGI智能教学系统已经成功部署到服务器。

现在你可以：
- 🌐 通过域名访问系统
- 👥 邀请用户注册使用
- 📊 监控系统运行状态
- �� 定期更新和维护

祝你使用愉快！🎊 
 
 