from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum, JSON, Boolean, Integer
from database import Base
import enum


class MemoryType(str, enum.Enum):
    text = "text"
    image = "image"
    audio = "audio"
    shared_note = "shared_note"


class EmotionTag(str, enum.Enum):
    happy = "happy"
    sad = "sad"
    angry = "angry"
    romantic = "romantic"


class MemoryLayer(str, enum.Enum):
    active = "active"
    archived = "archived"


class Memory(Base):
    __tablename__ = "memories"
    
    id = Column(Integer, primary_key=True, index=True)
    memory_id = Column(String(36), unique=True, index=True, nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    memory_type = Column(Enum(MemoryType), nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=False)
    emotion_tag = Column(Enum(EmotionTag), nullable=False)
    layer = Column(Enum(MemoryLayer), default=MemoryLayer.active, nullable=False, index=True)
    media_urls = Column(JSON, nullable=True)
    meta_data = Column(JSON, nullable=True)
    is_confirmed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)


class MemoryChunk(Base):
    __tablename__ = "memory_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(String(36), unique=True, index=True, nullable=False)
    memory_id = Column(String(36), ForeignKey("memories.memory_id"), nullable=False, index=True)
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    embedding_id = Column(String(100), nullable=True, index=True)


class TimeCapsule(Base):
    __tablename__ = "time_capsules"
    
    id = Column(Integer, primary_key=True, index=True)
    capsule_id = Column(String(36), unique=True, index=True, nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    memory_id = Column(String(36), ForeignKey("memories.memory_id"), nullable=False, index=True)
    unlock_date = Column(DateTime, nullable=False)
    is_unlocked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(36), unique=True, index=True, nullable=False)
    couple_id = Column(String(36), nullable=True, index=True)
