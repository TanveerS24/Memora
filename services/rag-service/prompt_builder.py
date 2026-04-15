from typing import List
from schemas import RAGMode


class PromptBuilder:
    @staticmethod
    def build_context(memories: List[str]) -> str:
        if not memories:
            return "No relevant memories found."
        
        context = "Here are some relevant memories:\n\n"
        for i, memory in enumerate(memories, 1):
            context += f"Memory {i}: {memory}\n"
        
        return context
    
    @staticmethod
    def build_prompt(query: str, context: str, mode: RAGMode) -> str:
        base_instruction = """You are Memora, an emotionally intelligent relationship memory assistant.

Be warm and natural. Use only provided memories. Never hallucinate. Respect privacy and hidden content."""
        
        mode_instructions = {
            RAGMode.qa: "Answer the user's question based on the memories.",
            RAGMode.love_letter: "Write a romantic love letter based on these memories.",
            RAGMode.caption: "Write a beautiful, romantic caption for this memory.",
            RAGMode.summary: "Summarize these memories in a heartwarming way."
        }
        
        instruction = mode_instructions.get(mode, mode_instructions[RAGMode.qa])
        
        full_prompt = f"""{base_instruction}

{context}

{instruction}

Query: {query}"""
        
        return full_prompt
