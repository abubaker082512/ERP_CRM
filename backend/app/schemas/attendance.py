from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class AttendanceBase(BaseModel):
    employee_id: UUID
    check_in: datetime
    check_out: Optional[datetime] = None
    worked_hours: float = 0.0

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
