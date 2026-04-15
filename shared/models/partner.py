from sqlalchemy import Column, String, Enum, DateTime, ForeignKey
import enum
from .base import Base


class RequestStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class PartnerRequest(Base):
    __tablename__ = "partner_requests"
    
    sender_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    receiver_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    status = Column(Enum(RequestStatus), default=RequestStatus.pending, nullable=False)


class Couple(Base):
    __tablename__ = "couples"
    
    couple_id = Column(String(36), unique=True, index=True, nullable=False)
    user1_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    user2_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    anniversary_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)


class Partner(Base):
    __tablename__ = "partners"
    
    user_id = Column(String(36), ForeignKey("users.uid"), primary_key=True)
    partner_id = Column(String(36), ForeignKey("users.uid"), nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False)
