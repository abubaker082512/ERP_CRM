import requests
import json
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def run_reseed():
    print("🚀 Starting Beraxis Database Seeding Overhaul...")

    supabase_url = settings.SUPABASE_URL
    supabase_key = settings.SUPABASE_KEY

    headers = {
        "apikey": supabase_key,
        "Content-Type": "application/json"
    }

    # 1. Login to retrieve active session
    print("🔑 Authenticating active tenant admin2@erp-crm.com...")
    login_url = f"{supabase_url}/auth/v1/token?grant_type=password"
    login_payload = {
        "email": "admin2@erp-crm.com",
        "password": "NewAdmin123!"
    }
    
    res = requests.post(login_url, headers=headers, json=login_payload)
    if res.status_code != 200:
        print(f"❌ Authentication failed: {res.text}")
        return

    session = res.json()
    token = session["access_token"]
    user_id = session["user"]["id"]
    print(f"✅ Authenticated. Tenant ID: {user_id}")

    # Set up user-scoped API headers
    auth_headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    # 2. Update Tenant Profile to BERAXIS
    print("🏢 Setting active tenant name to 'BERAXIS'...")
    tenant_url = f"{supabase_url}/rest/v1/tenants?id=eq.{user_id}"
    tenant_payload = {
        "company_name": "BERAXIS"
    }
    res = requests.patch(tenant_url, headers=auth_headers, json=tenant_payload)
    if res.status_code in [200, 201, 204]:
        print("✅ Tenant updated to BERAXIS.")
    else:
        print(f"⚠️ Tenant update warning: {res.text}")

    # 3. Orderly Deletion of Mock/Dummy records to avoid FK constraints
    tables_to_clear = [
        "payroll_payslip", "payroll_run", "payroll_salary_structure",
        "pos_payment", "pos_order_line", "pos_order", "pos_session", "pos_config",
        "mrp_production", "mrp_bom_line", "mrp_bom",
        "sale_order_line", "sale_order", "purchase_order_line", "purchase_order",
        "inventory_move", "inventory_quant", "inventory_location", "inventory_warehouse",
        "crm_lead", "contacts", "product_product", "product_category",
        "hr_employee", "hr_department", "helpdesk_message", "helpdesk_ticket"
    ]

    print("🧹 Cleaning legacy sandbox dummy data...")
    for table in tables_to_clear:
        delete_url = f"{supabase_url}/rest/v1/{table}?tenant_id=eq.{user_id}"
        res = requests.delete(delete_url, headers=auth_headers)
        if res.status_code in [200, 204]:
            print(f"   Deleted records from: {table}")
        else:
            # Table might be empty or require different permissions; print but continue
            pass

    # 4. Seed Product Category
    print("📦 Seeding clean Beraxis product categories...")
    categ_url = f"{supabase_url}/rest/v1/product_category"
    categ_payload = [
        {"name": "SaaS Licenses", "tenant_id": user_id},
        {"name": "Professional Services", "tenant_id": user_id}
    ]
    res = requests.post(categ_url, headers=auth_headers, json=categ_payload)
    categ_ids = {}
    if res.status_code == 201:
        data = res.json()
        print("✅ Product categories seeded.")
        for item in data:
            categ_ids[item["name"]] = item["id"]
    else:
        print(f"❌ Product category seeding failed: {res.text}")
        return

    # 5. Seed Real Products (matching Odoo pricing plans and Beraxis integrations)
    print("🛍️ Seeding official Beraxis products and services...")
    products_url = f"{supabase_url}/rest/v1/product_product"
    products_payload = [
        {
            "name": "Beraxis Standard License",
            "list_price": 24.90,
            "standard_price": 10.00,
            "type": "service",
            "default_code": "BRX-SaaS-STD",
            "categ_id": categ_ids.get("SaaS Licenses"),
            "description": "Standard license with full access to all 28 core modules on Managed Cloud.",
            "tenant_id": user_id
        },
        {
            "name": "Beraxis Custom License",
            "list_price": 37.40,
            "standard_price": 15.00,
            "type": "service",
            "default_code": "BRX-SaaS-CST",
            "categ_id": categ_ids.get("SaaS Licenses"),
            "description": "Custom license including Beraxis Studio customizer, External APIs, and Multi-Company.",
            "tenant_id": user_id
        },
        {
            "name": "Enterprise Migration Consulting",
            "list_price": 2500.00,
            "standard_price": 800.00,
            "type": "service",
            "default_code": "BRX-MIG-ENT",
            "categ_id": categ_ids.get("Professional Services"),
            "description": "Full end-to-end data migration and systems onboarding by a dedicated engineer.",
            "tenant_id": user_id
        },
        {
            "name": "WhatsApp Multi-Channel CRM Sync",
            "list_price": 49.00,
            "standard_price": 12.00,
            "type": "service",
            "default_code": "BRX-WTS-SYNC",
            "categ_id": categ_ids.get("SaaS Licenses"),
            "description": "Direct WhatsApp integration with live Discuss polling and chat synchronicities.",
            "tenant_id": user_id
        }
    ]
    res = requests.post(products_url, headers=auth_headers, json=products_payload)
    if res.status_code == 201:
        print("✅ Products & services seeded successfully.")
    else:
        print(f"❌ Product seeding failed: {res.text}")

    # 6. Seed Realistic Contacts
    print("👥 Seeding brand new contacts...")
    contacts_url = f"{supabase_url}/rest/v1/contacts"
    contacts_payload = [
        {"name": "Beraxis Support Desk", "email": "support@beraxis.online", "phone": "+1 970 780 7993", "is_company": False, "company_name": None, "tenant_id": user_id},
        {"name": "Beraxis Sales Team", "email": "sales@beraxis.online", "phone": "+1 970 780 7993", "is_company": False, "company_name": None, "tenant_id": user_id},
        {"name": "Acme Global Solutions", "email": "procurement@acme-global.com", "phone": None, "is_company": True, "company_name": None, "tenant_id": user_id},
        {"name": "John Davis", "email": "j.davis@acme-global.com", "phone": None, "is_company": False, "company_name": "Acme Global Solutions", "tenant_id": user_id}
    ]
    res = requests.post(contacts_url, headers=auth_headers, json=contacts_payload)
    if res.status_code == 201:
        print("✅ Contacts seeded successfully.")
    else:
        print(f"❌ Contact seeding failed: {res.text}")

    # 7. Seed Realistic CRM Leads & Opportunities
    print("📈 Seeding live CRM pipeline opportunities...")
    crm_url = f"{supabase_url}/rest/v1/crm_lead"
    crm_payload = [
        {
            "name": "Acme Corp - 50 User Standard Seat Migration",
            "email_from": "j.davis@acme-global.com",
            "phone": "+1234567890",
            "probability": 75.0,
            "type": "opportunity",
            "expected_revenue": 14940.00,
            "stage_id": "qualified",
            "notes": "Acme wants to transition all local spreadsheets into Beraxis Cloud. Billed annually.",
            "tenant_id": user_id
        },
        {
            "name": "Inquiry: WhatsApp Multi-Channel CRM Sync Setup",
            "email_from": "techops@fastgrowth.io",
            "phone": "+9876543210",
            "probability": 30.0,
            "type": "lead",
            "expected_revenue": 588.00,
            "stage_id": "new",
            "notes": "Client requested information on connecting their active customer support WhatsApp to Beraxis.",
            "tenant_id": user_id
        }
    ]
    res = requests.post(crm_url, headers=auth_headers, json=crm_payload)
    if res.status_code == 201:
        print("✅ CRM leads & opportunities seeded.")
    else:
        print(f"❌ CRM lead seeding failed: {res.text}")

    # 8. Seed Dummy Employees under the @beraxis.online domain
    print("👔 Seeding dummy employees under @beraxis.online...")
    dept_url = f"{supabase_url}/rest/v1/hr_department"
    dept_payload = [
        {"name": "Executive Leadership", "tenant_id": user_id},
        {"name": "Enterprise Consulting", "tenant_id": user_id},
        {"name": "SLA Support Desk", "tenant_id": user_id}
    ]
    res = requests.post(dept_url, headers=auth_headers, json=dept_payload)
    dept_ids = {}
    if res.status_code == 201:
        data = res.json()
        print("✅ HR departments seeded.")
        for item in data:
            dept_ids[item["name"]] = item["id"]
    else:
        print(f"❌ HR department seeding failed: {res.text}")
        return

    employee_url = f"{supabase_url}/rest/v1/hr_employee"
    employee_payload = [
        {
            "name": "Sarah Connor",
            "work_email": "s.connor@beraxis.online",
            "job_title": "Principal Enterprise Consultant",
            "department_id": dept_ids.get("Enterprise Consulting"),
            "tenant_id": user_id
        },
        {
            "name": "Robert Mercer",
            "work_email": "r.mercer@beraxis.online",
            "job_title": "Full-Stack Integrations Developer",
            "department_id": dept_ids.get("Enterprise Consulting"),
            "tenant_id": user_id
        },
        {
            "name": "Clara Oswald",
            "work_email": "c.oswald@beraxis.online",
            "job_title": "SLA Support Desk Manager",
            "department_id": dept_ids.get("SLA Support Desk"),
            "tenant_id": user_id
        }
    ]
    res = requests.post(employee_url, headers=auth_headers, json=employee_payload)
    if res.status_code == 201:
        print("✅ Dummy employee roster seeded successfully.")
    else:
        print(f"❌ Employee seeding failed: {res.text}")

    print("🎉 Database seeding overhaul complete! BERAXIS is now fully loaded with real operational values.")

if __name__ == "__main__":
    run_reseed()
