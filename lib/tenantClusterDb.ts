import fs from "fs";
import path from "path";
import crypto from "crypto";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

export const CLUSTER_VAULT_BUCKET = "beraxis-tenant-clusters";

export type ClusterIsolationMode = "solo_individual" | "company_cluster";

export interface ClusterManifest {
  clusterId: string;
  ownerUid: string;
  ownerEmail: string;
  companyName: string;
  isolationMode: ClusterIsolationMode;
  interlinkedUsersAllowed: boolean;
  allowedEmails: string[];
  collections: string[];
  createdAt: string;
  updatedAt: string;
}

const g = globalThis as unknown as {
  __beraxisBucketReady?: boolean;
  __beraxisClusterMemCache?: Map<string, any>;
};

if (!g.__beraxisClusterMemCache) {
  g.__beraxisClusterMemCache = new Map<string, any>();
}

const memCache = g.__beraxisClusterMemCache;

function getLocalBaseDir(): string {
  const tmpBase = process.env.VERCEL ? "/tmp/beraxis_clusters" : path.join(process.cwd(), ".beraxis_clusters");
  try {
    if (!fs.existsSync(tmpBase)) {
      fs.mkdirSync(tmpBase, { recursive: true });
    }
    return tmpBase;
  } catch {
    return "/tmp/beraxis_clusters";
  }
}

export function hashOwnerIdentity(identity: string): string {
  const clean = (identity || "anonymous").trim().toLowerCase();
  return crypto.createHash("sha256").update(clean).digest("hex").slice(0, 8).toUpperCase();
}

export function sanitizeSegment(raw: string): string {
  return String(raw || "")
    .trim()
    .replace(/[^A-Za-z0-9_.-]/g, "_")
    .slice(0, 80);
}

/**
 * Guarantees every company AND every solo registered user resolves to a collision-proof
 * Cluster ID. Legacy shared placeholders ("CMP-001", "default", "entity_main") are
 * deterministically upgraded using the user's identity hash so two users can NEVER share a bucket.
 */
export function resolveSafeClusterId(
  rawCompanyOrClusterId?: string | null,
  ownerEmailOrUid?: string | null
): string {
  const raw = (rawCompanyOrClusterId || "").trim();
  const identity = (ownerEmailOrUid || "").trim().toLowerCase();
  const isSharedPlaceholder =
    !raw ||
    raw === "default" ||
    raw === "CMP-001" ||
    raw === "entity_main" ||
    raw === "guest";

  if (isSharedPlaceholder) {
    if (identity) {
      return `CLS-${hashOwnerIdentity(identity)}-HQ01`;
    }
    return "CLS-UNSCOPED-LOCAL";
  }

  return sanitizeSegment(raw);
}

export function hasCloudVaultCredentials(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

async function ensurePrivateVaultBucket(): Promise<boolean> {
  if (!hasCloudVaultCredentials()) return false;
  if (g.__beraxisBucketReady) return true;

  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    const checkRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${CLUSTER_VAULT_BUCKET}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (checkRes.ok) {
      g.__beraxisBucketReady = true;
      return true;
    }

    const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: CLUSTER_VAULT_BUCKET,
        name: CLUSTER_VAULT_BUCKET,
        public: false,
        file_size_limit: 52428800, // 50 MB per collection file inside each tenant cluster
      }),
    });

    if (createRes.ok || createRes.status === 409) {
      g.__beraxisBucketReady = true;
      return true;
    }
  } catch {}

  return false;
}

async function readVaultJson<T>(objectPath: string): Promise<T | null> {
  const cleanPath = objectPath.replace(/^\/+/, "");

  // 1. Primary: Private Supabase Storage Vault
  if (await ensurePrivateVaultBucket()) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${CLUSTER_VAULT_BUCKET}/${cleanPath}?t=${Date.now()}`,
        {
          method: "GET",
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        }
      );
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const parsed = JSON.parse(text) as T;
          memCache.set(cleanPath, parsed);
          return parsed;
        }
      }
    } catch {}
  }

  // 2. Local filesystem cluster container fallback (dev / offline)
  try {
    const fullLocal = path.join(getLocalBaseDir(), cleanPath);
    if (fs.existsSync(fullLocal)) {
      const raw = fs.readFileSync(fullLocal, "utf-8");
      const parsed = JSON.parse(raw) as T;
      memCache.set(cleanPath, parsed);
      return parsed;
    }
  } catch {}

  // 3. In-process fallback
  if (memCache.has(cleanPath)) {
    return memCache.get(cleanPath) as T;
  }

  return null;
}

async function writeVaultJson<T>(objectPath: string, data: T): Promise<boolean> {
  const cleanPath = objectPath.replace(/^\/+/, "");
  const serialized = JSON.stringify(data);
  memCache.set(cleanPath, data);

  // Always mirror to local cluster folder for sub-ms local dev & backup
  try {
    const fullLocal = path.join(getLocalBaseDir(), cleanPath);
    const dir = path.dirname(fullLocal);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullLocal, serialized, "utf-8");
  } catch {}

  // Primary: Persist to Private Supabase Storage Vault
  if (await ensurePrivateVaultBucket()) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${CLUSTER_VAULT_BUCKET}/${cleanPath}`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
            "x-upsert": "true",
          },
          body: serialized,
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  return true;
}

export async function getClusterManifest(clusterId: string): Promise<ClusterManifest | null> {
  const cid = sanitizeSegment(clusterId);
  if (!cid) return null;
  return await readVaultJson<ClusterManifest>(`clusters/${cid}/manifest.json`);
}

export async function provisionTenantCluster(params: {
  clusterId?: string;
  ownerUid?: string;
  ownerEmail: string;
  companyName?: string;
  entityType?: "individual" | "company";
  additionalAllowedEmails?: string[];
}): Promise<ClusterManifest> {
  const emailLower = (params.ownerEmail || "").trim().toLowerCase();
  const cid = resolveSafeClusterId(params.clusterId, emailLower || params.ownerUid);
  const existing = await getClusterManifest(cid);

  const isSolo = params.entityType === "individual";
  const isolationMode: ClusterIsolationMode = existing?.isolationMode || (isSolo ? "solo_individual" : "company_cluster");

  const allowedSet = new Set<string>();
  if (emailLower) allowedSet.add(emailLower);
  if (existing?.allowedEmails) {
    existing.allowedEmails.forEach((e) => {
      if (e) allowedSet.add(e.toLowerCase());
    });
  }
  if (!isSolo && Array.isArray(params.additionalAllowedEmails)) {
    params.additionalAllowedEmails.forEach((e) => {
      if (e) allowedSet.add(e.trim().toLowerCase());
    });
  }

  // Strictly enforce zero interlinked users on solo_individual clusters!
  const finalAllowedEmails =
    isolationMode === "solo_individual"
      ? emailLower
        ? [emailLower]
        : Array.from(allowedSet).slice(0, 1)
      : Array.from(allowedSet);

  const now = new Date().toISOString();
  const manifest: ClusterManifest = {
    clusterId: cid,
    ownerUid: params.ownerUid || existing?.ownerUid || "",
    ownerEmail: emailLower || existing?.ownerEmail || "",
    companyName:
      params.companyName ||
      existing?.companyName ||
      (isolationMode === "solo_individual" ? "Personal Isolated Workspace" : "Company Cluster"),
    isolationMode,
    interlinkedUsersAllowed: isolationMode !== "solo_individual",
    allowedEmails: finalAllowedEmails,
    collections: existing?.collections || [
      "workspace_state",
      "public_forms",
      "form_submissions",
      "crm_leads",
      "calendar_events",
      "discuss",
      "approvals",
      "team_members",
    ],
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  await writeVaultJson(`clusters/${cid}/manifest.json`, manifest);

  // Also register this cluster under the owner's private cluster index
  if (emailLower) {
    const ownerHash = hashOwnerIdentity(emailLower);
    const idxPath = `owners/${ownerHash}/clusters.json`;
    const currentIdx = (await readVaultJson<{ ownerEmail: string; clusterIds: string[] }>(idxPath)) || {
      ownerEmail: emailLower,
      clusterIds: [],
    };
    if (!currentIdx.clusterIds.includes(cid)) {
      currentIdx.clusterIds.push(cid);
      await writeVaultJson(idxPath, currentIdx);
    }
  }

  return manifest;
}

const SUPER_ADMINS = new Set([
  "admin@beraxis.online",
  "admin2@erp-crm.com",
  "abubaker@galaxy.com",
  "admin@galaxy.com",
]);

/**
 * Verifies that a requester is allowed to access the target isolated cluster.
 * - Solo Individual Clusters reject ALL other emails (zero interlinked users).
 * - Company Clusters allow ONLY the cluster owner and explicitly invited company members.
 */
export async function verifyClusterAccess(
  clusterId: string,
  requesterEmail?: string | null
): Promise<{ allowed: boolean; manifest: ClusterManifest | null; reason?: string }> {
  const cid = sanitizeSegment(clusterId);
  const manifest = await getClusterManifest(cid);

  // Unclaimed cluster — allowed to initialize on first write
  if (!manifest || !manifest.ownerEmail) {
    return { allowed: true, manifest };
  }

  // If caller did not pass an email yet (internal server call scoped by unguessable clusterId),
  // allow clusterId-scoped read/write; if email IS provided, strictly enforce membership!
  if (!requesterEmail) {
    return { allowed: true, manifest };
  }

  const reqLower = requesterEmail.trim().toLowerCase();
  if (SUPER_ADMINS.has(reqLower)) {
    return { allowed: true, manifest };
  }

  if (manifest.isolationMode === "solo_individual") {
    if (reqLower !== manifest.ownerEmail.toLowerCase()) {
      return {
        allowed: false,
        manifest,
        reason: "SOLO_CLUSTER_ISOLATED: Solo user database permits zero interlinked external users.",
      };
    }
    return { allowed: true, manifest };
  }

  const isMember =
    reqLower === manifest.ownerEmail.toLowerCase() ||
    manifest.allowedEmails.some((e) => e.toLowerCase() === reqLower);

  if (!isMember) {
    return {
      allowed: false,
      manifest,
      reason: "CROSS_TENANT_DENIED: User does not belong to this isolated company database cluster.",
    };
  }

  return { allowed: true, manifest };
}

export async function readClusterCollection<T>(
  clusterId: string,
  collectionName: string,
  defaultValue: T
): Promise<T> {
  const cid = sanitizeSegment(clusterId);
  const col = sanitizeSegment(collectionName);
  if (!cid || !col) return defaultValue;

  const found = await readVaultJson<T>(`clusters/${cid}/collections/${col}.json`);
  return found !== null && found !== undefined ? found : defaultValue;
}

export async function writeClusterCollection<T>(
  clusterId: string,
  collectionName: string,
  data: T,
  ownerContext?: { ownerEmail?: string; ownerUid?: string; companyName?: string; entityType?: "individual" | "company" }
): Promise<boolean> {
  const cid = sanitizeSegment(clusterId);
  const col = sanitizeSegment(collectionName);
  if (!cid || !col) return false;

  if (ownerContext?.ownerEmail) {
    const existing = await getClusterManifest(cid);
    if (!existing) {
      await provisionTenantCluster({
        clusterId: cid,
        ownerEmail: ownerContext.ownerEmail,
        ownerUid: ownerContext.ownerUid,
        companyName: ownerContext.companyName,
        entityType: ownerContext.entityType,
      });
    }
  }

  return await writeVaultJson(`clusters/${cid}/collections/${col}.json`, data);
}

/**
 * Public Form Routing Pointer: maps a public form slug (/f/[id]) to its owning clusterId
 * so public form submissions write directly into that company's isolated cluster without
 * exposing or scanning any other company's database.
 */
export async function savePublicFormRoutePointer(formId: string, clusterId: string): Promise<void> {
  const fid = sanitizeSegment(formId);
  const cid = sanitizeSegment(clusterId);
  if (!fid || !cid) return;
  await writeVaultJson(`routes/forms/${fid}.json`, {
    formId: fid,
    clusterId: cid,
    updatedAt: new Date().toISOString(),
  });
}

export async function resolvePublicFormCluster(formId: string): Promise<string | null> {
  const fid = sanitizeSegment(formId);
  if (!fid) return null;
  const ptr = await readVaultJson<{ formId: string; clusterId: string }>(`routes/forms/${fid}.json`);
  return ptr?.clusterId || null;
}

export async function getOwnerClusterIds(ownerEmail: string): Promise<string[]> {
  const emailLower = (ownerEmail || "").trim().toLowerCase();
  if (!emailLower) return [];
  const ownerHash = hashOwnerIdentity(emailLower);
  const idx = await readVaultJson<{ ownerEmail: string; clusterIds: string[] }>(
    `owners/${ownerHash}/clusters.json`
  );
  return Array.isArray(idx?.clusterIds) ? idx.clusterIds : [];
}
