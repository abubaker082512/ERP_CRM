import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  verifyClusterAccess,
  readClusterCollection,
  writeClusterCollection,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

export interface WarmTransferRecord {
  id: string;
  leadId: string;
  leadName: string;
  phone: string;
  company: string;
  campaign: string;
  fronterAgent: string;
  closerAgent: string;
  carrierOrProduct: string;
  estimatedValue: number;
  qualificationNotes: string;
  status: "Waiting Closer" | "In Closer Call" | "Closed Won" | "Follow-Up";
  salesOrderRef?: string;
  createdAt: string;
  closedAt?: string;
}

export interface DNCEntry {
  id: string;
  phone: string;
  normalizedPhone: string;
  reason: string;
  source: "Customer Opt-Out" | "Federal / National DNC" | "Litigator Shield" | "Supervisor Block";
  addedBy: string;
  createdAt: string;
}

export interface QAScorecardRecord {
  id: string;
  leadName: string;
  agentName: string;
  campaign: string;
  reviewer: string;
  complianceDisclosurePass: boolean; // Auto-fail gate if false
  scores: {
    disclosure: number;      // out of 25
    verification: number;    // out of 15
    scriptAdherence: number; // out of 20
    objectionEmpathy: number;// out of 20
    crmHygiene: number;      // out of 20
  };
  totalScore: number; // 0 - 100
  outcome: "Passed" | "Coaching Required" | "Compliance Auto-Fail";
  notes: string;
  createdAt: string;
}

export interface InboundACDQueue {
  id: string;
  ivrDigit: string;
  name: string;
  skillGroup: string;
  routingStrategy: "Longest Idle" | "Round Robin" | "Skill Weighted";
  slaTargetPct: number;
  slaSeconds: number;
  callsWaiting: number;
  callsAnswered: number;
  callsAbandoned: number;
}

export interface AgentPresenceRecord {
  email: string;
  name: string;
  role: "Fronter" | "Closer" | "Inbound Support" | "QA / Supervisor";
  auxState: "Available" | "On Call" | "ACW Wrap-Up" | "Break" | "Coaching" | "Offline";
  activeLeadName?: string;
  updatedAt: string;
}

const DEFAULT_QUEUES: InboundACDQueue[] = [
  {
    id: "ACD-1",
    ivrDigit: "1",
    name: "Sales & Senior Closer Desk",
    skillGroup: "Licensed Closers",
    routingStrategy: "Skill Weighted",
    slaTargetPct: 85,
    slaSeconds: 20,
    callsWaiting: 1,
    callsAnswered: 42,
    callsAbandoned: 1,
  },
  {
    id: "ACD-2",
    ivrDigit: "2",
    name: "Customer Support & Order Desk",
    skillGroup: "Tier-1 Support",
    routingStrategy: "Longest Idle",
    slaTargetPct: 80,
    slaSeconds: 30,
    callsWaiting: 0,
    callsAnswered: 64,
    callsAbandoned: 2,
  },
  {
    id: "ACD-3",
    ivrDigit: "3",
    name: "Billing, Retention & Escalations",
    skillGroup: "Retention Specialists",
    routingStrategy: "Round Robin",
    slaTargetPct: 90,
    slaSeconds: 20,
    callsWaiting: 0,
    callsAnswered: 19,
    callsAbandoned: 0,
  },
];

function normalizeDigits(phone: string): string {
  return String(phone || "").replace(/\D/g, "");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id") || searchParams.get("cluster_id");
  const email = (searchParams.get("email") || "").trim().toLowerCase() || undefined;

  if (!rawCompanyId && !email) {
    return NextResponse.json({
      success: true,
      leads: [],
      campaigns: [],
      transfers: [],
      dncList: [],
      qaScorecards: [],
      queues: DEFAULT_QUEUES,
      agents: [],
    });
  }

  const clusterId = resolveSafeClusterId(rawCompanyId, email);
  const access = await verifyClusterAccess(clusterId, email);
  if (!access.allowed) {
    return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
  }

  const [leads, campaigns, transfers, dncList, qaScorecards, queuesRaw, agents, formLeads] =
    await Promise.all([
      readClusterCollection<any[]>(clusterId, "call_center_leads", []),
      readClusterCollection<any[]>(clusterId, "call_center_campaigns", []),
      readClusterCollection<WarmTransferRecord[]>(clusterId, "call_center_transfers", []),
      readClusterCollection<DNCEntry[]>(clusterId, "call_center_dnc", []),
      readClusterCollection<QAScorecardRecord[]>(clusterId, "call_center_qa", []),
      readClusterCollection<InboundACDQueue[] | null>(clusterId, "call_center_queues", null),
      readClusterCollection<AgentPresenceRecord[]>(clusterId, "call_center_agents", []),
      readClusterCollection<any[]>(clusterId, "public_form_leads", []),
    ]);

  const existingIds = new Set((Array.isArray(leads) ? leads : []).map((l) => l.id));
  const mergedLeads = [
    ...(Array.isArray(formLeads) ? formLeads.filter((fl) => !existingIds.has(fl.id)) : []),
    ...(Array.isArray(leads) ? leads : []),
  ];

  const queues = Array.isArray(queuesRaw) && queuesRaw.length > 0 ? queuesRaw : DEFAULT_QUEUES;

  return NextResponse.json(
    {
      success: true,
      clusterId,
      leads: mergedLeads,
      campaigns,
      transfers,
      dncList,
      qaScorecards,
      queues,
      agents,
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

    const action = body.action || "save_leads";

    // 1. Save Leads (+ auto-register DNC dispositions into DNC Shield)
    if (action === "save_leads") {
      const leads = Array.isArray(body.leads) ? body.leads : [];
      await writeClusterCollection(clusterId, "call_center_leads", leads, { ownerEmail: email });

      const dncLeads = leads.filter((l: any) => l.disposition === "DNC" && l.phone && l.phone !== "N/A");
      if (dncLeads.length > 0) {
        const dncList = await readClusterCollection<DNCEntry[]>(clusterId, "call_center_dnc", []);
        const nextDnc = [...dncList];
        for (const dl of dncLeads) {
          const norm = normalizeDigits(dl.phone);
          if (norm && !nextDnc.some((d) => d.normalizedPhone === norm)) {
            nextDnc.unshift({
              id: `DNC-${Date.now().toString().slice(-5)}`,
              phone: dl.phone,
              normalizedPhone: norm,
              reason: "Marked DNC during call disposition",
              source: "Customer Opt-Out",
              addedBy: email || "Agent",
              createdAt: new Date().toISOString(),
            });
          }
        }
        await writeClusterCollection(clusterId, "call_center_dnc", nextDnc, { ownerEmail: email });
      }
      return NextResponse.json({ success: true, clusterId, count: leads.length });
    }

    // 2. Save Campaigns
    if (action === "save_campaigns") {
      const campaigns = Array.isArray(body.campaigns) ? body.campaigns : [];
      await writeClusterCollection(clusterId, "call_center_campaigns", campaigns, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, campaigns });
    }

    // 3. DNC Registry Operations (Add / Remove / Pre-Dial Check)
    if (action === "add_dnc") {
      const rawPhone = String(body.phone || "").trim();
      const norm = normalizeDigits(rawPhone);
      if (!norm) {
        return NextResponse.json({ success: false, error: "Valid phone number required" }, { status: 400 });
      }
      const dncList = await readClusterCollection<DNCEntry[]>(clusterId, "call_center_dnc", []);
      const entry: DNCEntry = {
        id: `DNC-${Date.now().toString().slice(-5)}`,
        phone: rawPhone,
        normalizedPhone: norm,
        reason: String(body.reason || "Do-Not-Call Request").trim(),
        source: body.source || "Customer Opt-Out",
        addedBy: body.addedBy || email || "Compliance Desk",
        createdAt: new Date().toISOString(),
      };
      const next = [entry, ...dncList.filter((d) => d.normalizedPhone !== norm)];
      await writeClusterCollection(clusterId, "call_center_dnc", next, { ownerEmail: email });

      // Also mark any matching lead as DNC
      const leads = await readClusterCollection<any[]>(clusterId, "call_center_leads", []);
      const scrubbedLeads = leads.map((l) =>
        normalizeDigits(l.phone) === norm ? { ...l, disposition: "DNC" } : l
      );
      await writeClusterCollection(clusterId, "call_center_leads", scrubbedLeads, { ownerEmail: email });

      return NextResponse.json({ success: true, clusterId, dncEntry: entry, dncList: next });
    }

    if (action === "remove_dnc") {
      const dncList = await readClusterCollection<DNCEntry[]>(clusterId, "call_center_dnc", []);
      const next = dncList.filter((d) => d.id !== body.id && d.normalizedPhone !== normalizeDigits(body.phone || ""));
      await writeClusterCollection(clusterId, "call_center_dnc", next, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, dncList: next });
    }

    if (action === "check_dnc") {
      const norm = normalizeDigits(body.phone || "");
      const dncList = await readClusterCollection<DNCEntry[]>(clusterId, "call_center_dnc", []);
      const hit = norm ? dncList.find((d) => d.normalizedPhone === norm) : undefined;
      return NextResponse.json({
        success: true,
        dncBlocked: Boolean(hit),
        entry: hit || null,
      });
    }

    // 4. Fronter -> Closer Warm Transfer Handoff
    if (action === "warm_transfer") {
      const transfers = await readClusterCollection<WarmTransferRecord[]>(clusterId, "call_center_transfers", []);
      const leads = await readClusterCollection<any[]>(clusterId, "call_center_leads", []);

      // DNC guard even on transfer
      const dncList = await readClusterCollection<DNCEntry[]>(clusterId, "call_center_dnc", []);
      const norm = normalizeDigits(body.phone || "");
      if (norm && dncList.some((d) => d.normalizedPhone === norm)) {
        return NextResponse.json(
          { success: false, code: "DNC_BLOCKED", error: "Cannot transfer a phone number registered on DNC." },
          { status: 403 }
        );
      }

      const transfer: WarmTransferRecord = {
        id: `XFER-${Date.now().toString().slice(-5)}`,
        leadId: body.leadId || "",
        leadName: String(body.leadName || "Qualified Prospect").trim(),
        phone: String(body.phone || "N/A"),
        company: String(body.company || "—"),
        campaign: String(body.campaign || "Outbound Campaign"),
        fronterAgent: String(body.fronterAgent || email || "Fronter Agent"),
        closerAgent: String(body.closerAgent || "Senior Closer Queue"),
        carrierOrProduct: String(body.carrierOrProduct || "Preferred Plan / Package"),
        estimatedValue: Number(body.estimatedValue || 1200),
        qualificationNotes: String(body.qualificationNotes || "Verified decision-maker & budget ready."),
        status: "Waiting Closer",
        createdAt: new Date().toISOString(),
      };

      const nextTransfers = [transfer, ...transfers];
      await writeClusterCollection(clusterId, "call_center_transfers", nextTransfers, { ownerEmail: email });

      if (body.leadId) {
        const nextLeads = leads.map((l) =>
          l.id === body.leadId ? { ...l, disposition: "Warm Transfer", notes: transfer.qualificationNotes } : l
        );
        await writeClusterCollection(clusterId, "call_center_leads", nextLeads, { ownerEmail: email });
      }

      return NextResponse.json({ success: true, clusterId, transfer, transfers: nextTransfers });
    }

    // 5. Closer Claims / Closes Transfer -> Automatically Creates Confirmed Sales Order in /sales!
    if (action === "close_transfer") {
      const transfers = await readClusterCollection<WarmTransferRecord[]>(clusterId, "call_center_transfers", []);
      const target = transfers.find((t) => t.id === body.transferId);
      if (!target) {
        return NextResponse.json({ success: false, error: "Transfer not found" }, { status: 404 });
      }

      const finalValue = Number(body.dealValue ?? target.estimatedValue ?? 0);
      const seq = Date.now().toString().slice(-5);
      const now = new Date().toISOString();
      const salesOrderName = `SO-BPO-${seq}`;

      const updatedTransfer: WarmTransferRecord = {
        ...target,
        closerAgent: String(body.closerAgent || email || target.closerAgent),
        carrierOrProduct: String(body.carrierOrProduct || target.carrierOrProduct),
        estimatedValue: finalValue,
        status: "Closed Won",
        salesOrderRef: salesOrderName,
        closedAt: now,
      };

      const nextTransfers = transfers.map((t) => (t.id === target.id ? updatedTransfer : t));
      await writeClusterCollection(clusterId, "call_center_transfers", nextTransfers, { ownerEmail: email });

      // Update Lead disposition to Closed Won
      const leads = await readClusterCollection<any[]>(clusterId, "call_center_leads", []);
      if (target.leadId) {
        await writeClusterCollection(
          clusterId,
          "call_center_leads",
          leads.map((l) => (l.id === target.leadId ? { ...l, disposition: "Closed Won" } : l)),
          { ownerEmail: email }
        );
      }

      // Auto-sync Closed Won BPO deal straight into Sales Hub (`sales_orders`) & Accounting!
      const salesOrders = await readClusterCollection<any[]>(clusterId, "sales_orders", []);
      const newSalesOrder = {
        id: `SO-${seq}`,
        name: salesOrderName,
        clusterId,
        industryId: "call_center",
        channel: "Call Center Closer",
        customer_name: updatedTransfer.leadName,
        customer_phone: updatedTransfer.phone,
        pricelistName: "Call Center Closer Plan",
        paymentTerms: "Monthly Draft / Contract",
        state: "invoiced",
        lines: [
          {
            id: "LN-1",
            sku: "BPO-DEAL",
            name: `${updatedTransfer.carrierOrProduct} (${updatedTransfer.campaign})`,
            description: `Fronter: ${updatedTransfer.fronterAgent} → Closer: ${updatedTransfer.closerAgent}`,
            quantity: 1,
            uom: "Contract",
            unitPrice: finalValue,
            subtotal: finalValue,
          },
        ],
        subtotal: finalValue,
        discountTotal: 0,
        taxRate: 0,
        taxAmount: 0,
        amount_total: finalValue,
        amountPaid: finalValue,
        deliveryRef: `BPO/POL/${seq}`,
        invoiceRef: `INV/BPO/${seq}`,
        industryMeta: {
          fronter: updatedTransfer.fronterAgent,
          closer: updatedTransfer.closerAgent,
          carrier: updatedTransfer.carrierOrProduct,
        },
        notes: updatedTransfer.qualificationNotes,
        date_order: now,
        created_at: now,
        updated_at: now,
      };
      await writeClusterCollection(clusterId, "sales_orders", [newSalesOrder, ...salesOrders], {
        ownerEmail: email,
      });

      return NextResponse.json({
        success: true,
        clusterId,
        transfer: updatedTransfer,
        transfers: nextTransfers,
        salesOrder: newSalesOrder,
      });
    }

    // 6. QA Compliance Scorecard Evaluation (0-100%)
    if (action === "submit_qa") {
      const qaList = await readClusterCollection<QAScorecardRecord[]>(clusterId, "call_center_qa", []);
      const disclosurePass = body.complianceDisclosurePass !== false;
      const scores = {
        disclosure: disclosurePass ? Math.min(25, Math.max(0, Number(body.disclosure ?? 25))) : 0,
        verification: Math.min(15, Math.max(0, Number(body.verification ?? 15))),
        scriptAdherence: Math.min(20, Math.max(0, Number(body.scriptAdherence ?? 18))),
        objectionEmpathy: Math.min(20, Math.max(0, Number(body.objectionEmpathy ?? 18))),
        crmHygiene: Math.min(20, Math.max(0, Number(body.crmHygiene ?? 18))),
      };
      const rawSum =
        scores.disclosure +
        scores.verification +
        scores.scriptAdherence +
        scores.objectionEmpathy +
        scores.crmHygiene;
      const totalScore = disclosurePass ? rawSum : 0;
      const outcome: QAScorecardRecord["outcome"] = !disclosurePass
        ? "Compliance Auto-Fail"
        : totalScore >= 80
        ? "Passed"
        : "Coaching Required";

      const record: QAScorecardRecord = {
        id: `QA-${Date.now().toString().slice(-5)}`,
        leadName: String(body.leadName || "Sample Call"),
        agentName: String(body.agentName || "Floor Agent"),
        campaign: String(body.campaign || "Outbound Campaign"),
        reviewer: String(body.reviewer || email || "QA Auditor"),
        complianceDisclosurePass: disclosurePass,
        scores,
        totalScore,
        outcome,
        notes: String(body.notes || ""),
        createdAt: new Date().toISOString(),
      };
      const next = [record, ...qaList];
      await writeClusterCollection(clusterId, "call_center_qa", next, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, scorecard: record, qaScorecards: next });
    }

    // 7. Inbound ACD & IVR Queue Update
    if (action === "save_queues") {
      const queues = Array.isArray(body.queues) ? body.queues : DEFAULT_QUEUES;
      await writeClusterCollection(clusterId, "call_center_queues", queues, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, queues });
    }

    // 8. Agent AUX Presence Update
    if (action === "set_aux") {
      const agents = await readClusterCollection<AgentPresenceRecord[]>(clusterId, "call_center_agents", []);
      const agentEmail = (body.agentEmail || email || "agent@workspace").toLowerCase();
      const entry: AgentPresenceRecord = {
        email: agentEmail,
        name: String(body.agentName || agentEmail.split("@")[0]),
        role: body.role || "Fronter",
        auxState: body.auxState || "Available",
        activeLeadName: body.activeLeadName || "",
        updatedAt: new Date().toISOString(),
      };
      const next = [entry, ...agents.filter((a) => a.email !== agentEmail)];
      await writeClusterCollection(clusterId, "call_center_agents", next, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, agent: entry, agents: next });
    }

    return NextResponse.json({ success: false, error: "Unsupported action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Call Center API error" },
      { status: 400 }
    );
  }
}
