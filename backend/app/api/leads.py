from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.lead import Lead, LeadCreate, LeadUpdate

from typing import List

router = APIRouter()

from app.services.lead_scoring import lead_scoring_service

@router.post("", response_model=Lead)
def create_lead(lead: LeadCreate, client: Client = Depends(get_supabase_client)):
    # Calculate AI Score
    probability = lead_scoring_service.calculate_score(lead)

    # Map frontend fields to DB columns (crm_lead table schema)
    lead_data = {
        "name": lead.name,
        "email_from": lead.email,
        "phone": lead.phone,
        "stage_id": lead.status or "new",
        "type": "lead",
        "probability": probability,
    }
    # Remove None values
    lead_data = {k: v for k, v in lead_data.items() if v is not None}

    response = client.table("crm_lead").insert(lead_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create lead")
    # Map DB response back to schema
    row = response.data[0]
    return _map_crm_lead(row)

@router.get("", response_model=List[Lead])
def read_leads(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    response = client.table("crm_lead").select("*").eq("type", "lead").range(skip, skip + limit - 1).execute()
    return [_map_crm_lead(r) for r in response.data]

@router.get("/{lead_id}", response_model=Lead)
def read_lead(lead_id: str, client: Client = Depends(get_supabase_client)):
    response = client.table("crm_lead").select("*").eq("id", lead_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    return _map_crm_lead(response.data[0])

@router.put("/{lead_id}", response_model=Lead)
def update_lead(lead_id: str, lead: LeadUpdate, client: Client = Depends(get_supabase_client)):
    update_data = {
        "name": lead.name,
        "email_from": lead.email,
        "phone": lead.phone,
        "stage_id": lead.status,
        "probability": lead.probability,
    }
    update_data = {k: v for k, v in update_data.items() if v is not None}
    response = client.table("crm_lead").update(update_data).eq("id", lead_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    return _map_crm_lead(response.data[0])

@router.delete("/{lead_id}")
def delete_lead(lead_id: str, client: Client = Depends(get_supabase_client)):
    client.table("crm_lead").delete().eq("id", lead_id).execute()
    return {"message": "Lead deleted"}

def _map_crm_lead(row: dict) -> dict:
    """Map crm_lead DB columns to Lead schema fields."""
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "email": row.get("email_from"),
        "phone": row.get("phone"),
        "status": row.get("stage_id", "new"),
        "probability": row.get("probability", 0.0),
        "sentiment_score": row.get("sentiment_score", 0.0),
        "company_name": row.get("company_name"),
        "source": row.get("source"),
        "notes": row.get("notes"),
        "created_at": row.get("created_at"),
    }

