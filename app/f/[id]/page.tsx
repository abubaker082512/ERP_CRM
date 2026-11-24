"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Sparkles, Send } from "lucide-react";
import type { PublicFormDef } from "@/app/api/public-forms/route";

export default function PublicFormRespondentPage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [form, setForm] = useState<PublicFormDef | null>(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/public-forms?id=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.form) {
          setForm(data.form);
        } else {
          try {
            const local = localStorage.getItem(`beraxis_public_form_${id}`);
            if (local) setForm(JSON.parse(local));
          } catch {}
        }
      })
      .catch(() => {
        try {
          const local = localStorage.getItem(`beraxis_public_form_${id}`);
          if (local) setForm(JSON.parse(local));
        } catch {}
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/public-forms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: form.id, values }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Failed to submit form");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center text-gray-300 text-sm">
        Loading form...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="beraxis-glass-hero max-w-md w-full p-8 text-center text-white space-y-2">
          <h1 className="text-xl font-black">Form Not Found</h1>
          <p className="text-xs text-gray-400">This public link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 sm:p-8 text-white">
      <div className="beraxis-glass-hero max-w-lg w-full p-7 sm:p-9 space-y-6">
        <div className="flex items-center justify-between">
          <img src="/logo-full.png" alt="Beraxis" className="h-8 w-auto" />
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center gap-1">
            <Sparkles size={11} /> {form.companyName}
          </span>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="text-2xl font-black text-white">Thank You!</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Your details have been received by <strong>{form.companyName}</strong>. Our team will reach out shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h1 className="text-2xl font-black text-white">{form.title}</h1>
              <p className="text-xs text-gray-300 mt-1">{form.description}</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">{error}</div>
            )}

            <div className="space-y-3">
              {form.fields.map((fld) => {
                const isDropdown =
                  fld.type === "select" ||
                  fld.type === "carriers_dropdown" ||
                  fld.type === "team_dropdown";

                const dropdownOptions =
                  fld.type === "carriers_dropdown"
                    ? (fld.options && fld.options.length > 0 ? fld.options : form.carriers || [])
                    : fld.type === "team_dropdown"
                    ? (fld.options && fld.options.length > 0
                        ? fld.options
                        : (form.teamMembers || []).map((m) => m.name))
                    : fld.options || [];

                return (
                  <div key={fld.id}>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      {fld.label} {fld.required && <span className="text-rose-400">*</span>}
                    </label>
                    {fld.type === "textarea" ? (
                      <textarea
                        rows={3}
                        required={fld.required}
                        placeholder={fld.placeholder || ""}
                        value={values[fld.id] || ""}
                        onChange={(e) => setValues({ ...values, [fld.id]: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white outline-none focus:border-purple-400"
                      />
                    ) : isDropdown ? (
                      <select
                        required={fld.required}
                        value={values[fld.id] || ""}
                        onChange={(e) => setValues({ ...values, [fld.id]: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/15 text-xs text-white outline-none focus:border-purple-400"
                      >
                        <option value="">-- Select {fld.label} --</option>
                        {dropdownOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={fld.type}
                        required={fld.required}
                        placeholder={fld.placeholder || ""}
                        value={values[fld.id] || ""}
                        onChange={(e) => setValues({ ...values, [fld.id]: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white outline-none focus:border-purple-400"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
            >
              <Send size={15} /> {submitting ? "Submitting..." : form.submitLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
