from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# POS Config
class PosConfigBase(BaseModel):
    name: str
    active: bool = True
    currency_id: str = "USD"
    receipt_header: Optional[str] = None
    receipt_footer: Optional[str] = None

class PosConfigCreate(PosConfigBase):
    pass

class PosConfig(PosConfigBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# POS Session
class PosSessionBase(BaseModel):
    config_id: UUID
    user_id: Optional[UUID] = None
    state: str = "opening_control"
    start_cash: float = 0.0
    stop_cash: float = 0.0

class PosSessionCreate(PosSessionBase):
    pass

class PosSession(PosSessionBase):
    id: UUID
    start_at: datetime
    stop_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# POS Order
class PosOrderLineBase(BaseModel):
    product_id: UUID
    qty: float = 1.0
    price_unit: float = 0.0
    discount: float = 0.0

class PosOrderLineCreate(PosOrderLineBase):
    pass

class PosOrderLine(PosOrderLineBase):
    id: UUID
    order_id: UUID
    price_subtotal: float
    price_subtotal_incl: float

    class Config:
        from_attributes = True

class PosOrderBase(BaseModel):
    session_id: UUID
    partner_id: Optional[UUID] = None
    amount_total: float = 0.0
    amount_tax: float = 0.0
    amount_paid: float = 0.0
    amount_return: float = 0.0
    state: str = "draft"

class PosOrderCreate(PosOrderBase):
    lines: List[PosOrderLineCreate] = []

class PosOrder(PosOrderBase):
    id: UUID
    name: str
    date_order: datetime
    lines: List[PosOrderLine] = []

    class Config:
        from_attributes = True
