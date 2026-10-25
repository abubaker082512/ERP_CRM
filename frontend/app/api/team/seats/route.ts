import { NextResponse } from "next/server";
import { getPaddlePrice, PADDLE_PRICE_MAP } from "@/lib/paddleConfig";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quantity = 1, plan = "standard", billing = "annual", customerEmail } = body;

    const parsedQty = Math.max(1, parseInt(quantity, 10));
    const priceConfig = getPaddlePrice(plan, billing);

    // Prepare line item for Paddle.Checkout.open
    const items = [
      {
        priceId: priceConfig.priceId,
        quantity: parsedQty,
      },
    ];

    const customer = customerEmail ? { email: customerEmail } : undefined;

    return NextResponse.json({
      success: true,
      items,
      customer,
      planDetails: {
        planId: priceConfig.planId,
        name: priceConfig.name,
        priceId: priceConfig.priceId,
        unitAmountUsd: priceConfig.unitAmountUsd,
        billingCycle: priceConfig.billingCycle,
        totalUsd: priceConfig.unitAmountUsd * parsedQty,
      },
      clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "live_6645496fe6160096b0d5e7c19fe",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
