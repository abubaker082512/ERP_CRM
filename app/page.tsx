"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
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

export default function Home() {
    const router = useRouter();
    const [billingCycle, setBillingCycle] = useState<"annually" | "monthly">("annually");
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

    return (
        <main className="min-h-screen bg-[#020205] text-white overflow-hidden">
            <Navbar />
            <Hero />
            
            {/* Product Preview Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28 animate-in fade-in duration-1000">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
                        Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Beraxis Command Center</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                        A glassmorphic, hyper-responsive command deck that consolidates all your business and customer operations into a single cohesive cockpit.
                    </p>
                </div>

                {/* CSS-based Glassmorphic Mockup Dashboard */}
                <div className="relative border border-white/10 bg-[#0F172A]/70 backdrop-blur-2xl shadow-[0_0_50px_rgba(139,92,246,0.15)] rounded-3xl overflow-hidden aspect-[16/9] w-full p-4 md:p-6 group hover:border-purple-500/30 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>
                    
                    {/* Mock App Shell layout */}
                    <div className="h-full flex gap-4 text-xs font-sans">
                        {/* Sidebar Mockup */}
                        <div className="w-1/5 bg-[#141A28]/80 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shrink-0 hidden sm:flex">
                            <div className="space-y-4">
                                <div className="flex items-center mb-6 border-b border-white/5 pb-3">
                                    <img src="/logo-full.png" alt="Beraxis Logo" className="h-4 w-auto object-contain" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2.5 px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg font-bold"><LayoutDashboard size={14}/> Dashboard</div>
                                    <div className="flex items-center gap-2.5 px-3 py-2 text-gray-500 hover:text-gray-300 rounded-lg"><Users size={14}/> CRM Pipeline</div>
                                    <div className="flex items-center gap-2.5 px-3 py-2 text-gray-500 hover:text-gray-300 rounded-lg"><ShoppingCart size={14}/> Sales Orders</div>
                                    <div className="flex items-center gap-2.5 px-3 py-2 text-gray-500 hover:text-gray-300 rounded-lg"><Package size={14}/> Inventory</div>
                                    <div className="flex items-center gap-2.5 px-3 py-2 text-gray-500 hover:text-gray-300 rounded-lg"><BarChart3 size={14}/> Accounting</div>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                <span className="text-[9px] font-bold text-purple-400 block mb-1">PRO SERVICE ACTIVE</span>
                                <span className="text-[10px] text-gray-400">whatsapp_sync_enabled</span>
                            </div>
                        </div>

                        {/* Main Mock Content */}
                        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                            {/* Header Mockup */}
                            <div className="h-12 bg-[#141A28]/60 border border-white/5 rounded-2xl px-4 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="font-bold text-gray-300">Live Enterprise Overview</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"><Bell size={12}/></div>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">A</div>
                                </div>
                            </div>

                            {/* Dashboard Grid Mockup */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
                                {/* Stat Card 1 */}
                                <div className="bg-[#1E293B]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/20 transition-colors">
                                    <div>
                                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">MONTHLY REVENUE</span>
                                        <h3 className="text-xl font-bold text-white mt-1">$48,251.00</h3>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                                        <div className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Stat Card 2 */}
                                <div className="bg-[#1E293B]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-pink-500/20 transition-colors">
                                    <div>
                                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">CRM CONVERSION RATE</span>
                                        <h3 className="text-xl font-bold text-white mt-1">24.8%</h3>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                                        <div className="w-1/2 h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Stat Card 3 */}
                                <div className="bg-[#1E293B]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
                                    <div>
                                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">ACTIVE SUPPORT CHATS</span>
                                        <h3 className="text-xl font-bold text-emerald-400 mt-1">99.8% SLA</h3>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                                        <div className="w-[95%] h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Chart / Activity Simulator */}
                                <div className="col-span-full md:col-span-2 bg-[#1E293B]/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-48 sm:h-auto">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-300">Sales Forecast vs Realization</span>
                                        <span className="text-[10px] text-gray-500">Real-time</span>
                                    </div>
                                    <div className="flex-1 flex items-end gap-3 pt-4 justify-between">
                                        <div className="w-12 bg-purple-500/20 rounded-t-lg h-2/5 relative group"><div className="absolute inset-x-0 bottom-0 bg-purple-500 rounded-t-lg h-3/5 group-hover:scale-y-110 transition-transform origin-bottom"></div></div>
                                        <div className="w-12 bg-purple-500/20 rounded-t-lg h-3/5 relative group"><div className="absolute inset-x-0 bottom-0 bg-purple-500 rounded-t-lg h-4/5 group-hover:scale-y-110 transition-transform origin-bottom"></div></div>
                                        <div className="w-12 bg-purple-500/20 rounded-t-lg h-4/5 relative group"><div className="absolute inset-x-0 bottom-0 bg-purple-500 rounded-t-lg h-2/3 group-hover:scale-y-110 transition-transform origin-bottom"></div></div>
                                        <div className="w-12 bg-purple-500/20 rounded-t-lg h-3/4 relative group"><div className="absolute inset-x-0 bottom-0 bg-purple-500 rounded-t-lg h-5/6 group-hover:scale-y-110 transition-transform origin-bottom"></div></div>
                                        <div className="w-12 bg-purple-500/20 rounded-t-lg h-[95%] relative group"><div className="absolute inset-x-0 bottom-0 bg-purple-500 rounded-t-lg h-4/5 group-hover:scale-y-110 transition-transform origin-bottom"></div></div>
                                        <div className="w-12 bg-purple-500/20 rounded-t-lg h-[85%] relative group"><div className="absolute inset-x-0 bottom-0 bg-purple-500 rounded-t-lg h-[90%] group-hover:scale-y-110 transition-transform origin-bottom"></div></div>
                                    </div>
                                </div>

                                {/* CRM Pipeline Activity feed */}
                                <div className="bg-[#1E293B]/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hidden md:flex">
                                    <span className="font-bold text-gray-300 mb-3">Active Deal Leads</span>
                                    <div className="space-y-3 flex-1 overflow-y-auto">
                                        <div className="bg-[#0F172A]/50 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                                            <span className="font-bold text-white">Acme Corp Ltd</span>
                                            <span className="text-[9px] bg-purple-500/20 text-purple-400 font-bold px-2 py-0.5 rounded">Closed Won</span>
                                        </div>
                                        <div className="bg-[#0F172A]/50 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                                            <span className="font-bold text-white">X-Enterprise</span>
                                            <span className="text-[9px] bg-yellow-500/20 text-yellow-400 font-bold px-2 py-0.5 rounded">Negotiation</span>
                                        </div>
                                        <div className="bg-[#0F172A]/50 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                                            <span className="font-bold text-white">Novus Solutions</span>
                                            <span className="text-[9px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded">Proposition</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
