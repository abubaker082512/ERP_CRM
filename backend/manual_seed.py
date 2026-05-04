import requests

# Hardcoded settings
SUPABASE_URL = "https://rzqnojqmmtwkkrviaasc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cW5vanFtbXR3a2tydmlhYXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTA3MTQsImV4cCI6MjA5MjI4NjcxNH0.coaXzNy0iZvDWa5t4tkpaX7oP78nOahXeM_PDlwT99Q"

def seed():
    print("Starting manual seeding for admin account...")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    # 1. Login to get admin token
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    payload = {"email": "admin2@erp-crm.com", "password": "NewAdmin123!"}
    
    res = requests.post(url, headers=headers, json=payload)
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return

    session = res.json()
    token = session["access_token"]
    user_id = session["user"]["id"]
    print(f"Logged in. User ID: {user_id}")

    # 2. Update headers with user token
    user_headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 3. Seed Contacts
    print("Seeding contacts...")
    contacts = [
        {"name": "Alice Smith", "email": "alice@example.com", "phone": "1234567890", "tenant_id": user_id},
        {"name": "Bob Jones", "email": "bob@example.com", "phone": "0987654321", "tenant_id": user_id},
        {"name": "Tech Corp", "email": "info@techcorp.com", "is_company": True, "tenant_id": user_id},
    ]
    res = requests.post(f"{SUPABASE_URL}/rest/v1/contacts", headers=user_headers, json=contacts)
    print(f"Contacts seed status: {res.status_code}")

    # 4. Seed Products
    print("Seeding products...")
    products = [
        {"name": "Laptop Pro", "list_price": 1200.0, "standard_price": 800.0, "type": "product", "default_code": "LAP001", "tenant_id": user_id},
        {"name": "Wireless Mouse", "list_price": 25.0, "standard_price": 10.0, "type": "consu", "default_code": "MOU001", "tenant_id": user_id},
    ]
    res = requests.post(f"{SUPABASE_URL}/rest/v1/product_product", headers=user_headers, json=products)
    print(f"Products seed status: {res.status_code}")

    # 5. Seed Leads
    print("Seeding leads...")
    leads = [
        {"name": "New Project Inquiry", "email_from": "jane@gmail.com", "probability": 20.0, "type": "lead", "tenant_id": user_id, "stage": "New"},
        {"name": "Bulk Order Opportunity", "email_from": "sales@bigretail.com", "probability": 60.0, "type": "opportunity", "tenant_id": user_id, "stage": "Qualified"},
    ]
    res = requests.post(f"{SUPABASE_URL}/rest/v1/crm_lead", headers=user_headers, json=leads)
    print(f"Leads seed status: {res.status_code}")

    print("Manual seeding completed!")

if __name__ == "__main__":
    seed()
