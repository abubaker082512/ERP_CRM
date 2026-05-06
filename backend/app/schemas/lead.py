from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class LeadBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    status: Optional[str] = "New"
    type: str = "lead"
    expected_revenue: float = 0.0
    priority: int = 0
    date_deadline: Optional[datetime] = None
    source: Optional[str] = None
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(LeadBase):
    probability: Optional[float] = None
    sentiment_score: Optional[float] = None

class Lead(LeadBase):
    id: UUID
    created_at: datetime
    probability: Optional[float] = 0.0
    prorated_revenue: float = 0.0
    lost_reason: Optional[str] = None
    sentiment_score: Optional[float] = 0.0

    class Config:
        from_attributes = True
