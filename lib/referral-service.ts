"use client";

export interface AffiliateTier {
  name: string;
  commissionRate: number; // e.g. 0.30 for 30%
  cookieDays: number;
  payoutMinimumUsd: number;
  payoutMethods: string[];
}

export const BERAXIS_AFFILIATE_TIER: AffiliateTier = {
  name: "Beraxis Certified Growth Partner",
  commissionRate: 0.30,
  cookieDays: 30,
  payoutMinimumUsd: 50,
  payoutMethods: ["Stripe Connect", "PayPal", "Wise", "Direct Bank Wire"]
};

export const REFERRAL_COOKIE_NAME = "beraxis_referral_code";
export const REFERRAL_STORAGE_KEY = "beraxis_referral_attribution";

export interface ReferralAttribution {
  refCode: string;
  sourceUrl?: string;
  capturedAt: string;
  expiresAt: string;
}

/**
 * Initializes client-side referral tracking by inspecting URL search params
 * for ?ref=... or ?aff=... and storing in localStorage & cookie (30-day window).
 */
export function trackReferralVisit(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("ref") || params.get("aff");

    if (code && code.trim().length > 0) {
      const sanitized = code.trim().toUpperCase().slice(0, 32);
      const now = new Date();
      const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const attribution: ReferralAttribution = {
        refCode: sanitized,
        sourceUrl: window.location.href,
        capturedAt: now.toISOString(),
        expiresAt: expires.toISOString()
      };

      // 1. Store in localStorage
      localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(attribution));

      // 2. Store in Cookie for cross-tab persistence
      document.cookie = `${REFERRAL_COOKIE_NAME}=${sanitized}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;

      return sanitized;
    }

    // Return existing code if still valid
    const existing = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (existing) {
      const parsed: ReferralAttribution = JSON.parse(existing);
      if (new Date(parsed.expiresAt) > new Date()) {
        return parsed.refCode;
      }
    }
  } catch (err) {
    console.error("Referral tracking error:", err);
  }

  return null;
}

/**
 * Retrieves the currently active referral attribution code (if any)
 * to attach to user signup / checkout session.
 */
export function getActiveReferralCode(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const existing = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (existing) {
      const parsed: ReferralAttribution = JSON.parse(existing);
      if (new Date(parsed.expiresAt) > new Date()) {
        return parsed.refCode;
      }
    }

    // Fallback to cookie
    const cookies = document.cookie.split(";");
    for (const c of cookies) {
      const [key, val] = c.trim().split("=");
      if (key === REFERRAL_COOKIE_NAME && val) {
        return decodeURIComponent(val);
      }
    }
  } catch {}

  return null;
}

/**
 * Generates user's personal shareable referral link
 */
export function generateReferralLink(userCode: string): string {
  const code = (userCode || "BERAXIS").trim().toUpperCase();
  return `https://www.beraxis.online/signup?ref=${code}`;
}

/**
 * Calculates projected affiliate earnings based on referred paying workspaces
 */
export function calculateAffiliateEarnings(referredCount: number, avgMonthlyRevenuePerUser: number = 10) {
  const annualWorkspaces = referredCount;
  const grossMonthly = annualWorkspaces * avgMonthlyRevenuePerUser;
  const partnerMonthly = grossMonthly * BERAXIS_AFFILIATE_TIER.commissionRate;
  const partnerAnnual = partnerMonthly * 12;

  return {
    referredWorkspaces: referredCount,
    grossMonthly,
    partnerMonthly,
    partnerAnnual,
    commissionPercent: 30
  };
}

/**
 * Prepares 1-click social share links for affiliates & promoters
 */
export function getSocialShareLinks(referralLink: string) {
  const shareText = encodeURIComponent(
    "Stop paying the $400/mo SaaS tax for fragmented tools. We switched to Beraxis AI Autonomous ERP & CRM — full accounting, global leads directory, and POS for just $1/month! Check it out:"
  );
  const encodedUrl = encodeURIComponent(referralLink);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent("Replacing our fragmented SaaS tools with Beraxis")}&body=${shareText}%0A%0A${encodedUrl}`
  };
}
