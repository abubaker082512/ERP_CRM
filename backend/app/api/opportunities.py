from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.opportunity import Opportunity, OpportunityCreate, OpportunityUpdate

from typing import List

router = APIRouter()

def _map_opportunity(row: dict) -> dict:
    """Map crm_lead DB row to Opportunity schema fields."""
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "expected_revenue": row.get("expected_revenue", 0.0),
        "stage": row.get("stage_id", "New"),
        "close_date": row.get("close_date"),
        "lead_id": row.get("lead_id"),
        "notes": row.get("notes"),
        "priority": row.get("priority", 0),
        "win_probability": row.get("probability", 0.0),
        "created_at": row.get("created_at"),
    }

@router.post("", response_model=Opportunity)
def create_opportunity(opportunity: OpportunityCreate, client: Client = Depends(get_supabase_client)):
    opp_data = {
        "name": opportunity.name,
        "expected_revenue": opportunity.expected_revenue,
        "stage_id": opportunity.stage or "New",
        "type": "opportunity",
        "priority": opportunity.priority,
        "notes": opportunity.notes,
    }
    if opportunity.close_date:
        opp_data["close_date"] = opportunity.close_date.isoformat()
    opp_data = {k: v for k, v in opp_data.items() if v is not None}

    response = client.table("crm_lead").insert(opp_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create opportunity")
    return _map_opportunity(response.data[0])

@router.get("", response_model=List[Opportunity])
def read_opportunities(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    response = client.table("crm_lead").select("*").eq("type", "opportunity").range(skip, skip + limit - 1).execute()
    return [_map_opportunity(r) for r in response.data]

@router.get("/{opp_id}", response_model=Opportunity)
def read_opportunity(opp_id: str, client: Client = Depends(get_supabase_client)):
    response = client.table("crm_lead").select("*").eq("id", opp_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return _map_opportunity(response.data[0])

@router.put("/{opp_id}", response_model=Opportunity)
def update_opportunity(opp_id: str, opportunity: OpportunityUpdate, client: Client = Depends(get_supabase_client)):
    update_data = {
        "name": opportunity.name,
        "expected_revenue": opportunity.expected_revenue,
        "stage_id": opportunity.stage,
        "priority": opportunity.priority,
        "notes": opportunity.notes,
        "probability": opportunity.win_probability,
    }
    if opportunity.close_date:
        update_data["close_date"] = opportunity.close_date.isoformat()
    update_data = {k: v for k, v in update_data.items() if v is not None}

    response = client.table("crm_lead").update(update_data).eq("id", opp_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return _map_opportunity(response.data[0])

@router.delete("/{opp_id}")
def delete_opportunity(opp_id: str, client: Client = Depends(get_supabase_client)):
    client.table("crm_lead").delete().eq("id", opp_id).execute()
    return {"message": "Opportunity deleted successfully"}

@router.post("/{opp_id}/convert-to-sale")
def convert_to_sale(opp_id: str, client: Client = Depends(get_supabase_client)):
    from datetime import datetime
    
    # 1. Fetch opportunity
    opp_resp = client.table("crm_lead").select("*").eq("id", opp_id).execute()
    if not opp_resp.data:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    opp = opp_resp.data[0]
    
    # 2. Create sales order (Draft)
    sale_name = f"SO/CRM/{opp['name'][:10].upper()}/{datetime.now().strftime('%Y%m%d%H%M%S')}"
    sale_data = {
        "name": sale_name,
        "state": "draft",
        "amount_total": float(opp.get("expected_revenue") or 0.0),
        "partner_id": opp.get("partner_id") or "00000000-0000-0000-0000-000000000000"
    }
    
    sale_resp = client.table("sale_order").insert(sale_data).execute()
    if not sale_resp.data:
        raise HTTPException(status_code=400, detail="Could not create sales order from opportunity")
        
    # 3. Update opportunity stage to Won
    client.table("crm_lead").update({
        "stage_id": "Won",
        "probability": 100.0
    }).eq("id", opp_id).execute()
    
    return {"message": "Opportunity converted to sales order", "sale_order": sale_resp.data[0]}

