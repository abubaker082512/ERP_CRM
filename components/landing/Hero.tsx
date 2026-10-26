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
    Grid3x3,
    LayoutDashboard,
    Lock
} from "lucide-react";
import { initSocialAttribution } from "@/lib/abTesting";

const SHOWCASE_SCREENS = {
    apps: {
        title: "All 28 Unified Business Apps",
        subtitle: "One-click access to Accounting, CRM, POS, Inventory, Payroll, Sign, and Leads Pool",
        url: "https://beraxis.online/apps",
        imageWebp: "/images/showcase/apps-screen.webp",
        imagePng: "/images/showcase/apps-screen.png",
        alt: "Beraxis 28 Unified Business Apps Cockpit",
        ctaText: "Launch Free Apps Cockpit",
        ctaHref: "/apps",
        tag: "Apps Cockpit"
    },
    industry: {
        title: "12 Global Industry Archetypes",
        subtitle: "Pre-configured workflows, POS layouts, and modules tailored for F&B, Clinics, Auto, Real Estate, and more",
        url: "https://beraxis.online/apps?onboarding=true",
        imageWebp: "/images/showcase/industry-screen.webp",
        imagePng: "/images/showcase/industry-screen.png",
        alt: "Beraxis 12 Global Business Industries Setup",
        ctaText: "Explore 12 Industry Engines",
        ctaHref: "#industries",
        tag: "Industry Engine"
    },
    dashboard: {
        title: "Executive Overview & AI Copilot",
        subtitle: "Real-time revenue, CRM conversion, sales pipelines, and natural-language Galaxy AI query bar",
        url: "https://beraxis.online/dashboard",
        imageWebp: "/images/showcase/dashboard-screen.webp",
        imagePng: "/images/showcase/dashboard-screen.png",
        alt: "Beraxis Real Executive Dashboard with AI Copilot",
        ctaText: "Explore Live Dashboard",
        ctaHref: "/dashboard",
        tag: "Executive Dashboard"
    }
};

export default function Hero() {
    useEffect(() => {
        initSocialAttribution();
    }, []);

    const [isCalcOpen, setIsCalcOpen] = useState(false);
    const [activeShowcaseTab, setActiveShowcaseTab] = useState<"apps" | "industry" | "dashboard">("apps");

    const activeScreen = SHOWCASE_SCREENS[activeShowcaseTab];

    return (
        <section className="relative overflow-hidden pt-32 sm:pt-36 lg:pt-40 pb-20 sm:pb-28">
            {/* Ambient Background Glows */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-purple-600/15 via-pink-600/10 to-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute top-1/3 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                
                {/* Early Bird Deal Pill Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-amber-500/15 border border-purple-500/30 text-purple-200 text-xs font-semibold mb-6 shadow-lg shadow-purple-500/10 backdrop-blur-md">
                    <span className="flex items-center gap-1 text-amber-300 font-extrabold uppercase text-[10px] tracking-wider bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <Flame size={12} className="text-amber-400 animate-pulse" /> Early Bird Special
                    </span>
                    <span>All 28 Apps for $1/mo or 1 App Free Forever</span>
                </div>

                {/* Main Compelling Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-[3.6rem] font-black tracking-tight text-white mb-6 leading-[1.12] max-w-4xl mx-auto">
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
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400 mb-10">
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

                {/* ── HERO VISUAL SHOWCASE: REAL PRODUCTION COCKPIT ── */}
                <div className="mt-4 mb-12">
                    {/* Interactive Screen Selector Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setActiveShowcaseTab("apps")}
                            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                                activeShowcaseTab === "apps"
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/50 shadow-lg shadow-purple-500/25 scale-[1.02]"
                                    : "bg-[#0F172A]/80 text-gray-400 hover:text-white border-white/10 hover:border-white/20"
                            }`}
                        >
                            <Grid3x3 size={15} className={activeShowcaseTab === "apps" ? "text-white" : "text-purple-400"} />
                            <span>Apps Screen (28 Modules)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveShowcaseTab("industry")}
                            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                                activeShowcaseTab === "industry"
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/50 shadow-lg shadow-purple-500/25 scale-[1.02]"
                                    : "bg-[#0F172A]/80 text-gray-400 hover:text-white border-white/10 hover:border-white/20"
                            }`}
                        >
                            <Building2 size={15} className={activeShowcaseTab === "industry" ? "text-white" : "text-pink-400"} />
                            <span>Industry Setup (12 Archetypes)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveShowcaseTab("dashboard")}
                            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                                activeShowcaseTab === "dashboard"
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/50 shadow-lg shadow-purple-500/25 scale-[1.02]"
                                    : "bg-[#0F172A]/80 text-gray-400 hover:text-white border-white/10 hover:border-white/20"
                            }`}
                        >
                            <LayoutDashboard size={15} className={activeShowcaseTab === "dashboard" ? "text-white" : "text-cyan-400"} />
                            <span>Executive Dashboard &amp; AI</span>
                        </button>
                    </div>

                    {/* Glassmorphic Application Browser Window with Real System Picture */}
                    <div className="relative border border-white/15 bg-[#0F172A]/90 backdrop-blur-2xl shadow-[0_0_100px_rgba(139,92,246,0.22)] rounded-3xl overflow-hidden group hover:border-purple-500/40 transition-all duration-500 text-left">
                        <div className="bg-[#141A28]/95 border-b border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 text-xs">
                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#EF4444]/90 inline-block shadow-sm"></span>
                                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#F59E0B]/90 inline-block shadow-sm"></span>
                                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#10B981]/90 inline-block shadow-sm"></span>
                            </div>

                            <div className="flex-1 max-w-xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-[#070B16] border border-white/10 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-gray-300 text-[10px] sm:text-[11px] font-mono shadow-inner min-w-0">
                                <Lock size={11} className="text-emerald-400 shrink-0" />
                                <span className="truncate">{activeScreen.url}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Live Production Screen
                                </span>
                                <Link
                                    href={activeScreen.ctaHref}
                                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-purple-600/20 whitespace-nowrap"
                                >
                                    <span className="hidden sm:inline">{activeScreen.ctaText}</span>
                                    <span className="inline sm:hidden">Open</span>
                                    <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>

                        <div className="relative overflow-hidden bg-[#070B16] aspect-[4/3] sm:aspect-[16/9]">
                            <picture>
                                <source srcSet={activeScreen.imageWebp} type="image/webp" />
                                <img
                                    key={activeShowcaseTab}
                                    src={activeScreen.imagePng}
                                    alt={activeScreen.alt}
                                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                                    loading="eager"
                                />
                            </picture>

                            <div className="absolute inset-x-0 bottom-0 h-20 sm:h-28 bg-gradient-to-t from-[#020205] via-[#020205]/60 to-transparent pointer-events-none"></div>

                            <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-6 sm:right-auto sm:max-w-md bg-[#0F172A]/95 backdrop-blur-md border border-white/15 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-purple-400 font-extrabold block mb-0.5">
                                        {activeScreen.tag}
                                    </span>
                                    <h4 className="text-xs sm:text-sm font-bold text-white leading-tight truncate sm:whitespace-normal">
                                        {activeScreen.title}
                                    </h4>
                                    <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 sm:mt-1 leading-snug line-clamp-1">
                                        {activeScreen.subtitle}
                                    </p>
                                </div>
                                <Link
                                    href={activeScreen.ctaHref}
                                    className="shrink-0 bg-white/10 hover:bg-white/20 text-white p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-white/10 transition-colors"
                                    title="Open Live View"
                                >
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── ENTERPRISE TRUST BADGES BAR (GROUNDING THE HERO) ── */}
                <div className="py-6 border-y border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 bg-[#0B0F19]/60 backdrop-blur-md rounded-2xl px-6 shadow-xl">
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
                        <a
                            href="#pricing"
                            onClick={() => setIsCalcOpen(false)}
                            className="galaxy-btn-primary !py-4 text-base w-full flex items-center justify-center gap-2 group font-black"
                        >
                            Claim $1/mo Early Bird Access &amp; Save $4,824 <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                        </a>
                    </div>
                </div>
            )}
        </section>
    );
}
