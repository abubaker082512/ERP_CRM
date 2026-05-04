from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID

from app.schemas.appointments import (
    AppointmentType, AppointmentTypeCreate,
    Appointment, AppointmentCreate
)


router = APIRouter()

# --- Types ---
@router.post("/types", response_model=AppointmentType)
def create_type(type_in: AppointmentTypeCreate, client: Client = Depends(get_supabase_client)):
    data = type_in.dict(exclude_unset=True)
    resp = client.table("calendar_appointment_type").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create appointment type")
    return resp.data[0]

@router.get("/types", response_model=List[AppointmentType])
def read_types(client: Client = Depends(get_supabase_client)):
    resp = client.table("calendar_appointment_type").select("*").execute()
    return resp.data

# --- Appointments ---
@router.post("/appointments", response_model=Appointment)
def create_appointment(appt: AppointmentCreate, client: Client = Depends(get_supabase_client)):
    data = appt.dict(exclude_unset=True)
    data['start_time'] = str(data['start_time'])
    data['end_time'] = str(data['end_time'])
    
    resp = client.table("calendar_appointment").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create appointment")
    return resp.data[0]

@router.get("/appointments", response_model=List[Appointment])
def read_appointments(client: Client = Depends(get_supabase_client)):
    resp = client.table("calendar_appointment").select("*").execute()
    return resp.data
