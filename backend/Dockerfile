FROM python:3.11-slim

WORKDIR /app

# 安装系统构建依赖
RUN apt-get update && apt-get install -y gcc libffi-dev make && rm -rf /var/lib/apt/lists/*

# 升级pip并安装依赖
RUN pip install --upgrade pip setuptools wheel
COPY requirements-ultra-minimal.txt .
RUN pip install --no-cache-dir -r requirements-ultra-minimal.txt

# 确保uvicorn安装成功
RUN pip install --no-cache-dir uvicorn
RUN which uvicorn

COPY main-ultra-simple.py main.py

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"] 
 
 