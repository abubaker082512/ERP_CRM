from app.api.deps import get_supabase_client, adjust_stock
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.inventory import (
    Warehouse, WarehouseCreate,
    Location, LocationCreate,
    StockMove, StockMoveCreate,
    StockQuant,
    StockPicking, StockPickingCreate
)

from typing import List
from datetime import datetime

router = APIRouter()

# --- Warehouses ---
@router.post("/warehouses", response_model=Warehouse)
def create_warehouse(warehouse: WarehouseCreate, client: Client = Depends(get_supabase_client)):
    data = warehouse.dict(exclude_unset=True)
    response = client.table("inventory_warehouse").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create warehouse")
    return response.data[0]

@router.get("/warehouses", response_model=List[Warehouse])
def read_warehouses(client: Client = Depends(get_supabase_client)):
    response = client.table("inventory_warehouse").select("*").execute()
    return response.data

# --- Locations ---
@router.post("/locations", response_model=Location)
def create_location(location: LocationCreate, client: Client = Depends(get_supabase_client)):
    data = location.dict(exclude_unset=True)
    response = client.table("inventory_location").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create location")
    return response.data[0]

@router.get("/locations", response_model=List[Location])
def read_locations(client: Client = Depends(get_supabase_client)):
    response = client.table("inventory_location").select("*").execute()
    return response.data

# --- Stock Moves ---
@router.post("/moves", response_model=StockMove)
def create_stock_move(move: StockMoveCreate, client: Client = Depends(get_supabase_client)):
    data = move.dict(exclude_unset=True)
    if "quantity" in data:
        data["product_uom_qty"] = data.pop("quantity")
    response = client.table("inventory_move").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create stock move")
    
    created_move = response.data[0]
    if created_move.get("state") == "done":
        qty = float(created_move.get("product_uom_qty") or 0.0)
        product_id = created_move.get("product_id")
        loc_src = created_move.get("location_id")
        loc_dest = created_move.get("location_dest_id")
        
        if product_id:
            if loc_src:
                loc_src_resp = client.table("inventory_location").select("usage").eq("id", loc_src).execute()
                if loc_src_resp.data and loc_src_resp.data[0].get("usage") == "internal":
                    adjust_stock(client, product_id, loc_src, -qty)
            if loc_dest:
                loc_dest_resp = client.table("inventory_location").select("usage").eq("id", loc_dest).execute()
                if loc_dest_resp.data and loc_dest_resp.data[0].get("usage") == "internal":
                    adjust_stock(client, product_id, loc_dest, qty)
                    
    return _map_stock_move(created_move)

@router.get("/moves", response_model=List[StockMove])
def read_stock_moves(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    response = client.table("inventory_move").select("*").range(skip, skip + limit - 1).execute()
    return [_map_stock_move(r) for r in response.data]

# --- Stock Quant ---
@router.get("/quants", response_model=List[StockQuant])
def read_stock_quants(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    response = client.table("inventory_quant").select("*").range(skip, skip + limit - 1).execute()
    return [_map_stock_quant(r) for r in response.data]

# --- Pickings ---
@router.post("/pickings", response_model=StockPicking)
def create_stock_picking(picking: StockPickingCreate, client: Client = Depends(get_supabase_client)):
    data = picking.dict(exclude_unset=True)
    response = client.table("inventory_picking").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create stock picking")
    return response.data[0]

@router.get("/pickings", response_model=List[StockPicking])
def read_stock_pickings(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    response = client.table("inventory_picking").select("*").range(skip, skip + limit - 1).execute()
    return response.data

@router.get("/pickings/{picking_id}", response_model=StockPicking)
def read_stock_picking(picking_id: str, client: Client = Depends(get_supabase_client)):
    response = client.table("inventory_picking").select("*").eq("id", picking_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Stock picking not found")
    return response.data[0]

@router.post("/pickings/{picking_id}/validate", response_model=StockPicking)
def validate_stock_picking(picking_id: str, client: Client = Depends(get_supabase_client)):
    # 1. Update picking state to 'done'
    response = client.table("inventory_picking").update({"state": "done", "date_done": datetime.now().isoformat()}).eq("id", picking_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Stock picking not found")
    
    # 2. Fetch related moves before updating their state
    moves_resp = client.table("inventory_move").select("*").eq("picking_id", picking_id).execute()
    moves = moves_resp.data or []
    
    # 3. Update related moves to 'done'
    client.table("inventory_move").update({"state": "done"}).eq("picking_id", picking_id).execute()
    
    # 4. Adjust stock quants for each move based on internal usage
    for move in moves:
        product_id = move.get("product_id")
        qty = float(move.get("quantity") or move.get("product_uom_qty") or 0.0)
        loc_src = move.get("location_id")
        loc_dest = move.get("location_dest_id")
        
        if product_id:
            if loc_src:
                loc_src_resp = client.table("inventory_location").select("usage").eq("id", loc_src).execute()
                if loc_src_resp.data and loc_src_resp.data[0].get("usage") == "internal":
                    adjust_stock(client, product_id, loc_src, -qty)
            if loc_dest:
                loc_dest_resp = client.table("inventory_location").select("usage").eq("id", loc_dest).execute()
                if loc_dest_resp.data and loc_dest_resp.data[0].get("usage") == "internal":
                    adjust_stock(client, product_id, loc_dest, qty)
                    
    return response.data[0]

def _map_stock_move(row: dict) -> dict:
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "product_id": row.get("product_id"),
        "quantity": float(row.get("product_uom_qty") or 0.0),
        "location_id": row.get("location_id"),
        "location_dest_id": row.get("location_dest_id"),
        "state": row.get("state", "draft"),
        "picking_id": row.get("picking_id"),
        "lot_id": row.get("lot_id"),
        "created_at": row.get("date") or row.get("created_at"),
        "date": row.get("date") or row.get("created_at"),
    }

def _map_stock_quant(row: dict) -> dict:
    return {
        "id": row.get("id"),
        "product_id": row.get("product_id"),
        "location_id": row.get("location_id"),
        "quantity": float(row.get("quantity") or 0.0),
        "reserved_quantity": float(row.get("reserved_quantity") or 0.0),
    }
