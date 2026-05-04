from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.api.deps import get_supabase_client
from supabase import Client

router = APIRouter()

class SearchQuery(BaseModel):
    query: str

class SearchResult(BaseModel):
    type: str # e.g., "contact", "sale", "product"
    id: str
    name: str
    url: str

@router.post("/search", response_model=List[SearchResult])
def global_search(q: SearchQuery):
    # Mock implementation - in real app would search multiple tables
    results = []
    term = q.query.lower()
    
    # Mock results
    if "inv" in term:
        results.append(SearchResult(type="invoice", id="1", name="INV/2023/001", url="/accounting/invoices/1"))
    if "so" in term:
        results.append(SearchResult(type="sale", id="1", name="SO001", url="/sales/orders/1"))
    if "jane" in term:
        results.append(SearchResult(type="contact", id="1", name="Jane Doe", url="/contacts/1"))
        
    return results

class NLQuery(BaseModel):
    question: str

class NLResponse(BaseModel):
    answer: str
    data: Optional[List[dict]] = None
    chart_type: Optional[str] = None

@router.post("/ask", response_model=NLResponse)
def ask_data(q: NLQuery, client: Client = Depends(get_supabase_client)):
    # Semi-intelligent response using real data aggregations
    question = q.question.lower()
    
    # 1. Handle Sales Queries
    if "sales" in question or "revenue" in question:
        resp = client.table("sale_order").select("amount_total, state").execute()
        orders = resp.data or []
        total = sum(float(o.get("amount_total") or 0) for o in orders if o.get("state") in ("sale", "done"))
        count = len([o for o in orders if o.get("state") in ("sale", "done")])
        
        return NLResponse(
            answer=f"Total confirmed sales revenue is ${total:,.2f} across {count} orders.",
            data=[{"label": "Confirmed", "value": total}],
            chart_type="bar"
        )
        
    # 2. Handle Contact Queries
    elif "contact" in question or "customer" in question:
        resp = client.table("contacts").select("id").execute()
        count = len(resp.data or [])
        return NLResponse(
            answer=f"You currently have {count} contacts in your database.",
            data=[]
        )

    # 3. Handle Lead/CRM Queries
    elif "lead" in question or "pipeline" in question:
        resp = client.table("crm_lead").select("expected_revenue").execute()
        leads = resp.data or []
        total = sum(float(l.get("expected_revenue") or 0) for l in leads)
        return NLResponse(
            answer=f"Your CRM pipeline has a total expected value of ${total:,.2f}.",
            data=[{"label": "Pipeline", "value": total}],
            chart_type="bar"
        )
    
    # 4. Fallback
    return NLResponse(
        answer="I can help you with sales metrics, contact counts, or CRM pipeline value. Try asking 'What are my total sales?' or 'How many contacts do I have?'"
    )
