import os
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

sys.path.append(os.getcwd())

def test_db_insert():
    print(f"Testing DB connection to: {settings.DATABASE_URL}")
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as connection:
            print("Connected. Attempting insert...")
            # Insert into knowledge_article
            sql = text("""
                INSERT INTO knowledge_article (title, body, category)
                VALUES ('Test Manual Insert', 'Body content', 'General')
                RETURNING id;
            """)
            result = connection.execute(sql)
            connection.commit()
            print(f"Insert successful! ID: {result.fetchone()[0]}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_db_insert()
