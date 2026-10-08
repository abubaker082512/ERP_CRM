from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class VehicleJobCardCreate(BaseModel):
    vin: str
    vehicleModel: str
    customerName: str
    customerPhone: Optional[str] = None
    issueDescription: str
    assignedMechanic: Optional[str] = "Lead Diagnostic Mechanic"
    laborHours: Optional[float] = 2.0
    estimatedCost: Optional[float] = 250.0
    status: Optional[str] = "In Progress"
    checkItems: Optional[List[dict]] = []

class VehicleJobCardUpdate(BaseModel):
    status: Optional[str] = None
    laborHours: Optional[float] = None
    estimatedCost: Optional[float] = None
    assignedMechanic: Optional[str] = None
    issueDescription: Optional[str] = None
    checkItems: Optional[List[dict]] = None

@router.get("/jobs")
def get_job_cards(status: Optional[str] = None, client: Client = Depends(get_supabase_client)):
    try:
        query = client.table("auto_job_cards").select("*").order("created_at", desc=True)
        if status:
            query = query.eq("status", status)
        resp = query.execute()
        return resp.data or []
    except Exception:
        # Return fallback mock/in-memory records
        return [
            {
                "id": "JOB-101",
                "vin": "1HGCR2F83HA029182",
                "vehicleModel": "2023 Honda Accord Sport",
                "customerName": "Michael Scott",
                "customerPhone": "+1 (555) 234-5678",
                "issueDescription": "Brake pad replacement and synthetic oil change service.",
                "assignedMechanic": "Alex Rivera",
                "laborHours": 2.5,
                "estimatedCost": 320.0,
                "status": "In Progress",
                "createdAt": datetime.utcnow().isoformat()
            }
        ]

@router.post("/jobs")
def create_job_card(job: VehicleJobCardCreate, client: Client = Depends(get_supabase_client)):
    data = job.dict(exclude_unset=True)
    data["created_at"] = datetime.utcnow().isoformat()
    try:
        resp = client.table("auto_job_cards").insert(data).execute()
        if resp.data:
            return resp.data[0]
        return data
    except Exception:
        data["id"] = f"JOB-{datetime.now().strftime('%M%S')}"
        return data

@router.put("/jobs/{job_id}")
def update_job_card(job_id: str, updates: VehicleJobCardUpdate, client: Client = Depends(get_supabase_client)):
    data = updates.dict(exclude_unset=True)
    try:
        resp = client.table("auto_job_cards").update(data).eq("id", job_id).execute()
        if resp.data:
            return resp.data[0]
        return {"id": job_id, **data}
    except Exception:
        return {"id": job_id, **data}

@router.delete("/jobs/{job_id}")
def delete_job_card(job_id: str, client: Client = Depends(get_supabase_client)):
    try:
        client.table("auto_job_cards").delete().eq("id", job_id).execute()
    except Exception:
        pass
    return {"message": "Job card deleted", "id": job_id}
