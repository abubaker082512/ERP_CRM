class SentimentService:
    def analyze(self, text: str) -> dict:
        # Simple keyword-based sentiment analysis for demo purposes
        # In production, use NLTK, TextBlob, or OpenAI API
        
        text_lower = text.lower()
        positive_keywords = ["good", "great", "excellent", "happy", "interested", "love", "awesome"]
        negative_keywords = ["bad", "poor", "terrible", "sad", "angry", "hate", "not interested", "unsubscribe"]
        
        score = 0.0
        details = []
        
        for word in positive_keywords:
            if word in text_lower:
                score += 0.2
                details.append(f"Positive keyword: {word}")
                
        for word in negative_keywords:
            if word in text_lower:
                score -= 0.2
                details.append(f"Negative keyword: {word}")
        
        # Clamp score between -1.0 and 1.0
        score = max(min(score, 1.0), -1.0)
        
        sentiment = "Neutral"
        if score > 0.1:
            sentiment = "Positive"
        elif score < -0.1:
            sentiment = "Negative"
            
        return {
            "sentiment": sentiment,
            "score": round(score, 2),
            "details": details
        }

sentiment_service = SentimentService()
