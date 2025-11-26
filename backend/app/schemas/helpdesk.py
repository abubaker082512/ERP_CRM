from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# Ticket
class TicketBase(BaseModel):
    title: str
    description: Optional[str] = None
    partner_id: Optional[UUID] = None  # customer contact
    state: str = "new"  # new, open, pending, solved, closed
    priority: str = "medium"  # low, medium, high, urgent
    category: Optional[str] = None
    sla_deadline: Optional[datetime] = None
    assigned_to: Optional[UUID] = None

class TicketCreate(TicketBase):
    pass

class Ticket(TicketBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Message
class MessageBase(BaseModel):
    ticket_id: UUID
    author_id: Optional[UUID] = None  # employee or partner
    content: str
    is_internal: bool = False

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
