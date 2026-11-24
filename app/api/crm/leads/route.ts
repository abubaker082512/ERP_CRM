import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const fallbackLeadsByCompany = new Map<string, any[]>();

export async function GET(req: NextRequest) {
  const companyId = new URL(req.url).searchParams.get("company_id") || "default";
  const items = fallbackLeadsByCompany.get(companyId) || [];
  return NextResponse.json({ success: true, leads: items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const companyId = body.company_id || "default";
    const list = fallbackLeadsByCompany.get(companyId) || [];
    const created = {
      id: body.id || `DEAL-${Date.now()}`,
      name: String(body.name || "Untitled Deal").trim(),
      type: body.type === "lead" ? "lead" : "opportunity",
      expected_revenue: Number(body.expected_revenue) || 0,
      status: body.status || "New",
      probability: Number(body.probability) || 20,
      priority: Number(body.priority) || 1,
      company_name: body.company_name || "",
      email: body.email || "",
      created_at: new Date().toISOString(),
    };
    const next = [created, ...list];
    fallbackLeadsByCompany.set(companyId, next);
    return NextResponse.json(created);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create deal" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const companyId = body.company_id || "default";
    const id = String(body.id || "");
    const list = fallbackLeadsByCompany.get(companyId) || [];
    const exists = list.some((l) => l.id === id);
    const updated = exists
      ? list.map((l) => (l.id === id ? { ...l, ...body } : l))
      : [{ ...body, id }, ...list];
    fallbackLeadsByCompany.set(companyId, updated);
    return NextResponse.json({ success: true, id, status: body.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update deal" }, { status: 400 });
  }
}
