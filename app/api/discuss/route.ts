import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  readClusterCollection,
  writeClusterCollection,
  verifyClusterAccess,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

interface DiscussClusterData {
  channels: any[];
  messages: Record<string, any[]>;
}

const EMPTY_DISCUSS: DiscussClusterData = { channels: [], messages: {} };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id");
  const ownerEmail = searchParams.get("email") || searchParams.get("owner_email");
  const channelId = searchParams.get("channel_id");

  if (!rawCompanyId && !ownerEmail) {
    return NextResponse.json({ success: true, channels: [], messages: [] });
  }

  const clusterId = resolveSafeClusterId(rawCompanyId, ownerEmail);
  const access = await verifyClusterAccess(clusterId, ownerEmail);
  if (!access.allowed) {
    return NextResponse.json({ error: access.reason || "Forbidden" }, { status: 403 });
  }

  const store = await readClusterCollection<DiscussClusterData>(clusterId, "discuss", EMPTY_DISCUSS);

  if (channelId) {
    return NextResponse.json(
      {
        success: true,
        clusterId,
        messages: (store.messages && store.messages[channelId]) || [],
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      success: true,
      clusterId,
      channels: store.channels || [],
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ownerEmail = body.author_email || body.owner_email || null;
    const clusterId = resolveSafeClusterId(body.company_id, ownerEmail);

    const access = await verifyClusterAccess(clusterId, ownerEmail);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || "Forbidden" }, { status: 403 });
    }

    const store = await readClusterCollection<DiscussClusterData>(
      clusterId,
      "discuss",
      EMPTY_DISCUSS
    );
    const channels = Array.isArray(store.channels) ? [...store.channels] : [];
    const messages = store.messages && typeof store.messages === "object" ? { ...store.messages } : {};

    if (body.action === "send_message") {
      const channelId = String(body.channel_id || "");
      const list = Array.isArray(messages[channelId]) ? messages[channelId] : [];
      const msg = {
        id: body.id || `MSG-${Date.now()}`,
        channel_id: channelId,
        body: String(body.body || ""),
        author_name: body.author_name || "Team Member",
        author_email: body.author_email || "",
        created_at: body.created_at || new Date().toISOString(),
      };
      messages[channelId] = [...list, msg];
      await writeClusterCollection(clusterId, "discuss", { channels, messages }, {
        ownerEmail: ownerEmail || undefined,
      });
      return NextResponse.json({ success: true, clusterId, message: msg });
    }

    const ch = {
      id: body.id || `CH-${Date.now()}`,
      name: String(body.name || "general").trim(),
      description: body.description || "",
      channel_type: body.channel_type || "channel",
      members: Array.isArray(body.members) ? body.members : [],
      created_at: new Date().toISOString(),
    };
    await writeClusterCollection(
      clusterId,
      "discuss",
      { channels: [...channels.filter((c) => c.id !== ch.id), ch], messages },
      { ownerEmail: ownerEmail || undefined }
    );
    return NextResponse.json({ success: true, clusterId, channel: ch });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const ownerEmail = body.owner_email || null;
    const clusterId = resolveSafeClusterId(body.company_id, ownerEmail);

    const access = await verifyClusterAccess(clusterId, ownerEmail);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || "Forbidden" }, { status: 403 });
    }

    const id = String(body.id || "");
    const store = await readClusterCollection<DiscussClusterData>(
      clusterId,
      "discuss",
      EMPTY_DISCUSS
    );
    const nextChannels = (store.channels || []).map((c) => (c.id === id ? { ...c, ...body } : c));
    await writeClusterCollection(clusterId, "discuss", {
      channels: nextChannels,
      messages: store.messages || {},
    });
    return NextResponse.json({ success: true, clusterId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id");
  const ownerEmail = searchParams.get("email") || searchParams.get("owner_email");
  const channelId = searchParams.get("channel_id") || "";
  const msgId = searchParams.get("message_id");

  const clusterId = resolveSafeClusterId(rawCompanyId, ownerEmail);
  const access = await verifyClusterAccess(clusterId, ownerEmail);
  if (!access.allowed) {
    return NextResponse.json({ error: access.reason || "Forbidden" }, { status: 403 });
  }

  const store = await readClusterCollection<DiscussClusterData>(clusterId, "discuss", EMPTY_DISCUSS);
  const channels = Array.isArray(store.channels) ? store.channels : [];
  const messages = store.messages && typeof store.messages === "object" ? { ...store.messages } : {};

  if (msgId && channelId) {
    messages[channelId] = (messages[channelId] || []).filter((m) => m.id !== msgId);
    await writeClusterCollection(clusterId, "discuss", { channels, messages });
    return NextResponse.json({ success: true });
  }

  delete messages[channelId];
  await writeClusterCollection(clusterId, "discuss", {
    channels: channels.filter((c) => c.id !== channelId),
    messages,
  });
  return NextResponse.json({ success: true });
}
