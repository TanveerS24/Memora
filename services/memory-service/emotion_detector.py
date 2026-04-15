from typing import Literal
from schemas import EmotionTag


class EmotionDetector:
    def __init__(self):
        self.happy_keywords = [
            "happy", "joy", "love", "excited", "wonderful", "amazing", "great",
            "beautiful", "fun", "laugh", "smile", "celebrate", "blessed", "grateful"
        ]
        self.sad_keywords = [
            "sad", "cry", "miss", "lonely", "hurt", "pain", "loss", "grief",
            "depressed", "unhappy", "sorrow", "heartbreak"
        ]
        self.angry_keywords = [
            "angry", "mad", "furious", "hate", "frustrated", "annoyed", "upset",
            "irritated", "rage", "furious", "disappointed"
        ]
        self.romantic_keywords = [
            "love", "romantic", "kiss", "hug", "date", "anniversary", "together",
            "forever", "heart", "darling", "sweet", "passionate", "intimate"
        ]
    
    def detect(self, text: str) -> EmotionTag:
        text_lower = text.lower()
        
        scores = {
            EmotionTag.happy: 0,
            EmotionTag.sad: 0,
            EmotionTag.angry: 0,
            EmotionTag.romantic: 0
        }
        
        for keyword in self.happy_keywords:
            if keyword in text_lower:
                scores[EmotionTag.happy] += 1
        
        for keyword in self.sad_keywords:
            if keyword in text_lower:
                scores[EmotionTag.sad] += 1
        
        for keyword in self.angry_keywords:
            if keyword in text_lower:
                scores[EmotionTag.angry] += 1
        
        for keyword in self.romantic_keywords:
            if keyword in text_lower:
                scores[EmotionTag.romantic] += 1
        
        # Get emotion with highest score
        max_emotion = EmotionTag.happy
        max_score = 0
        
        for emotion, score in scores.items():
            if score > max_score:
                max_score = score
                max_emotion = emotion
        
        # Default to happy if no strong emotion detected
        if max_score == 0:
            return EmotionTag.happy
        
        return max_emotion


emotion_detector = EmotionDetector()
