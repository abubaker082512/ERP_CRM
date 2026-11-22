import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hgmdredpqwuooxbbsejw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbWRyZWRwcXd1b294YmJzZWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA4MDIxNywiZXhwIjoyMTA1NjU2MjE3fQ.jZCH75eRrhrQ2A_8Avu-MGwQwctohyF-ocioBAh3oXU";

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

async function findAuthUser(userId?: string | null, email?: string | null) {
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=100`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) break;
    const data = await res.json();
    const users = Array.isArray(data?.users) ? data.users : [];
    const found = users.find(
      (u: any) =>
        (userId && u.id === userId) ||
        (email && (u.email || "").toLowerCase() === email.trim().toLowerCase())
    );
    if (found) return found;
    if (users.length < 100) break;
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const email = searchParams.get("email");
    if (!userId && !email) {
      return NextResponse.json({ state: {} });
    }

    const user = await findAuthUser(userId, email);
    const state = user?.user_metadata?.workspace_state || {};
    return NextResponse.json({ success: true, state }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load state", state: {} }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, email, state } = body;
    if ((!user_id && !email) || !state || typeof state !== "object") {
      return NextResponse.json({ error: "user_id/email and state object are required" }, { status: 400 });
    }

    const user = await findAuthUser(user_id, email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentMeta = user.user_metadata || {};
    const mergedState = {
      ...(currentMeta.workspace_state || {}),
      ...state,
    };

    const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        user_metadata: {
          ...currentMeta,
          workspace_state: mergedState,
          workspace_state_updated_at: new Date().toISOString(),
        },
      }),
    });

    if (!updateRes.ok) {
      return NextResponse.json({ error: "Failed to persist workspace state" }, { status: updateRes.status });
    }

    return NextResponse.json({ success: true, keys: Object.keys(mergedState).length });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
