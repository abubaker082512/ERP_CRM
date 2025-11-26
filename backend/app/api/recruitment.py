from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.recruitment import (
    Job, JobCreate,
    Applicant, ApplicantCreate
)
from app.core.supabase_client import supabase

router = APIRouter()

# --- Jobs ---
@router.post("/jobs", response_model=Job)
def create_job(job: JobCreate):
    data = job.dict(exclude_unset=True)
    resp = supabase.table("hr_job").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create job")
    return resp.data[0]

@router.get("/jobs", response_model=List[Job])
def read_jobs():
    resp = supabase.table("hr_job").select("*").execute()
    return resp.data

# --- Applicants ---
@router.post("/applicants", response_model=Applicant)
def create_applicant(applicant: ApplicantCreate):
    data = applicant.dict(exclude_unset=True)
    # Convert date to string if needed, but Pydantic/Supabase usually handle it
    if data.get('availability'):
        data['availability'] = str(data['availability'])
        
    resp = supabase.table("hr_applicant").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create applicant")
    return resp.data[0]

@router.get("/applicants", response_model=List[Applicant])
def read_applicants():
    resp = supabase.table("hr_applicant").select("*").execute()
    return resp.data
