from fastapi import FastAPI, Depends, HTTPException, status, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
import shutil

from database import engine, get_db, Base
from models import Media, MediaType
from schemas import MediaUploadResponse
from auth import decode_token
from utils import generate_media_id, get_file_extension, get_mime_type, get_media_type, create_thumbnail

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Media Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MEDIA_STORAGE_PATH = os.getenv("MEDIA_STORAGE_PATH", "/app/media")
os.makedirs(MEDIA_STORAGE_PATH, exist_ok=True)

app.mount("/media", StaticFiles(directory=MEDIA_STORAGE_PATH), name="media")


async def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    return payload


@app.post("/upload", response_model=MediaUploadResponse)
async def upload_media(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.get("sub")
    
    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided",
        )
    
    # Get file info
    ext = get_file_extension(file.filename)
    mime_type = get_mime_type(file.filename)
    media_type_str = get_media_type(file.filename)
    
    if media_type_str == "unknown":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type",
        )
    
    # Generate unique filename
    media_id = generate_media_id()
    filename = f"{media_id}.{ext}"
    file_path = os.path.join(MEDIA_STORAGE_PATH, filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_size = os.path.getsize(file_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}",
        )
    
    # Create thumbnail for images
    thumbnail_path = None
    thumbnail_url = None
    if media_type_str == "image":
        thumbnail_path = create_thumbnail(file_path)
        if thumbnail_path:
            thumbnail_url = f"/media/{os.path.basename(thumbnail_path)}"
    
    # Save to database
    media = Media(
        media_id=media_id,
        user_id=user_id,
        memory_id=None,
        media_type=MediaType(media_type_str),
        file_path=file_path,
        file_size=file_size,
        mime_type=mime_type,
        thumbnail_path=thumbnail_path,
        metadata={"original_filename": file.filename}
    )
    
    db.add(media)
    db.commit()
    db.refresh(media)
    
    return MediaUploadResponse(
        media_id=media_id,
        file_url=f"/media/{filename}",
        thumbnail_url=thumbnail_url,
        media_type=MediaType(media_type_str),
        file_size=file_size
    )


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "media-service"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8006))
    uvicorn.run(app, host="0.0.0.0", port=port)
