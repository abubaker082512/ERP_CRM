from fastapi import APIRouter, HTTPException
from app.schemas.opportunity import Opportunity, OpportunityCreate, OpportunityUpdate
from app.core.supabase_client import supabase
from typing import List
import json

router = APIRouter()

@router.post("/", response_model=Opportunity)
def create_opportunity(opportunity: OpportunityCreate):
    # Prepare data for insertion
    opp_data = opportunity.dict(exclude_unset=True)
    
    # Handle date serialization
    if opp_data.get('close_date'):
        opp_data['close_date'] = opp_data['close_date'].isoformat()

    response = supabase.table("opportunities").insert(opp_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create opportunity")
    return response.data[0]

@router.get("/", response_model=List[Opportunity])
def read_opportunities(skip: int = 0, limit: int = 100):
    response = supabase.table("opportunities").select("*").range(skip, skip + limit - 1).execute()
    return response.data

@router.put("/{opp_id}", response_model=Opportunity)
def update_opportunity(opp_id: str, opportunity: OpportunityUpdate):
    opp_data = opportunity.dict(exclude_unset=True)
    
    if opp_data.get('close_date'):
        opp_data['close_date'] = opp_data['close_date'].isoformat()
        
    response = supabase.table("opportunities").update(opp_data).eq("id", opp_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return response.data[0]

@router.delete("/{opp_id}")
def delete_opportunity(opp_id: str):
    response = supabase.table("opportunities").delete().eq("id", opp_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return {"message": "Opportunity deleted successfully"}
