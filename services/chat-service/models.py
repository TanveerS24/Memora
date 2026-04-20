from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Integer
from database import Base
from datetime import datetime


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String(36), unique=True, index=True, nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False, index=True)
    sender_id = Column(String(36), ForeignKey("users.uid"), nullable=True, index=True)
    content = Column(Text, nullable=False)
    is_ai_response = Column(Boolean, default=False, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(36), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    couple_id = Column(String(36), nullable=True, index=True)


class Couple(Base):
    __tablename__ = "couples"
    
    id = Column(Integer, primary_key=True, index=True)
    couple_id = Column(String(36), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
