from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID

from app.schemas.knowledge import Article, ArticleCreate


router = APIRouter()

@router.post("/articles", response_model=Article)
def create_article(article: ArticleCreate, client: Client = Depends(get_supabase_client)):
    data = article.dict(exclude_unset=True)
    resp = client.table("knowledge_article").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create article")
    return resp.data[0]

@router.get("/articles", response_model=List[Article])
def read_articles(client: Client = Depends(get_supabase_client)):
    resp = client.table("knowledge_article").select("*").execute()
    return resp.data
