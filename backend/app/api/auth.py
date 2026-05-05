from fastapi import APIRouter, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.auth import UserSignup, UserLogin
from app.core.supabase_client import supabase

router = APIRouter()
security = HTTPBearer()

@router.post("/signup")
def signup(user: UserSignup):
    try:
        res = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {
                "data": {
                    "name": user.name,
                    "account_type": user.account_type,
                    "company_name": user.company_name if user.account_type == "company" else f"{user.name or 'My'} Workspace"
                }
            }
        })
        if not res.user:
            raise HTTPException(status_code=400, detail="Signup failed")

        new_user_id = str(res.user.id)

        # Explicitly ensure the user exists in the tenants table
        try:
            supabase.table("tenants").insert({
                "id": new_user_id,
                "email": user.email
            }).execute()
        except Exception as e:
            print(f"[Signup] Tenant insertion warning: {e}")

        # If an invite_id is provided, join the existing workspace
        if user.invite_id:
            invite_resp = supabase.table("invitations").select("*").eq("id", user.invite_id).eq("status", "pending").execute()
            if invite_resp.data:
                invite = invite_resp.data[0]
                # Link user to the workspace
                supabase.table("user_workspaces").insert({
                    "user_id": new_user_id,
                    "workspace_id": invite["workspace_id"],
                    "role": invite.get("role", "user")
                }).execute()
                # Mark invite as accepted
                supabase.table("invitations").update({"status": "accepted"}).eq("id", user.invite_id).execute()
            else:
                raise HTTPException(status_code=400, detail="Invite is invalid or has already been used.")
        else:
            # Create a new workspace for the user since it's a fresh signup
            ws_name = user.company_name if user.account_type == "company" else f"{user.name or 'My'} Workspace"
            ws_resp = supabase.table("workspaces").insert({
                "name": ws_name,
                "owner_id": new_user_id
            }).execute()
            
            if ws_resp.data:
                new_ws_id = ws_resp.data[0]['id']
                supabase.table("user_workspaces").insert({
                    "user_id": new_user_id,
                    "workspace_id": new_ws_id,
                    "role": "owner"
                }).execute()

        return {"message": "User created successfully", "user": res.user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(user: UserLogin):
    try:
        res = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        if not res.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "token_type": "bearer",
            "user": {
                "id": str(res.user.id),
                "email": res.user.email,
                "name": res.user.user_metadata.get("name", "") if res.user.user_metadata else ""
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "Invalid login credentials" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid email or password. Please check your credentials.")
        raise HTTPException(status_code=400, detail=f"Authentication failed: {error_msg}")

@router.get("/me")
def get_me(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify token and return current user info."""
    try:
        token = credentials.credentials
        user_resp = supabase.auth.get_user(token)
        if not user_resp.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        # Fetch tenant info
        tenant_resp = supabase.table("tenants").select("*").eq("id", str(user_resp.user.id)).execute()
        tenant_info = tenant_resp.data[0] if tenant_resp.data else None

        return {
            "id": str(user_resp.user.id),
            "email": user_resp.user.email,
            "metadata": user_resp.user.user_metadata,
            "tenant": tenant_info
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {e}")
