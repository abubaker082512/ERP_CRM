from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import date


router = APIRouter()


class JobCreate(BaseModel):
    name: str
    department_id: Optional[str] = None
    no_of_recruitment: Optional[int] = 1
    state: Optional[str] = "recruit"
    description: Optional[str] = None


class JobUpdate(BaseModel):
    name: Optional[str] = None
    department_id: Optional[str] = None
    no_of_recruitment: Optional[int] = None
    state: Optional[str] = None
    description: Optional[str] = None


class ApplicantCreate(BaseModel):
    name: str
    job_id: Optional[str] = None
    department_id: Optional[str] = None
    email_from: Optional[str] = None
    phone: Optional[str] = None
    stage_id: Optional[str] = "new"
    salary_expected: Optional[float] = None
    salary_proposed: Optional[float] = None
    availability: Optional[date] = None
    resume_url: Optional[str] = None
    notes: Optional[str] = None


class ApplicantUpdate(BaseModel):
    name: Optional[str] = None
    job_id: Optional[str] = None
    department_id: Optional[str] = None
    email_from: Optional[str] = None
    phone: Optional[str] = None
    stage_id: Optional[str] = None
    salary_expected: Optional[float] = None
    salary_proposed: Optional[float] = None
    availability: Optional[date] = None
    resume_url: Optional[str] = None
    notes: Optional[str] = None


# ─── Jobs ────────────────────────────────────────────────────

@router.post("/jobs")
def create_job(job: JobCreate, client: Client = Depends(get_supabase_client)):
    data = job.dict(exclude_unset=True)
    resp = client.table("hr_job").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create job")
    return resp.data[0]


@router.get("/jobs")
def read_jobs(state: Optional[str] = None, client: Client = Depends(get_supabase_client)):
    query = client.table("hr_job").select("*, hr_department(name)").order("created_at", desc=True)
    if state:
        query = query.eq("state", state)
    resp = query.execute()
    return resp.data or []


@router.get("/jobs/{job_id}")
def read_job(job_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("hr_job").select("*, hr_department(name)").eq("id", job_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return resp.data[0]


@router.put("/jobs/{job_id}")
def update_job(job_id: str, job: JobUpdate, client: Client = Depends(get_supabase_client)):
    data = job.dict(exclude_unset=True)
    resp = client.table("hr_job").update(data).eq("id", job_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return resp.data[0]


@router.delete("/jobs/{job_id}")
def delete_job(job_id: str, client: Client = Depends(get_supabase_client)):
    client.table("hr_job").delete().eq("id", job_id).execute()
    return {"message": "Job deleted"}


# ─── Applicants ──────────────────────────────────────────────

@router.post("/applicants")
def create_applicant(applicant: ApplicantCreate, client: Client = Depends(get_supabase_client)):
    data = applicant.dict(exclude_unset=True)
    if data.get("availability"):
        data["availability"] = str(data["availability"])
    resp = client.table("hr_applicant").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create applicant")
    return resp.data[0]


@router.get("/applicants")
def read_applicants(
    job_id: Optional[str] = None,
    stage_id: Optional[str] = None,
    client: Client = Depends(get_supabase_client)
):
    query = client.table("hr_applicant").select("*, hr_job(name)").order("created_at", desc=True)
    if job_id:
        query = query.eq("job_id", job_id)
    if stage_id:
        query = query.eq("stage_id", stage_id)
    resp = query.execute()
    return resp.data or []


@router.get("/applicants/{applicant_id}")
def read_applicant(applicant_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("hr_applicant").select("*, hr_job(name), hr_department(name)").eq("id", applicant_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Applicant not found")
    return resp.data[0]


@router.put("/applicants/{applicant_id}")
def update_applicant(applicant_id: str, applicant: ApplicantUpdate, client: Client = Depends(get_supabase_client)):
    data = applicant.dict(exclude_unset=True)
    if data.get("availability"):
        data["availability"] = str(data["availability"])
    resp = client.table("hr_applicant").update(data).eq("id", applicant_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Applicant not found")
    return resp.data[0]


@router.post("/applicants/{applicant_id}/hire")
def hire_applicant(applicant_id: str, client: Client = Depends(get_supabase_client)):
    """Move applicant to hired stage and auto-create an hr_employee record."""
    appl_resp = client.table("hr_applicant").select("*").eq("id", applicant_id).execute()
    if not appl_resp.data:
        raise HTTPException(status_code=404, detail="Applicant not found")
    applicant = appl_resp.data[0]

    # Update applicant stage
    client.table("hr_applicant").update({"stage_id": "hired"}).eq("id", applicant_id).execute()

    # Auto-create employee from applicant data
    employee_data = {
        "name": applicant["name"],
        "work_email": applicant.get("email_from"),
        "work_phone": applicant.get("phone"),
        "department_id": applicant.get("department_id"),
    }
    employee_data = {k: v for k, v in employee_data.items() if v is not None}
    emp_resp = client.table("hr_employee").insert(employee_data).execute()

    return {
        "message": "Applicant hired and employee record created",
        "applicant_id": applicant_id,
        "employee": emp_resp.data[0] if emp_resp.data else None
    }


@router.delete("/applicants/{applicant_id}")
def delete_applicant(applicant_id: str, client: Client = Depends(get_supabase_client)):
    client.table("hr_applicant").delete().eq("id", applicant_id).execute()
    return {"message": "Applicant deleted"}
