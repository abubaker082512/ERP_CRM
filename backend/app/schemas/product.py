from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    list_price: float = 0.0
    cost_price: float = 0.0
    category: Optional[str] = None
    sku: Optional[str] = None
    quantity_on_hand: int = 0
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
