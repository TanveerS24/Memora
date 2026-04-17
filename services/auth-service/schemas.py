from pydantic import BaseModel, EmailStr, Field
from datetime import date
from typing import Optional
import enum


class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    gender: str  # Accept string instead of GenderEnum for frontend compatibility
    dob: str  # Accept string instead of date for frontend compatibility
    profile_picture: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    uid: str
    username: str
    email: str
    name: str
    gender: GenderEnum
    dob: date
    profile_picture: Optional[str]
    is_active: bool
    couple_id: Optional[str]

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
