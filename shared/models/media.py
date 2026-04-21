from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Integer
import enum
from .base import Base


class MediaType(str, enum.Enum):
    image = "image"
    audio = "audio"
    video = "video"


class Media(Base):
    __tablename__ = "media"
    
    media_id = Column(String(36), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    memory_id = Column(String(36), ForeignKey("memories.memory_id"), nullable=True, index=True)
    media_type = Column(Enum(MediaType), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    thumbnail_path = Column(String(500), nullable=True)
    metadata = Column(JSON, nullable=True)
