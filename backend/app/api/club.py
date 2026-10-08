from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Schemas
class FacilityCourtSchema(BaseModel):
    id: Optional[str] = None
    name: str
    type: str = "Padel"
    surface: str = "Panoramic Glass"
    location: str = "Indoor"
    hourlyRatePeak: float = 75.0
    hourlyRateOffPeak: float = 50.0
    status: str = "available"
    branch_id: Optional[str] = None

class BookingRequest(BaseModel):
    court_id: str
    player_name: str
    time_slot: str
    duration_mins: int = 90
    rackets_rented: int = 0
    total_amount: float
    branch_id: Optional[str] = None

class MemberPassSchema(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    phone: str
    membership_tier: str = "Unlimited Padel VIP"
    rfid_card_number: Optional[str] = None
    status: str = "active"
    branch_id: Optional[str] = None

class TurnstileScanRequest(BaseModel):
    rfid_card_number: str
    gate_id: Optional[str] = "TURNSTILE-MAIN-01"
    branch_id: Optional[str] = None

class GroupClassSchema(BaseModel):
    id: Optional[str] = None
    title: str
    instructor: str
    category: str = "Padel Masterclass"
    day_time: str
    duration_mins: int = 90
    court_or_room: str
    capacity: int = 8
    fee_per_session: float = 25.0
    branch_id: Optional[str] = None

# In-Memory / Supabase-ready mock storage
_COURTS_DB = [
    {
        "id": "crt-1",
        "name": "Center Court 1",
        "type": "Padel",
        "surface": "Panoramic Glass",
        "location": "Indoor",
        "hourlyRatePeak": 80.0,
        "hourlyRateOffPeak": 55.0,
        "status": "booked",
        "currentBooking": {
            "playerName": "Alex Rodriguez (Match #402)",
            "timeSlot": "17:30 - 19:00",
            "durationMins": 90,
            "racketsRented": 2,
            "totalAmount": 130.0
        }
    },
    {
        "id": "crt-2",
        "name": "Court 2 Pro",
        "type": "Padel",
        "surface": "Panoramic Glass",
        "location": "Indoor",
        "hourlyRatePeak": 75.0,
        "hourlyRateOffPeak": 50.0,
        "status": "available"
    },
    {
        "id": "crt-3",
        "name": "Court 3 Club",
        "type": "Padel",
        "surface": "Standard Glass",
        "location": "Outdoor Covered",
        "hourlyRatePeak": 65.0,
        "hourlyRateOffPeak": 45.0,
        "status": "available"
    },
    {
        "id": "crt-4",
        "name": "CrossFit & Conditioning Bay",
        "type": "CrossFit Arena",
        "surface": "Rubber Mat",
        "location": "Indoor",
        "hourlyRatePeak": 50.0,
        "hourlyRateOffPeak": 35.0,
        "status": "available"
    }
]

_MEMBERS_DB = [
    {
        "id": "mem-001",
        "name": "Marcus Sterling",
        "email": "marcus@sterling.club",
        "phone": "+1 (555) 234-8901",
        "membership_tier": "Unlimited Padel VIP",
        "rfid_card_number": "RFID-8849-VIP",
        "status": "active",
        "joined_date": "2026-01-15",
        "expiry_date": "2027-01-15",
        "total_visits": 48,
        "last_check_in": "Today 16:45"
    }
]

# Endpoints
@router.get("/courts")
def get_courts(branch_id: Optional[str] = None):
    return {"status": "success", "data": _COURTS_DB}

@router.post("/courts")
def create_court(payload: FacilityCourtSchema):
    new_court = payload.dict()
    new_court["id"] = f"crt-{len(_COURTS_DB) + 1}"
    _COURTS_DB.append(new_court)
    return {"status": "success", "data": new_court}

@router.post("/bookings")
def book_court(payload: BookingRequest):
    for court in _COURTS_DB:
        if court["id"] == payload.court_id:
            court["status"] = "booked"
            court["currentBooking"] = {
                "playerName": payload.player_name,
                "timeSlot": payload.time_slot,
                "durationMins": payload.duration_mins,
                "racketsRented": payload.rackets_rented,
                "totalAmount": payload.total_amount
            }
            return {"status": "success", "message": f"Court {court['name']} booked successfully", "data": court}
    raise HTTPException(status_code=404, detail="Court not found")

@router.post("/courts/{court_id}/release")
def release_court(court_id: str):
    for court in _COURTS_DB:
        if court["id"] == court_id:
            court["status"] = "available"
            court.pop("currentBooking", None)
            return {"status": "success", "message": f"Court {court['name']} released", "data": court}
    raise HTTPException(status_code=404, detail="Court not found")

@router.get("/members")
def get_members(branch_id: Optional[str] = None):
    return {"status": "success", "data": _MEMBERS_DB}

@router.post("/members")
def create_member(payload: MemberPassSchema):
    new_mem = payload.dict()
    new_mem["id"] = f"mem-{len(_MEMBERS_DB) + 1:03d}"
    if not new_mem.get("rfid_card_number"):
        new_mem["rfid_card_number"] = f"RFID-{1000 + len(_MEMBERS_DB)}-VIP"
    new_mem["total_visits"] = 0
    new_mem["joined_date"] = datetime.utcnow().strftime("%Y-%m-%d")
    _MEMBERS_DB.insert(0, new_mem)
    return {"status": "success", "data": new_mem}

@router.post("/turnstile/scan")
def turnstile_rfid_scan(payload: TurnstileScanRequest):
    for mem in _MEMBERS_DB:
        if mem.get("rfid_card_number") == payload.rfid_card_number:
            if mem.get("status") != "active":
                raise HTTPException(status_code=403, detail="Membership is expired or inactive")
            mem["total_visits"] = mem.get("total_visits", 0) + 1
            mem["last_check_in"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            return {
                "access_granted": True,
                "message": f"Welcome {mem['name']} ({mem['membership_tier']})",
                "member": mem,
                "gate": payload.gate_id
            }
    raise HTTPException(status_code=404, detail="RFID Card tag not recognized in registry")
