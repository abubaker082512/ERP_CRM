from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.product import Product, ProductCreate, ProductUpdate

from typing import List

router = APIRouter()

@router.post("", response_model=Product)
def create_product(product: ProductCreate, client: Client = Depends(get_supabase_client)):
    # Map to product_product columns
    product_data = {
        "name": product.name,
        "list_price": product.list_price,
        "standard_price": product.cost_price,
        "default_code": product.sku,
        "type": "consu",  # default
    }
    product_data = {k: v for k, v in product_data.items() if v is not None}
    response = client.table("product_product").insert(product_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create product")
    
    created_product = response.data[0]
    
    # Initialize stock quant if quantity_on_hand is provided
    if product.quantity_on_hand and product.quantity_on_hand > 0:
        try:
            loc_res = client.table("inventory_location").select("*").execute()
            if loc_res.data:
                location_id = loc_res.data[0]["id"]
            else:
                new_loc = client.table("inventory_location").insert({
                    "name": "WH/Stock",
                    "usage": "internal"
                }).execute()
                location_id = new_loc.data[0]["id"]
            
            client.table("inventory_quant").insert({
                "product_id": created_product["id"],
                "location_id": location_id,
                "quantity": product.quantity_on_hand,
                "reserved_quantity": 0
            }).execute()
        except Exception as e:
            print("Failed to auto-create inventory quant:", e)

    return _map_product(created_product)

@router.get("", response_model=List[Product])
def read_products(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    response = client.table("product_product").select("*").range(skip, skip + limit - 1).execute()
    return [_map_product(r) for r in response.data]

@router.get("/{product_id}", response_model=Product)
def read_product(product_id: str, client: Client = Depends(get_supabase_client)):
    response = client.table("product_product").select("*").eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return _map_product(response.data[0])

@router.get("/{product_id}/stock")
def get_product_stock_details(product_id: str, client: Client = Depends(get_supabase_client)):
    """Fetch all stock moves and current quants for a specific product to build an audit log."""
    # 1. Fetch current stock levels (Quants)
    quants_resp = client.table("inventory_quant").select("*").eq("product_id", product_id).execute()
    
    # 2. Fetch history of moves
    moves_resp = client.table("inventory_move").select("*").eq("product_id", product_id).order("created_at", desc=True).execute()
    
    return {
        "quants": quants_resp.data or [],
        "moves": moves_resp.data or []
    }

@router.put("/{product_id}", response_model=Product)
def update_product(product_id: str, product: ProductUpdate, client: Client = Depends(get_supabase_client)):
    update_data = {
        "name": product.name,
        "list_price": product.list_price,
        "standard_price": product.cost_price,
        "default_code": product.sku,
    }
    update_data = {k: v for k, v in update_data.items() if v is not None}
    response = client.table("product_product").update(update_data).eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return _map_product(response.data[0])

@router.delete("/{product_id}")
def delete_product(product_id: str, client: Client = Depends(get_supabase_client)):
    client.table("product_product").delete().eq("id", product_id).execute()
    return {"message": "Product deleted"}

def _map_product(row: dict) -> dict:
    """Map product_product DB row to Product schema."""
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "description": row.get("description"),
        "list_price": row.get("list_price", 0.0),
        "cost_price": row.get("standard_price", 0.0),
        "sku": row.get("default_code"),
        "category": row.get("categ_id"),
        "quantity_on_hand": 0,  # Computed from inventory_quant
        "image_url": row.get("image_url"),
        "created_at": row.get("created_at"),
    }
