from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class SalesOrderLineBase(BaseModel):
    product_id: UUID
    name: str
    product_uom_qty: float = 1.0
    price_unit: float = 0.0
    discount: float = 0.0
    price_tax: float = 0.0
    price_subtotal: float = 0.0
    price_total: float = 0.0
    qty_delivered: float = 0.0
    qty_invoiced: float = 0.0

class SalesOrderLineCreate(SalesOrderLineBase):
    pass

class SalesOrderLine(SalesOrderLineBase):
    id: UUID
    order_id: UUID

    class Config:
        from_attributes = True

class SalesOrderBase(BaseModel):
    name: str
    customer_name: Optional[str] = None
    contact_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    payment_term_id: Optional[UUID] = None
    pricelist_id: Optional[UUID] = None
    fiscal_position_id: Optional[UUID] = None
    state: Optional[str] = 'draft'
    amount_total: float = 0.0
    invoice_status: Optional[str] = 'no'
    validity_date: Optional[datetime] = None
    require_signature: bool = False
    require_payment: bool = False

class SalesOrderCreate(SalesOrderBase):
    lines: List[SalesOrderLineCreate] = []

class SalesOrder(SalesOrderBase):
    id: UUID
    created_at: datetime
    date_order: datetime
    lines: List[SalesOrderLine] = []

    class Config:
        from_attributes = True
