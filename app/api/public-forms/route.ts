import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  readClusterCollection,
  writeClusterCollection,
  savePublicFormRoutePointer,
  resolvePublicFormCluster,
  verifyClusterAccess,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const sbHeaders = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

export const CALL_CENTER_CARRIERS: string[] = [
  "Mutual of Omaha",
  "Aetna / Accendo (CVS)",
  "American Amicable",
  "Prosperity Life",
  "Royal Neighbors of America",
  "Aflac",
  "Transamerica",
  "Guarantee Trust Life (GTL)",
  "Gerber Life",
  "Foresters Financial",
  "Corebridge (AIG)",
  "Sentinel Security Life",
  "Baltimore Life",
  "Great Western",
  "Liberty Bankers Life",
  "Senior Life",
  "Occidental Life",
  "Kemper Life",
  "Family Benefit Life",
  "SBLI",
  "Cigna",
];

export interface PublicFormField {
  id: string;
  label: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "carriers_dropdown"
    | "team_dropdown"
    | "campaigns_dropdown"
    | "stages_dropdown"
    | "departments_dropdown";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface PublicFormDef {
  id: string;
  companyId: string;
  companyName: string;
  ownerEmail?: string;
  title: string;
  description: string;
  campaign: string;
  submitLabel: string;
  fields: PublicFormField[];
  carriers?: string[];
  teamMembers?: { id: string; name: string; email?: string }[];
  submissionsCount: number;
  createdAt: string;
}

const DEFAULT_TEMPLATE_FORM: PublicFormDef = {
  id: "beraxis-callback",
  companyId: "TEMPLATE",
  companyName: "Beraxis Starter Template",
  title: "Request a Callback & Custom Quote",
  description: "Share your contact details and our specialist team will reach out within 15 minutes.",
  campaign: "Inbound Web Form",
  submitLabel: "Request Callback",
  fields: [
    { id: "name", label: "Full Name", type: "text", required: true, placeholder: "e.g. Sarah Khan" },
    { id: "phone", label: "Phone / WhatsApp Number", type: "tel", required: true, placeholder: "+1 555-0199" },
    { id: "email", label: "Work Email", type: "email", required: false, placeholder: "you@company.com" },
    { id: "carrier", label: "Carrier", type: "carriers_dropdown", required: false, options: CALL_CENTER_CARRIERS },
    { id: "notes", label: "How can we help?", type: "textarea", required: false, placeholder: "Tell us about your requirements..." },
  ],
  carriers: CALL_CENTER_CARRIERS,
  submissionsCount: 0,
  createdAt: "2026-11-24T00:00:00.000Z",
};

const gMig = globalThis as unknown as { __beraxisFormsClusterMigrated?: boolean };

/**
 * One-time lossless migration: moves any forms/submissions previously stored in legacy
 * public_forms_registry into each company's OWN isolated cluster folder!
 */
async function ensureLegacyFormsMigratedToIsolatedClusters(): Promise<void> {
  if (gMig.__beraxisFormsClusterMigrated) return;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    gMig.__beraxisFormsClusterMigrated = true;
    return;
  }

  try {
    const marker = await readClusterCollection<{ migrated: boolean }>(
      "SYSTEM-MIGRATION",
      "public_forms_v2",
      { migrated: false }
    );
    if (marker.migrated) {
      gMig.__beraxisFormsClusterMigrated = true;
      return;
    }

    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
      headers: sbHeaders,
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const users = Array.isArray(data?.users) ? data.users : [];
      const host =
        users.find((u: any) => (u.email || "").toLowerCase() === "admin@beraxis.online") ||
        users[0];
      const legacy = host?.user_metadata?.public_forms_registry;

      if (legacy && Array.isArray(legacy.forms)) {
        const formsByCluster = new Map<string, PublicFormDef[]>();
        for (const f of legacy.forms as PublicFormDef[]) {
          if (!f?.id || f.id === "beraxis-callback") continue;
          const cid = resolveSafeClusterId(f.companyId, f.ownerEmail);
          const list = formsByCluster.get(cid) || [];
          if (!list.some((x) => x.id === f.id)) list.push({ ...f, companyId: cid });
          formsByCluster.set(cid, list);
          await savePublicFormRoutePointer(f.id, cid);
        }

        for (const [cid, list] of formsByCluster.entries()) {
          const existing = await readClusterCollection<PublicFormDef[]>(cid, "public_forms", []);
          const merged = [...existing];
          for (const item of list) {
            if (!merged.some((m) => m.id === item.id)) merged.push(item);
          }
          await writeClusterCollection(cid, "public_forms", merged, {
            ownerEmail: list[0]?.ownerEmail,
            companyName: list[0]?.companyName,
          });
        }
      }

      if (legacy && Array.isArray(legacy.leads)) {
        const leadsByCluster = new Map<string, any[]>();
        for (const l of legacy.leads) {
          if (!l?.companyId || l.companyId === "CMP-001") continue;
          const cid = resolveSafeClusterId(l.companyId, null);
          const list = leadsByCluster.get(cid) || [];
          if (!list.some((x) => x.id === l.id)) list.push({ ...l, companyId: cid });
          leadsByCluster.set(cid, list);
        }

        for (const [cid, list] of leadsByCluster.entries()) {
          const existing = await readClusterCollection<any[]>(cid, "form_submissions", []);
          const merged = [...existing];
          for (const item of list) {
            if (!merged.some((m) => m.id === item.id)) merged.push(item);
          }
          await writeClusterCollection(cid, "form_submissions", merged);
        }
      }

      await writeClusterCollection("SYSTEM-MIGRATION", "public_forms_v2", { migrated: true });
    }
  } catch {}

  gMig.__beraxisFormsClusterMigrated = true;
}

export async function GET(req: NextRequest) {
  await ensureLegacyFormsMigratedToIsolatedClusters();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const companyId = searchParams.get("company_id");
  const companyIdsParam = searchParams.get("company_ids");
  const ownerEmail = (searchParams.get("owner_email") || "").trim().toLowerCase();
  const includeLeads = searchParams.get("include_leads") === "1";

  // 1. Public Visitor Opening /f/[id] -> Reads ONLY that 1 form via isolated route pointer!
  if (id) {
    if (id === "beraxis-callback") {
      return NextResponse.json(
        { success: true, form: DEFAULT_TEMPLATE_FORM },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const targetCluster = await resolvePublicFormCluster(id);
    if (!targetCluster) {
      return NextResponse.json({ error: "Public form not found" }, { status: 404 });
    }

    const clusterForms = await readClusterCollection<PublicFormDef[]>(
      targetCluster,
      "public_forms",
      []
    );
    const form = clusterForms.find((f) => f.id === id);
    if (!form) {
      return NextResponse.json({ error: "Public form not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, form }, { headers: { "Cache-Control": "no-store" } });
  }

  // 2. Authenticated Dashboard Query -> Reads ONLY from the user's own isolated company cluster(s)!
  const rawIds = (companyIdsParam ? companyIdsParam.split(",") : companyId ? [companyId] : [])
    .map((s) => s.trim())
    .filter(Boolean);

  if (rawIds.length === 0) {
    // Never dump all tenants' forms when un-scoped! Return only the starter template.
    return NextResponse.json(
      { success: true, forms: [DEFAULT_TEMPLATE_FORM], leads: includeLeads ? [] : undefined },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const resolvedClusterIds = Array.from(
    new Set(rawIds.map((rid) => resolveSafeClusterId(rid, ownerEmail)))
  );

  const aggregatedForms: PublicFormDef[] = [];
  const aggregatedLeads: any[] = [];

  for (const cid of resolvedClusterIds) {
    const access = await verifyClusterAccess(cid, ownerEmail || null);
    if (!access.allowed) continue;

    const cForms = await readClusterCollection<PublicFormDef[]>(cid, "public_forms", []);
    for (const f of cForms) {
      if (!aggregatedForms.some((x) => x.id === f.id)) {
        aggregatedForms.push(f);
      }
    }

    if (includeLeads) {
      const cLeads = await readClusterCollection<any[]>(cid, "form_submissions", []);
      for (const l of cLeads) {
        if (!aggregatedLeads.some((x) => x.id === l.id)) {
          aggregatedLeads.push(l);
        }
      }
    }
  }

  // Always include starter callback template at the end if not already customized
  if (!aggregatedForms.some((f) => f.id === "beraxis-callback")) {
    const primaryCid = resolvedClusterIds[0];
    const templateLeadsCount = includeLeads
      ? aggregatedLeads.filter((l) => l.formId === "beraxis-callback").length
      : 0;
    aggregatedForms.push({
      ...DEFAULT_TEMPLATE_FORM,
      companyId: primaryCid,
      submissionsCount: templateLeadsCount,
    });
  }

  return NextResponse.json(
    {
      success: true,
      forms: aggregatedForms,
      leads: includeLeads ? aggregatedLeads : undefined,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    await ensureLegacyFormsMigratedToIsolatedClusters();
    const body = await req.json();
    const ownerEmail = body.ownerEmail ? String(body.ownerEmail).trim().toLowerCase() : "";
    const clusterId = resolveSafeClusterId(body.companyId, ownerEmail);

    const access = await verifyClusterAccess(clusterId, ownerEmail || null);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || "Forbidden" }, { status: 403 });
    }

    const slug = (body.title || "lead-form")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 28);
    const id = body.id || `${slug || "form"}-${Date.now().toString().slice(-4)}`;

    const form: PublicFormDef = {
      id,
      companyId: clusterId,
      companyName: body.companyName || "Isolated Workspace",
      ownerEmail: ownerEmail || undefined,
      title: body.title || "Public Lead Form",
      description: body.description || "Fill out this form and our team will contact you shortly.",
      campaign: body.campaign || "Public Web Form",
      submitLabel: body.submitLabel || "Submit",
      fields:
        Array.isArray(body.fields) && body.fields.length > 0
          ? body.fields
          : DEFAULT_TEMPLATE_FORM.fields,
      carriers: Array.isArray(body.carriers) ? body.carriers : CALL_CENTER_CARRIERS,
      teamMembers: Array.isArray(body.teamMembers) ? body.teamMembers : [],
      submissionsCount: 0,
      createdAt: new Date().toISOString(),
    };

    const existingForms = await readClusterCollection<PublicFormDef[]>(
      clusterId,
      "public_forms",
      []
    );
    const nextForms = [form, ...existingForms.filter((f) => f.id !== id)];

    await writeClusterCollection(clusterId, "public_forms", nextForms, {
      ownerEmail,
      companyName: form.companyName,
    });
    await savePublicFormRoutePointer(form.id, clusterId);

    return NextResponse.json({ success: true, clusterId, form });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid request" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureLegacyFormsMigratedToIsolatedClusters();
    const body = await req.json();
    const { formId, values } = body;

    let targetCluster = await resolvePublicFormCluster(formId);
    let targetForm: PublicFormDef | undefined;

    if (formId === "beraxis-callback") {
      targetCluster = resolveSafeClusterId(body.companyId, null);
      targetForm = { ...DEFAULT_TEMPLATE_FORM, companyId: targetCluster };
    } else if (targetCluster) {
      const clusterForms = await readClusterCollection<PublicFormDef[]>(
        targetCluster,
        "public_forms",
        []
      );
      targetForm = clusterForms.find((f) => f.id === formId);
    }

    if (!targetCluster || !targetForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const lead = {
      id: `FORM-${Date.now().toString().slice(-6)}`,
      formId: targetForm.id,
      companyId: targetCluster,
      name: values?.name || values?.full_name || "Web Lead",
      phone: values?.phone || "",
      email: values?.email || "",
      company: values?.company || "",
      carrier: values?.carrier || "",
      assignedTo: values?.team_member || values?.agent || "Unassigned",
      campaign: values?.campaign || values?.campaigns_dropdown || targetForm.campaign,
      source: `Public Form: ${targetForm.title}`,
      disposition: "New",
      notes: values?.notes || JSON.stringify(values || {}),
      rawValues: values || {},
      createdAt: new Date().toISOString(),
    };

    const existingLeads = await readClusterCollection<any[]>(
      targetCluster,
      "form_submissions",
      []
    );
    await writeClusterCollection(targetCluster, "form_submissions", [lead, ...existingLeads]);

    if (formId !== "beraxis-callback") {
      const clusterForms = await readClusterCollection<PublicFormDef[]>(
        targetCluster,
        "public_forms",
        []
      );
      const updatedForms = clusterForms.map((f) =>
        f.id === formId ? { ...f, submissionsCount: (f.submissionsCount || 0) + 1 } : f
      );
      await writeClusterCollection(targetCluster, "public_forms", updatedForms);
    }

    return NextResponse.json({ success: true, clusterId: targetCluster, lead });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Submission failed" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  await ensureLegacyFormsMigratedToIsolatedClusters();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const companyId = searchParams.get("company_id");
  const ownerEmail = (searchParams.get("owner_email") || "").trim().toLowerCase();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const targetCluster =
    (await resolvePublicFormCluster(id)) || resolveSafeClusterId(companyId, ownerEmail);

  const access = await verifyClusterAccess(targetCluster, ownerEmail || null);
  if (!access.allowed) {
    return NextResponse.json({ error: access.reason || "Forbidden" }, { status: 403 });
  }

  const existingForms = await readClusterCollection<PublicFormDef[]>(
    targetCluster,
    "public_forms",
    []
  );
  await writeClusterCollection(
    targetCluster,
    "public_forms",
    existingForms.filter((f) => f.id !== id)
  );
  return NextResponse.json({ success: true });
}
