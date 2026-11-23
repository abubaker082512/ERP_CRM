import { NextRequest, NextResponse } from "next/server";
import { isGmailConfigured, sendBeraxisEmail, BERAXIS_SENDER_EMAIL } from "@/lib/gmailMailer";

export const dynamic = "force-dynamic";

export interface ApprovalRequest {
  id: string;
  companyId: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  approverId: string | null;
  approverName: string;
  approverEmail: string;
  module: "leave" | "expense" | "purchase" | "sales_discount";
  referenceId?: string;
  title: string;
  description?: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  reviewerNotes?: string;
  createdAt: string;
  decidedAt?: string | null;
}

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hgmdredpqwuooxbbsejw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbWRyZWRwcXd1b294YmJzZWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA4MDIxNywiZXhwIjoyMTA1NjU2MjE3fQ.jZCH75eRrhrQ2A_8Avu-MGwQwctohyF-ocioBAh3oXU";

const sbHeaders = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

const fallbackApprovals = new Map<string, ApprovalRequest[]>();

function mapDbApproval(r: any): ApprovalRequest {
  return {
    id: r.id,
    companyId: r.company_id,
    requesterId: r.requester_id,
    requesterName: r.requester_name,
    requesterEmail: r.requester_email,
    approverId: r.approver_id,
    approverName: r.approver_name || "",
    approverEmail: r.approver_email || "",
    module: r.module,
    referenceId: r.reference_id || "",
    title: r.title,
    description: r.description || "",
    amount: Number(r.amount || 0),
    status: r.status || "pending",
    reviewerNotes: r.reviewer_notes || "",
    createdAt: r.created_at,
    decidedAt: r.decided_at || null,
  };
}

async function loadApprovals(companyId: string): Promise<ApprovalRequest[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/approval_requests?company_id=eq.${encodeURIComponent(companyId)}&order=created_at.desc`,
      { headers: sbHeaders, cache: "no-store" }
    );
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows)) {
        const mapped = rows.map(mapDbApproval);
        fallbackApprovals.set(companyId, mapped);
        return mapped;
      }
    }
  } catch {}
  return fallbackApprovals.get(companyId) || [];
}

async function saveApprovalToDb(item: ApprovalRequest): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/approval_requests`, {
      method: "POST",
      headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        id: item.id,
        company_id: item.companyId,
        requester_id: item.requesterId,
        requester_name: item.requesterName,
        requester_email: item.requesterEmail,
        approver_id: item.approverId,
        approver_name: item.approverName,
        approver_email: item.approverEmail,
        module: item.module,
        reference_id: item.referenceId || "",
        title: item.title,
        description: item.description || "",
        amount: item.amount || 0,
        status: item.status,
        reviewer_notes: item.reviewerNotes || "",
        created_at: item.createdAt,
        decided_at: item.decidedAt || null,
      }),
    });
  } catch {}
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("company_id") || "CMP-001";
  const approvals = await loadApprovals(companyId);
  return NextResponse.json({ success: true, approvals });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const companyId = body.companyId || body.company_id || "CMP-001";
    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json({ success: false, error: "Request title is required" }, { status: 400 });
    }

    const item: ApprovalRequest = {
      id: `APR-${Date.now()}`,
      companyId,
      requesterId: body.requesterId || "USR-001",
      requesterName: body.requesterName || "Team Member",
      requesterEmail: body.requesterEmail || "",
      approverId: body.approverId || null,
      approverName: body.approverName || "Direct Superior",
      approverEmail: body.approverEmail || "",
      module: body.module || "expense",
      referenceId: body.referenceId || "",
      title,
      description: body.description || "",
      amount: Number(body.amount || 0),
      status: "pending",
      createdAt: new Date().toISOString(),
      decidedAt: null,
    };

    const list = await loadApprovals(companyId);
    fallbackApprovals.set(companyId, [item, ...list]);
    await saveApprovalToDb(item);

    // Notify Superior via beraxisai@gmail.com if approverEmail is set
    if (item.approverEmail && item.approverEmail.includes("@") && isGmailConfigured()) {
      await sendBeraxisEmail({
        to: item.approverEmail,
        subject: `[BERAXIS Approval Needed] ${item.title} from ${item.requesterName}`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#070B19;color:#F8FAFC;padding:24px;border-radius:16px;max-width:560px;margin:0 auto;border:1px solid #1E293B;">
            <div style="font-size:16px;font-weight:800;color:#A855F7;margin-bottom:10px;">BERAXIS APPROVALS</div>
            <h2 style="margin:0 0 10px;color:#FFFFFF;">New ${item.module.replace("_", " ").toUpperCase()} Request</h2>
            <p style="font-size:14px;color:#CBD5E1;line-height:1.6;">
              <strong>${item.requesterName}</strong> (${item.requesterEmail}) submitted a request requiring your review:
            </p>
            <div style="background:#0F172A;border:1px solid #1E293B;border-radius:12px;padding:14px;margin:14px 0;font-size:13px;">
              <div><strong>Title:</strong> ${item.title}</div>
              ${item.amount ? `<div><strong>Amount:</strong> ${item.amount.toLocaleString()}</div>` : ""}
              ${item.description ? `<div style="margin-top:6px;color:#94A3B8;">${item.description}</div>` : ""}
            </div>
            <a href="https://www.beraxis.online/approvals" style="display:inline-block;padding:10px 18px;background:#8B5CF6;color:#FFFFFF;font-weight:700;border-radius:10px;text-decoration:none;font-size:13px;">Review in Approvals Inbox →</a>
            <p style="margin-top:16px;font-size:11px;color:#64748B;">Sent by ${BERAXIS_SENDER_EMAIL}</p>
          </div>
        `,
        text: `New ${item.module} approval request "${item.title}" from ${item.requesterName}. Review at https://www.beraxis.online/approvals`,
      });
    }

    return NextResponse.json({ success: true, approval: item });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to create approval" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const companyId = body.companyId || body.company_id || "CMP-001";
    const { id, status, reviewerNotes } = body;

    const list = await loadApprovals(companyId);
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Approval request not found" }, { status: 404 });
    }

    const updated: ApprovalRequest = {
      ...list[idx],
      status: status === "approved" || status === "rejected" ? status : list[idx].status,
      reviewerNotes: reviewerNotes !== undefined ? reviewerNotes : list[idx].reviewerNotes,
      decidedAt: new Date().toISOString(),
    };

    const next = [...list];
    next[idx] = updated;
    fallbackApprovals.set(companyId, next);
    await saveApprovalToDb(updated);

    return NextResponse.json({ success: true, approval: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to update approval" }, { status: 500 });
  }
}
