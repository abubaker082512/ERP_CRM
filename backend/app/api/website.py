from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID

from app.schemas.website import (
    WebProduct, WebProductCreate,
    Order, OrderCreate
)


router = APIRouter()

# --- Products ---
@router.post("/products", response_model=WebProduct)
def create_product(product: WebProductCreate, client: Client = Depends(get_supabase_client)):
    data = product.dict(exclude_unset=True)
    resp = client.table("website_product").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create product")
    return resp.data[0]

@router.get("/products", response_model=List[WebProduct])
def read_products(client: Client = Depends(get_supabase_client)):
    resp = client.table("website_product").select("*").execute()
    return resp.data

# --- Orders ---
@router.post("/orders", response_model=Order)
def create_order(order: OrderCreate, client: Client = Depends(get_supabase_client)):
    # 1. Create Order
    order_data = order.dict(exclude={'items'}, exclude_unset=True)
    resp = client.table("website_order").insert(order_data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create order")
    
    created_order = resp.data[0]
    order_id = created_order['id']

    # 2. Create Order Lines
    if order.items:
        items_data = []
        for item in order.items:
            i_data = item.dict()
            i_data['order_id'] = order_id
            # Calculate subtotal if needed, but schema has it. 
            # For simplicity, we trust the input or should calc it here.
            i_data['price_subtotal'] = i_data['quantity'] * i_data['price_unit']
            items_data.append(i_data)
        
        items_resp = client.table("website_order_line").insert(items_data).execute()
        created_order['items'] = items_resp.data

    return created_order

@router.get("/orders", response_model=List[Order])
def read_orders(client: Client = Depends(get_supabase_client)):
    resp = client.table("website_order").select("*, items:website_order_line(*)").execute()
    return resp.data
