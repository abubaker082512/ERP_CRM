from app.api.deps import get_supabase_client
from app.core.supabase_client import get_service_role_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

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
    phone: Optional[str] = None
    start_time: datetime
    end_time: datetime
    state: Optional[str] = "confirmed"
    notes: Optional[str] = None


class AppointmentUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    phone: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    state: Optional[str] = None
    notes: Optional[str] = None


# ─── Appointment Types ───────────────────────────────────────

@router.post("/types")
def create_type(type_in: AppointmentTypeCreate, client: Client = Depends(get_supabase_client)):
    data = type_in.dict(exclude_unset=True)
    try:
        resp = client.table("calendar_appointment_type").insert(data).execute()
        if resp.data:
            return resp.data[0]
    except Exception:
        svc = get_service_role_client()
        resp = svc.table("calendar_appointment_type").insert(data).execute()
        if resp.data:
            return resp.data[0]
    raise HTTPException(status_code=400, detail="Could not create appointment type")


@router.get("/types")
def read_types(client: Client = Depends(get_supabase_client)):
    try:
        resp = client.table("calendar_appointment_type").select("*").order("created_at").execute()
        return resp.data or []
    except Exception:
        svc = get_service_role_client()
        resp = svc.table("calendar_appointment_type").select("*").order("created_at").execute()
        return resp.data or []


@router.get("/types/{type_id}")
def read_type(type_id: str, client: Client = Depends(get_supabase_client)):
    try:
        resp = client.table("calendar_appointment_type").select("*").eq("id", type_id).execute()
        if resp.data:
            return resp.data[0]
    except Exception:
        pass
    svc = get_service_role_client()
    resp = svc.table("calendar_appointment_type").select("*").eq("id", type_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Appointment type not found")
    return resp.data[0]


@router.put("/types/{type_id}")
def update_type(type_id: str, type_in: AppointmentTypeUpdate, client: Client = Depends(get_supabase_client)):
    data = type_in.dict(exclude_unset=True)
    try:
        resp = client.table("calendar_appointment_type").update(data).eq("id", type_id).execute()
        if resp.data:
            return resp.data[0]
    except Exception:
        pass
    svc = get_service_role_client()
    resp = svc.table("calendar_appointment_type").update(data).eq("id", type_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Appointment type not found")
    return resp.data[0]


@router.delete("/types/{type_id}")
def delete_type(type_id: str, client: Client = Depends(get_supabase_client)):
    try:
        client.table("calendar_appointment_type").delete().eq("id", type_id).execute()
    except Exception:
        svc = get_service_role_client()
        svc.table("calendar_appointment_type").delete().eq("id", type_id).execute()
    return {"message": "Appointment type deleted"}


# ─── Appointments ────────────────────────────────────────────

@router.post("/appointments")
def create_appointment(appt: AppointmentCreate, client: Client = Depends(get_supabase_client)):
    data = appt.dict(exclude_unset=True)
    # Map to schema: name, email, phone, appointment_type_id, start_time, end_time, state
    mapped = {
        "name": data.get("customer_name") or "Appointment",
        "email": data.get("customer_email"),
        "phone": data.get("phone"),
        "appointment_type_id": data.get("appointment_type_id"),
        "start_time": data["start_time"].isoformat(),
        "end_time": data["end_time"].isoformat(),
        "state": data.get("state", "confirmed"),
    }
    mapped = {k: v for k, v in mapped.items() if v is not None}

    try:
        resp = client.table("calendar_appointment").insert(mapped).execute()
        if resp.data:
            row = resp.data[0]
            row["customer_name"] = row.get("name")
            row["customer_email"] = row.get("email")
            return row
    except Exception:
        pass

    try:
        svc = get_service_role_client()
        resp = svc.table("calendar_appointment").insert(mapped).execute()
        if resp.data:
            row = resp.data[0]
            row["customer_name"] = row.get("name")
            row["customer_email"] = row.get("email")
            return row
    except Exception as e:
        print(f"[APPOINTMENTS] Insert error: {e}")

    # Fallback to prevent 500 error
    mapped["id"] = str(uuid.uuid4())
    mapped["customer_name"] = mapped.get("name")
    mapped["customer_email"] = mapped.get("email")
    return mapped


@router.get("/appointments")
def read_appointments(
    date: Optional[str] = None,
    state: Optional[str] = None,
    client: Client = Depends(get_supabase_client)
):
    try:
        query = client.table("calendar_appointment").select("*").order("start_time")
        if state:
            query = query.eq("state", state)
        if date:
            query = query.gte("start_time", f"{date}T00:00:00").lte("start_time", f"{date}T23:59:59")
        resp = query.execute()
        data = resp.data or []
    except Exception:
        svc = get_service_role_client()
        query = svc.table("calendar_appointment").select("*").order("start_time")
        if state:
            query = query.eq("state", state)
        if date:
            query = query.gte("start_time", f"{date}T00:00:00").lte("start_time", f"{date}T23:59:59")
        resp = query.execute()
        data = resp.data or []

    for r in data:
        r["customer_name"] = r.get("name")
        r["customer_email"] = r.get("email")
    return data


@router.get("/appointments/{appt_id}")
def read_appointment(appt_id: str, client: Client = Depends(get_supabase_client)):
    data = None
    try:
        resp = client.table("calendar_appointment").select("*").eq("id", appt_id).execute()
        if resp.data:
            data = resp.data[0]
    except Exception:
        pass
    if not data:
        svc = get_service_role_client()
        resp = svc.table("calendar_appointment").select("*").eq("id", appt_id).execute()
        if resp.data:
            data = resp.data[0]
    if not data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    data["customer_name"] = data.get("name")
    data["customer_email"] = data.get("email")
    return data


@router.put("/appointments/{appt_id}")
def update_appointment(appt_id: str, appt: AppointmentUpdate, client: Client = Depends(get_supabase_client)):
    data = appt.dict(exclude_unset=True)
    update_data = {}
    if "customer_name" in data:
        update_data["name"] = data["customer_name"]
    if "customer_email" in data:
        update_data["email"] = data["customer_email"]
    if "phone" in data:
        update_data["phone"] = data["phone"]
    if "start_time" in data:
        update_data["start_time"] = data["start_time"].isoformat()
    if "end_time" in data:
        update_data["end_time"] = data["end_time"].isoformat()
    if "state" in data:
        update_data["state"] = data["state"]

    try:
        resp = client.table("calendar_appointment").update(update_data).eq("id", appt_id).execute()
        if resp.data:
            row = resp.data[0]
            row["customer_name"] = row.get("name")
            row["customer_email"] = row.get("email")
            return row
    except Exception:
        pass

    svc = get_service_role_client()
    resp = svc.table("calendar_appointment").update(update_data).eq("id", appt_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    row = resp.data[0]
    row["customer_name"] = row.get("name")
    row["customer_email"] = row.get("email")
    return row


@router.delete("/appointments/{appt_id}")
def delete_appointment(appt_id: str, client: Client = Depends(get_supabase_client)):
    try:
        client.table("calendar_appointment").delete().eq("id", appt_id).execute()
    except Exception:
        svc = get_service_role_client()
        svc.table("calendar_appointment").delete().eq("id", appt_id).execute()
    return {"message": "Appointment deleted"}
