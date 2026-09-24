from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.api.deps import get_supabase_client
from supabase import Client
import sys
import os

# Import Company Brain AI Engine
sys.path.append(os.path.join(os.getcwd(), ".."))
try:
    from ai_engine.brain import company_brain
except ImportError:
    from brain import company_brain

router = APIRouter()


class SearchQuery(BaseModel):
    query: str


class SearchResult(BaseModel):
    type: str
    id: str
    name: str
    url: str
    subtitle: Optional[str] = None


class NLQuery(BaseModel):
    question: str


class NLResponse(BaseModel):
    answer: str
    data: Optional[List[dict]] = None
    chart_type: Optional[str] = None


class LeadScoreRequest(BaseModel):
    email: Optional[str] = None
    probability: float = 0.0
    expected_revenue: float = 0.0
    stage: str = "new"


class DemandForecastRequest(BaseModel):
    product_id: str
    current_stock: float = 0.0


class OCRInvoiceRequest(BaseModel):
    raw_text: str


@router.post("/search", response_model=List[SearchResult])
def global_search(q: SearchQuery, client: Client = Depends(get_supabase_client)):
    """Real multi-table search across all core ERP entities."""
    term = q.query.strip()
    if len(term) < 2:
        return []

    results: List[SearchResult] = []

    try:
        r = client.table("contacts").select("id,name,email").ilike("name", f"%{term}%").limit(5).execute()
        for row in (r.data or []):
            results.append(SearchResult(type="contact", id=row["id"], name=row["name"], url=f"/contacts/{row['id']}", subtitle=row.get("email")))
    except Exception:
        pass

    try:
        r = client.table("sale_order").select("id,name,state,amount_total").ilike("name", f"%{term}%").limit(5).execute()
        for row in (r.data or []):
            results.append(SearchResult(type="sale", id=row["id"], name=row["name"], url=f"/sales/{row['id']}", subtitle=f"${row.get('amount_total',0)} · {row.get('state','')}"))
    except Exception:
        pass

    try:
        r = client.table("product_product").select("id,name,list_price").ilike("name", f"%{term}%").limit(5).execute()
        for row in (r.data or []):
            results.append(SearchResult(type="product", id=row["id"], name=row["name"], url=f"/inventory/products/{row['id']}", subtitle=f"${row.get('list_price',0)}"))
    except Exception:
        pass

    try:
        r = client.table("crm_lead").select("id,name,type,stage_id").ilike("name", f"%{term}%").limit(5).execute()
        for row in (r.data or []):
            entity_type = "opportunity" if row.get("type") == "opportunity" else "lead"
            results.append(SearchResult(type=entity_type, id=row["id"], name=row["name"], url=f"/crm/{row['id']}", subtitle=row.get("stage_id")))
    except Exception:
        pass

    return results[:20]


@router.post("/lead-score")
def predict_lead_score(req: LeadScoreRequest):
    """AI Lead Conversion Scoring Endpoint."""
    return company_brain.calculate_lead_score(
        email=req.email or "",
        probability=req.probability,
        expected_revenue=req.expected_revenue,
        stage=req.stage
    )


@router.post("/demand-forecast")
def forecast_product_demand(req: DemandForecastRequest, client: Client = Depends(get_supabase_client)):
    """AI Stock Demand Forecasting Endpoint."""
    # Fetch recent sales history for this product
    try:
        resp = client.table("sale_order_line").select("product_uom_qty").eq("product_id", req.product_id).limit(20).execute()
        sales_qty = [float(r.get("product_uom_qty", 1.0)) for r in (resp.data or [])]
    except Exception:
        sales_qty = [5.0, 10.0, 8.0, 12.0]

    return company_brain.forecast_demand(sales_qty, req.current_stock)


@router.post("/ocr-invoice")
def parse_ocr_invoice(req: OCRInvoiceRequest):
    """AI Automated Vendor Bill OCR & Parsing Endpoint."""
    return company_brain.parse_invoice_text(req.raw_text)


@router.post("/ask", response_model=NLResponse)
def ask_company_brain(q: NLQuery, client: Client = Depends(get_supabase_client)):
    """The Brain of the Company - Natural Language ERP Assistant."""
    question = q.question.lower().strip()

    # Sales & Revenue Query
    if any(w in question for w in ["sales", "revenue", "orders", "income"]):
        resp = client.table("sale_order").select("amount_total, state").execute()
        orders = resp.data or []
        confirmed = [o for o in orders if o.get("state") in ("sale", "done")]
        draft = [o for o in orders if o.get("state") in ("draft", "sent")]
        total = sum(float(o.get("amount_total") or 0) for o in confirmed)
        return NLResponse(
            answer=f"Total confirmed sales revenue is **${total:,.2f}** across **{len(confirmed)} orders**. You also have **{len(draft)} quotations** pending.",
            data=[{"label": "Confirmed", "value": round(total, 2)}, {"label": "Quotations", "value": len(draft)}],
            chart_type="bar"
        )

    # CRM Pipeline Query
    if any(w in question for w in ["lead", "pipeline", "opportunity", "crm", "deal"]):
        resp = client.table("crm_lead").select("expected_revenue, stage_id, type").execute()
        items = resp.data or []
        opps = [i for i in items if i.get("type") == "opportunity"]
        total = sum(float(i.get("expected_revenue") or 0) for i in opps)
        won = [i for i in opps if i.get("stage_id") == "Won"]
        return NLResponse(
            answer=f"CRM pipeline has **{len(opps)} opportunities** with a total value of **${total:,.2f}**. **{len(won)} deals** are marked as Won.",
            data=[{"label": "Pipeline Value", "value": round(total, 2)}, {"label": "Won", "value": len(won)}],
            chart_type="bar"
        )

    # Contacts Query
    if any(w in question for w in ["contact", "customer", "client"]):
        resp = client.table("contacts").select("id, is_company").execute()
        all_c = resp.data or []
        companies = [c for c in all_c if c.get("is_company")]
        return NLResponse(
            answer=f"You have **{len(all_c)} contacts** in your database — **{len(companies)} companies** and **{len(all_c)-len(companies)} individuals**.",
            data=[{"label": "Companies", "value": len(companies)}, {"label": "Individuals", "value": len(all_c) - len(companies)}],
            chart_type="pie"
        )

    # Inventory Query
    if any(w in question for w in ["inventory", "stock", "product", "warehouse"]):
        resp = client.table("product_product").select("id, name, list_price").execute()
        prods = resp.data or []
        return NLResponse(
            answer=f"You have **{len(prods)} active products** registered in your inventory system.",
            data=[{"label": "Active Products", "value": len(prods)}],
            chart_type="bar"
        )

    # HR & Staff Query
    if any(w in question for w in ["employee", "staff", "hr", "team"]):
        resp = client.table("hr_employee").select("id").execute()
        employees = resp.data or []
        return NLResponse(
            answer=f"You have **{len(employees)} active employees** on your team.",
            data=[{"label": "Employees", "value": len(employees)}],
            chart_type="bar"
        )

    # Fallback Response
    return NLResponse(
        answer=(
            "Hello! I am **The Brain of the Company**. I can analyze your ERP data and answer questions like:\n"
            "• 'What is our total sales revenue?'\n"
            "• 'Show CRM pipeline summary'\n"
            "• 'How many active contacts do we have?'\n"
            "• 'How many products in stock?'\n"
            "• 'How many employees on our team?'"
        )
    )
