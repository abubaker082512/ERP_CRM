import os
import sys

sys.path.append(os.getcwd())

from app.core.supabase_client import supabase

TABLES_TO_CHECK = [
    "contacts",
    "product_product",
    "inventory_warehouse",
    "crm_lead",
    "sale_order",
    "purchase_order",
    "account_move",
    "hr_employee",
    "mrp_production",
    "helpdesk_ticket",
    "project_project",
    "documents_document",
    "mail_channel",
    "knowledge_article",
    "todo_task",
    "calendar_appointment_type",
    "planning_slot",
    "survey_survey",
    "sign_request",
    "stock_barcode_log",
    "payroll_payslip"
]

def check_all_tables():
    print("Checking database table status in Supabase...")
    success_count = 0
    missing_tables = []
    
    for table in TABLES_TO_CHECK:
        try:
            res = supabase.table(table).select("*").limit(1).execute()
            print(f"  [OK] Table '{table}': EXISTS")
            success_count += 1
        except Exception as e:
            err_msg = str(e)
            if "PGRST205" in err_msg or "does not exist" in err_msg:
                print(f"  [MISSING] Table '{table}': DOES NOT EXIST")
                missing_tables.append(table)
            else:
                print(f"  [ERROR] Table '{table}': Error ({err_msg})")

    print("\n--- Summary ---")
    print(f"Verified Tables: {success_count}/{len(TABLES_TO_CHECK)}")
    if missing_tables:
        print(f"Missing Tables: {missing_tables}")
    else:
        print("SUCCESS: ALL TABLES VERIFIED IN SUPABASE!")

if __name__ == "__main__":
    check_all_tables()
