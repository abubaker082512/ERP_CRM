import sys
sys.path.append('backend')
import os
import json
import traceback

from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

openapi_spec = app.openapi()
paths = openapi_spec.get('paths', {})

endpoints = []
for path, methods in paths.items():
    for method in methods.keys():
        if method.upper() in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
            endpoints.append((method.upper(), path))

endpoints = sorted(endpoints, key=lambda x: (x[1], x[0]))

print(f"Total OpenAPI Endpoints: {len(endpoints)}")

errors = []
results = []

for method, path in endpoints:
    # Replace path parameters with valid mock UUIDs or mock strings
    test_path = path
    import re
    test_path = re.sub(r'\{[a-zA-Z0-9_]+\}', '00000000-0000-0000-0000-000000000000', test_path)
    
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_KEY}"
    }

    try:
        if method == "GET":
            resp = client.get(test_path, headers=headers)
        elif method == "POST":
            resp = client.post(test_path, json={}, headers=headers)
        elif method == "PUT":
            resp = client.put(test_path, json={}, headers=headers)
        elif method == "DELETE":
            resp = client.delete(test_path, headers=headers)
        elif method == "PATCH":
            resp = client.patch(test_path, json={}, headers=headers)
        else:
            continue

        results.append({
            "method": method,
            "path": path,
            "test_path": test_path,
            "status_code": resp.status_code,
            "response": resp.text[:200]
        })

        if resp.status_code >= 500:
            errors.append({
                "method": method,
                "path": path,
                "test_path": test_path,
                "status_code": resp.status_code,
                "response": resp.text
            })
            print(f"[FAIL 500] {method} {path} -> {resp.status_code}: {resp.text[:120]}")

    except Exception as ex:
        errors.append({
            "method": method,
            "path": path,
            "test_path": test_path,
            "status_code": 500,
            "response": str(ex),
            "traceback": traceback.format_exc()
        })
        print(f"[CRASH] {method} {path} -> {ex}")

print(f"\n==========================================")
print(f"TOTAL ENDPOINTS TESTED: {len(endpoints)}")
print(f"500 INTERNAL SERVER ERRORS / CRASHES: {len(errors)}")
print(f"==========================================")

with open('scratch/all_endpoints_test_results.json', 'w') as f:
    json.dump({"total": len(endpoints), "errors_count": len(errors), "errors": errors, "results": results}, f, indent=2)
