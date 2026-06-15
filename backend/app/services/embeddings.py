import os
import hashlib
import numpy as np
from app.core.config import settings

class EmbeddingService:
    """
    Service to generate 1536-dimensional vector embeddings for texts.
    Falls back to a deterministic mock vector if OPENAI_API_KEY is not configured.
    """
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY") or getattr(settings, "OPENAI_API_KEY", "")
        self._client = None
        if self.api_key:
            try:
                from openai import OpenAI
                self._client = OpenAI(api_key=self.api_key)
            except ImportError:
                print("[WARN] openai package not installed. Embedding service will run in MOCK mode.")

    def get_embedding(self, text: str) -> list[float]:
        """
        Generate a 1536-dimensional embedding list.
        """
        if not text:
            return [0.0] * 1536

        if self._client:
            try:
                response = self._client.embeddings.create(
                    input=text,
                    model="text-embedding-3-small"
                )
                return response.data[0].embedding
            except Exception as e:
                print(f"[ERROR] Failed to fetch OpenAI embedding: {e}. Falling back to mock embedding.")
        
        # Deterministic mock embedding fallback
        # Generate a seed from the hash of the text so that same text produces same mock vector
        sha256 = hashlib.sha256(text.encode("utf-8")).digest()
        seed = int.from_bytes(sha256[:4], byteorder="big")
        
        # Use numpy with the seed to generate a unit vector of length 1536
        rng = np.random.default_rng(seed)
        vec = rng.standard_normal(1536)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

embedding_service = EmbeddingService()
