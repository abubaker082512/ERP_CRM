import os
from sqlalchemy import create_engine, text

# Use the password found in IMPLEMENTATION_SUMMARY.md
# and the project ref found in .env
db_url = "postgresql://postgres:YQ2Sja7rAFh1zPXs@db.rzqnojqmmtwkkrviaasc.supabase.co:5432/postgres"

print(f"Testing connection to: {db_url}")
try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print(f"Success! Result: {result.scalar()}")
except Exception as e:
    print(f"Failed: {e}")
