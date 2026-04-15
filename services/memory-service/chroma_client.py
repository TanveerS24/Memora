import chromadb
from chromadb.config import Settings
import os


class ChromaClient:
    def __init__(self):
        chroma_url = os.getenv("CHROMA_URL", "http://chroma:8000")
        self.client = chromadb.HttpClient(host=chroma_url.split("://")[1], port=8000)
        self.collection_name = "memora_memories"
        self.collection = self._get_or_create_collection()
    
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
