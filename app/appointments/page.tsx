"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import Link from "next/link";
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    Plus,
    X,
    CheckCircle2,
    Video,
    Link2,
    Copy,
    Share2,
    Mail,
    Phone,
    Building2,
    Check,
    CalendarCheck,
    Filter,
    ArrowRight,
    Sparkles,
    Shield,
    Settings,
    Send,
    ExternalLink,
    Zap
} from "lucide-react";

const MENU_ITEMS = [
    { name: "Appointments", href: "/appointments" },
    { name: "Calendar View", href: "/calendar" },
    { name: "Reporting", href: "/calendar/reporting" },
    { name: "Configuration", href: "/calendar/configuration" },
];

export type Appointment = {
    id: string;
    meeting_code: string;
    title: string;
    client_name: string;
    client_email: string;
    client_phone?: string;
    company?: string;
    host_name: string;
    host_slug: string;
    host_role: string;
    date: string;
    start_time: string;
    end_time: string;
    duration_min: number;
    type: "erp_demo" | "architecture_review" | "client_checkin" | "onboarding";
    status: "confirmed" | "completed" | "cancelled" | "pending";
    notes?: string;
};

const APPOINTMENT_TYPES = [
    {
        id: "erp_demo",
        slug: "erp-demo",
        label: "ERP & CRM Product Walkthrough",
        duration: "30 Min",
        badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        description: "Live demonstration of unified accounting, live leads pool scraper, and sprint management."
    },
    {
        id: "architecture_review",
        slug: "salim-ghauri",
        label: "Technical Architecture & API Review",
        duration: "45 Min",
        badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
        description: "Deep dive into multi-tenant database isolation, JWT auth middleware, and webhook integrations."
    },
    {
        id: "onboarding",
        slug: "bilal-mahmood",
        label: "Enterprise Customer Onboarding",
        duration: "60 Min",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        description: "Hands-on staff training, user access setup, and custom workflow configuration."
    },
    {
        id: "client_checkin",
        slug: "sarah-vance",
        label: "Executive Sprint Check-in",
        duration: "15 Min",
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        description: "Bi-weekly milestone progress review and sprint blocker resolution."
    }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
    {
        id: "APT/2026/01",
        meeting_code: "nexus-solutions-erp",
        title: "ERP & CRM Product Walkthrough",
        client_name: "Tariq Mansoor",
        client_email: "tariq@nexussolutions.pk",
        client_phone: "+92 300 8472910",
        company: "Nexus Solutions Ltd",
        host_name: "Salim Ghauri",
        host_slug: "salim-ghauri",
        host_role: "Principal Architect",
        date: "2026-03-10",
        start_time: "10:00 AM",
        end_time: "10:30 AM",
        duration_min: 30,
        type: "erp_demo",
        status: "confirmed",
        notes: "Interested in custom warehouse RFID scanner sync and Pakistan live leads pool."
    },
    {
        id: "APT/2026/02",
        meeting_code: "shifa-tech-review",
        title: "Technical Architecture & API Review",
        client_name: "Dr. Ayesha Malik",
        client_email: "ayesha.malik@shifa.org.pk",
        client_phone: "+92 321 4458921",
        company: "Shifa Healthcare Systems",
        host_name: "Sarah Vance",
        host_slug: "sarah-vance",
        host_role: "Lead UI/UX Designer",
        date: "2026-03-11",
        start_time: "02:00 PM",
        end_time: "02:45 PM",
        duration_min: 45,
        type: "architecture_review",
        status: "confirmed",
        notes: "Review patient ledger integration and HIPAA/FBR compliant data storage."
    },
    {
        id: "APT/2026/03",
        meeting_code: "albaraka-onboard",
        title: "Enterprise Customer Onboarding",
        client_name: "Kamran Akram",
        client_email: "kamran@albaraka.com.pk",
        client_phone: "+92 333 7182930",
        company: "Al Baraka Logistics",
        host_name: "Bilal Mahmood",
        host_slug: "bilal-mahmood",
        host_role: "ERP Specialist",
        date: "2026-03-12",
        start_time: "11:00 AM",
        end_time: "12:00 PM",
        duration_min: 60,
        type: "onboarding",
        status: "pending",
        notes: "Initial setup of 4 warehouse hubs across Lahore and Karachi."
    },
    {
        id: "APT/2026/04",
        meeting_code: "crest-checkin",
        title: "Executive Sprint Check-in",
        client_name: "Zubair Hashmi",
        client_email: "zubair@crestholding.com",
        client_phone: "+92 301 9823411",
        company: "Crest Holdings",
        host_name: "Salim Ghauri",
        host_slug: "salim-ghauri",
        host_role: "Principal Architect",
        date: "2026-03-08",
        start_time: "04:30 PM",
        end_time: "04:45 PM",
        duration_min: 15,
        type: "client_checkin",
        status: "completed",
        notes: "Sprint 4 milestone approved by stakeholders."
    }
];

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Book Modal State
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [hostName, setHostName] = useState("Salim Ghauri");
    const [apptType, setApptType] = useState<Appointment["type"]>("erp_demo");
    const [apptDate, setApptDate] = useState("2026-03-12");
    const [apptTime, setApptTime] = useState("11:00 AM");
    const [notes, setNotes] = useState("");

    // Share Booking Link Modal
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedHostSlug, setSelectedHostSlug] = useState("salim-ghauri");

    // Instant Meeting Modal State
    const [showInstantModal, setShowInstantModal] = useState(false);
    const [instantMeetingUrl, setInstantMeetingUrl] = useState("");

    // Email Invite Modal
    const [emailAppt, setEmailAppt] = useState<Appointment | null>(null);
    const [emailRecipient, setEmailRecipient] = useState("");
    const [emailSubject, setEmailSubject] = useState("");

    const [toastMsg, setToastMsg] = useState("");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleCreateInstantMeeting = () => {
        const uniqueRoomCode = `meet-${Math.random().toString(36).substring(2, 8)}-${Math.random().toString(36).substring(2, 6)}`;
        const url = typeof window !== "undefined"
            ? `${window.location.origin}/meet/${uniqueRoomCode}`
            : `https://www.beraxis.online/meet/${uniqueRoomCode}`;
        setInstantMeetingUrl(url);
        setShowInstantModal(true);
        navigator.clipboard.writeText(url);
        showToast("⚡ Instant video room generated & copied to clipboard!");
    };

    const handleCreateAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientName.trim() || !clientEmail.trim()) return;

        const duration = apptType === "onboarding" ? 60 : apptType === "architecture_review" ? 45 : apptType === "client_checkin" ? 15 : 30;
        const typeInfo = APPOINTMENT_TYPES.find(t => t.id === apptType);
        const hostSlug = hostName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const meetingCode = `meet-${clientName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.floor(100 + Math.random() * 900)}`;

        const newAppt: Appointment = {
            id: `APT/2026/0${appointments.length + 1}`,
            meeting_code: meetingCode,
            title: typeInfo?.label || "Meeting",
            client_name: clientName.trim(),
            client_email: clientEmail.trim(),
            client_phone: clientPhone.trim() || undefined,
            company: companyName.trim() || "Independent Organization",
            host_name: hostName,
            host_slug: hostSlug,
            host_role: hostName.includes("Salim") ? "Principal Architect" : hostName.includes("Sarah") ? "Lead UI/UX" : "ERP Specialist",
            date: apptDate,
            start_time: apptTime,
            end_time: "11:30 AM",
            duration_min: duration,
            type: apptType,
            status: "confirmed",
            notes: notes.trim()
        };

        setAppointments([newAppt, ...appointments]);
        setIsBookModalOpen(false);
        setClientName("");
        setClientEmail("");
        setClientPhone("");
        setCompanyName("");
        setNotes("");
        showToast(`🎉 Appointment scheduled with ${newAppt.client_name}! In-system video room created.`);
    };

    const toggleStatus = (id: string, newStatus: Appointment["status"]) => {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
        showToast(`Status updated to ${newStatus.toUpperCase()}`);
    };

    const copyMeetingUrl = (meetingCode: string) => {
        const url = `${typeof window !== "undefined" ? window.location.origin : "https://www.beraxis.online"}/meet/${meetingCode}`;
        navigator.clipboard.writeText(url);
        showToast("📋 In-system video room link copied to clipboard!");
    };

    const handleSendEmailInvite = (e: React.FormEvent) => {
        e.preventDefault();
        showToast(`🚀 Video meeting invite with calendar link dispatched to ${emailRecipient}!`);
        setEmailAppt(null);
        setEmailRecipient("");
    };

    const filteredAppointments = statusFilter === "all"
        ? appointments
        : appointments.filter(a => a.status === statusFilter);

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Appointments"
                moduleIcon={<CalendarCheck size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search by client, company, host..."
                onNewClick={() => setIsBookModalOpen(true)}
                newButtonText="Book Appointment"
            />

            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
                {/* Hero Banner */}
                <div className="bg-gradient-to-r from-purple-900/40 via-[#1E293B] to-cyan-900/30 border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2 max-w-2xl">
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                                    <CalendarCheck size={22} />
                                </span>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    Client Appointments & In-System Video Rooms
                                </h2>
                            </div>
                            <p className="text-xs md:text-sm text-gray-300">
                                Share host-linked booking calendars with external clients. No need for Zoom or third-party subscriptions — conduct encrypted video meetings right inside Beraxis.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={handleCreateInstantMeeting}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                                title="Generate an instant video room link"
                            >
                                <Zap size={16} className="text-amber-300 fill-amber-300" />
                                <span>Instant Meeting Link</span>
                            </button>

                            <button
                                onClick={() => setShowLinkModal(true)}
                                className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <Share2 size={15} />
                                <span>Share Host Booking Link</span>
                            </button>

                            <button
                                onClick={() => setIsBookModalOpen(true)}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <Plus size={16} />
                                <span>Schedule Meeting</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pre-Configured Service Templates */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-400" /> Active Appointment Service Templates
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {APPOINTMENT_TYPES.map((type) => (
                            <div
                                key={type.id}
                                className="bg-[#1E293B] border border-gray-700/80 hover:border-purple-500/60 p-4 rounded-2xl transition-all group hover:shadow-xl space-y-2 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${type.badge}`}>
                                            {type.duration}
                                        </span>
                                        <Video size={14} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
                                    </div>
                                    <h4 className="text-xs font-bold text-white mt-2 group-hover:text-purple-300 transition-colors">
                                        {type.label}
                                    </h4>
                                    <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">
                                        {type.description}
                                    </p>
                                </div>
                                <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-[11px]">
                                    <Link
                                        href={`/appointments/book/${type.slug}`}
                                        target="_blank"
                                        className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                                    >
                                        <span>View Page</span>
                                        <ExternalLink size={12} />
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setApptType(type.id as any);
                                            setIsBookModalOpen(true);
                                        }}
                                        className="text-purple-400 hover:text-purple-300 font-bold"
                                    >
                                        Schedule →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Toast Notification */}
                {toastMsg && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold flex items-center justify-between shadow-lg backdrop-blur-md animate-in fade-in">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            <span>{toastMsg}</span>
                        </div>
                        <button onClick={() => setToastMsg("")} className="text-gray-400 hover:text-white cursor-pointer">
                            ✕
                        </button>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {["all", "confirmed", "pending", "completed", "cancelled"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                                    statusFilter === status
                                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                                        : "bg-[#1E293B] text-gray-400 hover:text-white border border-gray-700/60"
                                }`}
                            >
                                {status === "all" ? "All Appointments" : status}
                            </button>
                        ))}
                    </div>

                    <span className="text-xs text-gray-400 font-semibold">
                        {filteredAppointments.length} Scheduled Meetings
                    </span>
                </div>

                {/* Appointments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAppointments.map((appt) => (
                        <div
                            key={appt.id}
                            className="bg-[#1E293B] border border-gray-700 hover:border-purple-500/50 rounded-2xl p-6 transition-all group shadow-xl flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                    <span className="font-mono text-[10px] text-gray-400 font-bold">{appt.id}</span>
                                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                                        appt.status === "confirmed"
                                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                            : appt.status === "completed"
                                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                            : appt.status === "pending"
                                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                            : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                    }`}>
                                        {appt.status}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                                        {appt.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium mt-0.5">
                                        <Building2 size={13} />
                                        <span>{appt.company || "Direct Client"}</span>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="bg-[#0F172A] p-3.5 rounded-xl border border-gray-800 space-y-2 text-xs">
                                    <div className="flex items-center justify-between text-gray-300">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon size={14} className="text-purple-400" />
                                            <span>{new Date(appt.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <span className="font-bold text-white">{appt.start_time}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-gray-400 pt-1 border-t border-gray-800/80">
                                        <div className="flex items-center gap-1.5">
                                            <User size={14} className="text-cyan-400" />
                                            <span>Host: {appt.host_name}</span>
                                        </div>
                                        <span className="text-[11px] text-purple-300">{appt.duration_min} min call</span>
                                    </div>
                                </div>

                                {/* Client contact & notes */}
                                <div className="text-xs text-gray-400 space-y-1">
                                    <div className="flex items-center gap-2 text-white font-medium">
                                        <span>{appt.client_name}</span>
                                        <span className="text-gray-500">•</span>
                                        <span className="text-gray-400 text-[11px]">{appt.client_email}</span>
                                    </div>
                                    {appt.notes && (
                                        <p className="text-[11px] text-gray-400 line-clamp-2 italic">
                                            "{appt.notes}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Direct In-System Video Room Joiner & Share */}
                            <div className="pt-3 border-t border-gray-800 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/meet/${appt.meeting_code}`}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer active:scale-95"
                                    >
                                        <Video size={14} /> Enter In-System Meet Room
                                    </Link>

                                    <button
                                        onClick={() => copyMeetingUrl(appt.meeting_code)}
                                        className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                                        title="Copy In-System Meet URL"
                                    >
                                        <Copy size={14} />
                                    </button>

                                    <button
                                        onClick={() => {
                                            setEmailAppt(appt);
                                            setEmailRecipient(appt.client_email);
                                            setEmailSubject(`Meeting Invitation: ${appt.title} with ${appt.host_name}`);
                                        }}
                                        className="p-2 text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-colors cursor-pointer"
                                        title="Forward Video Invite via Email"
                                    >
                                        <Mail size={14} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between text-[11px]">
                                    <button
                                        onClick={() => toggleStatus(appt.id, appt.status === "completed" ? "confirmed" : "completed")}
                                        className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                                    >
                                        {appt.status === "completed" ? "↺ Mark Active" : "✓ Mark Completed"}
                                    </button>
                                    <button
                                        onClick={() => toggleStatus(appt.id, "cancelled")}
                                        className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* SHARE HOST BOOKING LINK MODAL                                             */}
            {/* ========================================================================= */}
            {showLinkModal && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
                                    <Share2 size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Company & Host Booking Links</h3>
                                    <p className="text-xs text-gray-400">Share your personalized scheduling calendar with clients</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowLinkModal(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Select Host Specialist Calendar</label>
                                <select
                                    value={selectedHostSlug}
                                    onChange={(e) => setSelectedHostSlug(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer font-semibold"
                                >
                                    <option value="salim-ghauri">Salim Ghauri (Principal Architect)</option>
                                    <option value="sarah-vance">Sarah Vance (Lead UI/UX Designer)</option>
                                    <option value="bilal-mahmood">Bilal Mahmood (ERP Specialist)</option>
                                    <option value="erp-demo">Beraxis Solutions Engineering Team</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Public Scheduling Link</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${typeof window !== "undefined" ? window.location.origin : "https://www.beraxis.online"}/appointments/book/${selectedHostSlug}`}
                                        className="flex-1 bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-cyan-300 font-mono text-xs select-all focus:outline-none"
                                    />
                                    <button
                                        onClick={() => {
                                            const url = `${typeof window !== "undefined" ? window.location.origin : "https://www.beraxis.online"}/appointments/book/${selectedHostSlug}`;
                                            navigator.clipboard.writeText(url);
                                            showToast("📋 Public calendar booking link copied!");
                                        }}
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Copy size={14} /> Copy
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-400 text-[11px] leading-relaxed">
                                When clients visit this URL, they see your company branding, host profile, and live calendar availability. Scheduled calls automatically generate an in-system video room.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <Link
                                    href={`/appointments/book/${selectedHostSlug}`}
                                    target="_blank"
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5"
                                >
                                    <ExternalLink size={14} /> Open Public Page
                                </Link>
                                <button
                                    onClick={() => setShowLinkModal(false)}
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* EMAIL VIDEO INVITE MODAL                                                  */}
            {/* ========================================================================= */}
            {emailAppt && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Dispatch Video Meeting Invite</h3>
                                    <p className="text-xs text-gray-400">Send direct calendar & video join instructions</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEmailAppt(null)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSendEmailInvite} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Recipient Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={emailRecipient}
                                    onChange={(e) => setEmailRecipient(e.target.value)}
                                    placeholder="e.g. client@organization.com"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Subject *</label>
                                <input
                                    type="text"
                                    required
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="bg-[#1E293B] p-3.5 rounded-xl border border-white/10 space-y-2">
                                <label className="text-gray-400 font-semibold block">Pre-Composed Message Preview</label>
                                <p className="text-[11px] text-gray-300 leading-relaxed font-mono">
                                    Hi {emailAppt.client_name},<br/><br/>
                                    You are invited to join "{emailAppt.title}" on {emailAppt.date} at {emailAppt.start_time}.<br/><br/>
                                    👉 Join In-System Video Room: {typeof window !== "undefined" ? window.location.origin : "https://www.beraxis.online"}/meet/{emailAppt.meeting_code}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEmailAppt(null)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Send size={14} /> Send Email Invite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* BOOK APPOINTMENT MODAL                                                    */}
            {/* ========================================================================= */}
            {isBookModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                                    <CalendarCheck size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Book Client Appointment</h3>
                                    <p className="text-xs text-gray-400">Schedule video meeting with automated room generation</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsBookModalOpen(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Appointment Type *</label>
                                <select
                                    value={apptType}
                                    onChange={(e) => setApptType(e.target.value as any)}
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                                >
                                    {APPOINTMENT_TYPES.map((t) => (
                                        <option key={t.id} value={t.id}>{t.label} ({t.duration})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Client Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        placeholder="e.g. Tariq Mansoor"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Client Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={clientEmail}
                                        onChange={(e) => setClientEmail(e.target.value)}
                                        placeholder="e.g. tariq@company.pk"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Phone Number (Optional)</label>
                                    <input
                                        type="text"
                                        value={clientPhone}
                                        onChange={(e) => setClientPhone(e.target.value)}
                                        placeholder="e.g. +92 300 1234567"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Client Company</label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g. Nexus Solutions"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Host Staff (Internal)</label>
                                    <select
                                        value={hostName}
                                        onChange={(e) => setHostName(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                                    >
                                        <option value="Salim Ghauri">Salim Ghauri</option>
                                        <option value="Sarah Vance">Sarah Vance</option>
                                        <option value="Bilal Mahmood">Bilal Mahmood</option>
                                        <option value="Jane Smith">Jane Smith</option>
                                        <option value="Bob Wilson">Bob Wilson</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Meeting Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={apptDate}
                                        onChange={(e) => setApptDate(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Time Slot *</label>
                                    <select
                                        value={apptTime}
                                        onChange={(e) => setApptTime(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                                    >
                                        <option value="09:00 AM">09:00 AM</option>
                                        <option value="10:00 AM">10:00 AM</option>
                                        <option value="11:00 AM">11:00 AM</option>
                                        <option value="02:00 PM">02:00 PM</option>
                                        <option value="03:30 PM">03:30 PM</option>
                                        <option value="05:00 PM">05:00 PM</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Meeting Agenda / Notes</label>
                                <textarea
                                    rows={2}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Topics to discuss or specific requirements..."
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsBookModalOpen(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Video size={14} /> Schedule Meeting
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* INSTANT MEETING POPUP MODAL */}
            {showInstantModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                    <div className="bg-[#141C2E] border border-purple-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                                    <Zap size={20} className="text-amber-300 fill-amber-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Instant Video Meeting Link</h3>
                                    <p className="text-xs text-gray-400">Share with external clients or join immediately</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowInstantModal(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-300">Generated Video Room URL</label>
                            <div className="flex items-center gap-2 bg-[#0F172A] border border-purple-500/20 rounded-2xl p-2.5 text-xs font-mono text-purple-200">
                                <span className="flex-1 truncate">{instantMeetingUrl}</span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(instantMeetingUrl);
                                        showToast("📋 Link copied to clipboard!");
                                    }}
                                    className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all cursor-pointer shrink-0"
                                    title="Copy Link"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(instantMeetingUrl);
                                    showToast("📋 Link copied to clipboard!");
                                }}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <Copy size={14} />
                                <span>Copy Link</span>
                            </button>
                            <a
                                href={instantMeetingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all text-center"
                            >
                                <span>Launch Room</span>
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
