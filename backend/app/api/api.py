from fastapi import APIRouter
from app.api import leads

api_router = APIRouter()
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
