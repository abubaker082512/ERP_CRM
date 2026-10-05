from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class LeadBase(BaseModel):
    name: Optional[str] = "Lead"
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

class LeadCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    status: Optional[str] = "New"
    type: str = "lead"
    expected_revenue: Optional[float] = 0.0
    priority: Optional[int] = 0
    date_deadline: Optional[datetime] = None
    source: Optional[str] = None
    notes: Optional[str] = None

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    status: Optional[str] = None
    type: Optional[str] = None
    expected_revenue: Optional[float] = None
    priority: Optional[int] = None
    date_deadline: Optional[datetime] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    probability: Optional[float] = None
    sentiment_score: Optional[float] = None
    lost_reason: Optional[str] = None

class Lead(BaseModel):
    id: UUID
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    status: Optional[str] = "New"
    type: str = "lead"
    expected_revenue: Optional[float] = 0.0
    priority: Optional[int] = 0
    date_deadline: Optional[datetime] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    probability: Optional[float] = 0.0
    prorated_revenue: Optional[float] = 0.0
    lost_reason: Optional[str] = None
    sentiment_score: Optional[float] = 0.0
    created_at: datetime

    class Config:
        from_attributes = True
