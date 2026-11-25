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
    return NextResponse.json({ success: true, events: [] });
  }

  const clusterId = resolveSafeClusterId(rawCompanyId, ownerEmail);
  const access = await verifyClusterAccess(clusterId, ownerEmail);
  if (!access.allowed) {
    return NextResponse.json({ error: access.reason || "Forbidden", events: [] }, { status: 403 });
  }

  const events = await readClusterCollection<any[]>(clusterId, "calendar_events", []);
  return NextResponse.json(
    { success: true, clusterId, events },
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

    const list = await readClusterCollection<any[]>(clusterId, "calendar_events", []);
    const created = {
      id: body.id || `EVT-${Date.now()}`,
      cluster_id: clusterId,
      title: String(body.title || "Untitled Event").trim(),
      event_type: body.event_type || "event",
      start_time: body.start_time || new Date().toISOString(),
      end_time: body.end_time || new Date(Date.now() + 3600000).toISOString(),
      description: body.description || "",
      customer_name: body.customer_name || "",
      customer_email: body.customer_email || "",
      assignee: body.assignee || "",
      meet_link: body.meet_link || "",
      notes: body.notes || "",
      state: "confirmed",
    };
    await writeClusterCollection(
      clusterId,
      "calendar_events",
      [created, ...list.filter((e) => e.id !== created.id)],
      { ownerEmail: ownerEmail || undefined }
    );
    return NextResponse.json(created);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create event" }, { status: 400 });
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

  const list = await readClusterCollection<any[]>(clusterId, "calendar_events", []);
  await writeClusterCollection(
    clusterId,
    "calendar_events",
    list.filter((e) => e.id !== id)
  );
  return NextResponse.json({ success: true, id });
}
