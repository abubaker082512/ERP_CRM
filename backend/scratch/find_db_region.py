import psycopg2
import sys

def scan_regions():
    regions = [
        "us-east-1", "us-east-2", "us-west-1", "us-west-2",
        "eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1",
        "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2",
        "ap-south-1", "sa-east-1", "ca-central-1"
    ]
    
    password = "YQ2Sja7rAFh1zPXs"
    project_ref = "rzqnojqmmtwkkrviaasc"
    
    for r in regions:
        host = f"aws-0-{r}.pooler.supabase.com"
        db_url = f"postgresql://postgres.{project_ref}:{password}@{host}:5432/postgres"
        try:
            conn = psycopg2.connect(db_url, connect_timeout=2)
            print(f"🎉 SUCCESS! Connected to region: {r}")
            conn.close()
            return r
        except Exception as e:
            print(f"Region {r} error: {e}")
                
    return None

if __name__ == "__main__":
    scan_regions()
