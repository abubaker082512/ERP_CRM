import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_PRICING_CONFIG, PricingConfig } from "@/lib/pricingConfig";
import fs from "fs";
import path from "path";

// In-memory cache for ultra-fast response
let runtimePricingConfig: PricingConfig = { ...DEFAULT_PRICING_CONFIG };

const CONFIG_FILE_PATH = path.join(process.cwd(), "scratch", "pricing_config.json");

// Helper to load persisted pricing
function loadPersistedPricing(): PricingConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && parsed.standard && parsed.custom) {
        runtimePricingConfig = { ...DEFAULT_PRICING_CONFIG, ...parsed };
        return runtimePricingConfig;
      }
    }
  } catch (err) {
    console.error("[Pricing API] Failed to read persisted pricing config:", err);
  }
  return runtimePricingConfig;
}

// Helper to save pricing
function savePersistedPricing(config: PricingConfig) {
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("[Pricing API] Failed to write persisted pricing config:", err);
  }
}

// Initial load
loadPersistedPricing();

// GET: Retrieve current pricing configuration
export async function GET() {
  const current = loadPersistedPricing();
  return NextResponse.json(current, {
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}

// POST / PUT: Update pricing configuration from Super Admin Command Center
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.standard) {
      return NextResponse.json(
        { error: "Invalid pricing configuration payload." },
        { status: 400 }
      );
    }

    const updatedConfig: PricingConfig = {
      standard: {
        name: body.standard.name || "Standard",
        annual_monthly_rate: parseFloat(body.standard.annual_monthly_rate) || 1.00,
        monthly_rate: parseFloat(body.standard.monthly_rate) || 5.00,
        original_annual_rate: parseFloat(body.standard.original_annual_rate) || 24.90,
        original_monthly_rate: parseFloat(body.standard.original_monthly_rate) || 31.10,
        is_early_bird: body.standard.is_early_bird !== false,
        badge_text: body.standard.badge_text || "Early Bird Special (Limited Time)",
        bill_annual_upfront: body.standard.bill_annual_upfront !== false,
        lead_credits_per_user_monthly: parseInt(body.standard.lead_credits_per_user_monthly, 10) || 1500
      },
      custom: {
        name: body.custom?.name || "Custom Enterprise",
        annual_monthly_rate: parseFloat(body.custom?.annual_monthly_rate) || 37.40,
        monthly_rate: parseFloat(body.custom?.monthly_rate) || 46.80,
        original_annual_rate: parseFloat(body.custom?.original_annual_rate) || 37.40,
        original_monthly_rate: parseFloat(body.custom?.original_monthly_rate) || 46.80,
        is_early_bird: Boolean(body.custom?.is_early_bird),
        badge_text: body.custom?.badge_text || "Custom Enterprise",
        bill_annual_upfront: body.custom?.bill_annual_upfront !== false,
        lead_credits_per_user_monthly: parseInt(body.custom?.lead_credits_per_user_monthly, 10) || 5000
      },
      updated_at: new Date().toISOString(),
      updated_by: body.updated_by || "Super Admin"
    };

    runtimePricingConfig = updatedConfig;
    savePersistedPricing(updatedConfig);

    return NextResponse.json({
      success: true,
      message: "Plan pricing updated successfully.",
      config: runtimePricingConfig
    });
  } catch (err: any) {
    console.error("[Pricing API] Error updating pricing:", err);
    return NextResponse.json(
      { error: "Failed to update pricing.", details: err?.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}
