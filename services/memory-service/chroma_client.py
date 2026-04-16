import chromadb
from chromadb.config import Settings
import os
from urllib.parse import urlparse


class ChromaClient:
    def __init__(self):
        self._client = None
        self._collection = None
        self.collection_name = "memora_memories"
    
    @property
    def client(self):
        if self._client is None:
            chroma_url = os.getenv("CHROMA_URL", "http://chroma:8000")
            parsed = urlparse(chroma_url)
            self._client = chromadb.HttpClient(
                host=parsed.hostname,
                port=parsed.port or 8000
            )
        return self._client
    
    @property
    def collection(self):
        if self._collection is None:
            self._collection = self._get_or_create_collection()
        return self._collection
    
    def _get_or_create_collection(self):
        try:
            collection = self.client.get_collection(name=self.collection_name)
        except:
            collection = self.client.create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        return collection
    
    def add_embedding(self, chunk_id: str, text: str, metadata: dict):
        self.collection.add(
            documents=[text],
            metadatas=[metadata],
            ids=[chunk_id]
        )
    
    def query(self, query_text: str, n_results: int = 8, where: dict = None):
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where
        )
        return results
    
    def delete(self, chunk_id: str):
        self.collection.delete(ids=[chunk_id])


chroma_client = ChromaClient()
