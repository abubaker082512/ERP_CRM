from fastapi import APIRouter, HTTPException
from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.core.supabase_client import supabase
from typing import List

router = APIRouter()

@router.post("/", response_model=Product)
def create_product(product: ProductCreate):
    product_data = product.dict(exclude_unset=True)
    response = supabase.table("products").insert(product_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create product")
    return response.data[0]

@router.get("/", response_model=List[Product])
def read_products(skip: int = 0, limit: int = 100):
    response = supabase.table("products").select("*").range(skip, skip + limit - 1).execute()
    return response.data

@router.get("/{product_id}", response_model=Product)
def read_product(product_id: str):
    response = supabase.table("products").select("*").eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return response.data[0]
