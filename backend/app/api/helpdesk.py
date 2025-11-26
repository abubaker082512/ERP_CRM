from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.helpdesk import Ticket, TicketCreate, Message, MessageCreate
from app.core.supabase_client import supabase

router = APIRouter()

# --- Tickets ---
@router.post("/tickets", response_model=Ticket)
def create_ticket(ticket: TicketCreate):
    data = ticket.dict(exclude_unset=True)
    resp = supabase.table("helpdesk_ticket").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create ticket")
    return resp.data[0]

@router.get("/tickets", response_model=List[Ticket])
def read_tickets():
    resp = supabase.table("helpdesk_ticket").select("*").execute()
    return resp.data

# --- Messages ---
@router.post("/messages", response_model=Message)
def create_message(message: MessageCreate):
    data = message.dict(exclude_unset=True)
    resp = supabase.table("helpdesk_message").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create message")
    return resp.data[0]

@router.get("/messages", response_model=List[Message])
def read_messages(ticket_id: UUID):
    resp = supabase.table("helpdesk_message").select("*").eq("ticket_id", str(ticket_id)).execute()
    return resp.data
