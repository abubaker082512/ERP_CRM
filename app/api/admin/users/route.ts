import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const authHeaders = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

async function fetchAllAuthUsers(): Promise<any[]> {
  const allUsers: any[] = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=100`, {
      headers: authHeaders,
      cache: "no-store",
    });
    if (!res.ok) break;
    const data = await res.json();
    const batch = Array.isArray(data?.users) ? data.users : [];
    allUsers.push(...batch);
    if (batch.length < 100) break;
  }
  return allUsers;
}

async function resolveTargetUser(identifier?: string | null, email?: string | null): Promise<any | null> {
  const users = await fetchAllAuthUsers();
  const emailLower = (email || "").trim().toLowerCase();
  const idStr = (identifier || "").trim();

  if (idStr) {
    // Exact UUID match
    const exact = users.find((u) => u.id === idStr);
    if (exact) return exact;

    // Workspace prefix match (`ws-<first12chars>`)
    if (idStr.startsWith("ws-")) {
      const prefix = idStr.slice(3);
      const byPrefix = users.find((u) => u.id.startsWith(prefix));
      if (byPrefix) return byPrefix;
    }
  }

  if (emailLower) {
    const byEmail = users.find((u) => (u.email || "").toLowerCase() === emailLower);
    if (byEmail) return byEmail;
  }

  return null;
}

async function syncTenantRow(id: string, email: string, fields: Record<string, any>) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/tenants`, {
      method: "POST",
      headers: {
        ...authHeaders,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        id,
        email,
        ...fields,
      }),
    });
  } catch (err) {
    console.warn("[AdminUsers] Tenant table sync warning:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "User@123456").toString();
    const name = (body.name || email.split("@")[0] || "New User").toString().trim();
    const companyName = (body.company_name || body.workspace_name || `${name} Workspace`).toString().trim();
    const role = (body.role || "owner").toString().trim();
    const plan = (body.plan || "One App Free").toString().trim();
    const seats = Number(body.seats || body.member_count || 1);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existing = await resolveTargetUser(null, email);
    if (existing) {
      return NextResponse.json({ error: `User with email '${email}' already exists` }, { status: 409 });
    }

    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          name,
          company_name: companyName,
          workspace_name: companyName,
          role,
          plan,
          seats,
          subscription_status: "active",
          signup_source: "super_admin",
        },
      }),
    });

    const createdData = await createRes.json().catch(() => ({}));
    if (!createRes.ok) {
      return NextResponse.json(
        { error: createdData?.msg || createdData?.message || "Failed to create user in Supabase" },
        { status: createRes.status }
      );
    }

    const createdUser = createdData?.user || createdData;
    if (createdUser?.id) {
      await syncTenantRow(createdUser.id, email, {
        subscription_status: "active",
        plan,
      });
    }

    return NextResponse.json({
      success: true,
      user: createdUser,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const target = await resolveTargetUser(body.user_id || body.id, body.email);

    if (!target) {
      return NextResponse.json({ error: "Target user/workspace not found in Supabase Auth" }, { status: 404 });
    }

    const currentMeta = target.user_metadata || {};
    const nextMeta: Record<string, any> = { ...currentMeta };

    if (body.plan !== undefined) nextMeta.plan = body.plan;
    if (body.role !== undefined) nextMeta.role = body.role;
    if (body.name !== undefined) {
      nextMeta.full_name = body.name;
      nextMeta.name = body.name;
    }
    if (body.company_name !== undefined || body.workspace_name !== undefined) {
      const cname = body.company_name || body.workspace_name;
      nextMeta.company_name = cname;
      nextMeta.workspace_name = cname;
    }
    if (body.seats !== undefined) nextMeta.seats = Number(body.seats);
    if (body.industry_id !== undefined) nextMeta.industry_id = body.industry_id;
    if (body.industry_name !== undefined) nextMeta.industry_name = body.industry_name;
    if (body.subscription_status !== undefined) nextMeta.subscription_status = body.subscription_status;

    if (body.action === "activate") {
      nextMeta.subscription_status = "active";
    } else if (body.action === "deactivate") {
      nextMeta.subscription_status = "inactive";
    } else if (body.action === "extend-trial") {
      const baseTime = nextMeta.trial_ends_at ? new Date(nextMeta.trial_ends_at).getTime() : Date.now();
      nextMeta.trial_ends_at = new Date(Math.max(baseTime, Date.now()) + 14 * 24 * 60 * 60 * 1000).toISOString();
      nextMeta.subscription_status = "active";
    }

    const updatePayload: Record<string, any> = {
      user_metadata: nextMeta,
    };
    if (body.password && typeof body.password === "string" && body.password.trim().length >= 6) {
      updatePayload.password = body.password.trim();
    }

    const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${target.id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(updatePayload),
    });

    const updatedData = await updateRes.json().catch(() => ({}));
    if (!updateRes.ok) {
      return NextResponse.json(
        { error: updatedData?.msg || updatedData?.message || "Failed to update user in Supabase" },
        { status: updateRes.status }
      );
    }

    await syncTenantRow(target.id, target.email || "", {
      subscription_status: nextMeta.subscription_status || "active",
      ...(nextMeta.trial_ends_at ? { trial_ends_at: nextMeta.trial_ends_at } : {}),
    });

    return NextResponse.json({
      success: true,
      user: updatedData?.user || updatedData,
      user_metadata: nextMeta,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    const target = await resolveTargetUser(id, email);
    if (!target) {
      return NextResponse.json({ error: "User not found in Supabase Auth" }, { status: 404 });
    }

    const delRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${target.id}`, {
      method: "DELETE",
      headers: authHeaders,
    });

    if (!delRes.ok) {
      const errData = await delRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData?.msg || errData?.message || "Failed to delete user from Supabase" },
        { status: delRes.status }
      );
    }

    await fetch(`${SUPABASE_URL}/rest/v1/tenants?id=eq.${target.id}`, {
      method: "DELETE",
      headers: authHeaders,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      deleted_id: target.id,
      deleted_email: target.email,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
