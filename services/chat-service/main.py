from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Header, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import httpx
import secrets

from database import engine, get_db, Base
from models import User, Message, Couple
from schemas import MessageCreate, MessageResponse
from auth import decode_token
from utils import generate_message_id
from connection_manager import manager

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chat Service", version="1.0.0")

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

RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", "http://rag-service:8005")


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


async def call_rag_service(query: str, couple_id: str) -> str:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{RAG_SERVICE_URL}/api/rag/query",
                json={"query": query, "couple_id": couple_id},
                timeout=30.0
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("response", "")
        except Exception as e:
            print(f"RAG service error: {e}")
    return "I'm having trouble accessing memories right now. Please try again."


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    db: Session = Depends(get_db)
):
    # Accept the websocket connection to complete the handshake
    await websocket.accept()
    
    # For now, we'll use a simple approach - the frontend will pass user_id as query param
    # In production, you'd validate the session cookie properly
    user_id = websocket.query_params.get("user_id")
    if not user_id:
        await websocket.close(code=1008)
        return
    
    user = db.query(User).filter(User.uid == user_id).first()
    
    if not user or not user.couple_id:
        await websocket.close(code=1008)
        return
    
    couple_id = user.couple_id
    
    await manager.connect(couple_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            message_type = data.get("type")
            
            if message_type == "message":
                content = data.get("content", "")
                
                # Check for @memora trigger
                is_ai_query = "@memora" in content.lower()
                
                # Create message
                message = Message(
                    message_id=generate_message_id(),
                    couple_id=couple_id,
                    sender_id=user.uid,
                    content=content,
                    is_ai_response=False,
                    is_read=False,
                    timestamp=datetime.utcnow()
                )
                
                db.add(message)
                db.commit()
                db.refresh(message)
                
                # Broadcast user message
                await manager.broadcast(couple_id, {
                    "type": "message",
                    "data": {
                        "message_id": message.message_id,
                        "sender_id": message.sender_id,
                        "content": message.content,
                        "is_ai_response": message.is_ai_response,
                        "timestamp": message.timestamp.isoformat()
                    }
                })
                
                # If AI query, send to RAG and broadcast response
                if is_ai_query:
                    # Remove @memora from query
                    clean_query = content.replace("@memora", "").strip()
                    if clean_query:
                        ai_response = await call_rag_service(clean_query, couple_id)
                        
                        # Create AI message
                        ai_message = Message(
                            message_id=generate_message_id(),
                            couple_id=couple_id,
                            sender_id="memora_ai",
                            content=ai_response,
                            is_ai_response=True,
                            is_read=False,
                            timestamp=datetime.utcnow()
                        )
                        
                        db.add(ai_message)
                        db.commit()
                        db.refresh(ai_message)
                        
                        # Broadcast AI response
                        await manager.broadcast(couple_id, {
                            "type": "message",
                            "data": {
                                "message_id": ai_message.message_id,
                                "sender_id": ai_message.sender_id,
                                "content": ai_message.content,
                                "is_ai_response": ai_message.is_ai_response,
                                "timestamp": ai_message.timestamp.isoformat()
                            }
                        })
            
            elif message_type == "typing":
                await manager.broadcast(couple_id, {
                    "type": "typing",
                    "data": {"user_id": user.uid}
                })
            
            elif message_type == "read_receipt":
                message_id = data.get("message_id")
                message = db.query(Message).filter(
                    Message.message_id == message_id,
                    Message.couple_id == couple_id
                ).first()
                if message:
                    message.is_read = True
                    db.commit()
                    
                    await manager.broadcast(couple_id, {
                        "type": "read_receipt",
                        "data": {"message_id": message_id}
                    })
    
    except WebSocketDisconnect:
        manager.disconnect(couple_id, websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(couple_id, websocket)


@app.get("/history", response_model=list[MessageResponse])
def get_chat_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    messages = db.query(Message).filter(
        Message.couple_id == current_user.couple_id
    ).order_by(Message.timestamp.desc()).offset(offset).limit(limit).all()
    
    return messages[::-1]  # Return in chronological order


@app.post("/send", response_model=MessageResponse)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    content = message_data.content
    
    # Check for @memora trigger
    is_ai_query = "@memora" in content.lower()
    
    message = Message(
        message_id=generate_message_id(),
        couple_id=current_user.couple_id,
        sender_id=current_user.uid,
        content=content,
        is_ai_response=False,
        is_read=False,
        timestamp=datetime.utcnow()
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # If AI query, send to RAG and create AI response
    if is_ai_query:
        clean_query = content.replace("@memora", "").strip()
        if clean_query:
            try:
                ai_response = await call_rag_service(clean_query, current_user.couple_id)
                
                # Create AI message
                ai_message = Message(
                    message_id=generate_message_id(),
                    couple_id=current_user.couple_id,
                    sender_id="memora_ai",
                    content=ai_response,
                    is_ai_response=True,
                    is_read=False,
                    timestamp=datetime.utcnow()
                )
                
                db.add(ai_message)
                db.commit()
            except Exception as e:
                print(f"Error calling RAG service: {e}")
    
    return message


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "chat-service"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8003))
    uvicorn.run(app, host="0.0.0.0", port=port)
