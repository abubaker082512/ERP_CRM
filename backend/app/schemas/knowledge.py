from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ArticleBase(BaseModel):
    title: str
    body: Optional[str] = None
    category: str = "general"

class ArticleCreate(ArticleBase):
    pass

class Article(ArticleBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
