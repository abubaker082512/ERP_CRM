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

@router.get("/payslips", response_model=List[Payslip])
def read_payslips(client: Client = Depends(get_supabase_client)):
    response = client.table("hr_payslip").select("*").execute()
    return response.data

@router.post("/payslips", response_model=Payslip)
def create_payslip(payslip: PayslipCreate, client: Client = Depends(get_supabase_client)):
    data = payslip.dict(exclude_unset=True)
    # Convert dates to string for Supabase
    if 'date_from' in data: data['date_from'] = data['date_from'].isoformat()
    if 'date_to' in data: data['date_to'] = data['date_to'].isoformat()
    
    response = client.table("hr_payslip").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create payslip")
    return response.data[0]

@router.put("/payslips/{payslip_id}", response_model=Payslip)
def update_payslip(payslip_id: str, state: str, client: Client = Depends(get_supabase_client)):
    response = client.table("hr_payslip").update({"state": state}).eq("id", payslip_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Payslip not found")
    return response.data[0]
