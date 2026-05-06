from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone


router = APIRouter()


class AttendanceCreate(BaseModel):
    employee_id: str
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None


@router.post("/attendances")
def create_attendance(attendance: AttendanceCreate, client: Client = Depends(get_supabase_client)):
    check_in = attendance.check_in or datetime.now(timezone.utc)
    data = {
        "employee_id": attendance.employee_id,
        "check_in": check_in.isoformat(),
    }
    if attendance.check_out:
        data["check_out"] = attendance.check_out.isoformat()
        delta = attendance.check_out - check_in
        data["worked_hours"] = round(delta.total_seconds() / 3600, 4)

    resp = client.table("hr_attendance").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create attendance record")
    return resp.data[0]


@router.get("/attendances")
def read_attendances(
    employee_id: Optional[str] = None,
    date: Optional[str] = None,
    client: Client = Depends(get_supabase_client)
):
    query = client.table("hr_attendance").select(
        "*, hr_employee(name, job_title)"
    ).order("check_in", desc=True)

    if employee_id:
        query = query.eq("employee_id", employee_id)
    if date:
        query = query.gte("check_in", f"{date}T00:00:00").lte("check_in", f"{date}T23:59:59")

    resp = query.execute()
    return resp.data or []


@router.get("/attendances/{attendance_id}")
def read_attendance(attendance_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("hr_attendance").select("*").eq("id", attendance_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return resp.data[0]


@router.put("/attendances/{attendance_id}/checkout")
def checkout_attendance(attendance_id: str, client: Client = Depends(get_supabase_client)):
    # Fetch check_in time
    existing = client.table("hr_attendance").select("check_in").eq("id", attendance_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Attendance not found")

    check_in_str = existing.data[0].get("check_in")
    check_out = datetime.now(timezone.utc)
    worked_hours = 0.0

    if check_in_str:
        try:
            check_in = datetime.fromisoformat(check_in_str.replace("Z", "+00:00"))
            delta = check_out - check_in
            worked_hours = round(delta.total_seconds() / 3600, 4)
        except Exception:
            pass

    data = {
        "check_out": check_out.isoformat(),
        "worked_hours": worked_hours
    }
    resp = client.table("hr_attendance").update(data).eq("id", attendance_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Attendance not found")
    return resp.data[0]


@router.get("/summary")
def attendance_summary(employee_id: str, client: Client = Depends(get_supabase_client)):
    """Get total worked hours for an employee this month."""
    from datetime import date
    today = date.today()
    month_start = today.replace(day=1).isoformat()

    resp = client.table("hr_attendance").select("worked_hours").eq("employee_id", employee_id).gte(
        "check_in", f"{month_start}T00:00:00"
    ).execute()

    total_hours = sum(float(r.get("worked_hours") or 0) for r in (resp.data or []))
    return {
        "employee_id": employee_id,
        "month": today.strftime("%B %Y"),
        "total_hours": round(total_hours, 2),
        "records": len(resp.data or [])
    }
