from fastapi import APIRouter, HTTPException
from typing import List

from app.schemas.payroll import (
    SalaryStructure, SalaryStructureCreate,
    Payslip, PayslipCreate,
    PayrollRun, PayrollRunCreate,
)
from app.core.supabase_client import supabase

router = APIRouter()

# --- Salary Structures ---
@router.post("/salary_structures", response_model=SalaryStructure)
def create_salary_structure(ss: SalaryStructureCreate):
    data = ss.dict(exclude_unset=True)
    resp = supabase.table("payroll_salary_structure").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create salary structure")
    return resp.data[0]

@router.get("/salary_structures", response_model=List[SalaryStructure])
def read_salary_structures():
    resp = supabase.table("payroll_salary_structure").select("*").execute()
    return resp.data

# --- Payslips ---
@router.post("/payslips", response_model=Payslip)
def create_payslip(p: PayslipCreate):
    data = p.dict(exclude_unset=True)
    resp = supabase.table("payroll_payslip").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create payslip")
    return resp.data[0]

@router.get("/payslips", response_model=List[Payslip])
def read_payslips():
    resp = supabase.table("payroll_payslip").select("*").execute()
    return resp.data

# --- Payroll Runs ---
@router.post("/runs", response_model=PayrollRun)
def create_run(run: PayrollRunCreate):
    data = run.dict(exclude_unset=True)
    resp = supabase.table("payroll_run").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create payroll run")
    return resp.data[0]

@router.get("/runs", response_model=List[PayrollRun])
def read_runs():
    resp = supabase.table("payroll_run").select("*").execute()
    return resp.data
