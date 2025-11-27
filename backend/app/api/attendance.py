from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID
from datetime import datetime

from app.schemas.attendance import Attendance, AttendanceCreate
from app.core.supabase_client import supabase

router = APIRouter()

@router.post("/attendances", response_model=Attendance)
def create_attendance(attendance: AttendanceCreate):
    data = attendance.dict(exclude_unset=True)
    # Ensure datetimes are strings
    data['check_in'] = str(data['check_in'])
    if data.get('check_out'):
        data['check_out'] = str(data['check_out'])
        
    resp = supabase.table("hr_attendance").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create attendance")
    return resp.data[0]

@router.get("/attendances", response_model=List[Attendance])
def read_attendances():
    resp = supabase.table("hr_attendance").select("*").execute()
    return resp.data

@router.put("/attendances/{attendance_id}/checkout", response_model=Attendance)
def checkout_attendance(attendance_id: UUID):
    now = datetime.now()
    # First get the attendance to calculate hours (simplified)
    # In a real app, we'd calculate worked_hours properly
    
    data = {
        "check_out": str(now),
        # "worked_hours": ... calculation logic
    }
    
    resp = supabase.table("hr_attendance").update(data).eq("id", str(attendance_id)).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Attendance not found")
    return resp.data[0]
