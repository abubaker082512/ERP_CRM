from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.deps import get_supabase_client
from app.core.supabase_client import token_ctx_var
from supabase import Client
from pydantic import BaseModel

router = APIRouter()

class WorkspaceSummary(BaseModel):
    id: str
    name: str
    owner_email: str
    member_count: int
    created_at: str

@router.get("/workspaces", response_model=List[WorkspaceSummary])
def list_all_workspaces(client: Client = Depends(get_supabase_client)):
    """
    SUPER ADMIN: List all workspaces across the entire SaaS platform.
    """
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp.user or user_resp.user.email != "admin@erp-crm.com":
        raise HTTPException(status_code=403, detail="Only the Platform Super Admin can access this dashboard.")

    # Fetch workspaces
    ws_resp = client.table("workspaces").select("*, user_workspaces(user_id)").execute()
    workspaces = ws_resp.data or []
    
    # Fetch tenant/owner info for emails
    tenant_resp = client.table("tenants").select("id, email").execute()
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
    if not user_resp.user or user_resp.user.email != "admin@erp-crm.com":
        raise HTTPException(status_code=403, detail="Only the Platform Super Admin can access this dashboard.")
        
    ws_count = client.table("workspaces").select("id", count="exact").execute().count
    user_count = client.table("tenants").select("id", count="exact").execute().count
    
    # Example revenue sum (placeholder)
    sales_resp = client.table("sale_order").select("amount_total").execute()
    total_revenue = sum(float(s['amount_total'] or 0) for s in sales_resp.data) if sales_resp.data else 0
    
    return {
        "total_workspaces": ws_count,
        "total_users": user_count,
        "platform_revenue": total_revenue,
        "active_trials": user_count # Simplified
    }
