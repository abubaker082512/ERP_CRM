from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.expenses import Expense, ExpenseCreate
from typing import List

router = APIRouter()

@router.get("/", response_model=List[Expense])
def read_expenses(client: Client = Depends(get_supabase_client)):
    resp = client.table("hr_expense").select("*").execute()
    return resp.data or []

@router.post("/", response_model=Expense)
def create_expense(expense: ExpenseCreate, client: Client = Depends(get_supabase_client)):
    data = expense.dict(exclude_unset=True)
    if 'date' in data: data['date'] = data['date'].isoformat()
    resp = client.table("hr_expense").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create expense")
    return resp.data[0]
