import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const STORE_PATH = path.join(process.cwd(), "scratch", "public_forms.json");

export interface PublicFormField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
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
      { id: "company", label: "Company Name", type: "text", required: false, placeholder: "Acme Corp" },
      { id: "notes", label: "How can we help?", type: "textarea", required: false, placeholder: "Tell us about your team size or requirements..." },
    ],
    submissionsCount: 0,
    createdAt: new Date().toISOString(),
  },
];

let memStore: StoreShape = { forms: [...DEFAULT_FORMS], leads: [] };

function readStore(): StoreShape {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
      if (parsed && Array.isArray(parsed.forms)) {
        memStore = parsed;
        return parsed;
      }
    }
  } catch {}
  return memStore;
}

function writeStore(next: StoreShape) {
  memStore = next;
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(next, null, 2), "utf-8");
  } catch {}
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const companyId = searchParams.get("company_id");
  const includeLeads = searchParams.get("include_leads") === "1";

  const store = readStore();

  if (id) {
    const form = store.forms.find((f) => f.id === id);
    if (!form) {
      return NextResponse.json({ error: "Public form not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, form });
  }

  const forms = companyId
    ? store.forms.filter((f) => f.companyId === companyId || f.id === "beraxis-callback")
    : store.forms;

  const leads = includeLeads
    ? store.leads.filter((l) => !companyId || l.companyId === companyId || l.companyId === "CMP-001")
    : undefined;

  return NextResponse.json({ success: true, forms, leads });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = readStore();
    const slug = (body.title || "lead-form")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 28);
    const id = body.id || `${slug}-${Date.now().toString().slice(-4)}`;

    const form: PublicFormDef = {
      id,
      companyId: body.companyId || "CMP-001",
      companyName: body.companyName || "Workspace",
      title: body.title || "Lead Intake Form",
      description: body.description || "Fill out this form and our team will contact you shortly.",
      campaign: body.campaign || "Public Form",
      submitLabel: body.submitLabel || "Submit Inquiry",
      fields: Array.isArray(body.fields) && body.fields.length > 0 ? body.fields : DEFAULT_FORMS[0].fields,
      submissionsCount: 0,
      createdAt: new Date().toISOString(),
    };

    const nextForms = [form, ...store.forms.filter((f) => f.id !== id)];
    writeStore({ ...store, forms: nextForms });
    return NextResponse.json({ success: true, form });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save form" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { formId, values = {} } = body;
    if (!formId) {
      return NextResponse.json({ error: "formId is required" }, { status: 400 });
    }
    const store = readStore();
    const form = store.forms.find((f) => f.id === formId);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const newLead = {
      id: `FRM-${Date.now().toString().slice(-6)}`,
      companyId: form.companyId,
      name: String(values.name || values.full_name || values.email || "Web Lead").trim(),
      phone: String(values.phone || values.mobile || "N/A").trim(),
      email: String(values.email || "").trim(),
      company: String(values.company || "—").trim(),
      campaign: form.campaign || form.title,
      source: `Public Form (${form.title})`,
      disposition: "New",
      assignedTo: "Unassigned",
      notes: Object.entries(values)
        .filter(([k]) => !["name", "phone", "email", "company"].includes(k))
        .map(([k, v]) => `${k}: ${v}`)
        .join(" | "),
      callsCount: 0,
      createdAt: new Date().toISOString(),
    };

    const nextForms = store.forms.map((f) =>
      f.id === formId ? { ...f, submissionsCount: (f.submissionsCount || 0) + 1 } : f
    );
    const nextLeads = [newLead, ...store.leads].slice(0, 500);
    writeStore({ forms: nextForms, leads: nextLeads });

    return NextResponse.json({ success: true, lead: newLead });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to submit form" }, { status: 500 });
  }
}
