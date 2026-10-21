"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Grid3x3,
    Lock,
    ExternalLink,
    Maximize2,
    Calendar,
    ClipboardList,
    CheckSquare,
    BookOpen,
    Users,
    BarChart3,
    ShoppingCart,
    Package,
    Bell,
    CheckCircle,
    ArrowRight,
    Flame,
    Zap,
    Building2,
    Sparkles,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Stats from "@/components/landing/Stats";
import Testimonials from "@/components/landing/Testimonials";
import IndustryShowcase from "@/components/landing/IndustryShowcase";
import { DEFAULT_PRICING_CONFIG, PricingConfig } from "@/lib/pricingConfig";

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

export default function Home() {
    const router = useRouter();
    const [billingCycle, setBillingCycle] = useState<"annually" | "monthly">("annually");
    const [activeShowcaseTab, setActiveShowcaseTab] = useState<"apps" | "industry" | "dashboard">("apps");
    const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);

    useEffect(() => {
        fetch("/api/admin/pricing")
            .then(res => res.json())
            .then(data => {
                if (data && data.standard) setPricing(data);
            })
            .catch(() => {});
    }, []);

    const isAnnual = billingCycle === "annually";
    const standardRate = isAnnual 
        ? pricing.standard.annual_monthly_rate 
        : pricing.standard.monthly_rate;
    const standardOriginalRate = isAnnual 
        ? (pricing.standard.original_annual_rate || 24.90) 
        : (pricing.standard.original_monthly_rate || 31.10);
    const customRate = isAnnual 
        ? pricing.custom.annual_monthly_rate 
        : pricing.custom.monthly_rate;
    const activeScreen = SHOWCASE_SCREENS[activeShowcaseTab];

    return (
        <main className="min-h-screen bg-[#020205] text-white overflow-hidden">
            <Navbar />
            <Hero />
            
            {/* Real Product Showcase Section (Replaces mock dashboard with real product pictures) */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28 animate-in fade-in duration-1000">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-purple-500/10">
                        <Sparkles size={14} className="text-purple-400" />
                        <span>Real System Interface & Production Cockpit</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
                        Experience the Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">Beraxis Cockpit</span>
                    </h2>
                    <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
                        No dummy mockups or conceptual wireframes. See the actual command deck running 28 enterprise modules with multi-entity isolation and AI copilots.
                    </p>
                </div>

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
                        <span>Executive Dashboard & AI</span>
                    </button>
                </div>

                {/* Glassmorphic Application Browser Window with Real System Picture */}
                <div className="relative border border-white/15 bg-[#0F172A]/90 backdrop-blur-2xl shadow-[0_0_80px_rgba(139,92,246,0.2)] rounded-3xl overflow-hidden group hover:border-purple-500/40 transition-all duration-500">
                    
                    {/* Window Title Bar */}
                    <div className="bg-[#141A28]/95 border-b border-white/10 px-4 py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="w-3 h-3 rounded-full bg-[#EF4444]/90 inline-block shadow-sm"></span>
                            <span className="w-3 h-3 rounded-full bg-[#F59E0B]/90 inline-block shadow-sm"></span>
                            <span className="w-3 h-3 rounded-full bg-[#10B981]/90 inline-block shadow-sm"></span>
                        </div>

                        {/* URL / Location Bar */}
                        <div className="flex-1 max-w-xl mx-auto flex items-center justify-center gap-2 bg-[#070B16] border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 text-[11px] font-mono shadow-inner">
                            <Lock size={12} className="text-emerald-400 shrink-0" />
                            <span className="truncate">{activeScreen.url}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Live Production Screen
                            </span>
                            <Link
                                href={activeScreen.ctaHref}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-purple-600/20"
                            >
                                <span>{activeScreen.ctaText}</span>
                                <ArrowRight size={12} />
                            </Link>
                        </div>
                    </div>

                    {/* Image Container with Ambient Glow and Hover Zoom */}
                    <div className="relative overflow-hidden bg-[#070B16] aspect-[16/10] sm:aspect-[16/9]">
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

                        {/* Subtle bottom gradient overlay for smooth visual blending */}
                        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#020205] via-[#020205]/40 to-transparent pointer-events-none"></div>

                        {/* Caption floating card */}
                        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md bg-[#0F172A]/95 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-extrabold block mb-0.5">
                                    {activeScreen.tag}
                                </span>
                                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                                    {activeScreen.title}
                                </h4>
                                <p className="text-[11px] text-gray-400 mt-1 leading-snug line-clamp-1">
                                    {activeScreen.subtitle}
                                </p>
                            </div>
                            <Link
                                href={activeScreen.ctaHref}
                                className="shrink-0 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl border border-white/10 transition-colors"
                                title="Open Live View"
                            >
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div></section>

            <Stats />
            <Features />
            <IndustryShowcase />
            <Testimonials />
            
            {/* Pricing Section */}
            <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-40 mb-28 scroll-mt-24">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest mb-4 shadow-lg">
                        <Flame size={14} className="text-amber-400 animate-pulse" />
                        <span>Early Bird Launch Special — 96% OFF</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
                        Transparent, Value-Packed <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Pricing</span>
                    </h2>
                    <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
                        Start with a single module forever free, or unlock all 28 integrated modules for as low as <strong className="text-white font-bold">$1/month</strong> ($12 billed annually) with our Early Bird Special.
                    </p>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex items-center p-1.5 bg-[#0B0F19] border border-white/10 rounded-2xl shadow-xl backdrop-blur-md">
                        <button
                            type="button"
                            onClick={() => setBillingCycle("annually")}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                isAnnual
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            <span>Annually ($1/mo Early Bird)</span>
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-500/30">
                                SAVE 96%
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingCycle("monthly")}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                !isAnnual
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            <span>Monthly ($5/mo Early Bird)</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    {/* Free Plan */}
                    <div className="galaxy-card p-6 md:p-8 flex flex-col justify-between bg-[#0F172A]/30 border-white/10 hover:border-white/20 transition-all">
                        <div>
                            <div className="mb-4">
                                <span className="text-xs bg-white/5 text-gray-400 uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border border-white/10">Forever Free</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-200 mb-2">One App Free</h3>
                            <p className="text-gray-400 text-xs mb-6">Choose any single module with unlimited users forever.</p>
                            <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-white/5">
                                <span className="text-4xl font-black text-white">$0</span>
                                <span className="text-gray-500 text-xs">/ seat / month</span>
                            </div>
                            <div className="space-y-3.5 text-xs text-gray-300">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                    <span>Choose <strong>any 1</strong> full ERP module</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                    <span>Unlimited user seats</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="text-gray-400 shrink-0" size={14} />
                                    <span className="text-gray-300">Single Company Workspace (1 Company)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                    <span>50 Starter Lead Pool Previews</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                    <span>Managed Cloud Hosting</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => router.push('/signup')}
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-4 rounded-xl mt-8 transition-all border border-white/10 text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Deploy Free App
                        </button>
                    </div>

                    {/* Standard Plan */}
                    <div className="galaxy-card p-6 md:p-8 flex flex-col justify-between border-purple-500/40 bg-[#0F172A]/60 relative shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/30">
                        <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                            <Flame size={13} className="text-yellow-300 animate-pulse" />
                            <span>Early Bird Special ({isAnnual ? "96% OFF" : "84% OFF"})</span>
                        </div>
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <span className="text-xs bg-purple-500/20 text-purple-300 uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border border-purple-500/30">
                                    All 28 Modules Included
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Standard Plan</h3>
                            <p className="text-gray-400 text-xs mb-6">Complete business cockpit with 28 enterprise modules and built-in Lead Pool.</p>
                            
                            {/* Dynamic Rate Presentation */}
                            <div className="mb-8 pb-6 border-b border-purple-500/20">
                                {standardOriginalRate > standardRate && (
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-sm text-gray-500 line-through font-bold">
                                            ${standardOriginalRate.toFixed(2)}
                                        </span>
                                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                                            {Math.round(((standardOriginalRate - standardRate) / standardOriginalRate) * 100)}% OFF EARLY BIRD
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white">${standardRate.toFixed(2)}</span>
                                    <span className="text-gray-400 text-xs">/ seat / month</span>
                                </div>
                                <div className="mt-2 text-[11px] font-bold text-purple-300">
                                    {isAnnual 
                                        ? "Billed annually at $12 / user / year (Early Bird rate)" 
                                        : "Billed monthly at $5 / user / month (Month-to-month)"}
                                </div>
                            </div>

                            <div className="space-y-3.5 text-xs text-gray-300">
                                <div className="flex items-center gap-2 text-white font-bold bg-purple-500/15 border border-purple-500/30 px-3 py-2 rounded-xl">
                                    <Building2 className="text-purple-400 shrink-0" size={15} />
                                    <span>Single Company Workspace (1 Company)</span>
                                </div>
                                <div className="flex items-center gap-2 text-cyan-300 font-bold bg-cyan-500/10 border border-cyan-500/20 px-3 py-2 rounded-xl">
                                    <Zap className="text-cyan-400 shrink-0" size={15} />
                                    <span>1,500 Verified Lead Credits / user / mo</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <CheckCircle className="text-emerald-400 shrink-0" size={14} />
                                    <span>Buy extra lead packs anytime in Lead Pool ($10 / 1,000)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                    <span className="font-semibold text-white">All 28 enterprise modules unlocked</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                    <span>Standard Cloud SaaS & Live Backups</span>
                                </div>
                            </div>
                        </div>
                        <a 
                            href="/checkout?plan=standard&billing=annually"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-pink-500 text-white font-black py-3.5 px-4 rounded-xl mt-8 transition-all shadow-xl shadow-purple-500/25 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                            <span>Claim Early Bird Standard (${standardRate.toFixed(2)}/mo)</span>
                            <ArrowRight size={14} />
                        </a>
                    </div>

                    {/* Custom Plan */}
                    <div className="galaxy-card p-6 md:p-8 flex flex-col justify-between bg-[#0F172A]/30 border-pink-500/20 hover:border-pink-500/40 transition-all">
                        <div>
                            <div className="mb-4">
                                <span className="text-xs bg-pink-500/10 text-pink-400 uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border border-pink-500/20">Custom Enterprise</span>
                            </div>
                            <h3 className="text-xl font-bold text-pink-300 mb-2">Custom Plan</h3>
                            <p className="text-gray-400 text-xs mb-6">Multi-company consolidation, developer studio, and external API connectors.</p>
                            <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-white/5">
                                <span className="text-4xl font-extrabold text-white">${customRate.toFixed(2)}</span>
                                <span className="text-gray-500 text-xs">/ seat / month</span>
                            </div>
                            <div className="space-y-3.5 text-xs text-gray-300">
                                <div className="flex items-center gap-2 text-pink-200 font-bold bg-pink-500/10 border border-pink-500/30 px-3 py-2 rounded-xl">
                                    <Building2 className="text-pink-400 shrink-0" size={15} />
                                    <span>Multi-Company: 3 Companies included (+ $15/mo per extra company)</span>
                                </div>
                                <div className="flex items-center gap-2 text-pink-300 font-bold bg-pink-500/10 border border-pink-500/20 px-3 py-2 rounded-xl">
                                    <Zap className="text-pink-400 shrink-0" size={15} />
                                    <span>5,000+ Custom Lead Credits / user / mo</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-pink-400 shrink-0" size={14} />
                                    <span className="font-semibold text-white">Beraxis Studio customizer</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-pink-400 shrink-0" size={14} />
                                    <span>External APIs & Webhooks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-pink-400 shrink-0" size={14} />
                                    <span className="font-semibold text-white">24/7 WhatsApp & Phone Support</span>
                                </div>
                            </div>
                        </div>
                        <a 
                            href="/checkout?plan=custom&billing=annually"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-4 rounded-xl mt-8 transition-all border border-white/10 text-xs flex items-center justify-center gap-2 cursor-pointer hover:border-pink-500/40"
                        >
                            Configure Custom
                        </a>
                    </div>
                </div>

                <div className="text-center mt-12">
                    <Link href="/pricing" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold text-sm tracking-wider uppercase transition-colors">
                        View Detailed Interactive Pricing Configurator <ArrowRight size={14} />
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
