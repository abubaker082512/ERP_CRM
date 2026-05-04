from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.inventory import (
    Warehouse, WarehouseCreate,
    Location, LocationCreate,
    StockMove, StockMoveCreate,
    StockQuant
)

from typing import List

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
    response = client.table("inventory_move").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create stock move")
    return response.data[0]

@router.get("/moves", response_model=List[StockMove])
def read_stock_moves(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    response = client.table("inventory_move").select("*").range(skip, skip + limit - 1).execute()
    return response.data

# --- Stock Quant ---
@router.get("/quants", response_model=List[StockQuant])
def read_stock_quants(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    response = client.table("inventory_quant").select("*").range(skip, skip + limit - 1).execute()
    return response.data
