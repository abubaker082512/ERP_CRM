from fastapi import APIRouter, HTTPException
from app.schemas.hr import (
    Department, DepartmentCreate,
    Employee, EmployeeCreate
)
from app.core.supabase_client import supabase
from typing import List

router = APIRouter()

# --- Departments ---
@router.post("/departments", response_model=Department)
def create_department(department: DepartmentCreate):
    data = department.dict(exclude_unset=True)
    response = supabase.table("hr_department").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create department")
    return response.data[0]

@router.get("/departments", response_model=List[Department])
def read_departments():
    response = supabase.table("hr_department").select("*").execute()
    return response.data

# --- Employees ---
@router.post("/employees", response_model=Employee)
def create_employee(employee: EmployeeCreate):
    data = employee.dict(exclude_unset=True)
    response = supabase.table("hr_employee").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create employee")
    return response.data[0]

@router.get("/employees", response_model=List[Employee])
def read_employees():
    response = supabase.table("hr_employee").select("*").execute()
    return response.data
