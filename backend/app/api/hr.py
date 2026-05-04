from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.hr import (
    Department, DepartmentCreate,
    Employee, EmployeeCreate
)

from typing import List

router = APIRouter()

# --- Departments ---
@router.post("/departments", response_model=Department)
def create_department(department: DepartmentCreate, client: Client = Depends(get_supabase_client)):
    data = department.dict(exclude_unset=True)
    response = client.table("hr_department").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create department")
    return response.data[0]

@router.get("/departments", response_model=List[Department])
def read_departments(client: Client = Depends(get_supabase_client)):
    response = client.table("hr_department").select("*").execute()
    return response.data

# --- Employees ---
@router.post("/employees", response_model=Employee)
def create_employee(employee: EmployeeCreate, client: Client = Depends(get_supabase_client)):
    data = employee.dict(exclude_unset=True)
    response = client.table("hr_employee").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create employee")
    return response.data[0]

@router.get("/employees", response_model=List[Employee])
def read_employees(client: Client = Depends(get_supabase_client)):
    response = client.table("hr_employee").select("*").execute()
    return response.data

@router.get("/employees/{employee_id}", response_model=Employee)
def read_employee(employee_id: str, client: Client = Depends(get_supabase_client)):
    response = client.table("hr_employee").select("*").eq("id", employee_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Employee not found")
    return response.data[0]

@router.put("/employees/{employee_id}", response_model=Employee)
def update_employee(employee_id: str, employee: EmployeeCreate, client: Client = Depends(get_supabase_client)):
    data = employee.dict(exclude_unset=True)
    # department_id from frontend comes as plain string, strip it if not a valid UUID
    if 'department_id' in data and data['department_id']:
        try:
            from uuid import UUID as _UUID
            _UUID(str(data['department_id']))
        except ValueError:
            data.pop('department_id')
    response = client.table("hr_employee").update(data).eq("id", employee_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Employee not found")
    return response.data[0]

@router.delete("/employees/{employee_id}")
def delete_employee(employee_id: str, client: Client = Depends(get_supabase_client)):
    response = client.table("hr_employee").delete().eq("id", employee_id).execute()
    return {"message": "Employee deleted"}
