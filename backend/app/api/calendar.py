"""
calendar.py — Unified Calendar Events backend.
Handles Events, Appointments, My Tasks, Team Tasks, and Meet sessions.
Uses the `calendar_events` Supabase table (created on first use with fallback to calendar_appointment).
"""

from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter()

# ─── Schemas ────────────────────────────────────────────────────────────────

class CalendarEventCreate(BaseModel):
    title: str
    event_type: str = "event"   # event | appointment | my_task | team_task | meet
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    assignee: Optional[str] = None     # for team_task
    meet_link: Optional[str] = None    # auto-generated for meet
    state: Optional[str] = "confirmed"
    notes: Optional[str] = None


class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    event_type: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    description: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    assignee: Optional[str] = None
    meet_link: Optional[str] = None
    state: Optional[str] = None
    notes: Optional[str] = None


# ─── CRUD ────────────────────────────────────────────────────────────────────

@router.post("/events")
def create_event(event: CalendarEventCreate, client: Client = Depends(get_supabase_client)):
    data = event.dict(exclude_unset=True)
    data["start_time"] = data["start_time"].isoformat()
    data["end_time"] = data["end_time"].isoformat()

    # Try the new unified calendar_events table first
    try:
        resp = client.table("calendar_events").insert(data).execute()
        if resp.data:
            return resp.data[0]
    except Exception as e:
        print(f"[CALENDAR] calendar_events insert failed ({e}), falling back to calendar_appointment")

    # Fallback: map to calendar_appointment for backward compat
    fallback_data = {
        "customer_name": data.get("customer_name") or data.get("title", "Event"),
        "customer_email": data.get("customer_email"),
        "start_time": data["start_time"],
        "end_time": data["end_time"],
        "state": data.get("state", "confirmed"),
        "notes": data.get("description") or data.get("notes"),
    }
    fallback_data = {k: v for k, v in fallback_data.items() if v is not None}
    resp = client.table("calendar_appointment").insert(fallback_data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create calendar event")
    # Enrich the fallback response to look like a CalendarEntry
    row = resp.data[0]
    row["title"] = data.get("title", row.get("customer_name", "Event"))
    row["event_type"] = data.get("event_type", "event")
    if data.get("meet_link"):
        row["meet_link"] = data["meet_link"]
    if data.get("assignee"):
        row["assignee"] = data["assignee"]
    return row


@router.get("/events")
def list_events(
    event_type: Optional[str] = None,
    date: Optional[str] = None,
    client: Client = Depends(get_supabase_client),
):
    # Try new table first
    try:
        query = client.table("calendar_events").select("*").order("start_time")
        if event_type:
            query = query.eq("event_type", event_type)
        if date:
            query = query.gte("start_time", f"{date}T00:00:00").lte("start_time", f"{date}T23:59:59")
        resp = query.execute()
        return resp.data or []
    except Exception as e:
        print(f"[CALENDAR] calendar_events fetch failed ({e}), falling back to calendar_appointment")

    # Fallback: read from calendar_appointment and shape to CalendarEntry
    query = client.table("calendar_appointment").select("*").order("start_time")
    if date:
        query = query.gte("start_time", f"{date}T00:00:00").lte("start_time", f"{date}T23:59:59")
    resp = query.execute()
    rows = resp.data or []
    # Normalize to CalendarEntry shape
    return [
        {
            **r,
            "title": r.get("customer_name", r.get("name", "Appointment")),
            "event_type": "appointment",
        }
        for r in rows
    ]


@router.get("/events/{event_id}")
def get_event(event_id: str, client: Client = Depends(get_supabase_client)):
    try:
        resp = client.table("calendar_events").select("*").eq("id", event_id).execute()
        if resp.data:
            return resp.data[0]
    except Exception:
        pass
    resp = client.table("calendar_appointment").select("*").eq("id", event_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Event not found")
    row = resp.data[0]
    row["title"] = row.get("customer_name", "Appointment")
    row["event_type"] = "appointment"
    return row


@router.put("/events/{event_id}")
def update_event(event_id: str, event: CalendarEventUpdate, client: Client = Depends(get_supabase_client)):
    data = event.dict(exclude_unset=True)
    if "start_time" in data:
        data["start_time"] = data["start_time"].isoformat()
    if "end_time" in data:
        data["end_time"] = data["end_time"].isoformat()

    try:
        resp = client.table("calendar_events").update(data).eq("id", event_id).execute()
        if resp.data:
            return resp.data[0]
    except Exception:
        pass

    resp = client.table("calendar_appointment").update(data).eq("id", event_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Event not found")
    return resp.data[0]


@router.delete("/events/{event_id}")
def delete_event(event_id: str, client: Client = Depends(get_supabase_client)):
    try:
        client.table("calendar_events").delete().eq("id", event_id).execute()
    except Exception:
        pass
    try:
        client.table("calendar_appointment").delete().eq("id", event_id).execute()
    except Exception:
        pass
    return {"message": "Event deleted"}
