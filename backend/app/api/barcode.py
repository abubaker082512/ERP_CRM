from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel


router = APIRouter()


class BarcodeCreate(BaseModel):
    barcode: str
    action: Optional[str] = "scan"


# ─── Barcode Scanning ─────────────────────────────────────────

@router.post("/scans")
def scan_barcode(scan: BarcodeCreate, client: Client = Depends(get_supabase_client)):
    barcode = scan.barcode.strip()

    # Look up product by barcode
    product_resp = client.table("product_product").select("id, name, list_price, standard_price").eq("barcode", barcode).execute()
    product = product_resp.data[0] if product_resp.data else None

    log_data = {
        "barcode": barcode,
        "action": scan.action,
    }
    if product:
        log_data["product_id"] = product["id"]
        log_data["product_name"] = product["name"]

    resp = client.table("stock_barcode_log").insert(log_data).execute()
    log_entry = resp.data[0] if resp.data else log_data

    return {
        "log": log_entry,
        "product": product,
        "found": product is not None
    }


@router.get("/scans")
def read_scans(limit: int = 50, client: Client = Depends(get_supabase_client)):
    resp = client.table("stock_barcode_log").select("*").order("scanned_at", desc=True).limit(limit).execute()
    return resp.data or []


@router.get("/lookup/{barcode}")
def lookup_barcode(barcode: str, client: Client = Depends(get_supabase_client)):
    """Look up a product by barcode without logging."""
    resp = client.table("product_product").select("*").eq("barcode", barcode).execute()
    if not resp.data:
        return {"found": False, "product": None}
    return {"found": True, "product": resp.data[0]}
