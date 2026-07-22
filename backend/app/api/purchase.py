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

@router.post("/{order_id}/confirm", response_model=PurchaseOrder)
def confirm_purchase_order(order_id: str, client: Client = Depends(get_supabase_client)):
    # 1. Fetch order and lines
    order_resp = client.table("purchase_order").select("*, purchase_order_line(*)").eq("id", order_id).execute()
    if not order_resp.data:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    
    order_data = order_resp.data[0]
    if order_data.get("state") == "purchase":
        raise HTTPException(status_code=400, detail="Order is already confirmed")

    # 2. Mark order as confirmed
    client.table("purchase_order").update({"state": "purchase"}).eq("id", order_id).execute()

    # 3. Create Accounting Vendor Bill (in_invoice)
    try:
        journal_resp = client.table("account_journal").select("id").eq("type", "purchase").limit(1).execute()
        journal_id = journal_resp.data[0]["id"] if journal_resp.data else None
        move_data = {
            "name": f"BILL/{order_data.get('name', 'Draft')}",
            "move_type": "in_invoice",
            "journal_id": journal_id,
            "partner_id": order_data.get("partner_id"),
            "amount_total": order_data.get("amount_total", 0.0),
            "state": "draft"
        }
        client.table("account_move").insert(move_data).execute()
    except Exception as e:
        print(f"[PURCHASE-ACCOUNTING LINK WARN] Failed: {e}")

    # 4. Create Inventory Receipt Order (incoming)
    lines = order_data.get("purchase_order_line", [])
    if lines:
        try:
            picking_data = {
                "partner_id": order_data.get("partner_id"),
                "purchase_id": order_id,
                "picking_type_code": "incoming",
                "origin": order_data.get("name"),
                "state": "confirmed"
            }
            picking_resp = client.table("inventory_picking").insert(picking_data).execute()
            
            if picking_resp.data:
                picking_id = picking_resp.data[0]["id"]
                
                loc_resp = client.table("inventory_location").select("id").eq("usage", "internal").limit(1).execute()
                internal_loc_id = loc_resp.data[0]["id"] if loc_resp.data else "00000000-0000-0000-0000-000000000000"
                
                stock_moves = []
                for line in lines:
                    if line.get("product_id"):
                        stock_moves.append({
                            "name": f"IN/{order_data.get('name', 'Draft')}",
                            "product_id": line["product_id"],
                            "quantity": float(line.get("product_qty") or 1.0),
                            "state": "confirmed",
                            "picking_id": picking_id,
                            "location_id": "00000000-0000-0000-0000-000000000000", # external vendor
                            "location_dest_id": internal_loc_id
                        })
                if stock_moves:
                    client.table("inventory_move").insert(stock_moves).execute()
        except Exception as e:
            print(f"[PURCHASE-INVENTORY LINK WARN] Failed: {e}")

    # Refetch updated order
    updated_order_resp = client.table("purchase_order").select("*, purchase_order_line(*)").eq("id", order_id).execute()
    return _map_purchase_order(updated_order_resp.data[0])

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
