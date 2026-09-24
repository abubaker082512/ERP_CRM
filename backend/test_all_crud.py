import os
import sys

sys.path.append(os.getcwd())
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), "..")))

from app.core.supabase_client import supabase
from ai_engine.brain import company_brain


def run_crud_tests():
    print("==========================================")
    print("STARTING E2E BACKEND & AI PERSISTENCE TEST")
    print("==========================================")

    results = {}

    # 1. Contacts
    try:
        res = supabase.table("contacts").insert({"name": "Test Enterprise Client", "email": "client@enterprise.com", "phone": "+123456789"}).execute()
        contact_id = res.data[0]['id']
        results["Contacts"] = f"PASS (Created ID: {contact_id})"
    except Exception as e:
        results["Contacts"] = f"FAIL: {e}"
        contact_id = None

    # 2. Products
    try:
        res = supabase.table("product_product").insert({"name": "ERP License Pro", "list_price": 499.00, "type": "service"}).execute()
        product_id = res.data[0]['id']
        results["Products"] = f"PASS (Created ID: {product_id})"
    except Exception as e:
        results["Products"] = f"FAIL: {e}"
        product_id = None

    # 3. CRM Leads
    try:
        res = supabase.table("crm_lead").insert({"name": "Potential Deal - Corp X", "email_from": "deal@corpx.com", "probability": 75.0, "stage_id": "qualified"}).execute()
        lead_id = res.data[0]['id']
        results["CRM Leads"] = f"PASS (Created ID: {lead_id})"
    except Exception as e:
        results["CRM Leads"] = f"FAIL: {e}"

    # 4. Sales Orders
    try:
        if contact_id:
            res = supabase.table("sale_order").insert({"name": "SO/2026/001", "partner_id": contact_id, "amount_total": 499.00, "state": "sale"}).execute()
            so_id = res.data[0]['id']
            results["Sales Orders"] = f"PASS (Created ID: {so_id})"
        else:
            results["Sales Orders"] = "SKIP (No contact_id)"
    except Exception as e:
        results["Sales Orders"] = f"FAIL: {e}"

    # 5. Inventory Warehouses
    try:
        res = supabase.table("inventory_warehouse").insert({"name": "Central Warehouse", "code": "WH1"}).execute()
        results["Inventory"] = f"PASS (Created WH: {res.data[0]['id']})"
    except Exception as e:
        results["Inventory"] = f"FAIL: {e}"

    # 6. HR Employees
    try:
        res = supabase.table("hr_employee").insert({"name": "Alice Developer", "work_email": "alice@company.com", "job_title": "Software Engineer"}).execute()
        emp_id = res.data[0]['id']
        results["HR Employees"] = f"PASS (Created ID: {emp_id})"
    except Exception as e:
        results["HR Employees"] = f"FAIL: {e}"
        emp_id = None

    # 7. Knowledge Articles
    try:
        res = supabase.table("knowledge_article").insert({"title": "Company Onboarding Guide", "body": "Welcome to our ERP platform!", "category": "HR"}).execute()
        results["Knowledge"] = f"PASS (Created ID: {res.data[0]['id']})"
    except Exception as e:
        results["Knowledge"] = f"FAIL: {e}"

    # 8. To Do Tasks
    try:
        res = supabase.table("todo_task").insert({"title": "Review Q3 Sales Targets", "description": "High priority review", "is_completed": False}).execute()
        results["To Do"] = f"PASS (Created ID: {res.data[0]['id']})"
    except Exception as e:
        results["To Do"] = f"FAIL: {e}"

    # 9. Projects & Tasks
    try:
        res = supabase.table("project_project").insert({"name": "Next-Gen AI ERP Deployment"}).execute()
        proj_id = res.data[0]['id']
        res_task = supabase.table("project_task").insert({"name": "Configure Database", "project_id": proj_id}).execute()
        results["Project"] = f"PASS (Created Proj: {proj_id}, Task: {res_task.data[0]['id']})"
    except Exception as e:
        results["Project"] = f"FAIL: {e}"

    # 10. Helpdesk Tickets
    try:
        res = supabase.table("helpdesk_ticket").insert({"name": "Printer Connection Issue", "priority": "high", "stage_id": "new"}).execute()
        results["Helpdesk"] = f"PASS (Created Ticket: {res.data[0]['id']})"
    except Exception as e:
        results["Helpdesk"] = f"FAIL: {e}"

    # 11. Documents
    try:
        res = supabase.table("documents_document").insert({"name": "Annual Financial Report 2026.pdf", "type": "file"}).execute()
        results["Documents"] = f"PASS (Created Doc: {res.data[0]['id']})"
    except Exception as e:
        results["Documents"] = f"FAIL: {e}"

    # 12. Discuss Chat Channels & Messages
    try:
        res_ch = supabase.table("mail_channel").insert({"name": "general", "channel_type": "channel"}).execute()
        ch_id = res_ch.data[0]['id']
        res_msg = supabase.table("mail_message").insert({"channel_id": ch_id, "body": "Hello team, database persistence test successful!"}).execute()
        results["Discuss"] = f"PASS (Channel: {ch_id}, Msg: {res_msg.data[0]['id']})"
    except Exception as e:
        results["Discuss"] = f"FAIL: {e}"

    # 13. AI Core Engine ("The Brain of the Company")
    try:
        score_res = company_brain.calculate_lead_score("deal@corpx.com", 75.0, 15000.0, "qualified")
        ocr_res = company_brain.parse_invoice_text("Vendor: ACME Corp\nTotal: 1450.00")
        forecast_res = company_brain.forecast_demand([10.0, 15.0, 12.0], 5.0)
        results["AI Engine"] = f"PASS (Score: {score_res['score']}, OCR: ${ocr_res['total_amount']}, Forecast: {forecast_res['stock_status']})"
    except Exception as e:
        results["AI Engine"] = f"FAIL: {e}"

    print("\n==========================================")
    print("FINAL SUMMARY OF ALL 13 ERP PERSISTENCE & AI TESTS")
    print("==========================================")
    all_passed = True
    for module, outcome in results.items():
        print(f"[{module.upper()}] => {outcome}")
        if "PASS" not in outcome:
            all_passed = False

    if all_passed:
        print("\nSUCCESS: ALL 13 MODULE PERSISTENCE & AI TESTS PASSED WITH 100% SUCCESS!")


if __name__ == "__main__":
    run_crud_tests()
