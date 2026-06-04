import requests
import json
from datetime import datetime

def run_live_tests():
    base_url = "https://erp-crm-pvlx.onrender.com/api/v1"
    
    print("====================================================")
    print("🧪 RUNNING LIVE VERIFICATION ON PRODUCTION BACKEND")
    print("====================================================")
    
    test_results = []
    
    def log_result(name, passed, details=""):
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"[{status}] {name}")
        if details:
            print(f"   ↳ {details}")
        test_results.append({"name": name, "passed": passed, "details": details})

    # 1. Login
    token = None
    try:
        login_payload = {
            "email": "admin@erp-crm.com",
            "password": "Bera@0817"
        }
        res = requests.post(f"{base_url}/auth/login", json=login_payload)
        if res.status_code == 200:
            data = res.json()
            token = data.get("access_token")
            log_result("Auth: Login", True, f"Logged in. Token length: {len(token) if token else 0}")
        else:
            log_result("Auth: Login", False, f"HTTP {res.status_code}: {res.text}")
            return
    except Exception as e:
        log_result("Auth: Login", False, str(e))
        return

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # 2. Get Current User (Auth/Me)
    try:
        res = requests.get(f"{base_url}/auth/me", headers=headers)
        if res.status_code == 200:
            log_result("Auth: Me Profiles", True, f"Response: {res.text[:120]}...")
        else:
            log_result("Auth: Me Profiles", False, f"HTTP {res.status_code}: {res.text}")
    except Exception as e:
        log_result("Auth: Me Profiles", False, str(e))

    # 3. CRM Leads listing & creation
    try:
        lead_payload = {
            "name": "Live Test Lead",
            "email_from": "livetest@beraxis.online",
            "phone": "+1 555-0199",
            "company_name": "Live Test Corp",
            "notes": "Testing Discuss and Leads"
        }
        res_create = requests.post(f"{base_url}/leads", headers=headers, json=lead_payload)
        if res_create.status_code == 200:
            log_result("CRM: Create Lead & AI Score", True, f"Lead scored: {res_create.json().get('probability')}%")
        else:
            log_result("CRM: Create Lead & AI Score", False, f"HTTP {res_create.status_code}: {res_create.text}")
            
        res_list = requests.get(f"{base_url}/leads", headers=headers)
        if res_list.status_code == 200:
            log_result("CRM: List Leads", True, f"Found {len(res_list.json())} leads")
        else:
            log_result("CRM: List Leads", False, f"HTTP {res_list.status_code}: {res_list.text}")
    except Exception as e:
        log_result("CRM Module", False, str(e))

    # 4. Products Catalog
    try:
        res = requests.get(f"{base_url}/products", headers=headers)
        if res.status_code == 200:
            log_result("Products: List", True, f"Found {len(res.json())} products")
        else:
            log_result("Products: List", False, f"HTTP {res.status_code}: {res.text}")
    except Exception as e:
        log_result("Products Module", False, str(e))

    # 5. Discuss Channels & Messages
    try:
        channel_name = f"live-channel-{int(datetime.now().timestamp())}"
        res_create = requests.post(f"{base_url}/discuss/channels", headers=headers, json={"name": channel_name})
        if res_create.status_code == 200:
            channel = res_create.json()
            log_result("Discuss: Create Channel", True, f"Created {channel.get('name')} (ID: {channel.get('id')})")
            
            # Send Message
            msg_payload = {
                "channel_id": channel["id"],
                "body": "Hello Live World!",
                "author_name": "Test Script"
            }
            res_msg = requests.post(f"{base_url}/discuss/messages", headers=headers, json=msg_payload)
            if res_msg.status_code == 200:
                log_result("Discuss: Send Message", True, "Message sent successfully")
            else:
                log_result("Discuss: Send Message", False, f"HTTP {res_msg.status_code}: {res_msg.text}")
                
            # Get Messages
            res_msgs = requests.get(f"{base_url}/discuss/channels/{channel['id']}/messages", headers=headers)
            if res_msgs.status_code == 200:
                log_result("Discuss: Get Messages", True, f"Retrieved {len(res_msgs.json())} messages")
            else:
                log_result("Discuss: Get Messages", False, f"HTTP {res_msgs.status_code}: {res_msgs.text}")
        else:
            log_result("Discuss: Create Channel", False, f"HTTP {res_create.status_code}: {res_create.text}")
    except Exception as e:
        log_result("Discuss Module", False, str(e))

    # 6. HRMS Employees
    try:
        res = requests.get(f"{base_url}/hr/employees", headers=headers)
        if res.status_code == 200:
            log_result("HRMS: List Employees", True, f"Found {len(res.json())} employees")
        else:
            log_result("HRMS: List Employees", False, f"HTTP {res.status_code}: {res.text}")
    except Exception as e:
        log_result("HRMS Module", False, str(e))

    # 7. Helpdesk Tickets
    try:
        res = requests.get(f"{base_url}/helpdesk/tickets", headers=headers)
        if res.status_code == 200:
            log_result("Helpdesk: List Tickets", True, f"Found {len(res.json())} tickets")
        else:
            log_result("Helpdesk: List Tickets", False, f"HTTP {res.status_code}: {res.text}")
    except Exception as e:
        log_result("Helpdesk Module", False, str(e))

    # 8. Sales Orders
    try:
        res = requests.get(f"{base_url}/sales", headers=headers)
        if res.status_code == 200:
            log_result("Sales: List Orders", True, f"Found {len(res.json())} orders")
        else:
            log_result("Sales: List Orders", False, f"HTTP {res.status_code}: {res.text}")
    except Exception as e:
        log_result("Sales Module", False, str(e))

    # 9. Inventory Warehouse / Stock
    try:
        res = requests.get(f"{base_url}/inventory/warehouses", headers=headers)
        if res.status_code == 200:
            log_result("Inventory: List Warehouses", True, f"Found {len(res.json())} warehouses")
        else:
            log_result("Inventory: List Warehouses", False, f"HTTP {res.status_code}: {res.text}")
    except Exception as e:
        log_result("Inventory Module", False, str(e))

    # 10. Accounting Accounts & Moves
    try:
        res = requests.get(f"{base_url}/accounting/accounts", headers=headers)
        if res.status_code == 200:
            log_result("Accounting: List Accounts", True, f"Found {len(res.json())} accounts")
        else:
            log_result("Accounting: List Accounts", False, f"HTTP {res.status_code}: {res.text}")
    except Exception as e:
        log_result("Accounting Module", False, str(e))

    # 11. SuperAdmin: Live Stats Verification
    try:
        res = requests.get(f"{base_url}/super-admin/stats", headers=headers)
        if res.status_code == 200:
            log_result("SuperAdmin: Stats", True, f"Response: {res.text[:120]}...")
        else:
            log_result("SuperAdmin: Stats", False, f"HTTP {res.status_code}: {res.text}")
    except Exception as e:
        log_result("SuperAdmin Module", False, str(e))

if __name__ == "__main__":
    run_live_tests()
