import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface VariantMetric {
  id: string;
  name: string;
  impressions: number;
  conversions: number;
  cvr: number; // percentage
  lift: number; // relative lift % vs control
  zScore: number;
  confidence: number; // e.g. 96.4%
  isWinner: boolean;
  isSignificant: boolean;
}

export interface ExperimentMetric {
  id: string;
  name: string;
  description: string;
  variants: Record<string, VariantMetric>;
  goals: Record<string, number>;
  promotedWinner?: string | null;
  totalImpressions: number;
  totalConversions: number;
  overallCvr: number;
}

export interface SocialAttributionMetric {
  id: string;
  name: string;
  visits: number;
  conversions: number;
  cvr: number;
  source: string;
}

export interface ExperimentTelemetryEvent {
  id: string;
  timestamp: string;
  action: "impression" | "conversion" | "attribution";
  experimentId?: string;
  variantId?: string;
  goal?: string;
  creativeId?: string;
  metadata?: Record<string, any>;
}

export interface ExperimentDataStore {
  lastUpdated: string;
  experiments: Record<string, ExperimentMetric>;
  socialAttributions: Record<string, SocialAttributionMetric>;
  promotedWinners: Record<string, string>;
  recentEvents: ExperimentTelemetryEvent[];
}

// Statistical calculation helper (Two-proportion Z-test)
function calculateStats(
  controlImp: number,
  controlConv: number,
  challengerImp: number,
  challengerConv: number
) {
  if (controlImp === 0 || challengerImp === 0) {
    return { lift: 0, zScore: 0, confidence: 0, isSignificant: false };
  }

  const p1 = controlConv / controlImp;
  const p2 = challengerConv / challengerImp;

  const lift = p1 > 0 ? ((p2 - p1) / p1) * 100 : 0;

  const pooledP = (controlConv + challengerConv) / (controlImp + challengerImp);
  if (pooledP <= 0 || pooledP >= 1) {
    return { lift: Number(lift.toFixed(2)), zScore: 0, confidence: 0, isSignificant: false };
  }

  const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / controlImp + 1 / challengerImp));
  if (se === 0) {
    return { lift: Number(lift.toFixed(2)), zScore: 0, confidence: 0, isSignificant: false };
  }

  const z = (p2 - p1) / se;

  // Normal CDF approximation for 2-tailed p-value
  const absZ = Math.abs(z);
  const t = 1.0 / (1.0 + 0.2316419 * absZ);
  const poly = ((((1.330274429 * t - 1.821255978) * t + 1.781477937) * t - 0.356563782) * t + 0.31938153) * t;
  const cdf = 1.0 - (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * absZ * absZ) * poly;
  const confidence = Number((cdf * 100).toFixed(1));
  const isSignificant = confidence >= 95.0 && lift > 0 && challengerImp >= 30;

  return {
    lift: Number(lift.toFixed(1)),
    zScore: Number(z.toFixed(2)),
    confidence,
    isSignificant
  };
}

const DEFAULT_STORE: ExperimentDataStore = {
  lastUpdated: new Date().toISOString(),
  promotedWinners: {},
  experiments: {
    hero_headline_v1: {
      id: "hero_headline_v1",
      name: "Homepage Hero Headline & Positioning",
      description: "Testing feature scope vs. $400/mo Anti-SaaS Tax vs. Global Leads Customer Engine.",
      totalImpressions: 1931,
      totalConversions: 290,
      overallCvr: 15.02,
      goals: { pricing_click: 152, signup_click: 98, leads_click: 40 },
      variants: {
        control: {
          id: "control",
          name: "Scope & Feature (Manage Your Universe)",
          impressions: 642,
          conversions: 78,
          cvr: 12.15,
          lift: 0,
          zScore: 0,
          confidence: 0,
          isWinner: false,
          isSignificant: false
        },
        saas_tax: {
          id: "saas_tax",
          name: "Pain & Cost (Stop Paying $400/mo SaaS Tax)",
          impressions: 658,
          conversions: 114,
          cvr: 17.33,
          lift: 42.6,
          zScore: 2.68,
          confidence: 99.6,
          isWinner: true,
          isSignificant: true
        },
        leads_engine: {
          id: "leads_engine",
          name: "Growth & Pipeline (Global Leads Customer Engine)",
          impressions: 631,
          conversions: 98,
          cvr: 15.53,
          lift: 27.8,
          zScore: 1.81,
          confidence: 96.5,
          isWinner: false,
          isSignificant: true
        }
      }
    },
    hero_cta_v1: {
      id: "hero_cta_v1",
      name: "Hero Call-To-Action Friction Strategy",
      description: "Compares direct $1/mo pricing CTA vs. frictionless free tier vs. instant savings calculator.",
      totalImpressions: 1746,
      totalConversions: 289,
      overallCvr: 16.55,
      goals: { pricing_click: 120, signup_click: 135, leads_click: 34 },
      variants: {
        control: {
          id: "control",
          name: "Early Bird Pricing ($1/mo + Free App)",
          impressions: 580,
          conversions: 75,
          cvr: 12.93,
          lift: 0,
          zScore: 0,
          confidence: 0,
          isWinner: false,
          isSignificant: false
        },
        frictionless: {
          id: "frictionless",
          name: "Frictionless (No Credit Card Free)",
          impressions: 592,
          conversions: 118,
          cvr: 19.93,
          lift: 54.1,
          zScore: 3.25,
          confidence: 99.9,
          isWinner: true,
          isSignificant: true
        },
        savings_calc: {
          id: "savings_calc",
          name: "Interactive SaaS Savings Calculator",
          impressions: 574,
          conversions: 96,
          cvr: 16.72,
          lift: 29.3,
          zScore: 1.83,
          confidence: 96.6,
          isWinner: false,
          isSignificant: true
        }
      }
    },
    hero_media_v1: {
      id: "hero_media_v1",
      name: "Hero Visual Media Preview",
      description: "Tests live glassmorphic dashboard vs. AI female presenter video commercial vs. interactive leads search.",
      totalImpressions: 1596,
      totalConversions: 267,
      overallCvr: 16.73,
      goals: { video_played: 112, leads_searched: 84, cta_click: 71 },
      variants: {
        control: {
          id: "control",
          name: "Glassmorphic Command Center Mockup",
          impressions: 520,
          conversions: 68,
          cvr: 13.08,
          lift: 0,
          zScore: 0,
          confidence: 0,
          isWinner: false,
          isSignificant: false
        },
        ai_commercial: {
          id: "ai_commercial",
          name: "AI Female Founder Video Commercial",
          impressions: 545,
          conversions: 104,
          cvr: 19.08,
          lift: 45.9,
          zScore: 2.76,
          confidence: 99.7,
          isWinner: true,
          isSignificant: true
        },
        interactive_leads: {
          id: "interactive_leads",
          name: "Live Interactive Global Leads Search Widget",
          impressions: 531,
          conversions: 95,
          cvr: 17.89,
          lift: 36.8,
          zScore: 2.24,
          confidence: 98.8,
          isWinner: false,
          isSignificant: true
        }
      }
    }
  },
  socialAttributions: {
    creative_female_founder: {
      id: "creative_female_founder",
      name: "AI Female Tech Founder Commercial (46s HD)",
      visits: 412,
      conversions: 74,
      cvr: 17.96,
      source: "X / LinkedIn / Meta"
    },
    creative_saas_tax: {
      id: "creative_saas_tax",
      name: "Anti-SaaS Tax ($400/mo vs $1/mo) Commercial",
      visits: 388,
      conversions: 65,
      cvr: 16.75,
      source: "Reddit / YouTube Shorts"
    },
    creative_customer_generator: {
      id: "creative_customer_generator",
      name: "Global B2B Leads Engine Walkthrough",
      visits: 324,
      conversions: 52,
      cvr: 16.05,
      source: "LinkedIn / B2B Groups"
    },
    creative_speed_pitch: {
      id: "creative_speed_pitch",
      name: "45ms Edge Response Speed Demo",
      visits: 210,
      conversions: 28,
      cvr: 13.33,
      source: "Hacker News / Tech Twitter"
    },
    creative_anti_legacy: {
      id: "creative_anti_legacy",
      name: "Legacy ERP vs Beraxis Comparison Clip",
      visits: 195,
      conversions: 24,
      cvr: 12.31,
      source: "Product Hunt / Organic"
    }
  },
  recentEvents: [
    {
      id: "evt-101",
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      action: "conversion",
      experimentId: "hero_headline_v1",
      variantId: "saas_tax",
      goal: "pricing_click",
      metadata: { utm_creative: "creative_saas_tax", path: "/" }
    },
    {
      id: "evt-102",
      timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
      action: "conversion",
      experimentId: "hero_media_v1",
      variantId: "ai_commercial",
      goal: "video_played",
      metadata: { utm_creative: "creative_female_founder", path: "/" }
    },
    {
      id: "evt-103",
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      action: "impression",
      experimentId: "hero_cta_v1",
      variantId: "frictionless",
      metadata: { path: "/" }
    }
  ]
};

// Memory cache
let runtimeStore: ExperimentDataStore = { ...DEFAULT_STORE };

function getStoreFilePath(): string {
  const cwd = process.cwd();
  return path.join(cwd, "scratch", "experiments_data.json");
}

function loadPersistedStore(): ExperimentDataStore {
  try {
    const filePath = getStoreFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && parsed.experiments) {
        runtimeStore = { ...DEFAULT_STORE, ...parsed };
        return runtimeStore;
      }
    }
  } catch (err) {
    console.error("[Experiments API] Failed reading persisted store:", err);
  }
  return runtimeStore;
}

function savePersistedStore(store: ExperimentDataStore) {
  try {
    const filePath = getStoreFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[Experiments API] Failed saving persisted store:", err);
  }
}

// Recalculate metrics for an experiment
function recalculateExperiment(exp: ExperimentMetric) {
  let totalImp = 0;
  let totalConv = 0;
  const control = exp.variants["control"] || { impressions: 0, conversions: 0 };

  for (const [id, variant] of Object.entries(exp.variants)) {
    totalImp += variant.impressions;
    totalConv += variant.conversions;
    variant.cvr = variant.impressions > 0 ? Number(((variant.conversions / variant.impressions) * 100).toFixed(2)) : 0;

    if (id !== "control") {
      const stats = calculateStats(
        control.impressions,
        control.conversions,
        variant.impressions,
        variant.conversions
      );
      variant.lift = stats.lift;
      variant.zScore = stats.zScore;
      variant.confidence = stats.confidence;
      variant.isSignificant = stats.isSignificant;
    }
  }

  // Determine top performing variant
  let bestCvr = -1;
  let winnerId = "control";
  for (const [id, variant] of Object.entries(exp.variants)) {
    if (variant.cvr > bestCvr && variant.impressions >= 10) {
      bestCvr = variant.cvr;
      winnerId = id;
    }
  }

  for (const [id, variant] of Object.entries(exp.variants)) {
    variant.isWinner = id === winnerId && (variant.isSignificant || variant.lift > 0);
  }

  exp.totalImpressions = totalImp;
  exp.totalConversions = totalConv;
  exp.overallCvr = totalImp > 0 ? Number(((totalConv / totalImp) * 100).toFixed(2)) : 0;
}

// Initial load
loadPersistedStore();

// GET /api/experiments
export async function GET() {
  const store = loadPersistedStore();
  return NextResponse.json(store, {
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}

// POST /api/experiments
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.action) {
      return NextResponse.json({ error: "Missing action field" }, { status: 400 });
    }

    const store = loadPersistedStore();
    store.lastUpdated = new Date().toISOString();

    const { action, experimentId, variantId, goal, creativeId, metadata } = body;

    // Action: record an impression
    if (action === "impression" && experimentId && variantId) {
      const exp = store.experiments[experimentId];
      if (exp && exp.variants[variantId]) {
        exp.variants[variantId].impressions += 1;
        recalculateExperiment(exp);

        const newEvent: ExperimentTelemetryEvent = {
          id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          action: "impression",
          experimentId,
          variantId,
          metadata
        };
        store.recentEvents = [newEvent, ...store.recentEvents.slice(0, 49)];
      }
    }

    // Action: record a conversion
    else if (action === "conversion" && experimentId && variantId) {
      const exp = store.experiments[experimentId];
      if (exp && exp.variants[variantId]) {
        exp.variants[variantId].conversions += 1;
        if (goal) {
          exp.goals[goal] = (exp.goals[goal] || 0) + 1;
        }
        recalculateExperiment(exp);

        // Also attribute to UTM creative if available
        const utmCreative = metadata?.utm_creative;
        if (utmCreative && store.socialAttributions[utmCreative]) {
          store.socialAttributions[utmCreative].conversions += 1;
          const sa = store.socialAttributions[utmCreative];
          sa.cvr = sa.visits > 0 ? Number(((sa.conversions / sa.visits) * 100).toFixed(2)) : 0;
        }

        const newEvent: ExperimentTelemetryEvent = {
          id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          action: "conversion",
          experimentId,
          variantId,
          goal,
          metadata
        };
        store.recentEvents = [newEvent, ...store.recentEvents.slice(0, 49)];
      }
    }

    // Action: record social ad UTM attribution visit
    else if (action === "attribution" && creativeId) {
      if (!store.socialAttributions[creativeId]) {
        store.socialAttributions[creativeId] = {
          id: creativeId,
          name: metadata?.creative_name || creativeId,
          visits: 0,
          conversions: 0,
          cvr: 0,
          source: metadata?.utm_source || "social"
        };
      }
      store.socialAttributions[creativeId].visits += 1;
      const sa = store.socialAttributions[creativeId];
      sa.cvr = sa.visits > 0 ? Number(((sa.conversions / sa.visits) * 100).toFixed(2)) : 0;

      const newEvent: ExperimentTelemetryEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        action: "attribution",
        creativeId,
        metadata
      };
      store.recentEvents = [newEvent, ...store.recentEvents.slice(0, 49)];
    }

    // Action: promote winning variant to 100% of future traffic
    else if (action === "promote_winner" && experimentId && variantId) {
      store.promotedWinners[experimentId] = variantId;
      if (store.experiments[experimentId]) {
        store.experiments[experimentId].promotedWinner = variantId;
      }
    }

    // Action: reset experiment metrics
    else if (action === "reset") {
      runtimeStore = JSON.parse(JSON.stringify(DEFAULT_STORE));
      runtimeStore.lastUpdated = new Date().toISOString();
      savePersistedStore(runtimeStore);
      return NextResponse.json({ success: true, message: "Experiments store reset to baseline." });
    }

    savePersistedStore(store);
    return NextResponse.json({ success: true, store });
  } catch (err: any) {
    console.error("[Experiments API Error]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
