import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CREEM_PRODUCTS } from "@/lib/creemConfig";

export const dynamic = "force-dynamic";

const CREEM_TRANSACTIONS_PATH = path.join(process.cwd(), "scratch", "creem_transactions.json");

export async function GET() {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    let creemLocalTxs: any[] = [];
    if (fs.existsSync(CREEM_TRANSACTIONS_PATH)) {
      try {
        creemLocalTxs = JSON.parse(fs.readFileSync(CREEM_TRANSACTIONS_PATH, "utf-8"));
      } catch {}
    }

    const creemSupabaseTxs: any[] = [];
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
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
    }

    const allTransactions = [...creemLocalTxs, ...creemSupabaseTxs].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    const succeededTxs = allTransactions.filter(
      (t) => t.status === "completed" || t.status === "paid" || t.status === "succeeded"
    );
    const failedTxs = allTransactions.filter(
      (t) => t.status === "failed" || t.status === "canceled"
    );

    const succeededVolume = succeededTxs.reduce((sum, t) => sum + (Number(t.amount_usd) || 0), 0);
    const failedVolume = failedTxs.reduce((sum, t) => sum + (Number(t.amount_usd) || 0), 0);

    return NextResponse.json({
      success: true,
      gateway: "Creem MoR Live",
      status: "connected",
      catalog: CREEM_PRODUCTS,
      stats: {
        total: allTransactions.length,
        succeeded_count: succeededTxs.length,
        succeeded_volume_usd: succeededVolume,
        failed_count: failedTxs.length,
        failed_volume_usd: failedVolume,
        success_rate_percent:
          allTransactions.length > 0 ? Math.round((succeededTxs.length / allTransactions.length) * 100) : 100,
      },
      transactions: allTransactions.slice(0, 50),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
