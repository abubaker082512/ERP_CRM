"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  PhoneCall,
  Upload,
  FileSpreadsheet,
  Download,
  Lock,
  ShieldCheck,
  Users,
  Search,
  Clock,
  CheckCircle2,
  X,
  Plus,
  MessageSquare,
  Trophy,
  BookOpen,
  ClipboardList,
  RefreshCw,
  PhoneOff,
  Calendar,
  ExternalLink,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

export type LeadDisposition =
  | "New"
  | "Ringing"
  | "Callback"
  | "Qualified"
  | "Closed Won"
  | "DNC";

export interface CallCenterLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  campaign: string;
  source: string;
  disposition: LeadDisposition;
  assignedTo: string; // email or "Unassigned"
  callbackAt?: string;
  notes: string;
  callsCount: number;
  lastCalledAt?: string;
  createdAt: string;
}

interface TeamUserOption {
  email: string;
  name: string;
  role: string;
}

const DEFAULT_SCRIPT = `Hi [Lead Name], this is [Agent Name] calling from Beraxis Partner Desk.
I noticed your inquiry about streamlining your team's operations.
1. Ask: "How many team members are currently handling your sales or support calls?"
2. Pitch: "We help call centers consolidate lead sheets, CRM, public intake forms, and team hierarchy into one fast workspace."
3. Close: "Would tomorrow at 2:00 PM work for a quick 10-minute live walkthrough?"`;

const REBUTTALS = [
  { title: "Too Busy Right Now", reply: "Totally understand — I can send a 2-minute interactive link or call back at a better time today. Morning or afternoon?" },
  { title: "Already Using Excel / Sheets", reply: "That's why teams love Beraxis — you can sync your existing Google Sheets/Excel lead lists in 1 click while keeping agent access restricted." },
  { title: "Need Approval From Manager", reply: "No problem! I'll email a summary you can forward to your manager, and we also offer 1-click company onboarding." },
];

const SAMPLE_LEADS: CallCenterLead[] = [
  {
    id: "CC-1001",
    name: "Tariq Mahmood",
    phone: "+1-555-0142",
    email: "tariq@apexfreight.io",
    company: "Apex Freight",
    campaign: "Q4 Outbound SaaS",
    source: "Google Sheets",
    disposition: "New",
    assignedTo: "Unassigned",
    notes: "Requested 25-seat team pricing.",
    callsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "CC-1002",
    name: "Elena Rostova",
    phone: "+44-20-7946-0192",
    email: "elena@novacommerce.co.uk",
    company: "Nova Commerce",
    campaign: "Inbound Web Form",
    source: "Public Form",
    disposition: "Callback",
    assignedTo: "Unassigned",
    callbackAt: new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16),
    notes: "Interested in multi-company CRM + Forms.",
    callsCount: 2,
    lastCalledAt: new Date(Date.now() - 7200 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
  },
  {
    id: "CC-1003",
    name: "Marcus Vance",
    phone: "+1-555-0188",
    email: "mvance@summitbpo.com",
    company: "Summit BPO",
    campaign: "Enterprise BPO",
    source: "Excel Import",
    disposition: "Qualified",
    assignedTo: "Unassigned",
    notes: "50-agent call center migrating from spreadsheets.",
    callsCount: 3,
    lastCalledAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 172800 * 1000).toISOString(),
  },
];

export default function CallCenterPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const companyId = activeBranch?.id || "CMP-001";

  const [leads, setLeads] = useState<CallCenterLead[]>([]);
  const [teamUsers, setTeamUsers] = useState<TeamUserOption[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("Owner");

  // Restricted Access Controls
  const [restrictAccess, setRestrictAccess] = useState(false);
  const [agentOnlyAssigned, setAgentOnlyAssigned] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);

  // UI Tabs & Filters
  const [activeTab, setActiveTab] = useState<"sheet" | "callbacks" | "leaderboard" | "access">("sheet");
  const [searchQuery, setSearchQuery] = useState("");
  const [dispositionFilter, setDispositionFilter] = useState<string>("All");
  const [campaignFilter, setCampaignFilter] = useState<string>("All");

  // Google Sheets Sync Modal
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [syncingSheet, setSyncingSheet] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Lead Modal
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", phone: "", email: "", company: "", campaign: "Outbound Campaign" });

  // Live Dialer & Call Script Drawer
  const [activeCallLead, setActiveCallLead] = useState<CallCenterLead | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [callOutcome, setCallOutcome] = useState<LeadDisposition>("Qualified");
  const [callNotes, setCallNotes] = useState("");
  const [callCallbackAt, setCallCallbackAt] = useState("");
  const [scriptText, setScriptText] = useState(DEFAULT_SCRIPT);
  const [showScriptPanel, setShowScriptPanel] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Load current user, leads, access settings, and team members
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        setCurrentUserEmail((u.email || "").toLowerCase());
        setCurrentUserRole(u.role || "Owner");
      }
    } catch {}
  }, []);

  useEffect(() => {
    const leadsKey = getEntityStorageKey("call_center_leads");
    const accessKey = getEntityStorageKey("call_center_access");
    const scriptKey = getEntityStorageKey("call_center_script");
    try {
      const savedLeads = localStorage.getItem(leadsKey);
      let baseLeads: CallCenterLead[] = savedLeads ? JSON.parse(savedLeads) : SAMPLE_LEADS;

      // Also merge any leads submitted via Public Forms (/api/public-forms)
      fetch(`/api/public-forms?company_id=${encodeURIComponent(companyId)}&include_leads=1`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const formLeads: CallCenterLead[] = Array.isArray(data?.leads) ? data.leads : [];
          if (formLeads.length > 0) {
            const existingIds = new Set(baseLeads.map((l) => l.id));
            const merged = [...formLeads.filter((fl) => !existingIds.has(fl.id)), ...baseLeads];
            setLeads(merged);
            localStorage.setItem(leadsKey, JSON.stringify(merged));
          } else {
            setLeads(baseLeads);
          }
        })
        .catch(() => setLeads(baseLeads));

      const savedAccess = localStorage.getItem(accessKey);
      if (savedAccess) {
        const parsed = JSON.parse(savedAccess);
        setRestrictAccess(Boolean(parsed.restrictAccess));
        setAgentOnlyAssigned(Boolean(parsed.agentOnlyAssigned));
        if (Array.isArray(parsed.allowedEmails)) setAllowedEmails(parsed.allowedEmails);
      }
      const savedScript = localStorage.getItem(scriptKey);
      if (savedScript) setScriptText(savedScript);
    } catch {
      setLeads(SAMPLE_LEADS);
    }

    fetch(`/api/team/members?company_id=${encodeURIComponent(companyId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.members)) {
          setTeamUsers(
            data.members.map((m: any) => ({
              email: (m.email || "").toLowerCase(),
              name: m.name || m.email,
              role: m.role || "Agent",
            }))
          );
        }
      })
      .catch(() => {});
  }, [companyId, getEntityStorageKey]);

  const persistLeads = (next: CallCenterLead[]) => {
    setLeads(next);
    try {
      localStorage.setItem(getEntityStorageKey("call_center_leads"), JSON.stringify(next));
    } catch {}
  };

  const persistAccess = (r: boolean, a: boolean, emails: string[]) => {
    setRestrictAccess(r);
    setAgentOnlyAssigned(a);
    setAllowedEmails(emails);
    try {
      localStorage.setItem(
        getEntityStorageKey("call_center_access"),
        JSON.stringify({ restrictAccess: r, agentOnlyAssigned: a, allowedEmails: emails })
      );
    } catch {}
    showToast("Access control policy saved.");
  };

  // Call Timer Tick
  useEffect(() => {
    if (!activeCallLead) return;
    const iv = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [activeCallLead]);

  const isManagerOrOwner =
    !currentUserRole ||
    ["owner", "admin", "super admin", "director", "manager", "supervisor"].some((k) =>
      currentUserRole.toLowerCase().includes(k)
    );

  const hasSheetAccess =
    !restrictAccess ||
    isManagerOrOwner ||
    !currentUserEmail ||
    allowedEmails.includes(currentUserEmail);

  const visibleLeads = useMemo(() => {
    return leads.filter((l) => {
      if (agentOnlyAssigned && !isManagerOrOwner && currentUserEmail) {
        if ((l.assignedTo || "").toLowerCase() !== currentUserEmail) return false;
      }
      if (dispositionFilter !== "All" && l.disposition !== dispositionFilter) return false;
      if (campaignFilter !== "All" && l.campaign !== campaignFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hit =
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [leads, agentOnlyAssigned, isManagerOrOwner, currentUserEmail, dispositionFilter, campaignFilter, searchQuery]);

  const callbacksDue = useMemo(
    () => leads.filter((l) => l.disposition === "Callback").sort((a, b) => (a.callbackAt || "").localeCompare(b.callbackAt || "")),
    [leads]
  );

  const campaigns = useMemo(() => ["All", ...Array.from(new Set(leads.map((l) => l.campaign).filter(Boolean)))], [leads]);

  const leaderboard = useMemo(() => {
    const map = new Map<string, { agent: string; calls: number; qualified: number; won: number }>();
    for (const l of leads) {
      const key = l.assignedTo && l.assignedTo !== "Unassigned" ? l.assignedTo : "Unassigned Pool";
      const cur = map.get(key) || { agent: key, calls: 0, qualified: 0, won: 0 };
      cur.calls += l.callsCount || 0;
      if (l.disposition === "Qualified") cur.qualified += 1;
      if (l.disposition === "Closed Won") cur.won += 1;
      map.set(key, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.qualified + b.won - (a.qualified + a.won) || b.calls - a.calls);
  }, [leads]);

  // Parse Workbook / CSV rows into CallCenterLead[]
  const ingestRows = (rows: any[], sourceLabel: string) => {
    const imported: CallCenterLead[] = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const norm: Record<string, string> = {};
      for (const [k, v] of Object.entries(r || {})) {
        norm[k.toLowerCase().trim()] = String(v ?? "").trim();
      }
      const name = norm["name"] || norm["full name"] || norm["lead name"] || norm["contact"] || "";
      const phone = norm["phone"] || norm["mobile"] || norm["whatsapp"] || norm["tel"] || "";
      const email = norm["email"] || norm["e-mail"] || "";
      const company = norm["company"] || norm["organization"] || norm["business"] || "";
      const campaign = norm["campaign"] || norm["list"] || "Imported Sheet";
      const notes = norm["notes"] || norm["comment"] || "";
      if (!name && !phone && !email) continue;
      imported.push({
        id: `CC-${Date.now().toString().slice(-5)}-${i}`,
        name: name || phone || email,
        phone: phone || "N/A",
        email: email || "",
        company: company || "—",
        campaign,
        source: sourceLabel,
        disposition: "New",
        assignedTo: "Unassigned",
        notes,
        callsCount: 0,
        createdAt: new Date().toISOString(),
      });
    }
    if (imported.length === 0) {
      showToast("No valid lead rows found (expected Name, Phone, or Email columns).");
      return;
    }
    persistLeads([...imported, ...leads]);
    showToast(`Imported ${imported.length} leads from ${sourceLabel}!`);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);
        ingestRows(json, file.name.endsWith(".csv") ? "CSV Import" : "Excel Import");
      } catch {
        showToast("Could not parse Excel/CSV file.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleGoogleSheetSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setSheetError(null);
    setSyncingSheet(true);
    try {
      const res = await fetch("/api/call-center/sheet-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: googleSheetUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSheetError(data.error || "Failed to sync Google Sheet.");
      } else {
        const wb = XLSX.read(data.csvText, { type: "string" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);
        ingestRows(json, "Google Sheets");
        setIsSheetModalOpen(false);
        setGoogleSheetUrl("");
      }
    } catch (err: any) {
      setSheetError(err?.message || "Network error");
    } finally {
      setSyncingSheet(false);
    }
  };

  const handleExportCsv = () => {
    const ws = XLSX.utils.json_to_sheet(
      visibleLeads.map((l) => ({
        ID: l.id,
        Name: l.name,
        Phone: l.phone,
        Email: l.email,
        Company: l.company,
        Campaign: l.campaign,
        Source: l.source,
        Disposition: l.disposition,
        AssignedTo: l.assignedTo,
        Calls: l.callsCount,
        Notes: l.notes,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CallCenterLeads");
    XLSX.writeFile(wb, `beraxis_call_center_leads_${companyId}.csv`);
  };

  const startCall = (lead: CallCenterLead) => {
    setActiveCallLead(lead);
    setCallSeconds(0);
    setCallOutcome(lead.disposition === "New" ? "Qualified" : lead.disposition);
    setCallNotes(lead.notes || "");
    setCallCallbackAt(lead.callbackAt || "");
  };

  const completeCallLog = () => {
    if (!activeCallLead) return;
    const updated = leads.map((l) =>
      l.id === activeCallLead.id
        ? {
            ...l,
            disposition: callOutcome,
            notes: callNotes,
            callbackAt: callOutcome === "Callback" ? callCallbackAt : l.callbackAt,
            callsCount: (l.callsCount || 0) + 1,
            lastCalledAt: new Date().toISOString(),
          }
        : l
    );
    persistLeads(updated);
    showToast(`Logged ${callOutcome} (${Math.floor(callSeconds / 60)}m ${callSeconds % 60}s) for ${activeCallLead.name}`);
    setActiveCallLead(null);
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name.trim()) return;
    const item: CallCenterLead = {
      id: `CC-${Date.now().toString().slice(-5)}`,
      name: newLead.name.trim(),
      phone: newLead.phone.trim() || "N/A",
      email: newLead.email.trim(),
      company: newLead.company.trim() || "—",
      campaign: newLead.campaign.trim() || "Outbound Campaign",
      source: "Manual Entry",
      disposition: "New",
      assignedTo: currentUserEmail || "Unassigned",
      notes: "",
      callsCount: 0,
      createdAt: new Date().toISOString(),
    };
    persistLeads([item, ...leads]);
    setNewLead({ name: "", phone: "", email: "", company: "", campaign: "Outbound Campaign" });
    setIsAddLeadOpen(false);
    showToast(`Added ${item.name} to Call Center Lead Sheet.`);
  };

  if (!hasSheetAccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="beraxis-glass-hero max-w-md w-full p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-black text-white">Restricted Lead Sheet Access</h2>
          <p className="text-xs text-gray-300 leading-relaxed">
            Your workspace administrator has restricted the Call Center Lead Sheet to authorized agents only. Ask your manager to add <span className="text-cyan-300 font-mono">{currentUserEmail || "your account"}</span> to the allowed list.
          </p>
          <Link href="/apps" className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">
            ← Back to Apps Cockpit
          </Link>
        </div>
      </div>
    );
  }

  const totalCalls = leads.reduce((s, l) => s + (l.callsCount || 0), 0);
  const qualifiedCount = leads.filter((l) => l.disposition === "Qualified" || l.disposition === "Closed Won").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 text-white">
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600/90 backdrop-blur-md border border-emerald-400/40 text-xs font-bold text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="beraxis-glass-hero p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300 mb-1">
            <PhoneCall size={14} /> Call Center &amp; BPO Command Center · {activeBranch?.name || "Workspace"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Lead Sheet, Dialer &amp; Access Control</h1>
          <p className="text-xs text-gray-300 mt-1">
            Sync Google Sheets or Excel lead lists, restrict access to selected agents, log live calls, and capture public form leads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelUpload} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Upload size={14} className="text-emerald-400" /> Import Excel / CSV
          </button>
          <button
            type="button"
            onClick={() => setIsSheetModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet size={14} /> Sync Google Sheet
          </button>
          <button
            type="button"
            onClick={() => setShowScriptPanel(!showScriptPanel)}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen size={14} /> Call Script
          </button>
          <Link
            href="/forms"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
          >
            <ClipboardList size={14} /> Public Forms
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="beraxis-glass-dock p-4">
          <div className="text-[11px] uppercase font-bold text-gray-400">Total Leads in Sheet</div>
          <div className="text-2xl font-black text-white mt-1">{leads.length}</div>
          <div className="text-[11px] text-cyan-300 mt-1">{restrictAccess ? `Restricted (${allowedEmails.length} agents)` : "All team members"}</div>
        </div>
        <div className="beraxis-glass-dock p-4">
          <div className="text-[11px] uppercase font-bold text-gray-400">Calls Logged</div>
          <div className="text-2xl font-black text-purple-300 mt-1">{totalCalls}</div>
          <div className="text-[11px] text-gray-400 mt-1">Click-to-Call + Timer</div>
        </div>
        <div className="beraxis-glass-dock p-4">
          <div className="text-[11px] uppercase font-bold text-gray-400">Qualified / Won</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{qualifiedCount}</div>
          <div className="text-[11px] text-gray-400 mt-1">
            {leads.length > 0 ? Math.round((qualifiedCount / leads.length) * 100) : 0}% conversion rate
          </div>
        </div>
        <div className="beraxis-glass-dock p-4">
          <div className="text-[11px] uppercase font-bold text-gray-400">Callbacks Due</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{callbacksDue.length}</div>
          <div className="text-[11px] text-gray-400 mt-1">Scheduled follow-ups</div>
        </div>
      </div>

      {/* Optional Editable Call Script Drawer */}
      {showScriptPanel && (
        <div className="beraxis-glass-dock p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles size={13} /> Live Agent Call Script
              </span>
              <button
                type="button"
                onClick={() => {
                  try { localStorage.setItem(getEntityStorageKey("call_center_script"), scriptText); } catch {}
                  showToast("Call script saved for team.");
                }}
                className="px-3 py-1 rounded-lg bg-purple-600 text-[11px] font-bold cursor-pointer"
              >
                Save Script
              </button>
            </div>
            <textarea
              rows={6}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              className="w-full rounded-xl bg-black/30 border border-white/15 p-3 text-xs text-gray-200 outline-none focus:border-purple-400"
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">Quick Objection Rebuttals</span>
            <div className="space-y-2">
              {REBUTTALS.map((rb) => (
                <div key={rb.title} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-xs font-bold text-white">{rb.title}</div>
                  <div className="text-[11px] text-gray-300 mt-0.5">{rb.reply}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10 gap-1">
          {[
            { id: "sheet", label: "Lead Sheet", icon: FileSpreadsheet },
            { id: "callbacks", label: `Callbacks (${callbacksDue.length})`, icon: Clock },
            { id: "leaderboard", label: "Agent Leaderboard", icon: Trophy },
            ...(isManagerOrOwner ? [{ id: "access", label: "Restricted Access", icon: ShieldCheck }] : []),
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === t.id ? "beraxis-glow-pill" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddLeadOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Add Lead
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* TAB 1: LEAD SHEET */}
      {activeTab === "sheet" && (
        <div className="beraxis-glass-dock p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/15">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by name, phone, email, or company..."
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder-gray-400"
              />
            </div>
            <select
              value={dispositionFilter}
              onChange={(e) => setDispositionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0B1022] border border-white/15 text-xs text-white outline-none"
            >
              {["All", "New", "Ringing", "Callback", "Qualified", "Closed Won", "DNC"].map((d) => (
                <option key={d} value={d}>{d === "All" ? "All Dispositions" : d}</option>
              ))}
            </select>
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0B1022] border border-white/15 text-xs text-white outline-none"
            >
              {campaigns.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All Campaigns" : c}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                  <th className="py-3 px-3">Lead / Company</th>
                  <th className="py-3 px-3">Phone &amp; Email</th>
                  <th className="py-3 px-3">Campaign / Source</th>
                  <th className="py-3 px-3">Assigned Agent</th>
                  <th className="py-3 px-3">Disposition</th>
                  <th className="py-3 px-3 text-right">Dialer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visibleLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.03]">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{l.name}</div>
                      <div className="text-[11px] text-gray-400">{l.company}</div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div className="text-cyan-300">{l.phone}</div>
                      <div className="text-[11px] text-gray-400">{l.email || "—"}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-gray-200">{l.campaign}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">{l.source}</span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={l.assignedTo}
                        onChange={(e) =>
                          persistLeads(leads.map((x) => (x.id === l.id ? { ...x, assignedTo: e.target.value } : x)))
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-[#0B1022] border border-white/15 text-[11px] text-white outline-none"
                      >
                        <option value="Unassigned">Unassigned</option>
                        {teamUsers.map((u) => (
                          <option key={u.email} value={u.email}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={l.disposition}
                        onChange={(e) =>
                          persistLeads(
                            leads.map((x) => (x.id === l.id ? { ...x, disposition: e.target.value as LeadDisposition } : x))
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-[#0B1022] border border-white/15 text-[11px] font-bold text-white outline-none"
                      >
                        {["New", "Ringing", "Callback", "Qualified", "Closed Won", "DNC"].map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startCall(l)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <PhoneCall size={12} /> Call ({l.callsCount})
                        </button>
                        {l.phone !== "N/A" && (
                          <a
                            href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-emerald-300"
                            title="Open WhatsApp"
                          >
                            <MessageSquare size={13} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-400">
                      No leads match your filter. Import an Excel/CSV file, sync a Google Sheet, or create a Public Form.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CALLBACKS */}
      {activeTab === "callbacks" && (
        <div className="beraxis-glass-dock p-5 space-y-3">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <Clock size={16} /> Scheduled Callbacks Queue
          </h3>
          {callbacksDue.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No callbacks scheduled yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {callbacksDue.map((l) => (
                <div key={l.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-white text-sm">{l.name} · <span className="text-cyan-300 font-mono text-xs">{l.phone}</span></div>
                    <div className="text-xs text-amber-300 mt-1">Due: {l.callbackAt ? l.callbackAt.replace("T", " ") : "Soon"}</div>
                    <div className="text-[11px] text-gray-400 mt-1">{l.notes || "No notes"}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startCall(l)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    Call Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="beraxis-glass-dock p-5 space-y-4">
          <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
            <Trophy size={16} /> Agent Performance Leaderboard
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {leaderboard.map((row, idx) => (
              <div key={row.agent} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">#{idx + 1}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    {row.qualified + row.won} Qualified
                  </span>
                </div>
                <div className="font-bold text-white text-sm truncate">{row.agent}</div>
                <div className="text-xs text-gray-400">Total Calls Logged: <strong className="text-white">{row.calls}</strong></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RESTRICTED USER ACCESS CONTROL */}
      {activeTab === "access" && isManagerOrOwner && (
        <div className="beraxis-glass-dock p-6 space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" /> Limited User Access Control
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Control which team members can open this Call Center Lead Sheet and whether agents only see leads assigned to them.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="p-4 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-bold text-white">Restrict Sheet to Selected Users Only</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Block non-selected employees from viewing the lead list.</div>
              </div>
              <input
                type="checkbox"
                checked={restrictAccess}
                onChange={(e) => persistAccess(e.target.checked, agentOnlyAssigned, allowedEmails)}
                className="w-4 h-4 accent-purple-500"
              />
            </label>

            <label className="p-4 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-bold text-white">Agents See Only Assigned Leads</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Managers still see all leads; agents see only their rows.</div>
              </div>
              <input
                type="checkbox"
                checked={agentOnlyAssigned}
                onChange={(e) => persistAccess(restrictAccess, e.target.checked, allowedEmails)}
                className="w-4 h-4 accent-purple-500"
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Authorized Call Center Users ({allowedEmails.length})</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {teamUsers.map((u) => {
                const checked = allowedEmails.includes(u.email);
                return (
                  <label
                    key={u.email}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      checked ? "bg-purple-600/20 border-purple-500/50" : "bg-white/5 border-white/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...allowedEmails, u.email]
                          : allowedEmails.filter((x) => x !== u.email);
                        persistAccess(restrictAccess, agentOnlyAssigned, next);
                      }}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{u.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{u.email} · {u.role}</div>
                    </div>
                  </label>
                );
              })}
              {teamUsers.length === 0 && (
                <div className="text-xs text-gray-400 col-span-full">
                  No team members loaded yet. Invite agents in <Link href="/team" className="text-cyan-300 underline">Team Management</Link>.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GOOGLE SHEETS SYNC */}
      {isSheetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleGoogleSheetSync} className="bg-[#141C2E] border border-white/20 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-400" /> Sync Google Sheets Lead List
              </h3>
              <button type="button" onClick={() => setIsSheetModalOpen(false)}><X size={18} /></button>
            </div>
            <p className="text-xs text-gray-300">
              Paste your Google Sheets URL (set sharing to <strong>Anyone with the link → Viewer</strong>). Columns like <code className="text-cyan-300">Name, Phone, Email, Company, Campaign</code> will import automatically.
            </p>
            <input
              type="url"
              required
              value={googleSheetUrl}
              onChange={(e) => setGoogleSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none focus:border-emerald-400"
            />
            {sheetError && <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl">{sheetError}</div>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsSheetModalOpen(false)} className="px-4 py-2 text-xs text-gray-400 font-bold">Cancel</button>
              <button
                type="submit"
                disabled={syncingSheet}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {syncingSheet && <RefreshCw size={12} className="animate-spin" />} Sync Sheet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD LEAD */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddLead} className="bg-[#141C2E] border border-white/20 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold">Add Call Center Lead</h3>
              <button type="button" onClick={() => setIsAddLeadOpen(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input type="text" required placeholder="Full Name *" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none" />
              <input type="tel" placeholder="Phone / WhatsApp" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none" />
              <input type="email" placeholder="Email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none" />
              <input type="text" placeholder="Company" value={newLead.company} onChange={(e) => setNewLead({ ...newLead, company: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none" />
              <input type="text" placeholder="Campaign" value={newLead.campaign} onChange={(e) => setNewLead({ ...newLead, campaign: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddLeadOpen(false)} className="px-4 py-2 text-xs text-gray-400 font-bold">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white cursor-pointer">Save Lead</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: LIVE CALL TIMER & OUTCOME LOGGER */}
      {activeCallLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141C2E] border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="text-[10px] font-bold uppercase text-emerald-400">Live Call Session</div>
                <h3 className="text-lg font-black text-white">{activeCallLead.name}</h3>
                <div className="text-xs text-cyan-300 font-mono">{activeCallLead.phone} · {activeCallLead.company}</div>
              </div>
              <div className="text-2xl font-mono font-black text-emerald-400">
                {String(Math.floor(callSeconds / 60)).padStart(2, "0")}:{String(callSeconds % 60).padStart(2, "0")}
              </div>
            </div>

            {activeCallLead.phone !== "N/A" && (
              <a
                href={`tel:${activeCallLead.phone}`}
                className="w-full py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2"
              >
                <PhoneCall size={14} /> Dial {activeCallLead.phone} via System Phone / SIP
              </a>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">Call Outcome</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Qualified", "Callback", "Ringing", "Closed Won", "New", "DNC"] as LeadDisposition[]).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setCallOutcome(o)}
                      className={`py-2 rounded-xl text-[11px] font-bold border cursor-pointer ${
                        callOutcome === o ? "bg-purple-600 border-purple-400 text-white" : "bg-white/5 border-white/10 text-gray-300"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {callOutcome === "Callback" && (
                <div>
                  <label className="text-[11px] font-bold text-amber-300 block mb-1">Schedule Callback</label>
                  <input
                    type="datetime-local"
                    value={callCallbackAt}
                    onChange={(e) => setCallCallbackAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">Call Notes</label>
                <textarea
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Summary of call, budget, next steps..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setActiveCallLead(null)} className="px-4 py-2 text-xs text-gray-400 font-bold flex items-center gap-1">
                <PhoneOff size={13} /> Cancel
              </button>
              <button
                type="button"
                onClick={completeCallLog}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={14} /> Log Call &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
