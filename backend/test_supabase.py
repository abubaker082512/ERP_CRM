import os
import sys
from app.core.supabase_client import supabase

sys.path.append(os.getcwd())

def test_supabase_client():
    print("Testing Supabase REST Client...")
    try:
        # Try to fetch something simple, like count of users or just a table check
        # We'll try to select from 'knowledge_article' which we just created (or tried to)
        # Or just 'leads' which exists.
        res = supabase.table("leads").select("count", count="exact").execute()
        print(f"Success! Count: {res.count}")
        print(f"Data: {res.data}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_supabase_client()
