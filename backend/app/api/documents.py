from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from pydantic import BaseModel


router = APIRouter()


class DocumentCreate(BaseModel):
    name: str
    type: Optional[str] = "file"
    folder_id: Optional[str] = None
    file_url: Optional[str] = None
    mimetype: Optional[str] = None
    tags: Optional[List[str]] = None


class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    folder_id: Optional[str] = None
    tags: Optional[List[str]] = None


class FolderCreate(BaseModel):
    name: str
    folder_id: Optional[str] = None  # parent folder


@router.post("/folders")
def create_folder(folder: FolderCreate, client: Client = Depends(get_supabase_client)):
    data = {"name": folder.name, "type": "folder"}
    if folder.folder_id:
        data["folder_id"] = folder.folder_id
    resp = client.table("documents_document").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create folder")
    return resp.data[0]


@router.get("/folders")
def read_folders(client: Client = Depends(get_supabase_client)):
    resp = client.table("documents_document").select("*").eq("type", "folder").order("name").execute()
    return resp.data or []


@router.post("/documents")
def create_document(doc: DocumentCreate, client: Client = Depends(get_supabase_client)):
    data = doc.dict(exclude_unset=True)
    resp = client.table("documents_document").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create document")
    return resp.data[0]


@router.get("/documents")
def read_documents(
    folder_id: Optional[str] = None,
    search: Optional[str] = None,
    client: Client = Depends(get_supabase_client)
):
    query = client.table("documents_document").select("*").order("created_at", desc=True)
    if folder_id:
        query = query.eq("folder_id", folder_id)
    else:
        query = query.is_("folder_id", "null").eq("type", "file")
    resp = query.execute()
    docs = resp.data or []
    if search:
        s = search.lower()
        docs = [d for d in docs if s in (d.get("name") or "").lower()]
    return docs


@router.get("/documents/{doc_id}")
def read_document(doc_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("documents_document").select("*").eq("id", doc_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Document not found")
    return resp.data[0]


@router.put("/documents/{doc_id}")
def update_document(doc_id: str, doc: DocumentUpdate, client: Client = Depends(get_supabase_client)):
    data = doc.dict(exclude_unset=True)
    resp = client.table("documents_document").update(data).eq("id", doc_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Document not found")
    return resp.data[0]


@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str, client: Client = Depends(get_supabase_client)):
    # Get file_url to delete from storage if needed
    doc_resp = client.table("documents_document").select("file_url").eq("id", doc_id).execute()
    client.table("documents_document").delete().eq("id", doc_id).execute()
    return {"message": "Document deleted"}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    folder_id: Optional[str] = Form(None),
    client: Client = Depends(get_supabase_client)
):
    """Upload a file to Supabase Storage and register in documents table."""
    try:
        contents = await file.read()
        bucket = "erp-documents"
        path = f"{folder_id or 'root'}/{file.filename}"

        # Upload to Supabase Storage
        storage_resp = client.storage.from_(bucket).upload(
            path,
            contents,
            {"content-type": file.content_type or "application/octet-stream", "upsert": "true"}
        )

        # Get public URL
        public_url = client.storage.from_(bucket).get_public_url(path)

        # Register in DB
        doc_data = {
            "name": file.filename,
            "type": "file",
            "file_url": public_url,
            "mimetype": file.content_type,
            "file_size": len(contents),
        }
        if folder_id:
            doc_data["folder_id"] = folder_id

        doc_resp = client.table("documents_document").insert(doc_data).execute()
        return doc_resp.data[0] if doc_resp.data else {"message": "Uploaded", "url": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
