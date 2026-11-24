import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { CREEM_PRODUCTS } from "@/lib/creemConfig";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const CREEM_TX_PATH = path.join(process.cwd(), "scratch", "creem_transactions.json");

function recordCreemTransactionLocal(tx: any) {
  try {
    let list: any[] = [];
    if (fs.existsSync(CREEM_TX_PATH)) {
      list = JSON.parse(fs.readFileSync(CREEM_TX_PATH, "utf-8"));
    }
    list.unshift(tx);
    const dir = path.dirname(CREEM_TX_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CREEM_TX_PATH, JSON.stringify(list.slice(0, 100), null, 2), "utf-8");
  } catch (err) {
    console.warn("[CreemWebhook] Local file record skipped:", err);
  }
}

function resolvePlanName(productId?: string, productName?: string): string {
  if (productId) {
    for (const prod of Object.values(CREEM_PRODUCTS)) {
      if (prod.id === productId) return prod.name;
    }
  }
  if (productName) return productName;
  return "Standard Plan ($1/mo)";
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    gateway: "Creem Merchant of Record",
    endpoint: "/api/payments/creem/webhook",
    supabase_configured: Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY),
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!rawBody) {
    return NextResponse.json({ error: "Empty request body" }, { status: 400 });
  }

  // Verify Creem signature if CREEM_WEBHOOK_SECRET is configured
  const secret = process.env.CREEM_WEBHOOK_SECRET || "";
  const signature = request.headers.get("creem-signature") || "";
  if (secret && signature) {
    const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (computed !== signature) {
      return NextResponse.json({ error: "Invalid Creem webhook signature" }, { status: 401 });
    }
  }

  try {
    const payload = JSON.parse(rawBody);
    const eventType = payload?.eventType || payload?.event_type || payload?.type || "checkout.completed";
    const obj = payload?.object || payload?.data || payload;

    const customer = obj?.customer || payload?.customer || {};
    const product = obj?.product || payload?.product || {};
    const order = obj?.order || payload?.order || {};

    const email: string = (
      customer?.email ||
      obj?.customer_email ||
      obj?.email ||
      payload?.email ||
      ""
    )
      .toString()
      .trim()
      .toLowerCase();

    const fullName: string = (
      customer?.name ||
      obj?.customer_name ||
      obj?.name ||
      (email ? email.split("@")[0] : "Creem Customer")
    )
      .toString()
      .trim();

    const creemCustomerId: string = customer?.id || obj?.customer_id || `creem_${Date.now()}`;
    const productId: string = product?.id || obj?.product_id || "";
    const planName = resolvePlanName(productId, product?.name);

    const rawAmount = Number(order?.amount ?? obj?.amount ?? product?.price ?? 1200);
    const amountUsd = (rawAmount > 100 ? rawAmount / 100 : rawAmount).toFixed(2);
    const currency = (order?.currency || obj?.currency || "USD").toString().toUpperCase();

    const isCanceled = eventType.includes("cancel") || eventType.includes("expired");
    const subStatus = isCanceled ? "canceled" : "active";

    // Sync customer into Supabase Auth so they appear immediately in Super Admin Dashboard
    let syncedUserId: string | null = null;
    if (email) {
      try {
        const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          cache: "no-store",
        });

        let existingUser: any = null;
        if (listRes.ok) {
          const listData = await listRes.json();
          const users = Array.isArray(listData?.users) ? listData.users : [];
          existingUser = users.find((u: any) => (u.email || "").toLowerCase() === email);
        }

        const mergedMeta = {
          ...(existingUser?.user_metadata || {}),
          full_name: existingUser?.user_metadata?.full_name || fullName,
          name: existingUser?.user_metadata?.name || fullName,
          plan: planName,
          subscription_status: subStatus,
          creem_customer_id: creemCustomerId,
          signup_source: existingUser?.user_metadata?.signup_source || "creem_checkout",
          last_payment_usd: amountUsd,
          last_payment_at: new Date().toISOString(),
        };

        if (existingUser?.id) {
          syncedUserId = existingUser.id;
          await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existingUser.id}`, {
            method: "PUT",
            headers: {
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_metadata: mergedMeta }),
          });
        } else {
          const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            method: "POST",
            headers: {
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              email_confirm: true,
              user_metadata: mergedMeta,
            }),
          });
          if (createRes.ok) {
            const created = await createRes.json();
            syncedUserId = created?.id || null;
          }
        }

        // Also upsert into tenants table if present
        if (syncedUserId) {
          await fetch(`${SUPABASE_URL}/rest/v1/tenants`, {
            method: "POST",
            headers: {
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify({
              id: syncedUserId,
              email,
              subscription_status: subStatus,
            }),
          }).catch(() => {});
        }
      } catch (syncErr) {
        console.warn("[CreemWebhook] Supabase sync warning:", syncErr);
      }
    }

    const txRecord = {
      id: order?.id || obj?.id || `creem_tx_${Date.now()}`,
      gateway: "Creem MoR",
      event_type: eventType,
      customer_id: creemCustomerId,
      customer_name: fullName,
      customer_email: email || "unknown@creem.io",
      amount_usd: amountUsd,
      currency,
      status: isCanceled ? "canceled" : "succeeded",
      plan: planName,
      created_at: new Date().toISOString(),
    };
    recordCreemTransactionLocal(txRecord);

    return NextResponse.json({
      received: true,
      event_type: eventType,
      synced_email: email || null,
      synced_user_id: syncedUserId,
      plan: planName,
    });
  } catch (err: any) {
    console.error("[CreemWebhook] Error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Webhook error" }, { status: 500 });
  }
}
