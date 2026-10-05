from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date

class OpportunityBase(BaseModel):
    name: Optional[str] = "Opportunity"
    expected_revenue: Optional[float] = 0.0
    stage: Optional[str] = "New"
    close_date: Optional[date] = None
    lead_id: Optional[UUID] = None
    notes: Optional[str] = None
    priority: Optional[int] = 0

class OpportunityCreate(BaseModel):
    name: str
    expected_revenue: Optional[float] = 0.0
    stage: Optional[str] = "New"
    close_date: Optional[date] = None
    lead_id: Optional[UUID] = None
    notes: Optional[str] = None
    priority: Optional[int] = 0
    win_probability: Optional[float] = 0.0

class OpportunityUpdate(BaseModel):
    name: Optional[str] = None
    expected_revenue: Optional[float] = None
    stage: Optional[str] = None
    close_date: Optional[date] = None
    lead_id: Optional[UUID] = None
    notes: Optional[str] = None
    priority: Optional[int] = None
    win_probability: Optional[float] = None

class Opportunity(BaseModel):
    id: UUID
    name: str
    expected_revenue: Optional[float] = 0.0
    stage: Optional[str] = "New"
    close_date: Optional[date] = None
    lead_id: Optional[UUID] = None
    notes: Optional[str] = None
    priority: Optional[int] = 0
    win_probability: Optional[float] = 0.0
    created_at: datetime

    class Config:
        from_attributes = True
