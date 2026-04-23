from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import httpx

from database import engine, get_db, Base
from models import Reminder, Memory, Couple
from schemas import ReminderCreate, ReminderResponse, LoveFeedMemory
from auth import decode_token
from love_feed import LoveFeedGenerator

Base.metadata.create_all(bind=engine, checkfirst=True)

app = FastAPI(title="Scheduler Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://172.31.144.1:3000", "http://172.31.144.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MEMORY_SERVICE_URL = os.getenv("MEMORY_SERVICE_URL", "http://memory-service:8004")


async def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    return payload


@app.get("/lovefeed", response_model=LoveFeedMemory)
def get_daily_love_feed(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    couple_id = current_user.get("couple_id")
    if not couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    generator = LoveFeedGenerator(db, couple_id)
    memory = generator.get_daily_memory()
    
    if not memory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No happy memories available",
        )
    
    return memory


@app.post("/reminders", response_model=ReminderResponse)
def create_reminder(
    reminder_data: ReminderCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    couple_id = current_user.get("couple_id")
    if not couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    reminder = Reminder(
        reminder_id=str(uuid.uuid4()),
        couple_id=couple_id,
        user_id=current_user.get("sub"),
        reminder_type=reminder_data.reminder_type,
        title=reminder_data.title,
        description=reminder_data.description,
        reminder_date=reminder_data.reminder_date,
        is_sent=False
    )
    
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    
    return reminder


@app.get("/reminders", response_model=list[ReminderResponse])
def get_reminders(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    couple_id = current_user.get("couple_id")
    if not couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    reminders = db.query(Reminder).filter(
        Reminder.couple_id == couple_id,
        Reminder.reminder_date >= datetime.utcnow()
    ).order_by(Reminder.reminder_date.asc()).all()
    
    return reminders


@app.post("/anniversary")
def set_anniversary(
    anniversary_date: datetime,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    couple_id = current_user.get("couple_id")
    if not couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    couple = db.query(Couple).filter(Couple.couple_id == couple_id).first()
    if not couple:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Couple not found",
        )
    
    couple.anniversary_date = anniversary_date
    db.commit()
    
    # Create annual reminder
    next_anniversary = anniversary_date.replace(year=datetime.utcnow().year + 1)
    if next_anniversary < datetime.utcnow():
        next_anniversary = next_anniversary.replace(year=next_anniversary.year + 1)
    
    reminder = Reminder(
        reminder_id=str(uuid.uuid4()),
        couple_id=couple_id,
        user_id=current_user.get("sub"),
        reminder_type="anniversary",
        title="Anniversary Reminder",
        description=f"Happy Anniversary! Celebrate your special day together.",
        reminder_date=next_anniversary,
        is_sent=False
    )
    
    db.add(reminder)
    db.commit()
    
    return {"message": "Anniversary set successfully"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "scheduler-service"}


if __name__ == "__main__":
    import uvicorn
    import uuid
    port = int(os.getenv("SERVICE_PORT", 8008))
    uvicorn.run(app, host="0.0.0.0", port=port)
