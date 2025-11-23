import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_create_lead():
    print("Testing Create Lead...")
    payload = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "company_name": "Acme Corp",
        "status": "New",
        "source": "Referral"
    }
    try:
        response = requests.post(f"{BASE_URL}/leads/", json=payload)
        if response.status_code == 200:
            print("Lead Created Successfully:")
            print(json.dumps(response.json(), indent=2))
            return response.json()["id"]
        else:
            print(f"Failed to Create Lead. Status: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_get_leads():
    print("\nTesting Get Leads...")
    try:
        response = requests.get(f"{BASE_URL}/leads/")
        if response.status_code == 200:
            print(f"Leads Retrieved: {len(response.json())}")
            # print(json.dumps(response.json(), indent=2))
        else:
            print(f"Failed to Get Leads. Status: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    lead_id = test_create_lead()
    if lead_id:
        test_get_leads()
