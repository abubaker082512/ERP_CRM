from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import date


router = APIRouter()


class BomLineCreate(BaseModel):
    product_id: str
    product_qty: float = 1.0


class BomCreate(BaseModel):
    product_id: Optional[str] = None
    code: Optional[str] = None
    product_qty: Optional[float] = 1.0
    type: Optional[str] = "normal"
    lines: Optional[List[BomLineCreate]] = []


class ProductionCreate(BaseModel):
    name: Optional[str] = "MO/New"
    product_id: Optional[str] = None
    product_qty: Optional[float] = 1.0
    state: Optional[str] = "draft"
    bom_id: Optional[str] = None
    scheduled_date: Optional[str] = None


class ProductionUpdate(BaseModel):
    product_qty: Optional[float] = None
    state: Optional[str] = None
    bom_id: Optional[str] = None
    scheduled_date: Optional[str] = None


# ─── BOMs ────────────────────────────────────────────────────

@router.post("/boms")
def create_bom(bom: BomCreate, client: Client = Depends(get_supabase_client)):
    bom_data = bom.dict(exclude={"lines"}, exclude_unset=True)
    response = client.table("mrp_bom").insert(bom_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create BOM")

    created_bom = response.data[0]
    bom_id = created_bom["id"]

    if bom.lines:
        lines_data = [{"bom_id": bom_id, "product_id": l.product_id, "product_qty": l.product_qty} for l in bom.lines]
        lines_resp = client.table("mrp_bom_line").insert(lines_data).execute()
        created_bom["lines"] = lines_resp.data or []
    else:
        created_bom["lines"] = []

    return created_bom


@router.get("/boms", response_model=List[Bom])
def read_boms(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    response = client.table("mrp_bom").select("*, lines:mrp_bom_line(*)").range(skip, skip + limit - 1).execute()
    return response.data


@router.get("/boms/{bom_id}")
def read_bom(bom_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("mrp_bom").select("*, product_product(name), mrp_bom_line(*, product_product(name))").eq("id", bom_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="BOM not found")
    return resp.data[0]


@router.delete("/boms/{bom_id}")
def delete_bom(bom_id: str, client: Client = Depends(get_supabase_client)):
    client.table("mrp_bom_line").delete().eq("bom_id", bom_id).execute()
    client.table("mrp_bom").delete().eq("id", bom_id).execute()
    return {"message": "BOM deleted"}


# --- Work Centers ---
@router.post("/workcenters", response_model=WorkCenter)
def create_work_center(wc: WorkCenterCreate, client: Client = Depends(get_supabase_client)):
    response = client.table("mrp_workcenter").insert(wc.dict()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create work center")
    return response.data[0]


@router.get("/workcenters", response_model=List[WorkCenter])
def read_work_centers(client: Client = Depends(get_supabase_client)):
    response = client.table("mrp_workcenter").select("*").execute()
    return response.data


# --- Work Orders ---
@router.post("/workorders", response_model=WorkOrder)
def create_work_order(wo: WorkOrderCreate, client: Client = Depends(get_supabase_client)):
    response = client.table("mrp_workorder").insert(wo.dict()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create work order")
    return response.data[0]


@router.get("/workorders", response_model=List[WorkOrder])
def read_work_orders(production_id: Optional[str] = None, client: Client = Depends(get_supabase_client)):
    query = client.table("mrp_workorder").select("*")
    if production_id:
        query = query.eq("production_id", production_id)
    response = query.execute()
    return response.data


@router.post("/workorders/{wo_id}/start", response_model=WorkOrder)
def start_work_order(wo_id: str, client: Client = Depends(get_supabase_client)):
    response = client.table("mrp_workorder").update({"state": "progress", "date_start": datetime.now().isoformat()}).eq("id", wo_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Work order not found")
    return response.data[0]


@router.post("/workorders/{wo_id}/done", response_model=WorkOrder)
def done_work_order(wo_id: str, client: Client = Depends(get_supabase_client)):
    response = client.table("mrp_workorder").update({"state": "done", "date_finished": datetime.now().isoformat()}).eq("id", wo_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Work order not found")
    return response.data[0]


# ─── Manufacturing Orders ─────────────────────────────────────

@router.post("/production")
def create_production(production: ProductionCreate, client: Client = Depends(get_supabase_client)):
    data = production.dict(exclude_unset=True)
    response = client.table("mrp_production").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create manufacturing order")
    return response.data[0]


@router.get("/production")
def read_production(client: Client = Depends(get_supabase_client)):
    resp = client.table("mrp_production").select("*, product_product(name), mrp_bom(code)").order("created_at", desc=True).execute()
    return resp.data or []


@router.get("/production/{production_id}")
def read_production_order(production_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("mrp_production").select(
        "*, product_product(name, list_price), mrp_bom(code, mrp_bom_line(product_qty, product_product(name)))"
    ).eq("id", production_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Manufacturing order not found")
    return resp.data[0]


@router.put("/production/{production_id}")
def update_production(production_id: str, production: ProductionUpdate, client: Client = Depends(get_supabase_client)):
    data = production.dict(exclude_unset=True)
    resp = client.table("mrp_production").update(data).eq("id", production_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Manufacturing order not found")
    return resp.data[0]


@router.post("/production/{production_id}/confirm")
def confirm_production(production_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("mrp_production").update({"state": "confirmed"}).eq("id", production_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Manufacturing order not found")
    return resp.data[0]


@router.post("/production/{production_id}/done")
def mark_production_done(production_id: str, client: Client = Depends(get_supabase_client)):
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    # Get production details
    prod_resp = client.table("mrp_production").select("*, mrp_bom(mrp_bom_line(*))").eq("id", production_id).execute()
    if not prod_resp.data:
        raise HTTPException(status_code=404, detail="Manufacturing order not found")

    prod = prod_resp.data[0]

    # Mark as done
    resp = client.table("mrp_production").update({
        "state": "done",
        "date_finished": now
    }).eq("id", production_id).execute()

    return resp.data[0] if resp.data else {"message": "Production marked as done"}


@router.delete("/production/{production_id}")
def delete_production(production_id: str, client: Client = Depends(get_supabase_client)):
    client.table("mrp_production").delete().eq("id", production_id).execute()
    return {"message": "Manufacturing order deleted"}
