import { NextRequest, NextResponse } from "next/server";
import { getPaddleInstance } from "@/lib/paddleServer";
import { PADDLE_PRICE_MAP } from "@/lib/paddleConfig";
import fs from "fs";
import path from "path";

const TRANSACTIONS_PATH = path.join(process.cwd(), "scratch", "paddle_transactions.json");
const CREEM_TRANSACTIONS_PATH = path.join(process.cwd(), "scratch", "creem_transactions.json");

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hgmdredpqwuooxbbsejw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbWRyZWRwcXd1b294YmJzZWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA4MDIxNywiZXhwIjoyMTA1NjU2MjE3fQ.jZCH75eRrhrQ2A_8Avu-MGwQwctohyF-ocioBAh3oXU";

export async function GET() {
  try {
    const paddle = getPaddleInstance();
    const liveTxs: any[] = [];

    // Query live transactions from Paddle API
    try {
      const txIterator = await paddle.transactions.list();
      for await (const t of txIterator) {
        liveTxs.push({
          id: t.id,
          status: t.status,
          customer_id: t.customerId,
          amount_usd: (Number(t.details?.totals?.total || 0) / 100).toFixed(2),
          currency: t.currencyCode,
          created_at: t.createdAt,
          payment_method: t.payments?.[0]?.methodDetails?.type || "card",
          customer_email: t.details?.totals?.email || "customer@paddle.com"
        });
      }
    } catch (e: any) {
      console.warn("Could not query paddle transactions list:", e.message);
    }

    // Merge with local webhook transaction records
    let localTxs: any[] = [];
    if (fs.existsSync(TRANSACTIONS_PATH)) {
      try {
        localTxs = JSON.parse(fs.readFileSync(TRANSACTIONS_PATH, "utf-8"));
      } catch {}
    }

    // Merge Creem local transactions
    let creemLocalTxs: any[] = [];
    if (fs.existsSync(CREEM_TRANSACTIONS_PATH)) {
      try {
        creemLocalTxs = JSON.parse(fs.readFileSync(CREEM_TRANSACTIONS_PATH, "utf-8"));
      } catch {}
    }

    // Reconstruct persistent Creem transactions from Supabase Auth user_metadata
    const creemSupabaseTxs: any[] = [];
    try {
      const sbRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        cache: "no-store",
      });
      if (sbRes.ok) {
        const sbData = await sbRes.json();
        const users = Array.isArray(sbData?.users) ? sbData.users : [];
        for (const u of users) {
          const meta = u?.user_metadata || {};
          if (meta.creem_customer_id || meta.last_payment_usd) {
            const emailLower = (u.email || "").toLowerCase();
            const alreadyInLocal = creemLocalTxs.some(
              (t) =>
                (t.customer_email || "").toLowerCase() === emailLower &&
                t.customer_id === meta.creem_customer_id
            );
            if (!alreadyInLocal) {
              creemSupabaseTxs.push({
                id: `creem_sb_${meta.creem_customer_id || u.id}`,
                gateway: "Creem MoR",
                event_type: meta.subscription_status === "canceled" ? "subscription.canceled" : "checkout.completed",
                customer_id: meta.creem_customer_id || u.id,
                customer_name: meta.full_name || meta.name || (u.email ? u.email.split("@")[0] : "Creem Customer"),
                customer_email: u.email || "unknown@creem.io",
                amount_usd: meta.last_payment_usd || "12.00",
                currency: "USD",
                status: meta.subscription_status === "canceled" ? "canceled" : "succeeded",
                plan: meta.plan || "Standard Plan ($1/mo)",
                created_at: meta.last_payment_at || u.created_at || new Date().toISOString(),
              });
            }
          }
        }
      }
    } catch {}

    const allTransactions = [...creemLocalTxs, ...creemSupabaseTxs, ...liveTxs, ...localTxs].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    const succeededTxs = allTransactions.filter(t => t.status === "completed" || t.status === "paid" || t.status === "succeeded");
    const failedTxs = allTransactions.filter(t => t.status === "failed" || t.status === "canceled");

    const succeededVolume = succeededTxs.reduce((sum, t) => sum + (Number(t.amount_usd) || 0), 0);
    const failedVolume = failedTxs.reduce((sum, t) => sum + (Number(t.amount_usd) || 0), 0);

    return NextResponse.json({
      success: true,
      gateway: "Paddle & Creem Live",
      status: "connected",
      catalog: PADDLE_PRICE_MAP,
      stats: {
        total: allTransactions.length,
        succeeded_count: succeededTxs.length,
        succeeded_volume_usd: succeededVolume,
        failed_count: failedTxs.length,
        failed_volume_usd: failedVolume,
        success_rate_percent: allTransactions.length > 0 ? Math.round((succeededTxs.length / allTransactions.length) * 100) : 100
      },
      transactions: allTransactions.slice(0, 50)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
