from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Only create the engine if DATABASE_URL is provided.
# The app primarily uses Supabase directly; SQLAlchemy is optional.
engine = None
SessionLocal = None

if settings.DATABASE_URL:
    try:
        engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        print("[DB] SQLAlchemy engine created successfully.")
    except Exception as e:
        print(f"[DB] WARNING: Could not create SQLAlchemy engine: {e}")
        engine = None
        SessionLocal = None
else:
    print("[DB] DATABASE_URL not set — SQLAlchemy engine skipped. Using Supabase client directly.")
