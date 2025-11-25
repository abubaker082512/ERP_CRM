from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class PurchaseOrderLineBase(BaseModel):
    product_id: UUID
    name: str
    product_qty: float = 1.0
    price_unit: float = 0.0
    price_subtotal: float = 0.0

class PurchaseOrderLineCreate(PurchaseOrderLineBase):
    pass

class PurchaseOrderLine(PurchaseOrderLineBase):
    id: UUID
    order_id: UUID

    class Config:
        from_attributes = True

class PurchaseOrderBase(BaseModel):
    name: str
    partner_id: UUID
    state: Optional[str] = 'draft'
    amount_total: float = 0.0

class PurchaseOrderCreate(PurchaseOrderBase):
    lines: List[PurchaseOrderLineCreate] = []

class PurchaseOrder(PurchaseOrderBase):
    id: UUID
    created_at: datetime
    date_order: datetime
    lines: List[PurchaseOrderLine] = []

    class Config:
        from_attributes = True
