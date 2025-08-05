# 1. 构建前端
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# 2. 构建后端
FROM python:3.11-slim AS backend
WORKDIR /app

# 安装nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

COPY backend/ ./backend/
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# 3. 整合前后端
COPY --from=frontend-build /app/frontend/dist ./frontend_dist

# 4. 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 5. 启动脚本
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 7860

CMD ["./start.sh"] 