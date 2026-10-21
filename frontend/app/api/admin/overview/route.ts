import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const workspaces = [
    {
      id: "ws-master-001",
      name: "Beraxis Global Headquarters",
      owner_email: "admin@beraxis.online",
      member_count: 8,
      created_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      plan: "Admin Full Control"
    },
    {
      id: "ws-tenant-002",
      name: "Beraxis Sandbox & Live Ops",
      owner_email: "beraxisai@gmail.com",
      member_count: 4,
      created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      plan: "Standard Plan (Early Bird $1/mo)"
    },
    {
      id: "ws-tenant-003",
      name: "Abubaker Enterprise Hub",
      owner_email: "abubaker0825@gmail.com",
      member_count: 6,
      created_at: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      plan: "Admin Full Control"
    },
    {
      id: "ws-tenant-004",
      name: "Apex B2B Growth Partners",
      owner_email: "subscriber@beraxis.online",
      member_count: 2,
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      plan: "Standard Plan (Early Bird $1/mo)"
    }
  ];

  const users = [
    {
      id: "usr-001",
      email: "admin@beraxis.online",
      name: "Master Super Admin",
      role: "super_admin",
      subscription_status: "active",
      workspace_name: "Beraxis Global Headquarters",
      created_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-002",
      email: "beraxisai@gmail.com",
      name: "Beraxis Sandbox Admin",
      role: "owner",
      subscription_status: "active",
      workspace_name: "Beraxis Sandbox & Live Ops",
      created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-003",
      email: "abubaker0825@gmail.com",
      name: "Abubaker Admin",
      role: "super_admin",
      subscription_status: "active",
      workspace_name: "Abubaker Enterprise Hub",
      created_at: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-004",
      email: "subscriber@beraxis.online",
      name: "Pro Subscriber",
      role: "user",
      subscription_status: "active",
      workspace_name: "Apex B2B Growth Partners",
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const tenants = [
    {
      id: "usr-001",
      email: "admin@beraxis.online",
      subscription_status: "active",
      trial_ends_at: trialEnds,
      created_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-002",
      email: "beraxisai@gmail.com",
      subscription_status: "active",
      trial_ends_at: trialEnds,
      created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-003",
      email: "abubaker0825@gmail.com",
      subscription_status: "active",
      trial_ends_at: trialEnds,
      created_at: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-004",
      email: "subscriber@beraxis.online",
      subscription_status: "active",
      trial_ends_at: trialEnds,
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const stats = {
    total_workspaces: workspaces.length,
    total_users: users.length,
    active_subscriptions: tenants.filter(t => t.subscription_status === "active").length,
    total_revenue: 2840.00,
    mrr: 240.00,
    cc_revenue: 2840.00,
    storage_used_gb: 1.4,
    api_calls_today: 1420
  };

  const sales = [
    {
      id: "SO-1001",
      name: "SO-1001",
      customer_name: "Apex B2B Growth Partners",
      amount_total: 12.00,
      state: "done",
      created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "SO-1002",
      name: "SO-1002",
      customer_name: "Beraxis Sandbox & Live Ops",
      amount_total: 12.00,
      state: "done",
      created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const health = {
    api_status: "healthy",
    database: "connected",
    latency_ms: 18,
    uptime_percent: 99.98,
    active_db_partitions: 4,
    server_time: now.toISOString()
  };

  const auditLogs = [
    {
      id: "log-1",
      event: "GATEWAY_CONFIG_UPDATED",
      actor: "Super Admin",
      details: "Configured live Stripe keys & registered live webhook endpoint",
      created_at: new Date(now.getTime() - 15 * 60 * 1000).toISOString()
    },
    {
      id: "log-2",
      event: "CHECKOUT_PROVISIONED",
      actor: "Stripe Engine",
      details: "Stripe Global Checkout activated (Cards, Apple Pay, Google Pay)",
      created_at: new Date(now.getTime() - 45 * 60 * 1000).toISOString()
    },
    {
      id: "log-3",
      event: "SUPERADMIN_LOGIN",
      actor: "admin@beraxis.online",
      details: "Successful administrative authentication session established",
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    }
  ];

  const featureFlags = {
    directpay_card: false,
    stripe_payments: true,
    leads_pool_solo: true,
    early_bird_special: true,
    dynamic_pricing: true
  };

  return NextResponse.json({
    success: true,
    workspaces,
    users,
    tenants,
    stats,
    sales,
    health,
    auditLogs,
    featureFlags
  });
}
