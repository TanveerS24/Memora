import os


class Config:
    AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")
    PARTNER_SERVICE_URL = os.getenv("PARTNER_SERVICE_URL", "http://partner-service:8002")
    CHAT_SERVICE_URL = os.getenv("CHAT_SERVICE_URL", "http://chat-service:8003")
    MEMORY_SERVICE_URL = os.getenv("MEMORY_SERVICE_URL", "http://memory-service:8004")
    RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", "http://rag-service:8005")
    MEDIA_SERVICE_URL = os.getenv("MEDIA_SERVICE_URL", "http://media-service:8006")
    INSIGHT_SERVICE_URL = os.getenv("INSIGHT_SERVICE_URL", "http://insight-service:8007")
    SCHEDULER_SERVICE_URL = os.getenv("SCHEDULER_SERVICE_URL", "http://scheduler-service:8008")
    JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
