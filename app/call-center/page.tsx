"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  PhoneCall,
  Upload,
  FileSpreadsheet,
  Download,
  Lock,
  ShieldCheck,
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
  Sparkles,
  Megaphone,
  Pause,
  Trash2,
  Play,
  ArrowRightLeft,
  ShieldAlert,
  Headphones,
  Activity,
  Award,
  Radio,
  PhoneIncoming,
  DollarSign,
} from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

export type LeadDisposition =
  | "New"
  | "No Answer"
  | "Voicemail"
  | "Busy"
  | "Callback"
  | "Qualified"
  | "Warm Transfer"
  | "Pending QA"
  | "Closed Won"
  | "Not Interested"
  | "DNC";

export type AgentAuxState =
  | "Available"
  | "On Call"
  | "ACW Wrap-Up"
  | "Break"
  | "Coaching"
  | "Offline";

export interface CallCenterLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  campaign: string;
  source: string;
  disposition: LeadDisposition;
  assignedTo: string;
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

const ALL_DISPOSITIONS: LeadDisposition[] = [
  "New",
  "No Answer",
  "Voicemail",
  "Busy",
  "Callback",
  "Qualified",
  "Warm Transfer",
  "Pending QA",
  "Closed Won",
  "Not Interested",
  "DNC",
];

const DEFAULT_SCRIPT = `1. MANDATORY COMPLIANCE DISCLOSURE:
"Hi [Lead Name], this is [Agent Name] calling from our Partner Desk on a recorded line. How are you doing today?"

2. FRONTER QUALIFICATION (BANT / ELIGIBILITY):
- Confirm age / business size / current carrier or supplier.
- Verify decision-maker & monthly budget range.

3. WARM TRANSFER HANDOFF TO SENIOR CLOSER:
"Great news — you qualify for our preferred tier! Hold one brief moment while I bring Senior Specialist [Closer Name] onto the line with your file."`;

const REBUTTALS = [
  {
    title: "Too Busy Right Now",
    reply: "Totally understand — I'll note a 2-minute callback window that works best for you. Morning or late afternoon?",
  },
  {
    title: "Already Covered / Have a Provider",
    reply: "Most clients we help already had an existing plan — our Senior Specialist compares side-by-side in 90 seconds to see if we lock in a lower rate.",
  },
  {
    title: "Send Information First",
    reply: "Happy to! Let me verify two quick details so we send the exact rate sheet rather than a generic brochure.",
  },
];

const SAMPLE_LEADS: CallCenterLead[] = [
  {
    id: "CC-1001",
    name: "Tariq Mahmood",
    phone: "+1-555-0142",
    email: "tariq@apexfreight.io",
    company: "Apex Freight",
    campaign: "Final Expense & Protection Q4",
    source: "Google Sheets",
    disposition: "New",
    assignedTo: "Unassigned",
    notes: "Requested family coverage & senior rate comparison.",
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
    notes: "Interested in multi-company B2B package.",
    callsCount: 2,
    lastCalledAt: new Date(Date.now() - 7200 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
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
    notes: "Ready for Senior Closer warm transfer ($1,450 annual value).",
    callsCount: 3,
    lastCalledAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

function normalizeDigits(phone: string): string {
  return String(phone || "").replace(/\D/g, "");
}

export default function CallCenterPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const companyId = activeBranch?.id || "CMP-001";

  const [leads, setLeads] = useState<CallCenterLead[]>([]);
  const [teamUsers, setTeamUsers] = useState<TeamUserOption[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserName, setCurrentUserName] = useState("Floor Agent");
  const [currentUserRole, setCurrentUserRole] = useState("Owner");

  // Live Agent AUX Presence State
  const [auxState, setAuxState] = useState<AgentAuxState>("Available");
  const [bpoDeskRole, setBpoDeskRole] = useState<"Fronter" | "Closer" | "Inbound Support" | "QA / Supervisor">("Fronter");
  const [auxSeconds, setAuxSeconds] = useState(0);
  const [floorAgents, setFloorAgents] = useState<any[]>([]);
  const [supervisorMode, setSupervisorMode] = useState<string | null>(null);

  // BPO Collections (Synced with Isolated Cluster /api/call-center)
  const [transfers, setTransfers] = useState<any[]>([]);
  const [dncList, setDncList] = useState<any[]>([]);
  const [qaScorecards, setQaScorecards] = useState<any[]>([]);
  const [acdQueues, setAcdQueues] = useState<any[]>([]);

  // Restricted Access Controls
  const [restrictAccess, setRestrictAccess] = useState(false);
  const [agentOnlyAssigned, setAgentOnlyAssigned] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<
    | "sheet"
    | "transfers"
    | "acd"
    | "dnc"
    | "qa"
    | "wallboard"
    | "campaigns"
    | "callbacks"
    | "leaderboard"
    | "access"
  >("sheet");

  const [campaigns, setCampaigns] = useState<
    {
      id: string;
      name: string;
      mode: "Progressive Dialer" | "Predictive Dialer" | "Preview Dialer" | "Inbound Queue" | "Callback Recovery";
      dailyGoal: number;
      status: "Active" | "Paused" | "Completed";
      assignedAgents: string[];
      createdAt: string;
    }[]
  >([]);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    mode: "Progressive Dialer" as
      | "Progressive Dialer"
      | "Predictive Dialer"
      | "Preview Dialer"
      | "Inbound Queue"
      | "Callback Recovery",
    dailyGoal: 50,
    assignedAgents: [] as string[],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [dispositionFilter, setDispositionFilter] = useState<string>("All");
  const [campaignFilter, setCampaignFilter] = useState<string>("All");
  const [dateMode, setDateMode] = useState<"today" | "all" | "range">("all");
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Google Sheets & Modals
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [syncingSheet, setSyncingSheet] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    campaign: "Final Expense & Protection Q4",
  });

  // Warm Transfer Modal State
  const [transferModalLead, setTransferModalLead] = useState<CallCenterLead | null>(null);
  const [xferCarrier, setXferCarrier] = useState("Aetna / Mutual Preferred Plan");
  const [xferValue, setXferValue] = useState("1200");
  const [xferCloser, setXferCloser] = useState("Senior Closer Desk");
  const [xferNotes, setXferNotes] = useState("");

  // Closer Deal Modal
  const [closingTransfer, setClosingTransfer] = useState<any | null>(null);
  const [closeDealValue, setCloseDealValue] = useState("1200");
  const [closeCarrier, setCloseCarrier] = useState("");

  // DNC Add Form
  const [newDncPhone, setNewDncPhone] = useState("");
  const [newDncReason, setNewDncReason] = useState("Customer verbal opt-out");
  const [newDncSource, setNewDncSource] = useState<
    "Customer Opt-Out" | "Federal / National DNC" | "Litigator Shield" | "Supervisor Block"
  >("Customer Opt-Out");

  // QA Scorecard Form
  const [qaLeadName, setQaLeadName] = useState("");
  const [qaAgentName, setQaAgentName] = useState("");
  const [qaCampaign, setQaCampaign] = useState("Final Expense & Protection Q4");
  const [qaDisclosurePass, setQaDisclosurePass] = useState(true);
  const [qaScores, setQaScores] = useState({
    disclosure: 25,
    verification: 15,
    scriptAdherence: 19,
    objectionEmpathy: 18,
    crmHygiene: 19,
  });
  const [qaNotes, setQaNotes] = useState("");

  // Live Dialer & Script
  const [activeCallLead, setActiveCallLead] = useState<CallCenterLead | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [callOutcome, setCallOutcome] = useState<LeadDisposition>("Qualified");
  const [callNotes, setCallNotes] = useState("");
  const [callCallbackAt, setCallCallbackAt] = useState("");
  const [scriptText, setScriptText] = useState(DEFAULT_SCRIPT);
  const [showScriptPanel, setShowScriptPanel] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dncAlert, setDncAlert] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3800);
  };

  // AUX Timer
  useEffect(() => {
    const iv = setInterval(() => setAuxSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [auxState]);

  const handleSetAux = async (nextAux: AgentAuxState, activeLeadName?: string) => {
    setAuxState(nextAux);
    setAuxSeconds(0);
    try {
      const res = await fetch("/api/call-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_aux",
          company_id: companyId,
          email: currentUserEmail,
          agentEmail: currentUserEmail || "agent@workspace",
          agentName: currentUserName,
          role: bpoDeskRole,
          auxState: nextAux,
          activeLeadName: activeLeadName || "",
        }),
      });
      if (res.ok) {
        const d = await res.json();
        if (Array.isArray(d.agents)) setFloorAgents(d.agents);
      }
    } catch {}
  };

  // Load User
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        setCurrentUserEmail((u.email || "").toLowerCase());
        setCurrentUserName(u.name || (u.email || "Floor Agent").split("@")[0]);
        setCurrentUserRole(u.role || "Owner");
      }
    } catch {}
  }, []);

  // Load All Isolated Cluster BPO Data
  const loadBpoClusterData = useCallback(async () => {
    const leadsKey = getEntityStorageKey("call_center_leads");
    const accessKey = getEntityStorageKey("call_center_access");
    const scriptKey = getEntityStorageKey("call_center_script");
    const campKey = getEntityStorageKey("call_center_campaigns");

    let localLeads: CallCenterLead[] = SAMPLE_LEADS;
    try {
      const saved = localStorage.getItem(leadsKey);
      if (saved) localLeads = JSON.parse(saved);
      const savedAccess = localStorage.getItem(accessKey);
      if (savedAccess) {
        const parsed = JSON.parse(savedAccess);
        setRestrictAccess(Boolean(parsed.restrictAccess));
        setAgentOnlyAssigned(Boolean(parsed.agentOnlyAssigned));
        if (Array.isArray(parsed.allowedEmails)) setAllowedEmails(parsed.allowedEmails);
      }
      const savedScript = localStorage.getItem(scriptKey);
      if (savedScript) setScriptText(savedScript);
      const savedCamps = localStorage.getItem(campKey);
      if (savedCamps) {
        setCampaigns(JSON.parse(savedCamps));
      } else {
        setCampaigns([
          {
            id: "CMPG-001",
            name: "Final Expense & Protection Q4",
            mode: "Predictive Dialer",
            dailyGoal: 60,
            status: "Active",
            assignedAgents: [],
            createdAt: new Date().toISOString().slice(0, 10),
          },
          {
            id: "CMPG-002",
            name: "Inbound Web Form",
            mode: "Inbound Queue",
            dailyGoal: 30,
            status: "Active",
            assignedAgents: [],
            createdAt: new Date().toISOString().slice(0, 10),
          },
        ]);
      }
    } catch {}

    try {
      const res = await fetch(
        `/api/call-center?company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(currentUserEmail)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.leads) && data.leads.length > 0) {
          localLeads = data.leads;
          localStorage.setItem(leadsKey, JSON.stringify(localLeads));
        }
        if (Array.isArray(data.campaigns) && data.campaigns.length > 0) {
          setCampaigns(data.campaigns);
        }
        if (Array.isArray(data.transfers)) setTransfers(data.transfers);
        if (Array.isArray(data.dncList)) setDncList(data.dncList);
        if (Array.isArray(data.qaScorecards)) setQaScorecards(data.qaScorecards);
        if (Array.isArray(data.queues)) setAcdQueues(data.queues);
        if (Array.isArray(data.agents)) setFloorAgents(data.agents);
      }
    } catch {}

    setLeads(localLeads);

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
  }, [companyId, currentUserEmail, getEntityStorageKey]);

  useEffect(() => {
    loadBpoClusterData();
  }, [loadBpoClusterData]);

  const persistLeads = async (next: CallCenterLead[]) => {
    setLeads(next);
    try {
      localStorage.setItem(getEntityStorageKey("call_center_leads"), JSON.stringify(next));
      await fetch("/api/call-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_leads",
          company_id: companyId,
          email: currentUserEmail,
          leads: next,
        }),
      });
    } catch {}
  };

  const persistCampaigns = async (next: typeof campaigns) => {
    setCampaigns(next);
    try {
      localStorage.setItem(getEntityStorageKey("call_center_campaigns"), JSON.stringify(next));
      await fetch("/api/call-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_campaigns",
          company_id: companyId,
          email: currentUserEmail,
          campaigns: next,
        }),
      });
    } catch {}
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
    !restrictAccess || isManagerOrOwner || !currentUserEmail || allowedEmails.includes(currentUserEmail);

  const visibleLeads = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return leads.filter((l) => {
      if (agentOnlyAssigned && !isManagerOrOwner && currentUserEmail) {
        if ((l.assignedTo || "").toLowerCase() !== currentUserEmail) return false;
      }
      if (dateMode === "today") {
        const createdDay = (l.createdAt || l.lastCalledAt || todayStr).slice(0, 10);
        if (createdDay !== todayStr) return false;
      } else if (dateMode === "range") {
        const createdDay = (l.createdAt || l.lastCalledAt || todayStr).slice(0, 10);
        if (fromDate && createdDay < fromDate) return false;
        if (toDate && createdDay > toDate) return false;
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
  }, [
    leads,
    agentOnlyAssigned,
    isManagerOrOwner,
    currentUserEmail,
    dispositionFilter,
    campaignFilter,
    searchQuery,
    dateMode,
    fromDate,
    toDate,
  ]);

  const callbacksDue = useMemo(
    () =>
      leads
        .filter((l) => l.disposition === "Callback")
        .sort((a, b) => (a.callbackAt || "").localeCompare(b.callbackAt || "")),
    [leads]
  );

  const campaignFilterOptions = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set([...campaigns.map((c) => c.name), ...leads.map((l) => l.campaign).filter(Boolean)])
      ),
    ],
    [campaigns, leads]
  );

  const leaderboard = useMemo(() => {
    const map = new Map<string, { agent: string; calls: number; qualified: number; won: number }>();
    for (const l of leads) {
      const key = l.assignedTo && l.assignedTo !== "Unassigned" ? l.assignedTo : "Floor Pool";
      const cur = map.get(key) || { agent: key, calls: 0, qualified: 0, won: 0 };
      cur.calls += l.callsCount || 0;
      if (l.disposition === "Qualified" || l.disposition === "Warm Transfer") cur.qualified += 1;
      if (l.disposition === "Closed Won") cur.won += 1;
      map.set(key, cur);
    }
    return Array.from(map.values()).sort(
      (a, b) => b.qualified + b.won - (a.qualified + a.won) || b.calls - a.calls
    );
  }, [leads]);

  // Pre-Dial DNC Shield Guard!
  const isPhoneOnDnc = useCallback(
    (phone: string) => {
      const norm = normalizeDigits(phone);
      if (!norm) return false;
      return dncList.some((d) => d.normalizedPhone === norm);
    },
    [dncList]
  );

  const startCall = (lead: CallCenterLead) => {
    if (lead.disposition === "DNC" || isPhoneOnDnc(lead.phone)) {
      setDncAlert(
        `DNC COMPLIANCE BLOCK: ${lead.phone} (${lead.name}) is registered on the Do-Not-Call Shield. Outbound dialing is strictly blocked.`
      );
      setTimeout(() => setDncAlert(null), 6000);
      return;
    }
    setActiveCallLead(lead);
    setCallSeconds(0);
    setCallOutcome(lead.disposition === "New" ? "Qualified" : lead.disposition);
    setCallNotes(lead.notes || "");
    setCallCallbackAt(lead.callbackAt || "");
    handleSetAux("On Call", lead.name);
  };

  const completeCallLog = async () => {
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
    await persistLeads(updated);
    if (callOutcome === "DNC" && activeCallLead.phone !== "N/A") {
      await loadBpoClusterData();
    }
    handleSetAux("ACW Wrap-Up");
    showToast(
      `Logged ${callOutcome} (${Math.floor(callSeconds / 60)}m ${callSeconds % 60}s) — Agent moved to ACW Wrap-Up`
    );
    setActiveCallLead(null);
  };

  // Warm Transfer (Fronter -> Closer)
  const openWarmTransferModal = (lead: CallCenterLead) => {
    if (lead.disposition === "DNC" || isPhoneOnDnc(lead.phone)) {
      setDncAlert(`DNC COMPLIANCE BLOCK: ${lead.phone} cannot be transferred.`);
      setTimeout(() => setDncAlert(null), 5000);
      return;
    }
    setActiveCallLead(null);
    setTransferModalLead(lead);
    setXferNotes(lead.notes || "Verified age/eligibility, decision-maker on the line, ready for Senior Closer.");
  };

  const handleSubmitWarmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalLead) return;
    const res = await fetch("/api/call-center", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "warm_transfer",
        company_id: companyId,
        email: currentUserEmail,
        leadId: transferModalLead.id,
        leadName: transferModalLead.name,
        phone: transferModalLead.phone,
        company: transferModalLead.company,
        campaign: transferModalLead.campaign,
        fronterAgent: currentUserName,
        closerAgent: xferCloser,
        carrierOrProduct: xferCarrier,
        estimatedValue: Number(xferValue) || 1200,
        qualificationNotes: xferNotes,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setTransfers(data.transfers || []);
      setLeads((prev) =>
        prev.map((l) => (l.id === transferModalLead.id ? { ...l, disposition: "Warm Transfer" } : l))
      );
      setTransferModalLead(null);
      setActiveTab("transfers");
      handleSetAux("ACW Wrap-Up");
      showToast(`🔥 Warm Transfer queued for ${xferCloser}!`);
    } else {
      setDncAlert(data.error || "Transfer blocked.");
    }
  };

  const handleCloseTransferDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingTransfer) return;
    const res = await fetch("/api/call-center", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "close_transfer",
        company_id: companyId,
        email: currentUserEmail,
        transferId: closingTransfer.id,
        closerAgent: currentUserName,
        carrierOrProduct: closeCarrier || closingTransfer.carrierOrProduct,
        dealValue: Number(closeDealValue) || closingTransfer.estimatedValue,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setTransfers(data.transfers || []);
      setLeads((prev) =>
        prev.map((l) => (l.id === closingTransfer.leadId ? { ...l, disposition: "Closed Won" } : l))
      );
      setClosingTransfer(null);
      showToast(
        `Closed Won! Auto-created Sales Order ${data.salesOrder?.name} ($${Number(closeDealValue).toLocaleString()}) in /sales!`
      );
    }
  };

  // DNC Actions
  const handleAddDnc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDncPhone.trim()) return;
    const res = await fetch("/api/call-center", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_dnc",
        company_id: companyId,
        email: currentUserEmail,
        phone: newDncPhone.trim(),
        reason: newDncReason,
        source: newDncSource,
        addedBy: currentUserName,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setDncList(data.dncList || []);
      const norm = normalizeDigits(newDncPhone);
      setLeads((prev) =>
        prev.map((l) => (normalizeDigits(l.phone) === norm ? { ...l, disposition: "DNC" } : l))
      );
      setNewDncPhone("");
      showToast(`Added ${data.dncEntry?.phone} to Do-Not-Call Compliance Shield.`);
    }
  };

  const handleRemoveDnc = async (id: string) => {
    const res = await fetch("/api/call-center", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove_dnc", company_id: companyId, email: currentUserEmail, id }),
    });
    if (res.ok) {
      const d = await res.json();
      setDncList(d.dncList || []);
    }
  };

  const handleScrubLeadSheetDnc = () => {
    let scrubbed = 0;
    const updated = leads.map((l) => {
      if (l.disposition !== "DNC" && isPhoneOnDnc(l.phone)) {
        scrubbed++;
        return { ...l, disposition: "DNC" as LeadDisposition };
      }
      return l;
    });
    persistLeads(updated);
    showToast(`DNC Scrub Complete: ${scrubbed} matching lead(s) flagged & locked as DNC.`);
  };

  // QA Scorecard Submit
  const handleSubmitQa = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/call-center", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submit_qa",
        company_id: companyId,
        email: currentUserEmail,
        leadName: qaLeadName || leads[0]?.name || "Inbound Prospect",
        agentName: qaAgentName || currentUserName,
        campaign: qaCampaign,
        reviewer: currentUserName,
        complianceDisclosurePass: qaDisclosurePass,
        ...qaScores,
        notes: qaNotes,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setQaScorecards(data.qaScorecards || []);
      setQaLeadName("");
      setQaNotes("");
      showToast(`QA Scorecard saved: ${data.scorecard.totalScore}% (${data.scorecard.outcome})`);
    }
  };

  // Simulate Inbound ACD Screen-Pop
  const handleSimulateInboundCall = (queue: any) => {
    const caller: CallCenterLead = {
      id: `INB-${Date.now().toString().slice(-4)}`,
      name: `Inbound Caller (IVR ${queue.ivrDigit})`,
      phone: `+1-555-${Math.floor(1000 + Math.random() * 8999)}`,
      email: "",
      company: queue.name,
      campaign: "Inbound ACD Queue",
      source: `IVR Press ${queue.ivrDigit}`,
      disposition: "New",
      assignedTo: currentUserEmail || "Unassigned",
      notes: `Routed via ${queue.name} (${queue.skillGroup})`,
      callsCount: 0,
      createdAt: new Date().toISOString(),
    };
    const nextLeads = [caller, ...leads];
    persistLeads(nextLeads);
    const nextQueues = acdQueues.map((q) =>
      q.id === queue.id ? { ...q, callsAnswered: (q.callsAnswered || 0) + 1 } : q
    );
    setAcdQueues(nextQueues);
    fetch("/api/call-center", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_queues", company_id: companyId, email: currentUserEmail, queues: nextQueues }),
    }).catch(() => {});
    startCall(caller);
  };

  // Excel / CSV / Google Sheets Import
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
      const autoDnc = isPhoneOnDnc(phone);
      imported.push({
        id: `CC-${Date.now().toString().slice(-5)}-${i}`,
        name: name || phone || email,
        phone: phone || "N/A",
        email: email || "",
        company: company || "—",
        campaign,
        source: sourceLabel,
        disposition: autoDnc ? "DNC" : "New",
        assignedTo: "Unassigned",
        notes,
        callsCount: 0,
        createdAt: new Date().toISOString(),
      });
    }
    if (imported.length === 0) {
      showToast("No valid lead rows found.");
      return;
    }
    persistLeads([...imported, ...leads]);
    showToast(`Imported ${imported.length} leads from ${sourceLabel} (auto-scrubbed against DNC)!`);
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

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name.trim()) return;
    const blocked = isPhoneOnDnc(newLead.phone);
    const item: CallCenterLead = {
      id: `CC-${Date.now().toString().slice(-5)}`,
      name: newLead.name.trim(),
      phone: newLead.phone.trim() || "N/A",
      email: newLead.email.trim(),
      company: newLead.company.trim() || "—",
      campaign: newLead.campaign.trim() || "Outbound Campaign",
      source: "Manual Entry",
      disposition: blocked ? "DNC" : "New",
      assignedTo: currentUserEmail || "Unassigned",
      notes: "",
      callsCount: 0,
      createdAt: new Date().toISOString(),
    };
    persistLeads([item, ...leads]);
    setNewLead({ name: "", phone: "", email: "", company: "", campaign: "Final Expense & Protection Q4" });
    setIsAddLeadOpen(false);
    showToast(`Added ${item.name}${blocked ? " (auto-flagged DNC)" : ""}!`);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name.trim()) return;
    const item = {
      id: `CMPG-${Date.now().toString().slice(-4)}`,
      name: newCampaign.name.trim(),
      mode: newCampaign.mode,
      dailyGoal: Math.max(1, Number(newCampaign.dailyGoal) || 25),
      status: "Active" as const,
      assignedAgents: newCampaign.assignedAgents,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    persistCampaigns([item, ...campaigns]);
    setNewCampaign({ name: "", mode: "Progressive Dialer", dailyGoal: 50, assignedAgents: [] });
    setIsCampaignModalOpen(false);
    showToast(`Launched campaign "${item.name}"!`);
  };

  const handleDialNextInCampaign = (campName: string) => {
    const candidate = leads.find(
      (l) =>
        l.campaign === campName &&
        l.disposition !== "DNC" &&
        !isPhoneOnDnc(l.phone) &&
        (l.disposition === "New" || l.disposition === "Callback")
    );
    if (!candidate) {
      showToast(`No dialable (non-DNC) leads waiting in "${campName}".`);
      return;
    }
    startCall(candidate);
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

  if (!hasSheetAccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="beraxis-glass-hero max-w-md w-full p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-black text-white">Restricted Lead Sheet Access</h2>
          <p className="text-xs text-gray-300">
            Your workspace administrator has restricted the Call Center floor to authorized agents only.
          </p>
          <Link href="/apps" className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold">
            ← Back to Apps Cockpit
          </Link>
        </div>
      </div>
    );
  }

  const totalCalls = leads.reduce((s, l) => s + (l.callsCount || 0), 0);
  const qualifiedCount = leads.filter(
    (l) => l.disposition === "Qualified" || l.disposition === "Warm Transfer" || l.disposition === "Closed Won"
  ).length;
  const closedWonTransfers = transfers.filter((t) => t.status === "Closed Won");
  const waitingTransfers = transfers.filter((t) => t.status !== "Closed Won");
  const avgQaScore =
    qaScorecards.length > 0
      ? Math.round(qaScorecards.reduce((s, q) => s + (q.totalScore || 0), 0) / qaScorecards.length)
      : 94;
  const totalAnsweredInbound = acdQueues.reduce((s, q) => s + (q.callsAnswered || 0), 0);
  const totalAbandonedInbound = acdQueues.reduce((s, q) => s + (q.callsAbandoned || 0), 0);
  const abandonmentPct =
    totalAnsweredInbound + totalAbandonedInbound > 0
      ? ((totalAbandonedInbound / (totalAnsweredInbound + totalAbandonedInbound)) * 100).toFixed(1)
      : "2.3";

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16 text-white">
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600/95 border border-emerald-400/40 text-xs font-bold text-white shadow-xl">
          {toast}
        </div>
      )}

      {dncAlert && (
        <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-bold flex items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-rose-400 shrink-0" />
            <span>{dncAlert}</span>
          </div>
          <button onClick={() => setDncAlert(null)} className="text-rose-300 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="beraxis-glass-hero p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300 mb-1">
            <PhoneCall size={14} /> Enterprise BPO &amp; Contact Center · {activeBranch?.name || "Workspace"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Omnichannel Dialer, Fronter-Closer Desk, ACD, QA &amp; DNC Shield
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Full BPO lifecycle: Inbound IVR/ACD queues, Outbound Dialer, DNC Compliance Scrubbing, Fronter → Closer Warm Transfers synced to Sales, QA Scorecards, and Live Wallboard.
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
            <BookOpen size={14} /> Script &amp; Rebuttals
          </button>
          <Link
            href="/forms"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
          >
            <ClipboardList size={14} /> Intake Forms
          </Link>
        </div>
      </div>

      {/* LIVE AGENT AUX PRESENCE BAR */}
      <div className="beraxis-glass-dock p-3.5 px-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Headphones size={14} className="text-cyan-400" /> Agent AUX Status:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { state: "Available", dot: "bg-emerald-400" },
                { state: "On Call", dot: "bg-cyan-400" },
                { state: "ACW Wrap-Up", dot: "bg-amber-400" },
                { state: "Break", dot: "bg-orange-400" },
                { state: "Coaching", dot: "bg-purple-400" },
                { state: "Offline", dot: "bg-gray-500" },
              ] as { state: AgentAuxState; dot: string }[]
            ).map((item) => (
              <button
                key={item.state}
                type="button"
                onClick={() => handleSetAux(item.state)}
                className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 border cursor-pointer transition ${
                  auxState === item.state
                    ? "bg-white/15 border-cyan-400 text-white shadow"
                    : "bg-black/30 border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                {item.state}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={bpoDeskRole}
            onChange={(e) => setBpoDeskRole(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-[#0B1022] border border-purple-500/40 text-purple-200 font-bold outline-none"
          >
            <option value="Fronter">Role: Outbound Fronter</option>
            <option value="Closer">Role: Senior Closer</option>
            <option value="Inbound Support">Role: Inbound ACD Agent</option>
            <option value="QA / Supervisor">Role: QA / Floor Supervisor</option>
          </select>
          <span className="font-mono font-bold text-cyan-300 bg-black/40 px-3 py-1 rounded-xl border border-white/10">
            {String(Math.floor(auxSeconds / 60)).padStart(2, "0")}:{String(auxSeconds % 60).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="beraxis-glass-dock p-3.5">
          <div className="text-[10px] uppercase font-bold text-gray-400">Lead Pool</div>
          <div className="text-xl font-black text-white mt-0.5">{leads.length}</div>
          <div className="text-[10px] text-cyan-300 mt-0.5">{totalCalls} dials logged</div>
        </div>
        <div className="beraxis-glass-dock p-3.5">
          <div className="text-[10px] uppercase font-bold text-gray-400">Warm Transfers</div>
          <div className="text-xl font-black text-amber-400 mt-0.5">{transfers.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">{waitingTransfers.length} awaiting Closer</div>
        </div>
        <div className="beraxis-glass-dock p-3.5">
          <div className="text-[10px] uppercase font-bold text-gray-400">Closer Sales Won</div>
          <div className="text-xl font-black text-emerald-400 mt-0.5">{closedWonTransfers.length}</div>
          <div className="text-[10px] text-emerald-300 mt-0.5">Synced to /sales</div>
        </div>
        <div className="beraxis-glass-dock p-3.5">
          <div className="text-[10px] uppercase font-bold text-gray-400">DNC Blocked</div>
          <div className="text-xl font-black text-rose-400 mt-0.5">{dncList.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Auto-scrubbed</div>
        </div>
        <div className="beraxis-glass-dock p-3.5">
          <div className="text-[10px] uppercase font-bold text-gray-400">QA Compliance Avg</div>
          <div className="text-xl font-black text-purple-300 mt-0.5">{avgQaScore}%</div>
          <div className="text-[10px] text-gray-400 mt-0.5">{qaScorecards.length} audits</div>
        </div>
        <div className="beraxis-glass-dock p-3.5">
          <div className="text-[10px] uppercase font-bold text-gray-400">Inbound SLA (80/20)</div>
          <div className="text-xl font-black text-cyan-300 mt-0.5">88.4%</div>
          <div className="text-[10px] text-gray-400 mt-0.5">{abandonmentPct}% abandon</div>
        </div>
      </div>

      {/* Script Drawer */}
      {showScriptPanel && (
        <div className="beraxis-glass-dock p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-purple-300 flex items-center gap-1.5">
                <Sparkles size={13} /> Fronter &amp; Closer Call Script (TCPA / Recording Disclosure)
              </span>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem(getEntityStorageKey("call_center_script"), scriptText);
                  } catch {}
                  showToast("Call script saved.");
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
              className="w-full rounded-xl bg-black/30 border border-white/15 p-3 text-xs text-gray-200 outline-none"
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-cyan-300 block">Objection Handling Matrix</span>
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
        <div className="flex flex-wrap p-1 rounded-2xl bg-white/5 border border-white/10 gap-1">
          {[
            { id: "sheet", label: "Lead Sheet", icon: FileSpreadsheet },
            { id: "transfers", label: `Warm Transfers (${waitingTransfers.length})`, icon: ArrowRightLeft },
            { id: "acd", label: "Inbound ACD & IVR", icon: PhoneIncoming },
            { id: "dnc", label: `DNC Shield (${dncList.length})`, icon: ShieldAlert },
            { id: "qa", label: `QA Scorecards (${qaScorecards.length})`, icon: Award },
            { id: "wallboard", label: "Floor Wallboard", icon: Activity },
            { id: "campaigns", label: `Campaigns (${campaigns.length})`, icon: Megaphone },
            { id: "callbacks", label: `Callbacks (${callbacksDue.length})`, icon: Clock },
            { id: "leaderboard", label: "Leaderboard", icon: Trophy },
            ...(isManagerOrOwner ? [{ id: "access", label: "Access", icon: ShieldCheck }] : []),
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === t.id ? "beraxis-glow-pill" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={13} /> {t.label}
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
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* TAB 1: LEAD SHEET & DIALER */}
      {activeTab === "sheet" && (
        <div className="beraxis-glass-dock p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/15">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by name, phone, email, or company..."
                className="flex-1 bg-transparent text-xs text-white outline-none"
              />
            </div>
            <select
              value={dateMode}
              onChange={(e) => setDateMode(e.target.value as "today" | "all" | "range")}
              className="px-3 py-2 rounded-xl bg-[#0B1022] border border-cyan-500/30 text-xs font-bold text-cyan-300 outline-none"
            >
              <option value="all">All Dates</option>
              <option value="today">Today Only</option>
              <option value="range">Custom Date Range</option>
            </select>
            {dateMode === "range" && (
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#0B1022] border border-white/15 text-white text-xs"
                />
                <span>to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#0B1022] border border-white/15 text-white text-xs"
                />
              </div>
            )}
            <select
              value={dispositionFilter}
              onChange={(e) => setDispositionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0B1022] border border-white/15 text-xs text-white outline-none"
            >
              <option value="All">All Dispositions</option>
              {ALL_DISPOSITIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0B1022] border border-white/15 text-xs text-white outline-none"
            >
              {campaignFilterOptions.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Campaigns" : c}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                  <th className="py-3 px-3">Lead / Company</th>
                  <th className="py-3 px-3">Phone &amp; DNC Status</th>
                  <th className="py-3 px-3">Campaign / Source</th>
                  <th className="py-3 px-3">Assigned Agent</th>
                  <th className="py-3 px-3">Disposition</th>
                  <th className="py-3 px-3 text-right">Dialer &amp; Closer Handoff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visibleLeads.map((l) => {
                  const dncBlocked = l.disposition === "DNC" || isPhoneOnDnc(l.phone);
                  return (
                    <tr key={l.id} className="hover:bg-white/[0.03]">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{l.name}</div>
                        <div className="text-[11px] text-gray-400">{l.company}</div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className={dncBlocked ? "text-rose-400 line-through" : "text-cyan-300"}>
                            {l.phone}
                          </span>
                          {dncBlocked && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-sans font-bold">
                              DNC LOCKED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400">{l.email || "—"}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-gray-200">{l.campaign}</div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                          {l.source}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={l.assignedTo}
                          onChange={(e) =>
                            persistLeads(
                              leads.map((x) => (x.id === l.id ? { ...x, assignedTo: e.target.value } : x))
                            )
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
                              leads.map((x) =>
                                x.id === l.id ? { ...x, disposition: e.target.value as LeadDisposition } : x
                              )
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-[#0B1022] border border-white/15 text-[11px] font-bold text-white outline-none"
                        >
                          {ALL_DISPOSITIONS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startCall(l)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                              dncBlocked
                                ? "bg-rose-950/60 border border-rose-500/40 text-rose-300"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white"
                            }`}
                          >
                            <PhoneCall size={12} /> {dncBlocked ? "DNC Blocked" : `Call (${l.callsCount})`}
                          </button>
                          {!dncBlocked && (
                            <button
                              type="button"
                              onClick={() => openWarmTransferModal(l)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-600/25 hover:bg-amber-600/40 border border-amber-500/40 text-amber-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Warm Transfer to Senior Closer"
                            >
                              <ArrowRightLeft size={12} /> Transfer
                            </button>
                          )}
                          {l.phone !== "N/A" && !dncBlocked && (
                            <a
                              href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-emerald-300"
                            >
                              <MessageSquare size={13} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FRONTER -> CLOSER WARM TRANSFERS */}
      {activeTab === "transfers" && (
        <div className="space-y-4">
          <div className="beraxis-glass-dock p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-amber-400" /> Fronter → Senior Closer Warm Transfer Desk
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Fronters qualify prospects and warm-transfer live calls here. When a Closer marks a deal Closed Won, Beraxis automatically posts a confirmed Sales Order &amp; Paid Invoice in <Link href="/sales" className="text-emerald-400 underline">/sales</Link>!
              </p>
            </div>
            <Link
              href="/sales"
              className="px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
            >
              <DollarSign size={14} /> View Closer Deals in Sales Hub →
            </Link>
          </div>

          {transfers.length === 0 ? (
            <div className="beraxis-glass-dock p-10 text-center space-y-3">
              <p className="text-sm font-bold text-white">No Warm Transfers in Queue Yet</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Click <strong>Transfer</strong> next to any lead on the Lead Sheet (or inside the Live Call window) to hand off a qualified prospect to a Senior Closer.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transfers.map((tr) => (
                <div key={tr.id} className="beraxis-glass-dock p-5 space-y-3 border border-white/10">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 font-bold">{tr.id} • {tr.campaign}</span>
                      <h3 className="text-base font-black text-white mt-0.5">{tr.leadName}</h3>
                      <div className="text-xs text-cyan-300 font-mono">{tr.phone} • {tr.company}</div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        tr.status === "Closed Won"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {tr.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-black/30 rounded-xl p-3 text-xs border border-white/5">
                    <div>
                      <span className="text-gray-400 text-[10px] block">Fronter → Closer</span>
                      <span className="font-bold text-white">{tr.fronterAgent} → {tr.closerAgent}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">Carrier / Package &amp; Value</span>
                      <span className="font-bold text-emerald-400">
                        {tr.carrierOrProduct} (${Number(tr.estimatedValue || 0).toLocaleString()})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 bg-white/5 rounded-xl p-2.5">
                    <strong>Fronter Verification Notes:</strong> {tr.qualificationNotes}
                  </p>

                  {tr.status === "Closed Won" ? (
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <span className="text-emerald-400 font-bold">
                        ✅ Synced to Sales Order: {tr.salesOrderRef}
                      </span>
                      <Link href="/sales" className="text-purple-300 underline font-bold">
                        Open in /sales →
                      </Link>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setClosingTransfer(tr);
                          setCloseDealValue(String(tr.estimatedValue || 1200));
                          setCloseCarrier(tr.carrierOrProduct || "");
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 size={14} /> Claim &amp; Close Won → Push to Sales
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INBOUND ACD & IVR ROUTING */}
      {activeTab === "acd" && (
        <div className="space-y-4">
          <div className="beraxis-glass-dock p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <PhoneIncoming size={18} className="text-cyan-400" /> Inbound IVR Tree &amp; Automatic Call Distribution (ACD)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Configure IVR keypress routing (Press 1 / 2 / 3), skill-based queues, SLA targets (80% answered within 20s), and test live Inbound Screen-Pop.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {acdQueues.map((q) => (
              <div key={q.id} className="beraxis-glass-dock p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-black">
                      IVR Digit #{q.ivrDigit}
                    </span>
                    <span className="text-[11px] text-emerald-300 font-bold">{q.routingStrategy}</span>
                  </div>
                  <h3 className="text-base font-black text-white">{q.name}</h3>
                  <p className="text-xs text-gray-400">Skill Group: <strong className="text-gray-200">{q.skillGroup}</strong></p>

                  <div className="grid grid-cols-3 gap-2 bg-black/30 rounded-xl p-3 text-center text-xs border border-white/5">
                    <div>
                      <div className="text-[10px] text-gray-400">SLA Target</div>
                      <div className="font-black text-cyan-300">{q.slaTargetPct}%/{q.slaSeconds}s</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400">Answered</div>
                      <div className="font-black text-emerald-400">{q.callsAnswered}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400">Abandoned</div>
                      <div className="font-black text-rose-400">{q.callsAbandoned}</div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSimulateInboundCall(q)}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PhoneIncoming size={14} /> Simulate Inbound Screen-Pop
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DNC COMPLIANCE SHIELD */}
      {activeTab === "dnc" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <form onSubmit={handleAddDnc} className="lg:col-span-4 beraxis-glass-dock p-5 space-y-3 text-xs h-fit">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-400" /> Register Do-Not-Call Number
            </h3>
            <p className="text-[11px] text-gray-400">
              Numbers added here are blocked across manual dialing, campaign auto-dialing, CSV imports, and warm transfers (TCPA / TSR Shield).
            </p>
            <input
              required
              value={newDncPhone}
              onChange={(e) => setNewDncPhone(e.target.value)}
              placeholder="Phone Number (e.g. +1-555-0142) *"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
            />
            <select
              value={newDncSource}
              onChange={(e) => setNewDncSource(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B1022] border border-white/15 text-white"
            >
              <option value="Customer Opt-Out">Customer Verbal Opt-Out</option>
              <option value="Federal / National DNC">Federal / National DNC List</option>
              <option value="Litigator Shield">Known TCPA Litigator Shield</option>
              <option value="Supervisor Block">Supervisor Block</option>
            </select>
            <input
              value={newDncReason}
              onChange={(e) => setNewDncReason(e.target.value)}
              placeholder="Reason / Audit Note"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
            >
              Block Number on DNC Shield
            </button>
            <button
              type="button"
              onClick={handleScrubLeadSheetDnc}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-gray-200 font-bold cursor-pointer"
            >
              Scrub Entire Lead Sheet Now
            </button>
          </form>

          <div className="lg:col-span-8 beraxis-glass-dock p-5 space-y-3">
            <h3 className="text-sm font-black text-white">Active DNC Suppression Registry ({dncList.length})</h3>
            {dncList.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">
                No numbers in DNC Registry yet. Disposing any call as &ldquo;DNC&rdquo; or adding a number on the left activates immediate pre-dial blocking.
              </p>
            ) : (
              <div className="space-y-2">
                {dncList.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl bg-black/30 border border-rose-500/25 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-rose-300">{d.phone}</div>
                      <div className="text-[11px] text-gray-400">
                        {d.source} • {d.reason} • Added by {d.addedBy}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDnc(d.id)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[11px] cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: QA COMPLIANCE SCORECARDS */}
      {activeTab === "qa" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <form onSubmit={handleSubmitQa} className="lg:col-span-5 beraxis-glass-dock p-5 space-y-3 text-xs">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Award size={16} className="text-purple-400" /> Audit Call &amp; Grade QA Scorecard
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={qaAgentName}
                onChange={(e) => setQaAgentName(e.target.value)}
                placeholder={`Agent (${currentUserName})`}
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
              />
              <input
                value={qaLeadName}
                onChange={(e) => setQaLeadName(e.target.value)}
                placeholder="Customer / Lead Name"
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
              />
            </div>

            <label className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-bold text-white">Recorded-Line &amp; TCPA Disclosure Stated?</div>
                <div className="text-[10px] text-rose-300">Unchecking triggers automatic 0% Compliance Auto-Fail</div>
              </div>
              <input
                type="checkbox"
                checked={qaDisclosurePass}
                onChange={(e) => setQaDisclosurePass(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
            </label>

            {[
              { key: "disclosure", label: "1. Opening & Compliance Disclosure (Max 25)", max: 25 },
              { key: "verification", label: "2. Identity & Eligibility Verification (Max 15)", max: 15 },
              { key: "scriptAdherence", label: "3. Pitch & Discovery Adherence (Max 20)", max: 20 },
              { key: "objectionEmpathy", label: "4. Objection Handling & Tone (Max 20)", max: 20 },
              { key: "crmHygiene", label: "5. Accurate Disposition & CRM Notes (Max 20)", max: 20 },
            ].map((crit) => (
              <div key={crit.key} className="flex items-center justify-between gap-2">
                <span className="text-gray-300">{crit.label}</span>
                <input
                  type="number"
                  min={0}
                  max={crit.max}
                  value={(qaScores as any)[crit.key]}
                  onChange={(e) =>
                    setQaScores({ ...qaScores, [crit.key]: Math.min(crit.max, Math.max(0, Number(e.target.value))) })
                  }
                  className="w-16 px-2 py-1 rounded-lg bg-black/40 border border-white/15 text-right font-bold text-cyan-300"
                />
              </div>
            ))}

            <textarea
              rows={2}
              value={qaNotes}
              onChange={(e) => setQaNotes(e.target.value)}
              placeholder="QA coaching feedback..."
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
            >
              Submit QA Evaluation
            </button>
          </form>

          <div className="lg:col-span-7 beraxis-glass-dock p-5 space-y-3">
            <h3 className="text-sm font-black text-white">Completed QA Evaluations ({qaScorecards.length})</h3>
            {qaScorecards.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No QA scorecards submitted yet.</p>
            ) : (
              <div className="space-y-2.5">
                {qaScorecards.map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        {q.agentName} — Call with {q.leadName}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {q.id} • Reviewed by {q.reviewer} {q.notes ? `• "${q.notes}"` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-cyan-300">{q.totalScore}%</div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          q.outcome === "Passed"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : q.outcome === "Compliance Auto-Fail"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {q.outcome}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: LIVE FLOOR WALLBOARD & SUPERVISOR MONITOR */}
      {activeTab === "wallboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Service Level (80/20)", val: "88.4%", color: "text-emerald-400" },
              { label: "Avg Handle Time (AHT)", val: "03m 42s", color: "text-cyan-300" },
              { label: "First Call Resolution", val: "84.0%", color: "text-purple-300" },
              { label: "Agent Occupancy", val: "81.5%", color: "text-amber-300" },
              { label: "Abandonment Rate", val: `${abandonmentPct}%`, color: "text-emerald-300" },
              {
                label: "Transfer → Close %",
                val:
                  transfers.length > 0
                    ? `${Math.round((closedWonTransfers.length / transfers.length) * 100)}%`
                    : "42%",
                color: "text-emerald-400",
              },
            ].map((m) => (
              <div key={m.label} className="beraxis-glass-dock p-4 text-center">
                <div className="text-[10px] uppercase font-bold text-gray-400">{m.label}</div>
                <div className={`text-2xl font-black mt-1 ${m.color}`}>{m.val}</div>
              </div>
            ))}
          </div>

          <div className="beraxis-glass-dock p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Radio size={16} className="text-emerald-400" /> Live Agent Floor Matrix &amp; Supervisor Whisper / Barge
              </h3>
              {supervisorMode && (
                <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-400 text-purple-200 text-xs font-bold">
                  Active Supervisor Session: {supervisorMode}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(floorAgents.length > 0
                ? floorAgents
                : [
                    {
                      email: currentUserEmail || "agent@workspace",
                      name: currentUserName,
                      role: bpoDeskRole,
                      auxState,
                      activeLeadName: activeCallLead?.name || "Ready for next call",
                    },
                    {
                      email: "closer.desk@workspace",
                      name: "jordan.closer",
                      role: "Closer",
                      auxState: "On Call",
                      activeLeadName: "Marcus Vance (Warm Transfer)",
                    },
                    {
                      email: "inbound.acd@workspace",
                      name: "sara.acd",
                      role: "Inbound Support",
                      auxState: "Available",
                      activeLeadName: "IVR Queue #2",
                    },
                  ]
              ).map((ag: any) => (
                <div key={ag.email} className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{ag.name}</div>
                      <div className="text-[11px] text-gray-400">{ag.role}</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      {ag.auxState}
                    </span>
                  </div>
                  <div className="text-[11px] text-cyan-300 truncate">
                    Activity: {ag.activeLeadName || "Idle / Standing by"}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10">
                    {["Listen", "Whisper", "Barge"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setSupervisorMode(`${mode} → ${ag.name}`);
                          showToast(`Supervisor ${mode} connected to ${ag.name}'s channel.`);
                        }}
                        className="py-1.5 rounded-lg bg-white/5 hover:bg-purple-600/30 border border-white/10 text-[11px] font-bold cursor-pointer"
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CAMPAIGNS */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          <div className="beraxis-glass-dock p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Megaphone size={16} className="text-cyan-400" /> Outbound &amp; Inbound Campaign Dialer Modes
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Launch Predictive, Progressive, Preview, or Inbound campaigns with automated DNC pre-scrubbing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCampaignModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> New Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((camp) => {
              const campLeads = leads.filter((l) => l.campaign === camp.name);
              const campCalls = campLeads.reduce((s, l) => s + (l.callsCount || 0), 0);
              return (
                <div key={camp.id} className="beraxis-glass-dock p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-300 uppercase font-bold">
                          {camp.id} • {camp.mode}
                        </span>
                        <h3 className="text-base font-black text-white mt-0.5">{camp.name}</h3>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                        {camp.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 bg-white/5 rounded-xl p-2.5 text-center mt-3">
                      <div>
                        <div className="text-[10px] text-gray-400">Leads</div>
                        <div className="text-sm font-black text-white">{campLeads.length}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400">Dials</div>
                        <div className="text-sm font-black text-cyan-300">{campCalls}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleDialNextInCampaign(camp.name)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Dial Next Lead
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        persistCampaigns(
                          campaigns.map((c) =>
                            c.id === camp.id ? { ...c, status: c.status === "Active" ? "Paused" : "Active" } : c
                          )
                        )
                      }
                      className="p-2 rounded-xl bg-white/10 text-amber-300 cursor-pointer"
                    >
                      {camp.status === "Active" ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => persistCampaigns(campaigns.filter((c) => c.id !== camp.id))}
                      className="p-2 rounded-xl bg-rose-500/15 text-rose-300 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 8: CALLBACKS */}
      {activeTab === "callbacks" && (
        <div className="beraxis-glass-dock p-5 space-y-3">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <Clock size={16} /> Scheduled Callbacks Queue ({callbacksDue.length})
          </h3>
          {callbacksDue.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No callbacks scheduled yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {callbacksDue.map((l) => (
                <div
                  key={l.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-white text-sm">
                      {l.name} · <span className="text-cyan-300 font-mono text-xs">{l.phone}</span>
                    </div>
                    <div className="text-xs text-amber-300 mt-1">
                      Due: {l.callbackAt ? l.callbackAt.replace("T", " ") : "Today"}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">{l.notes}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startCall(l)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Call Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="beraxis-glass-dock p-5 space-y-4">
          <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
            <Trophy size={16} /> Fronter &amp; Closer Leaderboard
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {leaderboard.map((row, idx) => (
              <div key={row.agent} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">#{idx + 1}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    {row.qualified + row.won} Transfers / Wins
                  </span>
                </div>
                <div className="font-bold text-white text-sm truncate">{row.agent}</div>
                <div className="text-xs text-gray-400">
                  Dials Logged: <strong className="text-white">{row.calls}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: ACCESS CONTROL */}
      {activeTab === "access" && isManagerOrOwner && (
        <div className="beraxis-glass-dock p-6 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" /> Floor &amp; Lead Sheet Access Control
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="p-4 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-bold text-white">Restrict Floor to Selected Agents Only</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Block non-selected staff from opening Call Center.</div>
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
                <div className="text-[11px] text-gray-400 mt-0.5">Supervisors see all rows; agents see assigned leads.</div>
              </div>
              <input
                type="checkbox"
                checked={agentOnlyAssigned}
                onChange={(e) => persistAccess(restrictAccess, e.target.checked, allowedEmails)}
                className="w-4 h-4 accent-purple-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* MODAL: WARM TRANSFER HANDOFF */}
      {transferModalLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitWarmTransfer}
            className="bg-[#141C2E] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-300">Fronter → Closer Handoff</span>
                <h3 className="text-base font-black text-white">Warm Transfer: {transferModalLead.name}</h3>
              </div>
              <button type="button" onClick={() => setTransferModalLead(null)}>
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="block text-gray-300 font-bold mb-1">Target Closer / Queue</label>
              <input
                value={xferCloser}
                onChange={(e) => setXferCloser(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Carrier / Product Tier</label>
                <input
                  value={xferCarrier}
                  onChange={(e) => setXferCarrier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-bold mb-1">Est. Contract Value ($)</label>
                <input
                  type="number"
                  value={xferValue}
                  onChange={(e) => setXferValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 font-bold mb-1">Whisper / Qualification Notes for Closer</label>
              <textarea
                rows={3}
                value={xferNotes}
                onChange={(e) => setXferNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTransferModalLead(null)}
                className="px-4 py-2 text-gray-400 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
              >
                Send Warm Transfer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CLOSER CLAIM & CLOSE DEAL -> SYNC TO /SALES */}
      {closingTransfer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCloseTransferDeal}
            className="bg-[#141C2E] border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400">Senior Closer Conversion</span>
                <h3 className="text-base font-black text-white">Close Deal: {closingTransfer.leadName}</h3>
              </div>
              <button type="button" onClick={() => setClosingTransfer(null)}>
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="block text-gray-300 font-bold mb-1">Selected Carrier / Plan / Package</label>
              <input
                required
                value={closeCarrier}
                onChange={(e) => setCloseCarrier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-bold mb-1">Final Approved Deal Amount ($)</label>
              <input
                required
                type="number"
                step="0.01"
                value={closeDealValue}
                onChange={(e) => setCloseDealValue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
              />
            </div>
            <p className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
              Confirming this deal marks the transfer <strong>Closed Won</strong> and automatically generates an Invoiced Sales Order inside your isolated <strong>/sales</strong> hub.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClosingTransfer(null)}
                className="px-4 py-2 text-gray-400 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
              >
                Confirm Closed Won &amp; Create Sales Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CREATE CAMPAIGN */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="beraxis-glass-hero max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Launch Call Center Campaign</h3>
              <button type="button" onClick={() => setIsCampaignModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <input
                required
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="Campaign Name *"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newCampaign.mode}
                  onChange={(e) => setNewCampaign({ ...newCampaign, mode: e.target.value as any })}
                  className="px-3 py-2 rounded-xl bg-[#0B1022] border border-white/15 text-white"
                >
                  <option value="Predictive Dialer">Predictive Dialer</option>
                  <option value="Progressive Dialer">Progressive Dialer</option>
                  <option value="Preview Dialer">Preview Dialer</option>
                  <option value="Inbound Queue">Inbound Queue</option>
                  <option value="Callback Recovery">Callback Recovery</option>
                </select>
                <input
                  type="number"
                  min={1}
                  value={newCampaign.dailyGoal}
                  onChange={(e) => setNewCampaign({ ...newCampaign, dailyGoal: Number(e.target.value) })}
                  className="px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold cursor-pointer"
              >
                Create &amp; Activate Campaign
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GOOGLE SHEETS SYNC */}
      {isSheetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleGoogleSheetSync}
            className="bg-[#141C2E] border border-white/20 rounded-3xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-400" /> Sync Google Sheets Lead List
              </h3>
              <button type="button" onClick={() => setIsSheetModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <input
              type="url"
              required
              value={googleSheetUrl}
              onChange={(e) => setGoogleSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
            />
            {sheetError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl">
                {sheetError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsSheetModalOpen(false)} className="px-4 py-2 text-xs text-gray-400">
                Cancel
              </button>
              <button
                type="submit"
                disabled={syncingSheet}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
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
          <form
            onSubmit={handleAddLead}
            className="bg-[#141C2E] border border-white/20 rounded-3xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold">Add Call Center Lead</h3>
              <button type="button" onClick={() => setIsAddLeadOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                required
                placeholder="Full Name *"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
              />
              <input
                type="tel"
                placeholder="Phone / WhatsApp"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
              />
              <input
                type="email"
                placeholder="Email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Company"
                value={newLead.company}
                onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Campaign"
                value={newLead.campaign}
                onChange={(e) => setNewLead({ ...newLead, campaign: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddLeadOpen(false)} className="px-4 py-2 text-xs text-gray-400">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 text-xs font-bold text-white cursor-pointer">
                Save Lead
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: LIVE CALL SESSION + WARM TRANSFER BUTTON */}
      {activeCallLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141C2E] border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="text-[10px] font-bold uppercase text-emerald-400">
                  Live Call · AUX: ON CALL
                </div>
                <h3 className="text-lg font-black text-white">{activeCallLead.name}</h3>
                <div className="text-xs text-cyan-300 font-mono">
                  {activeCallLead.phone} · {activeCallLead.company}
                </div>
              </div>
              <div className="text-2xl font-mono font-black text-emerald-400">
                {String(Math.floor(callSeconds / 60)).padStart(2, "0")}:
                {String(callSeconds % 60).padStart(2, "0")}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {activeCallLead.phone !== "N/A" && (
                <a
                  href={`tel:${activeCallLead.phone}`}
                  className="py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <PhoneCall size={13} /> SIP / Softphone Dial
                </a>
              )}
              <button
                type="button"
                onClick={() => openWarmTransferModal(activeCallLead)}
                className="py-2 rounded-xl bg-amber-600/25 hover:bg-amber-600/40 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowRightLeft size={13} /> Warm Transfer to Closer
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">Call Disposition</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {ALL_DISPOSITIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setCallOutcome(o)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border cursor-pointer ${
                        callOutcome === o
                          ? "bg-purple-600 border-purple-400 text-white"
                          : "bg-white/5 border-white/10 text-gray-300"
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
                <label className="text-[11px] font-bold text-gray-400 block mb-1">Call &amp; Verification Notes</label>
                <textarea
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Eligibility, carrier interest, budget, next steps..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveCallLead(null);
                  handleSetAux("Available");
                }}
                className="px-4 py-2 text-xs text-gray-400 font-bold flex items-center gap-1 cursor-pointer"
              >
                <PhoneOff size={13} /> Hang Up
              </button>
              <button
                type="button"
                onClick={completeCallLog}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={14} /> Complete &amp; Enter ACW Wrap-Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
