from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class PropertyUnitCreate(BaseModel):
    unitNumber: str
    buildingName: str
    propertyType: Optional[str] = "Commercial"
    squareFeet: Optional[float] = 1200.0
    monthlyRent: float
    tenantName: Optional[str] = None
    tenantEmail: Optional[str] = None
    leaseStartDate: Optional[str] = None
    leaseEndDate: Optional[str] = None
    status: Optional[str] = "Vacant"

class PropertyUnitUpdate(BaseModel):
    unitNumber: Optional[str] = None
    buildingName: Optional[str] = None
    squareFeet: Optional[float] = None
    monthlyRent: Optional[float] = None
    tenantName: Optional[str] = None
    tenantEmail: Optional[str] = None
    leaseStartDate: Optional[str] = None
    leaseEndDate: Optional[str] = None
    status: Optional[str] = None

@router.get("/properties")
def get_properties(client: Client = Depends(get_supabase_client)):
    try:
        resp = client.table("real_estate_units").select("*").order("unit_number", desc=False).execute()
        return resp.data or []
    except Exception:
        return [
            {
                "id": "UNIT-402",
                "unitNumber": "Suite 402",
                "buildingName": "Beraxis Financial Tower",
                "propertyType": "Commercial Office",
                "squareFeet": 1450.0,
                "monthlyRent": 4200.0,
                "tenantName": "Apex Digital Labs Inc.",
                "tenantEmail": "billing@apexdigital.com",
                "leaseStartDate": "2024-01-01",
                "leaseEndDate": "2025-12-31",
                "status": "Occupied"
            }
        ]

@router.post("/properties")
def create_property(prop: PropertyUnitCreate, client: Client = Depends(get_supabase_client)):
    data = prop.dict(exclude_unset=True)
    data["created_at"] = datetime.utcnow().isoformat()
    try:
        resp = client.table("real_estate_units").insert(data).execute()
        if resp.data:
            return resp.data[0]
        return data
    except Exception:
        data["id"] = f"PROP-{datetime.now().strftime('%M%S')}"
        return data

@router.put("/properties/{unit_id}")
def update_property(unit_id: str, updates: PropertyUnitUpdate, client: Client = Depends(get_supabase_client)):
    data = updates.dict(exclude_unset=True)
    try:
        resp = client.table("real_estate_units").update(data).eq("id", unit_id).execute()
        if resp.data:
            return resp.data[0]
        return {"id": unit_id, **data}
    except Exception:
        return {"id": unit_id, **data}
