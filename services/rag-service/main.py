from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

from database import engine, get_db, Base
from models import MemoryChunk, Memory
from schemas import RAGQuery, RAGResponse, RAGMode
from auth import decode_token
from ollama_client import ollama_client
from prompt_builder import PromptBuilder

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RAG Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    return payload


def build_where_clause(couple_id: str, include_archived: bool) -> dict:
    where = {"couple_id": couple_id}
    if not include_archived:
        where["layer"] = "active"
    return where


@app.post("/query", response_model=RAGResponse)
def query_memories(
    rag_data: RAGQuery,
    db: Session = Depends(get_db)
):
    # Build where clause
    where = build_where_clause(rag_data.couple_id, rag_data.include_archived)
    
    # Query ChromaDB (stubbed for now)
    # TODO: Re-enable ChromaDB when dependency issues are resolved
    results = {"documents": [[]], "metadatas": [[]]}
    
    # Extract memories
    memories = []
    source_ids = []
    if results and results.get("documents") and results["documents"][0]:
        for doc in results["documents"][0]:
            memories.append(doc)
        if results.get("metadatas") and results["metadatas"][0]:
            for meta in results["metadatas"][0]:
                source_ids.append(meta.get("memory_id", ""))
    
    # Build context
    context = PromptBuilder.build_context(memories)
    
    # Build prompt
    prompt = PromptBuilder.build_prompt(rag_data.query, context, rag_data.mode)
    
    # Generate response
    response = ollama_client.generate_response(prompt)
    
    return RAGResponse(
        response=response,
        sources=source_ids,
        mode=rag_data.mode
    )


@app.post("/loveletter", response_model=RAGResponse)
def generate_love_letter(
    rag_data: RAGQuery,
    db: Session = Depends(get_db)
):
    rag_data.mode = RAGMode.love_letter
    return query_memories(rag_data, db)


@app.post("/caption", response_model=RAGResponse)
def generate_caption(
    rag_data: RAGQuery,
    db: Session = Depends(get_db)
):
    rag_data.mode = RAGMode.caption
    return query_memories(rag_data, db)


@app.post("/summary", response_model=RAGResponse)
def generate_summary(
    rag_data: RAGQuery,
    db: Session = Depends(get_db)
):
    rag_data.mode = RAGMode.summary
    return query_memories(rag_data, db)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "rag-service"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8005))
    uvicorn.run(app, host="0.0.0.0", port=port)
