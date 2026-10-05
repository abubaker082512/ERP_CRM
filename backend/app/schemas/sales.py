from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class SalesOrderLineBase(BaseModel):
    product_id: UUID
    name: Optional[str] = "Item"
    product_uom_qty: float = 1.0
    price_unit: float = 0.0
    discount: Optional[float] = 0.0
    price_tax: Optional[float] = 0.0
    price_subtotal: Optional[float] = 0.0
    price_total: Optional[float] = 0.0
    qty_delivered: Optional[float] = 0.0
    qty_invoiced: Optional[float] = 0.0

class SalesOrderLineCreate(BaseModel):
    product_id: UUID
    name: Optional[str] = "Item"
    product_uom_qty: float = 1.0
    price_unit: float = 0.0
    price_subtotal: Optional[float] = 0.0

class SalesOrderLine(BaseModel):
    id: Optional[UUID] = None
    order_id: Optional[UUID] = None
    product_id: UUID
    name: Optional[str] = "Item"
    product_uom_qty: float = 1.0
    price_unit: float = 0.0
    price_subtotal: Optional[float] = 0.0

    class Config:
        from_attributes = True

class SalesOrderBase(BaseModel):
    name: Optional[str] = "New"
    customer_name: Optional[str] = None
    contact_id: Optional[UUID] = None
    state: Optional[str] = 'draft'
    amount_total: Optional[float] = 0.0
    invoice_status: Optional[str] = 'no'
    validity_date: Optional[datetime] = None
    require_signature: bool = False
    require_payment: bool = False

class SalesOrderCreate(BaseModel):
    name: Optional[str] = "New"
    customer_name: Optional[str] = None
    contact_id: Optional[UUID] = None
    state: Optional[str] = "draft"
    amount_total: Optional[float] = 0.0
    lines: List[SalesOrderLineCreate] = []

class SalesOrderUpdate(BaseModel):
    name: Optional[str] = None
    customer_name: Optional[str] = None
    contact_id: Optional[UUID] = None
    state: Optional[str] = None
    amount_total: Optional[float] = None
    lines: Optional[List[SalesOrderLineCreate]] = None

class SalesOrder(BaseModel):
    id: UUID
    name: str
    customer_name: Optional[str] = None
    contact_id: Optional[UUID] = None
    state: Optional[str] = "draft"
    amount_total: float = 0.0
    invoice_status: Optional[str] = "no"
    created_at: datetime
    date_order: datetime
    lines: List[SalesOrderLine] = []

    class Config:
        from_attributes = True
