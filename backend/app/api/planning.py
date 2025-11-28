from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.planning import PlanningSlot, PlanningSlotCreate
from app.core.supabase_client import supabase

router = APIRouter()

@router.post("/slots", response_model=PlanningSlot)
def create_slot(slot: PlanningSlotCreate):
    data = slot.dict(exclude_unset=True)
    data['start_datetime'] = str(data['start_datetime'])
    data['end_datetime'] = str(data['end_datetime'])
    
    resp = supabase.table("planning_slot").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create planning slot")
    return resp.data[0]

@router.get("/slots", response_model=List[PlanningSlot])
def read_slots():
    resp = supabase.table("planning_slot").select("*").execute()
    return resp.data
