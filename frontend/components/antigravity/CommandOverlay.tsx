"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAntigravityVoice } from "../../lib/hooks/useAntigravityVoice";
import { useBranchContext } from "../../lib/branchContext";
import {
    Mic,
    MicOff,
    Send,
    X,
    Code,
    Check,
    AlertCircle,
    Volume2,
    VolumeX,
    Sparkles,
    ArrowRight,
    Activity,
    FileText,
    Navigation,
    CheckSquare,
    Clock,
} from "lucide-react";

interface CommandOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const VOICE_PRESETS = [
    { label: "📊 Read Financial Summary", command: "Read my financial summary" },
    { label: "🧾 Create Invoice ($1,250)", command: "Create invoice for Acme Global for $1250" },
    { label: "📑 Record Vendor Bill ($320)", command: "Record vendor bill from Cloud Server Co for $320" },
    { label: "✅ Add To-Do Task", command: "Add task Follow up with enterprise clients at 3 PM" },
    { label: "📦 Add Product ($89)", command: "Add product Wireless Barcode Scanner price $89" },
    { label: "💼 Open Accounting", command: "Open Accounting" },
    { label: "🎯 Open CRM Pipeline", command: "Open CRM" },
    { label: "🏪 Open Point of Sale", command: "Open Point of Sale" },
];

export default function CommandOverlay({ isOpen, onClose }: CommandOverlayProps) {
    const router = useRouter();
    const { activeBranch } = useBranchContext();
    const {
        status,
        transcript,
        liveInput,
        requiresApproval,
        codeSnippet,
        error,
        voiceEnabled,
        history,
        lastAction,
        setVoiceEnabled,
        startRecording,
        stopRecording,
        sendTextCommand,
        executeSnippet,
        declineSnippet,
        stopSpeaking,
        resetState,
    } = useAntigravityVoice();

    const [textInput, setTextInput] = useState("");

    if (!isOpen) return null;

    const handleSendText = () => {
        if (!textInput.trim()) return;
        sendTextCommand(textInput);
        setTextInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSendText();
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-end p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
            {/* Sliding Panel */}
            <div className="relative w-full max-w-lg h-[92vh] bg-[#0B0F1C]/95 border border-purple-500/40 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col overflow-hidden text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/30">
                            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                                <Mic className="w-5 h-5 text-purple-400" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm sm:text-base font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-300 to-pink-400">
                                    BERAXIS VOICE OPERATIONS
                                </h2>
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                                    Live Duplex
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                                Active Entity: <strong className="text-slate-200">{activeBranch?.name || "Isolated Workspace"}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => {
                                if (voiceEnabled) stopSpeaking();
                                setVoiceEnabled(!voiceEnabled);
                            }}
                            title={voiceEnabled ? "Voice Reply Enabled (Click to Mute)" : "Voice Reply Muted (Click to Enable)"}
                            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                                voiceEnabled
                                    ? "bg-purple-500/15 border-purple-500/40 text-purple-300 hover:bg-purple-500/25"
                                    : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                            }`}
                        >
                            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => {
                                resetState();
                                onClose();
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                            title="Close Voice Pilot"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 p-5 overflow-y-auto space-y-5 custom-scrollbar">
                    {/* Active Voice Microphone Centerpiece */}
                    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col items-center text-center shadow-inner relative overflow-hidden">
                        <div className="relative flex items-center justify-center my-2">
                            {status === "recording" && (
                                <>
                                    <span className="absolute w-24 h-24 rounded-full bg-red-500/20 animate-ping" />
                                    <span className="absolute w-20 h-20 rounded-full bg-purple-500/20 animate-pulse" />
                                </>
                            )}
                            {status === "speaking" && (
                                <span className="absolute w-24 h-24 rounded-full bg-sky-500/20 animate-pulse" />
                            )}

                            {status === "recording" ? (
                                <button
                                    onClick={stopRecording}
                                    className="relative z-10 p-5 bg-gradient-to-tr from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-full text-white shadow-[0_0_35px_rgba(239,68,68,0.6)] transition-all transform hover:scale-105 cursor-pointer"
                                    title="Stop Listening"
                                >
                                    <MicOff className="w-8 h-8" />
                                </button>
                            ) : (
                                <button
                                    onClick={startRecording}
                                    className="relative z-10 p-5 bg-gradient-to-tr from-sky-500 via-purple-600 to-pink-500 hover:opacity-95 rounded-full text-white shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all transform hover:scale-105 cursor-pointer"
                                    title="Tap to Speak Voice Command"
                                >
                                    <Mic className="w-8 h-8" />
                                </button>
                            )}
                        </div>

                        <div className="mt-2">
                            {status === "recording" ? (
                                <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-widest animate-pulse">
                                        <span className="w-2 h-2 rounded-full bg-red-400" /> Listening Now... Speak Command
                                    </span>
                                    {liveInput && (
                                        <p className="text-xs text-sky-300 font-medium italic mt-1">
                                            &ldquo;{liveInput}&rdquo;
                                        </p>
                                    )}
                                </div>
                            ) : status === "speaking" ? (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                                        🔊 Speaking Response...
                                    </span>
                                    <button
                                        onClick={stopSpeaking}
                                        className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                                    >
                                        Stop Audio
                                    </button>
                                </div>
                            ) : status === "processing" ? (
                                <span className="text-xs font-bold text-purple-400 animate-pulse">
                                    Executing Voice Operation...
                                </span>
                            ) : (
                                <p className="text-xs text-slate-400">
                                    Tap the microphone and say{" "}
                                    <span className="text-purple-300 font-semibold">&ldquo;Create invoice for Acme for $1,200&rdquo;</span> or{" "}
                                    <span className="text-sky-300 font-semibold">&ldquo;Read my financial summary&rdquo;</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Live Response Output Box */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-inner">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-wider text-purple-400 uppercase flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> Voice Operation Result
                            </span>
                            {liveInput && (
                                <span className="text-[10px] text-slate-400 truncate max-w-[220px]">
                                    Heard: &ldquo;{liveInput}&rdquo;
                                </span>
                            )}
                        </div>

                        {transcript ? (
                            <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-100 bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5">
                                {transcript}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 italic py-2">
                                Ready for voice navigation, instant invoicing, vendor bill entry, POS product creation, To-Do tasks, and real-time financial briefings.
                            </p>
                        )}

                        {lastAction && (
                            <button
                                onClick={() => {
                                    onClose();
                                    router.push(lastAction.href);
                                }}
                                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
                            >
                                <span>{lastAction.label}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Errors */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Interactive Sandbox Confirmation Panel */}
                    {requiresApproval && (
                        <div className="bg-slate-950/90 border border-purple-500/50 rounded-2xl p-4 space-y-3 shadow-xl">
                            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                                <Code className="w-4 h-4" />
                                <span>Review Generated Automation Workflow</span>
                            </div>
                            <pre className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-[11px] font-mono overflow-x-auto text-emerald-400 max-h-[150px]">
                                <code>{codeSnippet}</code>
                            </pre>
                            <div className="flex gap-2.5">
                                <button
                                    onClick={executeSnippet}
                                    className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <Check className="w-4 h-4" /> Approve Execution
                                </button>
                                <button
                                    onClick={declineSnippet}
                                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" /> Decline
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Instant One-Click Voice Operation Presets */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Instant Voice Commands (Click or Speak):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {VOICE_PRESETS.map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => sendTextCommand(preset.command)}
                                    className="text-left px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500/40 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
                                >
                                    <span className="truncate font-medium">{preset.label}</span>
                                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-purple-400 transition-opacity shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Voice Operations Log */}
                    {history.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> Recent Voice Operations
                            </span>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {history.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/70 text-[11px] space-y-1"
                                    >
                                        <div className="flex items-center justify-between text-slate-400">
                                            <span className="font-semibold text-purple-300">&ldquo;{item.userCommand}&rdquo;</span>
                                            <span className="text-[10px]">{item.timestamp}</span>
                                        </div>
                                        <p className="text-slate-300 line-clamp-2">{item.assistantResponse}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Input Bar */}
                <div className="p-4 bg-slate-950 border-t border-slate-800/80">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder='Speak or type (e.g., "Create invoice for Globex for $950")'
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-500"
                        />
                        <button
                            onClick={handleSendText}
                            disabled={!textInput.trim()}
                            className="px-3.5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 rounded-xl text-white transition-all cursor-pointer flex items-center justify-center"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
