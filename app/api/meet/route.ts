import { NextRequest, NextResponse } from "next/server";
import { readClusterCollection, writeClusterCollection } from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

const MEET_VAULT_CLUSTER = "CLS-BERAXIS-MEET-SIGNALING";

export interface MeetParticipant {
  peer_id: string;
  name: string;
  email: string;
  role: "Host" | "Guest" | "Participant";
  is_host: boolean;
  status: "admitted" | "waiting" | "rejected";
  is_muted: boolean;
  is_video_off: boolean;
  is_hand_raised: boolean;
  joined_at: string;
  last_seen: number;
}

export interface MeetSignalEvent {
  seq: number;
  signal_id: string;
  sender_id: string;
  target_id: string | null;
  type: string;
  payload: Record<string, any>;
  created_at: number;
}

export interface MeetAttendeeLog {
  name: string;
  email: string;
  role: string;
  status: "admitted" | "waiting" | "rejected";
  requested_at: string;
  admitted_at?: string;
}

export interface MeetRoomState {
  room_id: string;
  host_peer_id: string;
  host_name: string;
  host_email: string;
  require_admission: boolean;
  seq: number;
  peers: MeetParticipant[];
  events: MeetSignalEvent[];
  attendee_logs: MeetAttendeeLog[];
  updated_at: number;
}

function sanitizeRoomKey(roomId: string): string {
  return `room_${String(roomId || "default").replace(/[^A-Za-z0-9_.-]/g, "_").slice(0, 64)}`;
}

async function loadRoom(roomId: string): Promise<MeetRoomState> {
  const col = sanitizeRoomKey(roomId);
  const existing = await readClusterCollection<MeetRoomState | null>(
    MEET_VAULT_CLUSTER,
    col,
    null
  );

  const now = Date.now();
  const room: MeetRoomState = existing || {
    room_id: roomId,
    host_peer_id: "",
    host_name: "",
    host_email: "",
    require_admission: true,
    seq: 0,
    peers: [],
    events: [],
    attendee_logs: [],
    updated_at: now,
  };

  // Expire peers silent for >45 seconds
  room.peers = (room.peers || []).filter((p) => now - (p.last_seen || 0) < 45000);
  // Keep recent 120 events from last 5 minutes
  room.events = (room.events || [])
    .filter((ev) => now - (ev.created_at || 0) < 300000)
    .slice(-120);

  if (room.host_peer_id && !room.peers.some((p) => p.peer_id === room.host_peer_id)) {
    const nextHost = room.peers.find((p) => p.status === "admitted" && p.is_host);
    room.host_peer_id = nextHost ? nextHost.peer_id : "";
  }

  return room;
}

async function saveRoom(room: MeetRoomState): Promise<void> {
  const col = sanitizeRoomKey(room.room_id);
  room.updated_at = Date.now();
  await writeClusterCollection(MEET_VAULT_CLUSTER, col, room);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("room_id") || "default";
  const peerId = searchParams.get("peer_id") || "";
  const sinceTs = Number(searchParams.get("since_ts") || 0);
  const sinceSeq = Number(searchParams.get("since") || 0);

  const room = await loadRoom(roomId);

  const selfPeer = room.peers.find((p) => p.peer_id === peerId);
  if (selfPeer && Date.now() - selfPeer.last_seen > 5000) {
    selfPeer.last_seen = Date.now();
    await saveRoom(room);
  }

  const myStatus = selfPeer?.status || "waiting";
  const isHost = Boolean(
    selfPeer?.is_host || (room.host_peer_id && room.host_peer_id === peerId)
  );

  const admittedPeers = room.peers.filter(
    (p) => p.status === "admitted" && p.peer_id !== peerId
  );
  const waitingPeers = room.peers.filter((p) => p.status === "waiting");

  const filterAfter = (ev: MeetSignalEvent) => {
    if (sinceTs > 0) return ev.created_at > sinceTs;
    return ev.seq > sinceSeq;
  };

  const relevantEvents =
    myStatus === "admitted"
      ? room.events.filter(
          (ev) =>
            filterAfter(ev) &&
            ev.sender_id !== peerId &&
            (!ev.target_id || ev.target_id === peerId)
        )
      : room.events.filter(
          (ev) =>
            filterAfter(ev) &&
            ev.target_id === peerId &&
            (ev.type === "admitted" || ev.type === "rejected")
        );

  return NextResponse.json(
    {
      success: true,
      room_id: room.room_id,
      seq: room.seq,
      server_ts: Date.now(),
      my_status: myStatus,
      is_host: isHost,
      host_name: room.host_name || "Meeting Host",
      require_admission: room.require_admission,
      peers: admittedPeers,
      waiting_peers: waitingPeers,
      attendee_logs: room.attendee_logs,
      events: relevantEvents,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "join";
    const roomId = String(body.room_id || "default");
    const room = await loadRoom(roomId);
    const now = Date.now();

    if (action === "join") {
      const peerId = String(body.peer_id || `peer_${now}`);
      const name = String(body.name || "Guest Participant").trim();
      const email = String(body.email || "").trim();
      const isCreator = Boolean(body.is_room_creator);

      const isHost = isCreator;

      if (isHost) {
        room.host_peer_id = peerId;
        room.host_name = name;
        room.host_email = email;
      }

      const initialStatus: "admitted" | "waiting" =
        isHost || !room.require_admission ? "admitted" : "waiting";

      const existingIdx = room.peers.findIndex((p) => p.peer_id === peerId);
      const participant: MeetParticipant = {
        peer_id: peerId,
        name,
        email,
        role: isHost ? "Host" : "Guest",
        is_host: isHost,
        status:
          existingIdx >= 0 && room.peers[existingIdx].status === "admitted"
            ? "admitted"
            : initialStatus,
        is_muted: Boolean(body.is_muted),
        is_video_off: Boolean(body.is_video_off),
        is_hand_raised: false,
        joined_at: new Date().toISOString(),
        last_seen: now,
      };

      if (existingIdx >= 0) {
        room.peers[existingIdx] = {
          ...room.peers[existingIdx],
          name,
          email: email || room.peers[existingIdx].email,
          is_host: isHost || room.peers[existingIdx].is_host,
          status: participant.status,
          is_muted: participant.is_muted,
          is_video_off: participant.is_video_off,
          last_seen: now,
        };
      } else {
        room.peers.push(participant);
      }

      const logIdx = room.attendee_logs.findIndex(
        (l) =>
          (email && l.email.toLowerCase() === email.toLowerCase()) || l.name === name
      );
      const logEntry: MeetAttendeeLog = {
        name,
        email: email || "Not provided",
        role: isHost ? "Host" : "Client / Guest",
        status: participant.status,
        requested_at: new Date().toISOString(),
        admitted_at:
          participant.status === "admitted" ? new Date().toISOString() : undefined,
      };
      if (logIdx >= 0) {
        room.attendee_logs[logIdx] = { ...room.attendee_logs[logIdx], ...logEntry };
      } else {
        room.attendee_logs.unshift(logEntry);
      }

      room.seq += 1;
      room.events.push({
        seq: room.seq,
        signal_id: body.signal_id || `join_${peerId}_${now}`,
        sender_id: peerId,
        target_id: null,
        type: participant.status === "admitted" ? "peer_joined" : "guest_waiting",
        payload: { peer_id: peerId, name, email, status: participant.status },
        created_at: now,
      });

      await saveRoom(room);

      return NextResponse.json({
        success: true,
        seq: room.seq,
        server_ts: now,
        my_status: participant.status,
        is_host: isHost,
        host_name: room.host_name || "Meeting Host",
        peers: room.peers.filter((p) => p.status === "admitted" && p.peer_id !== peerId),
        waiting_peers: room.peers.filter((p) => p.status === "waiting"),
        attendee_logs: room.attendee_logs,
      });
    }

    if (action === "admit" || action === "reject") {
      const targetPeerId = String(body.target_peer_id || "");
      const target = room.peers.find((p) => p.peer_id === targetPeerId);
      const sigBase = body.signal_id || `${action}_${targetPeerId}_${now}`;

      if (target) {
        target.status = action === "admit" ? "admitted" : "rejected";
        target.last_seen = now;

        const logItem = room.attendee_logs.find(
          (l) => l.email === target.email || l.name === target.name
        );
        if (logItem) {
          logItem.status = target.status;
          if (action === "admit") {
            logItem.admitted_at = new Date().toISOString();
          }
        }

        room.seq += 1;
        room.events.push({
          seq: room.seq,
          signal_id: sigBase,
          sender_id: String(body.sender_id || room.host_peer_id),
          target_id: targetPeerId,
          type: action === "admit" ? "admitted" : "rejected",
          payload: { peer_id: targetPeerId, name: target.name, email: target.email },
          created_at: now,
        });

        if (action === "admit") {
          room.seq += 1;
          room.events.push({
            seq: room.seq,
            signal_id: `${sigBase}_joined`,
            sender_id: targetPeerId,
            target_id: null,
            type: "peer_joined",
            payload: { peer_id: targetPeerId, name: target.name, email: target.email },
            created_at: now + 1,
          });
        }

        await saveRoom(room);
      } else if (body.guest_info && action === "admit") {
        // Guest was discovered via Realtime Presence before HTTP join landed — insert admitted peer & event!
        room.peers.push({
          peer_id: targetPeerId,
          name: body.guest_info.name || "Guest",
          email: body.guest_info.email || "",
          role: "Guest",
          is_host: false,
          status: "admitted",
          is_muted: false,
          is_video_off: false,
          is_hand_raised: false,
          joined_at: new Date().toISOString(),
          last_seen: now,
        });
        room.attendee_logs.unshift({
          name: body.guest_info.name || "Guest",
          email: body.guest_info.email || "Not provided",
          role: "Client / Guest",
          status: "admitted",
          requested_at: new Date().toISOString(),
          admitted_at: new Date().toISOString(),
        });
        room.seq += 1;
        room.events.push({
          seq: room.seq,
          signal_id: sigBase,
          sender_id: String(body.sender_id || room.host_peer_id),
          target_id: targetPeerId,
          type: "admitted",
          payload: {
            peer_id: targetPeerId,
            name: body.guest_info.name || "Guest",
            email: body.guest_info.email || "",
          },
          created_at: now,
        });
        await saveRoom(room);
      }

      return NextResponse.json({
        success: true,
        seq: room.seq,
        server_ts: now,
        peers: room.peers.filter((p) => p.status === "admitted"),
        waiting_peers: room.peers.filter((p) => p.status === "waiting"),
        attendee_logs: room.attendee_logs,
      });
    }

    if (action === "signal") {
      const senderId = String(body.sender_id || "");
      const targetId = body.target_id ? String(body.target_id) : null;
      const type = String(body.type || "state");
      const payload = body.payload || {};
      const signalId = String(
        body.signal_id || `sig_${senderId}_${now}_${Math.random().toString(36).slice(2, 6)}`
      );

      const sender = room.peers.find((p) => p.peer_id === senderId);
      if (sender) {
        sender.last_seen = now;
        if (type === "state") {
          if (typeof payload.is_muted === "boolean") sender.is_muted = payload.is_muted;
          if (typeof payload.is_video_off === "boolean") sender.is_video_off = payload.is_video_off;
          if (typeof payload.is_hand_raised === "boolean")
            sender.is_hand_raised = payload.is_hand_raised;
          if (typeof payload.name === "string" && payload.name.trim())
            sender.name = payload.name.trim();
        }
      }

      // Deduplicate by signal_id
      if (!room.events.some((e) => e.signal_id === signalId)) {
        room.seq += 1;
        room.events.push({
          seq: room.seq,
          signal_id: signalId,
          sender_id: senderId,
          target_id: targetId,
          type,
          payload,
          created_at: now,
        });
      }

      await saveRoom(room);
      return NextResponse.json({ success: true, seq: room.seq, server_ts: now });
    }

    if (action === "toggle_lobby") {
      room.require_admission = Boolean(body.require_admission);
      await saveRoom(room);
      return NextResponse.json({ success: true, require_admission: room.require_admission });
    }

    if (action === "leave") {
      const peerId = String(body.peer_id || "");
      room.peers = room.peers.filter((p) => p.peer_id !== peerId);
      room.seq += 1;
      room.events.push({
        seq: room.seq,
        signal_id: `leave_${peerId}_${now}`,
        sender_id: peerId,
        target_id: null,
        type: "peer_left",
        payload: { peer_id: peerId },
        created_at: now,
      });
      await saveRoom(room);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Meet API error" }, { status: 400 });
  }
}
