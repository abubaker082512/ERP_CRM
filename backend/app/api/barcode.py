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

    # Look up product by default_code (stores barcode / SKU in product_product)
    product_resp = client.table("product_product").select("id, name, list_price, standard_price").eq("default_code", barcode).execute()
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
    """Look up a product by barcode (default_code) without logging."""
    resp = client.table("product_product").select("*").eq("default_code", barcode).execute()
    if not resp.data:
        return {"found": False, "product": None}
    return {"found": True, "product": resp.data[0]}


@router.post("/generate/{product_id}")
def generate_barcode(product_id: str, client: Client = Depends(get_supabase_client)):
    """Generate and assign a unique EAN barcode/SKU to a product."""
    import random
    
    # 1. Check if product exists
    prod_resp = client.table("product_product").select("id, default_code").eq("id", product_id).execute()
    if not prod_resp.data:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # If already has barcode/SKU, return it
    if prod_resp.data[0].get("default_code"):
        return {"product_id": product_id, "barcode": prod_resp.data[0]["default_code"]}

    # 2. Generate a random EAN-13-like barcode starting with '200' (Internal Use prefix)
    random_digits = "".join([str(random.randint(0, 9)) for _ in range(9)])
    barcode = f"200{random_digits}"
    
    # Calculate check digit for standard EAN-13
    sum_odd = sum(int(barcode[i]) for i in range(0, 12, 2))
    sum_even = sum(int(barcode[i]) for i in range(1, 12, 2)) * 3
    checksum = (10 - ((sum_odd + sum_even) % 10)) % 10
    barcode = f"{barcode}{checksum}"

    # 3. Save barcode to default_code
    resp = client.table("product_product").update({"default_code": barcode}).eq("id", product_id).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not assign barcode")

    return {"product_id": product_id, "barcode": barcode}
