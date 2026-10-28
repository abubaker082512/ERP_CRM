"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Grid3x3,
    Building2,
    LayoutDashboard,
    Briefcase,
    Lock,
    ArrowRight,
    Sparkles
} from "lucide-react";

const SHOWCASE_SCREENS = {
    apps: {
        id: "apps",
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
        id: "industry",
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
        id: "dashboard",
        title: "Executive Overview & AI Copilot",
        subtitle: "Real-time revenue, CRM conversion, sales pipelines, and natural-language Galaxy AI query bar",
        url: "https://beraxis.online/dashboard",
        imageWebp: "/images/showcase/dashboard-screen.webp",
        imagePng: "/images/showcase/dashboard-screen.png",
        alt: "Beraxis Real Executive Dashboard with AI Copilot",
        ctaText: "Explore Live Dashboard",
        ctaHref: "/dashboard",
        tag: "Executive Dashboard"
    },
    workspace: {
        id: "workspace",
        title: "Multi-Company & Entity Switcher",
        subtitle: "Seamlessly switch between multiple business entities, branch locations, and tax jurisdictions in 1 click",
        url: "https://beraxis.online/settings",
        imageWebp: "/images/showcase/workspace-screen.webp",
        imagePng: "/images/showcase/workspace-screen.png",
        alt: "Beraxis Multi-Company Workspace Management",
        ctaText: "Manage Workspaces",
        ctaHref: "/settings",
        tag: "Multi-Company"
    }
};

type ScreenKey = keyof typeof SHOWCASE_SCREENS;

export default function RealProductShowcase() {
    const [activeTab, setActiveTab] = useState<ScreenKey>("apps");
    const activeScreen = SHOWCASE_SCREENS[activeTab];

    return (
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            {/* Section Header */}
            <div className="text-center mb-10 sm:mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-purple-500/10">
                    <Sparkles size={14} className="text-purple-400" />
                    <span>Real System Production Cockpit</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
                    Experience the Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">Beraxis System</span>
                </h2>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
                    No dummy mockups or conceptual wireframes. See the actual command deck running 28 unified enterprise modules, real-time analytics, and Galaxy AI.
                </p>
            </div>

            {/* Interactive Screen Selector Tabs with Classy Frosted Glass Dock */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl backdrop-blur-2xl bg-white/[0.04] border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_12px_30px_rgba(0,0,0,0.5)]">
                    <button
                        type="button"
                        onClick={() => setActiveTab("apps")}
                        className={`h-[44px] px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                            activeTab === "apps"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(168,85,247,0.35)] scale-[1.02]"
                                : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                    >
                        <Grid3x3 size={15} className={activeTab === "apps" ? "text-white" : "text-purple-400"} />
                        <span>Apps Cockpit (28 Modules)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("industry")}
                        className={`h-[44px] px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                            activeTab === "industry"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(168,85,247,0.35)] scale-[1.02]"
                                : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                    >
                        <Building2 size={15} className={activeTab === "industry" ? "text-white" : "text-pink-400"} />
                        <span>12 Industry Archetypes</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("dashboard")}
                        className={`h-[44px] px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                            activeTab === "dashboard"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(168,85,247,0.35)] scale-[1.02]"
                                : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                    >
                        <LayoutDashboard size={15} className={activeTab === "dashboard" ? "text-white" : "text-cyan-400"} />
                        <span>Executive Dashboard &amp; AI</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("workspace")}
                        className={`h-[44px] px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                            activeTab === "workspace"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(168,85,247,0.35)] scale-[1.02]"
                                : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                    >
                        <Briefcase size={15} className={activeTab === "workspace" ? "text-white" : "text-amber-400"} />
                        <span>Multi-Company Workspace</span>
                    </button>
                </div>
            </div>

            {/* Glassmorphic Application Browser Window with Real System Picture */}
            <div className="relative border border-white/15 bg-[#0F172A]/95 shadow-[0_0_70px_rgba(139,92,246,0.18)] rounded-3xl overflow-hidden group hover:border-purple-500/40 transition-all duration-500 text-left">
                {/* Browser Top Navigation Bar */}
                <div className="bg-[#141A28]/95 border-b border-white/10 px-3 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 text-xs">
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#EF4444]/90 inline-block shadow-sm"></span>
                        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#F59E0B]/90 inline-block shadow-sm"></span>
                        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#10B981]/90 inline-block shadow-sm"></span>
                    </div>

                    <div className="flex-1 max-w-xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-[#070B16] border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 text-[10px] sm:text-[11px] font-mono shadow-inner min-w-0">
                        <Lock size={11} className="text-emerald-400 shrink-0" />
                        <span className="truncate">{activeScreen.url}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Live Production Screen
                        </span>
                        <Link
                            href={activeScreen.ctaHref}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-purple-600/20 whitespace-nowrap"
                        >
                            <span className="hidden sm:inline">{activeScreen.ctaText}</span>
                            <span className="inline sm:hidden">Open</span>
                            <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>

                {/* Screenshot Display Frame */}
                <div className="relative overflow-hidden bg-[#070B16] aspect-[4/3] sm:aspect-[16/9]">
                    <picture>
                        <source srcSet={activeScreen.imageWebp} type="image/webp" />
                        <img
                            key={activeTab}
                            src={activeScreen.imagePng}
                            alt={activeScreen.alt}
                            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                            loading="eager"
                        />
                    </picture>

                    <div className="absolute inset-x-0 bottom-0 h-20 sm:h-28 bg-gradient-to-t from-[#020205] via-[#020205]/60 to-transparent pointer-events-none"></div>

                    {/* Floating Info Overlay Bar */}
                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-6 sm:right-auto sm:max-w-md bg-[#0F172A]/98 border border-white/15 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-purple-400 font-extrabold block mb-0.5">
                                {activeScreen.tag}
                            </span>
                            <h3 className="text-xs sm:text-sm font-bold text-white leading-tight truncate sm:whitespace-normal">
                                {activeScreen.title}
                            </h3>
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
        </section>
    );
}
