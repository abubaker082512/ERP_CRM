from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import date


router = APIRouter()


class AccountCreate(BaseModel):
    code: str
    name: str
    type: str
    active: Optional[bool] = True


class JournalCreate(BaseModel):
    name: str
    type: str
    code: str


class MoveLineCreate(BaseModel):
    account_id: Optional[str] = None
    name: Optional[str] = None
    debit: Optional[float] = 0.0
    credit: Optional[float] = 0.0
    quantity: Optional[float] = 1.0
    price_unit: Optional[float] = 0.0


class MoveCreate(BaseModel):
    name: Optional[str] = "/"
    date: Optional[date] = None
    journal_id: Optional[str] = None
    move_type: Optional[str] = "entry"
    partner_id: Optional[str] = None
    amount_total: Optional[float] = 0.0
    ref: Optional[str] = None
    lines: Optional[List[MoveLineCreate]] = []


class MoveUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[date] = None
    journal_id: Optional[str] = None
    partner_id: Optional[str] = None
    amount_total: Optional[float] = None
    ref: Optional[str] = None


# ─── Accounts ────────────────────────────────────────────────

@router.post("/accounts")
def create_account(account: AccountCreate, client: Client = Depends(get_supabase_client)):
    data = account.dict(exclude_unset=True)
    resp = client.table("account_account").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create account")
    return resp.data[0]


@router.get("/accounts")
def read_accounts(type: Optional[str] = None, client: Client = Depends(get_supabase_client)):
    query = client.table("account_account").select("*").order("code")
    if type:
        query = query.eq("type", type)
    resp = query.execute()
    return resp.data or []


# ─── Journals ────────────────────────────────────────────────

@router.post("/journals")
def create_journal(journal: JournalCreate, client: Client = Depends(get_supabase_client)):
    data = journal.dict(exclude_unset=True)
    resp = client.table("account_journal").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create journal")
    return resp.data[0]


@router.get("/journals")
def read_journals(client: Client = Depends(get_supabase_client)):
    resp = client.table("account_journal").select("*").execute()
    return resp.data or []


@router.get("/journals/{journal_id}/moves")
def read_journal_moves(journal_id: str, move_type: Optional[str] = None, client: Client = Depends(get_supabase_client)):
    query = client.table("account_move").select("*").eq("journal_id", journal_id).order("created_at", desc=True)
    if move_type:
        query = query.eq("move_type", move_type)
    resp = query.execute()
    return resp.data or []


# ─── Moves (Invoices/Bills/Journal Entries) ──────────────────

@router.post("/moves")
def create_move(move: MoveCreate, client: Client = Depends(get_supabase_client)):
    move_data = move.dict(exclude={"lines"}, exclude_unset=True)
    if move_data.get("date"):
        move_data["date"] = str(move_data["date"])

    resp = client.table("account_move").insert(move_data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create move")

    created_move = resp.data[0]
    move_id = created_move["id"]

    if move.lines:
        lines_data = [{**l.dict(exclude_unset=True), "move_id": move_id} for l in move.lines]
        lines_resp = client.table("account_move_line").insert(lines_data).execute()
        created_move["lines"] = lines_resp.data or []
    else:
        created_move["lines"] = []

    return created_move


@router.get("/moves")
def read_moves(
    move_type: Optional[str] = None,
    state: Optional[str] = None,
    journal_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    client: Client = Depends(get_supabase_client)
):
    query = client.table("account_move").select("*, account_journal(name), contacts(name)").order("created_at", desc=True).range(skip, skip + limit - 1)
    if move_type:
        query = query.eq("move_type", move_type)
    if state:
        query = query.eq("state", state)
    if journal_id:
        query = query.eq("journal_id", journal_id)
    resp = query.execute()
    return resp.data or []


@router.get("/moves/{move_id}")
def read_move(move_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("account_move").select(
        "*, account_journal(name), contacts(name), account_move_line(*, account_account(code, name))"
    ).eq("id", move_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Move not found")
    return resp.data[0]


@router.put("/moves/{move_id}")
def update_move(move_id: str, move: MoveUpdate, client: Client = Depends(get_supabase_client)):
    data = move.dict(exclude_unset=True)
    if data.get("date"):
        data["date"] = str(data["date"])
    resp = client.table("account_move").update(data).eq("id", move_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Move not found")
    return resp.data[0]


@router.post("/moves/{move_id}/post")
def post_move(move_id: str, client: Client = Depends(get_supabase_client)):
    """Post a draft journal entry/invoice — changes state from draft to posted."""
    resp = client.table("account_move").update({"state": "posted"}).eq("id", move_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Move not found")
    return resp.data[0]


@router.post("/moves/{move_id}/register_payment")
def register_payment(move_id: str, client: Client = Depends(get_supabase_client)):
    """Mark an invoice as paid."""
    resp = client.table("account_move").update({"payment_state": "paid"}).eq("id", move_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Move not found")
    return resp.data[0]


@router.delete("/moves/{move_id}")
def delete_move(move_id: str, client: Client = Depends(get_supabase_client)):
    client.table("account_move_line").delete().eq("move_id", move_id).execute()
    client.table("account_move").delete().eq("id", move_id).execute()
    return {"message": "Move deleted"}


# --- Payments ---
@router.post("/payments", response_model=Payment)
def create_payment(payment: PaymentCreate, client: Client = Depends(get_supabase_client)):
    # 1. Create Payment
    data = payment.dict(exclude={"invoice_ids"}, exclude_unset=True)
    if not data.get("date"):
        data["date"] = date.today().isoformat()
    
    response = client.table("account_payment").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create payment")
    
    created_payment = response.data[0]
    payment_id = created_payment["id"]
    
    # 2. Reconcile with Invoices
    if payment.invoice_ids:
        rel_data = []
        for inv_id in payment.invoice_ids:
            # For simplicity, assume full payment or manual split in frontend
            # In real Odoo, this computes amount_residual
            rel_data.append({
                "payment_id": payment_id,
                "invoice_id": str(inv_id),
                "amount": payment.amount / len(payment.invoice_ids)
            })
            
            # Update invoice state
            client.table("account_move").update({"payment_state": "paid", "amount_residual": 0.0}).eq("id", str(inv_id)).execute()
            
        client.table("account_payment_invoice_rel").insert(rel_data).execute()
        
    return created_payment


@router.get("/payments", response_model=List[Payment])
def read_payments(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    response = client.table("account_payment").select("*").range(skip, skip + limit - 1).execute()
    return response.data
