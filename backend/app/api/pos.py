from app.api.deps import get_supabase_client
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
    order_resp = client.table("pos_order").select("amount_total").eq("id", payment.order_id).execute()
    if order_resp.data:
        total = float(order_resp.data[0].get("amount_total") or 0)
        change = max(0, payment.amount - total)
        client.table("pos_order").update({
            "amount_paid": payment.amount,
            "amount_return": change,
            "state": "paid"
        }).eq("id", payment.order_id).execute()

    return resp.data[0]


@router.get("/payments")
def read_payments(order_id: Optional[str] = None, client: Client = Depends(get_supabase_client)):
    query = client.table("pos_payment").select("*").order("payment_date", desc=True)
    if order_id:
        query = query.eq("order_id", order_id)
    resp = query.execute()
    return resp.data or []
