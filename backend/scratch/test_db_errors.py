import requests

def test_errors():
    base_url = "https://erp-crm-pvlx.onrender.com/api/v1"
    
    # 1. Login
    login_payload = {
        "email": "admin@erp-crm.com",
        "password": "Bera@0817"
    }
    
    login_res = requests.post(f"{base_url}/auth/login", json=login_payload)
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.text}")
        return
        
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # 2. Test Sales List
    print("Testing GET /sales...")
    res = requests.get(f"{base_url}/sales", headers=headers)
    print(f"Sales Status: {res.status_code}")
    print(f"Sales Response: {res.text[:300]}")
    
    # 3. Test Send Message
    print("Testing POST /discuss/messages...")
    # Get active channel first
    chan_res = requests.get(f"{base_url}/discuss/channels", headers=headers)
    if chan_res.status_code == 200 and chan_res.json():
        chan_id = chan_res.json()[0]["id"]
        msg_payload = {
            "channel_id": chan_id,
            "body": "Test Message Error Check",
            "author_name": "Test Script"
        }
        res_msg = requests.post(f"{base_url}/discuss/messages", json=msg_payload, headers=headers)
        print(f"Msg Status: {res_msg.status_code}")
        print(f"Msg Response: {res_msg.text[:300]}")
    else:
        print("No channels found or failed to fetch channels")

if __name__ == "__main__":
    test_errors()
