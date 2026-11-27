import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  verifyClusterAccess,
  readClusterCollection,
  writeClusterCollection,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

const DEFAULT_JOURNALS = [
  { id: "j_sales", name: "Customer Invoices", code: "INV", type: "sale" },
  { id: "j_bills", name: "Vendor Bills", code: "BILL", type: "purchase" },
  { id: "j_bank", name: "Bank Operations", code: "BNK1", type: "bank" },
  { id: "j_cash", name: "Cash Register", code: "CSH1", type: "cash" },
  { id: "j_misc", name: "Miscellaneous Operations", code: "MISC", type: "general" },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id") || searchParams.get("cluster_id");
  const email = (searchParams.get("email") || "").trim().toLowerCase() || undefined;

  if (!rawCompanyId && !email) {
    return NextResponse.json({
      success: true,
      invoices: [],
      bills: [],
      entries: [],
      journals: DEFAULT_JOURNALS,
    });
  }

  const clusterId = resolveSafeClusterId(rawCompanyId, email);
  const access = await verifyClusterAccess(clusterId, email);
  if (!access.allowed) {
    return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
  }

  const [invoices, bills, entries, journalsRaw] = await Promise.all([
    readClusterCollection<any[]>(clusterId, "accounting_invoices", []),
    readClusterCollection<any[]>(clusterId, "accounting_bills", []),
    readClusterCollection<any[]>(clusterId, "accounting_entries", []),
    readClusterCollection<any[] | null>(clusterId, "accounting_journals", null),
  ]);

  const journals = Array.isArray(journalsRaw) && journalsRaw.length > 0 ? journalsRaw : DEFAULT_JOURNALS;

  const totalRevenue = (Array.isArray(invoices) ? invoices : []).reduce(
    (s, i) => s + Number(i.amount_total ?? i.amount ?? 0),
    0
  );
  const totalExpenses = (Array.isArray(bills) ? bills : []).reduce(
    (s, b) => s + Number(b.amount_total ?? b.amount ?? 0),
    0
  );

  return NextResponse.json(
    {
      success: true,
      clusterId,
      invoices,
      bills,
      entries,
      journals,
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalExpenses: Number(totalExpenses.toFixed(2)),
        netProfit: Number((totalRevenue - totalExpenses).toFixed(2)),
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.owner_email || body.email || "").trim().toLowerCase() || undefined;
    const clusterId = resolveSafeClusterId(
      body.company_id || body.companyId || body.cluster_id || body.clusterId,
      email
    );

    const access = await verifyClusterAccess(clusterId, email);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
    }

    const action = body.action || "add_entry";
    const now = new Date().toISOString();
    const seq = Date.now().toString().slice(-5);

    if (action === "create_invoice") {
      const invoices = await readClusterCollection<any[]>(clusterId, "accounting_invoices", []);
      const doc = {
        id: body.id || `INV/${new Date().getFullYear()}/${seq}`,
        name: body.name || `INV/${new Date().getFullYear()}/${seq}`,
        customer: String(body.customer || "Client").trim(),
        customer_name: String(body.customer || "Client").trim(),
        amount: Number(body.amount || 0),
        amount_total: Number(body.amount || 0),
        status: body.status || "Paid",
        state: "posted",
        date: now.slice(0, 10),
        created_at: now,
      };
      const next = [doc, ...invoices];
      await writeClusterCollection(clusterId, "accounting_invoices", next, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, invoice: doc, invoices: next });
    }

    if (action === "pay_bill") {
      const bills = await readClusterCollection<any[]>(clusterId, "accounting_bills", []);
      const next = bills.map((b) =>
        b.id === body.id ? { ...b, status: "Paid", paidAt: now } : b
      );
      await writeClusterCollection(clusterId, "accounting_bills", next, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, bills: next });
    }

    const entries = await readClusterCollection<any[]>(clusterId, "accounting_entries", []);
    const entry = {
      id: body.id || `JRN/${new Date().getFullYear()}/${seq}`,
      date: body.date || now.slice(0, 10),
      journal: body.journal || "Bank",
      partner: body.partner || "General Counterparty",
      reference: body.reference || "Manual Ledger Entry",
      type: body.type || "inflow",
      amount: Number(body.amount || 0),
      status: "posted",
      created_at: now,
    };
    const nextEntries = [entry, ...entries];
    await writeClusterCollection(clusterId, "accounting_entries", nextEntries, { ownerEmail: email });

    return NextResponse.json({ success: true, clusterId, entry, entries: nextEntries });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Accounting API error" },
      { status: 400 }
    );
  }
}
