from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


router = APIRouter()


class PlanningSlotCreate(BaseModel):
    employee_id: Optional[str] = None
    role: Optional[str] = None
    start_datetime: datetime
    end_datetime: datetime
    state: Optional[str] = "draft"
    note: Optional[str] = None


class PlanningSlotUpdate(BaseModel):
    employee_id: Optional[str] = None
    role: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    state: Optional[str] = None
    note: Optional[str] = None


@router.post("/slots")
def create_slot(slot: PlanningSlotCreate, client: Client = Depends(get_supabase_client)):
    data = slot.dict(exclude_unset=True)
    data["start_datetime"] = data["start_datetime"].isoformat()
    data["end_datetime"] = data["end_datetime"].isoformat()
    resp = client.table("planning_slot").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create planning slot")
    return resp.data[0]


@router.get("/slots")
def read_slots(
    employee_id: Optional[str] = None,
    state: Optional[str] = None,
    week_start: Optional[str] = None,
    week_end: Optional[str] = None,
    client: Client = Depends(get_supabase_client)
):
    query = client.table("planning_slot").select(
        "*, hr_employee(name, job_title)"
    ).order("start_datetime")

    if employee_id:
        query = query.eq("employee_id", employee_id)
    if state:
        query = query.eq("state", state)
    if week_start:
        query = query.gte("start_datetime", f"{week_start}T00:00:00")
    if week_end:
        query = query.lte("start_datetime", f"{week_end}T23:59:59")

    resp = query.execute()
    return resp.data or []


@router.get("/slots/{slot_id}")
def read_slot(slot_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("planning_slot").select("*, hr_employee(name)").eq("id", slot_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Planning slot not found")
    return resp.data[0]


@router.put("/slots/{slot_id}")
def update_slot(slot_id: str, slot: PlanningSlotUpdate, client: Client = Depends(get_supabase_client)):
    data = slot.dict(exclude_unset=True)
    if "start_datetime" in data:
        data["start_datetime"] = data["start_datetime"].isoformat()
    if "end_datetime" in data:
        data["end_datetime"] = data["end_datetime"].isoformat()
    resp = client.table("planning_slot").update(data).eq("id", slot_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Planning slot not found")
    return resp.data[0]


@router.post("/slots/{slot_id}/publish")
def publish_slot(slot_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("planning_slot").update({"state": "published"}).eq("id", slot_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Planning slot not found")
    return resp.data[0]


@router.post("/slots/{slot_id}/unpublish")
def unpublish_slot(slot_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("planning_slot").update({"state": "draft"}).eq("id", slot_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Planning slot not found")
    return resp.data[0]


@router.delete("/slots/{slot_id}")
def delete_slot(slot_id: str, client: Client = Depends(get_supabase_client)):
    client.table("planning_slot").delete().eq("id", slot_id).execute()
    return {"message": "Planning slot deleted"}
