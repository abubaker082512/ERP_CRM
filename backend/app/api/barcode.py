from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.extras import BarcodeLog, BarcodeLogCreate
from app.core.supabase_client import supabase

router = APIRouter()

@router.post("/scan", response_model=BarcodeLog)
def scan_barcode(log: BarcodeLogCreate):
    data = log.dict(exclude_unset=True)
    # In a real app, we'd lookup the product by barcode here
    
    resp = supabase.table("stock_barcode_log").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not log scan")
    return resp.data[0]

@router.get("/logs", response_model=List[BarcodeLog])
def read_logs():
    resp = supabase.table("stock_barcode_log").select("*").order("scanned_at", desc=True).execute()
    return resp.data
