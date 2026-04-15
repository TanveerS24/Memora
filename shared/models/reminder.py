from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text, Boolean
import enum
from .base import Base


class ReminderType(str, enum.Enum):
    anniversary = "anniversary"
    inactivity_nudge = "inactivity_nudge"
    custom = "custom"


class Reminder(Base):
    __tablename__ = "reminders"
    
    reminder_id = Column(String(36), unique=True, index=True, nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.uid"), nullable=False, index=True)
    reminder_type = Column(Enum(ReminderType), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    reminder_date = Column(DateTime, nullable=False)
    is_sent = Column(Boolean, default=False, nullable=False)
