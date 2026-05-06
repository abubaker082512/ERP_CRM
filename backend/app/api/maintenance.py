from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.maintenance import Equipment, MaintenanceRequest
from typing import List

router = APIRouter()

@router.get("/equipment", response_model=List[Equipment])
def read_equipment(client: Client = Depends(get_supabase_client)):
    resp = client.table("maintenance_equipment").select("*").execute()
    return resp.data or []

@router.get("/requests", response_model=List[MaintenanceRequest])
def read_requests(client: Client = Depends(get_supabase_client)):
    resp = client.table("maintenance_request").select("*").execute()
    return resp.data or []

@router.post("/requests", response_model=MaintenanceRequest)
def create_request(req: MaintenanceRequest, client: Client = Depends(get_supabase_client)):
    data = req.dict(exclude_unset=True)
    resp = client.table("maintenance_request").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create maintenance request")
    return resp.data[0]
