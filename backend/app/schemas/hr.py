from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

# Department
class DepartmentBase(BaseModel):
    name: str
    manager_id: Optional[UUID] = None

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: UUID

    class Config:
        from_attributes = True

# Employee
class EmployeeBase(BaseModel):
    name: str
    job_title: Optional[str] = None
    department_id: Optional[UUID] = None
    work_email: Optional[str] = None
    work_phone: Optional[str] = None
    parent_id: Optional[UUID] = None # Manager
    coach_id: Optional[UUID] = None
    private_email: Optional[str] = None
    private_phone: Optional[str] = None
    gender: Optional[str] = None
    marital: Optional[str] = None
    image_url: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: UUID

    class Config:
        from_attributes = True
