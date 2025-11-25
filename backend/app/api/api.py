from fastapi import APIRouter
from app.api import leads, auth, opportunities, products, sales, contacts, inventory, purchase

api_router = APIRouter()
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
api_router.include_router(opportunities.router, prefix="/opportunities", tags=["opportunities"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(purchase.router, prefix="/purchase", tags=["purchase"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
