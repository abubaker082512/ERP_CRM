import sys
import os
from sqlalchemy import text
from app.db.session import SessionLocal
from app.core.supabase_client import supabase

def test_db_connection():
    try:
        db = SessionLocal()
        # Try a simple query
        result = db.execute(text("SELECT 1"))
        print(f"Database Connection Successful: {result.scalar()}")
        db.close()
    except Exception as e:
        print(f"Database Connection Failed: {e}")
        sys.exit(1)

def test_supabase_client():
    try:
        # Just check if client is initialized
        if supabase:
            print("Supabase Client Initialized Successfully")
        else:
            print("Supabase Client Initialization Failed")
            sys.exit(1)
    except Exception as e:
        print(f"Supabase Client Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("Testing Connections...")
    test_db_connection()
    test_supabase_client()
