from fastapi import Depends, HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from app.core.config import settings
from app.core.supabase_client import get_service_role_client
from datetime import datetime, timezone
from typing import Dict, Any

security = HTTPBearer()

# Global Single-Session Registry: uid -> {"session_id": str, "token": str, "logged_in_at": str}
# Enforces that only 1 login session can be active per account worldwide at any given time.
ACTIVE_USER_SESSIONS: Dict[str, Dict[str, Any]] = {}

def register_active_session(uid: str, session_id: str, token: str):
    ACTIVE_USER_SESSIONS[uid] = {
        "session_id": session_id,
        "token": token,
        "logged_in_at": datetime.now(timezone.utc).isoformat()
    }

def verify_single_active_session(uid: str, request_session_id: str | None, token: str, user_metadata: dict | None = None):
    active_entry = ACTIVE_USER_SESSIONS.get(uid)
    meta_session_id = (user_metadata or {}).get("active_session_id")

    if active_entry:
        expected_sid = active_entry.get("session_id")
        expected_token = active_entry.get("token")
        if request_session_id and expected_sid and request_session_id != expected_sid:
            raise HTTPException(
                status_code=401,
                detail="SESSION_SUPERSEDED: This account is active in another session. Only one login is allowed at a time worldwide."
            )
        if not request_session_id and expected_token and token != expected_token:
            raise HTTPException(
                status_code=401,
                detail="SESSION_SUPERSEDED: This account was logged in from another location. Only one active session is allowed."
            )
    elif meta_session_id and request_session_id and request_session_id != meta_session_id:
        raise HTTPException(
            status_code=401,
            detail="SESSION_SUPERSEDED: This account is active in another session. Only one login is allowed at a time worldwide."
        )

SUPER_ADMIN_EMAILS = [
    "admin@beraxis.online",
    "admin2@erp-crm.com",
    "abubaker@galaxy.com",
    "admin@galaxy.com"
]

def get_supabase_client(request: Request, credentials: HTTPAuthorizationCredentials = Security(security)) -> Client:
    """
    Creates a fresh Supabase client for each request, authenticated with the user's JWT.
    This guarantees thread-safe Row Level Security (RLS) enforcement per user/tenant,
    and enforces Single Active Login Session worldwide.
    """
    token = credentials.credentials
    
    # Initialize a fresh client instance to avoid cross-request state leakage
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    
    # Authenticate this specific client instance with the user's JWT
    # This makes all subsequent queries using `client` respect RLS based on auth.uid()
    client.postgrest.auth(token)
    
    # Verify token is valid by getting user info
    try:
        user_resp = client.auth.get_user(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {e}")
    
    if not hasattr(user_resp, 'user') or not user_resp.user:
        raise HTTPException(status_code=401, detail="Invalid token: could not identify user")
    
    uid = str(user_resp.user.id)
    user_email = user_resp.user.email or ""
    user_meta = user_resp.user.user_metadata if hasattr(user_resp.user, "user_metadata") else {}

    # Enforce Worldwide Single Concurrent Login Session per Account
    req_session_id = request.headers.get("X-Session-Id")
    verify_single_active_session(uid, req_session_id, token, user_meta)
    # Attach authenticated user ID and email onto client for strict tenant filtering
    setattr(client, "_beraxis_uid", uid)
    setattr(client, "_beraxis_email", user_email)
    
    # Identify Super Admin (admin@beraxis.online, @erp-crm.com, @galaxy.com, etc.)
    is_super_admin = False
    if user_email in SUPER_ADMIN_EMAILS or user_email.endswith('@galaxy.com') or user_email.endswith('@erp-crm.com'):
        is_super_admin = True
    
    # Enforce Subscription / Trial status ONLY for mutating endpoints (POST, PUT, DELETE)
    # except for billing which always needs to pass through to let them pay.
    is_mutation = request.method in ["POST", "PUT", "DELETE"]
    is_billing = request.url.path.startswith("/api/v1/billing")

    if is_mutation and not is_billing and not is_super_admin:
        try:
            # Use service-level client (bypasses RLS) to query tenants table safely
            svc = get_service_role_client()
            tenant_res = svc.table("tenants").select("subscription_status, trial_ends_at").eq("id", uid).execute()
            
            if tenant_res.data:
                tenant = tenant_res.data[0]
                status = tenant.get("subscription_status", "trialing")
                trial_ends_str = tenant.get("trial_ends_at")
                
                # Active paid accounts (or One App Free) are always allowed
                if status == 'active':
                    pass
                elif status == 'trialing' and trial_ends_str:
                    try:
                        trial_ends = datetime.fromisoformat(trial_ends_str.replace('Z', '+00:00'))
                        if datetime.now(timezone.utc) > trial_ends:
                            raise HTTPException(
                                status_code=402, 
                                detail="Payment Required: Your free trial has expired. Please subscribe to continue."
                            )
                    except ValueError:
                        pass
                elif status in ['past_due', 'canceled']:
                    raise HTTPException(
                        status_code=402, 
                        detail="Payment Required: Subscription is inactive. Please update your billing."
                    )
        except HTTPException:
            raise
        except Exception as e:
            # Don't block users if tenant lookup fails — log and continue
            print(f"[WARN] Tenant subscription check failed for uid={uid}: {e}")
    
    return client

def adjust_stock(client: Client, product_id: str, location_id: str, qty_change: float):
    """Adjusts the inventory quant table for a specific product and location by qty_change."""
    try:
        res = client.table("inventory_quant").select("*").eq("product_id", product_id).eq("location_id", location_id).execute()
        if res.data:
            quant_id = res.data[0]["id"]
            new_qty = float(res.data[0]["quantity"] or 0.0) + qty_change
            client.table("inventory_quant").update({"quantity": new_qty}).eq("id", quant_id).execute()
        else:
            client.table("inventory_quant").insert({
                "product_id": product_id,
                "location_id": location_id,
                "quantity": qty_change,
                "reserved_quantity": 0.0
            }).execute()
    except Exception as e:
        print(f"[adjust_stock err]: {e}")
