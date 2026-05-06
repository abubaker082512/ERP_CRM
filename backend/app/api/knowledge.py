from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


router = APIRouter()


class ArticleCreate(BaseModel):
    title: str
    body: Optional[str] = None
    category: Optional[str] = "General"
    is_published: Optional[bool] = False
    icon: Optional[str] = "📄"


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    category: Optional[str] = None
    is_published: Optional[bool] = None
    icon: Optional[str] = None


@router.post("/articles")
def create_article(article: ArticleCreate, client: Client = Depends(get_supabase_client)):
    data = article.dict(exclude_unset=True)
    data["updated_at"] = datetime.utcnow().isoformat()
    resp = client.table("knowledge_article").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create article")
    return resp.data[0]


@router.get("/articles")
def read_articles(
    category: Optional[str] = None,
    search: Optional[str] = None,
    client: Client = Depends(get_supabase_client)
):
    query = client.table("knowledge_article").select("*").order("updated_at", desc=True)
    if category:
        query = query.eq("category", category)
    resp = query.execute()
    articles = resp.data or []
    if search:
        s = search.lower()
        articles = [a for a in articles if s in (a.get("title") or "").lower() or s in (a.get("body") or "").lower()]
    return articles


@router.get("/articles/{article_id}")
def read_article(article_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("knowledge_article").select("*").eq("id", article_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return resp.data[0]


@router.put("/articles/{article_id}")
def update_article(article_id: str, article: ArticleUpdate, client: Client = Depends(get_supabase_client)):
    data = article.dict(exclude_unset=True)
    data["updated_at"] = datetime.utcnow().isoformat()
    resp = client.table("knowledge_article").update(data).eq("id", article_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return resp.data[0]


@router.delete("/articles/{article_id}")
def delete_article(article_id: str, client: Client = Depends(get_supabase_client)):
    client.table("knowledge_article").delete().eq("id", article_id).execute()
    return {"message": "Article deleted"}
