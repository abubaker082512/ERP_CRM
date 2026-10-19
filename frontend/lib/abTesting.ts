"use client";

import { useEffect, useState } from "react";

// Bot / Search Crawler detection to guarantee zero SEO cloaking penalties
export function isSearchCrawler(userAgent?: string): boolean {
  if (typeof window === "undefined" && !userAgent) return false;
  const ua = userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : "");
  if (!ua) return false;
  const botPattern = /bot|googlebot|crawler|spider|robot|crawling|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|facebookexternalhit|ia_archiver|ahrefsbot|semrushbot|dotbot|mj12bot|twitterbot|linkedinbot/i;
  return botPattern.test(ua);
}

export interface VariantDefinition {
  id: string;
  name: string;
  weight: number; // percentage, e.g. 33
  description?: string;
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  variants: VariantDefinition[];
  goals: string[];
}

export const EXPERIMENTS: Record<string, ExperimentConfig> = {
  hero_headline_v1: {
    id: "hero_headline_v1",
    name: "Homepage Hero Headline & Positioning",
    description: "Testing feature scope vs. $400/mo Anti-SaaS Tax vs. 25M+ Leads Customer Engine.",
    variants: [
      {
        id: "control",
        name: "Scope & Feature (Manage Your Universe)",
        weight: 34,
        description: "Focuses on unified 28-module ERP cockpit, AI Voice & Leads Pool."
      },
      {
        id: "saas_tax",
        name: "Pain & Cost (Stop Paying $400/mo SaaS Tax)",
        weight: 33,
        description: "Attacks high SaaS fragmentation by replacing HubSpot, QuickBooks, Toast & Apollo for $1/mo."
      },
      {
        id: "leads_engine",
        name: "Growth & Pipeline (25M+ Leads Customer Engine)",
        weight: 33,
        description: "Highlights automated customer acquisition and B2B lead generation."
      }
    ],
    goals: ["pricing_click", "signup_click", "leads_click", "savings_calc_click"]
  },
  hero_cta_v1: {
    id: "hero_cta_v1",
    name: "Hero Call-To-Action Friction Strategy",
    description: "Compares direct $1/mo pricing CTA vs. frictionless free tier vs. instant savings calculator.",
    variants: [
      {
        id: "control",
        name: "Early Bird Pricing ($1/mo + Free App)",
        weight: 34,
        description: "Primary: Claim Early Bird Plan ($1/mo) | Secondary: Deploy 1 App Free ($0)"
      },
      {
        id: "frictionless",
        name: "Frictionless (No Credit Card Free)",
        weight: 33,
        description: "Primary: Start Free — No Credit Card Required | Secondary: Explore 25M+ Leads"
      },
      {
        id: "savings_calc",
        name: "Interactive SaaS Savings Calculator",
        weight: 33,
        description: "Primary: Calculate Your SaaS Savings ($399/mo) | Secondary: Claim $1/mo Plan"
      }
    ],
    goals: ["pricing_click", "signup_click", "leads_click", "calculator_opened"]
  },
  hero_media_v1: {
    id: "hero_media_v1",
    name: "Hero Visual Media Preview",
    description: "Tests live glassmorphic dashboard vs. AI female presenter video commercial vs. interactive leads search.",
    variants: [
      {
        id: "control",
        name: "Glassmorphic Command Center Mockup",
        weight: 34,
        description: "Real-time cards with Leads Pool, Voice Pilot live audio simulation, and 45ms edge metrics."
      },
      {
        id: "ai_commercial",
        name: "AI Female Founder Video Commercial",
        weight: 33,
        description: "HD 16:9 cinematic video commercial featuring photorealistic AI female founder presenter."
      },
      {
        id: "interactive_leads",
        name: "Live Interactive 25M+ Leads Search Widget",
        weight: 33,
        description: "Instant in-hero search simulator for visitors to test query B2B leads before signing up."
      }
    ],
    goals: ["video_played", "leads_searched", "lead_preview_clicked", "cta_click"]
  }
};

// Cookie helper
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// Deterministic allocation based on visitor or random seed
function allocateVariant(experiment: ExperimentConfig): string {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (rand <= cumulative) {
      return variant.id;
    }
  }
  return experiment.variants[0]?.id || "control";
}

// Track an impression event
export function trackExperimentImpression(experimentId: string, variantId: string) {
  if (typeof window === "undefined") return;
  if (isSearchCrawler()) return; // Never record bot traffic

  const utmCreative = new URLSearchParams(window.location.search).get("utm_creative") || 
                       localStorage.getItem("beraxis_utm_creative") || "";

  fetch("/api/experiments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "impression",
      experimentId,
      variantId,
      metadata: {
        utm_creative: utmCreative,
        path: window.location.pathname,
        referrer: document.referrer || "direct"
      }
    }),
    keepalive: true
  }).catch(() => {});
}

// Track a conversion event
export function trackExperimentConversion(experimentId: string, goal: string, extraData?: Record<string, any>) {
  if (typeof window === "undefined") return;
  if (isSearchCrawler()) return;

  const cookieKey = `beraxis_exp_${experimentId}`;
  const variantId = getCookie(cookieKey) || localStorage.getItem(cookieKey) || "control";
  const utmCreative = new URLSearchParams(window.location.search).get("utm_creative") || 
                       localStorage.getItem("beraxis_utm_creative") || "";

  fetch("/api/experiments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "conversion",
      experimentId,
      variantId,
      goal,
      metadata: {
        utm_creative: utmCreative,
        path: window.location.pathname,
        ...extraData
      }
    }),
    keepalive: true
  }).catch(() => {});
}

// Track general UTM social ad attribution
export function initSocialAttribution() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const utmCreative = params.get("utm_creative");
  const utmSource = params.get("utm_source");
  const utmCampaign = params.get("utm_campaign");

  if (utmCreative) {
    localStorage.setItem("beraxis_utm_creative", utmCreative);
    if (utmSource) localStorage.setItem("beraxis_utm_source", utmSource);
    if (utmCampaign) localStorage.setItem("beraxis_utm_campaign", utmCampaign);

    fetch("/api/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "attribution",
        creativeId: utmCreative,
        metadata: {
          utm_source: utmSource || "unknown",
          utm_campaign: utmCampaign || "unknown",
          landing_url: window.location.href
        }
      }),
      keepalive: true
    }).catch(() => {});
  }
}

// React Hook to get active variant for an experiment
export function useExperiment(experimentId: string, fallbackVariantId: string = "control") {
  const [variant, setVariant] = useState<string>(fallbackVariantId);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    // 1. If crawler, strictly lock to Control (Variant A) to guarantee zero cloaking / SEO penalty
    if (isSearchCrawler()) {
      setVariant(fallbackVariantId);
      setIsReady(true);
      return;
    }

    const expConfig = EXPERIMENTS[experimentId];
    if (!expConfig) {
      setVariant(fallbackVariantId);
      setIsReady(true);
      return;
    }

    const cookieKey = `beraxis_exp_${experimentId}`;
    let assigned = getCookie(cookieKey) || localStorage.getItem(cookieKey);

    if (!assigned || !expConfig.variants.some(v => v.id === assigned)) {
      assigned = allocateVariant(expConfig);
      setCookie(cookieKey, assigned, 30);
      try {
        localStorage.setItem(cookieKey, assigned);
      } catch (_) {}
      // Fire impression event for new assignment
      trackExperimentImpression(experimentId, assigned);
    }

    setVariant(assigned);
    setIsReady(true);
  }, [experimentId, fallbackVariantId]);

  const trackConversion = (goal: string, extraData?: Record<string, any>) => {
    trackExperimentConversion(experimentId, goal, extraData);
  };

  return { variant, isReady, trackConversion };
}
