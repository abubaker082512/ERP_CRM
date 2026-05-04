from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.purchase import PurchaseOrder, PurchaseOrderCreate

from typing import List

router = APIRouter()

@router.post("", response_model=PurchaseOrder)
def create_purchase_order(order: PurchaseOrderCreate, client: Client = Depends(get_supabase_client)):
    # 1. Create Order - map to purchase_order columns
    order_data = {
        "name": order.name,
        "state": order.state or "draft",
        "amount_total": order.amount_total,
    }
    if order.partner_id:
        order_data["partner_id"] = str(order.partner_id)
    order_data = {k: v for k, v in order_data.items() if v is not None}

    response = client.table("purchase_order").insert(order_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create purchase order")

    created_order = response.data[0]
    order_id = created_order['id']

    # 2. Create Order Lines
    if order.lines:
        lines_data = []
        for line in order.lines:
            l_data = line.dict()
            l_data['order_id'] = order_id
            lines_data.append(l_data)

        lines_response = client.table("purchase_order_line").insert(lines_data).execute()
        created_order['lines'] = lines_response.data
    else:
        created_order['lines'] = []

    return _map_purchase_order(created_order)

@router.get("", response_model=List[PurchaseOrder])
def read_purchase_orders(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    response = client.table("purchase_order").select("*, purchase_order_line(*)").range(skip, skip + limit - 1).execute()
    return [_map_purchase_order(r) for r in response.data]

@router.get("/{order_id}", response_model=PurchaseOrder)
def read_purchase_order(order_id: str, client: Client = Depends(get_supabase_client)):
    response = client.table("purchase_order").select("*, purchase_order_line(*)").eq("id", order_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return _map_purchase_order(response.data[0])

@router.put("/{order_id}", response_model=PurchaseOrder)
def update_purchase_order(order_id: str, order: PurchaseOrderCreate, client: Client = Depends(get_supabase_client)):
    order_data = {
        "name": order.name,
        "state": order.state,
        "amount_total": order.amount_total,
    }
    order_data = {k: v for k, v in order_data.items() if v is not None}
    response = client.table("purchase_order").update(order_data).eq("id", order_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return _map_purchase_order(response.data[0])

@router.delete("/{order_id}")
def delete_purchase_order(order_id: str, client: Client = Depends(get_supabase_client)):
    client.table("purchase_order").delete().eq("id", order_id).execute()
    return {"message": "Purchase order deleted"}

def _map_purchase_order(row: dict) -> dict:
    """Map purchase_order DB row to PurchaseOrder schema."""
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "partner_id": row.get("partner_id"),
        "state": row.get("state", "draft"),
        "amount_total": row.get("amount_total", 0.0),
        "date_order": row.get("date_order") or row.get("created_at"),
        "created_at": row.get("date_order") or row.get("created_at"),
        "lines": row.get("purchase_order_line", row.get("lines", [])),
    }
