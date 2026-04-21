from sqlalchemy import Column, String, ForeignKey, Enum, Integer, JSON, DateTime, Boolean
from database import Base
import enum
from datetime import datetime


class MediaType(str, enum.Enum):
    image = "image"
    audio = "audio"
    video = "video"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(36), unique=True, index=True, nullable=False)


class Couple(Base):
    __tablename__ = "couples"
    
    id = Column(Integer, primary_key=True, index=True)
    couple_id = Column(String(36), unique=True, index=True, nullable=False)
    is_active = Column(Integer, default=1, nullable=False)


class Memory(Base):
    __tablename__ = "memories"
    
    id = Column(Integer, primary_key=True, index=True)
    memory_id = Column(String(36), unique=True, index=True, nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)


class Media(Base):
    __tablename__ = "media"
    
    id = Column(Integer, primary_key=True, index=True)
    media_id = Column(String(36), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    memory_id = Column(String(36), ForeignKey("memories.memory_id"), nullable=True, index=True)
    media_type = Column(Enum(MediaType), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    thumbnail_path = Column(String(500), nullable=True)
    meta_data = Column(JSON, nullable=True)
