from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


router = APIRouter()


class TicketCreate(BaseModel):
    name: str
    description: Optional[str] = None
    partner_id: Optional[str] = None
    stage_id: Optional[str] = "new"
    priority: Optional[str] = "0"
    assigned_to: Optional[str] = None


class TicketUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    partner_id: Optional[str] = None
    stage_id: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None


class MessageCreate(BaseModel):
    ticket_id: str
    body: str
    author_name: Optional[str] = "User"


@router.post("/tickets")
def create_ticket(ticket: TicketCreate, client: Client = Depends(get_supabase_client)):
    data = ticket.dict(exclude_unset=True)
    resp = client.table("helpdesk_ticket").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create ticket")
    return resp.data[0]


@router.get("/tickets")
def read_tickets(
    stage_id: Optional[str] = None,
    priority: Optional[str] = None,
    client: Client = Depends(get_supabase_client)
):
    query = client.table("helpdesk_ticket").select("*, contacts(name)").order("created_at", desc=True)
    if stage_id:
        query = query.eq("stage_id", stage_id)
    if priority:
        query = query.eq("priority", priority)
    resp = query.execute()
    return resp.data or []


@router.get("/tickets/{ticket_id}")
def read_ticket(ticket_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("helpdesk_ticket").select("*").eq("id", ticket_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket = resp.data[0]
    # Attach messages
    msg_resp = client.table("helpdesk_message").select("*").eq("ticket_id", ticket_id).order("created_at").execute()
    ticket["messages"] = msg_resp.data or []
    return ticket


@router.put("/tickets/{ticket_id}")
def update_ticket(ticket_id: str, ticket: TicketUpdate, client: Client = Depends(get_supabase_client)):
    data = ticket.dict(exclude_unset=True)
    # Auto-set closed_at when resolved
    if data.get("stage_id") in ("done", "resolved", "closed"):
        data["closed_at"] = datetime.utcnow().isoformat()
    resp = client.table("helpdesk_ticket").update(data).eq("id", ticket_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return resp.data[0]


@router.delete("/tickets/{ticket_id}")
def delete_ticket(ticket_id: str, client: Client = Depends(get_supabase_client)):
    client.table("helpdesk_message").delete().eq("ticket_id", ticket_id).execute()
    client.table("helpdesk_ticket").delete().eq("id", ticket_id).execute()
    return {"message": "Ticket deleted"}


@router.post("/messages")
def create_message(message: MessageCreate, client: Client = Depends(get_supabase_client)):
    data = message.dict(exclude_unset=True)
    resp = client.table("helpdesk_message").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create message")
    return resp.data[0]


@router.get("/tickets/{ticket_id}/messages")
def read_messages(ticket_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("helpdesk_message").select("*").eq("ticket_id", ticket_id).order("created_at").execute()
    return resp.data or []
