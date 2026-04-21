from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
import os
import secrets

from database import engine, get_db, Base
from models import User
from schemas import UserRegister, UserLogin, UserResponse
from auth import verify_password, get_password_hash
from utils import generate_uid, generate_username

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auth Service", version="1.0.0")

# Add SessionMiddleware with secure cookie settings
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", "your-secret-key-change-in-production"),
    max_age=3600,  # 1 hour session
    session_cookie="session",
    same_site="lax",
    https_only=False,  # Set to True in production
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
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


@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Generate unique identifiers
    uid = generate_uid()
    username = generate_username(user_data.name)
    
    # Ensure username is unique
    while db.query(User).filter(User.username == username).first():
        username = generate_username(user_data.name)
    
    # Hash password
    password_hash = get_password_hash(user_data.password)
    
    # Convert string gender to GenderEnum
    from models import GenderEnum
    gender_enum = GenderEnum(user_data.gender.lower())
    
    # Convert string dob to date
    from datetime import datetime
    dob_date = datetime.strptime(user_data.dob, "%Y-%m-%d").date()
    
    # Create user
    new_user = User(
        uid=uid,
        username=username,
        email=user_data.email,
        password_hash=password_hash,
        name=user_data.name,
        gender=gender_enum,
        dob=dob_date,
        profile_picture=user_data.profile_picture,
        is_active=True,
        couple_id=None,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@app.post("/login", response_model=UserResponse)
def login(user_data: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    
    # Create session
    request.session["user_id"] = user.uid
    request.session["email"] = user.email
    
    return user


@app.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out successfully"}


@app.delete("/account")
def delete_account(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account and all associated data, reset partner relationship"""
    user_id = current_user.uid
    couple_id = current_user.couple_id
    
    try:
        # If user has a partner, reset the partner's couple_id first
        if couple_id:
            # Find the partner (the other user in the couple)
            partner = db.query(User).filter(
                User.couple_id == couple_id,
                User.uid != user_id
            ).first()
            
            if partner:
                # Reset partner's couple_id to NULL so they go back to "connect with partner" page
                partner.couple_id = None
                print(f"Reset partner {partner.uid} couple_id to None")
            
            # Delete all messages for this couple
            db.execute(text("DELETE FROM messages WHERE couple_id = :couple_id"), {"couple_id": couple_id})
            print(f"Deleted all messages for couple {couple_id}")
            
            # Delete partner records first (due to foreign key constraint)
            db.execute(text("DELETE FROM partners WHERE couple_id = :couple_id"), {"couple_id": couple_id})
            print(f"Deleted partner records for couple {couple_id}")
            
            # Delete the couple record
            db.execute(text("DELETE FROM couples WHERE couple_id = :couple_id"), {"couple_id": couple_id})
            print(f"Deleted couple record {couple_id}")
        
        # Delete any partner requests sent by or received by this user
        db.execute(text("DELETE FROM partner_requests WHERE sender_id = :user_id OR receiver_id = :user_id"), {"user_id": user_id})
        print(f"Deleted partner requests for user {user_id}")
        
        # Delete the user
        db.query(User).filter(User.uid == user_id).delete()
        print(f"Deleted user {user_id}")
        
        db.commit()
        
    except Exception as e:
        db.rollback()
        print(f"Error during account deletion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )
    
    # Clear session
    request.session.clear()
    
    return {"message": "Account deleted successfully. Your partner has been unlinked and can connect with a new partner."}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "auth-service"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
