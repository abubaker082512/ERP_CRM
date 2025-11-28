import os
import sys
from sqlalchemy import create_engine, text

sys.path.append(os.getcwd())
from app.core.config import settings

def apply_update():
    print(f"Connecting to database...")
    if not settings.DATABASE_URL:
        print("Error: DATABASE_URL is not set.")
        return

    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as connection:
            print("Connected. Reading schema_updates_2.sql...")
            with open("schema_updates_2.sql", "r") as f:
                sql = f.read()
            
            print("Executing update...")
            connection.execute(text(sql))
            connection.commit()
            print("Update applied successfully!")
            
    except Exception as e:
        print(f"Error applying update: {e}")

if __name__ == "__main__":
    apply_update()
