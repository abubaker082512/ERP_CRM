"""
Apply schema_patch.sql to Supabase via direct SQL execution.
Run from the backend/ directory.
"""
import os
import sys
sys.path.insert(0, ".")

# Load .env
from dotenv import load_dotenv
load_dotenv()

from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_KEY in .env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Read the patch SQL
with open("schema_patch.sql", "r") as f:
    sql = f.read()

# Split into individual statements (skip empty ones)
statements = [s.strip() for s in sql.split(";") if s.strip() and not s.strip().startswith("--")]

print(f"Applying {len(statements)} SQL statements to Supabase...\n")

success = 0
failed = 0
for i, stmt in enumerate(statements):
    try:
        result = supabase.rpc("exec_sql", {"sql": stmt + ";"}).execute()
        print(f"  ✅ [{i+1}] OK")
        success += 1
    except Exception as e:
        err_msg = str(e)
        # Ignore "already exists" or "column already exists" errors — idempotent
        if "already exists" in err_msg.lower() or "does not exist" in err_msg.lower():
            print(f"  ⚠️  [{i+1}] Skipped (already applied or N/A): {err_msg[:80]}")
        else:
            print(f"  ❌ [{i+1}] Failed: {err_msg[:120]}")
            failed += 1

print(f"\nDone: {success} applied, {failed} failed.")
