import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");

    let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let stripeKey = process.env.STRIPE_SECRET_KEY;

    try {
      const configPath = path.join(process.cwd(), "scratch", "gateway_config.json");
      if (fs.existsSync(configPath)) {
        const parsed = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (parsed?.stripe_webhook_secret && parsed.stripe_webhook_secret.startsWith("whsec_")) {
          webhookSecret = parsed.stripe_webhook_secret;
        }
        if (parsed?.stripe_secret_key && parsed.stripe_secret_key.startsWith("sk_")) {
          stripeKey = parsed.stripe_secret_key;
        }
      }
    } catch {}

    let event: Stripe.Event;

    if (webhookSecret && sig && stripeKey) {
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16" as any
      });
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      // Direct parse in dev or when webhook secret is pending configuration
      try {
        event = JSON.parse(rawBody) as Stripe.Event;
      } catch {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
      }
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle checkout session completion
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};
      const plan = metadata.plan_tier || metadata.plan || "standard";
      const customerEmail = session.customer_email || metadata.user_email || metadata.customer_email || "";
      const customerId = session.customer ? String(session.customer) : "";

      console.log(`[Stripe Webhook] Subscription activated for ${customerEmail} (Plan: ${plan}, Customer: ${customerId})`);

      // Optionally sync to Supabase if configured
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseKey && customerEmail) {
          const res = await fetch(`${supabaseUrl}/rest/v1/tenants?email=eq.${encodeURIComponent(customerEmail)}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
              subscription_status: "active",
              plan: plan,
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString()
            })
          });
          console.log(`[Stripe Webhook] Supabase updated status: ${res.status}`);
        }
      } catch (dbErr) {
        console.error("[Stripe Webhook] DB Sync failed:", dbErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
