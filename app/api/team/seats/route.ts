import { NextResponse } from "next/server";
import { CREEM_PRODUCTS, getCreemCheckoutUrl } from "@/lib/creemConfig";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quantity = 1, plan = "standard", billing = "annual", customerEmail } = body;

    const parsedQty = Math.max(1, parseInt(quantity, 10));
    const isAnnual = billing === "annual" || billing === "annually";
    const isCustom = plan === "custom" || plan === "premium";

    const product = isCustom
      ? isAnnual
        ? CREEM_PRODUCTS.custom_yearly
        : CREEM_PRODUCTS.custom_monthly
      : isAnnual
        ? CREEM_PRODUCTS.pro_yearly
        : CREEM_PRODUCTS.pro_monthly;

    const unitAmountUsd = isCustom
      ? isAnnual
        ? 448.8
        : 46.8
      : isAnnual
        ? 12.0
        : 5.0;

    return NextResponse.json({
      success: true,
      checkoutUrl: getCreemCheckoutUrl(plan, isAnnual ? "annual" : "monthly"),
      customer: customerEmail ? { email: customerEmail } : undefined,
      planDetails: {
        planId: isCustom ? "custom" : "standard",
        name: product.name,
        productId: product.id,
        unitAmountUsd,
        billingCycle: isAnnual ? "annual" : "monthly",
        totalUsd: unitAmountUsd * parsedQty,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
