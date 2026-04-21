from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from models import Message, Memory
from datetime import datetime, timedelta
from typing import List, Dict
from schemas import TrendData, CommunicationTrends, EmotionTrends, ActivityFrequency, InsightsDashboard


class AnalyticsEngine:
    def __init__(self, db: Session, couple_id: str):
        self.db = db
        self.couple_id = couple_id
    
    def get_communication_trends(self, days: int = 30) -> CommunicationTrends:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get daily message counts
        daily_counts = self.db.query(
            func.date(Message.timestamp).label('date'),
            func.count(Message.id).label('count')
        ).filter(
            Message.couple_id == self.couple_id,
            Message.timestamp >= cutoff_date
        ).group_by(
            func.date(Message.timestamp)
        ).all()
        
        daily_messages = []
        total = 0
        for date, count in daily_counts:
            daily_messages.append(TrendData(date=date.isoformat(), value=count))
            total += count
        
        average = total / days if days > 0 else 0
        
        return CommunicationTrends(
            daily_messages=daily_messages,
            total_messages=total,
            average_per_day=round(average, 2)
        )
    
    def get_emotion_trends(self) -> EmotionTrends:
        emotions = self.db.query(
            Memory.emotion_tag,
            func.count(Memory.id).label('count')
        ).filter(
            Memory.couple_id == self.couple_id
        ).group_by(Memory.emotion_tag).all()
        
        emotion_counts = {e: c for e, c in emotions}
        total = sum(emotion_counts.values())
        
        distribution = {}
        for emotion, count in emotion_counts.items():
            distribution[emotion] = round((count / total) * 100, 2) if total > 0 else 0
        
        return EmotionTrends(
            emotions=emotion_counts,
            distribution=distribution
        )
    
    def get_activity_frequency(self, months: int = 12) -> ActivityFrequency:
        cutoff_date = datetime.utcnow() - timedelta(days=30 * months)
        
        monthly_counts = self.db.query(
            extract('year', Memory.created_at).label('year'),
            extract('month', Memory.created_at).label('month'),
            func.count(Memory.id).label('count')
        ).filter(
            Memory.couple_id == self.couple_id,
            Memory.created_at >= cutoff_date
        ).group_by(
            extract('year', Memory.created_at),
            extract('month', Memory.created_at)
        ).order_by(
            extract('year', Memory.created_at),
            extract('month', Memory.created_at)
        ).all()
        
        memories_per_month = []
        total = 0
        max_count = 0
        most_active = ""
        
        for year, month, count in monthly_counts:
            date_str = f"{int(year)}-{int(month):02d}"
            memories_per_month.append(TrendData(date=date_str, value=count))
            total += count
            
            if count > max_count:
                max_count = count
                most_active = date_str
        
        return ActivityFrequency(
            memories_per_month=memories_per_month,
            total_memories=total,
            most_active_month=most_active
        )
    
    def get_peak_happy_days(self, days: int = 30) -> List[str]:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        happy_days = self.db.query(
            func.date(Memory.created_at).label('date'),
            func.count(Memory.id).label('count')
        ).filter(
            Memory.couple_id == self.couple_id,
            Memory.emotion_tag == 'happy',
            Memory.created_at >= cutoff_date
        ).group_by(
            func.date(Memory.created_at)
        ).order_by(
            func.count(Memory.id).desc()
        ).limit(5).all()
        
        return [date.isoformat() for date, count in happy_days]
    
    def get_dashboard(self) -> InsightsDashboard:
        return InsightsDashboard(
            communication_trends=self.get_communication_trends(),
            emotion_trends=self.get_emotion_trends(),
            activity_frequency=self.get_activity_frequency(),
            peak_happy_days=self.get_peak_happy_days()
        )
