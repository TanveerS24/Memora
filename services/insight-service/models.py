from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Integer
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(36), unique=True, index=True, nullable=False)


class Couple(Base):
    __tablename__ = "couples"
    
    id = Column(Integer, primary_key=True, index=True)
    couple_id = Column(String(36), unique=True, index=True, nullable=False)
    is_active = Column(Integer, default=1, nullable=False)


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String(36), unique=True, index=True, nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False, index=True)
    sender_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)


class Memory(Base):
    __tablename__ = "memories"
    
    id = Column(Integer, primary_key=True, index=True)
    memory_id = Column(String(36), unique=True, index=True, nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    emotion_tag = Column(String(20), nullable=False)
    memory_type = Column(String(20), nullable=False)
    created_at = Column(DateTime, nullable=False, index=True)
