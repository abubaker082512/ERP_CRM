from fastapi import APIRouter, HTTPException
from app.schemas.contact import Contact, ContactCreate, ContactUpdate
from app.core.supabase_client import supabase
from typing import List

router = APIRouter()

@router.post("/", response_model=Contact)
def create_contact(contact: ContactCreate):
    contact_data = contact.dict(exclude_unset=True)
    response = supabase.table("contacts").insert(contact_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create contact")
    return response.data[0]

@router.get("/", response_model=List[Contact])
def read_contacts(skip: int = 0, limit: int = 100):
    response = supabase.table("contacts").select("*").range(skip, skip + limit - 1).execute()
    return response.data

@router.get("/{contact_id}", response_model=Contact)
def read_contact(contact_id: str):
    response = supabase.table("contacts").select("*").eq("id", contact_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Contact not found")
    return response.data[0]
