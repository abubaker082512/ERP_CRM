"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Check,
  AlertCircle,
  Video,
  Shield,
  Copy,
  CheckCircle2,
  Globe,
  Zap,
  Download,
} from "lucide-react";

type LiveBookingProfile = {
  slug: string;
  companyName: string;
  hostName: string;
  hostRole: string;
  hostEmail?: string;
  serviceTitle: string;
  bio: string;
  durationMin: number;
  timezone: string;
};

const DEFAULT_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

export default function PublicBookingPage() {
  const params = useParams();
  const idSlug = typeof params?.id === "string" ? params.id.toLowerCase() : "erp-demo";

  const [host, setHost] = useState<LiveBookingProfile>({
    slug: idSlug,
    companyName: "Loading Workspace...",
    hostName: "Solutions Specialist",
    hostRole: "Lead Consultant",
    serviceTitle: "Discovery & Calendar Consultation",
    bio: "Select an open date and time slot below to book directly onto our live calendar.",
    durationMin: 30,
    timezone: "Local Time",
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [blockedSlotsByDate, setBlockedSlotsByDate] = useState<Record<string, string[]>>({});
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Generate next 10 business days (including today if weekday, plus upcoming weekdays)
  const generateAvailableDates = () => {
    const dates: { dateStr: string; dayName: string; dayNum: number; monthName: string }[] = [];
    const d = new Date();
    while (dates.length < 10) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        dates.push({
          dateStr: `${y}-${m}-${day}`,
          dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
          dayNum: d.getDate(),
          monthName: d.toLocaleDateString("en-US", { month: "short" }),
        });
      }
      d.setDate(d.getDate() + 1);
    }
    return dates;
  };

  const availableDates = generateAvailableDates();
  const [selectedDate, setSelectedDate] = useState(availableDates[0]?.dateStr || "");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");

  // Client form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [meetingTopic, setMeetingTopic] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookedMeeting, setBookedMeeting] = useState<{
    meetingId: string;
    meetUrl: string;
    date: string;
    time: string;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const fetchLiveAvailability = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/public-booking?slug=${encodeURIComponent(idSlug)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.success && data.profile) {
        setHost({
          slug: data.profile.slug || idSlug,
          companyName: data.profile.companyName || "Software & Consulting Studio",
          hostName: data.profile.hostName || "Project Lead",
          hostRole: data.profile.hostRole || "Principal Consultant",
          hostEmail: data.profile.hostEmail,
          serviceTitle: data.profile.serviceTitle || "Discovery & Calendar Consultation",
          bio:
            data.profile.bio ||
            "Select an open date and time slot below to book directly onto our live calendar.",
          durationMin: Number(data.profile.durationMin) || 30,
          timezone: data.profile.timezone || "Local Time",
        });
        if (Array.isArray(data.availableSlots) && data.availableSlots.length > 0) {
          setAvailableSlots(data.availableSlots);
        }
        setBlockedSlotsByDate(data.blockedSlotsByDate || {});
      }
    } catch {}
    setLoadingProfile(false);
  }, [idSlug]);

  useEffect(() => {
    fetchLiveAvailability();
  }, [fetchLiveAvailability]);

  // Keep selectedTime on an open (non-busy) slot whenever date or blocked map changes
  useEffect(() => {
    const blockedForDay = blockedSlotsByDate[selectedDate] || [];
    if (blockedForDay.includes(selectedTime) || !availableSlots.includes(selectedTime)) {
      const firstOpen = availableSlots.find((s) => !blockedForDay.includes(s));
      setSelectedTime(firstOpen || "");
    }
  }, [selectedDate, blockedSlotsByDate, availableSlots, selectedTime]);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!clientName.trim() || !clientEmail.trim() || !selectedDate || !selectedTime) {
      setErrorMsg("Please select an available time slot and enter your name and email.");
      return;
    }

    setLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://www.beraxis.online";
      const res = await fetch("/api/public-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "book_slot",
          slug: idSlug,
          date: selectedDate,
          time: selectedTime,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim(),
          clientCompany: clientCompany.trim(),
          meetingTopic: meetingTopic.trim(),
          origin,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setErrorMsg(data?.error || "Could not complete booking. Please choose another slot.");
        if (data?.conflict) {
          fetchLiveAvailability();
        }
        setLoading(false);
        return;
      }

      setBookedMeeting({
        meetingId: data.booked.meetingId,
        meetUrl: data.booked.meetUrl,
        date: selectedDate,
        time: selectedTime,
      });
      showToast("Meeting scheduled on host calendar! Video conference room ready.");
    } catch {
      setErrorMsg("Network error while scheduling. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyMeetLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("In-system video room link copied to clipboard!");
  };

  const handleDownloadIcs = () => {
    if (!bookedMeeting) return;
    const summary = `${host.serviceTitle} with ${host.hostName} (${host.companyName})`;
    const dtClean = bookedMeeting.date.replace(/-/g, "");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Beraxis Calendar//EN",
      "BEGIN:VEVENT",
      `UID:${bookedMeeting.meetingId}@beraxis.online`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:Join Beraxis Video Room: ${bookedMeeting.meetUrl}`,
      `LOCATION:${bookedMeeting.meetUrl}`,
      `DTSTART;VALUE=DATE:${dtClean}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${host.slug}-meeting.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const blockedToday = blockedSlotsByDate[selectedDate] || [];
  const initials =
    host.hostName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "BX";

  return (
    <div className="min-h-screen bg-[#0B101E] text-white flex flex-col justify-between">
      {/* Top Minimal Header with Company Branding */}
      <header className="h-16 border-b border-gray-800 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-between px-6 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white shadow-md">
            {host.companyName.charAt(0).toUpperCase() || "B"}
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight">{host.companyName}</span>
            <span className="text-[10px] text-gray-400 block -mt-0.5">Live Calendar Scheduling Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Globe size={13} className="text-purple-400" />
            <span>{host.timezone}</span>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-md">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Booking Container */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-4xl w-full bg-[#1E293B] border border-gray-700/80 rounded-3xl shadow-2xl overflow-hidden">
          {bookedMeeting ? (
            <div className="p-8 md:p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <Check size={36} strokeWidth={2.5} />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  {host.companyName} • Added to Host Calendar
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Your Meeting is Confirmed!</h2>
                <p className="text-xs md:text-sm text-gray-400">
                  This slot is now reserved on <span className="text-white font-semibold">{host.hostName}</span>&apos;s live calendar for{" "}
                  <span className="text-white font-semibold">{clientName}</span> ({clientEmail}).
                </p>
              </div>

              <div className="bg-[#0F172A] p-5 rounded-2xl border border-gray-700/80 max-w-md mx-auto text-left space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800 gap-2">
                  <span className="text-gray-400">Meeting Topic</span>
                  <span className="font-bold text-white text-right">{host.serviceTitle}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-800 gap-2">
                  <span className="text-gray-400">Host</span>
                  <span className="font-bold text-cyan-300 text-right">
                    {host.hostName} ({host.hostRole})
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-800 gap-2">
                  <span className="text-gray-400">Date &amp; Time</span>
                  <span className="font-bold text-white text-right">
                    {bookedMeeting.date} at {bookedMeeting.time} ({host.durationMin}m)
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-400">Video Platform</span>
                  <span className="font-bold text-purple-400 flex items-center gap-1">
                    <Video size={13} /> Built-in Beraxis Video Meet
                  </span>
                </div>
              </div>

              <div className="space-y-3 max-w-md mx-auto pt-2">
                <Link
                  href={`/meet/${bookedMeeting.meetingId}`}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Video size={18} />
                  <span>Enter In-System Video Conference Room</span>
                </Link>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={bookedMeeting.meetUrl}
                    className="flex-1 bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-xs font-mono text-gray-300 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyMeetLink(bookedMeeting.meetUrl)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Copy size={13} /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadIcs}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Download .ics Calendar Invite"
                  >
                    <Download size={13} /> .ICS
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
              {/* Left Panel: Company & Host Profile */}
              <div className="lg:col-span-4 p-6 md:p-8 space-y-6 bg-[#162032]/60">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-bold text-base flex items-center justify-center shadow-lg shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{host.hostName}</h3>
                      <span className="text-xs text-purple-400 font-semibold block">{host.hostRole}</span>
                      <span className="text-[11px] text-gray-400 block">{host.companyName}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-lg font-bold text-white tracking-tight">{host.serviceTitle}</h2>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock size={13} className="text-purple-400" />
                      <span>{host.durationMin} Minutes Slot</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Video size={13} className="text-purple-400" />
                      <span>Instant Beraxis Video Room Link</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed pt-2 border-t border-gray-800">
                    {host.bio}
                  </p>
                </div>

                <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-gray-800 space-y-2 text-xs">
                  <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                    <Shield size={13} className="text-emerald-400" /> Live Conflict Protection
                  </span>
                  <p className="text-[11px] text-gray-400">
                    {loadingProfile
                      ? "Checking host's live calendar availability..."
                      : `Synced in real time with ${host.companyName}'s calendar. Busy hours are automatically blocked.`}
                  </p>
                </div>
              </div>

              {/* Right Panel: Calendar & Booking Form */}
              <div className="lg:col-span-8 p-6 md:p-8 space-y-6">
                <form onSubmit={handleConfirmBooking} className="space-y-6">
                  {errorMsg && (
                    <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle size={15} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* 1. Date Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-300">
                      1. Select an Available Date ({host.timezone})
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {availableDates.map((d) => {
                        const isSelected = selectedDate === d.dateStr;
                        const dayBlockedCount = (blockedSlotsByDate[d.dateStr] || []).length;
                        return (
                          <button
                            type="button"
                            key={d.dateStr}
                            onClick={() => setSelectedDate(d.dateStr)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30 font-bold"
                                : "bg-[#0F172A] border-gray-700 text-gray-300 hover:border-purple-500/50"
                            }`}
                          >
                            <span className="text-[10px] block opacity-75 uppercase">{d.dayName}</span>
                            <span className="text-base font-bold block">{d.dayNum}</span>
                            <span className="text-[9px] block text-gray-400">
                              {d.monthName}
                              {dayBlockedCount > 0 ? ` • ${availableSlots.length - dayBlockedCount} open` : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Time-Slot Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-300">
                        2. Select Available Time Slot
                      </label>
                      {blockedToday.length > 0 && (
                        <span className="text-[11px] text-amber-400 font-semibold">
                          {blockedToday.length} busy slot(s) hidden/locked
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => {
                        const isBlocked = blockedToday.includes(slot);
                        const isSelected = !isBlocked && selectedTime === slot;
                        return (
                          <button
                            type="button"
                            key={slot}
                            disabled={isBlocked}
                            onClick={() => !isBlocked && setSelectedTime(slot)}
                            className={`py-2 px-3 rounded-xl border text-xs text-center font-bold transition-all ${
                              isBlocked
                                ? "bg-gray-900/50 border-gray-800 text-gray-600 line-through cursor-not-allowed"
                                : isSelected
                                ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/20 cursor-pointer"
                                : "bg-[#0F172A] border-gray-700 text-gray-300 hover:border-gray-500 cursor-pointer"
                            }`}
                          >
                            {isBlocked ? `${slot} (Busy)` : slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Customer Contact Details */}
                  <div className="space-y-3 pt-3 border-t border-gray-800 text-xs">
                    <label className="block text-xs font-bold text-gray-300">3. Your Contact Information</label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 font-semibold mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="e.g. Tariq Mansoor"
                          className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-semibold mb-1">Work Email Address *</label>
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="e.g. tariq@clientcorp.com"
                          className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 font-semibold mb-1">Phone / WhatsApp (Optional)</label>
                        <input
                          type="text"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="e.g. +1 555 234 5678"
                          className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-semibold mb-1">Your Company / Project</label>
                        <input
                          type="text"
                          value={clientCompany}
                          onChange={(e) => setClientCompany(e.target.value)}
                          placeholder="e.g. FinTech Global Ltd."
                          className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 font-semibold mb-1">
                        Project Scope / Agenda Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={meetingTopic}
                        onChange={(e) => setMeetingTopic(e.target.value)}
                        placeholder="Share what you want to build or discuss..."
                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || !selectedTime}
                      className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Booking Slot on Host Calendar...</span>
                      ) : (
                        <>
                          <CalendarIcon size={16} />
                          <span>
                            {selectedTime
                              ? `Confirm ${selectedTime} Slot & Generate Video Room`
                              : "No Open Slots on Selected Date"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 border-t border-gray-800 bg-[#0F172A] text-center text-xs text-gray-500">
        <span>
          Powered by <strong>Beraxis Suite</strong> • Real-Time Isolated Calendar &amp; Video Scheduling
        </span>
      </footer>
    </div>
  );
}
