import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  getClusterManifest,
  provisionTenantCluster,
  verifyClusterAccess,
  hasCloudVaultCredentials,
  getOwnerClusterIds,
  CLUSTER_VAULT_BUCKET,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawClusterId = searchParams.get("cluster_id") || searchParams.get("company_id");
    const email = (searchParams.get("email") || "").trim().toLowerCase();
    const companyName = searchParams.get("company_name") || undefined;
    const entityType = searchParams.get("entity_type") === "individual" ? "individual" : "company";

    const clusterId = resolveSafeClusterId(rawClusterId, email);
    const access = await verifyClusterAccess(clusterId, email || null);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || "Access denied" }, { status: 403 });
    }

    let manifest = access.manifest;
    if (!manifest && email) {
      manifest = await provisionTenantCluster({
        clusterId,
        ownerEmail: email,
        companyName,
        entityType,
      });
    }

    const ownedClusters = email ? await getOwnerClusterIds(email) : [clusterId];

    return NextResponse.json(
      {
        success: true,
        clusterId,
        vaultBucket: CLUSTER_VAULT_BUCKET,
        vaultMode: hasCloudVaultCredentials()
          ? "Supabase Private Vault (Server-Isolated)"
          : "Local Isolated Micro-DB Vault",
        manifest: manifest || {
          clusterId,
          ownerEmail: email,
          companyName: companyName || "Isolated Workspace",
          isolationMode: entityType === "individual" ? "solo_individual" : "company_cluster",
          interlinkedUsersAllowed: entityType !== "individual",
          allowedEmails: email ? [email] : [],
          collections: [
            "workspace_state",
            "public_forms",
            "form_submissions",
            "crm_leads",
            "calendar_events",
            "discuss",
            "approvals",
            "team_members",
          ],
        },
        ownedClusterCount: Math.max(1, ownedClusters.length),
        ownedClusters,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Cluster lookup error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || body.ownerEmail || "").trim().toLowerCase();
    const rawClusterId = body.clusterId || body.companyId || null;
    const entityType: "individual" | "company" =
      body.entityType === "individual" || body.accountType === "individual"
        ? "individual"
        : "company";
    const companyName = String(body.companyName || "Isolated Workspace").trim();

    if (!email) {
      return NextResponse.json({ error: "ownerEmail is required to provision an isolated cluster" }, { status: 400 });
    }

    const clusterId = resolveSafeClusterId(rawClusterId, email);
    const access = await verifyClusterAccess(clusterId, email);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || "Forbidden" }, { status: 403 });
    }

    const manifest = await provisionTenantCluster({
      clusterId,
      ownerUid: body.ownerUid ? String(body.ownerUid) : undefined,
      ownerEmail: email,
      companyName,
      entityType,
      additionalAllowedEmails: Array.isArray(body.additionalAllowedEmails)
        ? body.additionalAllowedEmails
        : undefined,
    });

    return NextResponse.json({ success: true, manifest });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Cluster provision error" }, { status: 500 });
  }
}
