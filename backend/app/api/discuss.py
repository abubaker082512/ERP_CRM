from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.discuss import (
    Channel, ChannelCreate,
    Message, MessageCreate
)
from app.core.supabase_client import supabase

router = APIRouter()

# --- Channels ---
@router.post("/channels", response_model=Channel)
def create_channel(channel: ChannelCreate):
    data = channel.dict(exclude_unset=True)
    resp = supabase.table("mail_channel").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create channel")
    return resp.data[0]

@router.get("/channels", response_model=List[Channel])
def read_channels():
    resp = supabase.table("mail_channel").select("*").execute()
    return resp.data

# --- Messages ---
@router.post("/messages", response_model=Message)
def create_message(message: MessageCreate):
    data = message.dict(exclude_unset=True)
    resp = supabase.table("mail_message").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create message")
    return resp.data[0]

@router.get("/messages", response_model=List[Message])
def read_messages(channel_id: UUID):
    resp = supabase.table("mail_message").select("*").eq("channel_id", str(channel_id)).order("created_at").execute()
    return resp.data
