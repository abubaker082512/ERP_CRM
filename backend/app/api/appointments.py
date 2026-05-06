from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


router = APIRouter()


class AppointmentTypeCreate(BaseModel):
    name: str
    duration: Optional[int] = 60
    location: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = False


class AppointmentTypeUpdate(BaseModel):
    name: Optional[str] = None
    duration: Optional[int] = None
    location: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None


class AppointmentCreate(BaseModel):
    appointment_type_id: Optional[str] = None
    customer_name: str
    customer_email: Optional[str] = None
    start_time: datetime
    end_time: datetime
    state: Optional[str] = "confirmed"
    notes: Optional[str] = None


class AppointmentUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    state: Optional[str] = None
    notes: Optional[str] = None


# ─── Appointment Types ───────────────────────────────────────

@router.post("/types")
def create_type(type_in: AppointmentTypeCreate, client: Client = Depends(get_supabase_client)):
    data = type_in.dict(exclude_unset=True)
    resp = client.table("calendar_appointment_type").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create appointment type")
    return resp.data[0]


@router.get("/types")
def read_types(client: Client = Depends(get_supabase_client)):
    resp = client.table("calendar_appointment_type").select("*").order("created_at").execute()
    return resp.data or []


@router.get("/types/{type_id}")
def read_type(type_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("calendar_appointment_type").select("*").eq("id", type_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Appointment type not found")
    return resp.data[0]


@router.put("/types/{type_id}")
def update_type(type_id: str, type_in: AppointmentTypeUpdate, client: Client = Depends(get_supabase_client)):
    data = type_in.dict(exclude_unset=True)
    resp = client.table("calendar_appointment_type").update(data).eq("id", type_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Appointment type not found")
    return resp.data[0]


@router.delete("/types/{type_id}")
def delete_type(type_id: str, client: Client = Depends(get_supabase_client)):
    client.table("calendar_appointment_type").delete().eq("id", type_id).execute()
    return {"message": "Appointment type deleted"}


# ─── Appointments ────────────────────────────────────────────

@router.post("/appointments")
def create_appointment(appt: AppointmentCreate, client: Client = Depends(get_supabase_client)):
    data = appt.dict(exclude_unset=True)
    data["start_time"] = data["start_time"].isoformat()
    data["end_time"] = data["end_time"].isoformat()
    resp = client.table("calendar_appointment").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create appointment")
    return resp.data[0]


@router.get("/appointments")
def read_appointments(
    date: Optional[str] = None,
    state: Optional[str] = None,
    client: Client = Depends(get_supabase_client)
):
    query = client.table("calendar_appointment").select("*, calendar_appointment_type(name)").order("start_time")
    if state:
        query = query.eq("state", state)
    if date:
        # Filter by date range (same day)
        query = query.gte("start_time", f"{date}T00:00:00").lte("start_time", f"{date}T23:59:59")
    resp = query.execute()
    return resp.data or []


@router.get("/appointments/{appt_id}")
def read_appointment(appt_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("calendar_appointment").select("*, calendar_appointment_type(name)").eq("id", appt_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return resp.data[0]


@router.put("/appointments/{appt_id}")
def update_appointment(appt_id: str, appt: AppointmentUpdate, client: Client = Depends(get_supabase_client)):
    data = appt.dict(exclude_unset=True)
    if "start_time" in data:
        data["start_time"] = data["start_time"].isoformat()
    if "end_time" in data:
        data["end_time"] = data["end_time"].isoformat()
    resp = client.table("calendar_appointment").update(data).eq("id", appt_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return resp.data[0]


@router.delete("/appointments/{appt_id}")
def delete_appointment(appt_id: str, client: Client = Depends(get_supabase_client)):
    client.table("calendar_appointment").delete().eq("id", appt_id).execute()
    return {"message": "Appointment deleted"}
