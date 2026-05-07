from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ContactBase(BaseModel):
    name: str
    is_company: Optional[bool] = False
    parent_id: Optional[UUID] = None
    type: Optional[str] = "contact" # contact, invoice, delivery, private
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

class ContactCreate(ContactBase):
    pass

class ContactUpdate(ContactBase):
    pass

class Contact(ContactBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
