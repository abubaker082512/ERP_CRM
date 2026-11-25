import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

export const dynamic = "force-dynamic";

const TMP_MEET_PATH = "/tmp/beraxis_meet_rooms.json";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const sbHeaders = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

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

interface MeetStoreShape {
  rooms: Record<string, MeetRoomState>;
}

const g = globalThis as unknown as { __beraxisMeetStore?: MeetStoreShape };
if (!g.__beraxisMeetStore) {
  g.__beraxisMeetStore = { rooms: {} };
}

function readLocalStore(): MeetStoreShape {
  try {
    if (fs.existsSync(TMP_MEET_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(TMP_MEET_PATH, "utf-8"));
      if (parsed && typeof parsed.rooms === "object") {
        g.__beraxisMeetStore = parsed;
        return parsed;
      }
    }
  } catch {}
  return g.__beraxisMeetStore!;
}

function writeLocalStore(store: MeetStoreShape) {
  g.__beraxisMeetStore = store;
  try {
    fs.writeFileSync(TMP_MEET_PATH, JSON.stringify(store), "utf-8");
  } catch {}
}

async function syncAttendeeLogToCloud(roomId: string, attendeeLogs: MeetAttendeeLog[]) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
      headers: sbHeaders,
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = await res.json();
    const users = Array.isArray(data?.users) ? data.users : [];
    const host =
      users.find((u: any) => (u.email || "").toLowerCase() === "admin@beraxis.online") ||
      users[0];
    if (!host?.id) return;
    const existingLogs = host.user_metadata?.meet_attendee_logs || {};
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${host.id}`, {
      method: "PUT",
      headers: sbHeaders,
      body: JSON.stringify({
        user_metadata: {
          ...(host.user_metadata || {}),
          meet_attendee_logs: {
            ...existingLogs,
            [roomId]: attendeeLogs.slice(0, 100),
          },
        },
      }),
    });
  } catch {}
}

function getOrCreateRoom(store: MeetStoreShape, roomId: string): MeetRoomState {
  if (!store.rooms[roomId]) {
    store.rooms[roomId] = {
      room_id: roomId,
      host_peer_id: "",
      host_name: "",
      host_email: "",
      require_admission: true,
      seq: 0,
      peers: [],
      events: [],
      attendee_logs: [],
      updated_at: Date.now(),
    };
  }
  const room = store.rooms[roomId];
  const now = Date.now();
  // Prune stale peers inactive for > 45s
  room.peers = room.peers.filter((p) => now - p.last_seen < 45000);
  // Keep last 200 events
  if (room.events.length > 200) {
    room.events = room.events.slice(-200);
  }
  // Reassign host if host left
  if (room.host_peer_id && !room.peers.some((p) => p.peer_id === room.host_peer_id)) {
    const nextHost = room.peers.find((p) => p.status === "admitted");
    if (nextHost) {
      room.host_peer_id = nextHost.peer_id;
      nextHost.is_host = true;
      nextHost.role = "Host";
    } else {
      room.host_peer_id = "";
    }
  }
  return room;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("room_id") || "default";
  const peerId = searchParams.get("peer_id") || "";
  const since = Number(searchParams.get("since") || 0);

  const store = readLocalStore();
  const room = getOrCreateRoom(store, roomId);

  const selfPeer = room.peers.find((p) => p.peer_id === peerId);
  if (selfPeer) {
    selfPeer.last_seen = Date.now();
    writeLocalStore(store);
  }

  const myStatus = selfPeer?.status || "waiting";
  const isHost = Boolean(selfPeer?.is_host || (room.host_peer_id && room.host_peer_id === peerId));

  const admittedPeers = room.peers.filter((p) => p.status === "admitted" && p.peer_id !== peerId);
  const waitingPeers = room.peers.filter((p) => p.status === "waiting");

  const relevantEvents =
    myStatus === "admitted"
      ? room.events.filter(
          (ev) =>
            ev.seq > since &&
            ev.sender_id !== peerId &&
            (!ev.target_id || ev.target_id === peerId)
        )
      : room.events.filter(
          (ev) =>
            ev.seq > since &&
            ev.target_id === peerId &&
            (ev.type === "admitted" || ev.type === "rejected")
        );

  return NextResponse.json(
    {
      success: true,
      room_id: room.room_id,
      seq: room.seq,
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
    const store = readLocalStore();
    const room = getOrCreateRoom(store, roomId);
    const now = Date.now();

    if (action === "join") {
      const peerId = String(body.peer_id || `peer_${now}`);
      const name = String(body.name || "Guest Participant").trim();
      const email = String(body.email || "").trim();
      const wantsHost = Boolean(body.is_authenticated_user);

      // First person in room OR authenticated workspace host becomes Host automatically
      const isFirstOrHost =
        !room.host_peer_id ||
        room.host_peer_id === peerId ||
        (wantsHost && room.peers.filter((p) => p.is_host).length === 0);

      if (isFirstOrHost) {
        room.host_peer_id = peerId;
        room.host_name = name;
        room.host_email = email;
      }

      const initialStatus: "admitted" | "waiting" =
        isFirstOrHost || !room.require_admission ? "admitted" : "waiting";

      const existingIdx = room.peers.findIndex((p) => p.peer_id === peerId);
      const participant: MeetParticipant = {
        peer_id: peerId,
        name,
        email,
        role: isFirstOrHost ? "Host" : "Guest",
        is_host: isFirstOrHost,
        status: existingIdx >= 0 ? room.peers[existingIdx].status : initialStatus,
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
          last_seen: now,
        };
      } else {
        room.peers.push(participant);
      }

      // Record in attendee_logs (captures name & email of every client/user who joins via link)
      const logIdx = room.attendee_logs.findIndex(
        (l) => (email && l.email.toLowerCase() === email.toLowerCase()) || l.name === name
      );
      const logEntry: MeetAttendeeLog = {
        name,
        email: email || "Not provided",
        role: isFirstOrHost ? "Host" : "Client / Guest",
        status: participant.status,
        requested_at: new Date().toISOString(),
        admitted_at: participant.status === "admitted" ? new Date().toISOString() : undefined,
      };
      if (logIdx >= 0) {
        room.attendee_logs[logIdx] = { ...room.attendee_logs[logIdx], ...logEntry };
      } else {
        room.attendee_logs.unshift(logEntry);
      }

      room.seq += 1;
      room.events.push({
        seq: room.seq,
        sender_id: peerId,
        target_id: null,
        type: participant.status === "admitted" ? "peer_joined" : "guest_waiting",
        payload: { peer_id: peerId, name, email, status: participant.status },
        created_at: now,
      });

      room.updated_at = now;
      writeLocalStore(store);
      syncAttendeeLogToCloud(roomId, room.attendee_logs).catch(() => {});

      return NextResponse.json({
        success: true,
        seq: room.seq,
        my_status: participant.status,
        is_host: isFirstOrHost,
        host_name: room.host_name || "Meeting Host",
        peers: room.peers.filter((p) => p.status === "admitted" && p.peer_id !== peerId),
        waiting_peers: room.peers.filter((p) => p.status === "waiting"),
        attendee_logs: room.attendee_logs,
      });
    }

    if (action === "admit" || action === "reject") {
      const targetPeerId = String(body.target_peer_id || "");
      const target = room.peers.find((p) => p.peer_id === targetPeerId);
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
            sender_id: targetPeerId,
            target_id: null,
            type: "peer_joined",
            payload: { peer_id: targetPeerId, name: target.name, email: target.email },
            created_at: now,
          });
        }

        writeLocalStore(store);
        syncAttendeeLogToCloud(roomId, room.attendee_logs).catch(() => {});
      }

      return NextResponse.json({
        success: true,
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

      const sender = room.peers.find((p) => p.peer_id === senderId);
      if (sender) {
        sender.last_seen = now;
        if (type === "state") {
          if (typeof payload.is_muted === "boolean") sender.is_muted = payload.is_muted;
          if (typeof payload.is_video_off === "boolean") sender.is_video_off = payload.is_video_off;
          if (typeof payload.is_hand_raised === "boolean") sender.is_hand_raised = payload.is_hand_raised;
          if (typeof payload.name === "string" && payload.name.trim()) sender.name = payload.name.trim();
        }
      }

      room.seq += 1;
      room.events.push({
        seq: room.seq,
        sender_id: senderId,
        target_id: targetId,
        type,
        payload,
        created_at: now,
      });

      writeLocalStore(store);
      return NextResponse.json({ success: true, seq: room.seq });
    }

    if (action === "toggle_lobby") {
      room.require_admission = Boolean(body.require_admission);
      writeLocalStore(store);
      return NextResponse.json({ success: true, require_admission: room.require_admission });
    }

    if (action === "leave") {
      const peerId = String(body.peer_id || "");
      room.peers = room.peers.filter((p) => p.peer_id !== peerId);
      room.seq += 1;
      room.events.push({
        seq: room.seq,
        sender_id: peerId,
        target_id: null,
        type: "peer_left",
        payload: { peer_id: peerId },
        created_at: now,
      });
      writeLocalStore(store);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Meet API error" }, { status: 400 });
  }
}
