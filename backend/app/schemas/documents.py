from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class DocumentBase(BaseModel):
    name: str
    type: str = "file" # file, folder
    folder_id: Optional[UUID] = None
    owner_id: Optional[UUID] = None
    file_url: Optional[str] = None
    tags: List[str] = []

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
