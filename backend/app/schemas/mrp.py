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
    reservation_state: str = 'waiting'

class ProductionCreate(ProductionBase):
    pass

class Production(ProductionBase):
    id: UUID
    date_planned_start: datetime

    class Config:
        from_attributes = True

# Work Center
class WorkCenterBase(BaseModel):
    name: str
    code: Optional[str] = None
    capacity: float = 1.0
    time_efficiency: float = 100.0
    oee_target: float = 90.0
    cost_per_hour: float = 0.0

class WorkCenterCreate(WorkCenterBase):
    pass

class WorkCenter(WorkCenterBase):
    id: UUID

    class Config:
        from_attributes = True

# Work Order
class WorkOrderBase(BaseModel):
    name: str
    production_id: UUID
    workcenter_id: UUID
    state: str = 'pending'
    duration_expected: float = 60.0
    duration: float = 0.0
    date_start: Optional[datetime] = None
    date_finished: Optional[datetime] = None

class WorkOrderCreate(WorkOrderBase):
    pass

class WorkOrder(WorkOrderBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
