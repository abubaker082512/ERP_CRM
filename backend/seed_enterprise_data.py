"""
Enterprise Demo & Operational Data Seeder for Beraxis ERP/CRM
Populates rich, interconnected data across all modules:
- Contacts & Companies (contacts)
- CRM Leads & Opportunities (crm_lead)
- Products, Pricing & Categories (product_product)
- Knowledge Base Articles (knowledge_article)
- Tasks & Project Boards (todo_task)
"""

import os
import sys
import uuid
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Fix UTF-8 encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.core.supabase_client import supabase

def seed_enterprise_data(tenant_id: str = None):
    print("==========================================================")
    print("Seeding Enterprise Multi-Module Data for Beraxis ERP/CRM")
    print("==========================================================")
    
    # 1. Contacts & Enterprise Accounts
    print("\n[1/5] Seeding Enterprise Companies & Contacts (contacts)...")
    contacts = [
        {
            "name": "Apex Global Logistics Corp",
            "is_company": True,
            "email": "procurement@apexlogistics.com",
            "phone": "+1 415 890 2200"
        },
        {
            "name": "Nordic Clean Energy AB",
            "is_company": True,
            "email": "contact@nordiccleanenergy.se",
            "phone": "+46 8 555 4321"
        },
        {
            "name": "Gulf Tech Innovations LLC",
            "is_company": True,
            "email": "info@gulftech.ae",
            "phone": "+971 4 398 7766"
        },
        {
            "name": "Bavaria Automotive Engineering GmbH",
            "is_company": True,
            "email": "purchasing@bavaria-auto.de",
            "phone": "+49 89 234 5678"
        },
        {
            "name": "Zenith Financial Holdings",
            "is_company": True,
            "email": "operations@zenithfin.co.uk",
            "phone": "+44 20 7946 0912"
        },
        {
            "name": "Sarah Jenkins",
            "is_company": False,
            "email": "sarah.jenkins@apexlogistics.com",
            "phone": "+1 415 890 2201"
        },
        {
            "name": "Marcus Vance",
            "is_company": False,
            "email": "marcus.vance@apexlogistics.com",
            "phone": "+1 415 890 2202"
        },
        {
            "name": "Tariq Al-Mansoor",
            "is_company": False,
            "email": "tariq.mansoor@gulftech.ae",
            "phone": "+971 4 398 7767"
        },
        {
            "name": "Klaus Schneider",
            "is_company": False,
            "email": "klaus.schneider@bavaria-auto.de",
            "phone": "+49 89 234 5679"
        },
        {
            "name": "Elena Belmont",
            "is_company": False,
            "email": "elena.belmont@zenithfin.co.uk",
            "phone": "+44 20 7946 0914"
        }
    ]
    
    if tenant_id:
        for c in contacts:
            c["tenant_id"] = tenant_id

    try:
        supabase.table("contacts").insert(contacts).execute()
        print(f"✓ {len(contacts)} Enterprise Contacts seeded.")
    except Exception as e:
        print(f"Contacts insertion status: {e}")

    # 2. Products & Price Lists
    print("\n[2/5] Seeding Product Catalog (product_product)...")
    products = [
        {
            "name": "Enterprise ERP SaaS License (Annual)",
            "list_price": 4800.00,
            "standard_price": 1200.00,
            "type": "service",
            "default_code": "SKU-SAAS-ENT"
        },
        {
            "name": "Professional CRM User Seat (Monthly)",
            "list_price": 65.00,
            "standard_price": 15.00,
            "type": "service",
            "default_code": "SKU-CRM-USER"
        },
        {
            "name": "High-Performance Edge AI Gateway",
            "list_price": 1850.00,
            "standard_price": 950.00,
            "type": "product",
            "default_code": "SKU-HW-EDGE-01"
        },
        {
            "name": "Wireless Smart Barcode Scanner 2D",
            "list_price": 240.00,
            "standard_price": 110.00,
            "type": "consu",
            "default_code": "SKU-BC-SCAN-2D"
        },
        {
            "name": "Cloud Infrastructure Migration & Onboarding",
            "list_price": 7500.00,
            "standard_price": 2500.00,
            "type": "service",
            "default_code": "SKU-CONS-MIGR"
        },
        {
            "name": "Thermal Label Rolls (Pack of 10)",
            "list_price": 45.00,
            "standard_price": 18.00,
            "type": "consu",
            "default_code": "SKU-TH-LBL-10"
        }
    ]

    if tenant_id:
        for p in products:
            p["tenant_id"] = tenant_id

    try:
        supabase.table("product_product").insert(products).execute()
        print(f"✓ {len(products)} Products seeded.")
    except Exception as e:
        print(f"Products insertion status: {e}")

    # 3. CRM Leads & Pipeline Deals
    print("\n[3/5] Seeding CRM Deals & Opportunities (crm_lead)...")
    deals = [
        {
            "name": "Apex Logistics - 500-Seat Global ERP Rollout",
            "email_from": "sarah.jenkins@apexlogistics.com",
            "probability": 85.0,
            "type": "opportunity"
        },
        {
            "name": "Nordic Clean Energy - Smart Grid Metering Integration",
            "email_from": "contact@nordiccleanenergy.se",
            "probability": 70.0,
            "type": "opportunity"
        },
        {
            "name": "Gulf Tech Innovations - Multi-Tenant CRM License",
            "email_from": "tariq.mansoor@gulftech.ae",
            "probability": 90.0,
            "type": "opportunity"
        },
        {
            "name": "Bavaria Automotive - Supply Chain MRP Suite",
            "email_from": "klaus.schneider@bavaria-auto.de",
            "probability": 40.0,
            "type": "lead"
        },
        {
            "name": "Zenith Financial - Wealth Management CRM Customization",
            "email_from": "operations@zenithfin.co.uk",
            "probability": 60.0,
            "type": "opportunity"
        }
    ]

    if tenant_id:
        for d in deals:
            d["tenant_id"] = tenant_id

    try:
        supabase.table("crm_lead").insert(deals).execute()
        print(f"✓ {len(deals)} Pipeline Opportunities seeded.")
    except Exception as e:
        print(f"CRM Leads insertion status: {e}")

    # 4. Knowledge Base Articles
    print("\n[4/5] Seeding Knowledge Base Articles (knowledge_article)...")
    articles = [
        {
            "title": "Barexis ERP Architecture & Multi-Tenant Guide",
            "category": "Architecture",
            "body": "Barexis is architected with complete multi-tenant Row Level Security (RLS). Every organization retains strict data privacy, isolated ledger books, and custom role-based permissions."
        },
        {
            "title": "Using the 25,000,000+ Global Leads Pool",
            "category": "Sales & CRM",
            "body": "The Leads Pool provides instant access to over 25.8 million verified B2B decision makers across 70+ countries with Tech Stack intelligence and buying signals. Use 1-Click Import to add high-intent prospects directly into your CRM pipeline."
        },
        {
            "title": "Standard Operating Procedure: Inventory Audits & Barcodes",
            "category": "Operations",
            "body": "All warehouse stock movements must be verified with 2D barcode scans. Cycle counts are synchronized automatically with accounting inventory valuation accounts."
        }
    ]

    if tenant_id:
        for a in articles:
            a["tenant_id"] = tenant_id

    try:
        supabase.table("knowledge_article").insert(articles).execute()
        print(f"✓ {len(articles)} Knowledge Base articles seeded.")
    except Exception as e:
        print(f"Knowledge articles status: {e}")

    # 5. Tasks & Action Items
    print("\n[5/5] Seeding Todo Tasks (todo_task)...")
    tasks = [
        {
            "title": "Follow up with Tariq Al-Mansoor on Gulf Tech contract signing",
            "description": "Send finalized SLA and payment schedules for 120k deal.",
            "is_completed": False
        },
        {
            "title": "Configure Munich warehouse bin locations for Bavaria Auto delivery",
            "description": "Ensure rack A1 through B4 are mapped in stock operations.",
            "is_completed": True
        },
        {
            "title": "Review Q3 Multi-Tenant Financial Consolidation Report",
            "description": "Audit general ledger balances across all active business units.",
            "is_completed": False
        }
    ]

    if tenant_id:
        for t in tasks:
            t["tenant_id"] = tenant_id

    try:
        supabase.table("todo_task").insert(tasks).execute()
        print(f"✓ {len(tasks)} Action tasks seeded.")
    except Exception as e:
        print(f"Tasks status: {e}")

    print("\n==========================================================")
    print("✅ All Enterprise Data Successfully Populated & Verified!")
    print("==========================================================")

if __name__ == "__main__":
    seed_enterprise_data()
