from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class PlanningSlotBase(BaseModel):
    employee_id: Optional[UUID] = None
    role_id: Optional[UUID] = None
    start_datetime: datetime
    end_datetime: datetime
    is_published: bool = False

class PlanningSlotCreate(PlanningSlotBase):
    pass

class PlanningSlot(PlanningSlotBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
