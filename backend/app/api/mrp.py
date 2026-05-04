from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.mrp import (
    Bom, BomCreate,
    Production, ProductionCreate
)

from typing import List

router = APIRouter()

# --- BOMs ---
@router.post("/boms", response_model=Bom)
def create_bom(bom: BomCreate, client: Client = Depends(get_supabase_client)):
    # 1. Create BOM
    bom_data = bom.dict(exclude={'lines'}, exclude_unset=True)
    response = client.table("mrp_bom").insert(bom_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create BOM")
    
    created_bom = response.data[0]
    bom_id = created_bom['id']

    # 2. Create BOM Lines
    if bom.lines:
        lines_data = []
        for line in bom.lines:
            l_data = line.dict()
            l_data['bom_id'] = bom_id
            lines_data.append(l_data)
        
        lines_response = client.table("mrp_bom_line").insert(lines_data).execute()
        created_bom['lines'] = lines_response.data

    return created_bom

@router.get("/boms", response_model=List[Bom])
def read_boms(client: Client = Depends(get_supabase_client)):
    response = client.table("mrp_bom").select("*").execute()
    return response.data

# --- Manufacturing Orders ---
@router.post("/production", response_model=Production)
def create_production(production: ProductionCreate, client: Client = Depends(get_supabase_client)):
    data = production.dict(exclude_unset=True)
    response = client.table("mrp_production").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create manufacturing order")
    return response.data[0]

@router.get("/production", response_model=List[Production])
def read_production(client: Client = Depends(get_supabase_client)):
    response = client.table("mrp_production").select("*").execute()
    return response.data
