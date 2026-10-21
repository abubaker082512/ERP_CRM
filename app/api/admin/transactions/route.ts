import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/gatewayConfig";

export interface AdminTransaction {
  id: string;
  type: "checkout_session" | "charge" | "payment_intent";
  status: "succeeded" | "failed" | "pending";
  amount_usd: number;
  currency: string;
  customer_email: string;
  customer_name: string;
  plan: string;
  failure_reason?: string | null;
  failure_code?: string | null;
  payment_method?: string;
  created_at: string;
  livemode: boolean;
  stripe_url: string;
}

export async function GET(req: NextRequest) {
  try {
    const stripeKey = getStripeSecretKey();
    if (!stripeKey || (!stripeKey.startsWith("sk_") && !stripeKey.startsWith("rk_"))) {
      return NextResponse.json({
        success: false,
        error: "Stripe key is not configured.",
        transactions: [],
        stats: { total: 0, succeeded_count: 0, failed_count: 0, pending_count: 0, succeeded_volume_usd: 0, failed_volume_usd: 0, success_rate_percent: 0 }
      }, { status: 400 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" as any });

    const [sessionsRes, chargesRes, intentsRes] = await Promise.allSettled([
      stripe.checkout.sessions.list({ limit: 40 }),
      stripe.charges.list({ limit: 40 }),
      stripe.paymentIntents.list({ limit: 40 })
    ]);

    const sessions = sessionsRes.status === "fulfilled" ? sessionsRes.value.data : [];
    const charges = chargesRes.status === "fulfilled" ? chargesRes.value.data : [];
    const intents = intentsRes.status === "fulfilled" ? intentsRes.value.data : [];

    const transactions: AdminTransaction[] = [];
    const seenIds = new Set<string>();

    // 1. Process Charges (Direct payments & failure records)
    for (const c of charges) {
      if (seenIds.has(c.id)) continue;
      seenIds.add(c.id);

      const isSucceeded = c.status === "succeeded" && c.paid;
      const isFailed = c.status === "failed" || Boolean(c.failure_code) || Boolean(c.failure_message);
      
      const cardDetails = c.payment_method_details?.card;
      const paymentMethod = cardDetails 
        ? `${(cardDetails.brand || "Card").toUpperCase()} •••• ${cardDetails.last4 || ""}`
        : "Credit / Debit Card";

      transactions.push({
        id: c.id,
        type: "charge",
        status: isSucceeded ? "succeeded" : isFailed ? "failed" : "pending",
        amount_usd: (c.amount || 0) / 100,
        currency: (c.currency || "usd").toUpperCase(),
        customer_email: c.billing_details?.email || c.receipt_email || "Customer",
        customer_name: c.billing_details?.name || "Subscriber",
        plan: c.description || (c.metadata?.plan_tier ? `${c.metadata.plan_tier} Plan` : "Beraxis Subscription"),
        failure_reason: c.failure_message || (c.outcome?.seller_message) || null,
        failure_code: c.failure_code || null,
        payment_method: paymentMethod,
        created_at: new Date((c.created || 0) * 1000).toISOString(),
        livemode: c.livemode,
        stripe_url: `https://dashboard.stripe.com/${c.livemode ? "" : "test/"}payments/${c.id}`
      });
    }

    // 2. Process Failed Payment Intents that might not have generated a full charge
    for (const pi of intents) {
      if (seenIds.has(pi.id)) continue;
      if (pi.latest_charge && seenIds.has(String(pi.latest_charge))) continue;

      if (pi.last_payment_error || pi.status === "canceled") {
        seenIds.add(pi.id);
        const err = pi.last_payment_error;
        transactions.push({
          id: pi.id,
          type: "payment_intent",
          status: "failed",
          amount_usd: (pi.amount || 0) / 100,
          currency: (pi.currency || "usd").toUpperCase(),
          customer_email: (pi.receipt_email || err?.payment_method?.billing_details?.email || "Customer"),
          customer_name: err?.payment_method?.billing_details?.name || "Subscriber",
          plan: pi.description || (pi.metadata?.plan_tier ? `${pi.metadata.plan_tier} Plan` : "Beraxis Subscription"),
          failure_reason: err?.message || "Payment attempt failed or was canceled.",
          failure_code: err?.code || err?.decline_code || "payment_failed",
          payment_method: err?.payment_method?.card ? `${err.payment_method.card.brand.toUpperCase()} •••• ${err.payment_method.card.last4}` : "Card",
          created_at: new Date((pi.created || 0) * 1000).toISOString(),
          livemode: pi.livemode,
          stripe_url: `https://dashboard.stripe.com/${pi.livemode ? "" : "test/"}payments/${pi.id}`
        });
      }
    }

    // 3. Process Checkout Sessions
    for (const s of sessions) {
      if (seenIds.has(s.id)) continue;
      seenIds.add(s.id);

      const isPaid = s.payment_status === "paid" || s.status === "complete";
      const isExpired = s.status === "expired";
      const status: "succeeded" | "failed" | "pending" = isPaid 
        ? "succeeded" 
        : isExpired 
          ? "failed" 
          : "pending";

      transactions.push({
        id: s.id,
        type: "checkout_session",
        status,
        amount_usd: (s.amount_total || 0) / 100,
        currency: (s.currency || "usd").toUpperCase(),
        customer_email: s.customer_details?.email || s.customer_email || "Customer",
        customer_name: s.customer_details?.name || s.metadata?.customer_name || "Subscriber",
        plan: s.metadata?.plan_tier ? `${s.metadata.plan_tier.toUpperCase()} Plan` : "Beraxis Subscription",
        failure_reason: isExpired ? "Checkout session expired without completing payment" : null,
        failure_code: isExpired ? "checkout_expired" : null,
        payment_method: "Stripe Checkout (Cards, Apple/Google Pay)",
        created_at: new Date((s.created || 0) * 1000).toISOString(),
        livemode: s.livemode,
        stripe_url: `https://dashboard.stripe.com/${s.livemode ? "" : "test/"}workbench/overview`
      });
    }

    // Sort descending by date
    transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Calculate aggregated stats
    const total = transactions.length;
    const succeeded = transactions.filter(t => t.status === "succeeded");
    const failed = transactions.filter(t => t.status === "failed");
    const pending = transactions.filter(t => t.status === "pending");

    const succeededVolume = succeeded.reduce((sum, t) => sum + t.amount_usd, 0);
    const failedVolume = failed.reduce((sum, t) => sum + t.amount_usd, 0);

    const decisiveTotal = succeeded.length + failed.length;
    const successRate = decisiveTotal > 0 ? (succeeded.length / decisiveTotal) * 100 : 100;

    return NextResponse.json({
      success: true,
      livemode: stripeKey.includes("_live_"),
      transactions,
      stats: {
        total,
        succeeded_count: succeeded.length,
        failed_count: failed.length,
        pending_count: pending.length,
        succeeded_volume_usd: succeededVolume,
        failed_volume_usd: failedVolume,
        success_rate_percent: Number(successRate.toFixed(1))
      }
    });

  } catch (err: any) {
    console.error("[Transactions API] Error retrieving Stripe transactions:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Failed to retrieve transactions from Stripe.",
      transactions: [],
      stats: { total: 0, succeeded_count: 0, failed_count: 0, pending_count: 0, succeeded_volume_usd: 0, failed_volume_usd: 0, success_rate_percent: 0 }
    }, { status: 500 });
  }
}
