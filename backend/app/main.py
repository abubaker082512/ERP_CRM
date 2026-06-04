from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME, 
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    redirect_slashes=False
)

# Middleware will be added in order below

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.core.supabase_client import token_ctx_var

class JWTContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            # Extract Bearer token if present
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                token_ctx_var.set(token)
            else:
                token_ctx_var.set("") # Default to empty for unauthenticated routes
                
            return await call_next(request)
        except Exception as e:
            print(f"[ERROR] Middleware failed: {e}")
            return await call_next(request)

app.add_middleware(JWTContextMiddleware)

import os
cors_origins = settings.CORS_ORIGINS
env_cors = os.getenv("CORS_ORIGINS")
if env_cors:
    cors_origins = [o.strip() for o in env_cors.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
 
from app.db.session import engine
from sqlalchemy import text

@app.on_event("startup")
def run_db_migrations():
    if engine is None:
        print("[MIGRATION] Skipping — no DATABASE_URL configured. Using Supabase client directly.")
        return
    print("[MIGRATION] Running startup database migrations...")
    try:
        with engine.connect() as connection:
            # 1. Alter mail_message to add author_name column
            connection.execute(text("ALTER TABLE mail_message ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'User';"))
            # 2. Reload PostgREST schema cache
            connection.execute(text("NOTIFY pgrst, 'reload schema';"))
            connection.commit()
            print("[MIGRATION] Startup migrations applied successfully!")
    except Exception as e:
        print(f"[MIGRATION] [ERROR] Failed to run database migrations: {e}")

from app.services.sentiment import sentiment_service
 
@app.get("/test-ai/sentiment")
def test_sentiment(text: str):
    return sentiment_service.analyze(text)
 
@app.get("/")
def read_root():
    return {"message": "Welcome to Next-Gen AI ERP API"}
