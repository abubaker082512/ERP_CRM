from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class SalesOrderLineBase(BaseModel):
    product_id: UUID
    name: str
    product_uom_qty: float = 1.0
    price_unit: float = 0.0
    price_subtotal: float = 0.0

class SalesOrderLineCreate(SalesOrderLineBase):
    pass

class SalesOrderLine(SalesOrderLineBase):
    id: UUID
    order_id: UUID

    class Config:
        from_attributes = True

class SalesOrderBase(BaseModel):
    name: str
    customer_name: str
    state: Optional[str] = 'draft'
    amount_total: float = 0.0

class SalesOrderCreate(SalesOrderBase):
    lines: List[SalesOrderLineCreate] = []

class SalesOrder(SalesOrderBase):
    id: UUID
    created_at: datetime
    date_order: datetime
    lines: List[SalesOrderLine] = []

    class Config:
        from_attributes = True
