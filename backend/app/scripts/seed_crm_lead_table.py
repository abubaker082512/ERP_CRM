import sys
import os

# Add backend directory to path
sys.path.append(os.path.abspath('backend'))

from app.core.supabase_client import get_service_role_client
from app.services.real_lead_extractor import VERIFIED_REAL_BUSINESSES

def seed_supabase_leads():
    supabase = get_service_role_client()
    print(f"[*] Seeding verified open-source leads into Supabase `crm_lead`...")

    # Fetch existing directory leads to avoid duplicate inserts
    try:
        existing = supabase.table("crm_lead").select("id, name, email_from").eq("type", "directory").execute()
        existing_names = set(r["name"] for r in (existing.data or []))
    except Exception as e:
        print("Notice checking existing:", e)
        existing_names = set()

    success = 0
    skipped = 0

    for lead in VERIFIED_REAL_BUSINESSES:
        city = lead.get('city', 'Corporate HQ')
        country = lead.get('country', 'Global')
        formatted_name = f"{lead['company_name']} - {lead.get('contact_name', 'Executive')} ({city}, {country})"
        
        if formatted_name in existing_names:
            skipped += 1
            continue

        row = {
            "name": formatted_name,
            "email_from": lead.get("email"),
            "phone": lead.get("phone"),
            "type": "directory",
            "stage_id": lead.get("industry", "Technology & SaaS"),
            "probability": float(lead.get("rating", 4.8)) * 20.0 # e.g. 4.9 * 20 = 98.0
        }

        try:
            res = supabase.table("crm_lead").insert(row).execute()
            if res.data:
                success += 1
                existing_names.add(formatted_name)
                print(f" [+] Inserted: {lead['company_name']} ({lead.get('country')})")
        except Exception as e:
            print(f" [!] Error inserting {lead['company_name']}: {e}")

    print(f"[*] Seeding finished! Inserted: {success}, Skipped: {skipped}")

if __name__ == "__main__":
    seed_supabase_leads()
