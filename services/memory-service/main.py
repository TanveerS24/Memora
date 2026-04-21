from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract
from datetime import datetime, timedelta
from typing import Optional
import os
import httpx

from database import engine, get_db, Base
from models import Memory, MemoryChunk, TimeCapsule, User, MemoryLayer
from schemas import (
    MemoryIngest, MemoryPreview, MemoryConfirm, MemoryResponse,
    TimeCapsuleCreate, TimeCapsuleResponse, TimelineMonth, TimelineResponse
)
from auth import decode_token
from utils import generate_memory_id, generate_chunk_id, chunk_text, count_tokens, should_archive
from emotion_detector import emotion_detector

app = FastAPI(title="Memory Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MEDIA_SERVICE_URL = os.getenv("MEDIA_SERVICE_URL", "http://media-service:8006")


async def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)) -> User:
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    
    uid: str = payload.get("sub")
    if uid is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    
    user = db.query(User).filter(User.uid == uid).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    return user


def generate_summary(content: str) -> str:
    words = content.split()
    if len(words) <= 20:
        return content
    return " ".join(words[:20]) + "..."


@app.post("/ingest", response_model=MemoryPreview)
def ingest_memory(
    memory_data: MemoryIngest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    # Generate summary
    summary = generate_summary(memory_data.content)
    
    # Detect emotion
    emotion_tag = emotion_detector.detect(memory_data.content)
    
    # Chunk text
    chunks = chunk_text(memory_data.content)
    
    # Create memory (not confirmed yet)
    memory = Memory(
        memory_id=generate_memory_id(),
        couple_id=current_user.couple_id,
        user_id=current_user.uid,
        memory_type=memory_data.memory_type,
        content=memory_data.content,
        summary=summary,
        emotion_tag=emotion_tag,
        layer=MemoryLayer.active,
        media_urls=memory_data.media_urls,
        meta_data=memory_data.metadata,
        is_confirmed=False,
        created_at=datetime.utcnow()
    )
    
    db.add(memory)
    db.commit()
    db.refresh(memory)
    
    return MemoryPreview(
        memory_id=memory.memory_id,
        summary=summary,
        emotion_tag=emotion_tag,
        chunks=chunks,
        is_confirmed=False
    )


@app.post("/confirm", response_model=MemoryResponse)
def confirm_memory(
    confirm_data: MemoryConfirm,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memory = db.query(Memory).filter(
        Memory.memory_id == confirm_data.memory_id,
        Memory.user_id == current_user.uid
    ).first()
    
    if not memory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory not found",
        )
    
    if memory.is_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Memory already confirmed",
        )
    
    # Confirm memory
    memory.is_confirmed = True
    
    # Create chunks
    chunks = chunk_text(memory.content)
    for index, chunk_text in enumerate(chunks):
        chunk = MemoryChunk(
            chunk_id=generate_chunk_id(),
            memory_id=memory.memory_id,
            chunk_text=chunk_text,
            chunk_index=index
        )
        db.add(chunk)
        db.commit()
    
    db.commit()
    db.refresh(memory)
    
    return memory


@app.get("/timeline", response_model=TimelineResponse)
def get_timeline(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    memories = db.query(Memory).filter(
        Memory.couple_id == current_user.couple_id,
        Memory.is_confirmed == True
    ).order_by(Memory.created_at.desc()).all()
    
    # Group by month
    timeline_dict = {}
    for memory in memories:
        month_key = memory.created_at.strftime("%Y-%m")
        if month_key not in timeline_dict:
            timeline_dict[month_key] = []
        timeline_dict[month_key].append(memory)
    
    timeline = []
    for month_key in sorted(timeline_dict.keys(), reverse=True):
        year, month = map(int, month_key.split("-"))
        month_name = datetime(year, month, 1).strftime("%B")
        
        timeline.append(TimelineMonth(
            month=month_name,
            year=year,
            memories=timeline_dict[month_key]
        ))
    
    return TimelineResponse(timeline=timeline)


@app.get("/active", response_model=list[MemoryResponse])
def get_active_memories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    memories = db.query(Memory).filter(
        Memory.couple_id == current_user.couple_id,
        Memory.layer == MemoryLayer.active,
        Memory.is_confirmed == True
    ).order_by(Memory.created_at.desc()).all()
    
    return memories


@app.get("/archived", response_model=list[MemoryResponse])
def get_archived_memories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    memories = db.query(Memory).filter(
        Memory.couple_id == current_user.couple_id,
        Memory.layer == MemoryLayer.archived,
        Memory.is_confirmed == True
    ).order_by(Memory.created_at.desc()).all()
    
    return memories


@app.post("/timecapsule", response_model=TimeCapsuleResponse)
def create_time_capsule(
    capsule_data: TimeCapsuleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    memory = db.query(Memory).filter(
        Memory.memory_id == capsule_data.memory_id,
        Memory.couple_id == current_user.couple_id,
        Memory.is_confirmed == True
    ).first()
    
    if not memory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory not found",
        )
    
    # Check if capsule already exists
    existing = db.query(TimeCapsule).filter(
        TimeCapsule.memory_id == capsule_data.memory_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Time capsule already exists for this memory",
        )
    
    capsule = TimeCapsule(
        capsule_id=generate_memory_id(),
        couple_id=current_user.couple_id,
        user_id=current_user.uid,
        memory_id=capsule_data.memory_id,
        unlock_date=capsule_data.unlock_date,
        is_unlocked=False,
        created_at=datetime.utcnow()
    )
    
    db.add(capsule)
    db.commit()
    db.refresh(capsule)
    
    return capsule


@app.get("/timecapsule/{capsule_id}", response_model=TimeCapsuleResponse)
def get_time_capsule(
    capsule_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    capsule = db.query(TimeCapsule).filter(
        TimeCapsule.capsule_id == capsule_id,
        TimeCapsule.couple_id == current_user.couple_id
    ).first()
    
    if not capsule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time capsule not found",
        )
    
    # Check if unlocked
    if not capsule.is_unlocked and datetime.utcnow() < capsule.unlock_date:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Time capsule not yet unlocked",
        )
    
    # Auto-unlock if date passed
    if not capsule.is_unlocked and datetime.utcnow() >= capsule.unlock_date:
        capsule.is_unlocked = True
        db.commit()
    
    return capsule


@app.get("/timecapsules", response_model=list[TimeCapsuleResponse])
def get_time_capsules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    capsules = db.query(TimeCapsule).filter(
        TimeCapsule.couple_id == current_user.couple_id
    ).order_by(TimeCapsule.unlock_date.asc()).all()
    
    return capsules


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "memory-service"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8004))
    uvicorn.run(app, host="0.0.0.0", port=port)
