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

async function loadCompanyQuota(companyId: string): Promise<MultiCompanyQuota> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/company_quotas?company_id=eq.${encodeURIComponent(companyId)}`,
      { headers: sbHeaders, cache: "no-store" }
    );
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const r = rows[0];
        const q: MultiCompanyQuota = {
          ...INITIAL_QUOTA,
          planId: r.plan_id || "custom",
          planName: r.plan_name || "Custom Enterprise Plan",
          totalSeats: Number(r.total_seats || 50),
          maxCompanies: Number(r.max_companies || 3),
        };
        fallbackCompanyQuotas.set(companyId, q);
        return q;
      }
    }
  } catch {}
  if (!fallbackCompanyQuotas.has(companyId)) {
    fallbackCompanyQuotas.set(companyId, { ...INITIAL_QUOTA, totalSeats: 50 });
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
  const quota = await loadCompanyQuota(companyId);
  return NextResponse.json({ success: true, companyId, quota });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const companyId = body.companyId || body.company_id || "CMP-001";
    const { action, company, addSeats, totalSeats, planName } = body;
    const quota = { ...(await loadCompanyQuota(companyId)) };

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
      const nextSeats = Math.max(1, parseInt(String(totalSeats || 50), 10));
      quota.totalSeats = nextSeats;
      quota.availableSeats = Math.max(0, nextSeats - quota.assignedSeats);
      if (planName) quota.planName = String(planName);
      await saveCompanyQuota(companyId, quota);
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
