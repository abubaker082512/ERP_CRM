import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

const CONFIG_FILE_PATH = path.join(process.cwd(), "scratch", "gateway_config.json");
const ENV_LOCAL_PATH = path.join(process.cwd(), ".env.local");

export interface GatewayConfig {
  stripe_secret_key: string;
  stripe_publishable_key: string;
  stripe_webhook_secret: string;
  stripe_enabled: boolean;
  stripe_mode: "test" | "live";
  directpay_client_id: string;
  directpay_client_secret: string;
  directpay_enabled: boolean;
}

export function loadGatewayConfig(): GatewayConfig {
  const pubKeyEnvName = ["NEXT", "PUBLIC", "STRIPE", "PUBLISHABLE", "KEY"].join("_");
  const defaultConfig: GatewayConfig = {
    stripe_secret_key: process.env.STRIPE_SECRET_KEY || "",
    stripe_publishable_key: (process.env as any)[pubKeyEnvName] || "",
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || "",
    stripe_enabled: true,
    stripe_mode: (process.env.STRIPE_SECRET_KEY || "").startsWith("sk_live") ? "live" : "test",
    directpay_client_id: process.env.DIRECTPAY_CLIENT_ID || "pwa_ci_k1qlq54hv4gw5pr0khux",
    directpay_client_secret: process.env.DIRECTPAY_CLIENT_SECRET || "pwa_secret_zp5rai8z02zr3o5sebm1co6uxci58uca",
    directpay_enabled: true
  };

  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      return { ...defaultConfig, ...parsed };
    }
  } catch (err) {
    console.error("[Gateway Settings API] Error reading gateway_config.json:", err);
  }

  return defaultConfig;
}

function saveGatewayConfig(config: GatewayConfig) {
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");

    // Also update runtime process.env
    const envObj = process.env as any;
    const pubKeyEnvName = ["NEXT", "PUBLIC", "STRIPE", "PUBLISHABLE", "KEY"].join("_");
    if (config.stripe_secret_key) envObj["STRIPE_SECRET_KEY"] = config.stripe_secret_key;
    if (config.stripe_publishable_key) envObj[pubKeyEnvName] = config.stripe_publishable_key;
    if (config.stripe_webhook_secret) envObj["STRIPE_WEBHOOK_SECRET"] = config.stripe_webhook_secret;

    // Persist to .env.local if present
    try {
      let envContent = "";
      if (fs.existsSync(ENV_LOCAL_PATH)) {
        envContent = fs.readFileSync(ENV_LOCAL_PATH, "utf-8");
      }

      const updateOrAppend = (key: string, val: string) => {
        const regex = new RegExp(`^${key}=.*$`, "m");
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${val}`);
        } else {
          envContent += `\n${key}=${val}`;
        }
      };

      if (config.stripe_secret_key) updateOrAppend("STRIPE_SECRET_KEY", config.stripe_secret_key);
      if (config.stripe_publishable_key) updateOrAppend("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", config.stripe_publishable_key);
      if (config.stripe_webhook_secret) updateOrAppend("STRIPE_WEBHOOK_SECRET", config.stripe_webhook_secret);

      fs.writeFileSync(ENV_LOCAL_PATH, envContent.trim() + "\n", "utf-8");
    } catch (envErr) {
      console.warn("[Gateway Settings API] Could not write to .env.local:", envErr);
    }
  } catch (err) {
    console.error("[Gateway Settings API] Failed to write gateway config:", err);
    throw err;
  }
}

// GET: Retrieve current gateway settings
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Diagnostic Test Stripe
  if (searchParams.get("test") === "stripe") {
    const config = loadGatewayConfig();
    const testKey = searchParams.get("key") || config.stripe_secret_key;

    if (!testKey || !testKey.startsWith("sk_")) {
      return NextResponse.json({
        success: false,
        error: "No valid Stripe secret key configured (must start with sk_test_ or sk_live_)."
      }, { status: 400 });
    }

    try {
      const stripe = new Stripe(testKey, { apiVersion: "2023-10-16" as any });
      const balance = await stripe.balance.retrieve();
      const livemode = testKey.startsWith("sk_live");

      return NextResponse.json({
        success: true,
        message: "Stripe connection verified successfully!",
        livemode,
        currencies: balance.available.map(a => a.currency.toUpperCase()),
        accountMode: livemode ? "LIVE PRODUCTION" : "TEST SANDBOX",
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      return NextResponse.json({
        success: false,
        error: err.message || "Failed to communicate with Stripe API."
      }, { status: 400 });
    }
  }

  const config = loadGatewayConfig();
  return NextResponse.json({
    success: true,
    config: {
      ...config,
      stripe_secret_key: config.stripe_secret_key,
      stripe_publishable_key: config.stripe_publishable_key,
      stripe_webhook_secret: config.stripe_webhook_secret
    }
  }, {
    headers: { "Cache-Control": "no-store, max-age=0" }
  });
}

// POST: Save and update gateway settings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = loadGatewayConfig();

    const updated: GatewayConfig = {
      stripe_secret_key: body.stripe_secret_key !== undefined ? body.stripe_secret_key.trim() : current.stripe_secret_key,
      stripe_publishable_key: body.stripe_publishable_key !== undefined ? body.stripe_publishable_key.trim() : current.stripe_publishable_key,
      stripe_webhook_secret: body.stripe_webhook_secret !== undefined ? body.stripe_webhook_secret.trim() : current.stripe_webhook_secret,
      stripe_enabled: body.stripe_enabled !== undefined ? Boolean(body.stripe_enabled) : current.stripe_enabled,
      stripe_mode: body.stripe_mode || ((body.stripe_secret_key || current.stripe_secret_key || "").startsWith("sk_live") ? "live" : "test"),
      directpay_client_id: body.directpay_client_id !== undefined ? body.directpay_client_id.trim() : current.directpay_client_id,
      directpay_client_secret: body.directpay_client_secret !== undefined ? body.directpay_client_secret.trim() : current.directpay_client_secret,
      directpay_enabled: body.directpay_enabled !== undefined ? Boolean(body.directpay_enabled) : current.directpay_enabled
    };

    saveGatewayConfig(updated);

    return NextResponse.json({
      success: true,
      message: "Payment Gateway settings saved and activated across Beraxis SaaS successfully!",
      config: updated
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "Failed to save gateway settings"
    }, { status: 500 });
  }
}
