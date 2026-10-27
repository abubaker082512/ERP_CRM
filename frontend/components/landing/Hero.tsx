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
    Layers
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
        <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[350px] sm:h-[450px] bg-gradient-to-tr from-purple-600/15 via-pink-600/10 to-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 left-4 sm:left-12 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-4 sm:right-12 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                
                {/* 1. Early Bird Pill Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-purple-500/40 text-purple-200 text-xs font-semibold mb-6 sm:mb-8 shadow-lg backdrop-blur-md transition-colors">
                    <span className="flex items-center gap-1 text-amber-300 font-extrabold uppercase text-[10px] tracking-wider bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25">
                        <Flame size={12} className="text-amber-400 animate-pulse" /> Early Bird Special
                    </span>
                    <span>All 28 Apps for $1/mo or 1 App Free Forever</span>
                </div>

                {/* 2. Primary Headline (Strictly the ONLY <h1> on the page) */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] font-black tracking-tight text-white mb-6 sm:mb-8 leading-[1.1] max-w-4xl mx-auto">
                    The All-in-One{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                        AI ERP &amp; CRM
                    </span>
                    <span className="block mt-2 sm:mt-3 text-xl sm:text-3xl md:text-4xl lg:text-[2.6rem] text-gray-200 font-bold tracking-tight">
                        Built to Run &amp; Scale Your Business
                    </span>
                </h1>

                {/* 3. Subheadline */}
                <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8 sm:mb-10 font-normal leading-relaxed">
                    Replace 5+ expensive, disconnected tools like Odoo, Salesforce, and QuickBooks. Run Accounting, POS, Inventory, HR &amp; CRM across 28 unified modules — with <strong className="text-cyan-300 font-semibold">25M+ verified B2B leads</strong> built-in.
                </p>

                {/* 4. Action Buttons (Standardized Equal Padding & Heights with Zero Offsets) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-2xl mx-auto mb-8 sm:mb-10">
                    <Link 
                        href="/signup" 
                        className="galaxy-btn-primary w-full sm:w-auto"
                    >
                        <span>Start Free Forever — No Card</span>
                        <ArrowRight size={16} />
                    </Link>

                    <a 
                        href="#pricing" 
                        className="galaxy-btn-outline w-full sm:w-auto"
                    >
                        <Flame size={16} className="text-amber-400" />
                        <span>Get All 28 Apps for $1/mo</span>
                    </a>

                    <button
                        type="button"
                        onClick={() => setIsCalcOpen(true)}
                        className="galaxy-btn-secondary w-full sm:w-auto"
                    >
                        <Calculator size={16} className="text-amber-400" />
                        <span>Savings Calculator</span>
                    </button>
                </div>

                {/* 5. Trust Proof Checklist */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2.5 text-xs sm:text-sm text-gray-400 font-medium mb-12 sm:mb-16">
                    <span className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span> 1 App 100% Free Forever
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span> No Credit Card Required
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span> 30-Second Instant Setup
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span> 14-Day Money-Back Guarantee
                    </span>
                </div>

                {/* 6. Enterprise Trust Badges Strip (Grounding the Independent Hero) */}
                <div className="w-full max-w-4xl py-4 sm:py-5 px-4 sm:px-6 rounded-2xl bg-[#0A0E1A]/80 border border-white/10 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-300 font-medium">
                        <ShieldCheck size={18} className="text-purple-400 shrink-0" />
                        <span className="truncate">Enterprise Security</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-300 font-medium">
                        <Globe size={18} className="text-cyan-400 shrink-0" />
                        <span className="truncate">25M+ Leads Pool</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-300 font-medium">
                        <Zap size={18} className="text-amber-400 shrink-0" />
                        <span className="truncate">45ms Edge Sync</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-300 font-medium">
                        <Sparkles size={18} className="text-pink-400 shrink-0" />
                        <span className="truncate">28 Unified Apps</span>
                    </div>
                </div>

            </div>

            {/* Savings Calculator Modal */}
            {isCalcOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg bg-[#090D1A] border border-purple-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
                        <button
                            type="button"
                            onClick={() => setIsCalcOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
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

                        <div className="space-y-4 mb-6">
                            <div>
                                <div className="flex justify-between text-xs text-gray-300 mb-1.5 font-medium">
                                    <span>Team Members / Seats</span>
                                    <span className="text-white font-bold">{calcUsers} users</span>
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

                            <div>
                                <div className="flex justify-between text-xs text-gray-300 mb-1.5 font-medium">
                                    <span>Current Monthly Spend on Other Tools</span>
                                    <span className="text-white font-bold">${calcCurrentSpend}/mo</span>
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

                        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 mb-6 flex items-center justify-between">
                            <div>
                                <span className="text-xs text-gray-400 block">Estimated Annual Savings</span>
                                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                                    ${annualSavings.toLocaleString()}
                                </span>
                                <span className="text-[11px] text-gray-400 block">/ year</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-400 block">Beraxis Early Bird</span>
                                <span className="text-lg font-bold text-white">
                                    ${beraxisAnnualCost}/yr
                                </span>
                                <span className="text-[11px] text-emerald-300 font-semibold block">($1/mo per seat)</span>
                            </div>
                        </div>

                        <a
                            href="#pricing"
                            onClick={() => setIsCalcOpen(false)}
                            className="galaxy-btn-primary w-full"
                        >
                            <span>Lock In $1/mo Early Bird Access</span>
                            <ArrowRight size={16} />
                        </a>
                    </div>
                </div>
            )}
        </section>
    );
}
