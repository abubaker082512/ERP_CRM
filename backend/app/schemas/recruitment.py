from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date

# Job
class JobBase(BaseModel):
    name: str
    department_id: Optional[UUID] = None
    no_of_recruitment: int = 1
    state: str = "recruit"
    description: Optional[str] = None

class JobCreate(JobBase):
    pass

class Job(JobBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Applicant
class ApplicantBase(BaseModel):
    name: str
    job_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    email_from: Optional[str] = None
    phone: Optional[str] = None
    stage_id: str = "new"
    salary_expected: float = 0.0
    salary_proposed: float = 0.0
    availability: Optional[date] = None

class ApplicantCreate(ApplicantBase):
    pass

class Applicant(ApplicantBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
