from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# Product (for website/e‑commerce)
class WebProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = 0.0
    sku: Optional[str] = None
    image_url: Optional[str] = None
    stock_qty: int = 0

class WebProductCreate(WebProductBase):
    pass

class WebProduct(WebProductBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Order
class OrderItemBase(BaseModel):
    product_id: UUID
    quantity: int = 1
    price_unit: float = 0.0

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: UUID
    order_id: UUID

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    partner_id: Optional[UUID] = None  # customer (contacts)
    state: str = "draft"  # draft, confirmed, shipped, done, cancelled
    total_amount: float = 0.0
    created_at: Optional[datetime] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate] = []

class Order(OrderBase):
    id: UUID
    items: List[OrderItem] = []

    class Config:
        from_attributes = True
