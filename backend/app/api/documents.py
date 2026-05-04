from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID
from app.schemas.documents import Document, DocumentCreate
from app.api.deps import get_supabase_client
from supabase import Client

router = APIRouter()

@router.post("/documents", response_model=Document)
def create_document(doc: DocumentCreate, client: Client = Depends(get_supabase_client)):
    data = doc.dict(exclude_unset=True)
    resp = client.table("documents_document").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create document")
    return resp.data[0]

@router.get("/documents", response_model=List[Document])
def read_documents(folder_id: UUID = None, client: Client = Depends(get_supabase_client)):
    query = client.table("documents_document").select("*")
    if folder_id:
        query = query.eq("folder_id", str(folder_id))
    else:
        query = query.is_("folder_id", "null")
    
    resp = query.execute()
    return resp.data
