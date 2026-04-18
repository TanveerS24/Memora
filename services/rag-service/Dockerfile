FROM memora-base:latest

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["/bin/sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${SERVICE_PORT}"]