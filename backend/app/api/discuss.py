"""
discuss.py — Full-featured Discuss/Messaging backend.
Supports:
  - Channels (group conversations) 
  - Direct Messages (1-on-1 between users)
  - Messages with author info (name, email, avatar letter)
  - Reactions (emoji) on messages
  - Real-time polling via ?after= timestamp filter
  - Team member list for the sidebar
"""

from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends, Request, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.supabase_client import supabase as service_client

router = APIRouter()
security = HTTPBearer()


# ─── Schemas ────────────────────────────────────────────────────────────────

class ChannelCreate(BaseModel):
    name: str
    description: Optional[str] = None
    channel_type: Optional[str] = "channel"   # "channel" | "dm"


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
    target_user_id: str    # the other user's ID
    initial_message: Optional[str] = None


# ─── Helpers ────────────────────────────────────────────────────────────────

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Lightweight token → user info extraction."""
    try:
        resp = service_client.auth.get_user(credentials.credentials)
        if not resp.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        u = resp.user
        name = (u.user_metadata or {}).get("name", "") or u.email.split("@")[0]
        return {
            "id": str(u.id),
            "email": u.email,
            "name": name,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


# ─── Team Members ────────────────────────────────────────────────────────────

@router.get("/members")
def get_members(
    client: Client = Depends(get_supabase_client),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """
    Returns all users in the same workspace/org as the logged-in user.
    Falls back to reading from Supabase auth.users via service role if
    the workspace tables aren't populated yet.
    """
    try:
        # First try workspace members via user_workspaces table
        me = get_current_user(credentials)
        ws_resp = service_client.table("user_workspaces").select("workspace_id").eq("user_id", me["id"]).execute()
        if ws_resp.data:
            workspace_id = ws_resp.data[0]["workspace_id"]
            members_resp = service_client.table("user_workspaces").select("user_id, role").eq("workspace_id", workspace_id).execute()
            member_ids = [m["user_id"] for m in (members_resp.data or []) if m["user_id"] != me["id"]]

            # Get user details from tenants table (has email)
            result = []
            for uid in member_ids:
                t_resp = service_client.table("tenants").select("id, email").eq("id", uid).execute()
                if t_resp.data:
                    row = t_resp.data[0]
                    result.append({
                        "id": row["id"],
                        "email": row["email"],
                        "name": row.get("name") or (row["email"].split("@")[0] if row.get("email") else "User"),
                        "online": False,
                    })
            return result
    except Exception as e:
        print(f"[DISCUSS] Members lookup via workspaces failed: {e}")

    # Fallback: return empty (safe — just means DM list shows nobody yet)
    return []


# ─── Channels ────────────────────────────────────────────────────────────────

@router.post("/channels")
def create_channel(
    channel: ChannelCreate,
    client: Client = Depends(get_supabase_client),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    me = get_current_user(credentials)
    data = channel.dict(exclude_unset=True)
    data["created_by"] = me["id"]
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


# ─── Messages ────────────────────────────────────────────────────────────────

@router.post("/messages")
def create_message(
    message: MessageCreate,
    client: Client = Depends(get_supabase_client),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    me = get_current_user(credentials)
    data = {
        "channel_id": message.channel_id,
        "body": message.body,
        "author_name": me["name"] or message.author_name or "User",
        "author_email": me["email"] or message.author_email,
        "author_id": me["id"],
    }
    resp = client.table("mail_message").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not send message")
    return resp.data[0]


@router.get("/channels/{channel_id}/messages")
def read_messages(
    channel_id: str,
    limit: int = 100,
    after: Optional[str] = None,   # ISO timestamp — return only messages newer than this
    client: Client = Depends(get_supabase_client),
):
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
    return resp.data or []


@router.delete("/messages/{message_id}")
def delete_message(message_id: str, client: Client = Depends(get_supabase_client)):
    client.table("mail_message").delete().eq("id", message_id).execute()
    return {"message": "Message deleted"}


# ─── Reactions ────────────────────────────────────────────────────────────────

@router.post("/reactions")
def add_reaction(
    reaction: ReactionCreate,
    client: Client = Depends(get_supabase_client),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    me = get_current_user(credentials)
    # Try inserting into mail_message_reaction — if table doesn't exist, graceful error
    try:
        data = {
            "message_id": reaction.message_id,
            "emoji": reaction.emoji,
            "user_id": me["id"],
            "user_name": me["name"],
        }
        resp = client.table("mail_message_reaction").insert(data).execute()
        if resp.data:
            return resp.data[0]
    except Exception as e:
        print(f"[DISCUSS] Reaction insert failed (table may not exist): {e}")
    return {"emoji": reaction.emoji, "message_id": reaction.message_id}


@router.get("/messages/{message_id}/reactions")
def get_reactions(message_id: str, client: Client = Depends(get_supabase_client)):
    try:
        resp = client.table("mail_message_reaction").select("*").eq("message_id", message_id).execute()
        return resp.data or []
    except Exception:
        return []


# ─── Direct Messages ─────────────────────────────────────────────────────────

@router.post("/dm")
def create_dm(
    dm: DMCreate,
    client: Client = Depends(get_supabase_client),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """
    Creates (or reuses) a DM channel between the current user and target_user_id.
    Optionally sends an initial message.
    """
    me = get_current_user(credentials)
    my_id = me["id"]
    other_id = dm.target_user_id

    # Check if DM channel already exists between the two users
    try:
        existing = client.table("mail_channel").select("*").eq("channel_type", "dm").execute()
        for ch in (existing.data or []):
            members = ch.get("members", [])
            if isinstance(members, list) and my_id in members and other_id in members:
                return ch  # Reuse existing DM channel
    except Exception:
        pass

    # Get target user name
    target_name = other_id
    try:
        t_resp = service_client.table("tenants").select("email").eq("id", other_id).execute()
        if t_resp.data:
            target_name = t_resp.data[0].get("email", "").split("@")[0]
    except Exception:
        pass

    # Create new DM channel
    ch_data = {
        "name": f"dm-{my_id[:6]}-{other_id[:6]}",
        "channel_type": "dm",
        "description": f"Direct message",
        "members": [my_id, other_id],
        "created_by": my_id,
    }
    resp = client.table("mail_channel").insert(ch_data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create DM channel")
    ch = resp.data[0]

    # Send initial message if provided
    if dm.initial_message:
        client.table("mail_message").insert({
            "channel_id": ch["id"],
            "body": dm.initial_message,
            "author_name": me["name"],
            "author_email": me["email"],
            "author_id": my_id,
        }).execute()

    return ch
