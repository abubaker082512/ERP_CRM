"use client";

import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import {
  Users,
  Building2,
  Shield,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  GitBranch,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Briefcase,
  Layers,
  Crown,
  KeyRound,
  Network
} from "lucide-react";
import Link from "next/link";
import { 
  TeamMember, 
  CompanyEntity, 
  MultiCompanyQuota, 
  FreelancerContractor, 
  TeamInvitation, 
  Role,
  CustomRoleDefinition
} from "@/lib/teamTypes";
import { 
  INITIAL_QUOTA, 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_CONTRACTORS, 
  INITIAL_INVITATIONS, 
  ALL_SYSTEM_MODULES, 
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_CUSTOM_ROLES
} from "@/lib/teamStorage";
import { useBranchContext } from "@/lib/branchContext";
import {
  buildOrgTree,
  generate50UserHierarchySample,
  getDefaultDataScopeForRole,
  OrgTreeNode,
  parseBulkUsersCsv,
  wouldCreateCycle,
} from "@/lib/hierarchyUtils";
import { UploadCloud, ChevronDown } from "lucide-react";

function OrgTreeBranch({
  node,
  expandedIds,
  onToggle,
}: {
  node: OrgTreeNode;
  expandedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds[node.member.id] ?? node.depth < 2;
  const scope = node.member.dataScope || getDefaultDataScopeForRole(node.member.role);

  return (
    <div className={node.depth > 0 ? "ml-5 sm:ml-8 pl-4 border-l border-slate-700/80 space-y-2.5" : "space-y-2.5"}>
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-purple-500/40 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggle(node.member.id)}
              className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-purple-600/30 text-slate-300 flex items-center justify-center shrink-0 cursor-pointer"
              title={isExpanded ? "Collapse team" : "Expand team"}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-500 shrink-0">
              •
            </span>
          )}
          <div className={`w-8 h-8 rounded-full ${node.member.avatarBg || "bg-indigo-600"} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
            {node.member.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
              {node.member.name}
              {node.member.role === "Owner" && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {node.member.role} · {node.member.department} · <span className="font-mono">{node.member.email}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className={`px-2 py-0.5 rounded-full border uppercase ${
            scope === "company"
              ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
              : scope === "team"
              ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
              : "bg-slate-800 text-slate-300 border-slate-700"
          }`}>
            Scope: {scope}
          </span>
          {hasChildren && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {node.directCount} direct · {node.totalSubordinates} total reports
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-2.5 pt-1">
          {node.children.map((child) => (
            <OrgTreeBranch key={child.member.id} node={child} expandedIds={expandedIds} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeamManagementPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const activeCompanyId = activeBranch?.id || "CMP-001";
  const [quota, setQuota] = useState<MultiCompanyQuota>({ ...INITIAL_QUOTA, totalSeats: 60 });
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [contractors, setContractors] = useState<FreelancerContractor[]>(INITIAL_CONTRACTORS);
  const [invitations, setInvitations] = useState<TeamInvitation[]>(INITIAL_INVITATIONS);
  
  const [activeTab, setActiveTab] = useState<"members" | "orgchart" | "companies" | "matrix" | "contractors">("members");
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedOrgIds, setExpandedOrgIds] = useState<Record<string, boolean>>({});
  const [editingSupervisorId, setEditingSupervisorId] = useState<string | null>(null);
  
  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState(
    "Name,Email,Role,Department,ReportsToEmail\nVP Sales,vp.sales@company.com,Admin,Sales & CRM,ceo@company.com\nSales Manager,sales.mgr@company.com,Manager,Sales & CRM,vp.sales@company.com\nSales Rep 1,rep1@company.com,Specialist,Sales & CRM,sales.mgr@company.com"
  );
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [isCustomRoleOpen, setIsCustomRoleOpen] = useState(false);
  const [isBuySeatsOpen, setIsBuySeatsOpen] = useState(false);
  const [isNewCompanyOpen, setIsNewCompanyOpen] = useState(false);
  const [selectedMemberForRevoke, setSelectedMemberForRevoke] = useState<TeamMember | null>(null);

  // Custom Roles State
  const [customRoles, setCustomRoles] = useState<CustomRoleDefinition[]>(DEFAULT_CUSTOM_ROLES);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleModules, setNewRoleModules] = useState<string[]>(["pos", "sales"]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("beraxis_custom_roles");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setCustomRoles(parsed);
      }
    } catch {}
  }, []);

  // Load persisted company hierarchy members from API + localStorage
  useEffect(() => {
    const storageKey = getEntityStorageKey("team_members");
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) setMembers(parsed);
      }
    } catch {}

    fetch(`/api/team/members?company_id=${encodeURIComponent(activeCompanyId)}&limit=200`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.allMembers) && data.allMembers.length > 0) {
          setMembers(data.allMembers);
          try {
            localStorage.setItem(storageKey, JSON.stringify(data.allMembers));
          } catch {}
        }
      })
      .catch(() => {});

    // Load persisted company seat pool quota (50, 100, 200, 500 seats)
    const quotaKey = getEntityStorageKey("team_quota");
    try {
      const cachedQuota = localStorage.getItem(quotaKey);
      if (cachedQuota) {
        const pq = JSON.parse(cachedQuota);
        if (pq?.totalSeats) setQuota((prev) => ({ ...prev, ...pq }));
      }
    } catch {}
    fetch(`/api/team/quota?company_id=${encodeURIComponent(activeCompanyId)}`)
      .then((r) => r.json())
      .then((qd) => {
        if (qd?.success && qd.quota?.totalSeats) {
          setQuota((prev) => ({ ...prev, totalSeats: qd.quota.totalSeats, planName: qd.quota.planName || prev.planName }));
          try {
            localStorage.setItem(quotaKey, JSON.stringify({ totalSeats: qd.quota.totalSeats, planName: qd.quota.planName }));
          } catch {}
        }
      })
      .catch(() => {});
  }, [activeCompanyId]);

  // Invite Form State
  const [invName, setInvName] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invRole, setInvRole] = useState<Role>("Specialist");
  const [invDept, setInvDept] = useState("Operations & Sales");
  const [invReportsTo, setInvReportsTo] = useState<string>("USR-001");
  const [invCompanies, setInvCompanies] = useState<string[]>(["CMP-001"]);
  const [invModules, setInvModules] = useState<string[]>(DEFAULT_ROLE_PERMISSIONS["Specialist"]);

  // Seat Purchasing State
  const [buySeatQty, setBuySeatQty] = useState<number>(5);
  const [seatBillingCycle, setSeatBillingCycle] = useState<"annual" | "monthly">("annual");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // New Company Form State
  const [newCompName, setNewCompName] = useState("");
  const [newCompCode, setNewCompCode] = useState("");
  const [newCompIndustry, setNewCompIndustry] = useState("Digital Services");
  const [newCompCurrency, setNewCompCurrency] = useState("USD ($)");

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string } | null>(null);

  const showToast = (title: string, desc: string) => {
    setToastMsg({ title, desc });
    setTimeout(() => setToastMsg(null), 4500);
  };

  // Re-sync quota metrics based on active members
  useEffect(() => {
    const activeMembers = members.filter((m) => m.status !== "deactivated");
    setQuota((prev) => ({
      ...prev,
      assignedSeats: activeMembers.length,
      availableSeats: Math.max(0, prev.totalSeats - activeMembers.length),
    }));
  }, [members]);

  // Handle Role Selection change inside Invite Modal
  const handleRoleSelectionChange = (newRole: Role) => {
    setInvRole(newRole);
    const customDef = customRoles.find((r) => r.name === newRole);
    setInvModules(customDef?.allowedModules || DEFAULT_ROLE_PERMISSIONS[newRole] || ["pos"]);
  };

  // Toggle Module Selection inside Invite Modal
  const toggleModuleSelection = (key: string) => {
    if (invModules.includes("*")) {
      setInvModules([key]);
      return;
    }
    if (invModules.includes(key)) {
      setInvModules(invModules.filter((k) => k !== key));
    } else {
      setInvModules([...invModules, key]);
    }
  };

  // Toggle Company Assignment inside Invite Modal
  const toggleCompanySelection = (compId: string) => {
    if (invCompanies.includes(compId)) {
      if (invCompanies.length > 1) {
        setInvCompanies(invCompanies.filter((id) => id !== compId));
      }
    } else {
      setInvCompanies([...invCompanies, compId]);
    }
  };

  // Submit Invite Member
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invEmail || !invEmail.includes("@")) {
      alert("Please provide a valid company email address.");
      return;
    }

    if (quota.availableSeats <= 0) {
      alert("No available seats! Please buy additional seats or reclaim an existing seat.");
      setIsInviteOpen(false);
      setIsBuySeatsOpen(true);
      return;
    }

    const newMember: TeamMember = {
      id: `USR-${(members.length + 1).toString().padStart(3, "0")}`,
      name: invName.trim() || invEmail.split("@")[0],
      email: invEmail.trim(),
      role: invRole,
      department: invDept,
      companyIds: invCompanies,
      reportsToId: invReportsTo,
      allowedModules: invModules,
      type: "full_time",
      status: "active",
      twoFactorEnabled: false,
      avatarBg: "bg-indigo-600",
      lastActive: "Just now",
      joinedAt: new Date().toISOString().split("T")[0],
      title: `${invRole} (${invDept})`,
    };

    const updatedMembers = [newMember, ...members];
    setMembers(updatedMembers);
    try {
      localStorage.setItem(getEntityStorageKey("team_members"), JSON.stringify(updatedMembers));
    } catch {}
    fetch("/api/team/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: activeCompanyId,
        companyName: activeBranch?.name || "BERAXIS Workspace",
        sendInviteEmail: true,
        ...newMember,
      }),
    }).catch(() => {});
    setIsInviteOpen(false);
    setInvName("");
    setInvEmail("");

    showToast(
      "Seat Assigned & Member Invited!",
      `${newMember.name} (${newMember.email}) has been provisioned. 1 seat allocated.`
    );
  };

  // Seat Reclamation Action (Offboarding an employee - keeps totalSeats pool intact!)
  const handleConfirmRevoke = () => {
    if (!selectedMemberForRevoke) return;
    if (selectedMemberForRevoke.role === "Owner") {
      alert("The primary organization Owner cannot be revoked.");
      setSelectedMemberForRevoke(null);
      return;
    }

    const revoked = selectedMemberForRevoke;
    const memberName = revoked.name;
    // Remove member from active list and persist deactivation so revoked personal emails lose access immediately
    const nextMembers = members.filter((m) => m.id !== revoked.id);
    setMembers(nextMembers);
    try {
      localStorage.setItem(getEntityStorageKey("team_members"), JSON.stringify(nextMembers));
    } catch {}
    fetch("/api/team/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: activeCompanyId,
        id: revoked.id,
        status: "deactivated",
        memberSnapshot: revoked,
      }),
    }).catch(() => {});
    setSelectedMemberForRevoke(null);

    showToast(
      "Seat Successfully Reclaimed!",
      `${memberName}'s access was revoked. Your ${quota.totalSeats}-seat pool stays intact with 1 additional vacant seat ready to assign.`
    );
  };

  // Create New Company Entity (Up to 3 included under Custom tier)
  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;

    if (quota.companies.length >= quota.maxCompanies) {
      alert(`Maximum company limit reached (${quota.maxCompanies} included in Custom Enterprise Plan).`);
      return;
    }

    const newComp: CompanyEntity = {
      id: `CMP-${(quota.companies.length + 1).toString().padStart(3, "0")}`,
      name: newCompName.trim(),
      code: newCompCode.trim().toUpperCase() || `SUB${quota.companies.length + 1}`,
      industry: newCompIndustry,
      currency: newCompCurrency,
      timezone: "UTC-5 (EST / Miami)",
      isPrimary: false,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setQuota({
      ...quota,
      companies: [...quota.companies, newComp],
    });

    setIsNewCompanyOpen(false);
    setNewCompName("");
    setNewCompCode("");

    showToast(
      "New Enterprise Entity Provisioned!",
      `Company '${newComp.name}' added to your 3-company quota.`
    );
  };

  // Purchase Additional Seats via Paddle
  const handlePurchaseSeats = async () => {
    setIsCheckoutLoading(true);
    try {
      const res = await fetch("/api/team/seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: buySeatQty,
          plan: "standard",
          billing: seatBillingCycle,
          customerEmail: "abubaker@galaxy.com",
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to configure checkout");

      // In production Paddle checkout:
      if (typeof window !== "undefined" && (window as any).Paddle) {
        (window as any).Paddle.Checkout.open({
          items: data.items,
          customer: data.customer,
          settings: {
            displayMode: "overlay",
            theme: "dark",
            successUrl: "https://www.beraxis.online/team?payment=success",
          },
        });
      } else {
        const nextTotal = quota.totalSeats + buySeatQty;
        setQuota((prev) => ({
          ...prev,
          totalSeats: nextTotal,
          availableSeats: prev.availableSeats + buySeatQty,
        }));
        try {
          localStorage.setItem(getEntityStorageKey("team_quota"), JSON.stringify({ totalSeats: nextTotal, planName: quota.planName }));
        } catch {}
        fetch("/api/team/quota", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId: activeCompanyId, action: "add_seats", addSeats: buySeatQty }),
        }).catch(() => {});
        showToast(
          "Seat Expansion Complete!",
          `Successfully expanded capacity by +${buySeatQty} seats!`
        );
      }
      setIsBuySeatsOpen(false);
    } catch (err: any) {
      alert(`Error initiating seat checkout: ${err.message}`);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Filtered members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase());

    const matchesCompany =
      companyFilter === "all" || m.companyIds.includes(companyFilter);

    return matchesSearch && matchesCompany;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AppHeader title="Team & Role Management" />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-white px-5 py-4 rounded-xl shadow-2xl flex items-start space-x-3 max-w-md animate-in slide-in-from-bottom duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm text-emerald-300">{toastMsg.title}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toastMsg.desc}</p>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Custom Enterprise Plan ($37.40 / mo)
              </span>
              <span className="text-xs text-slate-400">Master Organization Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Team, Seats & Org Hierarchy
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Multi-company seat provisioning, reporting hierarchies, and guaranteed license reclamation upon offboarding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsBuySeatsOpen(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-indigo-400" />
              Buy More Seats
            </button>
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              Bulk Import (50+)
            </button>
            <button
              onClick={() => setIsCustomRoleOpen(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              + Custom Role
            </button>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Invite Team Member
            </button>
          </div>
        </div>

        {/* Multi-Company & Seat Quota Cockpit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: 3 Companies Included Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                Multi-Company Cap
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {quota.companies.length} of {quota.maxCompanies} Used
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {quota.companies.length} / {quota.maxCompanies} Companies
            </div>
            <p className="text-xs text-slate-400 mb-4">
              <strong>3 Companies Included</strong> in the $37.40 Custom Enterprise plan with shared team access.
            </p>
            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
              <span className="text-slate-400">Available capacity:</span>
              <span className="font-semibold text-emerald-400">
                {quota.maxCompanies - quota.companies.length} Company Slots Open
              </span>
            </div>
          </div>

          {/* Card 2: 5 Bundled User Seats */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                Team Seat Pool
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {quota.assignedSeats} / {quota.totalSeats} Assigned
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {quota.availableSeats} Seats Available
            </div>
            <p className="text-xs text-slate-400 mb-4">
              <strong>5 User Seats Bundled</strong> by default with instant seat reclamation on user removal.
            </p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (quota.assignedSeats / quota.totalSeats) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Card 3: Seat Reclamation Guarantee */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Seat Reclamation Policy
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                100% Guaranteed
              </span>
            </div>
            <div className="text-base font-semibold text-white mb-1">
              Reusable Paid Licenses
            </div>
            <p className="text-xs text-slate-400 mb-3">
              When an employee departs, offboarding them immediately frees their paid seat back to your pool for another team member.
            </p>
            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-400">
              <span>Billing gateway:</span>
              <span className="text-slate-200 font-medium">Creem / Paddle (Active)</span>
            </div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab("members")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "members"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Team Members ({members.length})
          </button>

          <button
            onClick={() => setActiveTab("orgchart")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "orgchart"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="w-4 h-4" />
            Interactive Org Hierarchy Chart
          </button>

          <button
            onClick={() => setActiveTab("companies")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "companies"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Multi-Company Workspaces ({quota.companies.length}/3)
          </button>

          <button
            onClick={() => setActiveTab("matrix")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "matrix"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-4 h-4" />
            Role & Module Permissions Matrix
          </button>
        </div>

        {/* TAB 1: MEMBERS ROSTER */}
        {activeTab === "members" && (
          <div className="space-y-4">
            
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter by name, email, role, or dept..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All 3 Included Companies</option>
                  {quota.companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Member & Credentials</th>
                      <th className="py-3.5 px-4 font-semibold">Role</th>
                      <th className="py-3.5 px-4 font-semibold">Reports To</th>
                      <th className="py-3.5 px-4 font-semibold">Assigned Company</th>
                      <th className="py-3.5 px-4 font-semibold">Module Access</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((m) => {
                      const supervisor = members.find((sup) => sup.id === m.reportsToId);
                      const isOwner = m.role === "Owner";

                      return (
                        <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full ${m.avatarBg} flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md`}>
                                {m.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-white flex items-center gap-1.5">
                                  {m.name}
                                  {isOwner && (
                                    <span title="Workspace Owner"><Crown className="w-3.5 h-3.5 text-amber-400 inline" /></span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">{m.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              m.role === "Owner"
                                ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                                : m.role === "Admin"
                                ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                                : m.role === "Manager"
                                ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            }`}>
                              {m.role}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5">{m.department}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            {editingSupervisorId === m.id ? (
                              <select
                                autoFocus
                                value={m.reportsToId || ""}
                                onBlur={() => setEditingSupervisorId(null)}
                                onChange={async (e) => {
                                  const nextSup = e.target.value || null;
                                  setEditingSupervisorId(null);
                                  if (wouldCreateCycle(m.id, nextSup, members)) {
                                    showToast("Invalid Superior", "Cannot assign a subordinate as their own superior (circular reporting loop).");
                                    return;
                                  }
                                  const nextMembers = members.map((x) =>
                                    x.id === m.id ? { ...x, reportsToId: nextSup } : x
                                  );
                                  setMembers(nextMembers);
                                  try {
                                    localStorage.setItem(getEntityStorageKey("team_members"), JSON.stringify(nextMembers));
                                  } catch {}
                                  fetch("/api/team/members", {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ companyId: activeCompanyId, id: m.id, reportsToId: nextSup, memberSnapshot: m }),
                                  }).catch(() => {});
                                  showToast("Reporting Line Updated", `${m.name} now reports to ${members.find((s) => s.id === nextSup)?.name || "Top Level"}.`);
                                }}
                                className="bg-slate-950 border border-purple-500 rounded-lg px-2 py-1 text-[11px] text-slate-200 max-w-[160px] cursor-pointer"
                              >
                                <option value="">Top Level (None)</option>
                                {members
                                  .filter((cand) => cand.id !== m.id && cand.status !== "deactivated")
                                  .map((cand) => (
                                    <option key={cand.id} value={cand.id}>
                                      {cand.name} ({cand.role})
                                    </option>
                                  ))}
                              </select>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setEditingSupervisorId(m.id)}
                                className="flex items-center space-x-1.5 text-slate-300 hover:text-purple-300 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-lg px-2.5 py-1 transition-colors cursor-pointer"
                                title="Click to change superior"
                              >
                                <GitBranch className="w-3 h-3 text-purple-400 shrink-0" />
                                <span className="font-medium text-[11px] truncate max-w-[140px]">
                                  {supervisor ? supervisor.name : "Top Level (None)"}
                                </span>
                              </button>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {m.companyIds.map((cId) => {
                                const comp = quota.companies.find((c) => c.id === cId);
                                return (
                                  <span key={cId} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                                    {comp ? comp.code : cId}
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {m.allowedModules.includes("*") ? (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20 font-semibold">
                                  All 28 Modules Unlocked
                                </span>
                              ) : (
                                m.allowedModules.map((modKey) => (
                                  <span key={modKey} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] border border-indigo-500/20 uppercase font-mono">
                                    {modKey}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {!isOwner ? (
                              <button
                                onClick={() => setSelectedMemberForRevoke(m)}
                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors inline-flex items-center gap-1 text-[11px]"
                                title="Revoke access and return seat to pool"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Reclaim Seat</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Protected</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredMembers.length > 0 && (
                <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <div>
                    Showing <strong className="text-white">{Math.min(filteredMembers.length, (currentPage - 1) * pageSize + 1)}–{Math.min(filteredMembers.length, currentPage * pageSize)}</strong> of <strong className="text-white">{filteredMembers.length}</strong> members
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={pageSize}
                      onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white cursor-pointer"
                    >
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={200}>All (200)</option>
                    </select>
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 cursor-pointer"
                    >
                      Prev
                    </button>
                    <span className="text-xs font-mono text-white">Page {currentPage} / {Math.max(1, Math.ceil(filteredMembers.length / pageSize))}</span>
                    <button
                      type="button"
                      disabled={currentPage >= Math.ceil(filteredMembers.length / pageSize)}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE RECURSIVE ORG CHART HIERARCHY (50+ Users) */}
        {activeTab === "orgchart" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-400" />
                  Recursive Corporate Reporting Tree ({members.filter((m) => m.status !== "deactivated").length} Active Staff)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Multi-level reporting tree dictating subordinate-to-superior approvals, team visibility (`own` / `team` / `company`), and KPI rollups.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allMap: Record<string, boolean> = {};
                    members.forEach((m) => { allMap[m.id] = true; });
                    setExpandedOrgIds(allMap);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const allMap: Record<string, boolean> = {};
                    members.forEach((m) => { allMap[m.id] = false; });
                    setExpandedOrgIds(allMap);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {buildOrgTree(members).map((rootNode) => (
                <OrgTreeBranch
                  key={rootNode.member.id}
                  node={rootNode}
                  expandedIds={expandedOrgIds}
                  onToggle={(id) =>
                    setExpandedOrgIds((prev) => ({
                      ...prev,
                      [id]: !(prev[id] ?? true),
                    }))
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MULTI-COMPANY WORKSPACES */}
        {activeTab === "companies" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Multi-Company Entities ({quota.companies.length} of {quota.maxCompanies} Included)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your $37.40 Custom Enterprise plan includes 3 distinct companies under one unified login.
                </p>
              </div>

              {quota.companies.length < quota.maxCompanies && (
                <button
                  onClick={() => setIsNewCompanyOpen(true)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Subsidiary Entity
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {quota.companies.map((c) => (
                <div key={c.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {c.code}
                    </span>
                    {c.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Primary HQ
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white">{c.name}</h4>

                  <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <div className="flex justify-between">
                      <span>Industry:</span>
                      <span className="text-slate-200">{c.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Currency:</span>
                      <span className="text-slate-200">{c.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timezone:</span>
                      <span className="text-slate-200">{c.timezone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ROLE & MODULE PERMISSIONS MATRIX */}
        {activeTab === "matrix" && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60">
              <h3 className="text-sm font-semibold text-white">Default Role Permissions Matrix</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Module authorization rules applied when assigning roles to new users.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Business Module</th>
                    <th className="py-3 px-4 font-semibold text-center">Owner</th>
                    <th className="py-3 px-4 font-semibold text-center">Admin</th>
                    <th className="py-3 px-4 font-semibold text-center">Manager</th>
                    <th className="py-3 px-4 font-semibold text-center">Specialist</th>
                    <th className="py-3 px-4 font-semibold text-center">Accountant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ALL_SYSTEM_MODULES.map((mod) => (
                    <tr key={mod.key} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-medium text-white">
                        {mod.name}
                        <span className="ml-2 text-[10px] text-slate-500 font-mono">[{mod.category}]</span>
                      </td>

                      {["Owner", "Admin", "Manager", "Specialist", "Accountant"].map((roleName) => {
                        const perms = DEFAULT_ROLE_PERMISSIONS[roleName as Role] || [];
                        const hasAccess = perms.includes("*") || perms.includes(mod.key);

                        return (
                          <td key={roleName} className="py-3 px-4 text-center">
                            {hasAccess ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-slate-600 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: BULK CSV IMPORT (50+ USERS) */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-emerald-400" />
                  Bulk Import 50+ Users &amp; Reporting Hierarchy (CSV)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paste CSV rows (`Name,Email,Role,Department,ReportsToEmail`) or seed a realistic 50-user 4-level company hierarchy.
                </p>
              </div>
              <button onClick={() => setIsBulkImportOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={7}
              value={bulkCsvText}
              onChange={(e) => setBulkCsvText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:border-emerald-500 outline-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isBulkSubmitting}
                onClick={async () => {
                  setIsBulkSubmitting(true);
                  const demo50 = generate50UserHierarchySample(
                    activeCompanyId,
                    activeBranch?.name ? `${activeBranch.name} CEO` : "Company CEO",
                    "ceo@company.com"
                  );
                  setMembers(demo50);
                  setQuota((prev) => ({ ...prev, totalSeats: Math.max(prev.totalSeats, 55) }));
                  try {
                    localStorage.setItem(getEntityStorageKey("team_members"), JSON.stringify(demo50));
                  } catch {}
                  await fetch("/api/team/members", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ companyId: activeCompanyId, bulk: demo50 }),
                  }).catch(() => {});
                  setIsBulkSubmitting(false);
                  setIsBulkImportOpen(false);
                  setActiveTab("orgchart");
                  showToast("50-User Hierarchy Seeded!", "1 CEO → 3 VPs → 7 Managers → 39 Staff loaded into Recursive Org Tree.");
                }}
                className="px-3.5 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold cursor-pointer"
              >
                ⚡ Load 50-User Demo Org (4 Levels)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkImportOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isBulkSubmitting}
                  onClick={async () => {
                    const parsed = parseBulkUsersCsv(bulkCsvText);
                    if (parsed.length === 0) {
                      showToast("No valid CSV rows found", "Format: Name,Email,Role,Department,ReportsToEmail");
                      return;
                    }
                    setIsBulkSubmitting(true);
                    try {
                      const res = await fetch("/api/team/members", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ companyId: activeCompanyId, bulk: parsed }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (Array.isArray(data.members)) {
                        setMembers(data.members);
                        setQuota((prev) => ({ ...prev, totalSeats: Math.max(prev.totalSeats, data.members.length + 5) }));
                        try {
                          localStorage.setItem(getEntityStorageKey("team_members"), JSON.stringify(data.members));
                        } catch {}
                      }
                      setIsBulkImportOpen(false);
                      showToast("Bulk Import Complete!", `Imported ${parsed.length} users with manager reporting links.`);
                    } finally {
                      setIsBulkSubmitting(false);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isBulkSubmitting ? "Importing..." : `Import ${parseBulkUsersCsv(bulkCsvText).length} Users`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: INVITE TEAM MEMBER */}
      {isCustomRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Create Custom Role
              </h3>
              <button onClick={() => setIsCustomRoleOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Role Name *</label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. Warehouse Supervisor"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Allowed Modules</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_SYSTEM_MODULES.map((mod) => {
                  const active = newRoleModules.includes(mod.key);
                  return (
                    <button
                      key={mod.key}
                      type="button"
                      onClick={() =>
                        setNewRoleModules((prev) =>
                          prev.includes(mod.key) ? prev.filter((k) => k !== mod.key) : [...prev, mod.key]
                        )
                      }
                      className={`px-2.5 py-2 rounded-lg text-xs font-medium text-left border transition-colors cursor-pointer ${
                        active
                          ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {active ? "✓ " : "+ "}
                      {mod.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCustomRoleOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmed = newRoleName.trim();
                  if (!trimmed) return;
                  const created: CustomRoleDefinition = {
                    id: `role-${Date.now()}`,
                    name: trimmed,
                    description: "Custom workspace role",
                    color: "cyan",
                    allowedModules: newRoleModules.length > 0 ? newRoleModules : ["pos"],
                    isSystem: false,
                  };
                  const nextRoles = [...customRoles, created];
                  setCustomRoles(nextRoles);
                  try {
                    localStorage.setItem("beraxis_custom_roles", JSON.stringify(nextRoles));
                  } catch {}
                  setInvRole(created.name);
                  setInvModules(created.allowedModules);
                  setNewRoleName("");
                  setIsCustomRoleOpen(false);
                  showToast("Custom Role Created!", `${created.name} is now available to assign to users.`);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
              >
                Save Custom Role
              </button>
            </div>
          </div>
        </div>
      )}

      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Invite Team Member (Assign Paid Seat)
              </h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    value={invName}
                    onChange={(e) => setInvName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="marcus@company.com"
                    value={invEmail}
                    onChange={(e) => setInvEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Role</label>
                  <select
                    value={invRole}
                    onChange={(e) => handleRoleSelectionChange(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {customRoles.filter((r) => r.name !== "Owner").map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} {r.isSystem ? "" : "(Custom)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Reports To (Supervisor)</label>
                  <select
                    value={invReportsTo}
                    onChange={(e) => setInvReportsTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Company Entity Access (Multi-company 3 tier) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Company Entity Access (Pick from your 3 included companies)
                </label>
                <div className="flex flex-wrap gap-2">
                  {quota.companies.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCompanySelection(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        invCompanies.includes(c.id)
                          ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      {c.name} ({c.code})
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Access Checkboxes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Allowed Module Access
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-36 overflow-y-auto">
                  {ALL_SYSTEM_MODULES.map((mod) => (
                    <label key={mod.key} className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={invModules.includes("*") || invModules.includes(mod.key)}
                        onChange={() => toggleModuleSelection(mod.key)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                      />
                      <span>{mod.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Allocates <strong>1 of {quota.availableSeats} available seats</strong>
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    className="px-4 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                  >
                    Send Invitation & Assign Seat
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BUY ADDITIONAL SEATS VIA PADDLE */}
      {isBuySeatsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                Buy Additional Team Seats
              </h3>
              <button onClick={() => setIsBuySeatsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Billing Cycle</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSeatBillingCycle("annual")}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      seatBillingCycle === "annual"
                        ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Annual ($1.00 / seat / mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeatBillingCycle("monthly")}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      seatBillingCycle === "monthly"
                        ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Monthly ($5.00 / seat / mo)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Quantity of Additional Seats
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[5, 25, 50, 100, 200, 500].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setBuySeatQty(qty)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        buySeatQty === qty
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                          : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Additional Seats:</span>
                  <span className="font-semibold text-white">+{buySeatQty} seats</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Unit Rate:</span>
                  <span className="font-semibold text-white">
                    {seatBillingCycle === "annual" ? "$1.00 / mo ($12/yr)" : "$5.00 / mo"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Expansion Amount:</span>
                  <span className="text-emerald-400">
                    ${seatBillingCycle === "annual" ? (buySeatQty * 12).toFixed(2) : (buySeatQty * 5).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePurchaseSeats}
                disabled={isCheckoutLoading}
                className="w-full py-3 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                {isCheckoutLoading ? "Opening Paddle Checkout..." : `Pay & Add +${buySeatQty} Seats`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SEAT RECLAMATION CONFIRMATION */}
      {selectedMemberForRevoke && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Revoke User & Reclaim Paid Seat?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to offboard <strong>{selectedMemberForRevoke.name}</strong> ({selectedMemberForRevoke.email})?
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Guaranteed Seat Reclamation
              </div>
              <p>
                Their active session will be terminated immediately. <strong>Their paid seat will be returned to your company pool</strong>, allowing you to invite another employee without any extra charges.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                onClick={() => setSelectedMemberForRevoke(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30"
              >
                Confirm & Reclaim Seat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: NEW COMPANY SUBSIDIARY */}
      {isNewCompanyOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Add Subsidiary Company ({quota.companies.length + 1} of {quota.maxCompanies})
              </h3>
              <button onClick={() => setIsNewCompanyOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Company Entity Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Logistics Europe"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Company Code</label>
                  <input
                    type="text"
                    required
                    placeholder="ALE"
                    value={newCompCode}
                    onChange={(e) => setNewCompCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Base Currency</label>
                  <select
                    value={newCompCurrency}
                    onChange={(e) => setNewCompCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="PKR (₨)">PKR (₨)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Primary Industry</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Freight & Logistics"
                  value={newCompIndustry}
                  onChange={(e) => setNewCompIndustry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewCompanyOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                >
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
