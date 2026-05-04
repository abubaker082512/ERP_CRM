from fastapi import Depends, HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from app.core.config import settings
from datetime import datetime, timezone

security = HTTPBearer()

def get_supabase_client(request: Request, credentials: HTTPAuthorizationCredentials = Security(security)) -> Client:
    """
    Creates a fresh Supabase client for each request, authenticated with the user's JWT.
    This guarantees thread-safe Row Level Security (RLS) enforcement per user/tenant.
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
    
    uid = user_resp.user.id
    
    # Enforce Subscription / Trial status ONLY for mutating endpoints (POST, PUT, DELETE)
    # except for billing which always needs to pass through to let them pay.
    is_mutation = request.method in ["POST", "PUT", "DELETE"]
    is_billing = request.url.path.startswith("/api/v1/billing")

    if is_mutation and not is_billing:
        try:
            # Use service-level client (anon key) to query tenants table for this uid
            tenant_res = client.table("tenants").select("subscription_status, trial_ends_at").eq("id", str(uid)).execute()
            
            if tenant_res.data:
                tenant = tenant_res.data[0]
                status = tenant.get("subscription_status")
                trial_ends_str = tenant.get("trial_ends_at")
                
                if status == 'trialing' and trial_ends_str:
                    trial_ends = datetime.fromisoformat(trial_ends_str.replace('Z', '+00:00'))
                    if datetime.now(timezone.utc) > trial_ends:
                        raise HTTPException(
                            status_code=402, 
                            detail="Payment Required: Your 7-day free trial has expired. Please subscribe to continue."
                        )
                elif status in ['past_due', 'canceled']:
                    raise HTTPException(
                        status_code=402, 
                        detail="Payment Required: Subscription is inactive. Please update your billing."
                    )
            # If no tenant record found, allow access (first login before trigger fires, etc.)
        except HTTPException:
            raise
        except Exception as e:
            # Don't block users if tenant lookup fails (e.g. table not ready) — log and continue
            print(f"[WARN] Tenant subscription check failed for uid={uid}: {e}")
    
    return client
