import requests
import json

url = "http://localhost:8000/api/v1/auth/signup"
payload = {
    "name": "Test User",
    "email": "test_user_123@example.com",
    "password": "password123"
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
