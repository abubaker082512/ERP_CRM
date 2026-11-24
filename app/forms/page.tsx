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
  Sparkles,
  X,
} from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";
import type { PublicFormDef, PublicFormField } from "@/app/api/public-forms/route";

export default function PublicFormsPage() {
  const { activeBranch } = useBranchContext();
  const companyId = activeBranch?.id || "CMP-001";
  const companyName = activeBranch?.name || "Beraxis Workspace";

  const [forms, setForms] = useState<PublicFormDef[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("Leave your details and our team will call you back shortly.");
  const [campaign, setCampaign] = useState("Inbound Web Form");
  const [submitLabel, setSubmitLabel] = useState("Submit Request");
  const [fields, setFields] = useState<PublicFormField[]>([
    { id: "name", label: "Full Name", type: "text", required: true, placeholder: "Your full name" },
    { id: "phone", label: "Phone / WhatsApp", type: "tel", required: true, placeholder: "+1 555-0199" },
    { id: "email", label: "Work Email", type: "email", required: false, placeholder: "you@company.com" },
    { id: "company", label: "Company Name", type: "text", required: false, placeholder: "Acme Corp" },
    { id: "notes", label: "Notes / Requirements", type: "textarea", required: false, placeholder: "How can we help?" },
  ]);

  const loadForms = async () => {
    try {
      const res = await fetch(`/api/public-forms?company_id=${encodeURIComponent(companyId)}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data?.forms)) setForms(data.forms);
    } catch {}
  };

  useEffect(() => {
    loadForms();
  }, [companyId]);

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
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
        fields,
      }),
    });
    if (res.ok) {
      setTitle("");
      setIsBuilderOpen(false);
      await loadForms();
    }
  };

  const copyLink = (id: string) => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/f/${id}` : `/f/${id}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addCustomField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: `custom_${Date.now().toString().slice(-4)}`,
        label: "Custom Question",
        type: "text",
        required: false,
        placeholder: "Enter answer...",
      },
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-white">
      <div className="beraxis-glass-hero p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-300 mb-1">
            <ClipboardList size={14} /> Public Lead-Capture Forms · {companyName}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Public Forms &amp; Intake Links</h1>
          <p className="text-xs text-gray-300 mt-1">
            Create shareable public forms (no login required). Every submission automatically creates a lead in your Call Center Lead Sheet.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {forms.map((f) => (
          <div key={f.id} className="beraxis-glass-dock p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {f.campaign}
                </span>
                <span className="text-xs font-bold text-emerald-400">{f.submissionsCount} Submissions</span>
              </div>
              <h3 className="text-lg font-black text-white">{f.title}</h3>
              <p className="text-xs text-gray-300">{f.description}</p>
              <div className="text-[11px] text-gray-400 font-mono bg-black/30 px-3 py-2 rounded-xl border border-white/10 truncate">
                /f/{f.id}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => copyLink(f.id)}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedId === f.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedId === f.id ? "Link Copied!" : "Copy Public Link"}
              </button>
              <Link
                href={`/f/${f.id}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold flex items-center gap-1.5"
              >
                Open Form <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleCreateForm} className="bg-[#141C2E] border border-white/20 rounded-3xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" /> New Public Lead-Capture Form
              </h3>
              <button type="button" onClick={() => setIsBuilderOpen(false)}><X size={18} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-gray-400 block mb-1">Form Title *</label>
                <input type="text" required placeholder="e.g. Q4 Demo Request Form" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-gray-400 block mb-1">Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">Target Campaign</label>
                <input type="text" value={campaign} onChange={(e) => setCampaign(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">Submit Button Text</label>
                <input type="text" value={submitLabel} onChange={(e) => setSubmitLabel(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none" />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">Form Fields ({fields.length})</span>
                <button type="button" onClick={addCustomField} className="text-xs font-bold text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer">
                  <Plus size={13} /> Add Custom Field
                </button>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {fields.map((fld, idx) => (
                  <div key={fld.id} className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/10">
                    <input
                      type="text"
                      value={fld.label}
                      onChange={(e) =>
                        setFields((prev) => prev.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)))
                      }
                      className="flex-1 bg-transparent text-xs text-white outline-none px-2"
                    />
                    <select
                      value={fld.type}
                      onChange={(e) =>
                        setFields((prev) => prev.map((x, i) => (i === idx ? { ...x, type: e.target.value as any } : x)))
                      }
                      className="bg-[#0B1022] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-gray-200"
                    >
                      <option value="text">Text</option>
                      <option value="tel">Phone</option>
                      <option value="email">Email</option>
                      <option value="textarea">Long Text</option>
                    </select>
                    <label className="text-[10px] text-gray-400 flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={fld.required}
                        onChange={(e) =>
                          setFields((prev) => prev.map((x, i) => (i === idx ? { ...x, required: e.target.checked } : x)))
                        }
                      /> Req
                    </label>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => setFields((prev) => prev.filter((_, i) => i !== idx))} className="text-gray-500 hover:text-rose-400 p-1">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsBuilderOpen(false)} className="px-4 py-2 text-xs text-gray-400 font-bold">Cancel</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold text-white cursor-pointer">
                Publish Public Form
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
