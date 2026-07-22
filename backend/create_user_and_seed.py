import os
import sys
import requests
from datetime import datetime

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from supabase import create_client, Client

def create_user_and_seed():
    print("Starting User Creation and Seeding...")

    # 1. Signup a seed user
    url = f"{settings.SUPABASE_URL}/auth/v1/signup"
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    payload = {
        "email": "admin@beraxis.online",
        "password": "SeedAdmin123!",
        "data": {"name": "Seed Administrator"}
    }
    
    print(f"Creating user admin@beraxis.online...")
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        print("User created successfully (or already exists).")
    else:
        print(f"User creation failed: {response.text}")
        # Even if it fails (e.g. user exists), we try to login

    # 2. Login to get token
    url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
    payload = {
        "email": "admin@beraxis.online",
        "password": "SeedAdmin123!"
    }
    print("Logging in to get session token...")
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return

    session = response.json()
    token = session["access_token"]
    user_id = session["user"]["id"]
    print(f"Login successful. User ID: {user_id}")

    # 3. Create a client with the user's token
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    client.postgrest.auth(token)

    # 4. Seed Data
    print("Seeding data for this user's tenant...")
    
    # We need to explicitly set tenant_id for some tables if the DEFAULT auth.uid() doesn't work as expected in the insert
    # Actually, the DB trigger or DEFAULT auth.uid() should handle it, but let's be safe.
    
    # Seed Contacts
    contacts = [
        {"name": "Alice Smith", "email": "alice@example.com", "phone": "1234567890", "tenant_id": user_id},
        {"name": "Bob Jones", "email": "bob@example.com", "phone": "0987654321", "tenant_id": user_id},
        {"name": "Tech Corp", "email": "info@techcorp.com", "is_company": True, "tenant_id": user_id},
    ]
    try:
        client.table("contacts").insert(contacts).execute()
        print("Contacts seeded.")
    except Exception as e:
        print(f"Error seeding contacts: {e}")

    # Seed Products
    products = [
        {"name": "Laptop Pro", "list_price": 1200.0, "standard_price": 800.0, "type": "product", "default_code": "LAP001", "tenant_id": user_id},
        {"name": "Wireless Mouse", "list_price": 25.0, "standard_price": 10.0, "type": "consu", "default_code": "MOU001", "tenant_id": user_id},
    ]
    try:
        client.table("product_product").insert(products).execute()
        print("Products seeded.")
    except Exception as e:
        print(f"Error seeding products: {e}")

    # Seed Leads
    leads = [
        {"name": "New Project Inquiry", "email_from": "jane@gmail.com", "probability": 20.0, "type": "lead", "tenant_id": user_id},
        {"name": "Bulk Order Opportunity", "email_from": "sales@bigretail.com", "probability": 60.0, "type": "opportunity", "tenant_id": user_id},
    ]
    try:
        client.table("crm_lead").insert(leads).execute()
        print("Leads seeded.")
    except Exception as e:
        print(f"Error seeding leads: {e}")

    print("Seeding completed successfully!")
    print("\n--- CREDENTIALS FOR TESTING ---")
    print("Email: admin@beraxis.online")
    print("Password: SeedAdmin123!")
    print("-------------------------------")

if __name__ == "__main__":
    create_user_and_seed()
