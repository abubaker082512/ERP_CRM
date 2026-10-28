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
    Lock
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
            {/* Ambient Background Glows & Glass Refraction Light Centered with Viewport */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[950px] h-[350px] sm:h-[520px] bg-gradient-to-tr from-purple-600/20 via-pink-600/12 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/3 left-4 sm:left-12 w-72 h-72 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-2/3 right-4 sm:right-12 w-72 h-72 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

            {/* Subtle Glass Noise/Grid Layer */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />

            {/* Centralized Hero Container (Middle of Viewport: Top, Bottom, Left, Right) */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center my-auto">
                
                {/* 1. Frosted Glass Capsule Badge */}
                <div className="relative group inline-flex items-center gap-2.5 px-4 py-2 rounded-full backdrop-blur-xl bg-gradient-to-r from-white/[0.08] via-purple-500/[0.08] to-white/[0.05] border border-white/20 hover:border-purple-400/50 text-purple-200 text-xs font-semibold mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_24px_-6px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_12px_28px_-6px_rgba(168,85,247,0.35)] transition-all max-w-full cursor-default">
                    <span className="flex items-center gap-1.5 text-amber-300 font-extrabold uppercase text-[10px] tracking-wider bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-2.5 py-1 rounded-full border border-amber-400/35 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] shrink-0">
                        <Flame size={12} className="text-amber-400 animate-pulse" /> Early Bird Special
                    </span>
                    <span className="truncate sm:overflow-visible text-gray-200 font-medium">All 28 Apps for $1/mo or 1 App Free Forever</span>
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
                    Replace 5+ expensive, disconnected tools like Odoo, Salesforce, and QuickBooks. Run Accounting, POS, Inventory, HR &amp; CRM across 28 unified modules — with <strong className="text-cyan-300 font-semibold drop-shadow-[0_0_8px_rgba(103,232,249,0.3)]">integrated B2B lead discovery</strong> built-in.
                </p>

                {/* 4. Glassmorphic Action Buttons with Identical Height & Equal Spacing */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-4xl mx-auto mb-8 sm:mb-10">
                    {/* Primary Button: Vibrant Frosted Jewel Glass */}
                    <Link 
                        href="/signup" 
                        className="group relative w-full sm:w-auto h-[52px] min-h-[52px] px-6 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 transition-all duration-200 backdrop-blur-xl bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-purple-600/90 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 border border-white/30 hover:border-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_12px_32px_-6px_rgba(168,85,247,0.5)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_16px_40px_-6px_rgba(236,72,153,0.65)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer overflow-hidden whitespace-nowrap"
                    >
                        {/* Glass Sheen Glare */}
                        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                        <span className="relative z-10">Start Free Forever — No Card</span>
                        <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Secondary Button: Frosted Smoky-Violet Glass */}
                    <a 
                        href="#pricing" 
                        className="group relative w-full sm:w-auto h-[52px] min-h-[52px] px-6 py-3.5 rounded-xl font-bold text-sm text-purple-100 hover:text-white flex items-center justify-center gap-2.5 transition-all duration-200 backdrop-blur-xl bg-gradient-to-b from-white/[0.12] via-purple-950/40 to-white/[0.04] hover:bg-purple-900/40 border border-purple-400/40 hover:border-purple-300/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_24px_rgba(0,0,0,0.35)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_12px_30px_rgba(147,51,234,0.35)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer whitespace-nowrap"
                    >
                        <Flame size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                        <span>Get All 28 Apps for $1/mo</span>
                    </a>

                    {/* Tertiary Button: Pure Frosted Crystal Glass */}
                    <button
                        type="button"
                        onClick={() => setIsCalcOpen(true)}
                        className="group relative w-full sm:w-auto h-[52px] min-h-[52px] px-6 py-3.5 rounded-xl font-bold text-sm text-gray-200 hover:text-white flex items-center justify-center gap-2.5 transition-all duration-200 backdrop-blur-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 hover:border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_20px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_12px_24px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer whitespace-nowrap"
                    >
                        <Calculator size={16} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
                        <span>Savings Calculator</span>
                    </button>
                </div>

                {/* 5. Frosted Glass Trust Proof Checklist Strip */}
                <div className="inline-flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 px-5 sm:px-7 py-2.5 rounded-full backdrop-blur-xl bg-white/[0.05] border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_6px_20px_rgba(0,0,0,0.3)] text-xs sm:text-sm text-gray-300 font-medium mb-8 sm:mb-10 max-w-full">
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Check size={11} strokeWidth={3} />
                        </span>
                        <span>1 App 100% Free Forever</span>
                    </span>
                    <span className="hidden sm:inline text-white/20">•</span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Check size={11} strokeWidth={3} />
                        </span>
                        <span>No Credit Card Required</span>
                    </span>
                    <span className="hidden sm:inline text-white/20">•</span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Check size={11} strokeWidth={3} />
                        </span>
                        <span>30-Second Setup</span>
                    </span>
                    <span className="hidden sm:inline text-white/20">•</span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Check size={11} strokeWidth={3} />
                        </span>
                        <span>14-Day Money-Back</span>
                    </span>
                </div>

                {/* 6. Luxury Floating Glass Dock Strip (Enterprise Trust Badges) */}
                <div className="w-full max-w-4xl p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-gradient-to-b from-white/[0.09] via-[#0A0E1A]/75 to-[#0A0E1A]/95 border border-white/20 hover:border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_20px_50px_-10px_rgba(0,0,0,0.6),0_0_40px_rgba(168,85,247,0.12)] transition-all">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-left">
                        {/* Feature 1 */}
                        <div className="group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/40 transition-all cursor-default shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                            <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-400 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] group-hover:scale-110 group-hover:border-purple-300 transition-all shrink-0">
                                <ShieldCheck size={18} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs sm:text-sm text-white font-bold whitespace-nowrap">Enterprise Security</div>
                                <div className="text-[10px] sm:text-[11px] text-gray-400 whitespace-nowrap">256-Bit Encrypted</div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-cyan-500/40 transition-all cursor-default shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                            <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] group-hover:scale-110 group-hover:border-cyan-300 transition-all shrink-0">
                                <Globe size={18} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs sm:text-sm text-white font-bold whitespace-nowrap">Leads Directory</div>
                                <div className="text-[10px] sm:text-[11px] text-gray-400 whitespace-nowrap">10,000+ Verified B2B</div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-amber-500/40 transition-all cursor-default shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-400 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] group-hover:scale-110 group-hover:border-amber-300 transition-all shrink-0">
                                <Zap size={18} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs sm:text-sm text-white font-bold whitespace-nowrap">Instant Sync</div>
                                <div className="text-[10px] sm:text-[11px] text-gray-400 whitespace-nowrap">Real-Time Cloud</div>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-pink-500/40 transition-all cursor-default shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                            <div className="p-2 sm:p-2.5 rounded-xl bg-pink-500/15 border border-pink-400/30 text-pink-400 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] group-hover:scale-110 group-hover:border-pink-300 transition-all shrink-0">
                                <Sparkles size={18} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs sm:text-sm text-white font-bold whitespace-nowrap">28 Unified Apps</div>
                                <div className="text-[10px] sm:text-[11px] text-gray-400 whitespace-nowrap">All-in-One Platform</div>
                            </div>
                        </div>
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
                                    <span>Current Monthly Spend on Other Tools</span>
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
