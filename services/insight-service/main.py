from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

from database import engine, get_db, Base
from models import Message, Memory, Couple
from schemas import InsightsDashboard, CommunicationTrends, EmotionTrends, ActivityFrequency
from auth import decode_token
from analytics import AnalyticsEngine

Base.metadata.create_all(bind=engine, checkfirst=True)

app = FastAPI(title="Insight Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://172.31.144.1:3000", "http://172.31.144.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    return payload


@app.get("/trends", response_model=CommunicationTrends)
def get_communication_trends(
    days: int = 30,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    couple_id = current_user.get("couple_id")
    if not couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    analytics = AnalyticsEngine(db, couple_id)
    return analytics.get_communication_trends(days)


@app.get("/emotions", response_model=EmotionTrends)
def get_emotion_trends(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    couple_id = current_user.get("couple_id")
    if not couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    analytics = AnalyticsEngine(db, couple_id)
    return analytics.get_emotion_trends()


@app.get("/activity", response_model=ActivityFrequency)
def get_activity_frequency(
    months: int = 12,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    couple_id = current_user.get("couple_id")
    if not couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    analytics = AnalyticsEngine(db, couple_id)
    return analytics.get_activity_frequency(months)


@app.get("/dashboard", response_model=InsightsDashboard)
def get_insights_dashboard(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    couple_id = current_user.get("couple_id")
    if not couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    analytics = AnalyticsEngine(db, couple_id)
    return analytics.get_dashboard()


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "insight-service"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8007))
    uvicorn.run(app, host="0.0.0.0", port=port)
