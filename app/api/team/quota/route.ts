import { NextResponse } from "next/server";
import { INITIAL_QUOTA } from "@/lib/teamStorage";
import { CompanyEntity, MultiCompanyQuota } from "@/lib/teamTypes";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const sbHeaders = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

const fallbackCompanyQuotas = new Map<string, MultiCompanyQuota>();

async function lookupUserByEmail(email: string): Promise<any | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    for (let page = 1; page <= 10; page++) {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=100`, {
        headers: sbHeaders,
        cache: "no-store",
      });
      if (!res.ok) break;
      const data = await res.json();
      const users = Array.isArray(data?.users) ? data.users : [];
      const found = users.find((u: any) => (u.email || "").toLowerCase() === cleanEmail);
      if (found) return found;
      if (users.length < 100) break;
    }
  } catch {}
  return null;
}

async function syncAuthUserSeats(email: string, seats: number, planName?: string): Promise<void> {
  const user = await lookupUserByEmail(email);
  if (!user?.id) return;
  try {
    const nextMeta = { ...(user.user_metadata || {}), seats };
    if (planName) nextMeta.plan = planName;
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: "PUT",
      headers: sbHeaders,
      body: JSON.stringify({ user_metadata: nextMeta }),
    });
  } catch {}
}

async function loadCompanyQuota(companyId: string, email?: string): Promise<MultiCompanyQuota> {
  // 1. Check authoritative user_metadata.seats when email is provided
  let authSeats: number | undefined;
  let authPlan: string | undefined;
  let authUserId: string | undefined;
  if (email) {
    const user = await lookupUserByEmail(email);
    if (user) {
      authUserId = user.id;
      const meta = user.user_metadata || {};
      if (meta.seats !== undefined && meta.seats !== null && !Number.isNaN(Number(meta.seats))) {
        authSeats = Math.max(1, Number(meta.seats));
      }
      if (meta.plan) authPlan = String(meta.plan);
    }
  }

  // 2. Check company_quotas by companyId, authUserId, or email (never let stale global CMP-001 override a user's explicit seats)
  const lookupIds = Array.from(new Set([companyId, authUserId, email?.toLowerCase()].filter(Boolean) as string[]));
  for (const cid of lookupIds) {
    if (cid === "CMP-001" && authSeats !== undefined) continue;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/company_quotas?company_id=eq.${encodeURIComponent(cid)}`,
        { headers: sbHeaders, cache: "no-store" }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const r = rows[0];
          const q: MultiCompanyQuota = {
            ...INITIAL_QUOTA,
            planId: r.plan_id || "custom",
            planName: authPlan || r.plan_name || INITIAL_QUOTA.planName,
            totalSeats: authSeats !== undefined ? authSeats : Number(r.total_seats || INITIAL_QUOTA.totalSeats),
            maxCompanies: Number(r.max_companies || 3),
          };
          fallbackCompanyQuotas.set(companyId, q);
          return q;
        }
      }
    } catch {}
  }

  if (authSeats !== undefined) {
    const q: MultiCompanyQuota = {
      ...INITIAL_QUOTA,
      planName: authPlan || INITIAL_QUOTA.planName,
      totalSeats: authSeats,
    };
    fallbackCompanyQuotas.set(companyId, q);
    return q;
  }

  if (!fallbackCompanyQuotas.has(companyId)) {
    fallbackCompanyQuotas.set(companyId, { ...INITIAL_QUOTA });
  }
  return fallbackCompanyQuotas.get(companyId)!;
}

async function saveCompanyQuota(companyId: string, q: MultiCompanyQuota): Promise<void> {
  fallbackCompanyQuotas.set(companyId, q);
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/company_quotas`, {
      method: "POST",
      headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        company_id: companyId,
        plan_id: q.planId,
        plan_name: q.planName,
        total_seats: q.totalSeats,
        max_companies: q.maxCompanies,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch {}
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("company_id") || "CMP-001";
  const email = searchParams.get("email") || undefined;
  const quota = await loadCompanyQuota(companyId, email);
  return NextResponse.json({ success: true, companyId, quota }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const companyId = body.companyId || body.company_id || "CMP-001";
    const email = body.email ? String(body.email).trim().toLowerCase() : undefined;
    const { action, company, addSeats, totalSeats, planName } = body;
    const quota = { ...(await loadCompanyQuota(companyId, email)) };

    if (action === "create_company") {
      if (quota.companies.length >= quota.maxCompanies) {
        return NextResponse.json(
          {
            success: false,
            error: `Maximum company limit reached (${quota.maxCompanies} companies included in your ${quota.planName}).`,
          },
          { status: 400 }
        );
      }

      const newCompany: CompanyEntity = {
        id: `CMP-${(quota.companies.length + 1).toString().padStart(3, "0")}`,
        name: company.name || "New Subsidiary Enterprise",
        code: company.code || `SUB${quota.companies.length + 1}`,
        industry: company.industry || "General Commerce",
        currency: company.currency || "USD ($)",
        timezone: company.timezone || "UTC-5 (EST / Miami)",
        isPrimary: false,
        createdAt: new Date().toISOString().split("T")[0],
      };

      quota.companies = [...quota.companies, newCompany];
      await saveCompanyQuota(companyId, quota);

      return NextResponse.json({
        success: true,
        message: `Company '${newCompany.name}' successfully provisioned!`,
        company: newCompany,
        quota,
      });
    }

    if (action === "set_seats") {
      const nextSeats = Math.max(1, parseInt(String(totalSeats || 5), 10));
      quota.totalSeats = nextSeats;
      quota.availableSeats = Math.max(0, nextSeats - quota.assignedSeats);
      if (planName) quota.planName = String(planName);
      await saveCompanyQuota(companyId, quota);
      if (email) {
        await saveCompanyQuota(email, quota);
        await syncAuthUserSeats(email, nextSeats, planName ? String(planName) : undefined);
      }
      return NextResponse.json({
        success: true,
        message: `Corporate seat pool set to ${nextSeats} seats!`,
        quota,
      });
    }

    if (action === "add_seats") {
      const quantity = Math.max(1, parseInt(String(addSeats || 1), 10));
      quota.totalSeats += quantity;
      quota.availableSeats = Math.max(0, quota.totalSeats - quota.assignedSeats);
      await saveCompanyQuota(companyId, quota);
      if (email) {
        await saveCompanyQuota(email, quota);
        await syncAuthUserSeats(email, quota.totalSeats);
      }

      return NextResponse.json({
        success: true,
        message: `Successfully added ${quantity} seat(s) to your workspace pool!`,
        quota,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
