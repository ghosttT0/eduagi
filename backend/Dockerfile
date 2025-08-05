FROM python:3.11-slim

WORKDIR /app

COPY requirements-ultra-minimal.txt .
RUN pip install --no-cache-dir -r requirements-ultra-minimal.txt

COPY main-ultra-simple.py .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main-ultra-simple:app --host 0.0.0.0 --port $PORT"] 
 
 