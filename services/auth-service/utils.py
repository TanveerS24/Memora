import uuid
import random
import string


def generate_uid() -> str:
    return str(uuid.uuid4())


def generate_username(name: str) -> str:
    # Clean name: lowercase, remove spaces and special characters
    name_clean = ''.join(c for c in name.lower() if c.isalnum())
    return name_clean
