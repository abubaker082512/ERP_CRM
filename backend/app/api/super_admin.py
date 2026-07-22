from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.api.deps import get_supabase_client
from app.core.supabase_client import token_ctx_var
from app.core.supabase_client import service_client
from app.core.config import settings
from supabase import Client, create_client
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import httpx

router = APIRouter()

SUPER_ADMIN_EMAILS = ["admin@beraxis.online", "admin2@erp-crm.com"]


def verify_super_admin(client: Client):
    """Raises 403 if the authenticated user is not a super admin."""
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp.user or user_resp.user.email not in SUPER_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Only the Platform Super Admin can access this dashboard.")
    return user_resp.user


class WorkspaceSummary(BaseModel):
    id: str
    name: str
    owner_email: str
    member_count: int
    created_at: str


class UserSummary(BaseModel):
    id: str
    email: str
    created_at: str
    subscription_status: Optional[str] = "trialing"
    workspace_name: Optional[str] = None


class TenantSummary(BaseModel):
    id: str
    email: str
    subscription_status: str
    trial_ends_at: str
    created_at: str


class SuperAdminSalesOrder(BaseModel):
    id: str
    name: str
    customer_name: str
    amount_total: float
    state: str
    created_at: str


@router.get("/workspaces", response_model=List[WorkspaceSummary])
def list_all_workspaces(client: Client = Depends(get_supabase_client)):
    """SUPER ADMIN: List all workspaces across the entire SaaS platform."""
    verify_super_admin(client)

    # Use service_client to bypass RLS — see ALL workspaces
    ws_resp = service_client.table("workspaces").select("*, user_workspaces(user_id)").execute()
    workspaces = ws_resp.data or []

    # Get tenant/owner emails for all owners
    tenant_resp = service_client.table("tenants").select("id, email").execute()
    tenant_map = {t['id']: t['email'] for t in tenant_resp.data} if tenant_resp.data else {}

    results = []
    for ws in workspaces:
        results.append(WorkspaceSummary(
            id=ws['id'],
            name=ws['name'] or "Unnamed Workspace",
            owner_email=tenant_map.get(ws['owner_id'], "Unknown"),
            member_count=len(ws.get('user_workspaces', [])),
            created_at=ws['created_at']
        ))

    return results


@router.get("/stats")
def get_global_stats(client: Client = Depends(get_supabase_client)):
    """Global SaaS metrics for the Super Admin."""
    verify_super_admin(client)

    ws_count = service_client.table("workspaces").select("id", count="exact").execute().count or 0
    user_count = service_client.table("tenants").select("id", count="exact").execute().count or 0

    # Total revenue from ERP sales orders
    sales_resp = service_client.table("sale_order").select("amount_total").execute()
    total_revenue = sum(float(s['amount_total'] or 0) for s in sales_resp.data) if sales_resp.data else 0

    # Count of trialing users
    trials_resp = service_client.table("tenants").select("id").eq("subscription_status", "trialing").execute()
    trials_count = len(trials_resp.data) if trials_resp.data else 0

    # Count of paid (active) subscribers
    active_tenants_resp = service_client.table("tenants").select("stripe_customer_id").eq("subscription_status", "active").execute()
    active_tenants = active_tenants_resp.data or []
    
    crypto_revenue = 0.0
    cc_revenue = 0.0
    for t in active_tenants:
        metadata_str = t.get("stripe_customer_id")
        if metadata_str:
            try:
                import json
                meta = json.loads(metadata_str)
                gateway = meta.get("gateway", "")
                amount = float(meta.get("amount", 0.0))
                if gateway == "plisio":
                    crypto_revenue += amount
                elif gateway == "freemius":
                    cc_revenue += amount
            except Exception:
                # Fallback to default plisio price if parsing fails
                crypto_revenue += 199.0
        else:
            # Fallback to default plisio price if no metadata
            crypto_revenue += 199.0
            
    total_saas_revenue = crypto_revenue + cc_revenue
    paid_count = len(active_tenants)

    return {
        "total_workspaces": ws_count,
        "total_users": user_count,
        "platform_revenue": total_revenue,
        "active_trials": trials_count,
        "paid_subscribers": paid_count,
        "crypto_revenue": crypto_revenue,
        "cc_revenue": cc_revenue,
        "total_saas_revenue": total_saas_revenue
    }


@router.get("/payments")
def list_all_payments(client: Client = Depends(get_supabase_client)):
    """SUPER ADMIN: List all Plisio crypto payment records (from tenants table)."""
    verify_super_admin(client)

    # Fetch all tenants with subscription data
    tenants_resp = service_client.table("tenants").select(
        "id, email, subscription_status, trial_ends_at, created_at, stripe_customer_id"
    ).order("created_at", desc=True).execute()
    tenants = tenants_resp.data or []

    results = []
    for t in tenants:
        status = t.get("subscription_status", "trialing")
        
        # Parse metadata from stripe_customer_id if available
        gateway = "Crypto (Plisio)"
        plan = "Pro Enterprise" if status == "active" else "Trial / Unpaid"
        amount = 199.00 if status == "active" else 0.00
        
        metadata_str = t.get("stripe_customer_id")
        if metadata_str:
            try:
                import json
                meta = json.loads(metadata_str)
                gateway_val = meta.get("gateway", "")
                if gateway_val == "plisio":
                    gateway = "Crypto (Plisio)"
                elif gateway_val == "freemius":
                    gateway = "Card/PayPal (Freemius)"
                elif gateway_val == "promo_code":
                    gateway = f"Promo Code ({meta.get('code', 'BERAXIS')})"
                
                plan = meta.get("plan", plan)
                amount = float(meta.get("amount", amount))
            except Exception:
                pass

        results.append({
            "tenant_id": t.get("id"),
            "email": t.get("email") or "Unknown",
            "payment_status": status,
            "plan": plan,
            "amount_usd": amount,
            "currency": gateway,
            "activated_at": t.get("trial_ends_at") or t.get("created_at") or "",
            "registered_at": t.get("created_at") or "",
        })

    return results


@router.get("/users", response_model=List[UserSummary])
def list_all_users(client: Client = Depends(get_supabase_client)):
    """SUPER ADMIN: List ALL users across the entire SaaS platform (bypasses RLS)."""
    verify_super_admin(client)

    # Fetch all tenants using service_client (bypasses RLS)
    tenants_resp = service_client.table("tenants").select("id, email, created_at, subscription_status").order("created_at", desc=True).execute()
    tenants = tenants_resp.data or []

    # Also fetch workspace names for each user
    ws_resp = service_client.table("workspaces").select("owner_id, name").execute()
    ws_by_owner = {ws['owner_id']: ws['name'] for ws in ws_resp.data} if ws_resp.data else {}

    # Also try to get users via Supabase Auth Admin API using service_role key
    # This lets us see users who signed up but may not have a tenant row yet
    auth_users_map = {}
    try:
        service_key = settings.SUPABASE_SERVICE_ROLE_KEY
        if service_key:
            # Use a direct service-role Supabase client for admin auth
            admin_client = create_client(settings.SUPABASE_URL, service_key)
            auth_resp = admin_client.auth.admin.list_users()
            if auth_resp:
                for u in auth_resp:
                    auth_users_map[str(u.id)] = {
                        "email": u.email,
                        "created_at": u.created_at.isoformat() if u.created_at else ""
                    }
    except Exception as e:
        print(f"[SuperAdmin] Could not fetch auth users: {e}")

    # Merge: start with tenants table, supplement with auth users
    seen_ids = set()
    results = []

    for t in tenants:
        uid = t.get('id', '')
        seen_ids.add(uid)
        results.append(UserSummary(
            id=uid,
            email=t.get('email') or auth_users_map.get(uid, {}).get('email', 'Unknown'),
            created_at=t.get('created_at') or '',
            subscription_status=t.get('subscription_status') or 'trialing',
            workspace_name=ws_by_owner.get(uid)
        ))

    # Add any auth users not yet in tenants table
    for uid, udata in auth_users_map.items():
        if uid not in seen_ids:
            results.append(UserSummary(
                id=uid,
                email=udata.get('email', 'Unknown'),
                created_at=udata.get('created_at', ''),
                subscription_status='new',
                workspace_name=ws_by_owner.get(uid)
            ))

    return results


@router.get("/sales", response_model=List[SuperAdminSalesOrder])
def list_all_sales(client: Client = Depends(get_supabase_client)):
    """SUPER ADMIN: List all sales orders across the entire platform."""
    verify_super_admin(client)

    resp = service_client.table("sale_order").select("*").order("created_at", desc=True).execute()
    data = resp.data or []

    results = []
    for r in data:
        results.append(SuperAdminSalesOrder(
            id=r.get("id"),
            name=r.get("name") or "Draft",
            customer_name=r.get("customer_name") or "Unknown",
            amount_total=float(r.get("amount_total") or 0.0),
            state=r.get("state") or "draft",
            created_at=r.get("created_at") or r.get("date_order") or ""
        ))
    return results


@router.get("/tenants", response_model=List[TenantSummary])
def list_all_tenants(client: Client = Depends(get_supabase_client)):
    """SUPER ADMIN: List all tenant accounts, subscription statuses, and trials."""
    verify_super_admin(client)

    resp = service_client.table("tenants").select("*").order("created_at", desc=True).execute()
    data = resp.data or []

    results = []
    for r in data:
        results.append(TenantSummary(
            id=r.get("id"),
            email=r.get("email") or "Unknown",
            subscription_status=r.get("subscription_status") or "trialing",
            trial_ends_at=r.get("trial_ends_at") or "",
            created_at=r.get("created_at") or ""
        ))
    return results


@router.post("/tenants/{tenant_id}/activate")
def activate_tenant(tenant_id: str, client: Client = Depends(get_supabase_client)):
    """SUPER ADMIN: Manually set a tenant's subscription status to active."""
    verify_super_admin(client)
    resp = service_client.table("tenants").update({"subscription_status": "active"}).eq("id", tenant_id).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not activate tenant.")
    return {"status": "success", "message": "Tenant subscription set to active."}


@router.post("/tenants/{tenant_id}/deactivate")
def deactivate_tenant(tenant_id: str, client: Client = Depends(get_supabase_client)):
    """SUPER ADMIN: Manually set a tenant's subscription status to past_due (blocking mutations)."""
    verify_super_admin(client)
    resp = service_client.table("tenants").update({"subscription_status": "past_due"}).eq("id", tenant_id).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not deactivate tenant.")
    return {"status": "success", "message": "Tenant subscription set to past_due."}


@router.post("/tenants/{tenant_id}/extend-trial")
def extend_tenant_trial(tenant_id: str, client: Client = Depends(get_supabase_client)):
    """SUPER ADMIN: Manually extend a tenant's trial by 14 days from now."""
    verify_super_admin(client)
    new_trial_end = (datetime.now(timezone.utc) + timedelta(days=14)).isoformat()
    resp = service_client.table("tenants").update({
        "subscription_status": "trialing",
        "trial_ends_at": new_trial_end
    }).eq("id", tenant_id).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not extend trial.")
    return {"status": "success", "message": "Extended trial by 14 days.", "trial_ends_at": new_trial_end}


@router.delete("/users/{user_id}")
def delete_user(user_id: str, client: Client = Depends(get_supabase_client)):
    """SUPER ADMIN: Delete a user account from the platform."""
    verify_super_admin(client)
    try:
        service_key = settings.SUPABASE_SERVICE_ROLE_KEY
        if service_key:
            admin_client = create_client(settings.SUPABASE_URL, service_key)
            admin_client.auth.admin.delete_user(user_id)
        # Also clean up tenants table
        service_client.table("tenants").delete().eq("id", user_id).execute()
        return {"status": "success", "message": "User deleted."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not delete user: {e}")
