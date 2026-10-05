from fastapi import APIRouter, Depends
from app.api.deps import get_supabase_client
from supabase import Client
from datetime import datetime, timedelta
from app.services.audit_service import audit_service

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(client: Client = Depends(get_supabase_client)):
    """
    Aggregate strictly tenant-scoped metrics across Sales, CRM, Inventory,
    Accounting, Contacts, and Audit log for the current user's workspace.
    """
    # --- Sales KPIs ---
    try:
        orders_resp = client.table("sale_order").select("id, name, customer_name, state, amount_total, date_order, created_at").execute()
        all_orders = orders_resp.data or []
    except Exception:
        all_orders = []

    confirmed_orders = [o for o in all_orders if o.get("state") in ("sale", "done")]
    draft_orders     = [o for o in all_orders if o.get("state") in ("draft", "sent")]
    total_revenue    = sum(float(o.get("amount_total") or 0) for o in confirmed_orders)
    avg_order_value  = (total_revenue / len(confirmed_orders)) if confirmed_orders else 0

    # --- CRM KPIs ---
    try:
        leads_resp  = client.table("crm_lead").select("id, name, partner_name, stage_id, expected_revenue, created_at").execute()
        all_leads   = leads_resp.data or []
    except Exception:
        all_leads = []

    pipeline_value = sum(float(l.get("expected_revenue") or 0) for l in all_leads if l.get("stage_id") != "Lost")
    won_deals   = [l for l in all_leads if l.get("stage_id") == "Won"]

    # --- Pipeline Funnel Counts ---
    new_leads = len([l for l in all_leads if l.get("stage_id") == "New"])
    qual_leads = len([l for l in all_leads if l.get("stage_id") == "Qualified"])
    prop_leads = len([l for l in all_leads if l.get("stage_id") == "Proposition"])
    won_count = len(won_deals)

    new_val = sum(float(l.get("expected_revenue") or 0) for l in all_leads if l.get("stage_id") == "New")
    qual_val = sum(float(l.get("expected_revenue") or 0) for l in all_leads if l.get("stage_id") == "Qualified")
    prop_val = sum(float(l.get("expected_revenue") or 0) for l in all_leads if l.get("stage_id") == "Proposition")
    won_val = sum(float(l.get("expected_revenue") or 0) for l in won_deals)

    pipeline_stages = [
        {"stage": "New Leads", "count": new_leads, "value": round(new_val, 2)},
        {"stage": "Qualified", "count": qual_leads, "value": round(qual_val, 2)},
        {"stage": "Proposition", "count": prop_leads, "value": round(prop_val, 2)},
        {"stage": "Won Deals", "count": won_count, "value": round(won_val, 2)},
    ]

    # --- Inventory KPIs ---
    try:
        moves_resp  = client.table("inventory_move").select("id, state").execute()
        all_moves   = moves_resp.data or []
        pending_moves = len([m for m in all_moves if m.get("state") not in ("done", "cancel")])
    except Exception:
        pending_moves = 0

    # --- Contacts Count ---
    try:
        contacts_resp = client.table("res_partner").select("id").execute()
        total_contacts = len(contacts_resp.data or [])
    except Exception:
        total_contacts = 0

    # --- Invoices Count ---
    try:
        invoices_resp = client.table("account_move").select("id, amount_total, payment_state").execute()
        total_invoices = len(invoices_resp.data or [])
    except Exception:
        total_invoices = 0

    # --- Monthly Sales Chart (last 6 months) ---
    monthly_sales: dict[str, float] = {}
    for order in confirmed_orders:
        date_str = order.get("date_order") or order.get("created_at")
        if date_str:
            try:
                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                key = dt.strftime("%b %Y")
                monthly_sales[key] = monthly_sales.get(key, 0) + float(order.get("amount_total") or 0)
            except Exception:
                pass

    chart_data = [{"month": k, "value": round(v, 2)} for k, v in sorted(monthly_sales.items())]

    # --- Recent Orders (top 5) ---
    recent_orders = sorted(all_orders, key=lambda o: o.get("created_at") or "", reverse=True)[:5]

    # --- Recent Leads (top 5) ---
    recent_leads = sorted(all_leads, key=lambda l: l.get("created_at") or "", reverse=True)[:5]

    # --- Recent Activities ---
    try:
        logs = audit_service.get_activities(limit=5)
        recent_activities = [
            {
                "id": str(log.id),
                "text": f"{log.action.capitalize()}: {log.description or log.entity_name}",
                "time": log.created_at.strftime("%b %d, %H:%M") if log.created_at else "Just now",
                "type": log.module or "general"
            }
            for log in logs
        ]
    except Exception:
        recent_activities = []

    return {
        "kpis": {
            "quotations": len(draft_orders),
            "orders": len(confirmed_orders),
            "revenue": round(total_revenue, 2),
            "avg_order": round(avg_order_value, 2),
            "pipeline_value": round(pipeline_value, 2),
            "won_deals": len(won_deals),
            "pending_moves": pending_moves,
            "total_contacts": total_contacts,
            "invoices_count": total_invoices,
        },
        "chart_data": chart_data,
        "pipeline_stages": pipeline_stages,
        "recent_orders": [
            {
                "id": o.get("id"),
                "name": o.get("name") or "Draft Quote",
                "customer": o.get("customer_name") or "—",
                "amount": float(o.get("amount_total") or 0),
                "state": o.get("state") or "draft",
                "date": o.get("created_at", "")[:10] if o.get("created_at") else "",
            }
            for o in recent_orders
        ],
        "recent_leads": [
            {
                "id": l.get("id"),
                "name": l.get("name") or "Deal",
                "customer": l.get("partner_name") or "Key Account",
                "stage": l.get("stage_id") or "New",
                "revenue": float(l.get("expected_revenue") or 0),
            }
            for l in recent_leads
        ],
        "recent_activities": recent_activities,
    }
