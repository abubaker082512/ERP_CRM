export interface PaddlePriceMapping {
  planId: string;
  name: string;
  billingCycle: "annual" | "monthly";
  priceId: string;
  productId: string;
  unitAmountUsd: number;
  interval: "year" | "month";
}

export const PADDLE_PRICE_MAP: Record<string, PaddlePriceMapping> = {
  "standard-annual": {
    planId: "standard",
    name: "BERAXIS Standard Plan (Annual)",
    billingCycle: "annual",
    priceId: "pri_01m5q810bsvet6hvxrd5dj8pcc",
    productId: "pro_01m5q7svr662b4bm45mqqv12np",
    unitAmountUsd: 12.00,
    interval: "year"
  },
  "standard-monthly": {
    planId: "standard",
    name: "BERAXIS Standard Plan (Monthly)",
    billingCycle: "monthly",
    priceId: "pri_01m5q7wn7dava1anyfn8sfze9j",
    productId: "pro_01m5q7svr662b4bm45mqqv12np",
    unitAmountUsd: 5.00,
    interval: "month"
  },
  "custom-annual": {
    planId: "custom",
    name: "BERAXIS Custom Enterprise Plan (Annual)",
    billingCycle: "annual",
    priceId: "pri_01m5q89px5fjy063g75wp24qtq",
    productId: "pro_01m5q83hr3wyp0fsnawy280ta3",
    unitAmountUsd: 448.80,
    interval: "year"
  },
  "custom-monthly": {
    planId: "custom",
    name: "BERAXIS Custom Enterprise Plan (Monthly)",
    billingCycle: "monthly",
    priceId: "pri_01m5q87843ar79ed43rq07k5hz",
    productId: "pro_01m5q83hr3wyp0fsnawy280ta3",
    unitAmountUsd: 46.80,
    interval: "month"
  }
};

export function getPaddlePrice(plan?: string | null, billing?: string | null): PaddlePriceMapping {
  const cleanPlan = (plan || "standard").toLowerCase().trim();
  const cleanBilling = (billing || "annual").toLowerCase().trim().startsWith("month") ? "monthly" : "annual";
  const key = `${cleanPlan === "custom" || cleanPlan === "enterprise" ? "custom" : "standard"}-${cleanBilling}`;
  return PADDLE_PRICE_MAP[key] || PADDLE_PRICE_MAP["standard-annual"];
}
