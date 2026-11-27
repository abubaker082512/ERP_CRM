"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Sparkles, Send, Lock, KeyRound, Globe, LogIn } from "lucide-react";
import type { PublicFormDef } from "@/app/api/public-forms/route";

export default function PublicFormRespondentPage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [form, setForm] = useState<(PublicFormDef & { hasPin?: boolean }) | null>(null);
  const [locked, setLocked] = useState(false);
  const [viewerEmail, setViewerEmail] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFormWithAuth = useCallback(
    async (emailOverride?: string, pinOverride?: string) => {
      if (!id) return;
      setLoading(true);
      setPinError(null);
      const activeEmail = emailOverride !== undefined ? emailOverride : viewerEmail;
      const activePin = pinOverride !== undefined ? pinOverride : pinInput;

      const qs = new URLSearchParams({ id });
      if (activeEmail) qs.set("viewer_email", activeEmail);
      if (activePin) qs.set("access_pin", activePin);

      try {
        const r = await fetch(`/api/public-forms?${qs.toString()}`, { cache: "no-store" });
        const data = r.ok ? await r.json() : null;
        if (data?.form) {
          setForm(data.form);
          setLocked(Boolean(data.locked));
          if (data.locked && pinOverride) {
            setPinError("Invalid Access PIN. Please try again or sign in to your workspace.");
          }
        } else {
          try {
            const local = localStorage.getItem(`beraxis_public_form_${id}`);
            if (local) {
              const parsed = JSON.parse(local);
              setForm(parsed);
              setLocked(false);
            }
          } catch {}
        }
      } catch {
        try {
          const local = localStorage.getItem(`beraxis_public_form_${id}`);
          if (local) {
            setForm(JSON.parse(local));
            setLocked(false);
          }
        } catch {}
      } finally {
        setLoading(false);
      }
    },
    [id, viewerEmail, pinInput]
  );

  useEffect(() => {
    let detectedEmail = "";
    try {
      const raw =
        localStorage.getItem("user") ||
        localStorage.getItem("auth_data") ||
        localStorage.getItem("user_data");
      if (raw) {
        const parsed = JSON.parse(raw);
        detectedEmail = (parsed.email || parsed.user?.email || "").trim().toLowerCase();
      }
    } catch {}
    setViewerEmail(detectedEmail);
    fetchFormWithAuth(detectedEmail, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePinUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    await fetchFormWithAuth(viewerEmail, pinInput.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/public-forms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: form.id,
          values,
          viewerEmail,
          accessPin: pinInput.trim() || undefined,
        }),
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
          <p className="text-xs text-gray-400">This form link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  // Private Form Lock Gate
  if (locked) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 sm:p-8 text-white">
        <div className="beraxis-glass-hero max-w-md w-full p-7 sm:p-9 space-y-5 text-center border border-amber-500/30">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 mx-auto">
            <Lock size={28} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
              Private Internal Form • {form.companyName}
            </span>
            <h1 className="text-xl font-black text-white mt-2">{form.title}</h1>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              This form is set to <strong>Private</strong> and restricted to authorized members of{" "}
              <strong>{form.companyName}</strong>.
            </p>
          </div>

          {form.hasPin && (
            <form onSubmit={handlePinUnlock} className="space-y-3 text-left">
              <label className="block text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <KeyRound size={13} className="text-amber-400" /> Enter Internal Access PIN
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter Form PIN..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold cursor-pointer"
                >
                  Unlock
                </button>
              </div>
              {pinError && <p className="text-xs text-rose-400">{pinError}</p>}
            </form>
          )}

          <div className="pt-2 border-t border-white/10">
            <Link
              href={`/login?redirect=${encodeURIComponent(`/f/${form.id}`)}`}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              <LogIn size={14} /> Sign In with Workspace Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPrivate = form.visibility === "private";

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 sm:p-8 text-white">
      <div className="beraxis-glass-hero max-w-lg w-full p-7 sm:p-9 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <img src="/logo-full.png" alt="Beraxis" className="h-8 w-auto" />
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                isPrivate
                  ? "bg-amber-500/20 border-amber-500/35 text-amber-300"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              }`}
            >
              {isPrivate ? <Lock size={10} /> : <Globe size={10} />}
              {isPrivate ? "Private" : "Public"}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center gap-1">
              <Sparkles size={11} /> {form.companyName}
            </span>
          </div>
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
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {form.fields.map((fld) => {
                const isDropdown =
                  fld.type === "select" ||
                  fld.type === "carriers_dropdown" ||
                  fld.type === "team_dropdown" ||
                  fld.type === "campaigns_dropdown" ||
                  fld.type === "stages_dropdown" ||
                  fld.type === "departments_dropdown";

                const dropdownOptions =
                  fld.type === "carriers_dropdown"
                    ? fld.options && fld.options.length > 0
                      ? fld.options
                      : form.carriers || []
                    : fld.type === "team_dropdown"
                    ? fld.options && fld.options.length > 0
                      ? fld.options
                      : (form.teamMembers || []).map((m) => m.name)
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
