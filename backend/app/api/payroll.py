from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from app.schemas.payroll import (
    SalaryStructure, SalaryStructureCreate,
    Payslip, PayslipCreate,
    PayrollRun, PayrollRunCreate,
)


router = APIRouter()

# --- Salary Structures ---
@router.post("/salary_structures", response_model=SalaryStructure)
def create_salary_structure(ss: SalaryStructureCreate, client: Client = Depends(get_supabase_client)):
    # Map to payroll_salary_structure columns (name, basic_wage)
    data = {
        "name": ss.name,
        "basic_wage": ss.base_salary,
    }
    resp = client.table("payroll_salary_structure").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create salary structure")
    return _map_salary_structure(resp.data[0])

@router.get("/salary_structures", response_model=List[SalaryStructure])
def read_salary_structures(client: Client = Depends(get_supabase_client)):
    resp = client.table("payroll_salary_structure").select("*").execute()
    return [_map_salary_structure(r) for r in resp.data]

# --- Payslips ---
@router.post("/payslips", response_model=Payslip)
def create_payslip(p: PayslipCreate, client: Client = Depends(get_supabase_client)):
    # Map to payroll_payslip columns (date_from, date_to, net_wage, struct_id)
    data = {
        "employee_id": str(p.employee_id),
        "date_from": p.period_start.isoformat() if p.period_start else None,
        "date_to": p.period_end.isoformat() if p.period_end else None,
        "net_wage": p.net_amount,
        "state": "draft",
    }
    if p.salary_structure_id:
        data["struct_id"] = str(p.salary_structure_id)
    data = {k: v for k, v in data.items() if v is not None}
    resp = client.table("payroll_payslip").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create payslip")
    return _map_payslip(resp.data[0])

@router.get("/payslips", response_model=List[Payslip])
def read_payslips(client: Client = Depends(get_supabase_client)):
    resp = client.table("payroll_payslip").select("*").execute()
    return [_map_payslip(r) for r in resp.data]

# --- Payroll Runs ---
@router.post("/runs", response_model=PayrollRun)
def create_run(run: PayrollRunCreate, client: Client = Depends(get_supabase_client)):
    data = {
        "name": run.name,
        "state": run.state or "draft",
    }
    if run.run_date:
        data["run_date"] = run.run_date.isoformat()
    resp = client.table("payroll_run").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create payroll run")
    return resp.data[0]

@router.get("/runs", response_model=List[PayrollRun])
def read_runs(client: Client = Depends(get_supabase_client)):
    resp = client.table("payroll_run").select("*").execute()
    return resp.data

# --- Helpers ---
def _map_salary_structure(row: dict) -> dict:
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "base_salary": row.get("basic_wage", 0.0),
        "allowances": 0.0,
        "deductions": 0.0,
        "currency": "USD",
    }

def _map_payslip(row: dict) -> dict:
    return {
        "id": row.get("id"),
        "employee_id": row.get("employee_id"),
        "period_start": row.get("date_from"),
        "period_end": row.get("date_to"),
        "gross_amount": row.get("net_wage", 0.0),
        "net_amount": row.get("net_wage", 0.0),
        "salary_structure_id": row.get("struct_id"),
        "generated_at": row.get("created_at") or row.get("date_from"),
    }
