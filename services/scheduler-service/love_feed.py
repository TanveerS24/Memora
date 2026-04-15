from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Memory, LoveFeedHistory
from schemas import LoveFeedMemory
from datetime import datetime, timedelta
from typing import Optional
import random
import os


class LoveFeedGenerator:
    def __init__(self, db: Session, couple_id: str):
        self.db = db
        self.couple_id = couple_id
        self.history_size = int(os.getenv("LOVE_FEED_HISTORY_SIZE", "10"))
    
    def get_recently_shown(self) -> list:
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        recent = self.db.query(LoveFeedHistory.memory_id).filter(
            LoveFeedHistory.couple_id == self.couple_id,
            LoveFeedHistory.shown_at >= cutoff_date
        ).order_by(LoveFeedHistory.shown_at.desc()).limit(self.history_size).all()
        
        return [r[0] for r in recent]
    
    def get_eligible_memories(self) -> list:
        excluded_ids = self.get_recently_shown()
        
        query = self.db.query(Memory).filter(
            Memory.couple_id == self.couple_id,
            Memory.emotion_tag == 'happy'
        )
        
        if excluded_ids:
            query = query.filter(~Memory.memory_id.in_(excluded_ids))
        
        return query.all()
    
    def select_memory(self) -> Optional[Memory]:
        eligible = self.get_eligible_memories()
        
        if not eligible:
            # Fallback to least recently shown
            cutoff_date = datetime.utcnow() - timedelta(days=365)
            fallback = self.db.query(Memory).filter(
                Memory.couple_id == self.couple_id,
                Memory.emotion_tag == 'happy',
                Memory.created_at >= cutoff_date
            ).order_by(Memory.created_at.asc()).first()
            return fallback
        
        # Random selection from eligible
        return random.choice(eligible)
    
    def record_shown(self, memory_id: str):
        history = LoveFeedHistory(
            couple_id=self.couple_id,
            memory_id=memory_id,
            shown_at=datetime.utcnow()
        )
        self.db.add(history)
        self.db.commit()
    
    def get_daily_memory(self) -> Optional[LoveFeedMemory]:
        memory = self.select_memory()
        
        if memory:
            self.record_shown(memory.memory_id)
            return LoveFeedMemory(
                memory_id=memory.memory_id,
                content=memory.content,
                summary=memory.summary,
                created_at=memory.created_at
            )
        
        return None
