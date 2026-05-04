from fastapi import APIRouter, Depends
from app.api import leads, auth, opportunities, products, sales, contacts, inventory, purchase, accounting, hr, mrp, helpdesk, payroll, website, documents, discuss, ai, pos, recruitment, attendance, knowledge, todo, appointments, planning, surveys, sign, barcode, team, billing, dashboard, super_admin
from app.api.deps import get_supabase_client

api_router = APIRouter()

# Enforce JWT & Tenant Isolation on all standard modules
protected_deps = [Depends(get_supabase_client)]

api_router.include_router(leads.router, prefix="/leads", tags=["leads"], dependencies=protected_deps)
api_router.include_router(opportunities.router, prefix="/opportunities", tags=["opportunities"], dependencies=protected_deps)
api_router.include_router(products.router, prefix="/products", tags=["products"], dependencies=protected_deps)
api_router.include_router(sales.router, prefix="/sales", tags=["sales"], dependencies=protected_deps)
api_router.include_router(contacts.router, prefix="/contacts", tags=["contacts"], dependencies=protected_deps)
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"], dependencies=protected_deps)
api_router.include_router(purchase.router, prefix="/purchase", tags=["purchase"], dependencies=protected_deps)
api_router.include_router(accounting.router, prefix="/accounting", tags=["accounting"], dependencies=protected_deps)
api_router.include_router(hr.router, prefix="/hr", tags=["hr"], dependencies=protected_deps)
api_router.include_router(mrp.router, prefix="/mrp", tags=["mrp"], dependencies=protected_deps)
api_router.include_router(helpdesk.router, prefix="/helpdesk", tags=["helpdesk"], dependencies=protected_deps)
api_router.include_router(payroll.router, prefix="/payroll", tags=["payroll"], dependencies=protected_deps)
api_router.include_router(website.router, prefix="/website", tags=["website"], dependencies=protected_deps)
api_router.include_router(documents.router, prefix="/documents", tags=["documents"], dependencies=protected_deps)
api_router.include_router(discuss.router, prefix="/discuss", tags=["discuss"], dependencies=protected_deps)
api_router.include_router(ai.router, prefix="/ai", tags=["ai"], dependencies=protected_deps)
api_router.include_router(pos.router, prefix="/pos", tags=["pos"], dependencies=protected_deps)
api_router.include_router(recruitment.router, prefix="/recruitment", tags=["recruitment"], dependencies=protected_deps)
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"], dependencies=protected_deps)
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"], dependencies=protected_deps)
api_router.include_router(todo.router, prefix="/todo", tags=["todo"], dependencies=protected_deps)
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"], dependencies=protected_deps)
api_router.include_router(planning.router, prefix="/planning", tags=["planning"], dependencies=protected_deps)
api_router.include_router(surveys.router, prefix="/surveys", tags=["surveys"], dependencies=protected_deps)
api_router.include_router(sign.router, prefix="/sign", tags=["sign"], dependencies=protected_deps)
api_router.include_router(barcode.router, prefix="/barcode", tags=["barcode"], dependencies=protected_deps)
api_router.include_router(team.router, prefix="/team", tags=["team"], dependencies=protected_deps)
api_router.include_router(billing.router, prefix="/billing", tags=["billing"], dependencies=protected_deps)
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"], dependencies=protected_deps)
api_router.include_router(super_admin.router, prefix="/super-admin", tags=["super-admin"], dependencies=protected_deps)

@api_router.get("/ping", tags=["health"])
def ping():
    return {"status": "ok"}

# Do NOT enforce JWT on auth routes (login/signup obviously requires no token)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
