from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.appointments import (
    AppointmentType, AppointmentTypeCreate,
    Appointment, AppointmentCreate
)
from app.core.supabase_client import supabase

router = APIRouter()

# --- Types ---
@router.post("/types", response_model=AppointmentType)
def create_type(type_in: AppointmentTypeCreate):
    data = type_in.dict(exclude_unset=True)
    resp = supabase.table("calendar_appointment_type").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create appointment type")
    return resp.data[0]

@router.get("/types", response_model=List[AppointmentType])
def read_types():
    resp = supabase.table("calendar_appointment_type").select("*").execute()
    return resp.data

# --- Appointments ---
@router.post("/appointments", response_model=Appointment)
def create_appointment(appt: AppointmentCreate):
    data = appt.dict(exclude_unset=True)
    data['start_time'] = str(data['start_time'])
    data['end_time'] = str(data['end_time'])
    
    resp = supabase.table("calendar_appointment").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create appointment")
    return resp.data[0]

@router.get("/appointments", response_model=List[Appointment])
def read_appointments():
    resp = supabase.table("calendar_appointment").select("*").execute()
    return resp.data
