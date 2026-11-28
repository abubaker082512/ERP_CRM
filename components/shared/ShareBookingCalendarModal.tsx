"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Share2, Copy, CheckCircle2, ExternalLink, X, Clock, CalendarCheck, Save } from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

interface ShareBookingCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareBookingCalendarModal({ isOpen, onClose }: ShareBookingCalendarModalProps) {
  const { activeBranch, userEmail } = useBranchContext();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState("");

  const [slug, setSlug] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [hostName, setHostName] = useState("");
  const [hostRole, setHostRole] = useState("Principal Consultant & Lead Architect");
  const [serviceTitle, setServiceTitle] = useState("Software Architecture & Discovery Call");
  const [durationMin, setDurationMin] = useState(30);
  const [workStartHour, setWorkStartHour] = useState(9);
  const [workEndHour, setWorkEndHour] = useState(18);
  const [bookingsCount, setBookingsCount] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    let userFullName = "Project Lead";
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u.name || u.full_name) userFullName = u.name || u.full_name;
      else if (u.email) userFullName = u.email.split("@")[0].replace(/[._-]/g, " ");
    } catch {}

    const comp = activeBranch?.name || "Software & Consulting Studio";
    const utcOffset = -new Date().getTimezoneOffset();
    let tzLabel = "Local Time";
    try {
      tzLabel = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local Time";
    } catch {}

    setLoading(true);
    const params = new URLSearchParams({
      auto_init: "1",
      company_name: comp,
      host_name: userFullName,
      utc_offset: String(utcOffset),
      tz: tzLabel,
    });
    if (activeBranch?.id) params.set("company_id", activeBranch.id);
    if (userEmail) params.set("email", userEmail);

    fetch(`/api/public-booking?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const first = Array.isArray(d?.links) && d.links.length > 0 ? d.links[0] : null;
        if (first) {
          setSlug(first.slug || "");
          setCompanyName(first.companyName || comp);
          setHostName(first.hostName || userFullName);
          setHostRole(first.hostRole || "Principal Consultant & Lead Architect");
          setServiceTitle(first.serviceTitle || "Software Architecture & Discovery Call");
          setDurationMin(Number(first.durationMin) || 30);
          setWorkStartHour(Number(first.workStartHour ?? 9));
          setWorkEndHour(Number(first.workEndHour ?? 18));
          setBookingsCount(Number(first.bookingsCount || 0));
        } else {
          setCompanyName(comp);
          setHostName(userFullName);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, activeBranch?.id, activeBranch?.name, userEmail]);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.beraxis.online";
  const publicUrl = `${origin}/appointments/book/${slug || "erp-demo"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let tzLabel = "Local Time";
    try {
      tzLabel = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local Time";
    } catch {}
    try {
      const res = await fetch("/api/public-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_link",
          company_id: activeBranch?.id,
          email: userEmail,
          slug,
          companyName,
          hostName,
          hostRole,
          serviceTitle,
          durationMin,
          workStartHour,
          workEndHour,
          utcOffsetMinutes: -new Date().getTimezoneOffset(),
          timezone: tzLabel,
        }),
      });
      const data = await res.json();
      if (data?.success && data.link) {
        setSlug(data.link.slug);
        setSavedToast("Calendar booking settings saved & live!");
        setTimeout(() => setSavedToast(""), 4000);
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Share Your Live Customer Booking Calendar</h3>
              <p className="text-xs text-gray-400">
                External clients see only open slots — busy hours on your Calendar are blocked automatically
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {savedToast && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{savedToast}</span>
          </div>
        )}

        {/* Shareable Public URL Box */}
        <div className="bg-[#1E293B] border border-purple-500/30 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <CalendarCheck size={14} /> Public Customer Scheduling URL
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">
              {loading ? "Syncing link..." : `${bookingsCount} Customer Booking(s)`}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-cyan-300 font-mono text-xs select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
            <Link
              href={`/appointments/book/${slug || "erp-demo"}`}
              target="_blank"
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              title="Preview Customer Booking Page"
            >
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* Customization Form */}
        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Company / Software House Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Custom URL Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
                placeholder="e.g. apex-software-studio"
                className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Host Name (Shown to Customer)</label>
              <input
                type="text"
                required
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Host Title / Role</label>
              <input
                type="text"
                value={hostRole}
                onChange={(e) => setHostRole(e.target.value)}
                className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Meeting / Consultation Title</label>
            <input
              type="text"
              required
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              placeholder="e.g. Sprint Scoping & Technical Architecture Call"
              className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1">
                <Clock size={12} /> Slot Duration
              </label>
              <select
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-3 py-2 text-white"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Work Day Starts</label>
              <select
                value={workStartHour}
                onChange={(e) => setWorkStartHour(Number(e.target.value))}
                className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-3 py-2 text-white"
              >
                {[7, 8, 9, 10, 11, 12].map((h) => (
                  <option key={h} value={h}>{`${String(h).padStart(2, "0")}:00 AM`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Work Day Ends</label>
              <select
                value={workEndHour}
                onChange={(e) => setWorkEndHour(Number(e.target.value))}
                className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-3 py-2 text-white"
              >
                {[15, 16, 17, 18, 19, 20, 21, 22].map((h) => (
                  <option key={h} value={h}>{`${String(h - 12).padStart(2, "0")}:00 PM`}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Save size={14} />
              <span>{saving ? "Saving..." : "Save Availability & Link"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
