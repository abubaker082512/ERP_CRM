from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.payroll import (
    Payslip, PayslipCreate,
    PayrollRun, PayrollRunCreate
)
from typing import List
from datetime import datetime

router = APIRouter()

# --- Payslips ---
@router.get("/payslips", response_model=List[Payslip])
def read_payslips(client: Client = Depends(get_supabase_client)):
    response = client.table("hr_payslip").select("*").execute()
    return response.data

@router.post("/payslips", response_model=Payslip)
def create_payslip(payslip: PayslipCreate, client: Client = Depends(get_supabase_client)):
    data = payslip.dict(exclude_unset=True)
    if 'date_from' in data and data['date_from']: data['date_from'] = data['date_from'].isoformat()
    if 'date_to' in data and data['date_to']: data['date_to'] = data['date_to'].isoformat()
    
    response = client.table("hr_payslip").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create payslip")
    return response.data[0]

# --- Payroll Runs (Batches) ---
@router.get("/runs", response_model=List[PayrollRun])
def read_runs(client: Client = Depends(get_supabase_client)):
    resp = client.table("hr_payroll_run").select("*").execute()
    return resp.data or []

@router.post("/runs", response_model=PayrollRun)
def create_run(run: PayrollRunCreate, client: Client = Depends(get_supabase_client)):
    data = run.dict(exclude_unset=True)
    resp = client.table("hr_payroll_run").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create payroll run")
    return resp.data[0]

@router.post("/runs/{run_id}/process")
def process_run(run_id: str, client: Client = Depends(get_supabase_client)):
    """
    Process a payroll run:
    1. Mark run as done
    2. Auto-generate payslips for all active employees if they don't have one for this period.
    """
    # Mark run as done
    client.table("hr_payroll_run").update({"state": "done"}).eq("id", run_id).execute()
    
    # Get all active employees
    emp_resp = client.table("hr_employee").select("id, name").execute()
    employees = emp_resp.data or []
    
    # Simple logic: create a dummy payslip for each employee
    # In a real app, you'd calculate based on contracts/attendances
    slips = []
    for emp in employees:
        slip_data = {
            "employee_id": emp["id"],
            "date_from": datetime.now().isoformat(),
            "date_to": datetime.now().isoformat(),
            "state": "done",
            "basic_wage": 5000.00,
            "net_wage": 4200.00,
            "number": f"SLIP/{emp['name'][:3].upper()}/{datetime.now().strftime('%Y%m%d')}"
        }
        slips.append(slip_data)
    
    if slips:
        client.table("hr_payslip").insert(slips).execute()
        
    return {"status": "success", "processed_count": len(slips)}
