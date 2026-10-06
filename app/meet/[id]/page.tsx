"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Mic,
    MicOff,
    Video as VideoIcon,
    VideoOff,
    Monitor,
    MessageSquare,
    Users,
    PhoneOff,
    Settings,
    Copy,
    Share2,
    Mail,
    Send,
    Sparkles,
    Shield,
    CheckCircle2,
    X,
    Maximize2,
    Minimize2,
    Hand,
    MoreVertical,
    Circle,
    Building2
} from "lucide-react";

type ChatMessage = {
    id: string;
    sender: string;
    time: string;
    text: string;
    isHost?: boolean;
};

export default function InSystemVideoMeetPage() {
    const params = useParams();
    const router = useRouter();
    const meetId = (typeof params?.id === "string" ? params.id : "room-live-demo");

    // Conference Call State
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [isRecording, setIsRecording] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Side Drawers
    const [activeDrawer, setActiveDrawer] = useState<"chat" | "participants" | "invite" | null>(null);

    // Call Timer
    const [callSeconds, setCallSeconds] = useState(48); // Initial offset for active call feel
    useEffect(() => {
        const interval = setInterval(() => setCallSeconds(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTimer = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Participants
    const [participants, setParticipants] = useState([
        { id: "p1", name: "Salim Ghauri (You)", role: "Host / Principal Architect", isHost: true, isMuted: false, avatarBg: "bg-blue-600" },
        { id: "p2", name: "Tariq Mansoor", role: "Client / Nexus Solutions", isHost: false, isMuted: false, avatarBg: "bg-purple-600" }
    ]);

    // Chat messages
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: "m1", sender: "Salim Ghauri", time: "10:30 AM", text: "Welcome to the Beraxis ERP discovery meeting! Glad to have you here.", isHost: true },
        { id: "m2", sender: "Tariq Mansoor", time: "10:31 AM", text: "Thanks Salim! Excited to see the multi-tenant architecture and leads scraper.", isHost: false }
    ]);
    const [chatInput, setChatInput] = useState("");

    // Email Invite Modal
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteName, setInviteName] = useState("");
    const [toastMsg, setToastMsg] = useState("");

    // Call End Dialog
    const [isCallEnded, setIsCallEnded] = useState(false);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const newMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            sender: "Salim Ghauri",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: chatInput.trim(),
            isHost: true
        };

        setMessages([...messages, newMsg]);
        setChatInput("");
    };

    const handleSendEmailInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        showToast(`✉️ Instant video meeting invite dispatched to ${inviteEmail}!`);
        setInviteEmail("");
        setInviteName("");
        setActiveDrawer(null);
    };

    const copyMeetingUrl = () => {
        const url = typeof window !== "undefined" ? window.location.href : `https://www.beraxis.online/meet/${meetId}`;
        navigator.clipboard.writeText(url);
        showToast("📋 Meeting room URL copied to clipboard!");
    };

    return (
        <div className="h-screen w-screen bg-[#070B14] text-white flex flex-col overflow-hidden select-none font-sans">
            {/* Top Conference Header */}
            <header className="h-14 bg-[#0F172A]/90 border-b border-gray-800/80 px-4 md:px-6 flex items-center justify-between shrink-0 backdrop-blur-md z-20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                            B
                        </div>
                        <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">Beraxis Video Meet</span>
                    </div>

                    <span className="text-gray-600 hidden sm:inline">•</span>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-300 font-mono bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">
                            {meetId}
                        </span>
                        {isRecording && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                REC (In-System)
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 bg-[#1E293B] px-3 py-1 rounded-xl border border-gray-700 font-mono font-bold text-gray-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>{formatTimer(callSeconds)}</span>
                    </div>

                    <button
                        onClick={copyMeetingUrl}
                        className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer hidden md:flex"
                        title="Copy Meeting Link to Share"
                    >
                        <Copy size={13} />
                        <span>Copy Link</span>
                    </button>
                </div>
            </header>

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-16 right-6 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in">
                    <CheckCircle2 size={16} />
                    <span>{toastMsg}</span>
                </div>
            )}

            {/* Main Stage & Drawers */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Video Grid Viewport */}
                <div className="flex-1 p-3 md:p-6 flex flex-col justify-center items-center">
                    {isCallEnded ? (
                        <div className="max-w-md w-full bg-[#1E293B] border border-gray-700 rounded-3xl p-8 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
                            <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto">
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Call Ended</h2>
                            <p className="text-xs text-gray-400">
                                Total duration: <span className="text-white font-mono font-bold">{formatTimer(callSeconds)}</span>. Meeting notes & recording will be linked to your Beraxis CRM appointment record.
                            </p>
                            <div className="pt-2 flex gap-3">
                                <button
                                    onClick={() => router.push("/appointments")}
                                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-purple-600/30"
                                >
                                    Back to Appointments
                                </button>
                                <button
                                    onClick={() => setIsCallEnded(false)}
                                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs"
                                >
                                    Rejoin Call
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={`w-full h-full max-w-6xl grid gap-4 transition-all ${
                            isScreenSharing ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                        }`}>
                            {/* Host Video Tile (You) */}
                            <div className="bg-[#141C2E] border border-gray-800 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl group min-h-[260px]">
                                {isVideoOff ? (
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                                            SG
                                        </div>
                                        <span className="text-xs text-gray-400 mt-2 font-medium">Camera is Off</span>
                                    </div>
                                ) : (
                                    <div className="flex-1 relative bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B] flex items-center justify-center overflow-hidden">
                                        {/* Simulated Active Video Avatar / Ambient Flow */}
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,transparent_70%)]" />
                                        <div className="relative z-10 flex flex-col items-center gap-3">
                                            <div className="relative">
                                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-2xl border-2 border-indigo-400/40">
                                                    SG
                                                </div>
                                                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#141C2E] flex items-center justify-center">
                                                    <Mic size={10} className="text-white" />
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-300 font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/5">
                                                Salim Ghauri (Host Camera Live)
                                            </span>
                                        </div>

                                        {/* Live Audio Waveform Animation */}
                                        {!isMuted && (
                                            <div className="absolute bottom-4 left-4 flex items-end gap-1 h-4">
                                                <span className="w-1 bg-emerald-400 h-2 rounded-full animate-pulse" />
                                                <span className="w-1 bg-emerald-400 h-4 rounded-full animate-pulse" />
                                                <span className="w-1 bg-emerald-400 h-3 rounded-full animate-pulse" />
                                                <span className="w-1 bg-emerald-400 h-1.5 rounded-full animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tile Footer Label */}
                                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-xs flex items-center gap-2 text-white font-medium z-10">
                                    <span>Salim Ghauri (You)</span>
                                    {isMuted && <MicOff size={13} className="text-rose-400" />}
                                </div>
                            </div>

                            {/* Guest Video Tile */}
                            <div className="bg-[#141C2E] border border-gray-800 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl group min-h-[260px]">
                                <div className="flex-1 relative bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#3B0764]/40 flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0,transparent_70%)]" />
                                    <div className="relative z-10 flex flex-col items-center gap-3">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold text-white shadow-2xl border-2 border-purple-400/40">
                                                TM
                                            </div>
                                            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#141C2E] flex items-center justify-center">
                                                <Mic size={10} className="text-white" />
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-300 font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/5">
                                            Tariq Mansoor (Client Feed)
                                        </span>
                                    </div>
                                </div>

                                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-xs flex items-center gap-2 text-white font-medium z-10">
                                    <span>Tariq Mansoor (Nexus Solutions)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side Drawer (Chat / Participants / Invite) */}
                {activeDrawer && (
                    <aside className="w-80 md:w-96 bg-[#0F172A] border-l border-gray-800 flex flex-col shadow-2xl z-30 animate-in slide-in-from-right duration-200">
                        {/* Drawer Header */}
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                            <h3 className="font-bold text-white text-sm capitalize flex items-center gap-2">
                                {activeDrawer === "chat" && <><MessageSquare size={16} className="text-purple-400" /> In-Meeting Chat</>}
                                {activeDrawer === "participants" && <><Users size={16} className="text-purple-400" /> Participants ({participants.length})</>}
                                {activeDrawer === "invite" && <><Mail size={16} className="text-purple-400" /> Invite via Email</>}
                            </h3>
                            <button
                                onClick={() => setActiveDrawer(null)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {/* CHAT DRAWER */}
                            {activeDrawer === "chat" && (
                                <div className="h-full flex flex-col justify-between">
                                    <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                                        {messages.map((m) => (
                                            <div key={m.id} className="space-y-1">
                                                <div className="flex items-center justify-between text-[10px] text-gray-400">
                                                    <span className={`font-bold ${m.isHost ? "text-purple-400" : "text-cyan-400"}`}>{m.sender}</span>
                                                    <span>{m.time}</span>
                                                </div>
                                                <div className="bg-[#1E293B] p-2.5 rounded-xl border border-white/5 text-xs text-gray-200">
                                                    {m.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <form onSubmit={handleSendMessage} className="pt-3 border-t border-gray-800 flex gap-2">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Send message to room..."
                                            className="flex-1 bg-[#1E293B] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                        >
                                            <Send size={14} />
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* PARTICIPANTS DRAWER */}
                            {activeDrawer === "participants" && (
                                <div className="space-y-3">
                                    {participants.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#1E293B] border border-white/5">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-xl ${p.avatarBg} text-white font-bold text-xs flex items-center justify-center`}>
                                                    {p.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-xs">{p.name}</div>
                                                    <div className="text-[10px] text-gray-400">{p.role}</div>
                                                </div>
                                            </div>
                                            {p.isHost && (
                                                <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                                                    Host
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    <div className="pt-4">
                                        <button
                                            onClick={() => setActiveDrawer("invite")}
                                            className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                        >
                                            <Mail size={14} />
                                            <span>+ Invite Another Participant</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* EMAIL INVITE DRAWER */}
                            {activeDrawer === "invite" && (
                                <form onSubmit={handleSendEmailInvite} className="space-y-4 text-xs">
                                    <p className="text-gray-400 text-[11px] leading-relaxed">
                                        Enter an email address to dispatch an instant in-system video room invite link directly from Beraxis.
                                    </p>

                                    <div>
                                        <label className="block text-gray-300 font-semibold mb-1">Participant Name</label>
                                        <input
                                            type="text"
                                            value={inviteName}
                                            onChange={(e) => setInviteName(e.target.value)}
                                            placeholder="e.g. Kashif Rauf"
                                            className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 font-semibold mb-1">Email Address *</label>
                                        <input
                                            type="email"
                                            required
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="e.g. kashif@company.com"
                                            className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                                        >
                                            Dispatch Video Room Invite
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </aside>
                )}
            </div>

            {/* Bottom Control Bar */}
            <footer className="h-20 bg-[#0F172A] border-t border-gray-800/80 px-4 md:px-8 flex items-center justify-between shrink-0 z-20">
                {/* Left Info */}
                <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Shield size={14} className="text-emerald-400" />
                        <span>Encrypted WebRTC Room</span>
                    </div>
                </div>

                {/* Center Call Actions */}
                <div className="flex items-center gap-3 mx-auto">
                    {/* Mic */}
                    <button
                        onClick={() => {
                            setIsMuted(!isMuted);
                            showToast(isMuted ? "Microphone unmuted" : "Microphone muted");
                        }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                            isMuted
                                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                                : "bg-[#1E293B] hover:bg-[#2E3B52] text-white border border-white/10"
                        }`}
                        title={isMuted ? "Unmute Mic" : "Mute Mic"}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    {/* Camera */}
                    <button
                        onClick={() => {
                            setIsVideoOff(!isVideoOff);
                            showToast(isVideoOff ? "Camera turned on" : "Camera turned off");
                        }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                            isVideoOff
                                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                                : "bg-[#1E293B] hover:bg-[#2E3B52] text-white border border-white/10"
                        }`}
                        title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                    >
                        {isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
                    </button>

                    {/* Screen Share */}
                    <button
                        onClick={() => {
                            setIsScreenSharing(!isScreenSharing);
                            showToast(isScreenSharing ? "Screen sharing stopped" : "Screen sharing started");
                        }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                            isScreenSharing
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                                : "bg-[#1E293B] hover:bg-[#2E3B52] text-white border border-white/10"
                        }`}
                        title="Share Screen"
                    >
                        <Monitor size={20} />
                    </button>

                    {/* Raise Hand */}
                    <button
                        onClick={() => {
                            setIsHandRaised(!isHandRaised);
                            showToast(isHandRaised ? "Hand lowered" : "Hand raised ✋");
                        }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                            isHandRaised
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                                : "bg-[#1E293B] hover:bg-[#2E3B52] text-white border border-white/10"
                        }`}
                        title="Raise Hand"
                    >
                        <Hand size={20} />
                    </button>

                    {/* End Call Button */}
                    <button
                        onClick={() => setIsCallEnded(true)}
                        className="h-12 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-rose-600/30 transition-all cursor-pointer active:scale-95 ml-2"
                        title="Leave / End Meeting"
                    >
                        <PhoneOff size={18} />
                        <span className="hidden sm:inline">End Call</span>
                    </button>
                </div>

                {/* Right Drawer Toggles */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveDrawer(activeDrawer === "chat" ? null : "chat")}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            activeDrawer === "chat"
                                ? "bg-purple-600 border-purple-500 text-white"
                                : "bg-[#1E293B] hover:bg-[#2E3B52] border-white/10 text-gray-300"
                        }`}
                        title="Chat"
                    >
                        <MessageSquare size={18} />
                    </button>

                    <button
                        onClick={() => setActiveDrawer(activeDrawer === "participants" ? null : "participants")}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            activeDrawer === "participants"
                                ? "bg-purple-600 border-purple-500 text-white"
                                : "bg-[#1E293B] hover:bg-[#2E3B52] border-white/10 text-gray-300"
                        }`}
                        title="Participants"
                    >
                        <Users size={18} />
                    </button>

                    <button
                        onClick={() => setActiveDrawer(activeDrawer === "invite" ? null : "invite")}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            activeDrawer === "invite"
                                ? "bg-cyan-600 border-cyan-500 text-white"
                                : "bg-[#1E293B] hover:bg-[#2E3B52] border-white/10 text-gray-300"
                        }`}
                        title="Email Invite"
                    >
                        <Mail size={18} />
                    </button>
                </div>
            </footer>
        </div>
    );
}
