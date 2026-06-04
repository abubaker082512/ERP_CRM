from sqlalchemy import create_engine, text
import json

def run_sql():
    db_url = "postgresql://postgres.rzqnojqmmtwkkrviaasc:YQ2Sja7rAFh1zPXs@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
    engine = create_engine(db_url)
    
    try:
        with engine.connect() as connection:
            # 1. Check mail_message columns
            sql = text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'mail_message';")
            res = connection.execute(sql)
            columns = [{"column_name": r[0], "data_type": r[1]} for r in res]
            print(f"Columns of mail_message:\n{json.dumps(columns, indent=2)}")
            
            # 2. Check mail_channel columns
            sql2 = text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'mail_channel';")
            res2 = connection.execute(sql2)
            columns2 = [{"column_name": r[0], "data_type": r[1]} for r in res2]
            print(f"Columns of mail_channel:\n{json.dumps(columns2, indent=2)}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_sql()
