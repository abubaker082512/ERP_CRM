import { NextRequest, NextResponse } from "next/server";
import {
  hashOwnerIdentity,
  provisionTenantCluster,
  writeClusterCollection,
  getClusterManifest,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
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

    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          name,
          full_name: name,
          phone,
          account_type: accountType,
          company_name: companyName,
          primary_cluster_id: assignedClusterId,
          isolation_mode: isolationMode,
        },
      }),
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

    const createdUser = data?.user || data;
    const newUid = String(createdUser?.id || "");

    // Provision Dedicated Isolated Micro-Database Cluster
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

      // Seed clean empty isolated collections so zero shared/dummy data ever enters this cluster
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

    return NextResponse.json({
      message: "Account and isolated micro-database cluster created successfully.",
      cluster_id: assignedClusterId,
      isolation_mode: isolationMode,
      user: createdUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err?.message || "Failed to register account." },
      { status: 500 }
    );
  }
}
