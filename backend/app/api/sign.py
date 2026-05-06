from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Any
from pydantic import BaseModel


router = APIRouter()


class SignRequestCreate(BaseModel):
    title: str
    document_url: Optional[str] = None
    signers: Optional[Any] = []


class SignRequestUpdate(BaseModel):
    title: Optional[str] = None
    document_url: Optional[str] = None
    state: Optional[str] = None
    signers: Optional[Any] = None


@router.post("/requests")
def create_request(request: SignRequestCreate, client: Client = Depends(get_supabase_client)):
    data = request.dict(exclude_unset=True)
    resp = client.table("sign_request").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create sign request")
    return resp.data[0]


@router.get("/requests")
def read_requests(state: Optional[str] = None, client: Client = Depends(get_supabase_client)):
    query = client.table("sign_request").select("*").order("created_at", desc=True)
    if state:
        query = query.eq("state", state)
    resp = query.execute()
    return resp.data or []


@router.get("/requests/{request_id}")
def read_request(request_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("sign_request").select("*").eq("id", request_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Sign request not found")
    return resp.data[0]


@router.put("/requests/{request_id}")
def update_request(request_id: str, request: SignRequestUpdate, client: Client = Depends(get_supabase_client)):
    data = request.dict(exclude_unset=True)
    # If marking as signed, record the timestamp
    if data.get("state") == "signed":
        from datetime import datetime
        data["signed_at"] = datetime.utcnow().isoformat()
    resp = client.table("sign_request").update(data).eq("id", request_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Sign request not found")
    return resp.data[0]


@router.post("/requests/{request_id}/sign")
def mark_signed(request_id: str, client: Client = Depends(get_supabase_client)):
    from datetime import datetime
    resp = client.table("sign_request").update({
        "state": "signed",
        "signed_at": datetime.utcnow().isoformat()
    }).eq("id", request_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Sign request not found")
    return resp.data[0]


@router.post("/requests/{request_id}/refuse")
def mark_refused(request_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("sign_request").update({"state": "refused"}).eq("id", request_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Sign request not found")
    return resp.data[0]


@router.delete("/requests/{request_id}")
def delete_request(request_id: str, client: Client = Depends(get_supabase_client)):
    client.table("sign_request").delete().eq("id", request_id).execute()
    return {"message": "Sign request deleted"}
