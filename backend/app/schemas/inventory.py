from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

# Warehouse
class WarehouseBase(BaseModel):
    name: str
    code: str

class WarehouseCreate(WarehouseBase):
    pass

class Warehouse(WarehouseBase):
    id: UUID

    class Config:
        from_attributes = True

# Location
class LocationBase(BaseModel):
    name: str
    usage: str = 'internal'
    warehouse_id: Optional[UUID] = None

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: UUID

    class Config:
        from_attributes = True

# Stock Move
class StockMoveBase(BaseModel):
    name: str
    product_id: UUID
    quantity: float
    location_id: UUID
    location_dest_id: UUID
    state: str = 'draft'
    picking_id: Optional[UUID] = None
    lot_id: Optional[UUID] = None

class StockMoveCreate(StockMoveBase):
    pass

class StockMove(StockMoveBase):
    id: UUID
    created_at: datetime
    date: datetime

    class Config:
        from_attributes = True

# Stock Quant
class StockQuantBase(BaseModel):
    product_id: UUID
    location_id: UUID
    quantity: float

class StockQuant(StockQuantBase):
    id: UUID

    class Config:
        from_attributes = True

# Stock Picking
class StockPickingBase(BaseModel):
    name: Optional[str] = None
    partner_id: Optional[UUID] = None
    sale_id: Optional[UUID] = None
    purchase_id: Optional[UUID] = None
    state: str = 'draft'
    picking_type_code: str # outgoing, incoming, internal
    scheduled_date: Optional[datetime] = None
    origin: Optional[str] = None

class StockPickingCreate(StockPickingBase):
    pass

class StockPicking(StockPickingBase):
    id: UUID
    name: str
    created_at: datetime
    date_done: Optional[datetime] = None

    class Config:
        from_attributes = True
