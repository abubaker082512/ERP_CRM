import sys
import os

sys.path.append(os.getcwd())

from app.core.config import settings
from app.core.supabase_client import get_service_role_client, supabase

def confirm_and_verify():
    svc = get_service_role_client()
    email = "admin@beraxis.online"
    password = "SeedAdmin123!"

    print("Verifying Admin User in Supabase Auth via Service Role...")
    try:
        # List users from auth admin
        users_resp = svc.auth.admin.list_users()
        admin_user = None
        for u in users_resp:
            if u.email == email:
                admin_user = u
                break

        if admin_user:
            print(f"Found admin user {email} (ID: {admin_user.id}). Confirming email and setting password...")
            svc.auth.admin.update_user_by_id(
                admin_user.id,
                {"email_confirm": True, "password": password}
            )
            print("SUCCESS: Admin email confirmed and password set!")
        else:
            print(f"Creating user {email} via Auth Admin API...")
            res = svc.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"name": "Super Admin"}
            })
            print(f"SUCCESS: Admin created! ID: {res.user.id}")

        # Test login
        login_res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        print(f"SUCCESS: Verified sign-in for {email}! Access Token acquired.")

    except Exception as e:
        print(f"Admin setup detail: {e}")

if __name__ == "__main__":
    confirm_and_verify()
