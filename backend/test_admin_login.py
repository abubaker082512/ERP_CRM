import requests
import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def test_login():
    url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "email": "admin@example.com",
        "password": "admin"
    }
    
    print("Testing login for admin@example.com...")
    response = requests.post(url, headers=headers, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_login()
