import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const channelsByCompany = new Map<string, any[]>();
const messagesByChannel = new Map<string, any[]>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("company_id") || "default";
  const channelId = searchParams.get("channel_id");

  if (channelId) {
    return NextResponse.json({
      success: true,
      messages: messagesByChannel.get(`${companyId}:${channelId}`) || [],
    });
  }

  return NextResponse.json({
    success: true,
    channels: channelsByCompany.get(companyId) || [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const companyId = body.company_id || "default";

    if (body.action === "send_message") {
      const channelId = String(body.channel_id || "");
      const key = `${companyId}:${channelId}`;
      const list = messagesByChannel.get(key) || [];
      const msg = {
        id: body.id || `MSG-${Date.now()}`,
        channel_id: channelId,
        body: String(body.body || ""),
        author_name: body.author_name || "Team Member",
        author_email: body.author_email || "",
        created_at: body.created_at || new Date().toISOString(),
      };
      messagesByChannel.set(key, [...list, msg]);
      return NextResponse.json({ success: true, message: msg });
    }

    const list = channelsByCompany.get(companyId) || [];
    const ch = {
      id: body.id || `CH-${Date.now()}`,
      name: String(body.name || "general").trim(),
      description: body.description || "",
      channel_type: body.channel_type || "channel",
      members: Array.isArray(body.members) ? body.members : [],
      created_at: new Date().toISOString(),
    };
    channelsByCompany.set(companyId, [...list, ch]);
    return NextResponse.json({ success: true, channel: ch });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const companyId = body.company_id || "default";
    const id = String(body.id || "");
    const list = channelsByCompany.get(companyId) || [];
    const next = list.map((c) => (c.id === id ? { ...c, ...body } : c));
    channelsByCompany.set(companyId, next);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("company_id") || "default";
  const channelId = searchParams.get("channel_id") || "";
  const msgId = searchParams.get("message_id");

  if (msgId && channelId) {
    const key = `${companyId}:${channelId}`;
    const list = messagesByChannel.get(key) || [];
    messagesByChannel.set(
      key,
      list.filter((m) => m.id !== msgId)
    );
    return NextResponse.json({ success: true });
  }

  const list = channelsByCompany.get(companyId) || [];
  channelsByCompany.set(
    companyId,
    list.filter((c) => c.id !== channelId)
  );
  return NextResponse.json({ success: true });
}
