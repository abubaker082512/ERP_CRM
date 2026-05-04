from fastapi import APIRouter, Depends
from app.api.deps import get_supabase_client
from supabase import Client
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(client: Client = Depends(get_supabase_client)):
    """
    Aggregate key metrics across Sales, CRM, Inventory, and Accounting
    for the main Dashboard page.
    """
    # --- Sales KPIs ---
    orders_resp = client.table("sale_order").select("id, state, amount_total, date_order, created_at").execute()
    all_orders = orders_resp.data or []

    confirmed_orders = [o for o in all_orders if o.get("state") in ("sale", "done")]
    draft_orders     = [o for o in all_orders if o.get("state") in ("draft", "sent")]
    total_revenue    = sum(float(o.get("amount_total") or 0) for o in confirmed_orders)
    avg_order_value  = (total_revenue / len(confirmed_orders)) if confirmed_orders else 0

    # --- CRM KPIs ---
    leads_resp  = client.table("crm_lead").select("id, stage_id, expected_revenue").execute()
    all_leads   = leads_resp.data or []
    pipeline_value = sum(float(l.get("expected_revenue") or 0) for l in all_leads)
    won_deals   = [l for l in all_leads if l.get("stage_id") == "Won"]

    # --- Inventory KPIs ---
    moves_resp  = client.table("inventory_move").select("id, state").execute()
    all_moves   = moves_resp.data or []
    pending_moves = len([m for m in all_moves if m.get("state") not in ("done", "cancel")])

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
    recent_leads = all_leads[:5]

    return {
        "kpis": {
            "quotations": len(draft_orders),
            "orders": len(confirmed_orders),
            "revenue": round(total_revenue, 2),
            "avg_order": round(avg_order_value, 2),
            "pipeline_value": round(pipeline_value, 2),
            "won_deals": len(won_deals),
            "pending_moves": pending_moves,
        },
        "chart_data": chart_data,
        "recent_orders": [
            {
                "id": o.get("id"),
                "name": o.get("name"),
                "customer": o.get("customer_name") or "—",
                "amount": o.get("amount_total"),
                "state": o.get("state"),
            }
            for o in recent_orders
        ],
        "recent_leads": [
            {
                "id": l.get("id"),
                "name": l.get("name"),
                "stage": l.get("stage"),
                "revenue": l.get("expected_revenue"),
            }
            for l in recent_leads
        ],
    }
