import os
from pydantic_settings import BaseSettings

DEFAULT_SUPABASE_URL = "https://hgmdredpqwuooxbbsejw.supabase.co"
DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbWRyZWRwcXd1b294YmJzZWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwODAyMTcsImV4cCI6MjEwNTY1NjIxN30.lao9ScQb91a6AknqONwLE62l1wcgNYHft2F5VLLBjCM"
DEFAULT_SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbWRyZWRwcXd1b294YmJzZWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA4MDIxNywiZXhwIjoyMTA1NjU2MjE3fQ.jZCH75eRrhrQ2A_8Avu-MGwQwctohyF-ocioBAh3oXU"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Next-Gen AI ERP"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL") or DEFAULT_SUPABASE_URL
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY") or DEFAULT_SUPABASE_KEY
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or DEFAULT_SUPABASE_SERVICE_ROLE_KEY
    CORS_ORIGINS: list = ["*"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

