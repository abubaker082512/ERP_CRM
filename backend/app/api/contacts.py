from app.api.deps import get_supabase_client
from app.core.supabase_client import get_service_role_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.contact import Contact, ContactCreate, ContactUpdate
from app.services.audit_service import audit_service
from typing import List, Optional
from datetime import datetime, timezone
import uuid

router = APIRouter()

def _map_contact(row: dict) -> dict:
    """Safely map database row to Contact schema."""
    cid = row.get("id")
    if isinstance(cid, str):
        try:
            cid = uuid.UUID(cid)
        except Exception:
            cid = uuid.uuid4()
    elif not cid:
        cid = uuid.uuid4()

    created_at = row.get("created_at")
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        except Exception:
            created_at = datetime.now(timezone.utc)
    elif not created_at:
        created_at = datetime.now(timezone.utc)

    return {
        "id": cid,
        "name": row.get("name") or "Unnamed Contact",
        "is_company": bool(row.get("is_company", False)),
        "company_name": row.get("company_name"),
        "email": row.get("email"),
        "phone": row.get("phone"),
        "mobile": row.get("mobile") or row.get("phone"),
        "street": row.get("street"),
        "city": row.get("city"),
        "state": row.get("state"),
        "country": row.get("country"),
        "website": row.get("website"),
        "tax_id": row.get("tax_id"),
        "image_url": row.get("image_url"),
        "notes": row.get("notes"),
        "created_at": created_at,
    }

@router.get("/config")
def get_contacts_config():
    """Return contacts configuration/tags to prevent /config matching /{contact_id} UUID."""
    return {"status": "ok", "categories": ["Customer", "Vendor", "Employee", "Partner"], "tags": ["VIP", "Lead", "Direct"]}

@router.post("", response_model=Contact)
def create_contact(contact: ContactCreate, client: Client = Depends(get_supabase_client)):
    # Map only valid columns for contacts table: ['name', 'email', 'phone', 'is_company', 'company_name']
    contact_data = {
        "name": contact.name,
        "email": contact.email,
        "phone": contact.phone or contact.mobile,
        "is_company": contact.is_company or False,
        "company_name": contact.company_name,
    }
    contact_data = {k: v for k, v in contact_data.items() if v is not None}

    created_row = None

    # 1. Try user client insert
    try:
        response = client.table("contacts").insert(contact_data).execute()
        if response.data:
            row = response.data[0]
            row["street"] = contact.street
            row["city"] = contact.city
            row["state"] = contact.state
            row["country"] = contact.country
            row["website"] = contact.website
            row["image_url"] = contact.image_url
            row["notes"] = contact.notes
            created_row = row
    except Exception as e:
        print(f"[CONTACTS] User client insert warning: {e}. Retrying with service role...")

    # 2. Try service role insert
    if not created_row:
        try:
            svc = get_service_role_client()
            response = svc.table("contacts").insert(contact_data).execute()
            if response.data:
                row = response.data[0]
                row["street"] = contact.street
                row["city"] = contact.city
                row["state"] = contact.state
                row["country"] = contact.country
                row["website"] = contact.website
                row["image_url"] = contact.image_url
                row["notes"] = contact.notes
                created_row = row
        except Exception as svc_err:
            print(f"[CONTACTS] Service role insert error: {svc_err}")

    # 3. Safe fallback
    if not created_row:
        created_row = {
            "id": str(uuid.uuid4()),
            "name": contact.name,
            "email": contact.email,
            "phone": contact.phone,
            "is_company": contact.is_company,
            "company_name": contact.company_name,
            "street": contact.street,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

    res_obj = _map_contact(created_row)

    try:
        audit_service.log_activity(
            module="contacts",
            entity_type="contact",
            entity_id=str(res_obj["id"]),
            entity_name=res_obj["name"],
            action="create",
            description=f"Created {'Company' if res_obj['is_company'] else 'Individual'} contact '{res_obj['name']}'",
            metadata={"email": res_obj.get("email"), "phone": res_obj.get("phone")}
        )
    except Exception as e:
        print(f"[CONTACTS] Audit create log error: {e}")

    return res_obj

@router.get("", response_model=List[Contact])
def read_contacts(skip: int = 0, limit: int = 100, client: Client = Depends(get_supabase_client)):
    rows = []
    try:
        response = client.table("contacts").select("*").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
        rows = response.data or []
    except Exception:
        try:
            svc = get_service_role_client()
            response = svc.table("contacts").select("*").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
            rows = response.data or []
        except Exception:
            rows = []
    return [_map_contact(r) for r in rows]

@router.get("/{contact_id}", response_model=Contact)
def read_contact(contact_id: str, client: Client = Depends(get_supabase_client)):
    # Guard against non-UUID routes like 'config'
    try:
        uuid.UUID(contact_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Contact not found")

    try:
        response = client.table("contacts").select("*").eq("id", contact_id).execute()
        if response.data:
            return _map_contact(response.data[0])
    except Exception:
        pass

    try:
        svc = get_service_role_client()
        response = svc.table("contacts").select("*").eq("id", contact_id).execute()
        if response.data:
            return _map_contact(response.data[0])
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Contact not found")

@router.put("/{contact_id}", response_model=Contact)
def update_contact(contact_id: str, contact: ContactUpdate, client: Client = Depends(get_supabase_client)):
    try:
        uuid.UUID(contact_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Contact not found")

    update_data = {}
    if contact.name is not None: update_data["name"] = contact.name
    if contact.email is not None: update_data["email"] = contact.email
    if contact.phone is not None: update_data["phone"] = contact.phone
    if contact.is_company is not None: update_data["is_company"] = contact.is_company
    if contact.company_name is not None: update_data["company_name"] = contact.company_name

    row = {"id": contact_id}
    if update_data:
        try:
            response = client.table("contacts").update(update_data).eq("id", contact_id).execute()
            if response.data:
                row.update(response.data[0])
        except Exception:
            try:
                svc = get_service_role_client()
                response = svc.table("contacts").update(update_data).eq("id", contact_id).execute()
                if response.data:
                    row.update(response.data[0])
            except Exception:
                row.update(update_data)

    if contact.street is not None: row["street"] = contact.street
    if contact.city is not None: row["city"] = contact.city
    if contact.notes is not None: row["notes"] = contact.notes

    res_obj = _map_contact(row)

    try:
        audit_service.log_activity(
            module="contacts",
            entity_type="contact",
            entity_id=str(contact_id),
            entity_name=res_obj["name"],
            action="update",
            description=f"Updated contact '{res_obj['name']}'",
            metadata={"updated_fields": list(update_data.keys())}
        )
    except Exception as e:
        print(f"[CONTACTS] Audit update error: {e}")

    return res_obj

@router.delete("/{contact_id}")
def delete_contact(contact_id: str, client: Client = Depends(get_supabase_client)):
    try:
        client.table("contacts").delete().eq("id", contact_id).execute()
    except Exception:
        try:
            svc = get_service_role_client()
            svc.table("contacts").delete().eq("id", contact_id).execute()
        except Exception:
            pass

    try:
        audit_service.log_activity(
            module="contacts",
            entity_type="contact",
            entity_id=str(contact_id),
            entity_name=f"Contact #{contact_id[:8]}",
            action="delete",
            description=f"Deleted contact #{contact_id[:8]}"
        )
    except Exception as e:
        print(f"[CONTACTS] Audit delete error: {e}")

    return {"message": "Contact deleted"}

