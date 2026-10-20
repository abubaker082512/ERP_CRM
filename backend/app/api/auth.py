from fastapi import APIRouter, HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.auth import UserSignup, UserLogin
from app.core.supabase_client import supabase, get_service_role_client
from app.api.deps import register_active_session, verify_single_active_session, ACTIVE_USER_SESSIONS
import uuid

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
                    "phone": user.phone or "",
                    "account_type": user.account_type,
                    "company_name": user.company_name if user.account_type == "company" else f"{user.name or 'My'} Workspace"
                }
            }
        })
        if not res.user:
            raise HTTPException(status_code=400, detail="Signup failed")

        new_user_id = str(res.user.id)

        # Use service role client for all DB writes — bypasses RLS
        svc = get_service_role_client()

        # Explicitly ensure the user exists in the tenants table with active trialing status
        try:
            svc.table("tenants").insert({
                "id": new_user_id,
                "email": user.email,
                "subscription_status": "trialing"
            }).execute()
        except Exception as e:
            print(f"[Signup] Tenant insertion warning: {e}")

        # If an invite_id is provided, join the existing workspace
        if user.invite_id:
            invite_resp = svc.table("invitations").select("*").eq("id", user.invite_id).eq("status", "pending").execute()
            if invite_resp.data:
                invite = invite_resp.data[0]
                # Link user to the workspace
                svc.table("user_workspaces").insert({
                    "user_id": new_user_id,
                    "workspace_id": invite["workspace_id"],
                    "role": invite.get("role", "user")
                }).execute()
                # Mark invite as accepted
                svc.table("invitations").update({"status": "accepted"}).eq("id", user.invite_id).execute()
            else:
                raise HTTPException(status_code=400, detail="Invite is invalid or has already been used.")
        else:
            # Create a new workspace for the user since it's a fresh signup
            ws_name = user.company_name if user.account_type == "company" else f"{user.name or 'My'} Workspace"
            try:
                ws_resp = svc.table("workspaces").insert({
                    "name": ws_name,
                    "owner_id": new_user_id
                }).execute()
                
                if ws_resp.data:
                    new_ws_id = ws_resp.data[0]['id']
                    svc.table("user_workspaces").insert({
                        "user_id": new_user_id,
                        "workspace_id": new_ws_id,
                        "role": "owner"
                    }).execute()
            except Exception as ws_err:
                print(f"[Signup] Workspace creation warning: {ws_err}")

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

        uid = str(res.user.id)
        session_id = str(uuid.uuid4())
        user_meta = dict(res.user.user_metadata or {})

        # Register single active session worldwide (invalidates any previous login anywhere in the world)
        register_active_session(uid, session_id, res.session.access_token)

        # Automatically ensure tenant record exists upon login & persist active_session_id in user_metadata
        try:
            svc = get_service_role_client()
            t_resp = svc.table("tenants").select("id").eq("id", uid).execute()
            if not t_resp.data:
                svc.table("tenants").insert({
                    "id": uid,
                    "email": res.user.email,
                    "subscription_status": "trialing"
                }).execute()
            try:
                updated_meta = {**user_meta, "active_session_id": session_id}
                svc.auth.admin.update_user_by_id(uid, {"user_metadata": updated_meta})
            except Exception:
                pass
        except Exception as t_err:
            print(f"[Login] Tenant sync warning: {t_err}")

        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "token_type": "bearer",
            "session_id": session_id,
            "user": {
                "id": uid,
                "email": res.user.email,
                "name": user_meta.get("name", ""),
                "phone": user_meta.get("phone", ""),
                "account_type": user_meta.get("account_type", "individual"),
                "company_name": user_meta.get("company_name", ""),
                "session_id": session_id
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
def get_me(request: Request, credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify token, enforce single active session worldwide, and return current user info."""
    token = credentials.credentials
    
    # 1. Verify user JWT token with Supabase Auth
    try:
        user_resp = supabase.auth.get_user(token)
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        user = user_resp.user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {e}")

    uid = str(user.id)
    user_meta = user.user_metadata if hasattr(user, "user_metadata") and user.user_metadata else {}

    # 2. Verify Single Concurrent Login Session Worldwide
    req_session_id = request.headers.get("X-Session-Id")
    verify_single_active_session(uid, req_session_id, token, user_meta)

    # 3. Fetch tenant info safely using Service Role Client (bypasses RLS)
    tenant_info = None
    try:
        svc = get_service_role_client()
        tenant_resp = svc.table("tenants").select("*").eq("id", uid).execute()
        if tenant_resp.data:
            tenant_info = tenant_resp.data[0]
        else:
            # Auto-provision tenant record if missing for a valid auth user
            try:
                new_tenant = {
                    "id": uid,
                    "email": user.email,
                    "subscription_status": "trialing"
                }
                svc.table("tenants").insert(new_tenant).execute()
                tenant_info = new_tenant
            except Exception as insert_err:
                print(f"[get_me] Auto tenant insertion warning: {insert_err}")
                tenant_info = {
                    "id": uid,
                    "email": user.email,
                    "subscription_status": "trialing"
                }
    except Exception as e:
        print(f"[get_me] Tenant fetch warning (graceful fallback): {e}")
        tenant_info = {
            "id": uid,
            "email": user.email,
            "subscription_status": "trialing"
        }

    active_sid = ACTIVE_USER_SESSIONS.get(uid, {}).get("session_id") or user_meta.get("active_session_id")

    return {
        "id": uid,
        "email": user.email,
        "metadata": user_meta,
        "tenant": tenant_info,
        "session_id": active_sid
    }
