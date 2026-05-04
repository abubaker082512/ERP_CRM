import requests

SUPABASE_URL = "https://rzqnojqmmtwkkrviaasc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cW5vanFtbXR3a2tydmlhYXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTA3MTQsImV4cCI6MjA5MjI4NjcxNH0.coaXzNy0iZvDWa5t4tkpaX7oP78nOahXeM_PDlwT99Q"

def check():
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    payload = {"email": "admin@erp-crm.com", "password": "SeedAdmin123!"}
    res = requests.post(url, headers={"apikey": SUPABASE_KEY}, json=payload)
    if res.status_code == 200:
        print("ORIGINAL_ADMIN_ACTIVE")
    else:
        print(f"ORIGINAL_ADMIN_FAILED: {res.text}")

if __name__ == "__main__":
    check()
