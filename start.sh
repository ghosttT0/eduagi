#!/bin/bash

# 启动FastAPI后端（端口7860是Spaces要求）
echo "🚀 启动后端服务..."
uvicorn backend.main:app --host 0.0.0.0 --port 7860 &

# 等待后端启动
sleep 3

# 启动nginx（前端静态文件服务）
echo "🎨 启动前端服务..."
nginx -g "daemon off;" &

# 等待所有后台进程
wait 