import requests

def test_discuss():
    base_url = "https://erp-crm-pvlx.onrender.com/api/v1"
    
    # 1. Login
    login_payload = {
        "email": "admin@erp-crm.com",
        "password": "Bera@0817"
    }
    
    print("Logging in...")
    login_res = requests.post(f"{base_url}/auth/login", json=login_payload)
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.status_code} {login_res.text}")
        return
        
    auth_data = login_res.json()
    token = auth_data["access_token"]
    print("Login successful!")
    
    # 2. Try to create a discuss channel
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    channel_payload = {
        "name": "General Test Channel"
    }
    
    print("Creating channel...")
    channel_res = requests.post(f"{base_url}/discuss/channels", json=channel_payload, headers=headers)
    print(f"Create channel response status: {channel_res.status_code}")
    print(f"Create channel response body: {channel_res.text}")

if __name__ == "__main__":
    test_discuss()
