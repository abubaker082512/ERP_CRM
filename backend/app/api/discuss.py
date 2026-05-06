from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


router = APIRouter()


class ChannelCreate(BaseModel):
    name: str
    description: Optional[str] = None
    channel_type: Optional[str] = "channel"


class ChannelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class MessageCreate(BaseModel):
    channel_id: str
    body: str
    author_name: Optional[str] = "User"


# ─── Channels ────────────────────────────────────────────────

@router.post("/channels")
def create_channel(channel: ChannelCreate, client: Client = Depends(get_supabase_client)):
    data = channel.dict(exclude_unset=True)
    resp = client.table("mail_channel").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create channel")
    return resp.data[0]


@router.get("/channels")
def read_channels(client: Client = Depends(get_supabase_client)):
    resp = client.table("mail_channel").select("*").order("created_at").execute()
    return resp.data or []


@router.get("/channels/{channel_id}")
def read_channel(channel_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("mail_channel").select("*").eq("id", channel_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Channel not found")
    return resp.data[0]


@router.put("/channels/{channel_id}")
def update_channel(channel_id: str, channel: ChannelUpdate, client: Client = Depends(get_supabase_client)):
    data = channel.dict(exclude_unset=True)
    resp = client.table("mail_channel").update(data).eq("id", channel_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Channel not found")
    return resp.data[0]


@router.delete("/channels/{channel_id}")
def delete_channel(channel_id: str, client: Client = Depends(get_supabase_client)):
    client.table("mail_message").delete().eq("channel_id", channel_id).execute()
    client.table("mail_channel").delete().eq("id", channel_id).execute()
    return {"message": "Channel deleted"}


# ─── Messages ────────────────────────────────────────────────

@router.post("/messages")
def create_message(message: MessageCreate, client: Client = Depends(get_supabase_client)):
    data = message.dict(exclude_unset=True)
    resp = client.table("mail_message").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not send message")
    return resp.data[0]


@router.get("/channels/{channel_id}/messages")
def read_messages(
    channel_id: str,
    limit: int = 50,
    client: Client = Depends(get_supabase_client)
):
    resp = client.table("mail_message").select("*").eq("channel_id", channel_id).order("created_at").limit(limit).execute()
    return resp.data or []
