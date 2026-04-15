import uuid
import tiktoken
from datetime import datetime, timedelta


def generate_memory_id() -> str:
    return str(uuid.uuid4())


def generate_chunk_id() -> str:
    return str(uuid.uuid4())


def count_tokens(text: str) -> int:
    encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))


def chunk_text(text: str, min_tokens: int = 300, max_tokens: int = 500) -> list[str]:
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)
    
    chunks = []
    current_chunk = []
    current_count = 0
    
    for token in tokens:
        current_chunk.append(token)
        current_count += 1
        
        if current_count >= max_tokens:
            chunk_text = encoding.decode(current_chunk)
            chunks.append(chunk_text)
            current_chunk = []
            current_count = 0
    
    if current_chunk:
        chunk_text = encoding.decode(current_chunk)
        chunks.append(chunk_text)
    
    return chunks


def get_active_months() -> int:
    return int(os.getenv("MEMORY_ACTIVE_MONTHS", "2"))


def should_archive(memory_date: datetime) -> bool:
    active_months = get_active_months()
    cutoff_date = datetime.utcnow() - timedelta(days=30 * active_months)
    return memory_date < cutoff_date
