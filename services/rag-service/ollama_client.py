import ollama
import os


class OllamaClient:
    def __init__(self):
        self.host = os.getenv("OLLAMA_URL", "http://ollama:11434")
        # Use smaller model that fits in available memory (2GB instead of 4GB)
        self.model = "phi3:mini"
        self.embedding_model = "nomic-embed-text"
        print(f"OllamaClient initialized with host: {self.host}, model: {self.model}")
    
    def generate_response(self, prompt: str, context: str = "") -> str:
        full_prompt = f"""You are Memora, an emotionally intelligent relationship memory assistant.

Be warm and natural. Use only provided memories. Never hallucinate. Respect privacy and hidden content.

{context}

User Query: {prompt}

Provide a thoughtful, caring response:"""
        
        try:
            print(f"Attempting to generate response using Ollama at {self.host} with model {self.model}")
            print(f"Prompt length: {len(full_prompt)} characters")
            client = ollama.Client(host=self.host)
            response = client.generate(
                model=self.model,
                prompt=full_prompt,
                options={"temperature": 0.7}
            )
            result = response.get("response", "").strip()
            print(f"Ollama response generated successfully, length: {len(result)} characters")
            return result
        except Exception as e:
            print(f"Ollama generation error: {e}")
            print(f"Error type: {type(e).__name__}")
            return "I'm having trouble generating a response right now. Please try again."
    
    def generate_embedding(self, text: str) -> list:
        try:
            client = ollama.Client(host=self.host)
            response = client.embeddings(
                model=self.embedding_model,
                prompt=text
            )
            return response.get("embedding", [])
        except Exception as e:
            print(f"Ollama embedding error: {e}")
            return []


ollama_client = OllamaClient()
