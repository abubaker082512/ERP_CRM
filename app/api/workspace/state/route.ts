import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  readClusterCollection,
  writeClusterCollection,
  provisionTenantCluster,
  verifyClusterAccess,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

async function findAuthUser(userId?: string | null, email?: string | null) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  for (let page = 1; page <= 10; page++) {
    try {
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
    } catch {
      break;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const email = (searchParams.get("email") || "").trim().toLowerCase();
    const rawClusterId = searchParams.get("cluster_id");

    if (!userId && !email) {
      return NextResponse.json({ state: {} });
    }

    const identity = email || userId || "";
    const masterClusterId = resolveSafeClusterId(null, identity);

    const access = await verifyClusterAccess(masterClusterId, email || null);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || "Forbidden", state: {} }, { status: 403 });
    }

    // 1. Read from dedicated Isolated Micro-DB Cluster Vault first (unlimited 50 MB capacity)
    let clusterState = await readClusterCollection<Record<string, string>>(
      masterClusterId,
      "workspace_state",
      {}
    );

    // Also merge active sub-company cluster state if a distinct sub-company cluster_id was requested
    if (rawClusterId) {
      const subCid = resolveSafeClusterId(rawClusterId, identity);
      if (subCid !== masterClusterId) {
        const subAccess = await verifyClusterAccess(subCid, email || null);
        if (subAccess.allowed) {
          const subState = await readClusterCollection<Record<string, string>>(
            subCid,
            "workspace_state",
            {}
          );
          clusterState = { ...clusterState, ...subState };
        }
      }
    }

    // 2. Seamless auto-migration from legacy user_metadata.workspace_state if vault was empty
    if (Object.keys(clusterState).length === 0) {
      const user = await findAuthUser(userId, email);
      const legacyState = user?.user_metadata?.workspace_state;
      if (legacyState && typeof legacyState === "object" && Object.keys(legacyState).length > 0) {
        clusterState = legacyState;
        await writeClusterCollection(masterClusterId, "workspace_state", legacyState, {
          ownerEmail: email || user?.email || "",
          ownerUid: user?.id || userId || "",
          entityType: user?.user_metadata?.account_type === "individual" ? "individual" : "company",
          companyName: user?.user_metadata?.company_name || "Isolated Workspace",
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        clusterId: masterClusterId,
        state: clusterState,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load state", state: {} }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, email, cluster_id, state } = body;
    const cleanEmail = (email || "").trim().toLowerCase();
    if ((!user_id && !cleanEmail) || !state || typeof state !== "object") {
      return NextResponse.json({ error: "user_id/email and state object are required" }, { status: 400 });
    }

    const identity = cleanEmail || String(user_id || "");
    const masterClusterId = resolveSafeClusterId(null, identity);

    const access = await verifyClusterAccess(masterClusterId, cleanEmail || null);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || "Forbidden" }, { status: 403 });
    }

    // Merge into owner's primary isolated cluster
    const existingMaster = await readClusterCollection<Record<string, string>>(
      masterClusterId,
      "workspace_state",
      {}
    );
    const mergedState: Record<string, string> = {
      ...existingMaster,
      ...state,
    };

    await writeClusterCollection(masterClusterId, "workspace_state", mergedState, {
      ownerEmail: cleanEmail,
      ownerUid: user_id ? String(user_id) : undefined,
    });

    // Partition each individual company's data into its OWN dedicated sub-cluster container!
    for (const [k, v] of Object.entries(state)) {
      if (k.startsWith("beraxis_branches_") && typeof v === "string") {
        try {
          const parsedBranches = JSON.parse(v);
          if (Array.isArray(parsedBranches)) {
            for (const b of parsedBranches) {
              if (!b?.id) continue;
              const subCid = resolveSafeClusterId(b.id, identity);
              await provisionTenantCluster({
                clusterId: subCid,
                ownerEmail: cleanEmail,
                ownerUid: user_id ? String(user_id) : undefined,
                companyName: b.name || "Company Cluster",
                entityType: b.entityType === "individual" ? "individual" : "company",
              });

              const branchScopedKeys: Record<string, string> = {};
              for (const [sk, sv] of Object.entries(mergedState)) {
                if (sk.includes(`_${b.id}_`) && typeof sv === "string") {
                  branchScopedKeys[sk] = sv;
                }
              }
              if (Object.keys(branchScopedKeys).length > 0) {
                await writeClusterCollection(subCid, "workspace_state", branchScopedKeys);
              }
            }
          }
        } catch {}
      }
    }

    if (cluster_id) {
      const explicitSubCid = resolveSafeClusterId(cluster_id, identity);
      if (explicitSubCid !== masterClusterId) {
        const subExisting = await readClusterCollection<Record<string, string>>(
          explicitSubCid,
          "workspace_state",
          {}
        );
        const subFiltered: Record<string, string> = { ...subExisting };
        for (const [sk, sv] of Object.entries(state)) {
          if (typeof sv === "string" && (sk.includes(`_${cluster_id}_`) || sk.includes(`_${explicitSubCid}_`))) {
            subFiltered[sk] = sv;
          }
        }
        await writeClusterCollection(explicitSubCid, "workspace_state", subFiltered, {
          ownerEmail: cleanEmail,
        });
      }
    }

    return NextResponse.json({
      success: true,
      clusterId: masterClusterId,
      keys: Object.keys(mergedState).length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
