from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date

class OpportunityBase(BaseModel):
    name: str
    expected_revenue: Optional[float] = 0.0
    stage: Optional[str] = "New"
    close_date: Optional[date] = None
    lead_id: Optional[UUID] = None

class OpportunityCreate(OpportunityBase):
    pass

class OpportunityUpdate(OpportunityBase):
    win_probability: Optional[float] = None

class Opportunity(OpportunityBase):
    id: UUID
    created_at: datetime
    win_probability: Optional[float] = 0.0

    class Config:
        from_attributes = True
