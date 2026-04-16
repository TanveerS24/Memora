from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text, Boolean, Integer
from database import Base
import enum


class ReminderType(str, enum.Enum):
    anniversary = "anniversary"
    inactivity_nudge = "inactivity_nudge"
    custom = "custom"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(36), unique=True, index=True, nullable=False)


class Couple(Base):
    __tablename__ = "couples"
    
    id = Column(Integer, primary_key=True, index=True)
    couple_id = Column(String(36), unique=True, index=True, nullable=False)
    anniversary_date = Column(DateTime, nullable=True)


class Reminder(Base):
    __tablename__ = "reminders"
    
    id = Column(Integer, primary_key=True, index=True)
    reminder_id = Column(String(36), unique=True, index=True, nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    reminder_type = Column(Enum(ReminderType), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    reminder_date = Column(DateTime, nullable=False)
    is_sent = Column(Boolean, default=False, nullable=False)


class Memory(Base):
    __tablename__ = "memories"
    
    id = Column(Integer, primary_key=True, index=True)
    memory_id = Column(String(36), unique=True, index=True, nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False, index=True)
    emotion_tag = Column(String(20), nullable=False)
    created_at = Column(DateTime, nullable=False, index=True)


class LoveFeedHistory(Base):
    __tablename__ = "love_feed_history"
    
    id = Column(Integer, primary_key=True, index=True)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False, index=True)
    memory_id = Column(String(36), ForeignKey("memories.memory_id"), nullable=False, index=True)
    shown_at = Column(DateTime, nullable=False)
