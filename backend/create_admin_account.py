import sys
import os

sys.path.append(os.getcwd())

from app.core.config import settings
from app.core.supabase_client import supabase, get_service_role_client

def create_or_verify_admin():
    email = "admin@beraxis.online"
    password = "SeedAdmin123!"

    print(f"Connecting to Supabase at {settings.SUPABASE_URL}...")
    
    # 1. Attempt login first
    try:
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        print("SUCCESS: Super Admin Account is ACTIVE and verified!")
        print(f"  Email: {email}")
        print(f"  Password: {password}")
        print(f"  User ID: {res.user.id}")
        return
    except Exception as e:
        print(f"Notice: Login attempt ({e}). Proceeding to create/register Admin user...")

    # 2. Signup admin user if not created
    try:
        res = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "name": "Super Admin",
                    "account_type": "company",
                    "company_name": "Beraxis HQ"
                }
            }
        })

        if res.user:
            user_id = str(res.user.id)
            print("SUCCESS: Super Admin Account created successfully!")
            print(f"  Email: {email}")
            print(f"  Password: {password}")
            print(f"  User ID: {user_id}")

            # Ensure tenant profile exists
            try:
                svc = get_service_role_client()
                svc.table("tenants").insert({
                    "id": user_id,
                    "email": email,
                    "name": "Beraxis Admin",
                    "subscription_status": "active"
                }).execute()
            except Exception as te:
                print(f"  Tenant insert info: {te}")
        else:
            print("ERROR: Signup returned no user.")
    except Exception as e:
        print(f"ERROR: Setting up admin account failed: {e}")

if __name__ == "__main__":
    create_or_verify_admin()
