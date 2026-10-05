from fastapi import APIRouter, Depends, HTTPException, Query, Request
from supabase import Client
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import uuid
from datetime import datetime, timezone

from app.api.deps import get_supabase_client
from app.services.lead_bank_service import lead_bank_service
from app.services.audit_service import audit_service

router = APIRouter()

class LeadImportRequest(BaseModel):
    lead_ids: List[str]
    target_stage: Optional[str] = "New"
    estimated_revenue: Optional[float] = 10000.0

class EmailVerifyRequest(BaseModel):
    first_name: str
    last_name: str
    domain: str

@router.get("")
def search_lead_bank(
    query: Optional[str] = Query(None, description="Search keyword"),
    country: Optional[str] = Query(None, description="Filter country"),
    industry: Optional[str] = Query(None, description="Filter industry"),
    job_title: Optional[str] = Query(None, description="Filter job title"),
    has_email: bool = Query(False),
    has_phone: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    client: Client = Depends(get_supabase_client)
):
    """
    Search internal Global Leads Bank with zero external API fees.
    """
    return lead_bank_service.search_leads(
        query=query,
        country=country,
        industry=industry,
        job_title=job_title,
        has_email=has_email,
        has_phone=has_phone,
        limit=limit,
        skip=skip
    )

@router.get("/stats")
def get_lead_bank_stats(client: Client = Depends(get_supabase_client)):
    """
    Get aggregate overview of internal lead repository.
    """
    return lead_bank_service.get_stats()

@router.post("/import")
def import_leads_to_crm(
    payload: LeadImportRequest,
    client: Client = Depends(get_supabase_client)
):
    """
    1-Click import selected global leads into the tenant's private CRM Pipeline
    and Contacts directory with strict tenant isolation.
    """
    imported = []
    all_leads = {l["id"]: l for l in lead_bank_service.leads}

    for lid in payload.lead_ids:
        lead_data = all_leads.get(lid)
        if not lead_data:
            continue

        lead_id = str(uuid.uuid4())
        partner_id = str(uuid.uuid4())

        # 1. Insert into Contact/Partner directory
        try:
            client.table("res_partner").insert({
                "id": partner_id,
                "name": lead_data["contact_name"],
                "company_name": lead_data["company_name"],
                "email": lead_data["email"],
                "phone": lead_data["phone"],
                "website": lead_data.get("website"),
                "city": lead_data.get("city"),
                "country": lead_data.get("country"),
                "is_company": False,
                "function": lead_data.get("job_title"),
                "active": True
            }).execute()
        except Exception as e:
            # Continue if partner already exists
            pass

        # 2. Insert into CRM Leads Pipeline
        try:
            crm_entry = {
                "id": lead_id,
                "name": f"{lead_data['company_name']} - {lead_data['industry']}",
                "partner_name": lead_data["contact_name"],
                "partner_id": partner_id,
                "email_from": lead_data["email"],
                "phone": lead_data["phone"],
                "website": lead_data.get("website"),
                "expected_revenue": payload.estimated_revenue,
                "stage_id": payload.target_stage or "New",
                "type": "opportunity",
                "probability": 25.0,
                "street": lead_data.get("city"),
                "country_id": lead_data.get("country"),
                "priority": "2",
                "active": True
            }
            client.table("crm_lead").insert(crm_entry).execute()
            imported.append(lead_data["company_name"])

            # Log audit activity
            try:
                audit_service.log_activity(
                    module="crm",
                    entity_type="crm_lead",
                    entity_id=lead_id,
                    entity_name=crm_entry["name"],
                    action="imported",
                    description=f"Imported lead from Global Lead Bank: {lead_data['contact_name']} ({lead_data['company_name']})",
                    user_email="user@galaxy.erp"
                )
            except Exception:
                pass

        except Exception as e:
            print(f"[ERROR] Failed to import lead {lid}: {e}")

    return {
        "success": True,
        "imported_count": len(imported),
        "imported_companies": imported,
        "message": f"Successfully imported {len(imported)} lead(s) into your CRM Pipeline."
    }

@router.post("/verify-email")
def verify_email_permutation(payload: EmailVerifyRequest):
    """
    Free MX & format validation without third-party API costs.
    """
    return lead_bank_service.verify_and_generate_email(
        first_name=payload.first_name,
        last_name=payload.last_name,
        domain=payload.domain
    )
