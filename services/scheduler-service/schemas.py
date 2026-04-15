from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import enum


class ReminderType(str, enum.Enum):
    anniversary = "anniversary"
    inactivity_nudge = "inactivity_nudge"
    custom = "custom"


class ReminderCreate(BaseModel):
    reminder_type: ReminderType
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    reminder_date: datetime


class ReminderResponse(BaseModel):
    reminder_id: str
    couple_id: str
    user_id: str
    reminder_type: ReminderType
    title: str
    description: Optional[str]
    reminder_date: datetime
    is_sent: bool

    class Config:
        from_attributes = True


class LoveFeedMemory(BaseModel):
    memory_id: str
    content: str
    summary: str
    created_at: datetime
