from pydantic import BaseModel
from typing import Optional
import enum


class MediaType(str, enum.Enum):
    image = "image"
    audio = "audio"
    video = "video"


class MediaUploadResponse(BaseModel):
    media_id: str
    file_url: str
    thumbnail_url: Optional[str]
    media_type: MediaType
    file_size: int
