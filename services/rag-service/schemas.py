from pydantic import BaseModel, Field
from typing import Optional, List
import enum


class RAGMode(str, enum.Enum):
    qa = "qa"
    love_letter = "love_letter"
    caption = "caption"
    summary = "summary"


class RAGQuery(BaseModel):
    query: str = Field(..., min_length=1)
    couple_id: str
    mode: RAGMode = RAGMode.qa
    include_archived: bool = False


class RAGResponse(BaseModel):
    response: str
    sources: List[str]
    mode: RAGMode
