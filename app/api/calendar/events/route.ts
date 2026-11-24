import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const fallbackEventsByCompany = new Map<string, any[]>();

export async function GET(req: NextRequest) {
  const companyId = new URL(req.url).searchParams.get("company_id") || "default";
  const events = fallbackEventsByCompany.get(companyId) || [];
  return NextResponse.json({ success: true, events });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const companyId = body.company_id || "default";
    const list = fallbackEventsByCompany.get(companyId) || [];
    const created = {
      id: body.id || `EVT-${Date.now()}`,
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
    fallbackEventsByCompany.set(companyId, [created, ...list]);
    return NextResponse.json(created);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create event" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("company_id") || "default";
  const id = searchParams.get("id") || "";
  const list = fallbackEventsByCompany.get(companyId) || [];
  fallbackEventsByCompany.set(
    companyId,
    list.filter((e) => e.id !== id)
  );
  return NextResponse.json({ success: true, id });
}
