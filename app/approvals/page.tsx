"use client";

import { useEffect, useState } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import { useTheme } from "@/lib/themeContext";
import { triggerNotificationRefresh } from "@/lib/notificationContext";
import { INITIAL_TEAM_MEMBERS } from "@/lib/teamStorage";
import { TeamMember } from "@/lib/teamTypes";
import { getSubordinateIds, getSuperiorChain } from "@/lib/hierarchyUtils";
import { CheckCircle2, XCircle, Clock, Send, GitBranch, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

interface ApprovalItem {
  id: string;
  companyId: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  approverId: string | null;
  approverName: string;
  approverEmail: string;
  module: "leave" | "expense" | "purchase" | "sales_discount";
  title: string;
  description?: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  reviewerNotes?: string;
  createdAt: string;
  decidedAt?: string | null;
}

export default function ApprovalsInboxPage() {
  const { activeBranch, getEntityStorageKey, currencySymbol } = useBranchContext();
  const { isLight } = useTheme();
  const companyId = activeBranch?.id || "CMP-001";

  const [members, setMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<string>("USR-001");
  const [viewTab, setViewTab] = useState<"inbox" | "mine" | "team">("inbox");

  // Submit new request form
  const [reqModule, setReqModule] = useState<"leave" | "expense" | "purchase" | "sales_discount">("expense");
  const [reqTitle, setReqTitle] = useState("");
  const [reqAmount, setReqAmount] = useState("");
  const [reqDesc, setReqDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cachedMembers = localStorage.getItem(getEntityStorageKey("team_members"));
      if (cachedMembers) {
        const parsed = JSON.parse(cachedMembers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
          setActiveMemberId(parsed[0].id);
        }
      }
      const cachedApprovals = localStorage.getItem(getEntityStorageKey("approvals"));
      if (cachedApprovals) {
        const parsed = JSON.parse(cachedApprovals);
        if (Array.isArray(parsed)) setApprovals(parsed);
      }
    } catch {}

    fetch(`/api/team/members?company_id=${encodeURIComponent(companyId)}&limit=200`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.allMembers) && d.allMembers.length > 0) setMembers(d.allMembers);
      })
      .catch(() => {});

    fetch(`/api/approvals?company_id=${encodeURIComponent(companyId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.approvals)) setApprovals(d.approvals);
      })
      .catch(() => {});
  }, [companyId]);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];
  const superiorChain = activeMember ? getSuperiorChain(activeMember.id, members) : [];
  const directSuperior = superiorChain[0] || null;
  const subordinateIds = activeMember ? getSubordinateIds(activeMember.id, members) : new Set<string>();

  const inboxItems = approvals.filter((a) => {
    if (!activeMember) return true;
    if (activeMember.role === "Owner" || activeMember.role === "Admin") return true;
    return a.approverId === activeMember.id || subordinateIds.has(a.requesterId);
  });

  const myItems = approvals.filter((a) => activeMember && a.requesterId === activeMember.id);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !activeMember) return;
    setSubmitting(true);
    try {
      const payload = {
        companyId,
        requesterId: activeMember.id,
        requesterName: activeMember.name,
        requesterEmail: activeMember.email,
        approverId: directSuperior?.id || null,
        approverName: directSuperior?.name || "Workspace Owner",
        approverEmail: directSuperior?.email || "",
        module: reqModule,
        title: reqTitle.trim(),
        description: reqDesc.trim(),
        amount: Number(reqAmount || 0),
      };
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      const created: ApprovalItem = data?.approval || {
        id: `APR-${Date.now()}`,
        ...payload,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      const next = [created, ...approvals];
      setApprovals(next);
      try {
        localStorage.setItem(getEntityStorageKey("approvals"), JSON.stringify(next));
      } catch {}
      setReqTitle("");
      setReqAmount("");
      setReqDesc("");
      setBannerMsg(`Submitted to ${directSuperior ? `${directSuperior.name} (${directSuperior.role})` : "Top Level"}!`);
      triggerNotificationRefresh();
      setTimeout(() => setBannerMsg(null), 3500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (id: string, status: "approved" | "rejected") => {
    const next = approvals.map((a) =>
      a.id === id ? { ...a, status, decidedAt: new Date().toISOString() } : a
    );
    setApprovals(next);
    try {
      localStorage.setItem(getEntityStorageKey("approvals"), JSON.stringify(next));
    } catch {}
    await fetch("/api/approvals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, id, status }),
    }).catch(() => {});
    triggerNotificationRefresh();
  };

  const displayedList = viewTab === "mine" ? myItems : inboxItems;

  return (
    <div className={`min-h-screen flex flex-col ${isLight ? "bg-[#F6F7FB] text-slate-900" : "bg-[#020205] text-white"}`}>
      <StandardModuleHeader
        moduleName="Approvals"
        moduleIcon={<ShieldCheck size={20} />}
        menuItems={[
          { name: "Approvals Inbox", href: "/approvals" },
          { name: "Team & Hierarchy", href: "/team" },
          { name: "Dashboard", href: "/dashboard" },
        ]}
        searchPlaceholder="Search approvals..."
      />

      <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Acting Member / Hierarchy Perspective Switcher */}
        <div className="beraxis-bento-card p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className={`text-xl font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <GitBranch className="text-purple-500" size={20} />
              Subordinate-to-Superior Reporting &amp; Approvals
            </h1>
            <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>
              Requests automatically route upward along each employee&apos;s <code className="font-mono">reportsToId</code> chain in {activeBranch?.name || "your company"}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-gray-400"}`}>Viewing as:</span>
            <select
              value={activeMemberId}
              onChange={(e) => setActiveMemberId(e.target.value)}
              className={`rounded-xl px-3 py-2 text-xs font-bold border cursor-pointer ${
                isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0F172A] border-gray-700 text-white"
              }`}
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role} · {m.department})
                </option>
              ))}
            </select>
            <Link
              href="/team"
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1"
            >
              <Users size={13} /> Org Tree
            </Link>
          </div>
        </div>

        {/* Reporting Chain + Subordinate Count */}
        {activeMember && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="beraxis-bento-card p-4">
              <div className={`text-[10px] font-bold uppercase ${isLight ? "text-slate-500" : "text-gray-400"}`}>Reports To (Direct Superior)</div>
              <div className={`text-sm font-extrabold mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                {directSuperior ? `${directSuperior.name} (${directSuperior.role})` : "Top Level (Company Owner / CEO)"}
              </div>
            </div>
            <div className="beraxis-bento-card p-4">
              <div className={`text-[10px] font-bold uppercase ${isLight ? "text-slate-500" : "text-gray-400"}`}>Subordinates Under You</div>
              <div className="text-sm font-extrabold mt-1 text-cyan-500">
                {subordinateIds.size} Direct &amp; Indirect Reports
              </div>
            </div>
            <div className="beraxis-bento-card p-4">
              <div className={`text-[10px] font-bold uppercase ${isLight ? "text-slate-500" : "text-gray-400"}`}>Pending Reviews</div>
              <div className="text-sm font-extrabold mt-1 text-amber-500">
                {inboxItems.filter((a) => a.status === "pending").length} Pending Requests
              </div>
            </div>
          </div>
        )}

        {bannerMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold">
            ✓ {bannerMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Submit Request Upward */}
          <form onSubmit={handleSubmitRequest} className="lg:col-span-5 beraxis-bento-card p-5 space-y-4 h-fit">
            <h2 className={`text-sm font-extrabold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <Send size={15} className="text-purple-500" />
              Submit Request to Superior
            </h2>
            <div>
              <label className={`block text-xs font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Request Type</label>
              <select
                value={reqModule}
                onChange={(e) => setReqModule(e.target.value as any)}
                className={`w-full rounded-xl px-3 py-2.5 text-xs font-semibold border ${isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0F172A] border-gray-700 text-white"}`}
              >
                <option value="expense">Expense Reimbursement</option>
                <option value="leave">Leave / Time Off</option>
                <option value="purchase">Purchase Order Approval</option>
                <option value="sales_discount">Sales Quote Discount Override</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Title *</label>
              <input
                type="text"
                required
                value={reqTitle}
                onChange={(e) => setReqTitle(e.target.value)}
                placeholder="e.g. Client travel expense or 3-day annual leave"
                className={`w-full rounded-xl px-3 py-2.5 text-xs border ${isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0F172A] border-gray-700 text-white"}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Amount ({currencySymbol.trim() || "USD"})</label>
              <input
                type="number"
                value={reqAmount}
                onChange={(e) => setReqAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full rounded-xl px-3 py-2.5 text-xs border ${isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0F172A] border-gray-700 text-white"}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Notes</label>
              <textarea
                rows={3}
                value={reqDesc}
                onChange={(e) => setReqDesc(e.target.value)}
                placeholder="Justification or details for your manager..."
                className={`w-full rounded-xl p-3 text-xs border ${isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#0F172A] border-gray-700 text-white"}`}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-extrabold shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Routing..." : `Route to ${directSuperior ? directSuperior.name : "Owner"}`}
            </button>
          </form>

          {/* Right: Approval Inbox */}
          <div className="lg:col-span-7 beraxis-bento-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setViewTab("inbox")}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer ${viewTab === "inbox" ? "bg-purple-600 text-white" : isLight ? "text-slate-600 hover:bg-slate-100" : "text-gray-400 hover:bg-white/5"}`}
                >
                  Team Approvals ({inboxItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab("mine")}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer ${viewTab === "mine" ? "bg-purple-600 text-white" : isLight ? "text-slate-600 hover:bg-slate-100" : "text-gray-400 hover:bg-white/5"}`}
                >
                  My Submissions ({myItems.length})
                </button>
              </div>
            </div>

            {displayedList.length === 0 ? (
              <div className={`py-12 text-center text-xs ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                No approval requests yet. Submit one on the left to test subordinate-to-superior routing.
              </div>
            ) : (
              <div className="space-y-3">
                {displayedList.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-[#060B19]/75 border-white/10"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          {item.module.replace("_", " ")}
                        </span>
                        <span className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{item.title}</span>
                      </div>
                      <div className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                        From <strong>{item.requesterName}</strong> → Approver: <strong>{item.approverName || "Owner"}</strong>
                        {item.amount > 0 && ` · ${currencySymbol}${item.amount.toLocaleString()}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDecision(item.id, "approved")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecision(item.id, "rejected")}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase flex items-center gap-1 ${
                          item.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}>
                          {item.status === "approved" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
