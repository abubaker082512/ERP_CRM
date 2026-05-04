from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID

from app.schemas.helpdesk import Ticket, TicketCreate, Message, MessageCreate


router = APIRouter()

# --- Tickets ---
@router.post("/tickets", response_model=Ticket)
def create_ticket(ticket: TicketCreate, client: Client = Depends(get_supabase_client)):
    data = ticket.dict(exclude_unset=True)
    resp = client.table("helpdesk_ticket").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create ticket")
    return resp.data[0]

@router.get("/tickets", response_model=List[Ticket])
def read_tickets(client: Client = Depends(get_supabase_client)):
    resp = client.table("helpdesk_ticket").select("*").execute()
    return resp.data

@router.get("/tickets/{ticket_id}", response_model=Ticket)
def read_ticket(ticket_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("helpdesk_ticket").select("*").eq("id", ticket_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return resp.data[0]

@router.put("/tickets/{ticket_id}", response_model=Ticket)
def update_ticket(ticket_id: str, ticket: TicketCreate, client: Client = Depends(get_supabase_client)):
    data = ticket.dict(exclude_unset=True)
    resp = client.table("helpdesk_ticket").update(data).eq("id", ticket_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return resp.data[0]

@router.delete("/tickets/{ticket_id}")
def delete_ticket(ticket_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("helpdesk_ticket").delete().eq("id", ticket_id).execute()
    return {"message": "Ticket deleted"}

# --- Messages ---
@router.post("/messages", response_model=Message)
def create_message(message: MessageCreate, client: Client = Depends(get_supabase_client)):
    data = message.dict(exclude_unset=True)
    resp = client.table("helpdesk_message").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create message")
    return resp.data[0]

@router.get("/messages", response_model=List[Message])
def read_messages(ticket_id: UUID, client: Client = Depends(get_supabase_client)):
    resp = client.table("helpdesk_message").select("*").eq("ticket_id", str(ticket_id)).execute()
    return resp.data
