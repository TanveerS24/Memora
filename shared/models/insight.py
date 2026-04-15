from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Integer
from .base import Base


class Insight(Base):
    __tablename__ = "insights"
    
    insight_id = Column(String(36), unique=True, index=True, nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False, index=True)
    insight_type = Column(String(50), nullable=False)
    data = Column(JSON, nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
