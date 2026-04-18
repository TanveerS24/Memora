from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
import os
import secrets

from database import engine, get_db, Base
from models import User, PartnerRequest, Couple, Partner, RequestStatus
from schemas import (
    PartnerSearch, PartnerRequestCreate, PartnerRequestResponse,
    CoupleCreate, CoupleResponse, UserResponse, PartnerInfo
)
from utils import generate_couple_id

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Partner Service", version="1.0.0")

# Add SessionMiddleware with secure cookie settings
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", secrets.token_urlsafe(32)),
    max_age=3600,  # 1 hour session
    session_cookie="session",
    same_site="lax",
    https_only=False,  # Set to True in production
    domain="localhost",  # Share cookie across ports on localhost
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    user = db.query(User).filter(User.uid == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    return user


@app.post("/search", response_model=list[UserResponse])
def search_partner(search: PartnerSearch, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Search by UID or username
    users = db.query(User).filter(
        or_(
            User.uid == search.search_term,
            User.username == search.search_term
        ),
        User.uid != current_user.uid,
        User.is_active == True
    ).all()
    
    return users


@app.post("/request", response_model=PartnerRequestResponse, status_code=status.HTTP_201_CREATED)
def send_partner_request(
    request_data: PartnerRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user already has a partner
    if current_user.couple_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a partner",
        )
    
    # Check if receiver exists
    receiver = db.query(User).filter(User.uid == request_data.receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Check if receiver already has a partner
    if receiver.couple_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a partner",
        )
    
    # Check if request already exists
    existing_request = db.query(PartnerRequest).filter(
        PartnerRequest.sender_id == current_user.uid,
        PartnerRequest.receiver_id == request_data.receiver_id,
        PartnerRequest.status == RequestStatus.pending
    ).first()
    
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Partner request already sent",
        )
    
    # Create partner request
    new_request = PartnerRequest(
        sender_id=current_user.uid,
        receiver_id=request_data.receiver_id,
        status=RequestStatus.pending,
        created_at=datetime.utcnow()
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return new_request


@app.get("/requests/pending")
def get_pending_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    requests = db.query(PartnerRequest).filter(
        PartnerRequest.receiver_id == current_user.uid,
        PartnerRequest.status == RequestStatus.pending
    ).all()
    
    # Include sender details in response
    result = []
    for request in requests:
        sender = db.query(User).filter(User.uid == request.sender_id).first()
        result.append({
            "id": request.id,
            "sender_id": request.sender_id,
            "sender_name": sender.name if sender else "Unknown",
            "sender_username": sender.username if sender else "Unknown",
            "receiver_id": request.receiver_id,
            "status": request.status.value,
            "created_at": request.created_at.isoformat()
        })
    
    return result


@app.post("/accept/{request_id}", response_model=CoupleResponse)
def accept_partner_request(
    request_id: int,
    couple_data: CoupleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get the request
    partner_request = db.query(PartnerRequest).filter(
        PartnerRequest.id == request_id,
        PartnerRequest.receiver_id == current_user.uid,
        PartnerRequest.status == RequestStatus.pending
    ).first()
    
    if not partner_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )
    
    # Check if user already has a partner
    if current_user.couple_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a partner",
        )
    
    # Get sender
    sender = db.query(User).filter(User.uid == partner_request.sender_id).first()
    if not sender or sender.couple_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sender is no longer available",
        )
    
    # Create couple
    couple_id = generate_couple_id()
    new_couple = Couple(
        couple_id=couple_id,
        user1_id=current_user.uid,
        user2_id=sender.uid,
        anniversary_date=couple_data.anniversary_date,
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    # Update request status
    partner_request.status = RequestStatus.accepted
    
    # Update users
    current_user.couple_id = couple_id
    sender.couple_id = couple_id
    
    # Create partner entries
    partner1 = Partner(user_id=current_user.uid, partner_id=sender.uid, couple_id=couple_id)
    partner2 = Partner(user_id=sender.uid, partner_id=current_user.uid, couple_id=couple_id)
    
    db.add(new_couple)
    db.add(partner1)
    db.add(partner2)
    db.commit()
    db.refresh(new_couple)
    
    return new_couple


@app.post("/reject/{request_id}")
def reject_partner_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    partner_request = db.query(PartnerRequest).filter(
        PartnerRequest.id == request_id,
        PartnerRequest.receiver_id == current_user.uid,
        PartnerRequest.status == RequestStatus.pending
    ).first()
    
    if not partner_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )
    
    partner_request.status = RequestStatus.rejected
    db.commit()
    
    return {"message": "Request rejected"}


@app.get("/info", response_model=PartnerInfo)
def get_partner_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.couple_id:
        return PartnerInfo(partner=None, couple=None, is_paired=False)
    
    # Get partner
    partner = db.query(User).filter(User.couple_id == current_user.couple_id, User.uid != current_user.uid).first()
    
    # Get couple
    couple = db.query(Couple).filter(Couple.couple_id == current_user.couple_id).first()
    
    return PartnerInfo(
        partner=partner,
        couple=couple,
        is_paired=True
    )


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "partner-service"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
