import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plan = body.plan || body.planId || "standard";
    const billing = body.billing || body.billingCycle || "monthly";
    const {
      users = 1,
      email = "customer@beraxis.online",
      name = "Beraxis Subscriber",
      phone = "",
      company = "",
      return_url
    } = body;

    const origin = req.headers.get("origin") || req.headers.get("referer") || "https://beraxis.online";
    const cleanOrigin = origin.replace(/\/$/, "");

    // 1. Calculate pricing and product details based on selected plan
    let unitAmountCents = 1000; // Default $10.00 for leadspool
    let productName = "Beraxis Leads Pool Solo (1,500 Contacts/mo)";
    let productDesc = "Full access to 25.8M+ B2B Leads Directory, Live Chamber Scraper, and 1,500 Verified Monthly Contacts.";
    let interval: "month" | "year" = "month";

    const isAnnual = billing === "annual" || billing === "annually";

    if (plan === "leadspool" || plan === "leads-pool") {
      unitAmountCents = 1000; // $10.00 USD/mo
      productName = "Beraxis Leads Pool Solo (1,500 Contacts/mo)";
      productDesc = "Dedicated access to 25.8M+ Global B2B Leads Pool, direct dials, WhatsApp links, and 1,500 monthly export contacts.";
      interval = "month";
    } else if (plan === "standard") {
      // Standard: $1/mo billed annually ($12/yr) or $5/mo monthly
      if (isAnnual) {
        unitAmountCents = Math.round(users * 1200); // $12.00/yr per seat
        interval = "year";
        productName = `Beraxis Standard Plan - Annual (${users} seat${users > 1 ? 's' : ''})`;
      } else {
        unitAmountCents = Math.round(users * 500); // $5.00/mo per seat
        interval = "month";
        productName = `Beraxis Standard Plan - Monthly (${users} seat${users > 1 ? 's' : ''})`;
      }
      productDesc = "All 28 ERP/CRM modules, 1,500 Lead Credits/mo per user, cloud instance, and daily backups.";
    } else if (plan === "custom" || plan === "premium") {
      // Custom: $37.40/mo billed annually ($448.80/yr) or $46.80/mo monthly
      if (isAnnual) {
        unitAmountCents = Math.round(users * 44880);
        interval = "year";
        productName = `Beraxis Custom Enterprise - Annual (${users} seat${users > 1 ? 's' : ''})`;
      } else {
        unitAmountCents = Math.round(users * 4680);
        interval = "month";
        productName = `Beraxis Custom Enterprise - Monthly (${users} seat${users > 1 ? 's' : ''})`;
      }
      productDesc = "Multi-Company consolidation (3 included), 5,000+ Lead Credits/mo, studio customization, and 24/7 hotline.";
    }

    // Helper to get Stripe secret key from admin-persisted config or environment
    let stripeKey = process.env.STRIPE_SECRET_KEY;
    try {
      const configPath = path.join(process.cwd(), "scratch", "gateway_config.json");
      if (fs.existsSync(configPath)) {
        const parsed = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (parsed?.stripe_secret_key && parsed.stripe_secret_key.startsWith("sk_")) {
          stripeKey = parsed.stripe_secret_key;
        }
      }
    } catch {}

    // 2. If Stripe Secret Key is not configured, return clear error (NO fake simulation)
    if (!stripeKey || stripeKey.includes("placeholder") || !stripeKey.startsWith("sk_")) {
      return NextResponse.json({
        success: false,
        error: "Stripe Payment Gateway is not configured with live API keys yet. Please add your Stripe Secret Key in Super Admin (/super-admin) > Payment Gateways or switch to DirectPay Card Gateway."
      }, { status: 400 });
    }

    // 3. Initialize real Stripe SDK
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16" as any
    });

    const successRedirectUrl = return_url
      ? `${return_url}?stripe_status=success&session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(plan)}`
      : `${cleanOrigin}/checkout?stripe_status=success&session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(plan)}`;

    const cancelRedirectUrl = return_url
      ? `${return_url}?stripe_status=cancelled`
      : `${cleanOrigin}/checkout?stripe_status=cancelled`;

    // 4. Create Stripe Checkout Session with tax code txcd_10300100 (SaaS)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: productDesc,
              tax_code: "txcd_10300100", // SaaS cloud software tax code
              metadata: {
                platform: "Beraxis SaaS Enterprise",
                plan_tier: plan,
                billing_interval: interval,
                seat_count: String(users)
              }
            },
            unit_amount: unitAmountCents,
            recurring: {
              interval: interval
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        customer_name: name,
        customer_company: company,
        customer_phone: phone,
        user_email: email,
        plan_tier: plan,
        billing_cycle: billing,
        seats: String(users),
        tax_applied: "0%"
      },
      success_url: successRedirectUrl,
      cancel_url: cancelRedirectUrl
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });
  } catch (error: any) {
    console.error("[Stripe Session Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Stripe Checkout session" },
      { status: 500 }
    );
  }
}
