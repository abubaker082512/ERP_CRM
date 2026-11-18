import os
import json
from PIL import Image
from playwright.sync_api import sync_playwright

BASE_DIR = r"D:\ERP_CRM"
PUBLIC_SHOWCASE = os.path.join(BASE_DIR, "public", "images", "showcase")
FRONTEND_SHOWCASE = os.path.join(BASE_DIR, "frontend", "public", "images", "showcase")
PUBLIC_DECK = os.path.join(BASE_DIR, "public", "deck_assets")
FRONTEND_DECK = os.path.join(BASE_DIR, "frontend", "public", "deck_assets")

for d in [PUBLIC_SHOWCASE, FRONTEND_SHOWCASE, PUBLIC_DECK, FRONTEND_DECK]:
    os.makedirs(d, exist_ok=True)

def save_both_showcase(png_temp_path, base_name):
    img = Image.open(png_temp_path).convert("RGB")
    for folder in [PUBLIC_SHOWCASE, FRONTEND_SHOWCASE]:
        png_out = os.path.join(folder, f"{base_name}.png")
        webp_out = os.path.join(folder, f"{base_name}.webp")
        img.save(png_out, "PNG", optimize=True)
        img.save(webp_out, "WEBP", quality=92)
    print(f"Saved showcase image: {base_name}.png & .webp")

def save_both_deck(png_temp_path, filename_jpg):
    img = Image.open(png_temp_path).convert("RGB")
    for folder in [PUBLIC_DECK, FRONTEND_DECK]:
        jpg_out = os.path.join(folder, filename_jpg)
        img.save(jpg_out, "JPEG", quality=94)
    print(f"Saved deck asset: {filename_jpg}")

ALL_MODULES = [
    "/accounting", "/crm", "/contacts", "/sales", "/inventory", "/pos",
    "/purchase", "/project", "/timesheets", "/planning", "/manufacturing",
    "/employees", "/payroll", "/attendances", "/recruitment", "/helpdesk",
    "/documents", "/spreadsheets", "/slides", "/migration", "/knowledge",
    "/discuss", "/surveys", "/sign", "/barcode", "/calendar", "/appointments",
    "/todo", "/team", "/dashboard", "/shop", "/club", "/ngos", "/automotive",
    "/real-estate", "/education", "/meet", "/reports", "/crm/leads-pool"
]

MOCK_ME = {
    "id": "admin",
    "email": "admin@beraxis.online",
    "name": "Muhammad Abu Baker",
    "full_name": "Muhammad Abu Baker",
    "role": "super_admin",
    "is_super_admin": True,
    "account_type": "company",
    "subscription_status": "active",
    "plan": "premium",
    "company_name": "BERAXIS AI Global HQ",
    "tenant": {
        "id": "tenant-hq",
        "name": "BERAXIS AI Global HQ",
        "subscription_status": "active",
        "stripe_customer_id": json.dumps({"plan": "Enterprise Pro"})
    }
}

MOCK_DASHBOARD_SUMMARY = {
    "kpis": {
        "quotations": 148,
        "orders": 92,
        "revenue": 184500,
        "avg_order": 2005,
        "pipeline_value": 412000,
        "won_deals": 64,
        "pending_moves": 18,
        "total_contacts": 1420,
        "invoices_count": 112
    },
    "chart_data": [
        {"month": "Jun", "value": 42000},
        {"month": "Jul", "value": 68000},
        {"month": "Aug", "value": 94000},
        {"month": "Sep", "value": 128000},
        {"month": "Oct", "value": 156000},
        {"month": "Nov", "value": 184500}
    ],
    "pipeline_stages": [
        {"stage": "New Leads", "count": 84, "value": 120000},
        {"stage": "Qualified", "count": 52, "value": 145000},
        {"stage": "Proposition", "count": 31, "value": 98000},
        {"stage": "Won Deals", "count": 64, "value": 184500}
    ],
    "recent_orders": [
        {"id": "1", "name": "SO-2026-089", "customer": "Acme Cloud Systems", "amount": 14800, "state": "sale", "date": "Today"},
        {"id": "2", "name": "SO-2026-088", "customer": "Nordic Logistics Group", "amount": 9450, "state": "done", "date": "Today"},
        {"id": "3", "name": "SO-2026-087", "customer": "Apex Medical Clinics", "amount": 6200, "state": "sale", "date": "Yesterday"},
        {"id": "4", "name": "SO-2026-086", "customer": "Madrid Padel Club", "amount": 4800, "state": "done", "date": "Nov 16"}
    ],
    "recent_leads": [
        {"id": "1", "name": "Enterprise ERP Migration (120 Seats)", "stage": "Proposition", "revenue": 48000, "customer": "Vanguard Retail"},
        {"id": "2", "name": "Multi-Branch POS Rollout", "stage": "Qualified", "revenue": 24500, "customer": "Padel Pro Madrid"},
        {"id": "3", "name": "AI Voice Copilot Deployment", "stage": "Won", "revenue": 18200, "customer": "Global Freight LLC"},
        {"id": "4", "name": "Clinic EMR & Billing Suite", "stage": "Proposition", "revenue": 15400, "customer": "DentalCare Zurich"}
    ]
}

def capture_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080}, device_scale_factor=1.5)

        # Intercept /auth/me and /dashboard/summary so authenticated views render with rich data
        context.route("**/auth/me*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(MOCK_ME)
        ))
        context.route("**/dashboard/summary*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(MOCK_DASHBOARD_SUMMARY)
        ))

        all_mods_json = json.dumps(ALL_MODULES)
        init_script = f"""
        (() => {{
            const adminUser = {json.dumps(MOCK_ME)};
            const hqBranch = [{{
                id: "hq-1",
                name: "BERAXIS AI Global HQ",
                code: "BRX-HQ",
                industryId: "retail",
                subSector: "Omnichannel Enterprise Suite",
                operationMode: "Multi-Branch Cloud",
                location: "Miami, FL",
                currency: "USD",
                enabledModules: {all_mods_json},
                modules: {all_mods_json},
                sharingRules: {{
                    shareEmployees: true,
                    shareCustomers: true,
                    shareInventory: true,
                    shareAccounting: true,
                    shareVendors: true
                }},
                createdAt: new Date().toISOString(),
                isPrimary: true,
                accountType: "company",
                entityType: "company"
            }}];
            localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.beraxis_live_token");
            localStorage.setItem("user", JSON.stringify(adminUser));
            localStorage.setItem("beraxis_plan_admin", "premium");
            localStorage.setItem("beraxis_branches_admin", JSON.stringify(hqBranch));
            localStorage.setItem("beraxis_active_branch_id_admin", "hq-1");
            localStorage.setItem("beraxis_active_branch_id", "hq-1");
            localStorage.setItem("beraxis_donation_toast_snoozed", String(Date.now() + 8640000000));
            localStorage.setItem("beraxis_quickstart_dismissed_hq-1", "true");
        }})();
        """
        context.add_init_script(init_script)
        page = context.new_page()

        # 1. Capture Executive Overview Dashboard (/dashboard) with rich realistic metrics
        print("1. Capturing Latest Populated Executive Dashboard (/dashboard)...")
        page.goto("https://www.beraxis.online/dashboard", wait_until="networkidle", timeout=45000)
        page.wait_for_timeout(3000)
        dash_tmp = os.path.join(BASE_DIR, "scratch", "tmp_dashboard.png")
        page.screenshot(path=dash_tmp, full_page=False)
        save_both_showcase(dash_tmp, "dashboard-screen")
        save_both_deck(dash_tmp, "analytics_growth_view.jpg")

        # 2. Capture All 34+ Unified Apps Cockpit (/apps) without Quickstart banner so all 4 rows of apps are visible
        print("2. Capturing Clean 34+ Unified Apps Cockpit (/apps)...")
        page.goto("https://www.beraxis.online/apps", wait_until="networkidle", timeout=45000)
        page.wait_for_timeout(2000)
        # Click the X button on Quickstart Launchpad if visible so all app icons sit center stage
        page.evaluate("""() => {
            document.querySelectorAll('button').forEach(btn => {
                if (btn.innerHTML.includes('lucide-x') && btn.closest('div')?.innerText?.includes('Quickstart Launchpad')) {
                    btn.click();
                }
            });
        }""")
        page.wait_for_timeout(600)
        apps_tmp = os.path.join(BASE_DIR, "scratch", "tmp_apps.png")
        page.screenshot(path=apps_tmp, full_page=False)
        save_both_showcase(apps_tmp, "apps-screen")
        save_both_deck(apps_tmp, "feature_showcase_2.jpg")

        # 3. Capture Global B2B Leads Directory (/leads-pool)
        print("3. Capturing Latest 25M+ B2B Leads Directory (/leads-pool)...")
        page.goto("https://www.beraxis.online/leads-pool", wait_until="networkidle", timeout=45000)
        page.wait_for_timeout(2500)
        leads_tmp = os.path.join(BASE_DIR, "scratch", "tmp_leads.png")
        page.screenshot(path=leads_tmp, full_page=False)
        save_both_showcase(leads_tmp, "workspace-screen")
        save_both_deck(leads_tmp, "crm_accounting_view.jpg")

        browser.close()
        print("ALL POPULATED SYSTEM SCREENSHOTS CAPTURED!")

if __name__ == "__main__":
    capture_all()
