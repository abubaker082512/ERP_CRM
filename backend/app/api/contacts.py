from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.contact import Contact, ContactCreate, ContactUpdate

from typing import List

router = APIRouter()

@router.post("", response_model=Contact)
def create_contact(contact: ContactCreate, client: Client = Depends(get_supabase_client)):
    contact_data = contact.dict(exclude_unset=True)
    response = client.table("contacts").insert(contact_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create contact")
    return response.data[0]

@router.get("", response_model=List[Contact])
def read_contacts(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    response = client.table("contacts").select("*").range(skip, skip + limit - 1).execute()
    return response.data

@router.get("/{contact_id}", response_model=Contact)
def read_contact(contact_id: str, client: Client = Depends(get_supabase_client)):
    response = client.table("contacts").select("*").eq("id", contact_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Contact not found")
    return response.data[0]

@router.put("/{contact_id}", response_model=Contact)
def update_contact(contact_id: str, contact: ContactUpdate, client: Client = Depends(get_supabase_client)):
    data = contact.dict(exclude_unset=True)
    response = client.table("contacts").update(data).eq("id", contact_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Contact not found")
    return response.data[0]

@router.delete("/{contact_id}")
def delete_contact(contact_id: str, client: Client = Depends(get_supabase_client)):
    client.table("contacts").delete().eq("id", contact_id).execute()
    return {"message": "Contact deleted"}
