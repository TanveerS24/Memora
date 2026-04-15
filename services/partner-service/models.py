from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Boolean, Integer
from database import Base
import enum


class RequestStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class PartnerRequest(Base):
    __tablename__ = "partner_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    receiver_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    status = Column(Enum(RequestStatus), default=RequestStatus.pending, nullable=False)
    created_at = Column(DateTime, nullable=False)


class Couple(Base):
    __tablename__ = "couples"
    
    id = Column(Integer, primary_key=True, index=True)
    couple_id = Column(String(36), unique=True, index=True, nullable=False)
    user1_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    user2_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    anniversary_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, nullable=False)


class Partner(Base):
    __tablename__ = "partners"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.uid"), primary_key=True)
    partner_id = Column(String(36), ForeignKey("users.uid"), nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False)


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(36), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    gender = Column(String(10), nullable=False)
    dob = Column(DateTime, nullable=False)
    profile_picture = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    couple_id = Column(String(36), nullable=True, index=True)
