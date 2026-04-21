import uuid
import os
from datetime import datetime
from PIL import Image
import io


def generate_media_id() -> str:
    return str(uuid.uuid4())


def get_file_extension(filename: str) -> str:
    return filename.split(".")[-1].lower()


def get_mime_type(filename: str) -> str:
    ext = get_file_extension(filename)
    mime_types = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "webp": "image/webp",
        "mp3": "audio/mpeg",
        "wav": "audio/wav",
        "m4a": "audio/mp4",
        "mp4": "video/mp4",
        "mov": "video/quicktime"
    }
    return mime_types.get(ext, "application/octet-stream")


def get_media_type(filename: str) -> str:
    mime_type = get_mime_type(filename)
    if mime_type.startswith("image/"):
        return "image"
    elif mime_type.startswith("audio/"):
        return "audio"
    elif mime_type.startswith("video/"):
        return "video"
    return "unknown"


def create_thumbnail(image_path: str, size: tuple = (200, 200)) -> str:
    try:
        with Image.open(image_path) as img:
            img.thumbnail(size)
            thumb_path = image_path.replace(".", "_thumb.")
            img.save(thumb_path, optimize=True, quality=85)
            return thumb_path
    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        return None
