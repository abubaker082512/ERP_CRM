from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.api.deps import get_supabase_client
from supabase import Client

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


@router.post("/search", response_model=List[SearchResult])
def global_search(q: SearchQuery, client: Client = Depends(get_supabase_client)):
    """Real multi-table search across all core ERP entities."""
    term = q.query.strip()
    if len(term) < 2:
        return []

    results: List[SearchResult] = []

    try:
        # Search Contacts
        r = client.table("contacts").select("id,name,email").ilike("name", f"%{term}%").limit(5).execute()
        for row in (r.data or []):
            results.append(SearchResult(type="contact", id=row["id"], name=row["name"], url=f"/contacts/{row['id']}", subtitle=row.get("email")))
    except Exception:
        pass

    try:
        # Search Sales Orders
        r = client.table("sale_order").select("id,name,state,amount_total").ilike("name", f"%{term}%").limit(5).execute()
        for row in (r.data or []):
            results.append(SearchResult(type="sale", id=row["id"], name=row["name"], url=f"/sales/{row['id']}", subtitle=f"${row.get('amount_total',0)} · {row.get('state','')}"))
    except Exception:
        pass

    try:
        # Search Products
        r = client.table("product_product").select("id,name,list_price").ilike("name", f"%{term}%").limit(5).execute()
        for row in (r.data or []):
            results.append(SearchResult(type="product", id=row["id"], name=row["name"], url=f"/inventory/products/{row['id']}", subtitle=f"${row.get('list_price',0)}"))
    except Exception:
        pass

    try:
        # Search CRM Leads/Opportunities
        r = client.table("crm_lead").select("id,name,type,stage_id").ilike("name", f"%{term}%").limit(5).execute()
        for row in (r.data or []):
            entity_type = "opportunity" if row.get("type") == "opportunity" else "lead"
            url = f"/crm/{row['id']}" if entity_type == "opportunity" else f"/crm/{row['id']}"
            results.append(SearchResult(type=entity_type, id=row["id"], name=row["name"], url=url, subtitle=row.get("stage_id")))
    except Exception:
        pass

    try:
        # Search Helpdesk Tickets
        r = client.table("helpdesk_ticket").select("id,name,stage_id").ilike("name", f"%{term}%").limit(3).execute()
        for row in (r.data or []):
            results.append(SearchResult(type="ticket", id=row["id"], name=row["name"], url=f"/helpdesk/{row['id']}", subtitle=f"Stage: {row.get('stage_id','')}"))
    except Exception:
        pass

    try:
        # Search Employees
        r = client.table("hr_employee").select("id,name,job_title").ilike("name", f"%{term}%").limit(3).execute()
        for row in (r.data or []):
            results.append(SearchResult(type="employee", id=row["id"], name=row["name"], url=f"/employees/{row['id']}", subtitle=row.get("job_title")))
    except Exception:
        pass

    try:
        # Search Knowledge Articles
        r = client.table("knowledge_article").select("id,title,category").ilike("title", f"%{term}%").limit(3).execute()
        for row in (r.data or []):
            results.append(SearchResult(type="article", id=row["id"], name=row["title"], url=f"/knowledge", subtitle=row.get("category")))
    except Exception:
        pass

    return results[:20]  # Cap total results


@router.post("/ask", response_model=NLResponse)
def ask_data(q: NLQuery, client: Client = Depends(get_supabase_client)):
    """Natural language data query handler."""
    question = q.question.lower().strip()

    # ── Sales & Revenue ──
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

    # ── CRM Pipeline ──
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

    # ── Contacts ──
    if any(w in question for w in ["contact", "customer", "client"]):
        resp = client.table("contacts").select("id, is_company").execute()
        all_c = resp.data or []
        companies = [c for c in all_c if c.get("is_company")]
        return NLResponse(
            answer=f"You have **{len(all_c)} contacts** in your database — **{len(companies)} companies** and **{len(all_c)-len(companies)} individuals**.",
            data=[{"label": "Companies", "value": len(companies)}, {"label": "Individuals", "value": len(all_c) - len(companies)}],
            chart_type="pie"
        )

    # ── Inventory ──
    if any(w in question for w in ["inventory", "stock", "product", "warehouse"]):
        resp = client.table("inventory_quant").select("quantity, reserved_quantity").execute()
        quants = resp.data or []
        total_qty = sum(float(q.get("quantity") or 0) for q in quants)
        reserved = sum(float(q.get("reserved_quantity") or 0) for q in quants)
        prods = client.table("product_product").select("id").execute()
        return NLResponse(
            answer=f"You have **{len(prods.data or [])} products** with a total of **{total_qty:.0f} units** on hand. **{reserved:.0f} units** are reserved.",
            data=[{"label": "On Hand", "value": total_qty}, {"label": "Reserved", "value": reserved}],
            chart_type="bar"
        )

    # ── Employees / HR ──
    if any(w in question for w in ["employee", "staff", "hr", "human"]):
        resp = client.table("hr_employee").select("id, department_id").eq("active", True).execute()
        employees = resp.data or []
        depts = client.table("hr_department").select("id").execute()
        return NLResponse(
            answer=f"You have **{len(employees)} active employees** across **{len(depts.data or [])} departments**.",
            data=[{"label": "Employees", "value": len(employees)}, {"label": "Departments", "value": len(depts.data or [])}],
            chart_type="bar"
        )

    # ── Helpdesk ──
    if any(w in question for w in ["ticket", "helpdesk", "support", "issue"]):
        resp = client.table("helpdesk_ticket").select("id, stage_id").execute()
        tickets = resp.data or []
        open_t = [t for t in tickets if t.get("stage_id") not in ("done", "resolved", "closed")]
        return NLResponse(
            answer=f"You have **{len(tickets)} helpdesk tickets** total — **{len(open_t)} open** and **{len(tickets)-len(open_t)} closed**.",
            data=[{"label": "Open", "value": len(open_t)}, {"label": "Closed", "value": len(tickets) - len(open_t)}],
            chart_type="pie"
        )

    # ── Fallback ──
    return NLResponse(
        answer=(
            "I can answer questions about your business data! Try asking:\n"
            "• 'What are my total sales?'\n"
            "• 'How many contacts do I have?'\n"
            "• 'What is my CRM pipeline value?'\n"
            "• 'How many employees do I have?'\n"
            "• 'How many open helpdesk tickets?'\n"
            "• 'What's my current inventory?'"
        )
    )
