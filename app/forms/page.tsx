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
} from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";
import {
  CALL_CENTER_CARRIERS,
  type PublicFormDef,
  type PublicFormField,
} from "@/app/api/public-forms/route";

export default function PublicFormsPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const companyId = activeBranch?.id || "CMP-001";
  const companyName = activeBranch?.name || "Beraxis Workspace";

  const [forms, setForms] = useState<PublicFormDef[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // Team & Carriers
  const [teamList, setTeamList] = useState<{ id: string; name: string; email?: string }[]>([]);
  const [selectedTeamNames, setSelectedTeamNames] = useState<string[]>([]);
  const [availableCarriers, setAvailableCarriers] = useState<string[]>(CALL_CENTER_CARRIERS);
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>(CALL_CENTER_CARRIERS);
  const [customCarrierInput, setCustomCarrierInput] = useState("");

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
  }, [companyId]);

  const loadForms = async () => {
    const localKey = getEntityStorageKey("public_forms_list");
    let localForms: PublicFormDef[] = [];
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) localForms = JSON.parse(raw);
    } catch {}
    if (localForms.length > 0) setForms(localForms);

    try {
      const res = await fetch(`/api/public-forms?company_id=${encodeURIComponent(companyId)}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data?.forms)) {
        const merged = [...data.forms];
        localForms.forEach((lf) => {
          if (!merged.some((mf) => mf.id === lf.id)) merged.push(lf);
        });
        setForms(merged);
        try {
          localStorage.setItem(localKey, JSON.stringify(merged));
          merged.forEach((f) => localStorage.setItem(`beraxis_public_form_${f.id}`, JSON.stringify(f)));
        } catch {}
      }
    } catch {}
  };

  useEffect(() => {
    loadForms();
  }, [companyId]);

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const preparedFields = fields.map((fld) => {
        if (fld.type === "carriers_dropdown") return { ...fld, options: selectedCarriers };
        if (fld.type === "team_dropdown") return { ...fld, options: selectedTeamNames };
        return fld;
      });

      const res = await fetch("/api/public-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          companyName,
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

        <div className="flex items-center gap-2">
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

      {/* Forms Dashboard Grid */}
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

            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => copyLink(f.id)}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedId === f.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedId === f.id ? "Link Copied!" : "Copy Public Link"}
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
                  <label className="text-xs font-bold text-gray-200">Form Fields (Move Up / Down to Reorder)</label>
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
                        <option value="textarea">Long Text</option>
                        <option value="select">Custom Dropdown</option>
                        <option value="carriers_dropdown">Carriers Dropdown</option>
                        <option value="team_dropdown">Team Dropdown</option>
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
