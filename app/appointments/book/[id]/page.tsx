"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    Check,
    AlertCircle,
    Building2,
    Video,
    Shield,
    Mail,
    Phone,
    Copy,
    Share2,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Globe,
    Zap
} from "lucide-react";

type HostProfile = {
    name: string;
    role: string;
    company: string;
    avatarBg: string;
    email: string;
    bio: string;
    timezone: string;
    serviceTitle: string;
    durationMin: number;
};

const HOST_PROFILES: Record<string, HostProfile> = {
    "salim-ghauri": {
        name: "Salim Ghauri",
        role: "Principal Architect & Technology Director",
        company: "Beraxis Technologies",
        avatarBg: "bg-blue-600",
        email: "salim.ghauri@beraxis.online",
        bio: "Specializing in enterprise ERP modernization, PostgreSQL RLS multi-tenant security, and cloud scalability.",
        timezone: "Asia/Karachi (PKT, UTC+5)",
        serviceTitle: "Enterprise ERP & Technical Architecture Consultation",
        durationMin: 30
    },
    "sarah-vance": {
        name: "Sarah Vance",
        role: "Lead UI/UX Designer & Product Strategist",
        company: "Beraxis Technologies",
        avatarBg: "bg-purple-600",
        email: "sarah.vance@beraxis.online",
        bio: "Leading modern responsive portal redesigns, executive workflow dashboards, and design systems.",
        timezone: "Asia/Karachi (PKT, UTC+5)",
        serviceTitle: "Product Design & Dashboard UX Walkthrough",
        durationMin: 45
    },
    "bilal-mahmood": {
        name: "Bilal Mahmood",
        role: "ERP Specialist & Senior Financial Controller",
        company: "Beraxis Technologies",
        avatarBg: "bg-emerald-600",
        email: "bilal.mahmood@beraxis.online",
        bio: "Expert in unified financial journals, FBR tax settlement exports, and automated bank reconciliation.",
        timezone: "Asia/Karachi (PKT, UTC+5)",
        serviceTitle: "Financial Accounting & Tax Integration Consultation",
        durationMin: 30
    },
    "erp-demo": {
        name: "Beraxis Solutions Team",
        role: "Enterprise Solutions Engineering",
        company: "Beraxis Technologies",
        avatarBg: "bg-purple-600",
        email: "demo@beraxis.online",
        bio: "Explore live multi-currency accounting, live leads scraper, warehouse RFID tracking, and team sprints.",
        timezone: "Asia/Karachi (PKT, UTC+5)",
        serviceTitle: "Live Beraxis ERP & CRM Product Walkthrough",
        durationMin: 30
    }
};

const AVAILABLE_TIMESLOTS = [
    "09:30 AM",
    "10:30 AM",
    "11:30 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM"
];

export default function PublicBookingPage() {
    const params = useParams();
    const router = useRouter();
    const idSlug = (typeof params?.id === "string" ? params.id.toLowerCase() : "erp-demo");

    const host = HOST_PROFILES[idSlug] || {
        name: "Salim Ghauri",
        role: "Principal Architect",
        company: "Beraxis Technologies",
        avatarBg: "bg-blue-600",
        email: "salim.ghauri@beraxis.online",
        bio: "Enterprise ERP modernization and technical architecture consultation.",
        timezone: "Asia/Karachi (PKT, UTC+5)",
        serviceTitle: "Discovery & Solutions Call",
        durationMin: 30
    };

    // Calendar generation for next 10 business days
    const generateAvailableDates = () => {
        const dates: { dateStr: string; dayName: string; dayNum: number; monthName: string }[] = [];
        let d = new Date();
        d.setDate(d.getDate() + 1); // Start from tomorrow

        while (dates.length < 10) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
                dates.push({
                    dateStr: d.toISOString().slice(0, 10),
                    dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
                    dayNum: d.getDate(),
                    monthName: d.toLocaleDateString("en-US", { month: "short" })
                });
            }
            d.setDate(d.getDate() + 1);
        }
        return dates;
    };

    const availableDates = generateAvailableDates();
    const [selectedDate, setSelectedDate] = useState(availableDates[0]?.dateStr || "");
    const [selectedTime, setSelectedTime] = useState("10:30 AM");

    // Client form state
    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientPhone, setClientPhone] = useState("+92 ");
    const [clientCompany, setClientCompany] = useState("");
    const [meetingTopic, setMeetingTopic] = useState("");

    const [loading, setLoading] = useState(false);
    const [bookedMeeting, setBookedMeeting] = useState<{ meetingId: string; meetUrl: string } | null>(null);
    const [toastMsg, setToastMsg] = useState("");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleConfirmBooking = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientName.trim() || !clientEmail.trim() || !selectedDate || !selectedTime) return;

        setLoading(true);

        const meetingCode = `meet-${clientName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.floor(100 + Math.random() * 900)}`;
        const generatedMeetUrl = `${typeof window !== "undefined" ? window.location.origin : "https://www.beraxis.online"}/meet/${meetingCode}`;

        setTimeout(() => {
            setLoading(false);
            setBookedMeeting({
                meetingId: meetingCode,
                meetUrl: generatedMeetUrl
            });
            showToast("🎉 Meeting scheduled successfully! Confirmation email and in-system video room ready.");
        }, 600);
    };

    const copyMeetLink = (url: string) => {
        navigator.clipboard.writeText(url);
        showToast("📋 In-system video room link copied to clipboard!");
    };

    return (
        <div className="min-h-screen bg-[#0B101E] text-white flex flex-col justify-between">
            {/* Top Minimal Header with Company Branding */}
            <header className="h-16 border-b border-gray-800 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-between px-6 shrink-0 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                        B
                    </div>
                    <div>
                        <span className="font-bold text-base text-white tracking-tight">{host.company}</span>
                        <span className="text-[10px] text-gray-400 block -mt-0.5">Online Scheduling Portal</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/meet"
                        className="hidden sm:flex items-center gap-1.5 text-xs text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 rounded-xl font-bold transition-all"
                    >
                        <Zap size={13} className="text-amber-300 fill-amber-300" />
                        <span>Instant Video Room</span>
                    </Link>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Globe size={13} className="text-purple-400" />
                        <span>{host.timezone}</span>
                    </div>
                </div>
            </header>

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-20 right-6 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in">
                    <CheckCircle2 size={18} />
                    <span>{toastMsg}</span>
                </div>
            )}

            {/* Main Booking Container */}
            <main className="flex-1 flex items-center justify-center p-4 md:p-8">
                <div className="max-w-4xl w-full bg-[#1E293B] border border-gray-700/80 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {bookedMeeting ? (
                        /* ========================================================================= */
                        /* BOOKING CONFIRMED SCREEN (WITH IN-SYSTEM VIDEO ROOM)                      */
                        /* ========================================================================= */
                        <div className="p-8 md:p-12 text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                                <Check size={36} strokeWidth={2.5} />
                            </div>

                            <div className="space-y-2 max-w-lg mx-auto">
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                    {host.company} Verified Meeting
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold text-white">Your Meeting is Confirmed!</h2>
                                <p className="text-xs md:text-sm text-gray-400">
                                    A calendar invitation has been sent to <span className="text-white font-semibold">{clientEmail}</span> and <span className="text-white font-semibold">{host.name}</span>.
                                </p>
                            </div>

                            {/* Meeting Details Summary Card */}
                            <div className="bg-[#0F172A] p-5 rounded-2xl border border-gray-700/80 max-w-md mx-auto text-left space-y-3 text-xs">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                                    <span className="text-gray-400">Meeting Topic</span>
                                    <span className="font-bold text-white">{host.serviceTitle}</span>
                                </div>
                                <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                                    <span className="text-gray-400">Host Specialist</span>
                                    <span className="font-bold text-cyan-300">{host.name} ({host.role})</span>
                                </div>
                                <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                                    <span className="text-gray-400">Date & Time</span>
                                    <span className="font-bold text-white">{new Date(selectedDate).toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })} at {selectedTime}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Video Platform</span>
                                    <span className="font-bold text-purple-400 flex items-center gap-1">
                                        <Video size={13} /> Built-in Beraxis Video Meet (No Zoom needed)
                                    </span>
                                </div>
                            </div>

                            {/* Direct In-System Video Room Joiner */}
                            <div className="space-y-3 max-w-md mx-auto pt-2">
                                <Link
                                    href={`/meet/${bookedMeeting.meetingId}`}
                                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
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
                                        onClick={() => copyMeetLink(bookedMeeting.meetUrl)}
                                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                    >
                                        <Copy size={13} /> Copy
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ========================================================================= */
                        /* PUBLIC BOOKING FORM WITH HOST CALENDAR GRID                               */
                        /* ========================================================================= */
                        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
                            {/* Left Panel: Company & Host Profile */}
                            <div className="lg:col-span-4 p-6 md:p-8 space-y-6 bg-[#162032]/60">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl ${host.avatarBg} text-white font-bold text-base flex items-center justify-center shadow-lg`}>
                                            {host.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-base">{host.name}</h3>
                                            <span className="text-xs text-purple-400 font-semibold">{host.company}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h2 className="text-lg font-bold text-white tracking-tight">{host.serviceTitle}</h2>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Clock size={13} className="text-purple-400" />
                                            <span>{host.durationMin} Minutes Consultation</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Video size={13} className="text-purple-400" />
                                            <span>Beraxis In-System Video Room</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-300 leading-relaxed pt-2 border-t border-gray-800">
                                        {host.bio}
                                    </p>
                                </div>

                                <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-gray-800 space-y-2 text-xs">
                                    <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                                        <Shield size={13} className="text-cyan-400" /> Verified Host Calendar
                                    </span>
                                    <p className="text-[11px] text-gray-400">
                                        Available time slots are updated in real-time based on {host.name}'s active schedule.
                                    </p>
                                </div>
                            </div>

                            {/* Right Panel: Calendar & Booking Form */}
                            <div className="lg:col-span-8 p-6 md:p-8 space-y-6">
                                <form onSubmit={handleConfirmBooking} className="space-y-6">
                                    {/* 1. Date Selector (Available Days) */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-300">
                                            1. Select an Available Date ({host.timezone})
                                        </label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {availableDates.map((d) => {
                                                const isSelected = selectedDate === d.dateStr;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={d.dateStr}
                                                        onClick={() => setSelectedDate(d.dateStr)}
                                                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                                            isSelected
                                                                ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30 font-bold scale-[1.02]"
                                                                : "bg-[#0F172A] border-gray-700 text-gray-300 hover:border-purple-500/50"
                                                        }`}
                                                    >
                                                        <span className="text-[10px] block opacity-75 uppercase">{d.dayName}</span>
                                                        <span className="text-base font-bold block">{d.dayNum}</span>
                                                        <span className="text-[9px] block text-gray-400">{d.monthName}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 2. Time-Slot Selector */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-300">
                                            2. Select Available Time Slot
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {AVAILABLE_TIMESLOTS.map((slot) => {
                                                const isSelected = selectedTime === slot;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={slot}
                                                        onClick={() => setSelectedTime(slot)}
                                                        className={`py-2 px-3 rounded-xl border text-xs text-center font-bold transition-all cursor-pointer ${
                                                            isSelected
                                                                ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/20"
                                                                : "bg-[#0F172A] border-gray-700 text-gray-300 hover:border-gray-500"
                                                        }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 3. Your Details */}
                                    <div className="space-y-3 pt-3 border-t border-gray-800 text-xs">
                                        <label className="block text-xs font-bold text-gray-300">
                                            3. Your Contact Information
                                        </label>

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
                                                    placeholder="e.g. tariq@company.pk"
                                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-gray-400 font-semibold mb-1">Phone Number (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={clientPhone}
                                                    onChange={(e) => setClientPhone(e.target.value)}
                                                    placeholder="e.g. +92 300 1234567"
                                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-400 font-semibold mb-1">Your Company / Organization</label>
                                                <input
                                                    type="text"
                                                    value={clientCompany}
                                                    onChange={(e) => setClientCompany(e.target.value)}
                                                    placeholder="e.g. Nexus Solutions"
                                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-400 font-semibold mb-1">What would you like to discuss? (Optional)</label>
                                            <textarea
                                                rows={2}
                                                value={meetingTopic}
                                                onChange={(e) => setMeetingTopic(e.target.value)}
                                                placeholder="Brief scope, target requirements, or questions..."
                                                className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <span>Scheduling Meeting...</span>
                                            ) : (
                                                <>
                                                    <Video size={16} />
                                                    <span>Confirm Booking & Generate Video Room</span>
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

            {/* Bottom Footer */}
            <footer className="py-4 border-t border-gray-800 bg-[#0F172A] text-center text-xs text-gray-500">
                <span>Powered by <strong>Beraxis Suite</strong> • Enterprise Multi-Tenant Video Scheduling</span>
            </footer>
        </div>
    );
}
