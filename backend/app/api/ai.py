from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

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
def ask_data(q: NLQuery):
    # Mock AI response
    question = q.question.lower()
    
    if "sales" in question and "month" in question:
        return NLResponse(
            answer="Total sales for this month are $45,230.00, which is a 12% increase from last month.",
            data=[{"label": "Week 1", "value": 10000}, {"label": "Week 2", "value": 12000}],
            chart_type="bar"
        )
    elif "stock" in question:
        return NLResponse(
            answer="Low stock alert: 'Office Chair' is below minimum quantity (5 units).",
            data=[],
            chart_type="alert"
        )
    
    return NLResponse(answer="I'm not sure how to answer that yet. Try asking about sales or stock.")
