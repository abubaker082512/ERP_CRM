import sys
sys.path.append('backend')
import os
import json
import traceback

from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

# We can create a mock or valid user token
# Or test endpoints directly
routes = []
for route in app.routes:
    if hasattr(route, "methods") and hasattr(route, "path"):
        for method in route.methods:
            if method in ["GET", "POST", "PUT", "DELETE"]:
                routes.append((method, route.path))

routes = sorted(list(set(routes)), key=lambda x: x[1])

print(f"Total endpoints to test: {len(routes)}")

results = []
errors = []

for method, path in routes:
    # Skip webhooks or openauth redirects if problematic
    # Prepare dummy payload or query params
    # Replace path params like {lead_id}, {id}, etc. with dummy uuids
    test_path = path
    for param in ["{lead_id}", "{id}", "{event_id}", "{production_id}", "{ticket_id}", "{article_id}", "{survey_id}", "{wo_id}", "{bom_id}", "{expense_id}", "{timesheet_id}", "{order_id}", "{applicant_id}", "{employee_id}", "{project_id}", "{task_id}", "{user_id}", "{account_id}", "{journal_id}", "{move_id}", "{channel_id}"]:
        test_path = test_path.replace(param, "00000000-0000-0000-0000-000000000000")
    
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
                "status_code": resp.status_code,
                "response": resp.text
            })
            print(f"[FAIL 500] {method} {path} -> {resp.status_code}: {resp.text[:120]}")
        else:
            # 200, 400, 401, 404, 422 are all acceptable client/auth/validation responses, NOT server crashes (500)
            pass

    except Exception as ex:
        errors.append({
            "method": method,
            "path": path,
            "status_code": 500,
            "response": str(ex),
            "traceback": traceback.format_exc()
        })
        print(f"[CRASH] {method} {path} -> {ex}")

print(f"\nAudit complete! Total routes: {len(routes)}. 500 crashes / unhandled errors: {len(errors)}")

with open('scratch/endpoint_audit_results.json', 'w') as f:
    json.dump({"total": len(routes), "errors_count": len(errors), "errors": errors, "results": results}, f, indent=2)
