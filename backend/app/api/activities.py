from fastapi import APIRouter, HTTPException, Depends, Query
from supabase import Client
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from app.api.deps import get_supabase_client
from app.core.supabase_client import get_service_role_client
from app.services.audit_service import audit_service
from app.schemas.activity import Activity, ActivityCreate

router = APIRouter()

@router.get("", response_model=List[Activity])
def get_activities(
    module: Optional[str] = Query(None, description="Filter by module"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    entity_id: Optional[str] = Query(None, description="Filter by entity id"),
    action: Optional[str] = Query(None, description="Filter by action"),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    client: Client = Depends(get_supabase_client)
):
    """Retrieve filtered activity/audit history records."""
    logs = audit_service.get_activities(
        module=module,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        limit=limit,
        skip=skip
    )
    return logs

@router.post("", response_model=Activity)
def create_activity(
    activity: ActivityCreate,
    client: Client = Depends(get_supabase_client)
):
    """Manually log a note or activity on an entity."""
    entry = audit_service.log_activity(
        module=activity.module,
        entity_type=activity.entity_type,
        entity_id=activity.entity_id,
        entity_name=activity.entity_name or "",
        action=activity.action or "note",
        description=activity.description,
        user_email=activity.user_email or "admin@galaxy.erp",
        metadata=activity.metadata
    )
    return entry

@router.get("/module/{module_name}", response_model=List[Activity])
def get_module_activities(
    module_name: str,
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    client: Client = Depends(get_supabase_client)
):
    """Get all activity history for a specific module (e.g. crm, sales, contacts, inventory)."""
    return audit_service.get_activities(module=module_name, limit=limit, skip=skip)

@router.get("/entity/{entity_id}", response_model=List[Activity])
def get_entity_activities(
    entity_id: str,
    limit: int = Query(100, ge=1, le=500),
    client: Client = Depends(get_supabase_client)
):
    """Get timeline/audit log for a specific record/entity."""
    return audit_service.get_activities(entity_id=entity_id, limit=limit)

@router.get("/stats")
def get_audit_stats(client: Client = Depends(get_supabase_client)):
    """Get aggregate activity statistics across all modules."""
    return audit_service.get_module_stats()
