FROM node:22-slim AS frontend
LABEL "language"="nodejs"
LABEL "framework"="vite"
WORKDIR /src/frontend
COPY frontend/ ./
RUN npm install && npm run build

FROM python:3.10-slim AS builder
LABEL "language"="python"
LABEL "framework"="fastapi"
WORKDIR /src/backend
COPY backend/ ./
RUN apt-get update && apt-get install -y gcc libffi-dev make \
    && pip install --upgrade pip setuptools wheel

# 在 builder 层先安装依赖
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.10-slim
WORKDIR /src/backend
COPY --from=builder /src/backend /src/backend
COPY --from=frontend /src/frontend/dist /src/frontend/dist

# 拷贝 requirements.txt，再次全量安装依赖（防止 slim 层丢依赖）
RUN pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"] 
 
 
