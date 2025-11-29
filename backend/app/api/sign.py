from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.extras import SignRequest, SignRequestCreate
from app.core.supabase_client import supabase

router = APIRouter()

@router.post("/requests", response_model=SignRequest)
def create_request(request: SignRequestCreate):
    data = request.dict(exclude_unset=True)
    resp = supabase.table("sign_request").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create sign request")
    return resp.data[0]

@router.get("/requests", response_model=List[SignRequest])
def read_requests():
    resp = supabase.table("sign_request").select("*").execute()
    return resp.data
