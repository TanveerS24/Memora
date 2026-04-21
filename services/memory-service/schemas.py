from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
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


class MemoryIngest(BaseModel):
    memory_type: MemoryType
    content: str = Field(..., min_length=1)
    media_urls: Optional[List[str]] = None
    metadata: Optional[dict] = None


class MemoryPreview(BaseModel):
    memory_id: str
    summary: str
    emotion_tag: EmotionTag
    chunks: List[str]
    is_confirmed: bool


class MemoryConfirm(BaseModel):
    memory_id: str


class MemoryResponse(BaseModel):
    memory_id: str
    couple_id: str
    user_id: str
    memory_type: MemoryType
    content: str
    summary: str
    emotion_tag: EmotionTag
    layer: str
    media_urls: Optional[List[str]]
    is_confirmed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TimeCapsuleCreate(BaseModel):
    memory_id: str
    unlock_date: datetime


class TimeCapsuleResponse(BaseModel):
    capsule_id: str
    couple_id: str
    user_id: str
    memory_id: str
    unlock_date: datetime
    is_unlocked: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TimelineMonth(BaseModel):
    month: str
    year: int
    memories: List[MemoryResponse]


class TimelineResponse(BaseModel):
    timeline: List[TimelineMonth]
