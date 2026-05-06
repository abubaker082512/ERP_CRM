from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date as DateType, datetime

class ExpenseBase(BaseModel):
    name: str
    employee_id: Optional[UUID] = None
    product_id: Optional[UUID] = None
    total_amount: float = 0.0
    unit_amount: float = 0.0
    quantity: float = 1.0
    state: str = "draft"
    date: Optional[DateType] = None

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
