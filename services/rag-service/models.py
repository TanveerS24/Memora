from sqlalchemy import Column, String, Text, ForeignKey, Integer
from database import Base


class MemoryChunk(Base):
    __tablename__ = "memory_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(String(36), unique=True, index=True, nullable=False)
    memory_id = Column(String(36), ForeignKey("memories.memory_id"), nullable=False, index=True)
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    embedding_id = Column(String(100), nullable=True, index=True)


class Memory(Base):
    __tablename__ = "memories"
    
    id = Column(Integer, primary_key=True, index=True)
    memory_id = Column(String(36), unique=True, index=True, nullable=False)
    couple_id = Column(String(36), ForeignKey("couples.couple_id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=False)
