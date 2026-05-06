from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime

class TimesheetBase(BaseModel):
    name: str # Task description
    user_id: UUID
    project_id: Optional[UUID] = None
    task_id: Optional[UUID] = None
    date: date = date.today()
    unit_amount: float = 0.0 # Hours

class TimesheetCreate(TimesheetBase):
    pass

class Timesheet(TimesheetBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
