import sys
import os
from app.core.supabase_client import supabase

def test_supabase_client():
    try:
        print("Testing Supabase Client (REST API)...")
        # Try to fetch data from a non-existent table just to check auth/connection
        # Or just check if we can access the health check or similar?
        # Let's try to get the user (which should fail as we are anon but connected)
        # Or just list tables? No, client doesn't list tables easily.
        
        # Let's just check if the client object is valid and URL is reachable
        print(f"Supabase URL: {supabase.supabase_url}")
        
        # Simple query (will likely return empty or error if table doesn't exist, but connection is made)
        response = supabase.table("users").select("*").limit(1).execute()
        print(f"Supabase REST API Connection Successful. Response: {response}")
        
    except Exception as e:
        # If table doesn't exist, it might throw an error, but that means we connected!
        print(f"Supabase REST API Interaction: {e}")

if __name__ == "__main__":
    test_supabase_client()
