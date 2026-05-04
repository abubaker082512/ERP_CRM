from fastapi import APIRouter, Depends, HTTPException, Security
from typing import List
from uuid import UUID
from pydantic import BaseModel, EmailStr

from app.api.deps import get_supabase_client
from app.core.email import send_team_invite
from supabase import Client

router = APIRouter()

class InvitationCreate(BaseModel):
    email: EmailStr
    workspace_id: UUID

class InvitationResponse(BaseModel):
    id: UUID
    email: str
    status: str
    workspace_id: UUID

@router.get("/my-workspaces")
def get_workspaces(client: Client = Depends(get_supabase_client)):
    """Get all workspaces the current user belongs to."""
    user = client.auth.get_user()
    if not user.user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    resp = client.table("user_workspaces").select("workspace_id, role, workspaces(name)").execute()
    return resp.data

@router.post("/invite", response_model=InvitationResponse)
def invite_user(invite: InvitationCreate, client: Client = Depends(get_supabase_client)):
    """Invite a user to a workspace."""
    user_resp = client.auth.get_user()
    if not user_resp.user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verify the current user is an owner or admin of the workspace
    check = client.table("user_workspaces").select("role").eq("workspace_id", str(invite.workspace_id)).eq("user_id", user_resp.user.id).execute()
    
    if not check.data or check.data[0]['role'] not in ['owner', 'admin']:
        raise HTTPException(status_code=403, detail="You do not have permission to invite users to this workspace")
    
    # Create the invitation
    invite_data = {
        "email": invite.email,
        "workspace_id": str(invite.workspace_id),
        "invited_by": user_resp.user.id
    }
    
    resp = client.table("invitations").insert(invite_data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Failed to create invitation")
        
    created_invite = resp.data[0]
    
    # Send the email!
    inviter_email = user_resp.user.email or "A teammate"
    send_team_invite(
        to_email=created_invite["email"], 
        invite_id=created_invite["id"],
        inviter_name=inviter_email
    )

    return created_invite

@router.get("/invitations", response_model=List[InvitationResponse])
def get_invitations(workspace_id: UUID, client: Client = Depends(get_supabase_client)):
    """Get pending invitations for a workspace."""
    resp = client.table("invitations").select("*").eq("workspace_id", str(workspace_id)).execute()
    return resp.data
