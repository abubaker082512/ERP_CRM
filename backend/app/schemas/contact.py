from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ContactBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    type: Optional[str] = "customer"

class ContactCreate(ContactBase):
    pass

class ContactUpdate(ContactBase):
    pass

class Contact(ContactBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
