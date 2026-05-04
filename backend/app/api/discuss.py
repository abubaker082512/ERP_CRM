from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID

from app.schemas.discuss import (
    Channel, ChannelCreate,
    Message, MessageCreate
)


router = APIRouter()

# --- Channels ---
@router.post("/channels", response_model=Channel)
def create_channel(channel: ChannelCreate, client: Client = Depends(get_supabase_client)):
    data = channel.dict(exclude_unset=True)
    resp = client.table("mail_channel").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create channel")
    return resp.data[0]

@router.get("/channels", response_model=List[Channel])
def read_channels(client: Client = Depends(get_supabase_client)):
    resp = client.table("mail_channel").select("*").execute()
    return resp.data

# --- Messages ---
@router.post("/messages", response_model=Message)
def create_message(message: MessageCreate, client: Client = Depends(get_supabase_client)):
    data = message.dict(exclude_unset=True)
    resp = client.table("mail_message").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create message")
    return resp.data[0]

@router.get("/messages", response_model=List[Message])
def read_messages(channel_id: UUID, client: Client = Depends(get_supabase_client)):
    resp = client.table("mail_message").select("*").eq("channel_id", str(channel_id)).order("created_at").execute()
    return resp.data
