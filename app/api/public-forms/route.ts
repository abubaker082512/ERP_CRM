import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

export const dynamic = "force-dynamic";

const TMP_STORE_PATH = "/tmp/beraxis_public_forms.json";
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

interface StoreShape {
  forms: PublicFormDef[];
  leads: any[];
}

const DEFAULT_FORMS: PublicFormDef[] = [
  {
    id: "beraxis-callback",
    companyId: "CMP-001",
    companyName: "Beraxis Partner Desk",
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
    createdAt: new Date().toISOString(),
  },
];

let memStore: StoreShape = { forms: [...DEFAULT_FORMS], leads: [] };

async function getRegistryHostUser(): Promise<any | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
      headers: sbHeaders,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const users = Array.isArray(data?.users) ? data.users : [];
    return (
      users.find((u: any) => (u.email || "").toLowerCase() === "admin@beraxis.online") ||
      users.find((u: any) => (u.email || "").toLowerCase() === "abubaker0825@gmail.com") ||
      users[0] ||
      null
    );
  } catch {
    return null;
  }
}

async function readStore(): Promise<StoreShape> {
  // 1. Try Supabase cloud registry first (persists across all Vercel instances)
  try {
    const host = await getRegistryHostUser();
    const cloud = host?.user_metadata?.public_forms_registry;
    if (cloud && Array.isArray(cloud.forms)) {
      const hasDefault = cloud.forms.some((f: PublicFormDef) => f.id === "beraxis-callback");
      const mergedForms = hasDefault ? cloud.forms : [...cloud.forms, ...DEFAULT_FORMS];
      memStore = { forms: mergedForms, leads: Array.isArray(cloud.leads) ? cloud.leads : [] };
      return memStore;
    }
  } catch {}

  // 2. Try /tmp fallback
  try {
    if (fs.existsSync(TMP_STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(TMP_STORE_PATH, "utf-8"));
      if (parsed && Array.isArray(parsed.forms)) {
        memStore = parsed;
        return parsed;
      }
    }
  } catch {}

  return memStore;
}

async function writeStore(next: StoreShape): Promise<void> {
  memStore = next;
  try {
    fs.writeFileSync(TMP_STORE_PATH, JSON.stringify(next), "utf-8");
  } catch {}

  try {
    const host = await getRegistryHostUser();
    if (host?.id) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${host.id}`, {
        method: "PUT",
        headers: sbHeaders,
        body: JSON.stringify({
          user_metadata: {
            ...(host.user_metadata || {}),
            public_forms_registry: {
              forms: next.forms.slice(0, 60),
              leads: next.leads.slice(0, 200),
            },
          },
        }),
      });
    }
  } catch {}
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const companyId = searchParams.get("company_id");
  const includeLeads = searchParams.get("include_leads") === "1";

  const store = await readStore();

  if (id) {
    const form = store.forms.find((f) => f.id === id);
    if (!form) {
      return NextResponse.json({ error: "Public form not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, form }, { headers: { "Cache-Control": "no-store" } });
  }

  const forms = companyId
    ? store.forms.filter((f) => f.companyId === companyId || f.id === "beraxis-callback")
    : store.forms;

  const leads = includeLeads
    ? store.leads.filter((l) => !companyId || l.companyId === companyId || l.companyId === "CMP-001")
    : undefined;

  return NextResponse.json({ success: true, forms, leads }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = await readStore();
    const slug = (body.title || "lead-form")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 28);
    const id = body.id || `${slug || "form"}-${Date.now().toString().slice(-4)}`;

    const form: PublicFormDef = {
      id,
      companyId: body.companyId || "CMP-001",
      companyName: body.companyName || "Beraxis Partner",
      title: body.title || "Public Lead Form",
      description: body.description || "Fill out this form and our team will contact you shortly.",
      campaign: body.campaign || "Public Web Form",
      submitLabel: body.submitLabel || "Submit",
      fields: Array.isArray(body.fields) && body.fields.length > 0 ? body.fields : DEFAULT_FORMS[0].fields,
      carriers: Array.isArray(body.carriers) ? body.carriers : CALL_CENTER_CARRIERS,
      teamMembers: Array.isArray(body.teamMembers) ? body.teamMembers : [],
      submissionsCount: 0,
      createdAt: new Date().toISOString(),
    };

    const next: StoreShape = {
      ...store,
      forms: [form, ...store.forms.filter((f) => f.id !== id)],
    };
    await writeStore(next);

    return NextResponse.json({ success: true, form });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid request" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { formId, values } = body;
    const store = await readStore();
    const form = store.forms.find((f) => f.id === formId);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const lead = {
      id: `FORM-${Date.now().toString().slice(-6)}`,
      formId: form.id,
      companyId: form.companyId,
      name: values?.name || values?.full_name || "Web Lead",
      phone: values?.phone || "",
      email: values?.email || "",
      company: values?.company || "",
      carrier: values?.carrier || "",
      assignedTo: values?.team_member || values?.agent || "Unassigned",
      campaign: values?.campaign || values?.campaigns_dropdown || form.campaign,
      source: `Public Form: ${form.title}`,
      disposition: "New",
      notes: values?.notes || JSON.stringify(values || {}),
      rawValues: values || {},
      createdAt: new Date().toISOString(),
    };

    const next: StoreShape = {
      forms: store.forms.map((f) =>
        f.id === formId ? { ...f, submissionsCount: (f.submissionsCount || 0) + 1 } : f
      ),
      leads: [lead, ...store.leads],
    };
    await writeStore(next);

    return NextResponse.json({ success: true, lead });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Submission failed" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const store = await readStore();
  await writeStore({
    ...store,
    forms: store.forms.filter((f) => f.id !== id),
  });
  return NextResponse.json({ success: true });
}
