import ollama
import os


class OllamaClient:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_URL", "http://ollama:11434")
        self.model = "llama3.1:8b"
        self.embedding_model = "nomic-embed-text"
    
    def generate_response(self, prompt: str, context: str = "") -> str:
        full_prompt = f"""You are Memora, an emotionally intelligent relationship memory assistant.

Be warm and natural. Use only provided memories. Never hallucinate. Respect privacy and hidden content.

{context}

User Query: {prompt}

Provide a thoughtful, caring response:"""
        
        try:
            response = ollama.generate(
                model=self.model,
                prompt=full_prompt,
                options={"temperature": 0.7}
            )
            return response.get("response", "").strip()
        except Exception as e:
            print(f"Ollama generation error: {e}")
            return "I'm having trouble generating a response right now. Please try again."
    
    def generate_embedding(self, text: str) -> list:
        try:
            response = ollama.embeddings(
                model=self.embedding_model,
                prompt=text
            )
            return response.get("embedding", [])
        except Exception as e:
            print(f"Ollama embedding error: {e}")
            return []


ollama_client = OllamaClient()
