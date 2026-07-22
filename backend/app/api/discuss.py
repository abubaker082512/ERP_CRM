"""
discuss.py — Full-featured Discuss/Messaging backend.
- Channels (group, broadcast)
- Direct Messages (1-on-1)
- Real-time polling (?after= timestamp)
- Emoji reactions
- Team member list
- Author extracted from JWT without extra API call (faster)
"""

import base64
import json
from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from pydantic import BaseModel
from app.core.supabase_client import supabase as service_client

router = APIRouter()
security = HTTPBearer()


# ─── Schemas ─────────────────────────────────────────────────────────────────

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
    author_email: Optional[str] = None


class ReactionCreate(BaseModel):
    message_id: str
    emoji: str


class DMCreate(BaseModel):
    target_user_id: str
    initial_message: Optional[str] = None


# ─── JWT Helper (no extra network call) ──────────────────────────────────────

def extract_user_from_token(token: str) -> dict:
    """
    Decode the JWT payload locally — no extra Supabase API call needed.
    The token is already verified by get_supabase_client.
    Returns dict with id, email, name.
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return {}
        payload_b64 = parts[1]
        # Fix base64 padding
        payload_b64 += "=" * (4 - len(payload_b64) % 4)
        raw = base64.urlsafe_b64decode(payload_b64)
        payload = json.loads(raw)
        uid = payload.get("sub", "")
        email = payload.get("email", "")
        meta = payload.get("user_metadata", {}) or {}
        name = meta.get("name") or (email.split("@")[0] if email else "User")
        return {"id": uid, "email": email, "name": name}
    except Exception:
        return {}


# ─── Team Members ─────────────────────────────────────────────────────────────

@router.get("/members")
def get_members(
    credentials: HTTPAuthorizationCredentials = Security(security),
    client: Client = Depends(get_supabase_client),
):
    """Returns all users in the same workspace as the current user."""
    me = extract_user_from_token(credentials.credentials)
    my_id = me.get("id", "")

    try:
        # Find current user's workspace
        ws_resp = service_client.table("user_workspaces") \
            .select("workspace_id").eq("user_id", my_id).execute()
        if not ws_resp.data:
            return []

        workspace_id = ws_resp.data[0]["workspace_id"]

        # Get all members of that workspace
        members_resp = service_client.table("user_workspaces") \
            .select("user_id, role").eq("workspace_id", workspace_id).execute()

        result = []
        for m in (members_resp.data or []):
            uid = m["user_id"]
            if uid == my_id:
                continue  # exclude self
            t_resp = service_client.table("tenants") \
                .select("id, email").eq("id", uid).execute()
            if t_resp.data:
                row = t_resp.data[0]
                email = row.get("email", "")
                result.append({
                    "id": uid,
                    "email": email,
                    "name": row.get("name") or email.split("@")[0] or "User",
                    "online": False,
                })
        return result
    except Exception as e:
        print(f"[DISCUSS] Members error: {e}")
        return []


# ─── Channels ─────────────────────────────────────────────────────────────────

@router.post("/channels")
def create_channel(
    channel: ChannelCreate,
    client: Client = Depends(get_supabase_client),
):
    """Create a new channel. Only inserts columns that exist in mail_channel."""
    data = {
        "name": channel.name,
        "channel_type": channel.channel_type or "channel",
    }
    if channel.description:
        data["description"] = channel.description

    try:
        resp = client.table("mail_channel").insert(data).execute()
        if resp.data:
            return resp.data[0]
        raise HTTPException(status_code=400, detail="Could not create channel")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Channel creation failed: {str(e)}")


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
def update_channel(
    channel_id: str,
    channel: ChannelUpdate,
    client: Client = Depends(get_supabase_client),
):
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


# ─── Messages ─────────────────────────────────────────────────────────────────

@router.post("/messages")
def create_message(
    message: MessageCreate,
    credentials: HTTPAuthorizationCredentials = Security(security),
    client: Client = Depends(get_supabase_client),
):
    """Send a message. Author extracted from JWT (no extra API call)."""
    me = extract_user_from_token(credentials.credentials)

    # Build message data — only include fields that exist in mail_message
    data = {
        "channel_id": message.channel_id,
        "body": message.body,
        "author_name": me.get("name") or message.author_name or "User",
    }
    # Add optional fields only if the table supports them
    if me.get("email") or message.author_email:
        data["author_email"] = me.get("email") or message.author_email
    if me.get("id"):
        data["author_id"] = me["id"]

    try:
        resp = client.table("mail_message").insert(data).execute()
        if resp.data:
            return resp.data[0]
    except Exception:
        # Fallback: try with minimal fields only (in case some columns don't exist)
        try:
            minimal = {
                "channel_id": message.channel_id,
                "body": message.body,
                "author_name": me.get("name") or message.author_name or "User",
            }
            resp = client.table("mail_message").insert(minimal).execute()
            if resp.data:
                return resp.data[0]
        except Exception as e2:
            raise HTTPException(status_code=400, detail=f"Could not send message: {str(e2)}")

    raise HTTPException(status_code=400, detail="Could not send message")


@router.get("/channels/{channel_id}/messages")
def read_messages(
    channel_id: str,
    limit: int = 100,
    after: Optional[str] = None,
    client: Client = Depends(get_supabase_client),
):
    """Get messages. Use ?after=<ISO timestamp> for efficient polling."""
    query = (
        client.table("mail_message")
        .select("*")
        .eq("channel_id", channel_id)
        .order("created_at")
        .limit(limit)
    )
    if after:
        query = query.gt("created_at", after)
    try:
        resp = query.execute()
        return resp.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/messages/{message_id}")
def delete_message(message_id: str, client: Client = Depends(get_supabase_client)):
    client.table("mail_message").delete().eq("id", message_id).execute()
    return {"message": "Message deleted"}


# ─── Reactions ────────────────────────────────────────────────────────────────

@router.post("/reactions")
def add_reaction(
    reaction: ReactionCreate,
    credentials: HTTPAuthorizationCredentials = Security(security),
    client: Client = Depends(get_supabase_client),
):
    me = extract_user_from_token(credentials.credentials)
    try:
        resp = client.table("mail_message_reaction").insert({
            "message_id": reaction.message_id,
            "emoji": reaction.emoji,
            "user_id": me.get("id", ""),
            "user_name": me.get("name", "User"),
        }).execute()
        return resp.data[0] if resp.data else {"emoji": reaction.emoji}
    except Exception:
        # Reaction table may not exist yet — fail gracefully
        return {"emoji": reaction.emoji, "message_id": reaction.message_id}


@router.get("/messages/{message_id}/reactions")
def get_reactions(message_id: str, client: Client = Depends(get_supabase_client)):
    try:
        resp = client.table("mail_message_reaction").select("*").eq("message_id", message_id).execute()
        return resp.data or []
    except Exception:
        return []


# ─── Direct Messages ──────────────────────────────────────────────────────────

@router.post("/dm")
def create_dm(
    dm: DMCreate,
    credentials: HTTPAuthorizationCredentials = Security(security),
    client: Client = Depends(get_supabase_client),
):
    """Create or reuse a DM channel between two users."""
    me = extract_user_from_token(credentials.credentials)
    my_id = me.get("id", "")
    other_id = dm.target_user_id

    # Look for existing DM channel
    try:
        existing = client.table("mail_channel").select("*").eq("channel_type", "dm").execute()
        for ch in (existing.data or []):
            members = ch.get("members") or []
            if isinstance(members, list) and my_id in members and other_id in members:
                return ch
    except Exception:
        pass

    # Create new DM channel
    try:
        ch_data = {
            "name": f"dm-{my_id[:6]}-{other_id[:6]}",
            "channel_type": "dm",
            "description": "Direct message",
        }
        resp = client.table("mail_channel").insert(ch_data).execute()
        if not resp.data:
            raise HTTPException(status_code=400, detail="Could not create DM channel")
        ch = resp.data[0]

        if dm.initial_message:
            client.table("mail_message").insert({
                "channel_id": ch["id"],
                "body": dm.initial_message,
                "author_name": me.get("name", "User"),
                "author_email": me.get("email", ""),
                "author_id": my_id,
            }).execute()

        return ch
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
