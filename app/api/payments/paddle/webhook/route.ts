import { NextRequest, NextResponse } from "next/server";
import { getPaddleInstance } from "@/lib/paddleServer";
import fs from "fs";
import path from "path";

const TRANSACTIONS_PATH = path.join(process.cwd(), "scratch", "paddle_transactions.json");

function recordPaddleTransaction(tx: any) {
  try {
    let list: any[] = [];
    if (fs.existsSync(TRANSACTIONS_PATH)) {
      list = JSON.parse(fs.readFileSync(TRANSACTIONS_PATH, "utf-8"));
    }
    list.unshift(tx);
    const dir = path.dirname(TRANSACTIONS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TRANSACTIONS_PATH, JSON.stringify(list.slice(0, 100), null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to record Paddle transaction:", err);
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("paddle-signature") ?? "";
  const rawBody = await request.text();
  const secret = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET || process.env.PADDLE_WEBHOOK_SECRET || "";

  if (!rawBody) {
    return NextResponse.json({ error: "Empty request body" }, { status: 400 });
  }

  try {
    let eventData: any = null;

    // If webhook secret is present, verify cryptographic signature
    if (secret && signature) {
      const paddle = getPaddleInstance();
      eventData = await paddle.webhooks.unmarshal(rawBody, secret, signature);
    } else {
      // In initial live onboarding before webhook secret is configured in .env, unmarshal JSON directly
      eventData = JSON.parse(rawBody);
    }

    const eventType = eventData?.event_type || eventData?.eventType;
    const data = eventData?.data;

    // Record transaction event
    if (eventType === "transaction.completed" || eventType === "transaction.paid" || eventType === "subscription.created") {
      const record = {
        id: data?.id || `tx_${Date.now()}`,
        event_type: eventType,
        customer_id: data?.customer_id || data?.customerId,
        customer_email: data?.customer?.email || data?.details?.totals?.email || data?.custom_data?.email,
        amount_usd: (Number(data?.details?.totals?.total || data?.amount || 1200) / 100).toFixed(2),
        currency: data?.currency_code || "USD",
        status: "succeeded",
        plan: data?.custom_data?.plan || "standard",
        created_at: new Date().toISOString()
      };
      recordPaddleTransaction(record);
    }

    return NextResponse.json({ received: true, event_type: eventType });
  } catch (err: any) {
    console.error("Paddle webhook error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
