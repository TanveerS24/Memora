from sqlalchemy import Column, String, Date, Boolean, Enum, Integer
from database import Base
import enum


class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(36), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    gender = Column(Enum(GenderEnum), nullable=False)
    dob = Column(Date, nullable=False)
    profile_picture = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    couple_id = Column(String(36), nullable=True, index=True)
