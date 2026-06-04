import sys
import os
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.core.config import settings

client = TestClient(app)

def run_test_suite():
    print("====================================================")
    print("🧪 STARTING COMPREHENSIVE BERAXIS TEST SUITE")
    print("====================================================")
    
    test_results = []
    token = None
    user_id = None
    
    def log_result(name, passed, details=""):
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"[{status}] {name}")
        if details:
            print(f"   ↳ {details}")
        test_results.append({"name": name, "passed": passed, "details": details})

    # Test Case 1: API root check
    try:
        response = client.get("/")
        if response.status_code == 200 and "Welcome" in response.json().get("message", ""):
            log_result("Test Case 1: API Root Health Check", True)
        else:
            log_result("Test Case 1: API Root Health Check", False, f"Unexpected response: {response.text}")
    except Exception as e:
        log_result("Test Case 1: API Root Health Check", False, str(e))

    # Test Case 2: Authenticate Admin2
    try:
        login_payload = {
            "email": "admin2@erp-crm.com",
            "password": "NewAdmin123!"
        }
        response = client.post("/api/v1/auth/login", json=login_payload)
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            user_id = data.get("user", {}).get("id")
            if token:
                log_result("Test Case 2: Admin Authentication", True, f"Token retrieved successfully. Tenant ID: {user_id}")
            else:
                log_result("Test Case 2: Admin Authentication", False, "Auth succeeded but no token in response.")
        else:
            log_result("Test Case 2: Admin Authentication", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Test Case 2: Admin Authentication", False, str(e))

    if not token:
        print("🛑 Critical auth token missing. Skipping authenticated routes.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # Test Case 3: Get Current User (Auth/Me) & Tenant Name Check
    try:
        response = client.get("/api/v1/auth/me", headers=headers)
        if response.status_code == 200:
            data = response.json()
            company_name = data.get("tenant", {}).get("company_name")
            if company_name == "BERAXIS":
                log_result("Test Case 3: User Profile & Tenant Company Verification", True, "Successfully verified active company is 'BERAXIS'.")
            else:
                log_result("Test Case 3: User Profile & Tenant Company Verification", False, f"Company name is '{company_name}', expected 'BERAXIS'")
        else:
            log_result("Test Case 3: User Profile & Tenant Company Verification", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Test Case 3: User Profile & Tenant Company Verification", False, str(e))

    # Test Case 4: CRM Leads listing & creation with AI lead scoring
    try:
        # Create a lead
        lead_payload = {
            "name": "Integration Test Lead",
            "email_from": "test@partner.com",
            "phone": "+1 555-0199",
            "company_name": "Test Partner Ltd",
            "notes": "Interested in standard licensing setup."
        }
        res_create = client.post("/api/v1/leads", headers=headers, json=lead_payload)
        if res_create.status_code == 200:
            lead_data = res_create.json()
            prob = lead_data.get("probability", 0.0)
            if prob > 0:
                log_result("Test Case 4: CRM Lead Creation & AI Lead Scoring", True, f"Lead scored successfully. Probability: {prob}%")
            else:
                log_result("Test Case 4: CRM Lead Creation & AI Lead Scoring", False, "Lead created but probability score is 0.")
        else:
            log_result("Test Case 4: CRM Lead Creation & AI Lead Scoring", False, f"Creation failed with HTTP {res_create.status_code}: {res_create.text}")
    except Exception as e:
        log_result("Test Case 4: CRM Lead Creation & AI Lead Scoring", False, str(e))

    # Test Case 5: Products Listing Check
    try:
        response = client.get("/api/v1/products", headers=headers)
        if response.status_code == 200:
            products = response.json()
            product_names = [p.get("name") for p in products]
            has_license = "Beraxis Standard License" in product_names or any("Beraxis" in name for name in product_names)
            if has_license:
                log_result("Test Case 5: Products Catalog Listing", True, f"Beraxis product offerings verified: {len(products)} active products found.")
            else:
                log_result("Test Case 5: Products Catalog Listing", False, f"No Beraxis product lines found. Active lines: {product_names}")
        else:
            log_result("Test Case 5: Products Catalog Listing", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Test Case 5: Products Catalog Listing", False, str(e))

    # Test Case 6: Billing Promo Code & Manual Activation Check
    try:
        # Try invalid promo code first (must return 400)
        res_invalid = client.post("/api/v1/billing/manual-activate", headers=headers, json={"promo_code": "INVALID_CODE"})
        passed_invalid = res_invalid.status_code == 400
        
        # Try valid promo code
        res_valid = client.post("/api/v1/billing/manual-activate", headers=headers, json={"promo_code": "BERAXIS"})
        passed_valid = res_valid.status_code == 200 and res_valid.json().get("status") == "success"
        
        if passed_invalid and passed_valid:
            log_result("Test Case 6: Manual Billing Promo Code Activation", True, "Successfully verified promo validation and manual activation endpoints.")
        else:
            log_result("Test Case 6: Manual Billing Promo Code Activation", False, f"Invalid code status: {res_invalid.status_code}, Valid code status: {res_valid.status_code}")
    except Exception as e:
        log_result("Test Case 6: Manual Billing Promo Code Activation", False, str(e))

    # Test Case 7: Discuss Messaging & Channel Creation
    try:
        channel_payload = {
            "name": "integration-test-channel",
            "description": "Used to test discuss channels"
        }
        # In discuss/channels endpoint, verify creation
        response = client.post("/api/v1/discuss/channels", headers=headers, json=channel_payload)
        if response.status_code in [200, 201]:
            log_result("Test Case 7: Discuss Channel Creation", True, "Discussion channel created successfully.")
        else:
            log_result("Test Case 7: Discuss Channel Creation", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Test Case 7: Discuss Channel Creation", False, str(e))

    # Test Case 8: HRMS Employees Listing
    try:
        response = client.get("/api/v1/hr/employees", headers=headers)
        if response.status_code == 200:
            employees = response.json()
            emails = [e.get("work_email") for e in employees]
            has_beraxis_domain = any(email and email.endswith("@beraxis.online") for email in emails)
            if has_beraxis_domain:
                log_result("Test Case 8: HRMS Employee Roster Validation", True, f"Employee roster verified: {len(employees)} employees with @beraxis.online emails.")
            else:
                log_result("Test Case 8: HRMS Employee Roster Validation", False, f"No employees found under beraxis.online. Active emails: {emails}")
        else:
            log_result("Test Case 8: HRMS Employee Roster Validation", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Test Case 8: HRMS Employee Roster Validation", False, str(e))

    # Test Case 9: Helpdesk Tickets list
    try:
        response = client.get("/api/v1/helpdesk/tickets", headers=headers)
        if response.status_code == 200:
            log_result("Test Case 9: Helpdesk Ticket Pipeline", True, "Successfully retrieved helpdesk SLA ticket pipeline.")
        else:
            log_result("Test Case 9: Helpdesk Ticket Pipeline", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Test Case 9: Helpdesk Ticket Pipeline", False, str(e))

    # Test Case 10: AI Sentiment Service check
    try:
        response = client.get("/test-ai/sentiment?text=great%20service")
        if response.status_code == 200:
            data = response.json()
            if data.get("sentiment") == "Positive":
                log_result("Test Case 10: AI Sentiment Engine", True, "Sentiment analyzed successfully as 'Positive'.")
            else:
                log_result("Test Case 10: AI Sentiment Engine", False, f"Unexpected sentiment output: {data}")
        else:
            log_result("Test Case 10: AI Sentiment Engine", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Test Case 10: AI Sentiment Engine", False, str(e))

    # Generate Markdown Report
    report_path = "/Users/apple/Documents/ERP-CRM/modules_test_report.md"
    print("\n📝 Generating Test Report Markdown...")
    try:
        with open(report_path, "w") as f:
            f.write("# Beraxis Module Integration Test Report\n\n")
            f.write(f"Generated at: {datetime_str()}\n\n")
            f.write("## Test Summary\n\n")
            
            passed_count = sum(1 for r in test_results if r["passed"])
            f.write(f"- **Total Test Cases**: {len(test_results)}\n")
            f.write(f"- **Passed**: {passed_count}\n")
            f.write(f"- **Failed**: {len(test_results) - passed_count}\n\n")
            
            f.write("## Test Cases Breakdown\n\n")
            f.write("| Status | Test Case | Details |\n")
            f.write("| --- | --- | --- |\n")
            for r in test_results:
                status_icon = "✅ PASSED" if r["passed"] else "❌ FAILED"
                f.write(f"| {status_icon} | {r['name']} | {r['details']} |\n")
                
        print(f"🎉 Test report generated at: {report_path}")
    except Exception as re:
        print(f"⚠️ Failed to write test report: {re}")

def datetime_str():
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

if __name__ == "__main__":
    run_test_suite()
