from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class AppointmentTypeBase(BaseModel):
    name: str
    duration: float = 1.0
    location: Optional[str] = None

class AppointmentTypeCreate(AppointmentTypeBase):
    pass

class AppointmentType(AppointmentTypeBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class AppointmentBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    appointment_type_id: Optional[UUID] = None
    start_time: datetime
    end_time: datetime
    state: str = "scheduled"

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
