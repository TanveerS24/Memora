import uuid
import random
import string


def generate_uid() -> str:
    return str(uuid.uuid4())


def generate_username(name: str) -> str:
    name_clean = name.lower().replace(" ", "")
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"{name_clean}{random_suffix}"
