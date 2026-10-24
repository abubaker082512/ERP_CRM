import { NextRequest, NextResponse } from "next/server";
import { getPaddleInstance } from "@/lib/paddleServer";
import { PADDLE_PRICE_MAP } from "@/lib/paddleConfig";
import fs from "fs";
import path from "path";

const TRANSACTIONS_PATH = path.join(process.cwd(), "scratch", "paddle_transactions.json");

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

    const allTransactions = [...liveTxs, ...localTxs];
    const succeededTxs = allTransactions.filter(t => t.status === "completed" || t.status === "paid" || t.status === "succeeded");
    const failedTxs = allTransactions.filter(t => t.status === "failed" || t.status === "canceled");

    const succeededVolume = succeededTxs.reduce((sum, t) => sum + (Number(t.amount_usd) || 0), 0);
    const failedVolume = failedTxs.reduce((sum, t) => sum + (Number(t.amount_usd) || 0), 0);

    return NextResponse.json({
      success: true,
      gateway: "Paddle Live",
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
