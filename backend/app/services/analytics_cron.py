from datetime import datetime, timezone, timedelta
from app.core.supabase_client import service_client
from app.services.embeddings import embedding_service

def run_daily_analytics_aggregation():
    """
    Cron task to aggregate activity across CRM, Sales, Inventory, and Accounting
    for all tenants. It runs under service role context (bypassing RLS),
    summarizes the status/trends, computes vector embeddings, and stores
    them in tenant_micro_brain_memories.
    """
    print("🚀 Starting Daily Tenant Micro-Brain Analytics Aggregation...")
    
    try:
        # 1. Fetch all active tenants
        tenants_resp = service_client.table("tenants").select("id, email, company_name").execute()
        tenants = tenants_resp.data or []
        print(f"Found {len(tenants)} tenants to process.")
        
        now = datetime.now(timezone.utc)
        yesterday = now - timedelta(days=1)
        yesterday_str = yesterday.isoformat()
        
        for tenant in tenants:
            tenant_id = tenant.get("id")
            company_name = tenant.get("company_name") or f"Tenant {tenant_id}"
            print(f"Processing tenant '{company_name}' ({tenant_id})...")
            
            try:
                # 2. Gather CRM data
                # Fetch recent leads
                leads_resp = service_client.table("crm_lead") \
                    .select("id, expected_revenue, created_at, stage_id") \
                    .eq("tenant_id", tenant_id).execute()
                leads = leads_resp.data or []
                
                new_leads = [l for l in leads if l.get("created_at") and l.get("created_at") >= yesterday_str]
                total_pipeline = sum(float(l.get("expected_revenue") or 0) for l in leads)
                
                # 3. Gather Sales data
                sales_resp = service_client.table("sale_order") \
                    .select("id, amount_total, created_at, state") \
                    .eq("tenant_id", tenant_id).execute()
                orders = sales_resp.data or []
                
                new_orders = [o for o in orders if o.get("created_at") and o.get("created_at") >= yesterday_str]
                confirmed_new_orders = [o for o in new_orders if o.get("state") in ("sale", "done")]
                revenue_today = sum(float(o.get("amount_total") or 0) for o in confirmed_new_orders)
                
                # 4. Gather Inventory data
                moves_resp = service_client.table("inventory_move") \
                    .select("id, created_at, state") \
                    .eq("tenant_id", tenant_id).execute()
                moves = moves_resp.data or []
                new_moves = [m for m in moves if m.get("created_at") and m.get("created_at") >= yesterday_str]
                
                # 5. Gather Accounting data
                moves_acc_resp = service_client.table("account_move") \
                    .select("id, created_at, amount_total, payment_state") \
                    .eq("tenant_id", tenant_id).execute()
                acc_moves = moves_acc_resp.data or []
                new_invoices = [inv for inv in acc_moves if inv.get("created_at") and inv.get("created_at") >= yesterday_str]
                unpaid_invoices = [inv for inv in acc_moves if inv.get("payment_state") != "paid"]
                pending_payment_amt = sum(float(inv.get("amount_total") or 0) for inv in unpaid_invoices)
                
                # 6. Build Text Summary
                summary_text = (
                    f"Daily activity summary for workspace '{company_name}' on {now.strftime('%Y-%m-%d')}. "
                    f"CRM: Total active leads in pipeline is {len(leads)} with a total value of ${total_pipeline:.2f}. "
                    f"Added {len(new_leads)} new leads today. "
                    f"Sales & Revenue: Processed {len(new_orders)} sales orders today, resulting in ${revenue_today:.2f} confirmed revenue. "
                    f"Logistics: Managed {len(new_moves)} inventory movements today. "
                    f"Accounting: Logged {len(new_invoices)} new transactions/invoices. "
                    f"Currently has {len(unpaid_invoices)} unpaid invoices outstanding, totaling ${pending_payment_amt:.2f} in pending payments."
                )
                
                print(f"Summary Generated: {summary_text}")
                
                # 7. Generate Vector Embedding (1536-dim)
                embedding = embedding_service.get_embedding(summary_text)
                
                # 8. Store memory in DB
                memory_payload = {
                    "tenant_id": tenant_id,
                    "category": "trend_analysis",
                    "summary": summary_text,
                    "embedding": embedding
                }
                
                service_client.table("tenant_micro_brain_memories").insert(memory_payload).execute()
                print(f"Successfully generated and saved micro-brain memory for '{company_name}'!")
                
            except Exception as e:
                print(f"[ERROR] Failed to run analytics aggregation for tenant '{company_name}': {e}")
                
        print("✅ Daily Tenant Micro-Brain Analytics Aggregation finished successfully!")
        
    except Exception as e:
        print(f"[FATAL ERROR] Analytics Aggregation process aborted: {e}")

if __name__ == "__main__":
    run_daily_analytics_aggregation()
