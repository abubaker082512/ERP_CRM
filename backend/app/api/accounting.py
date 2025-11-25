from fastapi import APIRouter, HTTPException
from app.schemas.accounting import (
    Account, AccountCreate,
    Journal, JournalCreate,
    Move, MoveCreate
)
from app.core.supabase_client import supabase
from typing import List

router = APIRouter()

# --- Accounts ---
@router.post("/accounts", response_model=Account)
def create_account(account: AccountCreate):
    data = account.dict(exclude_unset=True)
    response = supabase.table("account_account").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create account")
    return response.data[0]

@router.get("/accounts", response_model=List[Account])
def read_accounts():
    response = supabase.table("account_account").select("*").execute()
    return response.data

# --- Journals ---
@router.post("/journals", response_model=Journal)
def create_journal(journal: JournalCreate):
    data = journal.dict(exclude_unset=True)
    response = supabase.table("account_journal").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create journal")
    return response.data[0]

@router.get("/journals", response_model=List[Journal])
def read_journals():
    response = supabase.table("account_journal").select("*").execute()
    return response.data

# --- Moves (Invoices/Entries) ---
@router.post("/moves", response_model=Move)
def create_move(move: MoveCreate):
    # 1. Create Move
    move_data = move.dict(exclude={'lines'}, exclude_unset=True)
    response = supabase.table("account_move").insert(move_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create move")
    
    created_move = response.data[0]
    move_id = created_move['id']

    # 2. Create Move Lines
    if move.lines:
        lines_data = []
        for line in move.lines:
            l_data = line.dict()
            l_data['move_id'] = move_id
            lines_data.append(l_data)
        
        lines_response = supabase.table("account_move_line").insert(lines_data).execute()
        created_move['lines'] = lines_response.data

    return created_move

@router.get("/moves", response_model=List[Move])
def read_moves(skip: int = 0, limit: int = 100):
    # Fetch moves
    response = supabase.table("account_move").select("*").range(skip, skip + limit - 1).execute()
    return response.data
