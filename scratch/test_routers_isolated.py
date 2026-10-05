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

# Group endpoints by tag / prefix
routes_by_prefix = {}
for path, methods in paths.items():
    prefix = path.split('/')[3] if len(path.split('/')) > 3 else "root"
    for method in methods.keys():
        if method.upper() in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
            routes_by_prefix.setdefault(prefix, []).append((method.upper(), path))

print(f"Total modules to test: {len(routes_by_prefix)}", flush=True)

all_errors = []
module_summary = {}

for mod, endpoints in sorted(routes_by_prefix.items()):
    mod_errors = 0
    mod_total = len(endpoints)
    print(f"\n--- Testing module: [{mod}] ({mod_total} endpoints) ---", flush=True)

    for method, path in endpoints:
        # Replace path parameters
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

            if resp.status_code >= 500:
                mod_errors += 1
                err_info = {
                    "module": mod,
                    "method": method,
                    "path": path,
                    "test_path": test_path,
                    "status_code": resp.status_code,
                    "response": resp.text[:300]
                }
                all_errors.append(err_info)
                print(f"  [500 ERROR] {method} {path} -> {resp.status_code}: {resp.text[:120]}", flush=True)
            else:
                # print(f"  [OK {resp.status_code}] {method} {path}", flush=True)
                pass

        except Exception as ex:
            mod_errors += 1
            err_info = {
                "module": mod,
                "method": method,
                "path": path,
                "test_path": test_path,
                "status_code": 500,
                "response": str(ex),
                "traceback": traceback.format_exc()
            }
            all_errors.append(err_info)
            print(f"  [CRASH] {method} {path} -> {ex}", flush=True)

    module_summary[mod] = {
        "total": mod_total,
        "errors": mod_errors,
        "status": "PASS" if mod_errors == 0 else "FAIL"
    }
    print(f"Module [{mod}]: {mod_total - mod_errors}/{mod_total} endpoints passed", flush=True)

print("\n================ FINAL SUMMARY ================", flush=True)
print(f"Total 500 Errors: {len(all_errors)}", flush=True)
for mod, s in sorted(module_summary.items()):
    status_icon = "✅" if s["status"] == "PASS" else "❌"
    print(f"{status_icon} {mod:20s}: {s['total'] - s['errors']}/{s['total']} passed ({s['errors']} errors)", flush=True)

with open('scratch/module_test_summary.json', 'w') as f:
    json.dump({"summary": module_summary, "errors": all_errors}, f, indent=2)
