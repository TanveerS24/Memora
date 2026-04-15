import uuid
from datetime import datetime


def generate_couple_id() -> str:
    return str(uuid.uuid4())
