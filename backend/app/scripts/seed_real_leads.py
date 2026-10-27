import sys
import os

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.core.supabase_client import get_service_role_client
from app.services.real_lead_extractor import VERIFIED_REAL_BUSINESSES

def seed_verified_leads():
    """
    Seed verified real B2B leads into Supabase `crm_leads_directory`.
    """
    supabase = get_service_role_client()
    print(f"[*] Seeding {len(VERIFIED_REAL_BUSINESSES)} verified real businesses into Supabase...")

    success = 0
    errors = 0

    for lead in VERIFIED_REAL_BUSINESSES:
        payload = {
            "company_name": lead["company_name"],
            "contact_name": lead.get("contact_name"),
            "job_title": lead.get("job_title"),
            "email": lead.get("email"),
            "email_status": "verified",
            "phone": lead.get("phone"),
            "phone_type": "office",
            "website": lead.get("website"),
            "address": lead.get("address"),
            "city": lead.get("city", "Lahore"),
            "country": lead.get("country", "Pakistan"),
            "industry": lead.get("industry", "Technology & SaaS"),
            "employees": lead.get("employees"),
            "annual_revenue": lead.get("annual_revenue"),
            "rating": lead.get("rating", 4.8),
            "source": lead.get("source", "verified_registry"),
            "google_place_id": lead.get("google_place_id")
        }

        try:
            res = supabase.table("crm_leads_directory").upsert(
                payload,
                on_conflict="company_name"
            ).execute()
            if res.data:
                success += 1
                print(f" [+] Inserted/Updated: {lead['company_name']} ({lead['city']}, {lead['country']})")
        except Exception as e:
            errors += 1
            print(f" [!] Notice for {lead['company_name']}: {e}")

    print(f"[*] Seeding completed: {success} succeeded, {errors} skipped/errors.")

if __name__ == "__main__":
    seed_verified_leads()
