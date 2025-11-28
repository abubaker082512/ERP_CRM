from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.knowledge import Article, ArticleCreate
from app.core.supabase_client import supabase

router = APIRouter()

@router.post("/articles", response_model=Article)
def create_article(article: ArticleCreate):
    data = article.dict(exclude_unset=True)
    resp = supabase.table("knowledge_article").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create article")
    return resp.data[0]

@router.get("/articles", response_model=List[Article])
def read_articles():
    resp = supabase.table("knowledge_article").select("*").execute()
    return resp.data
