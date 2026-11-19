"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowRight,
    ShieldCheck,
    Zap,
    Globe,
    Sparkles,
    Flame,
    Calculator,
    X,
    Check,
    Layers,
    Lock,
    UploadCloud,
    Database,
    MessageCircle,
    Star
} from "lucide-react";
import { initSocialAttribution } from "@/lib/abTesting";

export default function Hero() {
    useEffect(() => {
        initSocialAttribution();
    }, []);

    const [isCalcOpen, setIsCalcOpen] = useState(false);
    const [calcUsers, setCalcUsers] = useState(5);
    const [calcCurrentSpend, setCalcCurrentSpend] = useState(350);

    const beraxisAnnualCost = calcUsers * 12; // $1/mo = $12/yr per user
    const currentAnnualSpend = calcCurrentSpend * 12;
    const annualSavings = Math.max(0, currentAnnualSpend - beraxisAnnualCost);

    return (
        <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center pt-28 pb-12 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20">
            {/* Lightweight CSS Radial Ambient Glows (zero GPU blur pass overhead) */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 65% 45% at 50% 42%, rgba(168,85,247,0.16), transparent 70%), radial-gradient(circle at 15% 35%, rgba(147,51,234,0.10), transparent 40%), radial-gradient(circle at 85% 70%, rgba(6,182,212,0.10), transparent 40%)",
                }}
            />

            {/* Subtle Glass Noise/Grid Layer */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.14),rgba(255,255,255,0))] pointer-events-none" />

            {/* Centralized Hero Container (Middle of Viewport: Top, Bottom, Left, Right) */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center my-auto">
                
                {/* 1. Frosted Glass Capsule Badge */}
                <div className="relative group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0D1224]/85 border border-white/20 hover:border-purple-400/50 text-purple-200 text-xs font-semibold mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_24px_-6px_rgba(0,0,0,0.45)] transition-all max-w-full cursor-default">
                    <span className="flex items-center gap-1.5 text-amber-300 font-extrabold uppercase text-[10px] tracking-wider bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-2.5 py-1 rounded-full border border-amber-400/35 shrink-0">
                        <Flame size={12} className="text-amber-400 animate-pulse" /> Early Bird Special
                    </span>
                    <span className="truncate sm:overflow-visible text-gray-200 font-medium">All 30+ Apps for $1/mo or 1 App Free Forever</span>
                    <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>

                {/* 2. Primary Headline (Strictly the ONLY <h1> on the page) */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem] font-black tracking-tight text-white mb-4 sm:mb-6 leading-[1.15] max-w-4xl mx-auto">
                    The All-in-One{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 drop-shadow-[0_2px_15px_rgba(192,132,252,0.35)]">
                        AI ERP &amp; CRM
                    </span>
                    <span className="block mt-2 sm:mt-2.5 text-xl sm:text-2xl md:text-3xl lg:text-[2.35rem] text-gray-200 font-bold tracking-tight">
                        Built to Run &amp; Scale Your Business
                    </span>
                </h1>

                {/* 3. Subheadline */}
                <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 font-normal leading-relaxed">
                    The #1 Free Odoo Alternative in 2026. No need to buy <strong className="text-white font-semibold">Microsoft Excel, PowerPoint, Word, Odoo, QuickBooks, or HubSpot</strong> — BERAXIS AI covers all ERP, CRM, and Office Automation in 30+ unified modules, with <strong className="text-cyan-300 font-semibold drop-shadow-[0_0_8px_rgba(103,232,249,0.3)]">25M+ integrated B2B leads</strong> and AI Voice Pilot built-in.
                </p>

                {/* 4. Glassmorphic Action Buttons with Identical Height & Equal Spacing */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-4xl mx-auto mb-8 sm:mb-10">
                    {/* Primary Button: Vibrant Frosted Jewel Glass */}
                    <Link 
                        href="/signup" 
                        className="group relative w-full sm:w-auto h-[52px] min-h-[52px] px-6 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 transition-all duration-200 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 border border-white/30 hover:border-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_12px_32px_-6px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer overflow-hidden whitespace-nowrap"
                    >
                        {/* Glass Sheen Glare */}
                        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                        <span className="relative z-10">Start Free Forever — No Card</span>
                        <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Secondary Button: Frosted Smoky-Violet Glass */}
                    <a 
                        href="#pricing" 
                        className="group relative w-full sm:w-auto h-[52px] min-h-[52px] px-6 py-3.5 rounded-xl font-bold text-sm text-purple-100 hover:text-white flex items-center justify-center gap-2.5 transition-all duration-200 bg-gradient-to-b from-purple-950/70 to-[#0D1224]/90 hover:bg-purple-900/50 border border-purple-400/40 hover:border-purple-300/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_24px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer whitespace-nowrap"
                    >
                        <Flame size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                        <span>Get All 30+ Apps for $1/mo</span>
                    </a>

                    {/* Tertiary Button: Pure Frosted Crystal Glass */}
                    <button
                        type="button"
                        onClick={() => setIsCalcOpen(true)}
                        className="group relative w-full sm:w-auto h-[52px] min-h-[52px] px-6 py-3.5 rounded-xl font-bold text-sm text-gray-200 hover:text-white flex items-center justify-center gap-2.5 transition-all duration-200 bg-[#0D1224]/85 hover:bg-[#172038] border border-white/20 hover:border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_20px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer whitespace-nowrap"
                    >
                        <Calculator size={16} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
                        <span>Savings Calculator</span>
                    </button>
                </div>

                                {/* 4.5. 100+ Active Users & 4.9★ Social Proof Strip */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 mb-6">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-[#020205] flex items-center justify-center text-[10px] font-extrabold text-white shadow-md">MV</div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-[#020205] flex items-center justify-center text-[10px] font-extrabold text-white shadow-md">SM</div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-[#020205] flex items-center justify-center text-[10px] font-extrabold text-white shadow-md">JR</div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-[#020205] flex items-center justify-center text-[10px] font-extrabold text-white shadow-md">DC</div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-[#020205] flex items-center justify-center text-[9px] font-black text-white shadow-md">+100</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                        <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={13} fill="currentColor" />
                            ))}
                        </div>
                        <span className="font-bold text-white">4.9/5 Rating</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-300">
                            Joined by <strong className="text-white">100+ businesses</strong> this quarter
                        </span>
                    </div>
                </div>

                {/* 5. Crisp Single-Line Trust Proof Checklist Strip */}
                <div className="inline-flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5 gap-y-2 px-5 sm:px-6 py-2.5 rounded-2xl sm:rounded-full bg-[#0D1224]/85 border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_6px_20px_rgba(0,0,0,0.3)] text-xs text-gray-300 font-medium mb-6 max-w-full">
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Check size={11} strokeWidth={3} />
                        </span>
                        <span>1 App Free Forever</span>
                    </span>
                    <span className="hidden sm:inline text-white/20">•</span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Check size={11} strokeWidth={3} />
                        </span>
                        <span>Excel, PPT &amp; Word Built-In</span>
                    </span>
                    <span className="hidden sm:inline text-white/20">•</span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Check size={11} strokeWidth={3} />
                        </span>
                        <span>No Credit Card</span>
                    </span>
                    <span className="hidden sm:inline text-white/20">•</span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Check size={11} strokeWidth={3} />
                        </span>
                        <span>14-Day Money-Back</span>
                    </span>
                </div>

                {/* 5.5. Replaces Strip (At-a-Glance Consolidation) */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-7 text-[11px] text-gray-400">
                    <span className="uppercase tracking-wider font-bold text-gray-500 mr-1">Replaces:</span>
                    {["Excel", "PowerPoint", "Word", "Odoo", "QuickBooks", "HubSpot", "Zoom"].map((tool) => (
                        <span key={tool} className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-gray-300 font-medium">
                            {tool}
                        </span>
                    ))}
                    <span className="text-emerald-400 font-bold ml-1">→ All Included</span>
                </div>

                {/* 6. Luxury Floating Glass Dock Strip (Enterprise Trust Badges) */}
                <div className="w-full max-w-4xl p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#13192B]/90 via-[#0A0E1A]/90 to-[#0A0E1A]/95 border border-white/20 hover:border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_20px_50px_-10px_rgba(0,0,0,0.6),0_0_40px_rgba(168,85,247,0.12)] transition-all">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-left">
                        {/* Feature 1: Migration */}
                        <Link href="/migration" className="relative group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer overflow-hidden">
                            <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/25 text-purple-300 border border-purple-400/30 font-extrabold leading-none">
                                NEW
                            </span>
                            <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-400 group-hover:scale-110 transition-transform shrink-0">
                                <UploadCloud size={18} />
                            </div>
                            <div className="min-w-0 pr-8">
                                <div className="text-xs sm:text-sm text-white font-bold truncate">
                                    1-Click Migration
                                </div>
                                <div className="text-[10px] sm:text-[11px] text-gray-400 truncate">QuickBooks, Odoo, Excel</div>
                            </div>
                        </Link>

                        {/* Feature 2: Leads Directory */}
                        <Link href="/leads-pool" className="group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer overflow-hidden">
                            <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 group-hover:scale-110 transition-transform shrink-0">
                                <Globe size={18} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs sm:text-sm text-white font-bold truncate">B2B Leads Directory</div>
                                <div className="text-[10px] sm:text-[11px] text-cyan-300 truncate font-semibold">48,000+ Contacts</div>
                            </div>
                        </Link>

                        {/* Feature 3: Built-in Office Suite */}
                        <Link href="/features/office-suite" className="group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer overflow-hidden">
                            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                                <Layers size={18} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs sm:text-sm text-white font-bold truncate">Full Office Suite</div>
                                <div className="text-[10px] sm:text-[11px] text-gray-400 truncate">Sheets, Slides, Docs &amp; Meet</div>
                            </div>
                        </Link>

                        {/* Feature 4: Enterprise Security */}
                        <Link href="/security" className="group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-pink-500/40 transition-all cursor-pointer overflow-hidden">
                            <div className="p-2 sm:p-2.5 rounded-xl bg-pink-500/15 border border-pink-400/30 text-pink-400 group-hover:scale-110 transition-transform shrink-0">
                                <ShieldCheck size={18} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs sm:text-sm text-white font-bold truncate">Enterprise Security</div>
                                <div className="text-[10px] sm:text-[11px] text-gray-400 truncate">256-Bit SSL &amp; Cloud RLS</div>
                            </div>
                        </Link>
                    </div>
                </div>

            </div>

                        {/* Savings Calculator Modal with Frosted Glass Overlay & Card */}
            {isCalcOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg bg-[#090D1A]/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_25px_60px_rgba(0,0,0,0.8)] text-left">
                        <button
                            type="button"
                            onClick={() => setIsCalcOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                            <Calculator size={16} />
                            <span>ROI &amp; Cost Savings Calculator</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                            See How Much You Save with Beraxis
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm mb-6">
                            Compare your current monthly spend on fragmented SaaS tools vs. Beraxis Early Bird pricing.
                        </p>

                        <div className="space-y-5 mb-6">
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                                <div className="flex justify-between text-xs text-gray-300 mb-2 font-medium">
                                    <span>Team Members / Seats</span>
                                    <span className="text-white font-bold bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30 text-purple-200">{calcUsers} users</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={calcUsers}
                                    onChange={(e) => setCalcUsers(Number(e.target.value))}
                                    className="w-full accent-purple-500 cursor-pointer"
                                />
                            </div>

                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                                <div className="flex justify-between text-xs text-gray-300 mb-2 font-medium">
                                    <span>Current Monthly Spend (Excel/365, CRM, ERP)</span>
                                    <span className="text-white font-bold bg-pink-500/20 px-2.5 py-0.5 rounded-full border border-pink-500/30 text-pink-200">${calcCurrentSpend}/mo</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="2000"
                                    step="25"
                                    value={calcCurrentSpend}
                                    onChange={(e) => setCalcCurrentSpend(Number(e.target.value))}
                                    className="w-full accent-purple-500 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-purple-900/30 to-pink-950/40 border border-purple-500/30 mb-6 flex items-center justify-between backdrop-blur-md shadow-inner">
                            <div>
                                <span className="text-xs text-gray-400 block font-medium">Estimated Annual Savings</span>
                                <span className="text-2xl sm:text-3xl font-black text-emerald-400 drop-shadow-[0_2px_10px_rgba(52,211,153,0.3)]">
                                    ${annualSavings.toLocaleString()}
                                </span>
                                <span className="text-[11px] text-gray-400 block">/ year saved</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-400 block font-medium">Beraxis Early Bird</span>
                                <span className="text-lg font-bold text-white">
                                    ${beraxisAnnualCost}/yr
                                </span>
                                <span className="text-[11px] text-emerald-300 font-semibold block">($1/mo per seat)</span>
                            </div>
                        </div>

                        <a
                            href="#pricing"
                            onClick={() => setIsCalcOpen(false)}
                            className="group relative w-full min-h-[48px] px-6 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 backdrop-blur-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_10px_25px_rgba(168,85,247,0.4)] active:scale-95 transition-all cursor-pointer"
                        >
                            <span>Lock In $1/mo Early Bird Access</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            )}
        </section>
    );
}
