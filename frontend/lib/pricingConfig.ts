export interface PricingPlanConfig {
    name: string;
    annual_monthly_rate: number;      // e.g. $1.00 / user / mo
    monthly_rate: number;             // e.g. $5.00 / user / mo
    original_annual_rate: number;     // e.g. $24.90
    original_monthly_rate: number;    // e.g. $31.10
    is_early_bird: boolean;           // true
    badge_text: string;               // "Early Bird Special (96% OFF)"
    lead_credits_per_user_monthly: number; // e.g. 1500 leads / month / user
    bill_annual_upfront?: boolean;    // true = billed annually (12x), false = billed monthly
}

export interface PricingConfig {
    standard: PricingPlanConfig;
    custom: PricingPlanConfig;
    updated_at?: string;
    updated_by?: string;
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
    standard: {
        name: "Standard",
        annual_monthly_rate: 1.00,       // $1/month for Early Bird Annual Plan
        monthly_rate: 5.00,              // $5/month for Early Bird Monthly Plan
        original_annual_rate: 24.90,     // Strikethrough comparison
        original_monthly_rate: 31.10,    // Strikethrough comparison
        is_early_bird: true,
        badge_text: "Early Bird Special (Limited Time)",
        lead_credits_per_user_monthly: 1500, // 1500 Leads / month / user
        bill_annual_upfront: true
    },
    custom: {
        name: "Custom Enterprise",
        annual_monthly_rate: 37.40,
        monthly_rate: 46.80,
        original_annual_rate: 37.40,
        original_monthly_rate: 46.80,
        is_early_bird: false,
        badge_text: "Dedicated SLA & Developer Tools",
        lead_credits_per_user_monthly: 5000, // 5000+ Custom Leads / month / user
        bill_annual_upfront: true
    },
    updated_at: new Date().toISOString(),
    updated_by: "Super Admin"
};
