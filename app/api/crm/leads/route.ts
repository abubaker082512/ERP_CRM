import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  readClusterCollection,
  writeClusterCollection,
  verifyClusterAccess,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id");
  const ownerEmail = searchParams.get("email") || searchParams.get("owner_email");

  if (!rawCompanyId && !ownerEmail) {
    return NextResponse.json({ success: true, leads: [] });
  }

  const clusterId = resolveSafeClusterId(rawCompanyId, ownerEmail);
  const access = await verifyClusterAccess(clusterId, ownerEmail);
  if (!access.allowed) {
    return NextResponse.json({ error: access.reason || "Forbidden", leads: [] }, { status: 403 });
  }

  const items = await readClusterCollection<any[]>(clusterId, "crm_leads", []);
  return NextResponse.json(
    { success: true, clusterId, leads: items },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ownerEmail = body.owner_email || body.user_email || null;
    const clusterId = resolveSafeClusterId(body.company_id, ownerEmail);

    const access = await verifyClusterAccess(clusterId, ownerEmail);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || "Forbidden" }, { status: 403 });
    }

    const list = await readClusterCollection<any[]>(clusterId, "crm_leads", []);
    const created = {
      id: body.id || `DEAL-${Date.now()}`,
      cluster_id: clusterId,
      name: String(body.name || "Untitled Deal").trim(),
      type: body.type === "lead" ? "lead" : "opportunity",
      expected_revenue: Number(body.expected_revenue) || 0,
      status: body.status || "New",
      probability: Number(body.probability) || 20,
      priority: Number(body.priority) || 1,
      company_name: body.company_name || "",
      email: body.email || "",
      phone: body.phone || "",
      created_at: new Date().toISOString(),
    };
    const next = [created, ...list.filter((l) => l.id !== created.id)];
    await writeClusterCollection(clusterId, "crm_leads", next, {
      ownerEmail: ownerEmail || undefined,
    });
    return NextResponse.json(created);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create deal" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const ownerEmail = body.owner_email || body.user_email || null;
    const clusterId = resolveSafeClusterId(body.company_id, ownerEmail);

    const access = await verifyClusterAccess(clusterId, ownerEmail);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || "Forbidden" }, { status: 403 });
    }

    const id = String(body.id || "");
    const list = await readClusterCollection<any[]>(clusterId, "crm_leads", []);
    const exists = list.some((l) => l.id === id);
    const updated = exists
      ? list.map((l) => (l.id === id ? { ...l, ...body } : l))
      : [{ ...body, id }, ...list];
    await writeClusterCollection(clusterId, "crm_leads", updated);
    return NextResponse.json({ success: true, clusterId, id, status: body.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update deal" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id");
  const ownerEmail = searchParams.get("email") || searchParams.get("owner_email");
  const id = searchParams.get("id") || "";

  const clusterId = resolveSafeClusterId(rawCompanyId, ownerEmail);
  const access = await verifyClusterAccess(clusterId, ownerEmail);
  if (!access.allowed) {
    return NextResponse.json({ error: access.reason || "Forbidden" }, { status: 403 });
  }

  const list = await readClusterCollection<any[]>(clusterId, "crm_leads", []);
  await writeClusterCollection(
    clusterId,
    "crm_leads",
    list.filter((l) => l.id !== id)
  );
  return NextResponse.json({ success: true, id });
}
