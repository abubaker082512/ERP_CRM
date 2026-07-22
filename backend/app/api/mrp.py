from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, date, timezone
from app.schemas.mrp import (
    Bom, BomCreate, BomLineCreate, 
    Production, ProductionCreate, ProductionUpdate,
    WorkCenter, WorkCenterCreate,
    WorkOrder, WorkOrderCreate
)


router = APIRouter()


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
    prod_resp = client.table("mrp_production").select("*, product_product(name, list_price)").eq("id", production_id).execute()
    if not prod_resp.data:
        raise HTTPException(status_code=404, detail="Manufacturing order not found")

    prod = prod_resp.data[0]
    bom_id = prod.get("bom_id")
    mo_name = prod.get("name") or "MO"
    prod_qty = float(prod.get("product_qty") or 1.0)
    product_id = prod.get("product_id")

    # Mark manufacturing order as done
    resp = client.table("mrp_production").update({
        "state": "done",
        "date_finished": now
    }).eq("id", production_id).execute()

    # ─── LINK TO INVENTORY: Consume Raw Materials & Produce Finished Product ───
    try:
        # Get internal location
        loc_resp = client.table("inventory_location").select("id").eq("usage", "internal").limit(1).execute()
        internal_loc_id = loc_resp.data[0]["id"] if loc_resp.data else "00000000-0000-0000-0000-000000000000"

        # 1. Consume raw materials (BOM lines)
        if bom_id:
            lines_resp = client.table("mrp_bom_line").select("product_id, product_qty").eq("bom_id", bom_id).execute()
            bom_lines = lines_resp.data or []
            stock_moves = []
            for line in bom_lines:
                if line.get("product_id"):
                    stock_moves.append({
                        "name": f"CONSUME/{mo_name}",
                        "product_id": line["product_id"],
                        "quantity": float(line.get("product_qty") or 1.0) * prod_qty,
                        "state": "done",
                        "location_id": internal_loc_id,
                        "location_dest_id": "00000000-0000-0000-0000-000000000000" # consumed / external
                    })
            if stock_moves:
                client.table("inventory_move").insert(stock_moves).execute()

        # 2. Produce finished product
        if product_id:
            client.table("inventory_move").insert({
                "name": f"PRODUCE/{mo_name}",
                "product_id": product_id,
                "quantity": prod_qty,
                "state": "done",
                "location_id": "00000000-0000-0000-0000-000000000000", # production virtual source
                "location_dest_id": internal_loc_id
            }).execute()

    except Exception as e:
        print(f"[MRP-INVENTORY LINK WARN] Failed: {e}")

    # ─── LINK TO ACCOUNTING: Create WIP/COGM entry ───
    try:
        journal_resp = client.table("account_journal").select("id").eq("type", "general").limit(1).execute()
        journal_id = journal_resp.data[0]["id"] if journal_resp.data else None
        
        # Calculate cost
        list_price = float((prod.get("product_product") or {}).get("list_price") or 0.0)
        total_cost = list_price * prod_qty

        move_data = {
            "name": f"MFG/{mo_name}",
            "move_type": "entry", # Journal Entry
            "journal_id": journal_id,
            "amount_total": total_cost,
            "state": "posted"
        }
        client.table("account_move").insert(move_data).execute()
    except Exception as e:
        print(f"[MRP-ACCOUNTING LINK WARN] Failed: {e}")

    return resp.data[0] if resp.data else {"message": "Production marked as done"}


@router.delete("/production/{production_id}")
def delete_production(production_id: str, client: Client = Depends(get_supabase_client)):
    client.table("mrp_production").delete().eq("id", production_id).execute()
    return {"message": "Manufacturing order deleted"}
