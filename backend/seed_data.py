import os
import sys
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.supabase_client import supabase

def seed_data():
    print("Starting data seeding...")

    # 1. Seed Contacts
    print("Seeding contacts...")
    contacts = [
        {"name": "Alice Smith", "email": "alice@example.com", "phone": "1234567890"},
        {"name": "Bob Jones", "email": "bob@example.com", "phone": "0987654321"},
        {"name": "Tech Corp", "email": "info@techcorp.com", "is_company": True},
    ]
    try:
        supabase.table("contacts").insert(contacts).execute()
        print("Contacts seeded successfully.")
    except Exception as e:
        print(f"Error seeding contacts: {e}")

    # 2. Seed Products
    print("Seeding products...")
    products = [
        {"name": "Laptop Pro", "list_price": 1200.00, "standard_price": 800.00, "type": "product", "default_code": "LAP001"},
        {"name": "Wireless Mouse", "list_price": 25.00, "standard_price": 10.00, "type": "consu", "default_code": "MOU001"},
        {"name": "Consulting Service", "list_price": 150.00, "standard_price": 0.0, "type": "service", "default_code": "SRV001"},
    ]
    try:
        supabase.table("product_product").insert(products).execute()
        print("Products seeded successfully.")
    except Exception as e:
        print(f"Error seeding products: {e}")

    # 3. Seed Leads
    print("Seeding leads...")
    leads = [
        {"name": "New Project Inquiry", "email_from": "jane@gmail.com", "probability": 20.0, "type": "lead"},
        {"name": "Bulk Order Opportunity", "email_from": "sales@bigretail.com", "probability": 60.0, "type": "opportunity"},
    ]
    try:
        supabase.table("crm_lead").insert(leads).execute()
        print("Leads seeded successfully.")
    except Exception as e:
        print(f"Error seeding leads: {e}")

    # 4. Seed Knowledge Articles
    print("Seeding knowledge articles...")
    articles = [
        {"title": "How to use the ERP", "body": "Welcome to our Next-Gen AI ERP system...", "category": "General"},
        {"title": "Inventory Best Practices", "body": "Always count your stock before moving it.", "category": "Inventory"},
    ]
    try:
        supabase.table("knowledge_article").insert(articles).execute()
        print("Articles seeded successfully.")
    except Exception as e:
        print(f"Error seeding articles: {e}")

    # 5. Seed Tasks
    print("Seeding tasks...")
    tasks = [
        {"title": "Review sales report", "description": "Need to check the Q3 numbers.", "is_completed": False},
        {"title": "Setup warehouse A", "description": "Configure locations and bins.", "is_completed": True},
    ]
    try:
        supabase.table("todo_task").insert(tasks).execute()
        print("Tasks seeded successfully.")
    except Exception as e:
        print(f"Error seeding tasks: {e}")

    print("Data seeding completed!")

if __name__ == "__main__":
    seed_data()
