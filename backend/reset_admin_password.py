import requests

# Hardcoded settings since the module import is failing
SUPABASE_URL = "https://rzqnojqmmtwkkrviaasc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cW5vanFtbXR3a2tydmlhYXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTA3MTQsImV4cCI6MjA5MjI4NjcxNH0.coaXzNy0iZvDWa5t4tkpaX7oP78nOahXeM_PDlwT99Q"

def reset_password():
    print("Attempting to update admin password directly via Supabase Auth API...")
    
    url = f"{SUPABASE_URL}/auth/v1/signup"
    headers = {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json"
    }
    
    # Trying a fresh admin account
    payload = {
        "email": "admin2@erp-crm.com",
        "password": "NewAdmin123!",
        "data": {"name": "Galaxy Admin"}
    }
    
    print(f"Creating backup user admin2@erp-crm.com...")
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        print("Success! You can now log in with:")
        print("Email: admin2@erp-crm.com")
        print("Password: NewAdmin123!")
    elif "User already registered" in response.text:
        print("User admin2@erp-crm.com already exists. You can try logging in with it.")
    else:
        print(f"Failed: {response.text}")

if __name__ == "__main__":
    reset_password()
