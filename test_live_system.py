import urllib.request
import urllib.error
import json
import time
import sys
import ssl

ssl_context = ssl.create_default_context()

BASE_URL = "https://erp-crm-puce.vercel.app"

ROUTES = [
    "/",
    "/about",
    "/accounting",
    "/appointments",
    "/apps",
    "/attendances",
    "/barcode",
    "/billing",
    "/calendar",
    "/checkout",
    "/contact",
    "/contacts",
    "/crm",
    "/dashboard",
    "/discuss",
    "/documents",
    "/employees",
    "/helpdesk",
    "/inventory",
    "/knowledge",
    "/login",
    "/manufacturing",
    "/payroll",
    "/planning",
    "/pos",
    "/pricing",
    "/project",
    "/purchase",
    "/recruitment",
    "/reports",
    "/sales",
    "/settings",
    "/shop",
    "/sign",
    "/signup",
    "/super-admin",
    "/surveys",
    "/team",
    "/timesheets",
    "/todo"
]

SUPABASE_URL = "https://hgmdredpqwuooxbbsejw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbWRyZWRwcXd1b294YmJzZWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwODAyMTcsImV4cCI6MjEwNTY1MjIxN30.lao9ScQb91a6AknqONwLE62l1wcgNYHft2F5VLLBjCM"

def test_route(route):
    url = f"{BASE_URL}{route}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (ERP-CRM-Tester)'})
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, context=ssl_context, timeout=10) as response:
            latency = (time.time() - start_time) * 1000
            content = response.read().decode('utf-8', errors='ignore')
            status = response.getcode()
            headers = dict(response.info())
            title = ""
            if "<title>" in content:
                title = content.split("<title>")[1].split("</title>")[0].strip()
            return {
                "route": route,
                "status": status,
                "latency_ms": round(latency, 2),
                "title": title,
                "content_len": len(content),
                "error": None
            }
    except urllib.error.HTTPError as e:
        latency = (time.time() - start_time) * 1000
        return {
            "route": route,
            "status": e.code,
            "latency_ms": round(latency, 2),
            "title": "",
            "content_len": 0,
            "error": str(e)
        }
    except Exception as e:
        latency = (time.time() - start_time) * 1000
        return {
            "route": route,
            "status": 0,
            "latency_ms": round(latency, 2),
            "title": "",
            "content_len": 0,
            "error": str(e)
        }

def test_supabase_endpoint(table):
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=1"
    req = urllib.request.Request(url, headers={
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    })
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, context=ssl_context, timeout=10) as response:
            latency = (time.time() - start_time) * 1000
            data = json.loads(response.read().decode('utf-8'))
            return {
                "table": table,
                "status": response.getcode(),
                "latency_ms": round(latency, 2),
                "row_count": len(data),
                "error": None
            }
    except urllib.error.HTTPError as e:
        latency = (time.time() - start_time) * 1000
        return {
            "table": table,
            "status": e.code,
            "latency_ms": round(latency, 2),
            "row_count": 0,
            "error": str(e)
        }
    except Exception as e:
        latency = (time.time() - start_time) * 1000
        return {
            "table": table,
            "status": 0,
            "latency_ms": round(latency, 2),
            "row_count": 0,
            "error": str(e)
        }

if __name__ == "__main__":
    print("=== LIVE SYSTEM COMPREHENSIVE TEST SUITE ===")
    print(f"Targeting: {BASE_URL}\n")
    
    route_results = []
    for r in ROUTES:
        res = test_route(r)
        route_results.append(res)
        status_symbol = "[PASS]" if res["status"] == 200 else "[FAIL]"
        print(f"{status_symbol} Route {res['route']:<20} | Status: {res['status']} | Latency: {res['latency_ms']:>6.1f}ms | Title: {res['title'][:30]}")
    
    print("\n=== SUPABASE DATABASE ENDPOINT TESTING ===")
    tables = [
        "contacts", "crm_lead", "sale_order", "product_product", 
        "inventory_warehouse", "hr_employee", "knowledge_article", 
        "todo_task", "project_project", "helpdesk_ticket", 
        "documents_document", "mail_channel", "mail_message"
    ]
    
    db_results = []
    for t in tables:
        res = test_supabase_endpoint(t)
        db_results.append(res)
        status_symbol = "[PASS]" if res["status"] == 200 else "[FAIL]"
        print(f"{status_symbol} Table {res['table']:<22} | Status: {res['status']} | Latency: {res['latency_ms']:>6.1f}ms | Rows returned: {res['row_count']}")

    with open("live_test_results.json", "w") as f:
        json.dump({"routes": route_results, "database": db_results}, f, indent=2)
    print("\nTest results saved to live_test_results.json")
