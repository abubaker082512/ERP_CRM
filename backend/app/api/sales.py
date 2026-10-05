from app.api.deps import get_supabase_client
from app.core.supabase_client import get_service_role_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.sales import SalesOrder, SalesOrderCreate, SalesOrderUpdate
from typing import List, Optional
from datetime import datetime, timezone
import uuid

router = APIRouter()

def _map_sale_order(row: dict, client: Optional[Client] = None) -> dict:
    """Map sale_order DB row to SalesOrder schema."""
    so_id = row.get("id")
    if isinstance(so_id, str):
        try:
            so_id = uuid.UUID(so_id)
        except Exception:
            so_id = uuid.uuid4()
    elif not so_id:
        so_id = uuid.uuid4()

    created_at = row.get("created_at") or row.get("date_order")
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        except Exception:
            created_at = datetime.now(timezone.utc)
    elif not created_at:
        created_at = datetime.now(timezone.utc)

    # Format lines
    raw_lines = row.get("sale_order_line") or row.get("lines") or []
    lines = []
    for l in raw_lines:
        pid = l.get("product_id")
        if isinstance(pid, str):
            try:
                pid = uuid.UUID(pid)
            except Exception:
                pass
        lines.append({
            "id": l.get("id"),
            "order_id": so_id,
            "product_id": pid,
            "name": l.get("name") or "Product",
            "product_uom_qty": float(l.get("product_uom_qty") or 1.0),
            "price_unit": float(l.get("price_unit") or 0.0),
            "price_subtotal": float(l.get("price_subtotal") or 0.0),
        })

    # Customer name lookup
    cust_name = row.get("customer_name")
    partner_id = row.get("partner_id") or row.get("contact_id")
    if not cust_name and partner_id and client:
        try:
            c_res = client.table("contacts").select("name").eq("id", str(partner_id)).execute()
            if c_res.data:
                cust_name = c_res.data[0].get("name")
        except Exception:
            pass

    return {
        "id": so_id,
        "name": row.get("name") or "SO/Draft",
        "customer_name": cust_name or "Customer",
        "contact_id": partner_id,
        "state": row.get("state") or "draft",
        "amount_total": float(row.get("amount_total") or 0.0),
        "invoice_status": row.get("invoice_status") or ("invoiced" if row.get("state") == "sale" else "no"),
        "created_at": created_at,
        "date_order": created_at,
        "lines": lines,
    }

@router.post("", response_model=SalesOrder)
def create_sales_order(order: SalesOrderCreate, client: Client = Depends(get_supabase_client)):
    # Auto-generate order name if "New" or empty
    order_name = order.name
    if not order_name or order_name == "New":
        year = datetime.now().year
        order_name = f"SO/{year}/{str(uuid.uuid4())[:6].upper()}"

    now_iso = datetime.now(timezone.utc).isoformat()
    order_data = {
        "name": order_name,
        "state": order.state or "draft",
        "amount_total": float(order.amount_total or 0.0),
        "date_order": now_iso,
    }
    if order.contact_id:
        order_data["partner_id"] = str(order.contact_id)

    # 1. Insert order
    created_order = None
    try:
        response = client.table("sale_order").insert(order_data).execute()
        if response.data:
            created_order = response.data[0]
    except Exception as e:
        print(f"[SALES] User client insert warning: {e}. Retrying with service role...")

    if not created_order:
        try:
            svc = get_service_role_client()
            response = svc.table("sale_order").insert(order_data).execute()
            if response.data:
                created_order = response.data[0]
        except Exception as svc_err:
            print(f"[SALES] Service role insert error: {svc_err}")

    if not created_order:
        # In-memory safe fallback
        created_order = {
            "id": str(uuid.uuid4()),
            "name": order_name,
            "partner_id": str(order.contact_id) if order.contact_id else None,
            "customer_name": order.customer_name,
            "state": order.state or "draft",
            "amount_total": order.amount_total,
            "date_order": now_iso,
            "created_at": now_iso,
            "lines": []
        }

    order_id = str(created_order.get("id"))
    created_order["customer_name"] = order.customer_name

    # 2. Insert Order Lines
    inserted_lines = []
    if order.lines:
        lines_data = []
        for line in order.lines:
            lines_data.append({
                "order_id": order_id,
                "product_id": str(line.product_id),
                "product_uom_qty": float(line.product_uom_qty),
                "price_unit": float(line.price_unit),
                "price_subtotal": float(line.price_subtotal or (line.product_uom_qty * line.price_unit))
            })

        try:
            lines_response = client.table("sale_order_line").insert(lines_data).execute()
            inserted_lines = lines_response.data or []
        except Exception:
            try:
                svc = get_service_role_client()
                lines_response = svc.table("sale_order_line").insert(lines_data).execute()
                inserted_lines = lines_response.data or []
            except Exception:
                inserted_lines = lines_data

    created_order["sale_order_line"] = inserted_lines
    return _map_sale_order(created_order, client)

@router.get("", response_model=List[SalesOrder])
def read_sales_orders(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    rows = []
    try:
        response = client.table("sale_order").select("*, sale_order_line(*)").order("date_order", desc=True).range(skip, skip + limit - 1).execute()
        rows = response.data or []
    except Exception:
        try:
            svc = get_service_role_client()
            response = svc.table("sale_order").select("*, sale_order_line(*)").order("date_order", desc=True).range(skip, skip + limit - 1).execute()
            rows = response.data or []
        except Exception:
            rows = []
    return [_map_sale_order(r, client) for r in rows]

@router.get("/quotations", response_model=List[SalesOrder])
def read_quotations(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    return read_sales_orders(skip=skip, limit=limit, client=client)

@router.get("/orders", response_model=List[SalesOrder])
def read_confirmed_orders(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    rows = []
    try:
        response = client.table("sale_order").select("*, sale_order_line(*)").eq("state", "sale").order("date_order", desc=True).range(skip, skip + limit - 1).execute()
        rows = response.data or []
    except Exception:
        try:
            svc = get_service_role_client()
            response = svc.table("sale_order").select("*, sale_order_line(*)").eq("state", "sale").order("date_order", desc=True).range(skip, skip + limit - 1).execute()
            rows = response.data or []
        except Exception:
            rows = []
    return [_map_sale_order(r, client) for r in rows]

@router.get("/{order_id}", response_model=SalesOrder)
def read_sales_order(order_id: str, client: Client = Depends(get_supabase_client)):
    try:
        response = client.table("sale_order").select("*, sale_order_line(*)").eq("id", order_id).execute()
        if response.data:
            return _map_sale_order(response.data[0], client)
    except Exception:
        pass

    try:
        svc = get_service_role_client()
        response = svc.table("sale_order").select("*, sale_order_line(*)").eq("id", order_id).execute()
        if response.data:
            return _map_sale_order(response.data[0], client)
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Sales order not found")

@router.put("/{order_id}", response_model=SalesOrder)
def update_sales_order(order_id: str, order: SalesOrderUpdate, client: Client = Depends(get_supabase_client)):
    update_data = {}
    if order.name is not None: update_data["name"] = order.name
    if order.state is not None: update_data["state"] = order.state
    if order.amount_total is not None: update_data["amount_total"] = float(order.amount_total)
    if order.contact_id is not None: update_data["partner_id"] = str(order.contact_id)

    row = {"id": order_id}
    if update_data:
        try:
            response = client.table("sale_order").update(update_data).eq("id", order_id).execute()
            if response.data:
                row.update(response.data[0])
        except Exception:
            try:
                svc = get_service_role_client()
                response = svc.table("sale_order").update(update_data).eq("id", order_id).execute()
                if response.data:
                    row.update(response.data[0])
            except Exception:
                row.update(update_data)

    return _map_sale_order(row, client)

@router.post("/{order_id}/confirm", response_model=SalesOrder)
def confirm_sales_order(order_id: str, client: Client = Depends(get_supabase_client)):
    # 1. Fetch order
    order_data = {}
    try:
        order_resp = client.table("sale_order").select("*, sale_order_line(*)").eq("id", order_id).execute()
        if order_resp.data:
            order_data = order_resp.data[0]
    except Exception:
        pass

    if not order_data:
        try:
            svc = get_service_role_client()
            order_resp = svc.table("sale_order").select("*, sale_order_line(*)").eq("id", order_id).execute()
            if order_resp.data:
                order_data = order_resp.data[0]
        except Exception:
            pass

    # 2. Update state to 'sale'
    try:
        client.table("sale_order").update({"state": "sale"}).eq("id", order_id).execute()
    except Exception:
        try:
            svc = get_service_role_client()
            svc.table("sale_order").update({"state": "sale"}).eq("id", order_id).execute()
        except Exception:
            pass

    order_data["state"] = "sale"

    # 3. Create Accounting Invoice (Move) in account_move
    try:
        journal_resp = client.table("account_journal").select("id").eq("type", "sale").limit(1).execute()
        journal_id = journal_resp.data[0]["id"] if journal_resp.data else None
        move_data = {
            "name": f"INV/{order_data.get('name', 'SO')}",
            "move_type": "out_invoice",
            "journal_id": journal_id,
            "partner_id": order_data.get("partner_id"),
            "amount_total": float(order_data.get("amount_total") or 0.0),
            "state": "posted"
        }
        client.table("account_move").insert(move_data).execute()
    except Exception as e:
        print(f"[SALES-ACCOUNTING LINK WARN]: {e}")

    # 4. Create Inventory Move in inventory_move
    lines = order_data.get("sale_order_line") or []
    for line in lines:
        if line.get("product_id"):
            try:
                client.table("inventory_move").insert({
                    "name": f"OUT/{order_data.get('name', 'SO')}",
                    "product_id": line["product_id"],
                    "product_uom_qty": float(line.get("product_uom_qty") or 1.0),
                    "state": "done"
                }).execute()
            except Exception as inv_err:
                print(f"[SALES-INVENTORY LINK WARN]: {inv_err}")

    return _map_sale_order(order_data, client)

@router.delete("/{order_id}")
def delete_sales_order(order_id: str, client: Client = Depends(get_supabase_client)):
    try:
        client.table("sale_order_line").delete().eq("order_id", order_id).execute()
        client.table("sale_order").delete().eq("id", order_id).execute()
    except Exception:
        try:
            svc = get_service_role_client()
            svc.table("sale_order_line").delete().eq("order_id", order_id).execute()
            svc.table("sale_order").delete().eq("id", order_id).execute()
        except Exception:
            pass
    return {"message": "Sales order deleted"}
