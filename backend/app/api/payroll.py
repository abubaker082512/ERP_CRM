from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import date


router = APIRouter()


class SalaryStructureCreate(BaseModel):
    name: str
    basic_wage: Optional[float] = 0.0
    allowances: Optional[float] = 0.0
    deductions: Optional[float] = 0.0


class PayslipCreate(BaseModel):
    employee_id: str
    run_id: Optional[str] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    struct_id: Optional[str] = None
    gross_wage: Optional[float] = 0.0
    net_wage: Optional[float] = 0.0


class PayrollRunCreate(BaseModel):
    name: str
    run_date: Optional[date] = None
    date_start: Optional[date] = None
    date_end: Optional[date] = None
    state: Optional[str] = "draft"


# ─── Salary Structures ───────────────────────────────────────

@router.post("/salary_structures")
def create_salary_structure(ss: SalaryStructureCreate, client: Client = Depends(get_supabase_client)):
    data = ss.dict(exclude_unset=True)
    resp = client.table("payroll_salary_structure").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create salary structure")
    return resp.data[0]


@router.get("/salary_structures")
def read_salary_structures(client: Client = Depends(get_supabase_client)):
    resp = client.table("payroll_salary_structure").select("*").execute()
    return resp.data or []


@router.put("/salary_structures/{ss_id}")
def update_salary_structure(ss_id: str, ss: SalaryStructureCreate, client: Client = Depends(get_supabase_client)):
    data = ss.dict(exclude_unset=True)
    resp = client.table("payroll_salary_structure").update(data).eq("id", ss_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Salary structure not found")
    return resp.data[0]


@router.delete("/salary_structures/{ss_id}")
def delete_salary_structure(ss_id: str, client: Client = Depends(get_supabase_client)):
    client.table("payroll_salary_structure").delete().eq("id", ss_id).execute()
    return {"message": "Salary structure deleted"}


# ─── Payslips ────────────────────────────────────────────────

@router.post("/payslips")
def create_payslip(p: PayslipCreate, client: Client = Depends(get_supabase_client)):
    data = {k: (str(v) if isinstance(v, date) else v) for k, v in p.dict(exclude_unset=True).items()}
    # Auto-calculate net from gross if not provided
    if data.get("gross_wage") and not data.get("net_wage"):
        data["net_wage"] = data["gross_wage"]
    resp = client.table("payroll_payslip").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create payslip")
    return resp.data[0]


@router.get("/payslips")
def read_payslips(
    employee_id: Optional[str] = None,
    run_id: Optional[str] = None,
    client: Client = Depends(get_supabase_client)
):
    query = client.table("payroll_payslip").select("*, hr_employee(name), payroll_salary_structure(name, basic_wage)").order("created_at", desc=True)
    if employee_id:
        query = query.eq("employee_id", employee_id)
    if run_id:
        query = query.eq("run_id", run_id)
    resp = query.execute()
    return resp.data or []


@router.get("/payslips/{payslip_id}")
def read_payslip(payslip_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("payroll_payslip").select("*, hr_employee(name, job_title, work_email), payroll_salary_structure(name, basic_wage, allowances, deductions)").eq("id", payslip_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Payslip not found")
    return resp.data[0]


@router.delete("/payslips/{payslip_id}")
def delete_payslip(payslip_id: str, client: Client = Depends(get_supabase_client)):
    client.table("payroll_payslip").delete().eq("id", payslip_id).execute()
    return {"message": "Payslip deleted"}


# ─── Payroll Runs ─────────────────────────────────────────────

@router.post("/runs")
def create_run(run: PayrollRunCreate, client: Client = Depends(get_supabase_client)):
    data = {k: (str(v) if isinstance(v, date) else v) for k, v in run.dict(exclude_unset=True).items()}
    resp = client.table("payroll_run").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create payroll run")
    return resp.data[0]


@router.get("/runs")
def read_runs(client: Client = Depends(get_supabase_client)):
    resp = client.table("payroll_run").select("*").order("created_at", desc=True).execute()
    return resp.data or []


@router.get("/runs/{run_id}")
def read_run(run_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("payroll_run").select("*").eq("id", run_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Payroll run not found")
    run = resp.data[0]
    # Attach payslips
    payslips = client.table("payroll_payslip").select("*, hr_employee(name)").eq("run_id", run_id).execute()
    run["payslips"] = payslips.data or []
    return run


@router.post("/runs/{run_id}/process")
def process_run(run_id: str, client: Client = Depends(get_supabase_client)):
    """Bulk-generate payslips for all active employees for this payroll run."""
    run_resp = client.table("payroll_run").select("*").eq("id", run_id).execute()
    if not run_resp.data:
        raise HTTPException(status_code=404, detail="Payroll run not found")
    run = run_resp.data[0]

    # Get all active employees
    employees = client.table("hr_employee").select("*").eq("active", True).execute().data or []

    # Get default salary structure (first one if not linked to employee)
    struct_resp = client.table("payroll_salary_structure").select("*").limit(1).execute()
    default_struct = struct_resp.data[0] if struct_resp.data else None

    payslips_created = []
    for emp in employees:
        # Skip if payslip already exists for this run/employee
        existing = client.table("payroll_payslip").select("id").eq("run_id", run_id).eq("employee_id", emp["id"]).execute()
        if existing.data:
            continue

        basic_wage = default_struct["basic_wage"] if default_struct else 0.0
        allowances = default_struct.get("allowances", 0.0) if default_struct else 0.0
        deductions = default_struct.get("deductions", 0.0) if default_struct else 0.0
        gross_wage = basic_wage + allowances
        net_wage = gross_wage - deductions

        slip_data = {
            "employee_id": emp["id"],
            "run_id": run_id,
            "date_from": run.get("date_start"),
            "date_to": run.get("date_end"),
            "struct_id": default_struct["id"] if default_struct else None,
            "gross_wage": gross_wage,
            "net_wage": net_wage,
            "state": "draft"
        }
        slip_data = {k: v for k, v in slip_data.items() if v is not None}
        slip_resp = client.table("payroll_payslip").insert(slip_data).execute()
        if slip_resp.data:
            payslips_created.append(slip_resp.data[0])

    # Mark run as processed
    client.table("payroll_run").update({"state": "done"}).eq("id", run_id).execute()

    return {
        "message": f"Payroll processed. {len(payslips_created)} payslips generated.",
        "payslips_created": len(payslips_created)
    }
