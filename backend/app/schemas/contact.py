from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ContactBase(BaseModel):
    name: Optional[str] = "Contact"
    is_company: Optional[bool] = False
    company_name: Optional[str] = None
    parent_id: Optional[UUID] = None
    type: Optional[str] = "contact"
    email: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None

class ContactCreate(BaseModel):
    name: str
    is_company: Optional[bool] = False
    company_name: Optional[str] = None
    parent_id: Optional[UUID] = None
    type: Optional[str] = "contact"
    email: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    is_company: Optional[bool] = None
    company_name: Optional[str] = None
    parent_id: Optional[UUID] = None
    type: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None

class Contact(BaseModel):
    id: UUID
    name: str
    is_company: Optional[bool] = False
    company_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
