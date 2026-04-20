from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)


class MessageResponse(BaseModel):
    message_id: str
    couple_id: str
    sender_id: Optional[str] = None
    content: str
    is_ai_response: bool
    is_read: bool
    timestamp: datetime

    class Config:
        from_attributes = True


class WSMessage(BaseModel):
    type: str  # "message", "typing", "read_receipt"
    data: dict
