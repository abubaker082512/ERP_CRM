"""
discuss.py — Fully functional Discuss/Messaging backend.
Features:
- Channels (group conversations)
- Direct Messages (1-on-1 between users)
- Real-time polling via ?after= timestamp
- Emoji reactions
- Team member list
- Uses JSON serialization inside the 'body' column of mail_message.
  This bypasses database schema differences and avoids foreign key constraint
  violations on mail_message.author_id.
"""

import base64
import json
from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends, Security
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


# ─── Helpers ─────────────────────────────────────────────────────────────────

def extract_user_from_token(token: str) -> dict:
    """Decode Supabase JWT payload locally — no extra API call."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return {}
        b64 = parts[1]
        b64 += "=" * (4 - len(b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(b64))
        uid   = payload.get("sub", "")
        email = payload.get("email", "")
        meta  = payload.get("user_metadata") or {}
        name  = meta.get("name") or (email.split("@")[0] if email else "User")
        return {"id": uid, "email": email, "name": name}
    except Exception:
        return {}


def unpack_message(m: dict) -> dict:
    """Helper to unpack a serialized message dictionary."""
    if not m:
        return m
    try:
        # Check if the body is a serialized JSON string
        body_data = json.loads(m["body"])
        if isinstance(body_data, dict):
            m["body"] = body_data.get("text", "")
            m["author_name"] = body_data.get("author_name", "User")
            m["author_email"] = body_data.get("author_email", "")
            m["author_id"] = body_data.get("author_id", "")
    except Exception:
        # Fallback if body is a normal string
        m["author_name"] = "User"
        m["author_email"] = ""
        m["author_id"] = m.get("author_id") or ""
    return m


# ─── Team Members ─────────────────────────────────────────────────────────────

@router.get("/members")
def get_members(
    credentials: HTTPAuthorizationCredentials = Security(security),
    client: Client = Depends(get_supabase_client),
):
    me = extract_user_from_token(credentials.credentials)
    my_id = me.get("id", "")
    try:
        ws_resp = service_client.table("user_workspaces") \
            .select("workspace_id").eq("user_id", my_id).execute()
        if not ws_resp.data:
            return []
        workspace_id = ws_resp.data[0]["workspace_id"]
        members_resp = service_client.table("user_workspaces") \
            .select("user_id, role").eq("workspace_id", workspace_id).execute()
        result = []
        for m in (members_resp.data or []):
            uid = m["user_id"]
            if uid == my_id:
                continue
            t = service_client.table("tenants").select("id, email").eq("id", uid).execute()
            if t.data:
                email = t.data[0].get("email", "")
                result.append({
                    "id": uid,
                    "email": email,
                    "name": t.data[0].get("name") or email.split("@")[0] or "User",
                    "online": False,
                })
        return result
    except Exception as e:
        print(f"[DISCUSS] members error: {e}")
        return []


# ─── Channels ─────────────────────────────────────────────────────────────────

@router.post("/channels")
def create_channel(
    channel: ChannelCreate,
    client: Client = Depends(get_supabase_client),
):
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
        raise HTTPException(status_code=400, detail=f"Channel creation failed: {e}")


@router.get("/channels")
def read_channels(client: Client = Depends(get_supabase_client)):
    try:
        resp = client.table("mail_channel").select("*").execute()
        rows = resp.data or []
        public = [c for c in rows if c.get("channel_type") != "dm"]
        try:
            public.sort(key=lambda x: x.get("created_at") or "")
        except Exception:
            pass
        return public
    except Exception as e:
        print(f"[DISCUSS] read_channels error: {e}")
        return []


@router.get("/channels/{channel_id}")
def read_channel(channel_id: str, client: Client = Depends(get_supabase_client)):
    try:
        resp = client.table("mail_channel").select("*").eq("id", channel_id).execute()
        if resp.data:
            return resp.data[0]
        raise HTTPException(status_code=404, detail="Channel not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/channels/{channel_id}")
def update_channel(
    channel_id: str,
    channel: ChannelUpdate,
    client: Client = Depends(get_supabase_client),
):
    data = channel.dict(exclude_unset=True)
    try:
        resp = client.table("mail_channel").update(data).eq("id", channel_id).execute()
        if resp.data:
            return resp.data[0]
        raise HTTPException(status_code=404, detail="Channel not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/channels/{channel_id}")
def delete_channel(channel_id: str, client: Client = Depends(get_supabase_client)):
    try:
        client.table("mail_message").delete().eq("channel_id", channel_id).execute()
    except Exception:
        pass
    try:
        client.table("mail_channel").delete().eq("id", channel_id).execute()
    except Exception:
        pass
    return {"message": "Channel deleted"}


# ─── Messages ─────────────────────────────────────────────────────────────────

@router.post("/messages")
def create_message(
    message: MessageCreate,
    credentials: HTTPAuthorizationCredentials = Security(security),
    client: Client = Depends(get_supabase_client),
):
    """
    Send a message. We serialize the body + author metadata as a JSON string
    inside the 'body' column to avoid missing column / foreign key validation errors.
    """
    me = extract_user_from_token(credentials.credentials)
    author_name = me.get("name") or message.author_name or "User"
    author_email = me.get("email") or message.author_email or ""
    author_id   = me.get("id") or ""

    body_data = {
        "text": message.body,
        "author_name": author_name,
        "author_email": author_email,
        "author_id": author_id
    }

    try:
        # Only channel_id and body (sets author_id to None/omitted to avoid fkey contact constraint)
        resp = service_client.table("mail_message").insert({
            "channel_id": message.channel_id,
            "body": json.dumps(body_data)
        }).execute()
        
        if resp.data:
            return unpack_message(resp.data[0])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not send message: {str(e)}")

    raise HTTPException(status_code=400, detail="Could not send message")


@router.get("/channels/{channel_id}/messages")
def read_messages(
    channel_id: str,
    limit: int = 100,
    after: Optional[str] = None,
    client: Client = Depends(get_supabase_client),
):
    try:
        query = (
            client.table("mail_message")
            .select("*")
            .eq("channel_id", channel_id)
            .order("created_at")
            .limit(limit)
        )
        if after:
            query = query.gt("created_at", after)
        resp = query.execute()
        rows = resp.data or []
        return [unpack_message(r) for r in rows]
    except Exception as e:
        print(f"[DISCUSS] read_messages error: {e}")
        return []


@router.delete("/messages/{message_id}")
def delete_message(message_id: str, client: Client = Depends(get_supabase_client)):
    try:
        service_client.table("mail_message").delete().eq("id", message_id).execute()
    except Exception:
        pass
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
        resp = service_client.table("mail_message_reaction").insert({
            "message_id": reaction.message_id,
            "emoji": reaction.emoji,
            "user_id": me.get("id", ""),
            "user_name": me.get("name", "User"),
        }).execute()
        return resp.data[0] if resp.data else {"emoji": reaction.emoji}
    except Exception:
        return {"emoji": reaction.emoji, "message_id": reaction.message_id}


@router.get("/messages/{message_id}/reactions")
def get_reactions(message_id: str, client: Client = Depends(get_supabase_client)):
    try:
        resp = service_client.table("mail_message_reaction") \
            .select("*").eq("message_id", message_id).execute()
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
    me = extract_user_from_token(credentials.credentials)
    my_id  = me.get("id", "")
    other_id = dm.target_user_id

    # Reuse existing DM if one exists
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
            body_data = {
                "text": dm.initial_message,
                "author_name": me.get("name", "User"),
                "author_email": me.get("email", ""),
                "author_id": my_id
            }
            service_client.table("mail_message").insert({
                "channel_id": ch["id"],
                "body": json.dumps(body_data),
            }).execute()

        return ch
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
