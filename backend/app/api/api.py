from fastapi import APIRouter
from app.api import leads, auth, opportunities

api_router = APIRouter()
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
api_router.include_router(opportunities.router, prefix="/opportunities", tags=["opportunities"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
