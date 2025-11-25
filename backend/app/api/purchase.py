from fastapi import APIRouter, HTTPException
from app.schemas.purchase import PurchaseOrder, PurchaseOrderCreate
from app.core.supabase_client import supabase
from typing import List

router = APIRouter()

@router.post("/", response_model=PurchaseOrder)
def create_purchase_order(order: PurchaseOrderCreate):
    # 1. Create Order
    order_data = order.dict(exclude={'lines'}, exclude_unset=True)
    response = supabase.table("purchase_orders").insert(order_data).execute()
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
        
        lines_response = supabase.table("purchase_order_lines").insert(lines_data).execute()
        created_order['lines'] = lines_response.data

    return created_order

@router.get("/", response_model=List[PurchaseOrder])
def read_purchase_orders(skip: int = 0, limit: int = 100):
    # Fetch orders
    # Ideally we join with contacts to get partner name, but Supabase-py join syntax is specific
    # For now, we return the order as is. Frontend can fetch contact name if needed or we enrich here.
    response = supabase.table("purchase_orders").select("*").range(skip, skip + limit - 1).execute()
    return response.data
