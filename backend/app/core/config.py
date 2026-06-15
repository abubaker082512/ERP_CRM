import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Next-Gen AI ERP"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    E2B_API_KEY: str = os.getenv("E2B_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")
    PLISIO_SECRET_KEY: str = os.getenv("PLISIO_SECRET_KEY", "")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "https://galaxy-erp-backend.onrender.com")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://erp-crm-three.vercel.app")
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "https://erp-crm-three.vercel.app",
        "https://beraxis.online",
        "https://www.beraxis.online",
        "https://your-production-domain.com",
    ]

    class Config:
        env_file = ".env"

settings = Settings()
