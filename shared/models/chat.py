from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean
from .base import Base


class Message(Base):
    __tablename__ = "messages"
    
    message_id = Column(String(36), unique=True, index=True, nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False, index=True)
    sender_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_ai_response = Column(Boolean, default=False, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
