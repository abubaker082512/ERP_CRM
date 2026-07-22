import os
import hashlib
import hmac
import json
import uuid
import httpx
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
from app.api.deps import get_supabase_client
from supabase import Client

router = APIRouter()
# Public router — no JWT required (used for payment provider webhooks)
public_router = APIRouter()

# Plisio API Configuration
PLISIO_SECRET_KEY = os.environ.get("PLISIO_SECRET_KEY", "")
PLISIO_API_BASE = "https://api.plisio.net/api/v1"
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.environ.get("BACKEND_URL", "https://galaxy-erp-backend.onrender.com")

# Plan pricing in USD
PLAN_PRICES = {
    "pro": 199.00,
    "starter": 49.00,
    "enterprise": 499.00,
}

class CreateInvoiceRequest(BaseModel):
    plan_name: str = "pro"
    currency: str = "BTC"  # Crypto currency to pay in
    email: Optional[str] = None
    amount_usd: Optional[float] = None

class ManualActivateRequest(BaseModel):
    promo_code: Optional[str] = ""


def _verify_plisio_hash(data: dict, secret_key: str) -> bool:
    """
    Verify Plisio IPN callback authenticity using SHA1 hash.
    Plisio computes: sha1(json_encode(sorted_params) + secret_key)
    """
    try:
        verify_hash = data.pop("verify_hash", None)
        if not verify_hash:
            return False

        # Sort params alphabetically, encode to JSON, append secret key
        sorted_data = dict(sorted(data.items()))
        json_str = json.dumps(sorted_data, separators=(",", ":"))
        computed = hashlib.sha1((json_str + secret_key).encode()).hexdigest()

        return hmac.compare_digest(computed, verify_hash)
    except Exception as e:
        print(f"[PLISIO] Hash verification error: {e}")
        return False


@router.post("/create-invoice")
async def create_plisio_invoice(
    request: CreateInvoiceRequest,
    client: Client = Depends(get_supabase_client)
):
    """
    Create a Plisio crypto payment invoice.
    Returns invoice_url to redirect the user to Plisio's hosted payment page.
    """
    from app.core.supabase_client import token_ctx_var
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp or not user_resp.user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user = user_resp.user
    user_id = user.id
    user_email = request.email or (user.email if user.email else "")

    # Calculate price
    plan_key = request.plan_name.lower()
    if request.amount_usd and request.amount_usd > 0:
        source_amount = round(request.amount_usd, 2)
    else:
        source_amount = PLAN_PRICES.get(plan_key, 199.00)

    # Generate a unique order number
    order_number = str(uuid.uuid4())[:8].upper()

    # Callback URL for Plisio to notify us on payment status changes
    callback_url = f"{BACKEND_URL}/api/billing/plisio-callback"

    # Build Plisio API params
    params = {
        "api_key": PLISIO_SECRET_KEY,
        "currency": request.currency.upper(),
        "source_currency": "USD",
        "source_amount": str(source_amount),
        "order_number": order_number,
        "order_name": f"Beraxis {request.plan_name.title()} Plan",
        "description": f"Beraxis SaaS - {request.plan_name.title()} Plan subscription",
        "email": user_email,
        "callback_url": callback_url,
        "success_invoice_url": f"{FRONTEND_URL}/dashboard?billing_success=true&order={order_number}",
        "fail_invoice_url": f"{FRONTEND_URL}/billing?canceled=true",
        "language": "en",
        # Pass user_id so the callback can activate the correct tenant
        "plugin": f"beraxis|{user_id}|{plan_key}",
    }

    # If no secret key configured, return a mock response for development
    if not PLISIO_SECRET_KEY:
        print("[PLISIO] No PLISIO_SECRET_KEY configured. Returning mock invoice.")
        return {
            "invoice_url": f"{FRONTEND_URL}/dashboard?billing_success=true&mock=true",
            "txn_id": f"mock_{order_number}",
            "order_number": order_number,
            "amount_usd": source_amount,
            "currency": request.currency.upper(),
            "mock": True,
            "message": "Development mode: No Plisio key configured. Set PLISIO_SECRET_KEY in your environment."
        }

    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            response = await http_client.get(
                f"{PLISIO_API_BASE}/invoices/new",
                params=params
            )
            result = response.json()

        if result.get("status") == "success":
            data = result["data"]
            return {
                "invoice_url": data.get("invoice_url"),
                "txn_id": data.get("txn_id"),
                "order_number": order_number,
                "amount_usd": source_amount,
                "currency": request.currency.upper(),
                "mock": False
            }
        else:
            error_msg = result.get("data", {}).get("message", "Failed to create invoice")
            raise HTTPException(status_code=422, detail=f"Plisio error: {error_msg}")

    except HTTPException:
        raise
    except Exception as e:
        print(f"[PLISIO] Invoice creation error: {e}")
        # Fallback: redirect to dashboard with mock success
        return {
            "invoice_url": f"{FRONTEND_URL}/dashboard?billing_success=true&fallback=true",
            "txn_id": f"fallback_{order_number}",
            "order_number": order_number,
            "amount_usd": source_amount,
            "currency": request.currency.upper(),
            "mock": True,
            "error": str(e)
        }


@public_router.post("/plisio-callback")
async def plisio_callback(request: Request):
    """
    Plisio IPN (Instant Payment Notification) callback endpoint.
    Called by Plisio when payment status changes.
    Verifies the SHA1 hash and activates subscription on 'completed' status.
    NOTE: This is a public endpoint — no JWT auth required.
    """
    try:
        body = await request.body()
        # Plisio sends form-encoded or JSON data
        try:
            data = json.loads(body)
        except Exception:
            from urllib.parse import parse_qs
            parsed = parse_qs(body.decode())
            data = {k: v[0] if len(v) == 1 else v for k, v in parsed.items()}

        print(f"[PLISIO] Callback received: status={data.get('status')}, txn={data.get('txn_id')}")

        # Verify authenticity using SHA1 hash
        if PLISIO_SECRET_KEY:
            data_copy = dict(data)
            if not _verify_plisio_hash(data_copy, PLISIO_SECRET_KEY):
                print("[PLISIO] Hash verification FAILED — callback rejected")
                raise HTTPException(status_code=400, detail="Invalid hash signature")

        status = data.get("status", "")
        txn_id = data.get("txn_id", "")

        # Extract user_id and plan from the plugin field we set at invoice creation
        # plugin format: "beraxis|{user_id}|{plan_key}"
        plugin_str = data.get("plugin", "")
        user_id = None
        plan_key = "pro"

        if plugin_str and "|" in plugin_str:
            parts = plugin_str.split("|")
            if len(parts) >= 2:
                user_id = parts[1]
            if len(parts) >= 3:
                plan_key = parts[2]

        # Only activate on 'completed' (fully confirmed) status
        if status == "completed" and user_id:
            print(f"[PLISIO] Payment completed for user {user_id}, plan: {plan_key}")
            
            # Activate tenant subscription using service role client (bypass RLS)
            from app.core.supabase_client import get_service_role_client
            service_client = get_service_role_client()

            # Update tenants table with Plisio payment details
            metadata = {
                "gateway": "plisio",
                "plan": "Pro Enterprise",
                "amount": 199.00
            }
            service_client.table("tenants").update({
                "subscription_status": "active",
                "trial_ends_at": None,
                "stripe_customer_id": json.dumps(metadata)
            }).eq("id", user_id).execute()

            # Update workspaces table if applicable
            try:
                ws_resp = service_client.table("user_workspaces").select("workspace_id").eq("user_id", user_id).execute()
                if ws_resp.data:
                    ws_id = ws_resp.data[0]["workspace_id"]
                    service_client.table("workspaces").update({
                        "subscription_status": "active",
                        "subscription_tier": plan_key
                    }).eq("id", ws_id).execute()
            except Exception as ws_err:
                print(f"[PLISIO] Workspace update error: {ws_err}")

            print(f"[PLISIO] ✅ Subscription activated for user {user_id}")

        return {"status": "ok", "txn_id": txn_id, "received_status": status}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[PLISIO] Callback processing error: {e}")
        return {"status": "error", "error": str(e)}


@router.post("/manual-activate")
async def manual_activate(
    payload: ManualActivateRequest,
    client: Client = Depends(get_supabase_client)
):
    """
    Manually activate subscription via promo code.
    Supports: FREE100, BERAXIS100, BERAXIS (100% off), LAUNCH50 (50%), LAUNCH20 (20%)
    """
    from app.core.supabase_client import token_ctx_var
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp or not user_resp.user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_id = user_resp.user.id
    promo_code = (payload.promo_code or "").strip().upper()

    # Validate promo codes
    discount = 0.0
    if promo_code in ["FREE100", "BERAXIS100", "BERAXIS"]:
        discount = 1.0
    elif promo_code == "LAUNCH50":
        discount = 0.5
    elif promo_code == "LAUNCH20":
        discount = 0.2
    elif promo_code != "":
        raise HTTPException(status_code=400, detail="Invalid promo code.")

    if discount == 0.0 and promo_code == "":
        raise HTTPException(status_code=400, detail="Please enter a promo code for manual activation.")

    try:
        # Activate tenant subscription
        metadata = {
            "gateway": "promo_code",
            "plan": "Pro Enterprise",
            "amount": 0.00,
            "code": promo_code
        }
        client.table("tenants").update({
            "subscription_status": "active",
            "trial_ends_at": None,
            "stripe_customer_id": json.dumps(metadata)
        }).eq("id", user_id).execute()

        # Update workspace if applicable
        try:
            ws_resp = client.table("user_workspaces").select("workspace_id").eq("user_id", user_id).execute()
            if ws_resp.data:
                ws_id = ws_resp.data[0]["workspace_id"]
                client.table("workspaces").update({
                    "subscription_status": "active",
                    "subscription_tier": "pro"
                }).eq("id", ws_id).execute()
        except Exception as ws_err:
            print(f"[BILLING] Workspace update warning: {ws_err}")

        return {
            "status": "success",
            "message": "Subscription manually activated successfully.",
            "discount_applied": discount
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Activation error: {str(e)}")


@router.get("/status")
async def get_billing_status(client: Client = Depends(get_supabase_client)):
    """Get current subscription status for the authenticated user."""
    from app.core.supabase_client import token_ctx_var
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp or not user_resp.user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_id = user_resp.user.id

    try:
        tenant_resp = client.table("tenants").select("subscription_status, trial_ends_at").eq("id", user_id).execute()
        if tenant_resp.data:
            tenant = tenant_resp.data[0]
            return {
                "subscription_status": tenant.get("subscription_status", "trial"),
                "trial_ends_at": tenant.get("trial_ends_at"),
                "plisio_enabled": bool(PLISIO_SECRET_KEY)
            }
    except Exception as e:
        print(f"[BILLING] Status check error: {e}")

    return {
        "subscription_status": "unknown",
        "trial_ends_at": None,
        "plisio_enabled": bool(PLISIO_SECRET_KEY)
    }


@public_router.post("/freemius-callback")
async def freemius_callback(request: Request):
    """
    Freemius webhook callback endpoint.
    Verifies HMAC-SHA256 signature using raw body and FREEMIUS_SECRET_KEY.
    """
    from app.core.config import settings
    from app.core.supabase_client import get_service_role_client
    
    # 1. Fetch raw request body
    body_bytes = await request.body()
    
    # 2. Verify Freemius signature
    sig_header = request.headers.get("x-signature") or request.headers.get("http-x-signature") or ""
    
    if settings.FREEMIUS_SECRET_KEY:
        computed = hmac.new(
            settings.FREEMIUS_SECRET_KEY.encode(),
            body_bytes,
            hashlib.sha256
        ).hexdigest()
        
        if sig_header and not hmac.compare_digest(computed, sig_header):
            print(f"[FREEMIUS] Webhook signature verification FAILED. Computed: {computed}, Header: {sig_header}")
            raise HTTPException(status_code=400, detail="Invalid signature")
        elif not sig_header:
            print(f"[FREEMIUS] No signature header present — allowing in non-strict mode")
            
    # 3. Process Event
    try:
        data = json.loads(body_bytes)
    except Exception as e:
        print(f"[FREEMIUS] Failed to parse body: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    event_type = data.get("event_type", "")
    print(f"[FREEMIUS] Webhook received: event={event_type}")
    
    # Extract email and objects
    objects = data.get("objects", {})
    user_data = objects.get("user", {})
    email = user_data.get("email", "")
    
    if not email:
        email = data.get("email", "")
        
    if not email:
        print("[FREEMIUS] No email found in webhook payload. Skipping activation.")
        return {"status": "skipped", "reason": "No email found in payload"}
        
    # Find user/tenant in our DB by email
    service_client = get_service_role_client()
    tenant_resp = service_client.table("tenants").select("id").eq("email", email).execute()
    
    if not tenant_resp.data:
        print(f"[FREEMIUS] Tenant with email {email} not found in database. Skipping.")
        return {"status": "skipped", "reason": f"Tenant {email} not found"}
        
    user_id = tenant_resp.data[0]["id"]
    
    # Identify Plan Info from objects
    # Freemius plans mapping:
    # 51030 -> One App Free ($2.99)
    # 51032 -> Standard ($31.10)
    # 51034 -> Premium ($46.80)
    plan_id = str(objects.get("subscription", {}).get("plan_id", "")) or str(objects.get("license", {}).get("plan_id", ""))
    
    plan_key = "standard"
    plan_title = "Standard"
    plan_price = 31.10
    
    if plan_id == "51030":
        plan_key = "oneappfree"
        plan_title = "One App Free"
        plan_price = 2.99
    elif plan_id == "51034":
        plan_key = "premium"
        plan_title = "Premium"
        plan_price = 46.80
    elif plan_id == "51032":
        plan_key = "standard"
        plan_title = "Standard"
        plan_price = 31.10
        
    # Handle Activations/Cancellations
    if event_type in ["subscription.created", "subscription.updated", "license.created", "license.activated", "user.created"]:
        print(f"[FREEMIUS] Activating subscription for user {user_id} ({email}) with plan {plan_title}")
        
        # Store JSON metadata in stripe_customer_id
        metadata = {
            "gateway": "freemius",
            "plan": plan_title,
            "amount": plan_price
        }
        
        service_client.table("tenants").update({
            "subscription_status": "active",
            "trial_ends_at": None,
            "stripe_customer_id": json.dumps(metadata)
        }).eq("id", user_id).execute()
        
        # Update workspaces table
        try:
            ws_resp = service_client.table("user_workspaces").select("workspace_id").eq("user_id", user_id).execute()
            if ws_resp.data:
                ws_id = ws_resp.data[0]["workspace_id"]
                service_client.table("workspaces").update({
                    "subscription_status": "active",
                    "subscription_tier": plan_key
                }).eq("id", ws_id).execute()
        except Exception as ws_err:
            print(f"[FREEMIUS] Workspace update error: {ws_err}")
            
        print(f"[FREEMIUS] ✅ Subscription activated successfully for {email}")
        
    elif event_type in ["subscription.cancelled", "subscription.canceled", "subscription.deleted", "license.deactivated"]:
        print(f"[FREEMIUS] Deactivating subscription for user {user_id} ({email})")
        
        service_client.table("tenants").update({
            "subscription_status": "past_due"
        }).eq("id", user_id).execute()
        
        try:
            ws_resp = service_client.table("user_workspaces").select("workspace_id").eq("user_id", user_id).execute()
            if ws_resp.data:
                ws_id = ws_resp.data[0]["workspace_id"]
                service_client.table("workspaces").update({
                    "subscription_status": "past_due"
                }).eq("id", ws_id).execute()
        except Exception as ws_err:
            print(f"[FREEMIUS] Workspace deactivation error: {ws_err}")
            
        print(f"[FREEMIUS] ❌ Subscription deactivated successfully for {email}")
        
    return {"status": "success", "event_processed": event_type}
