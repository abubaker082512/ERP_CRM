import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hgmdredpqwuooxbbsejw.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbWRyZWRwcXd1b294YmJzZWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA4MDIxNywiZXhwIjoyMTA1NjU2MjE3fQ.jZCH75eRrhrQ2A_8Avu-MGwQwctohyF-ocioBAh3oXU";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ detail: "Email and password are required." }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim(), password }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.access_token) {
      return NextResponse.json(
        { detail: data?.error_description || data?.msg || "Invalid email or password." },
        { status: res.status || 401 }
      );
    }

    const u = data.user || {};
    const meta = u.user_metadata || {};
    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      session_id: `sb_${Date.now()}`,
      user: {
        id: u.id,
        email: u.email,
        name: meta.full_name || meta.name || (u.email ? u.email.split("@")[0] : "User"),
        role: meta.role || "owner",
        account_type: meta.account_type || "company",
        company_name: meta.company_name || meta.workspace_name || "",
        plan: meta.plan || "One App Free",
        subscription_status: meta.subscription_status || "free",
        user_metadata: meta,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Authentication failed" }, { status: 500 });
  }
}
