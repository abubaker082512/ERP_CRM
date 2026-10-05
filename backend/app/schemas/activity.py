from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class ActivityBase(BaseModel):
    module: str = Field(..., description="Module name e.g. crm, sales, contacts, inventory, accounting")
    entity_type: str = Field(..., description="Entity type e.g. opportunity, lead, sale_order, contact")
    entity_id: str = Field(..., description="Target record UUID or ID")
    entity_name: Optional[str] = Field(None, description="Readable record name")
    action: str = Field("note", description="Action code e.g. create, update, mark_lost, mark_won, convert_sale, note")
    description: str = Field(..., description="Human readable description of the event")
    user_email: Optional[str] = "admin@galaxy.erp"
    metadata: Optional[Dict[str, Any]] = None

class ActivityCreate(ActivityBase):
    pass

class Activity(ActivityBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
