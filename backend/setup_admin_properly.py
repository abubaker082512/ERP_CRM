import requests

SUPABASE_URL = "https://rzqnojqmmtwkkrviaasc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cW5vanFtbXR3a2tydmlhYXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTA3MTQsImV4cCI6MjA5MjI4NjcxNH0.coaXzNy0iZvDWa5t4tkpaX7oP78nOahXeM_PDlwT99Q"

def setup():
    headers = {"apikey": SUPABASE_KEY, "Content-Type": "application/json"}
    
    # 1. Signup the specific admin email
    signup_url = f"{SUPABASE_URL}/auth/v1/signup"
    payload = {
        "email": "admin@erp-crm.com",
        "password": "SeedAdmin123!",
        "data": {"name": "Super Admin"}
    }
    print("Creating admin@erp-crm.com...")
    res = requests.post(signup_url, headers=headers, json=payload)
    if res.status_code != 200:
        print(f"Signup info: {res.text}")
    
    # 2. Login to get token
    login_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    login_payload = {"email": "admin@erp-crm.com", "password": "SeedAdmin123!"}
    res = requests.post(login_url, headers=headers, json=login_payload)
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return

    data = res.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    print(f"Admin ready. ID: {user_id}")

    # 3. Insert into tenants table manually
    rest_headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("Setting up tenant profile...")
    tenant_data = {
        "id": user_id,
        "email": "admin@erp-crm.com",
        "name": "Platform Admin",
        "plan": "premium",
        "trial_ends_at": "2030-01-01T00:00:00Z"
    }
    res = requests.post(f"{SUPABASE_URL}/rest/v1/tenants", headers=rest_headers, json=tenant_data)
    print(f"Tenant profile status: {res.status_code}")

    # 4. Create first workspace
    print("Creating default workspace...")
    ws_data = {
        "owner_id": user_id,
        "name": "Galaxy HQ"
    }
    res = requests.post(f"{SUPABASE_URL}/rest/v1/workspaces", headers=rest_headers, json=ws_data)
    print(f"Workspace creation status: {res.status_code}")

if __name__ == "__main__":
    setup()
