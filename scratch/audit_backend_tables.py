import glob
import re
import json

with open('scratch/supabase_schema.json') as f:
    live_schema = json.load(f)
live_tables = set(live_schema.keys())

files = glob.glob('backend/app/api/*.py')
table_usage = {}
missing_tables_in_code = {}

for filepath in sorted(files):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    matches = re.findall(r'table\(["\']([^"\']+)["\']\)', content)
    for t in matches:
        table_usage.setdefault(t, set()).add(filepath)
        if t not in live_tables:
            missing_tables_in_code.setdefault(t, set()).add(filepath)

print(f"Total distinct tables referenced in backend: {len(table_usage)}")
print(f"Total missing tables referenced in backend: {len(missing_tables_in_code)}")
for t, fps in sorted(missing_tables_in_code.items()):
    clean_fps = [fp.replace("backend/app/api\\", "").replace("backend/app/api/", "") for fp in fps]
    print(f"  MISSING TABLE: {t} -> in {clean_fps}")
