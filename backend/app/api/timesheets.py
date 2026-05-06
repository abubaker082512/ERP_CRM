from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.timesheet import Timesheet, TimesheetCreate
from typing import List

router = APIRouter()

@router.get("/", response_model=List[Timesheet])
def read_timesheets(client: Client = Depends(get_supabase_client)):
    resp = client.table("hr_timesheet").select("*").execute()
    return resp.data or []

@router.post("/", response_model=Timesheet)
def create_timesheet(ts: TimesheetCreate, client: Client = Depends(get_supabase_client)):
    data = ts.dict(exclude_unset=True)
    if 'date' in data: data['date'] = data['date'].isoformat()
    resp = client.table("hr_timesheet").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create timesheet entry")
    return resp.data[0]
