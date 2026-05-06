from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime

class EquipmentBase(BaseModel):
    name: str
    equipment_assign_to: str = "department"
    employee_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    technician_user_id: Optional[UUID] = None
    serial_no: Optional[str] = None
    effective_date: Optional[date] = None

class Equipment(EquipmentBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class MaintenanceRequestBase(BaseModel):
    name: str
    equipment_id: UUID
    user_id: Optional[UUID] = None
    technician_user_id: Optional[UUID] = None
    priority: str = "0"
    stage_id: str = "new"
    description: Optional[str] = None

class MaintenanceRequest(MaintenanceRequestBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
