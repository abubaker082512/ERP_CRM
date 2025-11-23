from fastapi import FastAPI
from app.core.config import settings
from fastapi import FastAPI
from app.core.config import settings
from app.api.api import api_router

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

app.include_router(api_router, prefix=settings.API_V1_STR)

from app.services.sentiment import sentiment_service

@app.get("/test-ai/sentiment")
def test_sentiment(text: str):
    return sentiment_service.analyze(text)

@app.get("/")
def read_root():
    return {"message": "Welcome to Next-Gen AI ERP API"}
