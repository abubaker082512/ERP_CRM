from app.api.deps import get_supabase_client, adjust_stock
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


router = APIRouter()


class PosConfigCreate(BaseModel):
    name: str
    currency_id: Optional[str] = "USD"
    receipt_header: Optional[str] = None
    receipt_footer: Optional[str] = None


class PosSessionCreate(BaseModel):
    config_id: str
    user_id: Optional[str] = None
    start_cash: Optional[float] = 0.0


class PosOrderLineCreate(BaseModel):
    product_id: Optional[str] = None
    qty: Optional[float] = 1.0
    price_unit: Optional[float] = 0.0
    discount: Optional[float] = 0.0


class PosOrderCreate(BaseModel):
    session_id: str
    partner_id: Optional[str] = None
    amount_total: Optional[float] = 0.0
    amount_tax: Optional[float] = 0.0
    lines: Optional[List[PosOrderLineCreate]] = []


class PosPaymentCreate(BaseModel):
    order_id: str
    amount: float
    payment_method: Optional[str] = "cash"


# ─── Configs ─────────────────────────────────────────────────

@router.post("/configs")
def create_config(config: PosConfigCreate, client: Client = Depends(get_supabase_client)):
    data = config.dict(exclude_unset=True)
    resp = client.table("pos_config").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create POS config")
    return resp.data[0]


@router.get("/configs")
def read_configs(client: Client = Depends(get_supabase_client)):
    resp = client.table("pos_config").select("*").eq("active", True).execute()
    return resp.data or []


# ─── Sessions ────────────────────────────────────────────────

@router.post("/sessions")
def create_session(session: PosSessionCreate, client: Client = Depends(get_supabase_client)):
    data = session.dict(exclude_unset=True)
    data["state"] = "open"
    resp = client.table("pos_session").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create POS session")
    return resp.data[0]


@router.get("/sessions")
def read_sessions(client: Client = Depends(get_supabase_client)):
    resp = client.table("pos_session").select("*, pos_config(name)").order("start_at", desc=True).execute()
    return resp.data or []


@router.get("/sessions/open")
def get_open_session(client: Client = Depends(get_supabase_client)):
    resp = client.table("pos_session").select("*, pos_config(name)").eq("state", "open").limit(1).execute()
    return resp.data[0] if resp.data else None


@router.put("/sessions/{session_id}/close")
def close_session(session_id: str, stop_cash: float = 0.0, client: Client = Depends(get_supabase_client)):
    data = {
        "state": "closed",
        "stop_at": datetime.utcnow().isoformat(),
        "stop_cash": stop_cash
    }
    resp = client.table("pos_session").update(data).eq("id", session_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return resp.data[0]


# ─── Orders ──────────────────────────────────────────────────

@router.post("/orders")
def create_order(order: PosOrderCreate, client: Client = Depends(get_supabase_client)):
    order_data = order.dict(exclude={"lines"}, exclude_unset=True)
    order_data["name"] = f"POS/{datetime.now().strftime('%Y%m%d%H%M%S')}"

    resp = client.table("pos_order").insert(order_data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create POS order")

    created_order = resp.data[0]
    order_id = created_order["id"]

    if order.lines:
        lines_data = []
        for line in order.lines:
            l = line.dict(exclude_unset=True)
            l["order_id"] = order_id
            subtotal = l.get("qty", 1) * l.get("price_unit", 0) * (1 - l.get("discount", 0) / 100)
            l["price_subtotal"] = round(subtotal, 2)
            l["price_subtotal_incl"] = round(subtotal, 2)
            lines_data.append(l)

        l_resp = client.table("pos_order_line").insert(lines_data).execute()
        created_order["lines"] = l_resp.data or []

    return created_order


@router.get("/orders")
def read_orders(session_id: Optional[str] = None, client: Client = Depends(get_supabase_client)):
    query = client.table("pos_order").select("*, pos_order_line(*, product_product(name))").order("date_order", desc=True)
    if session_id:
        query = query.eq("session_id", session_id)
    resp = query.execute()
    return resp.data or []


@router.get("/orders/{order_id}")
def read_order(order_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("pos_order").select("*, pos_order_line(*, product_product(name, list_price))").eq("id", order_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return resp.data[0]


# ─── Payments ────────────────────────────────────────────────

@router.post("/payments")
def create_payment(payment: PosPaymentCreate, client: Client = Depends(get_supabase_client)):
    data = payment.dict(exclude_unset=True)
    resp = client.table("pos_payment").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not record payment")

    # Update order amount_paid and state
    order_resp = client.table("pos_order").select("amount_total, name").eq("id", payment.order_id).execute()
    if order_resp.data:
        total = float(order_resp.data[0].get("amount_total") or 0)
        order_name = order_resp.data[0].get("name") or "POS Order"
        change = max(0, payment.amount - total)
        client.table("pos_order").update({
            "amount_paid": payment.amount,
            "amount_return": change,
            "state": "paid"
        }).eq("id", payment.order_id).execute()

        # Resolve or create sale journal
        journal_id = None
        try:
            journal_resp = client.table("account_journal").select("id").eq("type", "sale").limit(1).execute()
            if journal_resp.data:
                journal_id = journal_resp.data[0]["id"]
            else:
                new_j = client.table("account_journal").insert({
                    "name": "Customer Invoices",
                    "code": "INV",
                    "type": "sale"
                }).execute()
                if new_j.data:
                    journal_id = new_j.data[0]["id"]
        except Exception as je:
            print(f"[POS-JOURNAL ERR]: {je}")

        # ─── LINK TO ACCOUNTING: Create Customer Invoice ───
        try:
            move_data = {
                "name": f"INV/{order_name}",
                "move_type": "out_invoice",
                "journal_id": journal_id,
                "amount_total": total,
                "state": "posted"
            }
            client.table("account_move").insert(move_data).execute()
        except Exception as e:
            print(f"[POS-ACCOUNTING LINK WARN] Failed: {e}")

        # ─── LINK TO SALES MODULE: Create Confirmed Sales Order ───
        try:
            lines_resp = client.table("pos_order_line").select("product_id, qty, price_unit").eq("order_id", payment.order_id).execute()
            lines = lines_resp.data or []
            
            so_resp = client.table("sale_order").insert({
                "name": f"SO/{order_name}",
                "state": "sale",
                "amount_total": total
            }).execute()
            
            if so_resp.data and lines:
                so_id = so_resp.data[0]["id"]
                so_lines = [{
                    "order_id": so_id,
                    "product_id": line["product_id"],
                    "name": "POS Sale Line",
                    "product_uom_qty": float(line["qty"]),
                    "price_unit": float(line["price_unit"]),
                    "price_subtotal": float(line["qty"]) * float(line["price_unit"]),
                    "price_total": float(line["qty"]) * float(line["price_unit"])
                } for line in lines if line.get("product_id")]
                
                if so_lines:
                    client.table("sale_order_line").insert(so_lines).execute()
        except Exception as e:
            print(f"[POS-SALES LINK WARN] Failed: {e}")

        # ─── LINK TO INVENTORY: Decrease Stock & Update Quants ───
        try:
            lines_resp = client.table("pos_order_line").select("product_id, qty").eq("order_id", payment.order_id).execute()
            lines = lines_resp.data or []
            if lines:
                picking_data = {
                    "picking_type_code": "outgoing",
                    "origin": order_name,
                    "state": "done"
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
                                "name": f"POS/{order_name}",
                                "product_id": line["product_id"],
                                "quantity": float(line.get("qty") or 1.0),
                                "state": "done",
                                "picking_id": picking_id,
                                "location_id": internal_loc_id,
                                "location_dest_id": "00000000-0000-0000-0000-000000000000"
                            })
                            # Decrease active stock in quant table
                            adjust_stock(client, line["product_id"], internal_loc_id, -float(line.get("qty") or 1.0))
                            
                    if stock_moves:
                        client.table("inventory_move").insert(stock_moves).execute()
        except Exception as e:
            print(f"[POS-INVENTORY LINK WARN] Failed: {e}")

    return resp.data[0]


@router.get("/payments")
def read_payments(order_id: Optional[str] = None, client: Client = Depends(get_supabase_client)):
    query = client.table("pos_payment").select("*").order("payment_date", desc=True)
    if order_id:
        query = query.eq("order_id", order_id)
    resp = query.execute()
    return resp.data or []
