from fastapi import APIRouter, HTTPException
from app.schemas.lead import Lead, LeadCreate, LeadUpdate
from app.core.supabase_client import supabase
from typing import List

router = APIRouter()

from app.services.lead_scoring import lead_scoring_service

@router.post("/", response_model=Lead)
def create_lead(lead: LeadCreate):
    # Calculate AI Score
    probability = lead_scoring_service.calculate_score(lead)
    
    # Prepare data for insertion
    lead_data = lead.dict(exclude_unset=True)
    lead_data["probability"] = probability
    
    response = supabase.table("leads").insert(lead_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create lead")
    return response.data[0]

@router.get("/", response_model=List[Lead])
def read_leads(skip: int = 0, limit: int = 100):
    response = supabase.table("leads").select("*").range(skip, skip + limit - 1).execute()
    return response.data

@router.get("/{lead_id}", response_model=Lead)
def read_lead(lead_id: str):
    response = supabase.table("leads").select("*").eq("id", lead_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    return response.data[0]
