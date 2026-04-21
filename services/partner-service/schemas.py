from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import enum


class RequestStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class PartnerSearch(BaseModel):
    search_term: str = Field(..., min_length=1)


class PartnerRequestCreate(BaseModel):
    receiver_id: str


class PartnerRequestResponse(BaseModel):
    id: int
    sender_id: str
    receiver_id: str
    status: RequestStatus
    created_at: datetime

    class Config:
        from_attributes = True


class CoupleCreate(BaseModel):
    anniversary_date: Optional[datetime] = None


class CoupleResponse(BaseModel):
    couple_id: str
    user1_id: str
    user2_id: str
    anniversary_date: Optional[datetime]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    uid: str
    username: str
    email: str
    name: str
    gender: str
    profile_picture: Optional[str]
    is_active: bool
    couple_id: Optional[str]

    class Config:
        from_attributes = True


class PartnerInfo(BaseModel):
    partner: UserResponse
    couple: CoupleResponse
    is_paired: bool
