from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import httpx

from database import engine, get_db, Base
from models import User, Message, Couple
from schemas import MessageCreate, MessageResponse
from auth import decode_token
from utils import generate_message_id
from connection_manager import manager

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chat Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", "http://rag-service:8005")


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
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    # Verify token
    payload = decode_token(token)
    if payload is None:
        await websocket.close(code=1008)
        return
    
    uid: str = payload.get("sub")
    user = db.query(User).filter(User.uid == uid).first()
    
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
def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not paired with a partner",
        )
    
    message = Message(
        message_id=generate_message_id(),
        couple_id=current_user.couple_id,
        sender_id=current_user.uid,
        content=message_data.content,
        is_ai_response=False,
        is_read=False,
        timestamp=datetime.utcnow()
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return message


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "chat-service"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8003))
    uvicorn.run(app, host="0.0.0.0", port=port)
