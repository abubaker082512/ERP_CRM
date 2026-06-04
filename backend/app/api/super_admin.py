from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.deps import get_supabase_client
from app.core.supabase_client import token_ctx_var
from app.core.supabase_client import supabase as service_client
from supabase import Client
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone

router = APIRouter()

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
    """
    SUPER ADMIN: List all workspaces across the entire SaaS platform.
    """
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp.user or user_resp.user.email not in ["admin@erp-crm.com", "admin2@erp-crm.com"]:
        raise HTTPException(status_code=403, detail="Only the Platform Super Admin can access this dashboard.")

    # Fetch workspaces using service client to bypass RLS and see all workspaces
    ws_resp = service_client.table("workspaces").select("*, user_workspaces(user_id)").execute()
    workspaces = ws_resp.data or []
    
    # Fetch tenant/owner info for emails
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
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp.user or user_resp.user.email not in ["admin@erp-crm.com", "admin2@erp-crm.com"]:
        raise HTTPException(status_code=403, detail="Only the Platform Super Admin can access this dashboard.")
        
    ws_count = service_client.table("workspaces").select("id", count="exact").execute().count
    user_count = service_client.table("tenants").select("id", count="exact").execute().count
    
    # Example revenue sum (using service client to bypass RLS)
    sales_resp = service_client.table("sale_order").select("amount_total").execute()
    total_revenue = sum(float(s['amount_total'] or 0) for s in sales_resp.data) if sales_resp.data else 0
    
    # Count of users with status trialing
    trials_resp = service_client.table("tenants").select("id").eq("subscription_status", "trialing").execute()
    trials_count = len(trials_resp.data) if trials_resp.data else 0
    
    return {
        "total_workspaces": ws_count,
        "total_users": user_count,
        "platform_revenue": total_revenue,
        "active_trials": trials_count
    }

@router.get("/users", response_model=List[UserSummary])
def list_all_users(client: Client = Depends(get_supabase_client)):
    """
    SUPER ADMIN: List all users across the entire SaaS platform.
    """
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp.user or user_resp.user.email not in ["admin@erp-crm.com", "admin2@erp-crm.com"]:
        raise HTTPException(status_code=403, detail="Only the Platform Super Admin can access this dashboard.")

    users_resp = service_client.table("tenants").select("id, email, created_at").execute()
    users = users_resp.data or []
    
    results = []
    for u in users:
        results.append(UserSummary(
            id=u['id'],
            email=u['email'],
            created_at=u.get('created_at', '')
        ))
    
    return results

@router.get("/sales", response_model=List[SuperAdminSalesOrder])
def list_all_sales(client: Client = Depends(get_supabase_client)):
    """SUPER ADMIN: List all sales orders across the entire platform."""
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp.user or user_resp.user.email not in ["admin@erp-crm.com", "admin2@erp-crm.com"]:
        raise HTTPException(status_code=403, detail="Only the Platform Super Admin can access this dashboard.")
        
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
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp.user or user_resp.user.email not in ["admin@erp-crm.com", "admin2@erp-crm.com"]:
        raise HTTPException(status_code=403, detail="Only the Platform Super Admin can access this dashboard.")
        
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
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp.user or user_resp.user.email not in ["admin@erp-crm.com", "admin2@erp-crm.com"]:
        raise HTTPException(status_code=403, detail="Only the Platform Super Admin can access this dashboard.")
        
    resp = service_client.table("tenants").update({"subscription_status": "active"}).eq("id", tenant_id).execute()
    if not resp.data:
         raise HTTPException(status_code=400, detail="Could not activate tenant.")
    return {"status": "success", "message": "Tenant subscription set to active."}

@router.post("/tenants/{tenant_id}/deactivate")
def deactivate_tenant(tenant_id: str, client: Client = Depends(get_supabase_client)):
    """SUPER ADMIN: Manually set a tenant's subscription status to past_due (blocking mutations)."""
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp.user or user_resp.user.email not in ["admin@erp-crm.com", "admin2@erp-crm.com"]:
        raise HTTPException(status_code=403, detail="Only the Platform Super Admin can access this dashboard.")
        
    resp = service_client.table("tenants").update({"subscription_status": "past_due"}).eq("id", tenant_id).execute()
    if not resp.data:
         raise HTTPException(status_code=400, detail="Could not deactivate tenant.")
    return {"status": "success", "message": "Tenant subscription set to past_due."}

@router.post("/tenants/{tenant_id}/extend-trial")
def extend_tenant_trial(tenant_id: str, client: Client = Depends(get_supabase_client)):
    """SUPER ADMIN: Manually extend a tenant's trial by 14 days from now."""
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp.user or user_resp.user.email not in ["admin@erp-crm.com", "admin2@erp-crm.com"]:
        raise HTTPException(status_code=403, detail="Only the Platform Super Admin can access this dashboard.")
        
    new_trial_end = (datetime.now(timezone.utc) + timedelta(days=14)).isoformat()
    resp = service_client.table("tenants").update({
        "subscription_status": "trialing",
        "trial_ends_at": new_trial_end
    }).eq("id", tenant_id).execute()
    if not resp.data:
         raise HTTPException(status_code=400, detail="Could not extend trial.")
    return {"status": "success", "message": "Extended trial by 14 days.", "trial_ends_at": new_trial_end}
