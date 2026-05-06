from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime

class ProjectBase(BaseModel):
    name: str
    user_id: Optional[UUID] = None # Manager
    partner_id: Optional[UUID] = None # Customer
    color: int = 0

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectTaskBase(BaseModel):
    name: str
    project_id: UUID
    user_id: Optional[UUID] = None
    stage_id: str = "todo"
    priority: str = "0"
    date_deadline: Optional[date] = None
    description: Optional[str] = None

class ProjectTaskCreate(ProjectTaskBase):
    pass

class ProjectTask(ProjectTaskBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
