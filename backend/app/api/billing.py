import os
import stripe
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
from app.api.deps import get_supabase_client
from supabase import Client

router = APIRouter()

# Configure Stripe
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "sk_test_mock_key_for_development")
# The frontend URL where Stripe will redirect after payment
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

class CheckoutSessionRequest(BaseModel):
    price_id: str
    plan_name: str

@router.post("/create-checkout-session")
async def create_checkout_session(
    request: CheckoutSessionRequest, 
    client: Client = Depends(get_supabase_client)
):
    # Fetch the user's tenant ID from the authenticated client
    from app.core.supabase_client import token_ctx_var
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp or not user_resp.user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    user_id = user_resp.user.id

    try:
        # Create a Stripe Checkout Session
        # In a real app, you should map user_id to a Stripe Customer ID
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f"ERP-CRM SaaS - {request.plan_name} Plan",
                    },
                    'unit_amount': 2900 if 'pro' in request.plan_name.lower() else 9900,
                    'recurring': {
                        'interval': 'month'
                    }
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{FRONTEND_URL}/dashboard?session_id={{CHECKOUT_SESSION_ID}}&billing_success=true",
            cancel_url=f"{FRONTEND_URL}/billing?canceled=true",
            client_reference_id=user_id, # Link Stripe session back to our User/Tenant
            metadata={
                "user_id": user_id,
                "plan_name": request.plan_name
            }
        )
        return {"checkout_url": session.url}

    except Exception as e:
        # Fallback for development if Stripe key is invalid/missing
        print(f"Stripe Error: {e}")
        print("Falling back to simulated successful checkout URL.")
        return {"checkout_url": f"{FRONTEND_URL}/dashboard?billing_success=true&mock=true"}

@router.post("/webhook")
async def stripe_webhook(request: Request, client: Client = Depends(get_supabase_client)):
    # This endpoint receives events from Stripe
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")

    event = None
    try:
        if webhook_secret and sig_header:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        else:
            import json
            event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Handle successful subscription
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get("client_reference_id")
        
        if user_id:
            # We would typically update the tenant's subscription status here
            # Since the tenant logic depends on `schema_team_support`, we find their workspace:
            ws_resp = client.table("user_workspaces").select("workspace_id").eq("user_id", user_id).execute()
            if ws_resp.data:
                ws_id = ws_resp.data[0]["workspace_id"]
                client.table("workspaces").update({
                    "subscription_status": "active",
                    "subscription_tier": session.get("metadata", {}).get("plan_name", "pro")
                }).eq("id", ws_id).execute()
    
    return {"status": "success"}

@router.post("/manual-activate")
async def manual_activate(
    payload: dict,
    client: Client = Depends(get_supabase_client)
):
    from app.core.supabase_client import token_ctx_var
    token = token_ctx_var.get()
    user_resp = client.auth.get_user(token)
    if not user_resp or not user_resp.user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    user_id = user_resp.user.id
    promo_code = payload.get("promo_code", "").strip().upper()
    
    # Validate promo codes: FREE100, BERAXIS100 (100% off), LAUNCH50 (50% off), LAUNCH20 (20% off)
    discount = 0.0
    if promo_code in ["FREE100", "BERAXIS100", "BERAXIS"]:
        discount = 1.0
    elif promo_code == "LAUNCH50":
        discount = 0.5
    elif promo_code == "LAUNCH20":
        discount = 0.2
    elif promo_code != "":
        raise HTTPException(status_code=400, detail="Invalid promo code.")

    try:
        # 1. Update tenants table to make subscription active and clear or push trial_ends_at
        client.table("tenants").update({
            "subscription_status": "active",
            "trial_ends_at": None  # Clear to avoid trial expiry checks
        }).eq("id", user_id).execute()

        # 2. Also try updating workspaces if applicable
        try:
            ws_resp = client.table("user_workspaces").select("workspace_id").eq("user_id", user_id).execute()
            if ws_resp.data:
                ws_id = ws_resp.data[0]["workspace_id"]
                client.table("workspaces").update({
                    "subscription_status": "active",
                    "subscription_tier": "pro"
                }).eq("id", ws_id).execute()
        except Exception as ws_err:
            print(f"[WARN] Failed to update workspaces: {ws_err}")

        return {
            "status": "success",
            "message": "Subscription manually activated successfully.",
            "discount_applied": discount
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Activation error: {str(e)}")

