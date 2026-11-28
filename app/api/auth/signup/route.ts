import { NextRequest, NextResponse } from "next/server";
import {
  hashOwnerIdentity,
  provisionTenantCluster,
  writeClusterCollection,
  getClusterManifest,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  SUPABASE_SERVICE_KEY ||
  ""
).trim();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const accountType: "individual" | "company" =
      body.account_type === "company" ? "company" : "individual";
    const companyName =
      accountType === "company" && body.company_name
        ? String(body.company_name).trim()
        : `${name || email.split("@")[0] || "Personal"} Isolated Workspace`;
    const phone = String(body.phone || "").trim();
    const inviteClusterId = body.invite_cluster_id ? String(body.invite_cluster_id).trim() : "";

    if (!email || !password) {
      return NextResponse.json({ detail: "Email and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { detail: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const ownerHash = hashOwnerIdentity(email);
    const assignedClusterId = inviteClusterId
      ? inviteClusterId
      : `CLS-${ownerHash}-${accountType === "individual" ? "SOLO" : "HQ01"}`;
    const isolationMode = accountType === "individual" ? "solo_individual" : "company_cluster";

    const userMeta = {
      name,
      full_name: name,
      phone,
      account_type: accountType,
      company_name: companyName,
      primary_cluster_id: assignedClusterId,
      isolation_mode: isolationMode,
      plan: "One App Free",
      subscription_status: "free",
    };

    let createdUser: any = null;

    // 1. Create pre-confirmed user via Admin API when service key is available so founders enter /apps in <3s
    if (SUPABASE_SERVICE_KEY) {
      const adminRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: userMeta,
        }),
        cache: "no-store",
      });
      const adminData = await adminRes.json().catch(() => ({}));
      if (!adminRes.ok) {
        return NextResponse.json(
          {
            detail:
              adminData?.msg ||
              adminData?.error_description ||
              adminData?.message ||
              "Signup failed. This email may already be registered.",
          },
          { status: adminRes.status || 400 }
        );
      }
      createdUser = adminData?.user || adminData;
    } else {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, data: userMeta }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return NextResponse.json(
          {
            detail:
              data?.msg ||
              data?.error_description ||
              data?.message ||
              "Signup failed. Please check your details.",
          },
          { status: res.status || 400 }
        );
      }
      createdUser = data?.user || data;
    }

    const newUid = String(createdUser?.id || "");

    // 2. Provision Dedicated Isolated Micro-Database Cluster
    if (inviteClusterId) {
      const targetManifest = await getClusterManifest(inviteClusterId);
      if (targetManifest && targetManifest.isolationMode === "company_cluster") {
        await provisionTenantCluster({
          clusterId: inviteClusterId,
          ownerUid: targetManifest.ownerUid,
          ownerEmail: targetManifest.ownerEmail,
          companyName: targetManifest.companyName,
          entityType: "company",
          additionalAllowedEmails: [email],
        });
      }
    } else {
      const manifest = await provisionTenantCluster({
        clusterId: assignedClusterId,
        ownerUid: newUid,
        ownerEmail: email,
        companyName,
        entityType: accountType,
      });

      await Promise.all([
        writeClusterCollection(manifest.clusterId, "workspace_state", {}),
        writeClusterCollection(manifest.clusterId, "crm_leads", []),
        writeClusterCollection(manifest.clusterId, "public_forms", []),
        writeClusterCollection(manifest.clusterId, "form_submissions", []),
        writeClusterCollection(manifest.clusterId, "calendar_events", []),
        writeClusterCollection(manifest.clusterId, "discuss", { channels: [], messages: {} }),
        writeClusterCollection(manifest.clusterId, "approvals", []),
        writeClusterCollection(manifest.clusterId, "team_members", [
          {
            id: "USR-001",
            name: name || email.split("@")[0],
            email,
            role: "Owner",
            department: "Executive",
            companyIds: [manifest.clusterId],
            reportsToId: null,
            allowedModules: ["*"],
            type: "full_time",
            status: "active",
          },
        ]),
      ]);
    }

    // 3. Exchange credentials for an immediate session token so /signup redirects straight into /apps!
    let accessToken = "";
    let refreshToken = "";
    try {
      const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });
      const tokenData = await tokenRes.json().catch(() => ({}));
      if (tokenRes.ok && tokenData?.access_token) {
        accessToken = tokenData.access_token;
        refreshToken = tokenData.refresh_token || "";
      }
    } catch {}

    const sessionId = `sb_${Date.now()}`;
    const formattedUser = {
      id: newUid || createdUser?.id || email,
      email,
      name: name || email.split("@")[0],
      role: "owner",
      account_type: accountType,
      company_name: companyName,
      plan: "One App Free",
      subscription_status: "free",
      cluster_id: assignedClusterId,
      user_metadata: userMeta,
    };

    return NextResponse.json({
      message: "Account and isolated micro-database cluster created successfully.",
      cluster_id: assignedClusterId,
      isolation_mode: isolationMode,
      access_token: accessToken || undefined,
      refresh_token: refreshToken || undefined,
      session_id: sessionId,
      user: formattedUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err?.message || "Failed to register account." },
      { status: 500 }
    );
  }
}
