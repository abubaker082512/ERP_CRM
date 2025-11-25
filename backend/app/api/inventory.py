from fastapi import APIRouter, HTTPException
from app.schemas.inventory import (
    Warehouse, WarehouseCreate,
    Location, LocationCreate,
    StockMove, StockMoveCreate,
    StockQuant
)
from app.core.supabase_client import supabase
from typing import List

router = APIRouter()

# --- Warehouses ---
@router.post("/warehouses", response_model=Warehouse)
def create_warehouse(warehouse: WarehouseCreate):
    data = warehouse.dict(exclude_unset=True)
    response = supabase.table("warehouses").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create warehouse")
    return response.data[0]

@router.get("/warehouses", response_model=List[Warehouse])
def read_warehouses():
    response = supabase.table("warehouses").select("*").execute()
    return response.data

# --- Locations ---
@router.post("/locations", response_model=Location)
def create_location(location: LocationCreate):
    data = location.dict(exclude_unset=True)
    response = supabase.table("locations").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create location")
    return response.data[0]

@router.get("/locations", response_model=List[Location])
def read_locations():
    response = supabase.table("locations").select("*").execute()
    return response.data

# --- Stock Moves ---
@router.post("/moves", response_model=StockMove)
def create_stock_move(move: StockMoveCreate):
    data = move.dict(exclude_unset=True)
    response = supabase.table("stock_moves").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create stock move")
    
    created_move = response.data[0]

    # If state is 'done', update stock_quant
    if created_move['state'] == 'done':
        # Decrease source location
        # Increase dest location
        # For MVP, let's just assume we handle this logic separately or via a 'validate' endpoint
        pass

    return created_move

@router.get("/moves", response_model=List[StockMove])
def read_stock_moves(skip: int = 0, limit: int = 100):
    response = supabase.table("stock_moves").select("*").range(skip, skip + limit - 1).execute()
    return response.data

# --- Stock Quant ---
@router.get("/quants", response_model=List[StockQuant])
def read_stock_quants(skip: int = 0, limit: int = 100):
    response = supabase.table("stock_quant").select("*").range(skip, skip + limit - 1).execute()
    return response.data
