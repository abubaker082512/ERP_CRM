from pydantic import BaseModel, EmailStr
from typing import Optional

class UserSignup(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    password: str
    invite_id: Optional[str] = None
    account_type: Optional[str] = "individual" # individual or company
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
