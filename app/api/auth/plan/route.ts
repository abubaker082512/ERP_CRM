import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hgmdredpqwuooxbbsejw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbWRyZWRwcXd1b294YmJzZWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA4MDIxNywiZXhwIjoyMTA1NjU2MjE3fQ.jZCH75eRrhrQ2A_8Avu-MGwQwctohyF-ocioBAh3oXU";

function mapPlanToTier(plan?: string, status?: string): "free" | "leadspool" | "standard" | "premium" {
  const p = (plan || "").toLowerCase();
  const s = (status || "").toLowerCase();

  if (p.includes("custom") || p.includes("enterprise") || p.includes("admin full")) {
    return "premium";
  }
  if (p.includes("leads pool") || p.includes("leadspool") || s === "leadspool") {
    return "leadspool";
  }
  if (p.includes("one app free") || p === "free") {
    return "free";
  }
  if (p.includes("standard") || p.includes("pro") || s === "active" || s === "pro" || s === "standard") {
    return "standard";
  }
  return "free";
}

export async function GET(request: NextRequest) {
  try {
    const email = (new URL(request.url).searchParams.get("email") || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ resolved_tier: "free" });
    }

    for (let page = 1; page <= 10; page++) {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=100`, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        cache: "no-store",
      });
      if (!res.ok) break;
      const data = await res.json();
      const users = Array.isArray(data?.users) ? data.users : [];
      const found = users.find((u: any) => (u.email || "").toLowerCase() === email);
      if (found) {
        const meta = found.user_metadata || {};
        let resolvedTier = mapPlanToTier(meta.plan, meta.subscription_status);
        let inheritedFromCompany: string | null = null;

        // If user is on Free tier personally, check if they hold an ACTIVE seat in a Corporate/Paid company
        if (resolvedTier === "free") {
          try {
            const memRes = await fetch(
              `${SUPABASE_URL}/rest/v1/company_members?email=eq.${encodeURIComponent(email)}&status=eq.active&limit=1`,
              {
                headers: {
                  apikey: SUPABASE_SERVICE_ROLE_KEY,
                  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
                cache: "no-store",
              }
            );
            if (memRes.ok) {
              const memRows = await memRes.json();
              if (Array.isArray(memRows) && memRows.length > 0) {
                resolvedTier = "premium";
                inheritedFromCompany = memRows[0].company_id || null;
              }
            }
          } catch {}
        }

        return NextResponse.json(
          {
            email,
            plan: inheritedFromCompany ? "Corporate Team Seat (Owner Paid)" : (meta.plan || "One App Free"),
            subscription_status: meta.subscription_status || "free",
            resolved_tier: resolvedTier,
            inherited_from_company: inheritedFromCompany,
          },
          { headers: { "Cache-Control": "no-store" } }
        );
      }
      if (users.length < 100) break;
    }

    return NextResponse.json({ email, resolved_tier: "free" });
  } catch {
    return NextResponse.json({ resolved_tier: "free" });
  }
}
