from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID

from app.schemas.extras import BarcodeLog, BarcodeLogCreate


router = APIRouter()

@router.post("/scan", response_model=BarcodeLog)
def scan_barcode(log: BarcodeLogCreate, client: Client = Depends(get_supabase_client)):
    data = log.dict(exclude_unset=True)
    # In a real app, we'd lookup the product by barcode here
    
    resp = client.table("stock_barcode_log").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not log scan")
    return resp.data[0]

@router.get("/logs", response_model=List[BarcodeLog])
def read_logs(client: Client = Depends(get_supabase_client)):
    resp = client.table("stock_barcode_log").select("*").order("scanned_at", desc=True).execute()
    return resp.data
