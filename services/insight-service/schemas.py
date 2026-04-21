from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Optional


class TrendData(BaseModel):
    date: str
    value: int


class CommunicationTrends(BaseModel):
    daily_messages: List[TrendData]
    total_messages: int
    average_per_day: float


class EmotionTrends(BaseModel):
    emotions: Dict[str, int]
    distribution: Dict[str, float]


class ActivityFrequency(BaseModel):
    memories_per_month: List[TrendData]
    total_memories: int
    most_active_month: str


class InsightsDashboard(BaseModel):
    communication_trends: CommunicationTrends
    emotion_trends: EmotionTrends
    activity_frequency: ActivityFrequency
    peak_happy_days: List[str]
