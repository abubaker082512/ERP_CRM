"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  PhoneCall,
  X,
  ArrowUp,
  ArrowDown,
  Shield,
  Users,
  Eye,
  FileSpreadsheet,
  Download,
  Search,
  Building2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useBranchContext } from "@/lib/branchContext";
import UniversalBranchSwitcher from "@/components/shared/UniversalBranchSwitcher";
import {
  CALL_CENTER_CARRIERS,
  type PublicFormDef,
  type PublicFormField,
} from "@/app/api/public-forms/route";

export default function PublicFormsPage() {
  const { branches, activeBranch, getEntityStorageKey } = useBranchContext();
  const companyId = activeBranch?.id || "CMP-001";
  const companyName = activeBranch?.name || "Beraxis Workspace";

  const [forms, setForms] = useState<PublicFormDef[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [companyScope, setCompanyScope] = useState<"all_mine" | "current">("all_mine");
  const [ownerEmail, setOwnerEmail] = useState<string>("");
  const [activeView, setActiveView] = useState<"forms" | "submissions">("forms");
  const [selectedFormFilter, setSelectedFormFilter] = useState<string>("all");
  const [subSearch, setSubSearch] = useState("");
  const [subDateMode, setSubDateMode] = useState<"today" | "all">(
    activeBranch?.industryId === "call_center" ? "today" : "all"
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // Team & Carriers
  const [teamList, setTeamList] = useState<{ id: string; name: string; email?: string }[]>([]);
  const [selectedTeamNames, setSelectedTeamNames] = useState<string[]>([]);
  const [availableCarriers, setAvailableCarriers] = useState<string[]>(CALL_CENTER_CARRIERS);
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>(CALL_CENTER_CARRIERS);
  const [customCarrierInput, setCustomCarrierInput] = useState("");
  const [campaignOptions, setCampaignOptions] = useState<string[]>(["Outbound Campaign", "Inbound Web Form", "Final Expense Quote"]);
  const [stageOptions, setStageOptions] = useState<string[]>(["New", "Qualified", "Proposition", "Won", "Lost"]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>(["Outbound Sales", "Inbound Support", "Quality Assurance", "Operations"]);

  // Form Builder State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("Leave your details and our team will call you back shortly.");
  const [campaign, setCampaign] = useState("Inbound Web Form");
  const [submitLabel, setSubmitLabel] = useState("Submit Request");
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<PublicFormField[]>([
    { id: "name", label: "Full Name", type: "text", required: true, placeholder: "Your full name" },
    { id: "phone", label: "Phone / WhatsApp", type: "tel", required: true, placeholder: "+1 555-0199" },
    { id: "email", label: "Work Email", type: "email", required: false, placeholder: "you@company.com" },
    { id: "carrier", label: "Insurance Carrier", type: "carriers_dropdown", required: false, options: CALL_CENTER_CARRIERS },
    { id: "team_member", label: "Assigned Agent / Closer", type: "team_dropdown", required: false, options: [] },
    { id: "notes", label: "Notes / Requirements", type: "textarea", required: false, placeholder: "How can we help?" },
  ]);

  // Load company team members
  useEffect(() => {
    const DUMMY = new Set(["abubaker@galaxy.com", "elena.rostova@galaxy.com", "alex.vance@galaxy.com", "sarah.j@galaxy.com"]);
    let me = { name: "Workspace Owner", email: "" };
    try {
      const rawU = localStorage.getItem("user");
      if (rawU) {
        const u = JSON.parse(rawU);
        me = { name: u.name || u.email?.split("@")[0] || "Workspace Owner", email: u.email || "" };
        if (u.email) setOwnerEmail(String(u.email).trim().toLowerCase());
      }
    } catch {}

    let localTeam: { id: string; name: string; email?: string }[] = [];
    try {
      const raw = localStorage.getItem(getEntityStorageKey("team_members"));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          localTeam = parsed
            .filter((m: any) => !DUMMY.has((m.email || "").toLowerCase()) || me.email.toLowerCase() === "abubaker@galaxy.com")
            .map((m: any) => ({ id: m.id, name: m.name, email: m.email }));
        }
      }
    } catch {}

    if (localTeam.length === 0) localTeam = [{ id: "USR-001", name: me.name, email: me.email }];
    setTeamList(localTeam);
    setSelectedTeamNames(localTeam.map((t) => t.name));

    fetch(`/api/team/members?company_id=${encodeURIComponent(companyId)}&owner_name=${encodeURIComponent(me.name)}&owner_email=${encodeURIComponent(me.email)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.allMembers) && d.allMembers.length > 0) {
          const clean = d.allMembers
            .filter((m: any) => !DUMMY.has((m.email || "").toLowerCase()) || me.email.toLowerCase() === "abubaker@galaxy.com")
            .map((m: any) => ({ id: m.id, name: m.name, email: m.email }));
          if (clean.length > 0) {
            setTeamList(clean);
            setSelectedTeamNames(clean.map((t: any) => t.name));
          }
        }
      })
      .catch(() => {});

    // Load system Campaigns, CRM Stages, and Departments for form field dropdowns
    try {
      const rawCamps = localStorage.getItem(getEntityStorageKey("call_center_campaigns"));
      if (rawCamps) {
        const parsed = JSON.parse(rawCamps);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCampaignOptions(parsed.map((c: any) => c.name).filter(Boolean));
        }
      }
      const rawStages = localStorage.getItem(getEntityStorageKey("crm_stages"));
      if (rawStages) {
        const parsed = JSON.parse(rawStages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStageOptions(parsed.map((s: any) => s.name).filter(Boolean));
        }
      }
      const rawEmps = localStorage.getItem(getEntityStorageKey("employees"));
      if (rawEmps) {
        const parsed = JSON.parse(rawEmps);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const depts = Array.from(new Set(parsed.map((e: any) => e.department).filter(Boolean))) as string[];
          if (depts.length > 0) setDepartmentOptions(depts);
        }
      }
    } catch {}
  }, [companyId]);

  const loadForms = async () => {
    const localKey = getEntityStorageKey("public_forms_list");
    let localForms: PublicFormDef[] = [];
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) localForms = JSON.parse(raw);
    } catch {}
    if (localForms.length > 0 && forms.length === 0) setForms(localForms);

    let resolvedEmail = ownerEmail;
    if (!resolvedEmail && typeof window !== "undefined") {
      try {
        const rawU = localStorage.getItem("user");
        if (rawU) resolvedEmail = (JSON.parse(rawU)?.email || "").trim().toLowerCase();
      } catch {}
    }

    const myCompanyIds =
      companyScope === "all_mine" && branches.length > 0
        ? Array.from(new Set([...branches.map((b) => b.id), companyId])).join(",")
        : companyId;

    try {
      const query =
        companyScope === "all_mine" && branches.length > 0
          ? `company_ids=${encodeURIComponent(myCompanyIds)}&owner_email=${encodeURIComponent(resolvedEmail)}&include_leads=1`
          : `company_id=${encodeURIComponent(companyId)}&owner_email=${encodeURIComponent(resolvedEmail)}&include_leads=1`;

      const res = await fetch(`/api/public-forms?${query}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data?.leads)) {
        setSubmissions(data.leads);
      }
      if (Array.isArray(data?.forms)) {
        const merged = [...data.forms];
        if (companyScope === "current") {
          localForms.forEach((lf) => {
            if (lf.companyId === companyId && !merged.some((mf) => mf.id === lf.id)) {
              merged.push(lf);
            }
          });
        } else {
          localForms.forEach((lf) => {
            if (!merged.some((mf) => mf.id === lf.id)) merged.push(lf);
          });
        }
        setForms(merged);
        try {
          merged.forEach((f) => localStorage.setItem(`beraxis_public_form_${f.id}`, JSON.stringify(f)));
        } catch {}
      }
    } catch {}
  };

  useEffect(() => {
    loadForms();
  }, [companyId, companyScope, branches.length, ownerEmail]);

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const preparedFields = fields.map((fld) => {
        if (fld.type === "carriers_dropdown") return { ...fld, options: selectedCarriers };
        if (fld.type === "team_dropdown") return { ...fld, options: selectedTeamNames };
        if (fld.type === "campaigns_dropdown") return { ...fld, options: campaignOptions };
        if (fld.type === "stages_dropdown") return { ...fld, options: stageOptions };
        if (fld.type === "departments_dropdown") return { ...fld, options: departmentOptions };
        return fld;
      });

      const res = await fetch("/api/public-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          companyName,
          ownerEmail,
          title: title.trim(),
          description: description.trim(),
          campaign: campaign.trim(),
          submitLabel: submitLabel.trim() || "Submit",
          fields: preparedFields,
          carriers: selectedCarriers,
          teamMembers: teamList.filter((t) => selectedTeamNames.includes(t.name)),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.form) {
        const next = [data.form, ...forms.filter((f) => f.id !== data.form.id)];
        setForms(next);
        try {
          localStorage.setItem(getEntityStorageKey("public_forms_list"), JSON.stringify(next));
          localStorage.setItem(`beraxis_public_form_${data.form.id}`, JSON.stringify(data.form));
        } catch {}
        setTitle("");
        setIsBuilderOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteForm = async (id: string) => {
    const next = forms.filter((f) => f.id !== id);
    setForms(next);
    try {
      localStorage.setItem(getEntityStorageKey("public_forms_list"), JSON.stringify(next));
      localStorage.removeItem(`beraxis_public_form_${id}`);
    } catch {}
    await fetch(`/api/public-forms?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  const copyLink = (id: string) => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/f/${id}` : `/f/${id}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= fields.length) return;
    const copy = [...fields];
    const [item] = copy.splice(idx, 1);
    copy.splice(target, 0, item);
    setFields(copy);
  };

  const addFieldByType = (type: PublicFormField["type"], defaultLabel: string) => {
    setFields((prev) => [
      ...prev,
      {
        id: `${type}_${Date.now().toString().slice(-4)}`,
        label: defaultLabel,
        type,
        required: false,
        placeholder: type === "textarea" ? "Enter details..." : "Enter answer...",
        options:
          type === "carriers_dropdown"
            ? selectedCarriers
            : type === "team_dropdown"
            ? selectedTeamNames
            : type === "campaigns_dropdown"
            ? campaignOptions
            : type === "stages_dropdown"
            ? stageOptions
            : type === "departments_dropdown"
            ? departmentOptions
            : type === "select"
            ? ["Option 1", "Option 2"]
            : undefined,
      },
    ]);
  };

  const addCustomCarrier = () => {
    const c = customCarrierInput.trim();
    if (!c) return;
    if (!availableCarriers.includes(c)) setAvailableCarriers((prev) => [c, ...prev]);
    if (!selectedCarriers.includes(c)) setSelectedCarriers((prev) => [c, ...prev]);
    setCustomCarrierInput("");
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (selectedFormFilter !== "all" && s.formId !== selectedFormFilter) return false;
    if (subDateMode === "today") {
      const todayStr = new Date().toISOString().slice(0, 10);
      if ((s.createdAt || "").slice(0, 10) !== todayStr) return false;
    }
    if (subSearch.trim()) {
      const q = subSearch.toLowerCase();
      const hay = `${s.name || ""} ${s.phone || ""} ${s.email || ""} ${s.carrier || ""} ${s.assignedTo || ""} ${s.notes || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const exportSubmissions = (rows: any[], format: "xlsx" | "csv") => {
    if (rows.length === 0) return;
    const flat = rows.map((r) => ({
      Submission_ID: r.id,
      Form: r.source || r.formId,
      Campaign: r.campaign || "",
      Name: r.name || "",
      Phone: r.phone || "",
      Email: r.email || "",
      Carrier: r.carrier || "",
      Assigned_Agent: r.assignedTo || "",
      Notes: r.notes || "",
      Submitted_At: r.createdAt || "",
    }));
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(flat);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Form Submissions");
      XLSX.writeFile(wb, `form_submissions_${stamp}.xlsx`);
    } else {
      const headers = Object.keys(flat[0]);
      const csv = [
        headers.join(","),
        ...flat.map((row) => headers.map((h) => `"${String((row as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form_submissions_${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-white">
      <div className="beraxis-glass-hero p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-300 mb-1">
            <ClipboardList size={14} /> Public Lead-Capture Forms · {companyName}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Public Forms, Carriers &amp; Team Intake</h1>
          <p className="text-xs text-gray-300 mt-1">
            Customize forms with FreeFex Call Center Carriers, Team Member dropdowns, and moveable fields. Submissions route straight to your Lead Sheet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UniversalBranchSwitcher />
          <Link
            href="/call-center"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold flex items-center gap-1.5"
          >
            <PhoneCall size={14} className="text-cyan-300" /> Open Call Center
          </Link>
          <button
            type="button"
            onClick={() => setIsBuilderOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            <Plus size={14} /> Create Public Form
          </button>
        </div>
      </div>

      {/* View Toggle: Forms vs Submissions + Multi-Company Scope Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10 gap-1">
            <button
              type="button"
              onClick={() => setActiveView("forms")}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                activeView === "forms" ? "bg-purple-600 text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              Public Forms ({forms.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView("submissions")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeView === "submissions" ? "bg-emerald-600 text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              <Eye size={13} /> View Submissions ({submissions.length})
            </button>
          </div>

          {branches.length > 1 && (
            <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCompanyScope("all_mine")}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                  companyScope === "all_mine" ? "bg-cyan-600 text-white shadow" : "text-gray-400 hover:text-white"
                }`}
              >
                All My Companies ({branches.length})
              </button>
              <button
                type="button"
                onClick={() => setCompanyScope("current")}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 ${
                  companyScope === "current" ? "bg-cyan-600 text-white shadow" : "text-gray-400 hover:text-white"
                }`}
              >
                <Building2 size={12} /> {companyName} Only
              </button>
            </div>
          )}
        </div>
        {activeView === "submissions" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportSubmissions(filteredSubmissions, "xlsx")}
              disabled={filteredSubmissions.length === 0}
              className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <FileSpreadsheet size={13} /> Export Excel
            </button>
            <button
              type="button"
              onClick={() => exportSubmissions(filteredSubmissions, "csv")}
              disabled={filteredSubmissions.length === 0}
              className="px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        )}
      </div>

      {activeView === "submissions" ? (
        <div className="beraxis-glass-dock p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/15">
              <Search size={14} className="text-gray-400" />
              <input
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder="Search submissions by name, phone, carrier, agent..."
                className="flex-1 bg-transparent text-xs text-white outline-none"
              />
            </div>
            <select
              value={selectedFormFilter}
              onChange={(e) => setSelectedFormFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0B1022] border border-white/15 text-xs text-white"
            >
              <option value="all">All Forms</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
            <select
              value={subDateMode}
              onChange={(e) => setSubDateMode(e.target.value as "today" | "all")}
              className="px-3 py-2 rounded-xl bg-[#0B1022] border border-cyan-500/30 text-xs font-bold text-cyan-300"
            >
              <option value="today">Daily Basis (Today)</option>
              <option value="all">All Dates</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Submitted</th>
                  <th className="py-2.5 px-3">Form / Campaign</th>
                  <th className="py-2.5 px-3">Lead</th>
                  <th className="py-2.5 px-3">Carrier</th>
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubmissions.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.03]">
                    <td className="py-3 px-3 text-gray-400 whitespace-nowrap">
                      {s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-purple-300">{s.source || s.formId}</div>
                      <div className="text-[10px] text-gray-400">{s.campaign}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-[11px] text-cyan-300 font-mono">{s.phone || "—"}</div>
                      <div className="text-[10px] text-gray-400">{s.email || ""}</div>
                    </td>
                    <td className="py-3 px-3 text-emerald-300 font-semibold">{s.carrier || "—"}</td>
                    <td className="py-3 px-3 text-gray-200">{s.assignedTo || "Unassigned"}</td>
                    <td className="py-3 px-3 text-gray-300 max-w-xs truncate">{s.notes || "—"}</td>
                  </tr>
                ))}
                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-400">
                      No submissions found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
      /* Forms Dashboard Grid */
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {forms.map((f) => (
          <div key={f.id} className="beraxis-glass-dock p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {f.campaign}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400">{f.submissionsCount || 0} Submissions</span>
                  {f.id !== "beraxis-callback" && (
                    <button
                      onClick={() => handleDeleteForm(f.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      title="Delete form"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="text-lg font-black text-white">{f.title}</h3>
              <p className="text-xs text-gray-300">{f.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {f.companyName && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25 flex items-center gap-1 font-semibold">
                    <Building2 size={10} /> {f.companyName}
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
                  {(f.carriers || CALL_CENTER_CARRIERS).length} Carriers
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                  {f.fields?.length || 0} Fields
                </span>
              </div>
              <div className="text-[11px] text-gray-400 font-mono bg-black/30 px-3 py-2 rounded-xl border border-white/10 truncate">
                /f/{f.id}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setSelectedFormFilter(f.id);
                  setSubDateMode("all");
                  setActiveView("submissions");
                }}
                className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Eye size={13} /> Submissions
              </button>
              <button
                type="button"
                onClick={() => copyLink(f.id)}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedId === f.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedId === f.id ? "Link Copied!" : "Copy Link"}
              </button>
              <Link
                href={`/f/${f.id}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5"
              >
                <ExternalLink size={14} /> Open
              </Link>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Form Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="beraxis-glass-hero max-w-3xl w-full p-6 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Create Custom Call Center Form</h2>
              <button type="button" onClick={() => setIsBuilderOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateForm} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Form Title *</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Final Expense Quote & Carrier Intake"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Campaign Tag</label>
                  <input
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white outline-none"
                />
              </div>

              {/* Carriers & Team Selector Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* FreeFex / Call Center Carriers */}
                <div className="p-3.5 rounded-2xl bg-black/30 border border-cyan-500/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Shield size={13} /> Call Center Carriers ({selectedCarriers.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCarriers(selectedCarriers.length === availableCarriers.length ? [] : availableCarriers)
                      }
                      className="text-[10px] text-cyan-400 underline cursor-pointer"
                    >
                      {selectedCarriers.length === availableCarriers.length ? "Clear All" : "Select All"}
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      value={customCarrierInput}
                      onChange={(e) => setCustomCarrierInput(e.target.value)}
                      placeholder="Add custom carrier..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomCarrier}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-[11px] font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto grid grid-cols-2 gap-1 text-[11px]">
                    {availableCarriers.map((c) => (
                      <label key={c} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-white/5 cursor-pointer truncate">
                        <input
                          type="checkbox"
                          checked={selectedCarriers.includes(c)}
                          onChange={() =>
                            setSelectedCarriers((prev) =>
                              prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                            )
                          }
                          className="accent-cyan-500"
                        />
                        <span className="truncate">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Team Dropdown Selector */}
                <div className="p-3.5 rounded-2xl bg-black/30 border border-purple-500/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Users size={13} /> Team Members Dropdown ({selectedTeamNames.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTeamNames(selectedTeamNames.length === teamList.length ? [] : teamList.map((t) => t.name))
                      }
                      className="text-[10px] text-purple-300 underline cursor-pointer"
                    >
                      {selectedTeamNames.length === teamList.length ? "Clear All" : "Select All"}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Selected team members appear in the form&apos;s Team / Agent dropdown.
                  </p>
                  <div className="max-h-36 overflow-y-auto space-y-1 text-[11px]">
                    {teamList.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTeamNames.includes(m.name)}
                          onChange={() =>
                            setSelectedTeamNames((prev) =>
                              prev.includes(m.name) ? prev.filter((x) => x !== m.name) : [...prev, m.name]
                            )
                          }
                          className="accent-purple-500"
                        />
                        <span className="font-semibold text-white">{m.name}</span>
                        <span className="text-[10px] text-gray-500 ml-auto truncate">{m.email}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Moveable Form Fields */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-gray-200">Form Fields &amp; System Fields (Move ↑ / ↓ to Reorder)</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => addFieldByType("carriers_dropdown", "Insurance Carrier")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-cyan-600/25 border border-cyan-500/30 text-cyan-300 cursor-pointer"
                    >
                      + Carriers Dropdown
                    </button>
                    <button
                      type="button"
                      onClick={() => addFieldByType("team_dropdown", "Assigned Agent")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-600/25 border border-purple-500/30 text-purple-300 cursor-pointer"
                    >
                      + Team Dropdown
                    </button>
                    <button
                      type="button"
                      onClick={() => addFieldByType("campaigns_dropdown", "Campaign")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 cursor-pointer"
                    >
                      + Campaigns Dropdown
                    </button>
                    <button
                      type="button"
                      onClick={() => addFieldByType("stages_dropdown", "CRM Pipeline Stage")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-600/25 border border-amber-500/30 text-amber-300 cursor-pointer"
                    >
                      + CRM Stage
                    </button>
                    <button
                      type="button"
                      onClick={() => addFieldByType("departments_dropdown", "Department")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 cursor-pointer"
                    >
                      + Department
                    </button>
                    <button
                      type="button"
                      onClick={() => addFieldByType("number", "Coverage / Deal Amount ($)")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-gray-200 cursor-pointer"
                    >
                      + Amount
                    </button>
                    <button
                      type="button"
                      onClick={() => addFieldByType("date", "Callback / Target Date")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-gray-200 cursor-pointer"
                    >
                      + Date
                    </button>
                    <button
                      type="button"
                      onClick={() => addFieldByType("text", "Address / Zip Code")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-gray-200 cursor-pointer"
                    >
                      + Address / Zip
                    </button>
                    <button
                      type="button"
                      onClick={() => addFieldByType("text", "Custom Question")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-gray-200 cursor-pointer"
                    >
                      + Custom Field
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {fields.map((fld, idx) => (
                    <div key={fld.id} className="grid grid-cols-12 gap-2 items-center bg-black/25 border border-white/10 rounded-xl p-2">
                      <div className="col-span-2 flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveField(idx, -1)}
                          className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === fields.length - 1}
                          onClick={() => moveField(idx, 1)}
                          className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                      <input
                        value={fld.label}
                        onChange={(e) =>
                          setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, label: e.target.value } : f)))
                        }
                        className="col-span-4 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                      />
                      <select
                        value={fld.type}
                        onChange={(e) =>
                          setFields((prev) =>
                            prev.map((f, i) => (i === idx ? { ...f, type: e.target.value as any } : f))
                          )
                        }
                        className="col-span-3 px-2 py-1.5 rounded-lg bg-[#0F172A] border border-white/10 text-xs text-white"
                      >
                        <option value="text">Text</option>
                        <option value="tel">Phone</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="textarea">Long Text</option>
                        <option value="select">Custom Dropdown</option>
                        <option value="carriers_dropdown">Carriers Dropdown</option>
                        <option value="team_dropdown">Team Dropdown</option>
                        <option value="campaigns_dropdown">Campaigns Dropdown</option>
                        <option value="stages_dropdown">CRM Stage Dropdown</option>
                        <option value="departments_dropdown">Department Dropdown</option>
                      </select>
                      <label className="col-span-2 flex items-center gap-1 text-[11px] text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fld.required}
                          onChange={(e) =>
                            setFields((prev) =>
                              prev.map((f, i) => (i === idx ? { ...f, required: e.target.checked } : f))
                            )
                          }
                          className="accent-purple-500"
                        />
                        Req
                      </label>
                      <button
                        type="button"
                        onClick={() => setFields((prev) => prev.filter((_, i) => i !== idx))}
                        className="col-span-1 text-rose-400 hover:text-rose-300 flex justify-center cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                      {fld.type === "select" && (
                        <input
                          value={(fld.options || []).join(", ")}
                          onChange={(e) =>
                            setFields((prev) =>
                              prev.map((f, i) =>
                                i === idx
                                  ? { ...f, options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }
                                  : f
                              )
                            )
                          }
                          placeholder="Comma-separated options (e.g. Option A, Option B)"
                          className="col-span-12 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-gray-200"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-sm cursor-pointer disabled:opacity-50"
              >
                {saving ? "Publishing..." : "Publish Public Form"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
