// Centralized Creem Payment Gateway & Checkout Configuration
// Beraxis Merchant of Record (MoR) Integration

export const CREEM_PRODUCTS = {
    // BERAXIS Pro Plan Yearly ($12.00/yr upfront = $1.00/mo Early Bird)
    pro_yearly: {
        id: "prod_4FAOIKdkMdOoER29Zgk0TW",
        name: "BERAXIS Pro Plan Yearly",
        price: 12.00,
        cadence: "yearly",
        url: "https://www.creem.io/payment/prod_4FAOIKdkMdOoER29Zgk0TW",
        description: "Single Company Workspace (1 Company included), All 28 modules, 1,500 monthly verified B2B lead credits."
    },
    // BERAXIS Pro Plan Monthly ($5.00/mo)
    pro_monthly: {
        id: "prod_1QmAGqBQXEVHhDIBfrfwi4",
        name: "BERAXIS Pro Plan Monthly",
        price: 5.00,
        cadence: "monthly",
        url: "https://www.creem.io/payment/prod_1QmAGqBQXEVHhDIBfrfwi4",
        description: "Single Company Workspace (1 Company included), All 28 modules, 1,500 monthly verified B2B lead credits."
    },
    // BERAXIS Custom Plan Monthly ($46.80/mo)
    custom_monthly: {
        id: "prod_4zAM5yESFbUxhVBLkhfn56",
        name: "BERAXIS Custom Plan Monthly",
        price: 46.80,
        cadence: "monthly",
        url: "https://www.creem.io/payment/prod_4zAM5yESFbUxhVBLkhfn56",
        description: "Multi-Company (3 Companies included + $15/mo per extra), Studio customizer, API & webhooks, 5,000+ lead credits."
    },
    // BERAXIS Custom Plan Yearly ($448.80/yr upfront = $37.40/mo)
    custom_yearly: {
        id: "prod_5qyRJenOBBumOxaDmlXAVY",
        name: "BERAXIS Custom Plan Yearly",
        price: 448.80,
        cadence: "yearly",
        url: "https://www.creem.io/payment/prod_5qyRJenOBBumOxaDmlXAVY",
        description: "Multi-Company (3 Companies included + $15/mo per extra), Studio customizer, API & webhooks, 5,000+ lead credits."
    },
    // BERAXIS LEADS POOL ($10.00/mo standalone)
    leads_pool: {
        id: "prod_1xEWGj3zJ2StJoKpqasZJp",
        name: "BERAXIS LEADS POOL",
        price: 10.00,
        cadence: "monthly",
        url: "https://www.creem.io/payment/prod_1xEWGj3zJ2StJoKpqasZJp",
        description: "1,500 Verified Contacts / mo included Direct Mobile & WhatsApp numbers, 100% verified global enterprises."
    },
    // DONATE TO BERAXIS ($5.00 minimum custom donation)
    donate: {
        id: "prod_3Q2uUJ5aBPlOG6YQLS2HjJ",
        name: "DONATE TO BERAXIS",
        price: 5.00,
        cadence: "one-time",
        url: "https://www.creem.io/payment/prod_3Q2uUJ5aBPlOG6YQLS2HjJ",
        description: "Support BERAXIS open-source business technology, community infrastructure, and fair-pricing mission."
    }
} as const;

export type CreemPlanKey = "standard" | "pro" | "custom" | "leadspool" | "leads-pool" | "donate";

/**
 * Returns the exact Creem checkout link based on plan and billing cycle
 */
export function getCreemCheckoutUrl(
    plan: CreemPlanKey | string,
    billing: "annually" | "monthly" | "annual" | string = "annually"
): string {
    const isYearly = billing === "annually" || billing === "annual" || billing === "yearly";

    if (plan === "donate") {
        return CREEM_PRODUCTS.donate.url;
    }

    if (plan === "leadspool" || plan === "leads-pool" || plan === "leads_pool") {
        return CREEM_PRODUCTS.leads_pool.url;
    }

    if (plan === "custom") {
        return isYearly ? CREEM_PRODUCTS.custom_yearly.url : CREEM_PRODUCTS.custom_monthly.url;
    }

    // Default: Pro / Standard
    return isYearly ? CREEM_PRODUCTS.pro_yearly.url : CREEM_PRODUCTS.pro_monthly.url;
}

/**
 * Helper to programmatically open Creem checkout overlay or navigate
 */
export function openCreemCheckout(
    plan: CreemPlanKey | string,
    billing: "annually" | "monthly" | "annual" | string = "annually"
) {
    const url = getCreemCheckoutUrl(plan, billing);
    if (typeof window !== "undefined") {
        // If Creem embed script is loaded, trigger through creem or anchor click
        const existingAnchor = document.querySelector<HTMLAnchorElement>(`a[href="${url}"][data-creem-checkout]`);
        if (existingAnchor) {
            existingAnchor.click();
            return;
        }

        // Create transient anchor with data-creem-checkout attribute
        const a = document.createElement("a");
        a.href = url;
        a.setAttribute("data-creem-checkout", "");
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            if (document.body.contains(a)) {
                document.body.removeChild(a);
            }
        }, 1000);
    }
}
