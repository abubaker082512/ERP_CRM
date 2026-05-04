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
    user_resp = client.auth.get_user()
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
