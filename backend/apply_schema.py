import os
import sys
from sqlalchemy import create_engine, text

# Add current directory to sys.path to import app modules
sys.path.append(os.getcwd())

from app.core.config import settings

def apply_schema():
    print(f"Connecting to database...")
    # Ensure DATABASE_URL is set
    if not settings.DATABASE_URL:
        print("Error: DATABASE_URL is not set in settings.")
        return

    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as connection:
            print("Connected. Reading schema.sql...")
            with open("schema.sql", "r") as f:
                schema_sql = f.read()
            
            print("Executing schema...")
            # Split by ; to execute statements one by one if needed, 
            # but sqlalchemy execute(text()) might handle blocks.
            # However, for DDL, it's often safer to execute the whole block or split.
            # Supabase/Postgres usually handles multiple statements.
            connection.execute(text(schema_sql))
            connection.commit()
            print("Schema applied successfully!")
            
    except Exception as e:
        print(f"Error applying schema: {e}")

if __name__ == "__main__":
    apply_schema()
