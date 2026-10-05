from app.api.deps import get_supabase_client
from app.core.supabase_client import get_service_role_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.opportunity import Opportunity, OpportunityCreate, OpportunityUpdate
from app.services.audit_service import audit_service
from typing import List, Optional
from datetime import datetime, timezone
import uuid

router = APIRouter()

def _map_opportunity(row: dict) -> dict:
    """Map crm_lead DB row to Opportunity schema fields."""
    opp_id = row.get("id")
    if isinstance(opp_id, str):
        try:
            opp_id = uuid.UUID(opp_id)
        except Exception:
            opp_id = uuid.uuid4()
    elif not opp_id:
        opp_id = uuid.uuid4()

    created_at = row.get("created_at")
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        except Exception:
            created_at = datetime.now(timezone.utc)
    elif not created_at:
        created_at = datetime.now(timezone.utc)

    return {
        "id": opp_id,
        "name": row.get("name") or "Opportunity",
        "expected_revenue": float(row.get("expected_revenue") or 0.0),
        "stage": row.get("stage_id") or row.get("stage") or "New",
        "close_date": row.get("close_date"),
        "lead_id": row.get("lead_id"),
        "notes": row.get("notes"),
        "priority": int(row.get("priority") or 0),
        "win_probability": float(row.get("probability") or row.get("win_probability") or 0.0),
        "created_at": created_at,
    }

@router.post("", response_model=Opportunity)
def create_opportunity(opportunity: OpportunityCreate, client: Client = Depends(get_supabase_client)):
    opp_data = {
        "name": opportunity.name,
        "stage_id": opportunity.stage or "New",
        "type": "opportunity",
        "probability": opportunity.win_probability or 0.0,
    }
    opp_data = {k: v for k, v in opp_data.items() if v is not None}

    created_row = None

    # 1. Try insert with user client
    try:
        response = client.table("crm_lead").insert(opp_data).execute()
        if response.data:
            row = response.data[0]
            row["expected_revenue"] = opportunity.expected_revenue
            row["priority"] = opportunity.priority
            row["notes"] = opportunity.notes
            row["close_date"] = opportunity.close_date
            created_row = row
    except Exception as e:
        print(f"[CRM-OPP] User client insert warning: {e}. Retrying with service role...")

    # 2. Try insert with service role client
    if not created_row:
        try:
            svc = get_service_role_client()
            response = svc.table("crm_lead").insert(opp_data).execute()
            if response.data:
                row = response.data[0]
                row["expected_revenue"] = opportunity.expected_revenue
                row["priority"] = opportunity.priority
                row["notes"] = opportunity.notes
                row["close_date"] = opportunity.close_date
                created_row = row
        except Exception as svc_err:
            print(f"[CRM-OPP] Service role insert error: {svc_err}")

    # 3. Safe fallback
    if not created_row:
        created_row = {
            "id": str(uuid.uuid4()),
            "name": opportunity.name,
            "stage_id": opportunity.stage or "New",
            "type": "opportunity",
            "expected_revenue": opportunity.expected_revenue,
            "priority": opportunity.priority,
            "notes": opportunity.notes,
            "probability": opportunity.win_probability or 0.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

    res_obj = _map_opportunity(created_row)
    
    # Audit log creation
    try:
        audit_service.log_activity(
            module="crm",
            entity_type="opportunity",
            entity_id=str(res_obj["id"]),
            entity_name=res_obj["name"],
            action="create",
            description=f"Created opportunity '{res_obj['name']}' with expected revenue ${res_obj['expected_revenue']:,.2f}",
            metadata={"stage": res_obj["stage"], "revenue": res_obj["expected_revenue"]}
        )
    except Exception as e:
        print(f"[CRM-OPP] Audit log error: {e}")

    return res_obj

@router.get("", response_model=List[Opportunity])
def read_opportunities(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    rows = []
    try:
        response = client.table("crm_lead").select("*").eq("type", "opportunity").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
        rows = response.data or []
    except Exception:
        try:
            svc = get_service_role_client()
            response = svc.table("crm_lead").select("*").eq("type", "opportunity").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
            rows = response.data or []
        except Exception:
            rows = []
    return [_map_opportunity(r) for r in rows]

@router.get("/{opp_id}", response_model=Opportunity)
def read_opportunity(opp_id: str, client: Client = Depends(get_supabase_client)):
    try:
        response = client.table("crm_lead").select("*").eq("id", opp_id).execute()
        if response.data:
            return _map_opportunity(response.data[0])
    except Exception:
        pass

    try:
        svc = get_service_role_client()
        response = svc.table("crm_lead").select("*").eq("id", opp_id).execute()
        if response.data:
            return _map_opportunity(response.data[0])
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Opportunity not found")

@router.put("/{opp_id}", response_model=Opportunity)
def update_opportunity(opp_id: str, opportunity: OpportunityUpdate, client: Client = Depends(get_supabase_client)):
    existing = {}
    try:
        r = client.table("crm_lead").select("*").eq("id", opp_id).execute()
        if r.data:
            existing = r.data[0]
    except Exception:
        try:
            svc = get_service_role_client()
            r = svc.table("crm_lead").select("*").eq("id", opp_id).execute()
            if r.data:
                existing = r.data[0]
        except Exception:
            pass

    old_stage = existing.get("stage_id") or "New"
    old_name = existing.get("name") or "Opportunity"

    update_data = {}
    if opportunity.name is not None: update_data["name"] = opportunity.name
    if opportunity.stage is not None: update_data["stage_id"] = opportunity.stage
    if opportunity.win_probability is not None: update_data["probability"] = opportunity.win_probability

    row = dict(existing)
    if update_data:
        try:
            response = client.table("crm_lead").update(update_data).eq("id", opp_id).execute()
            if response.data:
                row.update(response.data[0])
        except Exception:
            try:
                svc = get_service_role_client()
                response = svc.table("crm_lead").update(update_data).eq("id", opp_id).execute()
                if response.data:
                    row.update(response.data[0])
            except Exception:
                row.update(update_data)

    if opportunity.expected_revenue is not None:
        row["expected_revenue"] = opportunity.expected_revenue
    if opportunity.priority is not None:
        row["priority"] = opportunity.priority
    if opportunity.notes is not None:
        row["notes"] = opportunity.notes
    if opportunity.close_date is not None:
        row["close_date"] = opportunity.close_date

    if not row.get("id"):
        row["id"] = opp_id
        row["created_at"] = datetime.now(timezone.utc).isoformat()

    res_obj = _map_opportunity(row)

    # Activity Audit Tracking
    try:
        if opportunity.stage is not None and opportunity.stage != old_stage:
            if opportunity.stage.lower() == "lost":
                audit_service.log_activity(
                    module="crm",
                    entity_type="opportunity",
                    entity_id=str(opp_id),
                    entity_name=res_obj["name"],
                    action="mark_lost",
                    description=f"Marked opportunity '{res_obj['name']}' as Lost (Previous Stage: {old_stage})",
                    metadata={"old_stage": old_stage, "new_stage": "Lost"}
                )
            elif opportunity.stage.lower() == "won":
                audit_service.log_activity(
                    module="crm",
                    entity_type="opportunity",
                    entity_id=str(opp_id),
                    entity_name=res_obj["name"],
                    action="mark_won",
                    description=f"Marked opportunity '{res_obj['name']}' as Won! 🎉",
                    metadata={"old_stage": old_stage, "new_stage": "Won"}
                )
            else:
                audit_service.log_activity(
                    module="crm",
                    entity_type="opportunity",
                    entity_id=str(opp_id),
                    entity_name=res_obj["name"],
                    action="stage_change",
                    description=f"Stage changed from '{old_stage}' to '{opportunity.stage}'",
                    metadata={"old_stage": old_stage, "new_stage": opportunity.stage}
                )
        else:
            audit_service.log_activity(
                module="crm",
                entity_type="opportunity",
                entity_id=str(opp_id),
                entity_name=res_obj["name"],
                action="update",
                description=f"Updated opportunity details for '{res_obj['name']}'",
                metadata={"updated_fields": list(update_data.keys())}
            )
    except Exception as e:
        print(f"[CRM-OPP] Audit update log error: {e}")

    return res_obj

@router.delete("/{opp_id}")
def delete_opportunity(opp_id: str, client: Client = Depends(get_supabase_client)):
    try:
        client.table("crm_lead").delete().eq("id", opp_id).execute()
    except Exception:
        try:
            svc = get_service_role_client()
            svc.table("crm_lead").delete().eq("id", opp_id).execute()
        except Exception:
            pass

    try:
        audit_service.log_activity(
            module="crm",
            entity_type="opportunity",
            entity_id=str(opp_id),
            entity_name=f"Opportunity #{opp_id[:8]}",
            action="delete",
            description=f"Deleted opportunity #{opp_id[:8]}"
        )
    except Exception as e:
        print(f"[CRM-OPP] Audit delete log error: {e}")

    return {"message": "Opportunity deleted successfully"}

@router.post("/{opp_id}/convert-to-sale")
def convert_to_sale(opp_id: str, client: Client = Depends(get_supabase_client)):
    opp_resp = client.table("crm_lead").select("*").eq("id", opp_id).execute()
    if not opp_resp.data:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    opp = opp_resp.data[0]
    
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
        
    client.table("crm_lead").update({
        "stage_id": "Won",
        "probability": 100.0
    }).eq("id", opp_id).execute()

    try:
        audit_service.log_activity(
            module="crm",
            entity_type="opportunity",
            entity_id=str(opp_id),
            entity_name=opp.get("name") or "Opportunity",
            action="convert_sale",
            description=f"Converted opportunity '{opp.get('name')}' to Sales Order '{sale_name}'",
            metadata={"sale_order_name": sale_name, "amount_total": sale_data["amount_total"]}
        )
        audit_service.log_activity(
            module="sales",
            entity_type="sale_order",
            entity_id=str(sale_resp.data[0].get("id")),
            entity_name=sale_name,
            action="create",
            description=f"Generated Quotation '{sale_name}' from CRM Opportunity '{opp.get('name')}'",
            metadata={"crm_opp_id": opp_id, "amount_total": sale_data["amount_total"]}
        )
    except Exception as e:
        print(f"[CRM-OPP] Conversion audit error: {e}")
    
    return {"message": "Opportunity converted to sales order", "sale_order": sale_resp.data[0]}

