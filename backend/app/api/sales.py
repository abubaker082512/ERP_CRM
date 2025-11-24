from fastapi import APIRouter, HTTPException
from app.schemas.sales import SalesOrder, SalesOrderCreate
from app.core.supabase_client import supabase
from typing import List

router = APIRouter()

@router.post("/", response_model=SalesOrder)
def create_sales_order(order: SalesOrderCreate):
    # 1. Create Order
    order_data = order.dict(exclude={'lines'}, exclude_unset=True)
    response = supabase.table("sales_orders").insert(order_data).execute()
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
        
        lines_response = supabase.table("sales_order_lines").insert(lines_data).execute()
        created_order['lines'] = lines_response.data

    return created_order

@router.get("/", response_model=List[SalesOrder])
def read_sales_orders(skip: int = 0, limit: int = 100):
    # Fetch orders
    response = supabase.table("sales_orders").select("*").range(skip, skip + limit - 1).execute()
    orders = response.data
    
    # Fetch lines for each order (simplified for now, ideally use join or separate call)
    # Supabase-py doesn't support deep joins easily in one go without foreign key embedding setup in client
    # For MVP, we might just return orders. 
    # To get lines, we'd need: .select("*, sales_order_lines(*)")
    
    response_with_lines = supabase.table("sales_orders").select("*, sales_order_lines(*)").range(skip, skip + limit - 1).execute()
    return response_with_lines.data
