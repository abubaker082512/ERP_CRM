from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# Survey
class SurveyBase(BaseModel):
    title: str
    description: Optional[str] = None
    state: str = "draft"

class SurveyCreate(SurveyBase):
    pass

class Survey(SurveyBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Sign
class SignRequestBase(BaseModel):
    title: str
    file_url: Optional[str] = None
    state: str = "sent"

class SignRequestCreate(SignRequestBase):
    pass

class SignRequest(SignRequestBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Barcode
class BarcodeLogBase(BaseModel):
    barcode: str
    product_id: Optional[UUID] = None
    user_id: Optional[UUID] = None

class BarcodeLogCreate(BarcodeLogBase):
    pass

class BarcodeLog(BarcodeLogBase):
    id: UUID
    scanned_at: datetime

    class Config:
        from_attributes = True
