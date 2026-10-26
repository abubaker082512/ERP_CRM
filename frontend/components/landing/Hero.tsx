"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowRight,
    ShieldCheck,
    Zap,
    Globe,
    Sparkles,
    CheckCircle,
    Flame,
    Calculator,
    X,
    Building2,
    Users,
    TrendingUp,
    ChevronDown
} from "lucide-react";
import { initSocialAttribution } from "@/lib/abTesting";

export default function Hero() {
    useEffect(() => {
        initSocialAttribution();
    }, []);

    const [isCalcOpen, setIsCalcOpen] = useState(false);

    return (
        <div className="relative overflow-hidden transform-gpu">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-28 pb-10 sm:pb-14">
                
                {/* Early Bird Deal Pill Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-amber-500/15 border border-purple-500/30 text-purple-200 text-xs font-semibold mb-6 shadow-lg shadow-purple-500/10 backdrop-blur-md">
                    <span className="flex items-center gap-1 text-amber-300 font-extrabold uppercase text-[10px] tracking-wider bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <Flame size={12} className="text-amber-400 animate-pulse" /> Early Bird Special
                    </span>
                    <span>All 28 Apps for $1/mo or 1 App Free Forever</span>
                </div>

                {/* Main Compelling Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-white mb-6 leading-[1.12] max-w-4xl mx-auto">
                    The All-in-One{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                        AI ERP &amp; CRM
                    </span>
                    <span className="block mt-2 text-2xl sm:text-4xl lg:text-[2.6rem] text-gray-200 font-bold">
                        Built to Run &amp; Scale Your Business
                    </span>
                </h1>

                {/* Subheadline with Clear Value Proposition */}
                <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
                    Replace 5+ expensive, disconnected tools like Odoo, Salesforce, and QuickBooks. Run Accounting, POS, Inventory, HR &amp; CRM across 28 unified modules — with <strong className="text-cyan-300 font-semibold">25M+ verified B2B leads</strong> built-in.
                </p>

                {/* High-Converting Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center mb-6">
                    <Link 
                        href="/signup" 
                        className="galaxy-btn-primary !px-7 !py-3.5 text-sm sm:text-base w-full sm:w-auto flex items-center justify-center gap-2 group shadow-xl shadow-purple-500/30 font-extrabold rounded-xl"
                    >
                        <span>Start Free Forever — No Card Required</span>
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={17} />
                    </Link>

                    <a 
                        href="#pricing" 
                        className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 hover:from-purple-900/60 hover:to-pink-900/60 border border-purple-500/40 text-purple-200 text-sm sm:text-base font-bold transition-all flex items-center justify-center gap-2 w-full sm:w-auto backdrop-blur-sm shadow-md"
                    >
                        <Flame size={16} className="text-amber-400" />
                        <span>Get All 28 Apps for $1/mo</span>
                    </a>

                    <button
                        onClick={() => setIsCalcOpen(true)}
                        className="px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                    >
                        <Calculator size={15} className="text-amber-400" />
                        <span>Calculate Savings</span>
                    </button>
                </div>

                {/* Trust Proof Checklist */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400 mb-8">
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

                {/* Subtle Scroll Cue to Live Product Showcase Below */}
                <div className="flex items-center justify-center gap-1 text-xs text-purple-300/80">
                    <span>Explore the real live system below</span>
                    <ChevronDown size={14} className="animate-bounce" />
                </div>
            </div>

            {/* Trust Indicators / Badges Bar */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <div className="py-6 border-y border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 bg-[#0B0F19]/60 backdrop-blur-md rounded-2xl px-6">
                    <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm text-gray-300 font-medium">
                        <ShieldCheck size={18} className="text-purple-400 shrink-0" /> Enterprise RLS Security
                    </div>
                    <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm text-gray-300 font-medium">
                        <Globe size={18} className="text-cyan-400 shrink-0" /> 25M+ Global Leads Pool
                    </div>
                    <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm text-gray-300 font-medium">
                        <Zap size={18} className="text-amber-400 shrink-0" /> Real-time 45ms Edge Sync
                    </div>
                    <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm text-gray-300 font-medium">
                        <Sparkles size={18} className="text-pink-400 shrink-0" /> 28 Full-Suite Apps
                    </div>
                </div>
            </div>

            {/* Savings Calculator Modal */}
            {isCalcOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative w-full max-w-2xl bg-[#090D1A] border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
                        <button
                            onClick={() => setIsCalcOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
                                <Calculator size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black text-white">Your SaaS Stack Cost vs Beraxis</h3>
                                <p className="text-xs sm:text-sm text-gray-300">Compare what you pay today across fragmented SaaS tools.</p>
                            </div>
                        </div>

                        {/* Cost Comparison Table */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                                <span className="text-gray-300">HubSpot / Salesforce (CRM &amp; Pipeline)</span>
                                <span className="font-mono font-bold text-red-400">$150 / mo</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                                <span className="text-gray-300">QuickBooks / Xero (Double-entry Accounting)</span>
                                <span className="font-mono font-bold text-red-400">$85 / mo</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                                <span className="text-gray-300">Toast / Square (POS &amp; Inventory Management)</span>
                                <span className="font-mono font-bold text-red-400">$69 / mo</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                                <span className="text-gray-300">Apollo / ZoomInfo (B2B Leads Database)</span>
                                <span className="font-mono font-bold text-red-400">$99 / mo</span>
                            </div>
                            
                            {/* Summary bar */}
                            <div className="pt-3 border-t border-white/15 flex items-center justify-between font-bold text-base">
                                <span className="text-gray-300">Total Traditional Cost:</span>
                                <span className="text-red-400 font-mono line-through">$403 / month ($4,836/yr)</span>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-purple-500/20 border border-emerald-500/50 flex items-center justify-between font-extrabold text-lg">
                                <div className="flex items-center gap-2 text-emerald-300">
                                    <CheckCircle size={20} className="text-emerald-400" />
                                    <span>Beraxis All-In-One:</span>
                                </div>
                                <span className="text-emerald-300 font-mono">$1 / month ($12/yr)</span>
                            </div>
                        </div>

                        {/* Grand Total Savings Callout */}
                        <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
                            <span className="text-xs uppercase tracking-wider font-bold text-amber-300 block mb-1">Your Total Annual Savings</span>
                            <span className="text-3xl sm:text-4xl font-black text-white">$4,824 / year</span>
                            <span className="text-xs text-amber-200/80 block mt-1">99.7% cost reduction with all 28 enterprise modules included</span>
                        </div>

                        {/* CTA button */}
                        <Link
                            href="/pricing"
                            onClick={() => setIsCalcOpen(false)}
                            className="galaxy-btn-primary !py-4 text-base w-full flex items-center justify-center gap-2 group font-black"
                        >
                            <span>Claim $1/mo Early Bird Access &amp; Save $4,824</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
