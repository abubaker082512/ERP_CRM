from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID

from app.schemas.extras import SignRequest, SignRequestCreate


router = APIRouter()

@router.post("/requests", response_model=SignRequest)
def create_request(request: SignRequestCreate, client: Client = Depends(get_supabase_client)):
    data = request.dict(exclude_unset=True)
    resp = client.table("sign_request").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create sign request")
    return resp.data[0]

@router.get("/requests", response_model=List[SignRequest])
def read_requests(client: Client = Depends(get_supabase_client)):
    resp = client.table("sign_request").select("*").execute()
    return resp.data
