from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import date

# Account
class AccountBase(BaseModel):
    code: str
    name: str
    type: str

class AccountCreate(AccountBase):
    pass

class Account(AccountBase):
    id: UUID

    class Config:
        from_attributes = True

# Journal
class JournalBase(BaseModel):
    name: str
    code: str
    type: str

class JournalCreate(JournalBase):
    pass

class Journal(JournalBase):
    id: UUID

    class Config:
        from_attributes = True

# Move Line
class MoveLineBase(BaseModel):
    account_id: UUID
    partner_id: Optional[UUID] = None
    name: Optional[str] = None
    debit: float = 0.0
    credit: float = 0.0

class MoveLineCreate(MoveLineBase):
    pass

class MoveLine(MoveLineBase):
    id: UUID
    move_id: UUID

    class Config:
        from_attributes = True

# Move (Invoice/Entry)
class MoveBase(BaseModel):
    name: str = '/'
    date: Optional[date] = None
    ref: Optional[str] = None
    journal_id: UUID
    partner_id: Optional[UUID] = None
    move_type: str
    state: str = 'draft'
    payment_state: str = 'not_paid'
    amount_total: float = 0.0
    amount_residual: float = 0.0

class MoveCreate(MoveBase):
    lines: List[MoveLineCreate] = []

class Move(MoveBase):
    id: UUID
    lines: List[MoveLine] = []

    class Config:
        from_attributes = True

# Payment
class PaymentBase(BaseModel):
    date: Optional[date] = None
    amount: float
    payment_type: str # inbound, outbound
    partner_id: UUID
    journal_id: UUID
    state: str = 'draft'
    ref: Optional[str] = None

class PaymentCreate(PaymentBase):
    invoice_ids: List[UUID] = []

class Payment(PaymentBase):
    id: UUID
    name: str

    class Config:
        from_attributes = True
