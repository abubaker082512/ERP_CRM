from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID
from datetime import datetime

from app.schemas.attendance import Attendance, AttendanceCreate


router = APIRouter()

@router.post("/attendances", response_model=Attendance)
def create_attendance(attendance: AttendanceCreate, client: Client = Depends(get_supabase_client)):
    data = attendance.dict(exclude_unset=True)
    # Ensure datetimes are strings
    data['check_in'] = str(data['check_in'])
    if data.get('check_out'):
        data['check_out'] = str(data['check_out'])
        
    resp = client.table("hr_attendance").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create attendance")
    return resp.data[0]

@router.get("/attendances", response_model=List[Attendance])
def read_attendances(client: Client = Depends(get_supabase_client)):
    resp = client.table("hr_attendance").select("*").execute()
    return resp.data

@router.put("/attendances/{attendance_id}/checkout", response_model=Attendance)
def checkout_attendance(attendance_id: UUID, client: Client = Depends(get_supabase_client)):
    now = datetime.now()
    # First get the attendance to calculate hours (simplified)
    # In a real app, we'd calculate worked_hours properly
    
    data = {
        "check_out": str(now),
        # "worked_hours": ... calculation logic
    }
    
    resp = client.table("hr_attendance").update(data).eq("id", str(attendance_id)).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Attendance not found")
    return resp.data[0]
