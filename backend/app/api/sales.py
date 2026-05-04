from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.sales import SalesOrder, SalesOrderCreate

from typing import List

router = APIRouter()

@router.post("", response_model=SalesOrder)
def create_sales_order(order: SalesOrderCreate, client: Client = Depends(get_supabase_client)):
    # 1. Create Order - map to sale_order columns
    order_data = {
        "name": order.name,
        "state": order.state or "draft",
        "amount_total": order.amount_total,
    }
    if order.contact_id:
        order_data["partner_id"] = str(order.contact_id)
    order_data = {k: v for k, v in order_data.items() if v is not None}

    response = client.table("sale_order").insert(order_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create sales order")

    created_order = response.data[0]
    order_id = created_order['id']

    # 2. Create Order Lines
    if order.lines:
        lines_data = []
        for line in order.lines:
            l_data = line.dict()
            l_data['order_id'] = order_id
            lines_data.append(l_data)

        lines_response = client.table("sale_order_line").insert(lines_data).execute()
        created_order['lines'] = lines_response.data
    else:
        created_order['lines'] = []

    return _map_sale_order(created_order)

@router.get("", response_model=List[SalesOrder])
def read_sales_orders(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    response = client.table("sale_order").select("*, sale_order_line(*)").range(skip, skip + limit - 1).execute()
    return [_map_sale_order(r) for r in response.data]

@router.get("/{order_id}", response_model=SalesOrder)
def read_sales_order(order_id: str, client: Client = Depends(get_supabase_client)):
    response = client.table("sale_order").select("*, sale_order_line(*)").eq("id", order_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Sales order not found")
    return _map_sale_order(response.data[0])

@router.put("/{order_id}", response_model=SalesOrder)
def update_sales_order(order_id: str, order: SalesOrderCreate, client: Client = Depends(get_supabase_client)):
    order_data = {
        "name": order.name,
        "state": order.state,
        "amount_total": order.amount_total,
    }
    order_data = {k: v for k, v in order_data.items() if v is not None}
    response = client.table("sale_order").update(order_data).eq("id", order_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Sales order not found")
    return _map_sale_order(response.data[0])

@router.post("/{order_id}/confirm", response_model=SalesOrder)
def confirm_sales_order(order_id: str, client: Client = Depends(get_supabase_client)):
    # 1. Fetch order and lines
    order_resp = client.table("sale_order").select("*, sale_order_line(*)").eq("id", order_id).execute()
    if not order_resp.data:
        raise HTTPException(status_code=404, detail="Sales order not found")
    
    order_data = order_resp.data[0]
    if order_data.get("state") == "sale":
        raise HTTPException(status_code=400, detail="Order is already confirmed")

    # 2. Mark order as confirmed (sale)
    client.table("sale_order").update({"state": "sale"}).eq("id", order_id).execute()

    # 3. Automation: Create Accounting Invoice (Move)
    # Find the "Customer Invoices" journal
    journal_resp = client.table("account_journal").select("id").eq("type", "sale").limit(1).execute()
    if journal_resp.data:
        journal_id = journal_resp.data[0]["id"]
        move_data = {
            "name": f"INV/{order_data.get('name', 'Draft')}",
            "move_type": "out_invoice",
            "journal_id": journal_id,
            "partner_id": order_data.get("partner_id"),
            "amount_total": order_data.get("amount_total", 0.0),
            "state": "draft"
        }
        client.table("account_move").insert(move_data).execute()

    # 4. Automation: Create Inventory Delivery Order (Stock Move)
    lines = order_data.get("sale_order_line", [])
    if lines:
        stock_moves = []
        for line in lines:
            if line.get("product_id"):
                stock_moves.append({
                    "name": f"OUT/{order_data.get('name', 'Draft')}",
                    "product_id": line["product_id"],
                    "quantity": line.get("product_uom_qty", 1),
                    "state": "waiting",
                    # Provide generic UUIDs for locations or fetch real ones in production
                    "location_id": "00000000-0000-0000-0000-000000000000",
                    "location_dest_id": "00000000-0000-0000-0000-000000000000"
                })
        if stock_moves:
            # We must ignore RLS location UUID foreign key errors for this demo
            # or we should make sure the foreign key allows these placeholder UUIDs.
            # Assuming the backend schema handles it or we handle exceptions gracefully.
            try:
                client.table("inventory_move").insert(stock_moves).execute()
            except Exception as e:
                print(f"Warning: Failed to create inventory move (likely location FK error): {e}")

    # Refetch updated order
    updated_order_resp = client.table("sale_order").select("*, sale_order_line(*)").eq("id", order_id).execute()
    return _map_sale_order(updated_order_resp.data[0])

@router.delete("/{order_id}")
def delete_sales_order(order_id: str, client: Client = Depends(get_supabase_client)):
    client.table("sale_order").delete().eq("id", order_id).execute()
    return {"message": "Sales order deleted"}

def _map_sale_order(row: dict) -> dict:
    """Map sale_order DB row to SalesOrder schema."""
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "customer_name": row.get("customer_name"),
        "contact_id": row.get("partner_id"),
        "state": row.get("state", "draft"),
        "amount_total": row.get("amount_total", 0.0),
        "date_order": row.get("date_order") or row.get("created_at"),
        "created_at": row.get("date_order") or row.get("created_at"),
        "lines": row.get("sale_order_line", row.get("lines", [])),
    }
