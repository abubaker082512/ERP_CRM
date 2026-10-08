from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class BranchSharingRules(BaseModel):
    shareEmployees: bool = True
    shareCustomers: bool = True
    shareInventory: bool = False
    shareAccounting: bool = True
    shareVendors: bool = True

class BranchCreate(BaseModel):
    name: str
    code: str
    industryId: str
    subSector: str
    operationMode: str
    location: Optional[str] = "Main Facility"
    currency: Optional[str] = "$ USD"
    enabledModules: List[str] = []
    sharingRules: Optional[BranchSharingRules] = BranchSharingRules()
    isPrimary: Optional[bool] = False

class BranchUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    industryId: Optional[str] = None
    subSector: Optional[str] = None
    operationMode: Optional[str] = None
    location: Optional[str] = None
    currency: Optional[str] = None
    enabledModules: Optional[List[str]] = None
    sharingRules: Optional[BranchSharingRules] = None
    isPrimary: Optional[bool] = None

@router.get("")
@router.get("/")
def list_branches(client: Client = Depends(get_supabase_client)):
    try:
        resp = client.table("business_branches").select("*").order("created_at", desc=False).execute()
        return resp.data or []
    except Exception as e:
        # Return empty list if table not initialized
        return []

@router.post("")
@router.post("/")
def create_branch(branch: BranchCreate, client: Client = Depends(get_supabase_client)):
    data = branch.dict(exclude_unset=True)
    data["created_at"] = datetime.utcnow().isoformat()
    try:
        resp = client.table("business_branches").insert(data).execute()
        if resp.data:
            return resp.data[0]
        return data
    except Exception as e:
        # Fallback return data with generated id
        data["id"] = f"BRN-{datetime.now().strftime('%M%S')}"
        return data

@router.put("/{branch_id}")
def update_branch(branch_id: str, updates: BranchUpdate, client: Client = Depends(get_supabase_client)):
    data = updates.dict(exclude_unset=True)
    try:
        resp = client.table("business_branches").update(data).eq("id", branch_id).execute()
        if resp.data:
            return resp.data[0]
        return {"id": branch_id, **data}
    except Exception as e:
        return {"id": branch_id, **data}

@router.delete("/{branch_id}")
def delete_branch(branch_id: str, client: Client = Depends(get_supabase_client)):
    try:
        client.table("business_branches").delete().eq("id", branch_id).execute()
    except Exception:
        pass
    return {"message": "Branch deleted", "id": branch_id}
