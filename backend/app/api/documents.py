from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.documents import Document, DocumentCreate
from app.core.supabase_client import supabase

router = APIRouter()

@router.post("/documents", response_model=Document)
def create_document(doc: DocumentCreate):
    data = doc.dict(exclude_unset=True)
    resp = supabase.table("documents_document").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create document")
    return resp.data[0]

@router.get("/documents", response_model=List[Document])
def read_documents(folder_id: UUID = None):
    query = supabase.table("documents_document").select("*")
    if folder_id:
        query = query.eq("folder_id", str(folder_id))
    else:
        # If no folder_id, fetch root items (where folder_id is null)
        query = query.is_("folder_id", "null")
    
    resp = query.execute()
    return resp.data
