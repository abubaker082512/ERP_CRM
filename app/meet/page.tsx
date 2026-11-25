"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import {
    Video,
    Zap,
    Link2,
    Calendar,
    Copy,
    CheckCircle2,
    ExternalLink,
    Shield,
    Sparkles,
    Users,
    Clock,
    Monitor,
    ArrowRight,
    Lock,
    Radio
} from "lucide-react";

export default function MeetLandingPage() {
    const router = useRouter();
    const [joinCode, setJoinCode] = useState("");
    const [createdLink, setCreatedLink] = useState("");
    const [toastMsg, setToastMsg] = useState("");
    const [recentAttendees, setRecentAttendees] = useState<{ room_id: string; name: string; email: string; status: string; timestamp: string }[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("beraxis_meet_attendees");
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setRecentAttendees(parsed.slice(0, 8));
            }
        } catch {}
    }, []);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 4000);
    };

    // 1. Start Instant Meeting (Immediate launch as Host — skips guest check-in gate!)
    const handleStartInstantMeeting = () => {
        const uniqueRoomCode = `meet-${Math.random().toString(36).substring(2, 8)}-${Math.random().toString(36).substring(2, 6)}`;
        try {
            localStorage.setItem(`beraxis_meet_host_${uniqueRoomCode}`, "1");
            sessionStorage.setItem(`beraxis_meet_host_${uniqueRoomCode}`, "1");
        } catch {}
        router.push(`/meet/${uniqueRoomCode}?host=1`);
    };

    // 2. Create Meeting Link for Later (Shareable clean client URL; creator recorded as Host)
    const handleCreateLinkForLater = () => {
        const uniqueRoomCode = `meet-${Math.random().toString(36).substring(2, 8)}-${Math.random().toString(36).substring(2, 6)}`;
        try {
            localStorage.setItem(`beraxis_meet_host_${uniqueRoomCode}`, "1");
            sessionStorage.setItem(`beraxis_meet_host_${uniqueRoomCode}`, "1");
        } catch {}
        const url = typeof window !== "undefined"
            ? `${window.location.origin}/meet/${uniqueRoomCode}`
            : `https://www.beraxis.online/meet/${uniqueRoomCode}`;
        setCreatedLink(url);
        navigator.clipboard.writeText(url);
        showToast("📋 Instant video meeting link created & copied to clipboard!");
    };

    // 3. Join with Code
    const handleJoinWithCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode.trim()) return;
        let cleanCode = joinCode.trim();
        // If user pasted a full URL, extract the ID
        if (cleanCode.includes("/meet/")) {
            cleanCode = cleanCode.split("/meet/")[1];
        }
        router.push(`/meet/${cleanCode}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-[#070B14] text-white flex flex-col font-sans">
            <StandardModuleHeader
                moduleName="Meet"
                moduleIcon={<Video size={20} />}
                searchPlaceholder="Search meetings..."
                menuItems={[
                    { name: "Meet Hub", href: "/meet" },
                    { name: "Appointments", href: "/appointments" },
                    { name: "Calendar", href: "/calendar" },
                    { name: "To-Do", href: "/todo" }
                ]}
            />

            {toastMsg && (
                <div className="fixed top-20 right-6 z-50 bg-[#1E293B] border border-purple-500/40 text-purple-200 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-2xl backdrop-blur-md animate-in fade-in">
                    <Sparkles size={16} className="text-purple-400 shrink-0" />
                    <span>{toastMsg}</span>
                </div>
            )}

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    {/* Left Column: Instant Actions */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
                                <Shield size={14} className="text-purple-400" />
                                <span>Zero Subscriptions Needed • In-System WebRTC</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                                High-Definition Video Calls <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
                                    Built Directly Into Beraxis
                                </span>
                            </h1>

                            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl">
                                Connect with clients, vendors, and team members with one click. Enjoy crystal-clear audio, HD video, live screen sharing, chat, and in-system call recordings.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Start Instant Meeting */}
                            <button
                                onClick={handleStartInstantMeeting}
                                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                            >
                                <Zap size={18} className="text-amber-300 fill-amber-300" />
                                <span>Start Instant Meeting</span>
                            </button>

                            {/* Create Link for Later */}
                            <button
                                onClick={handleCreateLinkForLater}
                                className="px-5 py-3.5 bg-[#1E293B] hover:bg-[#2E3B52] text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 border border-gray-700 transition-all cursor-pointer"
                            >
                                <Link2 size={18} className="text-indigo-400" />
                                <span>Create Link for Later</span>
                            </button>
                        </div>

                        {/* Created Link Display Banner */}
                        {createdLink && (
                            <div className="bg-[#141C2E] border border-purple-500/30 rounded-2xl p-4 space-y-3 animate-in fade-in zoom-in-95">
                                <div className="flex items-center justify-between text-xs text-purple-300 font-bold">
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                        Your Instant Meeting Link is Ready
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-normal">Auto-copied to clipboard</span>
                                </div>
                                <div className="flex items-center gap-2 bg-[#0F172A] border border-white/5 rounded-xl p-2.5 text-xs font-mono text-purple-200">
                                    <span className="flex-1 truncate">{createdLink}</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(createdLink);
                                            showToast("📋 Link copied to clipboard!");
                                        }}
                                        className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors cursor-pointer"
                                        title="Copy Link"
                                    >
                                        <Copy size={13} />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={`${createdLink}?host=1`}
                                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
                                    >
                                        <span>Join Room Now (as Host)</span>
                                        <ArrowRight size={13} />
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Join with Code Form */}
                        <form onSubmit={handleJoinWithCode} className="flex items-center gap-2 max-w-md">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                placeholder="Enter meeting code or link (e.g. meet-xyz-123)"
                                className="flex-1 bg-[#141C2E] border border-gray-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!joinCode.trim()}
                                className="px-5 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-bold rounded-2xl text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                Join
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Feature Preview Cards */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-[#141C2E]/80 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
                            <h3 className="font-bold text-white text-base flex items-center gap-2">
                                <Sparkles size={18} className="text-purple-400" />
                                <span>Why Beraxis Meet?</span>
                            </h3>

                            <div className="space-y-4 text-xs">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                                        <Monitor size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">Full HD Screen Sharing</div>
                                        <div className="text-gray-400">Share pitch decks, spreadsheets, or software demos in crisp 1080p.</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                                        <Radio size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">In-System Call Recording</div>
                                        <div className="text-gray-400">Record calls directly in your browser and download WebM files on the fly.</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                                        <Lock size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">Client Name &amp; Email Lobby Gate</div>
                                        <div className="text-gray-400">Any client or external user opening your link enters their Name &amp; Email first and waits in the lobby until you click Admit.</div>
                                    </div>
                                </div>
                            </div>

                            {recentAttendees.length > 0 && (
                                <div className="pt-3 border-t border-gray-800 space-y-2">
                                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center justify-between">
                                        <span>Recent Recorded Meeting Guests</span>
                                        <span>Room</span>
                                    </div>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                        {recentAttendees.map((a, idx) => (
                                            <div key={`${a.email}-${idx}`} className="flex items-center justify-between gap-2 bg-black/30 border border-white/5 rounded-xl px-3 py-2 text-xs">
                                                <div className="min-w-0">
                                                    <div className="font-bold text-white truncate">{a.name}</div>
                                                    <div className="text-[10px] text-purple-300 truncate">{a.email}</div>
                                                </div>
                                                <Link
                                                    href={`/meet/${a.room_id}`}
                                                    className="text-[10px] font-mono text-cyan-300 hover:underline shrink-0"
                                                >
                                                    {a.room_id}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t border-gray-800">
                                <Link
                                    href="/appointments"
                                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Calendar size={14} className="text-purple-400" />
                                    <span>View Scheduled Appointments & Public Booking</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
