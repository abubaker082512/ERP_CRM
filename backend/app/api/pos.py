from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID
from datetime import datetime

from app.schemas.pos import (
    PosConfig, PosConfigCreate,
    PosSession, PosSessionCreate,
    PosOrder, PosOrderCreate
)
from app.core.supabase_client import supabase

router = APIRouter()

# --- Config ---
@router.post("/configs", response_model=PosConfig)
def create_config(config: PosConfigCreate):
    data = config.dict(exclude_unset=True)
    resp = supabase.table("pos_config").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create POS config")
    return resp.data[0]

@router.get("/configs", response_model=List[PosConfig])
def read_configs():
    resp = supabase.table("pos_config").select("*").execute()
    return resp.data

# --- Sessions ---
@router.post("/sessions", response_model=PosSession)
def create_session(session: PosSessionCreate):
    data = session.dict(exclude_unset=True)
    resp = supabase.table("pos_session").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create POS session")
    return resp.data[0]

@router.get("/sessions", response_model=List[PosSession])
def read_sessions():
    resp = supabase.table("pos_session").select("*").execute()
    return resp.data

# --- Orders ---
@router.post("/orders", response_model=PosOrder)
def create_order(order: PosOrderCreate):
    # 1. Create Order
    order_data = order.dict(exclude={'lines'}, exclude_unset=True)
    # Generate name (simplified)
    order_data['name'] = f"POS/{order_data['session_id']}/{datetime.now().timestamp()}"
    
    resp = supabase.table("pos_order").insert(order_data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create POS order")
    
    created_order = resp.data[0]
    order_id = created_order['id']

    # 2. Create Lines
    if order.lines:
        lines_data = []
        for line in order.lines:
            l_data = line.dict()
            l_data['order_id'] = order_id
            l_data['price_subtotal'] = l_data['qty'] * l_data['price_unit'] * (1 - l_data['discount']/100)
            l_data['price_subtotal_incl'] = l_data['price_subtotal'] # Simplified tax
            lines_data.append(l_data)
        
        l_resp = supabase.table("pos_order_line").insert(lines_data).execute()
        created_order['lines'] = l_resp.data

    return created_order

@router.get("/orders", response_model=List[PosOrder])
def read_orders():
    resp = supabase.table("pos_order").select("*, lines:pos_order_line(*)").execute()
    return resp.data
