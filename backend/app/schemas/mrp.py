from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# BOM Line
class BomLineBase(BaseModel):
    product_id: UUID
    product_qty: float = 1.0

class BomLineCreate(BomLineBase):
    pass

class BomLine(BomLineBase):
    id: UUID
    bom_id: UUID

    class Config:
        from_attributes = True

# BOM
class BomBase(BaseModel):
    product_id: UUID
    code: Optional[str] = None
    quantity: float = 1.0

class BomCreate(BomBase):
    lines: List[BomLineCreate] = []

class Bom(BomBase):
    id: UUID
    lines: List[BomLine] = []

    class Config:
        from_attributes = True

# Manufacturing Order
class ProductionBase(BaseModel):
    name: str = 'New'
    product_id: UUID
    product_qty: float = 1.0
    bom_id: Optional[UUID] = None
    state: str = 'draft'

class ProductionCreate(ProductionBase):
    pass

class Production(ProductionBase):
    id: UUID
    date_planned_start: datetime

    class Config:
        from_attributes = True
