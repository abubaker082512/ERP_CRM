"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
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
    CreditCard,
    ShieldCheck,
    HelpCircle,
    ChevronDown
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import RealProductShowcase from "@/components/landing/RealProductShowcase";
import Features from "@/components/landing/Features";
import Stats from "@/components/landing/Stats";
import Testimonials from "@/components/landing/Testimonials";
import IndustryShowcase from "@/components/landing/IndustryShowcase";
import BeraxisCosmicCanvas from "@/components/3d/BeraxisCosmicCanvas";
import { DEFAULT_PRICING_CONFIG, PricingConfig } from "@/lib/pricingConfig";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { getPaddlePrice } from "@/lib/paddleConfig";

export default function Home() {
    const router = useRouter();
    const [billingCycle, setBillingCycle] = useState<"annually" | "monthly">("annually");
    const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
    const [paddle, setPaddle] = useState<Paddle | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Initialize Paddle.js client
    useEffect(() => {
        const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "live_6645496fe6160096b0d5e7c19fe";
        const env = (process.env.NEXT_PUBLIC_PADDLE_ENV || "production") as "sandbox" | "production";
        initializePaddle({
            token: clientToken,
            environment: env
        }).then(instance => {
            if (instance) setPaddle(instance);
        }).catch(err => console.warn("Paddle init warning:", err));
    }, []);

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

    const handlePaddleCheckout = (planKey: "standard" | "custom") => {
        const priceConfig = getPaddlePrice(planKey, isAnnual ? "annual" : "monthly");
        if (paddle) {
            paddle.Checkout.open({
                items: [{ priceId: priceConfig.priceId, quantity: 1 }],
                settings: {
                    displayMode: "overlay",
                    theme: "dark",
                    variant: "one-page",
                    successUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/checkout?paddle_status=success&plan=${planKey}&billing=${isAnnual ? "annual" : "monthly"}`
                }
            });
        } else {
            router.push(`/checkout?plan=${planKey}&billing=${isAnnual ? "annual" : "monthly"}`);
        }
    };

    const faqs = [
        {
            q: "Can I really use 1 App 100% free forever?",
            a: "Yes! Absolutely. You can select any 1 full ERP module (like CRM, Accounting, Inventory, or POS) and use it completely free forever with no credit card required. There is no trial expiration."
        },
        {
            q: "How does the $1/month Early Bird deal work?",
            a: "During our Early Bird launch, you get all 28 integrated business modules for only $1.00/month billed annually ($12 for the entire year), saving 96%. You can also choose monthly billing for $5.00/month. You lock in this rate for life."
        },
        {
            q: "Can I add team members and manage multiple companies?",
            a: "Yes! You can invite team members, assign granular permission roles, and buy additional user seats directly inside your dashboard. If you need multiple independent companies/legal entities, our Custom Enterprise plan supports multi-company management."
        },
        {
            q: "What payment methods are supported, and is it secure?",
            a: "All payments are securely handled through Paddle with 256-bit bank-grade encryption. We support Visa, Mastercard, American Express, Apple Pay, Google Pay, and PayPal. Every paid plan is backed by an unconditional 14-day money-back guarantee."
        }
    ];

    return (
        <main className="relative min-h-screen bg-[#020205] text-white overflow-hidden">
            {/* 3D Beraxis Cosmic Core: Follows seamlessly from Hero throughout the entire page down to footer */}
            <BeraxisCosmicCanvas />

            <Navbar />
            <Hero />
            
            {/* Real System Production Showcase with Tabs */}
            <RealProductShowcase />
            
            {/* ═══════════════════════════════════════════════════════════════
                PRICING SECTION: Positioned Prominently Right Below Hero
               ═══════════════════════════════════════════════════════════════ */}
            <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 scroll-mt-24">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-pink-500/15 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest mb-4 shadow-lg shadow-amber-500/10">
                        <Flame size={14} className="text-amber-400 animate-pulse" />
                        <span>Early Bird Launch Special — 96% OFF</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
                        Simple, Unbeatable <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">Pricing</span>
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
                        Start 100% free forever with 1 app (no credit card needed), or unlock all 28 integrated modules for as low as <strong className="text-amber-300 font-bold">$1/month</strong> ($12/year).
                    </p>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex items-center p-1.5 bg-[#0B0F19] border border-white/10 rounded-2xl shadow-xl">
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

                {/* 3 Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
                    
                    {/* Tier 1: One App Free */}
                    <div className="galaxy-card p-6 sm:p-8 flex flex-col justify-between bg-[#0F172A]/40 border-white/10 hover:border-white/20 transition-all rounded-3xl">
                        <div>
                            <div className="mb-4">
                                <span className="text-xs bg-emerald-500/10 text-emerald-400 uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border border-emerald-500/20">
                                    Forever Free · No Card
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-200 mb-2">One App Free</h3>
                            <p className="text-gray-400 text-xs mb-6">Pick any 1 full ERP module and use it forever with zero cost.</p>
                            
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-4xl sm:text-5xl font-black text-white">$0</span>
                                <span className="text-gray-500 text-xs">/ forever</span>
                            </div>
                            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-white/5">
                                <span className="text-xs text-emerald-400 font-semibold">No credit card required to start</span>
                            </div>

                            <div className="space-y-3.5 text-xs text-gray-300">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-emerald-400 shrink-0" size={14} />
                                    <span>Choose <strong>any 1</strong> full ERP module (CRM, Accounting, POS, etc.)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-emerald-400 shrink-0" size={14} />
                                    <span>Unlimited records &amp; transactions</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-emerald-400 shrink-0" size={14} />
                                    <span>1 Active Workspace Seat</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-emerald-400 shrink-0" size={14} />
                                    <span>50 Starter Lead Pool Previews</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-emerald-400 shrink-0" size={14} />
                                    <span>Fast Cloud Hosting &amp; SSL included</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="button"
                            onClick={() => router.push('/signup')}
                            className="w-full galaxy-btn-secondary mt-8"
                        >
                            <span>Start Free Forever (No Card)</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Tier 2: Standard Plan ($1/mo Early Bird) */}
                    <div className="galaxy-card p-6 sm:p-8 flex flex-col justify-between relative bg-gradient-to-b from-[#1E1B4B]/70 via-[#0F172A]/90 to-[#0F172A]/90 border-purple-500/50 shadow-[0_0_60px_rgba(139,92,246,0.3)] rounded-3xl scale-[1.02] md:scale-[1.04] z-10">
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white text-[11px] font-black uppercase tracking-wider py-1 px-4 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                            <Flame size={12} className="animate-pulse text-amber-300" />
                            <span>Most Popular · 96% OFF</span>
                        </div>
                        <div>
                            <div className="mb-4">
                                <span className="text-xs bg-purple-500/20 text-purple-300 uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border border-purple-500/30">
                                    Full Enterprise Access · All 28 Apps
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{pricing.standard.name}</h3>
                            <p className="text-gray-300 text-xs mb-6">
                                Complete multi-tenant ERP + CRM suite for growing businesses ready to scale.
                            </p>
                            
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                                    ${Number(standardRate).toFixed(2)}
                                </span>
                                <span className="text-gray-400 text-xs font-medium">/ seat / month</span>
                            </div>
                            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-white/10">
                                <span className="text-xs text-gray-400 line-through">
                                    ${Number(standardOriginalRate).toFixed(2)}/mo
                                </span>
                                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                    {isAnnual ? "$12 billed annually (96% OFF)" : "$5 billed monthly (84% OFF)"}
                                </span>
                            </div>

                            <div className="space-y-3.5 text-xs text-gray-200">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                    <span><strong>All 28 Unified Modules</strong> unlocked</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                    <span><strong>1,500 Lead Pool Credits / mo</strong> ($99/mo value included)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                    <span>AI Galaxy Copilot on all screens</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                    <span>Multi-Seat Team Hierarchy &amp; Role Management</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                    <span>Multi-Currency, Invoicing &amp; Tax automation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                    <span>Priority 24/7 WhatsApp &amp; Ticket Support</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-2">
                            <button
                                type="button"
                                onClick={() => handlePaddleCheckout("standard")}
                                className="w-full galaxy-btn-primary"
                            >
                                <CreditCard size={15} />
                                <span>{isAnnual ? "Claim Early Bird Standard ($1/mo · $12/yr)" : "Claim Early Bird Standard ($5/mo)"}</span>
                                <ArrowRight size={15} />
                            </button>
                            <p className="text-[10px] text-gray-400 text-center">14-Day Money-Back Guarantee · Cancel Anytime</p>
                        </div>
                    </div>

                    {/* Tier 3: Custom Enterprise */}
                    <div className="galaxy-card p-6 sm:p-8 flex flex-col justify-between bg-[#0F172A]/40 border-white/10 hover:border-white/20 transition-all rounded-3xl">
                        <div>
                            <div className="mb-4">
                                <span className="text-xs bg-cyan-500/10 text-cyan-400 uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border border-cyan-500/20">
                                    Dedicated Cloud · Multi-Company
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-200 mb-2">{pricing.custom.name}</h3>
                            <p className="text-gray-400 text-xs mb-6">For multi-entity businesses requiring 3+ companies &amp; multi-user seats.</p>
                            
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-4xl sm:text-5xl font-black text-white">
                                    ${Number(customRate).toFixed(2)}
                                </span>
                                <span className="text-gray-500 text-xs">/ seat / month</span>
                            </div>
                            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-white/5">
                                <span className="text-xs text-cyan-400 font-semibold">{isAnnual ? "$448.80 billed annually" : "$46.80 billed monthly"}</span>
                            </div>

                            <div className="space-y-3.5 text-xs text-gray-300">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-cyan-400 shrink-0" size={14} />
                                    <span>Everything in Standard Plan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-cyan-400 shrink-0" size={14} />
                                    <span><strong>Up to 3 Independent Companies</strong> included</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-cyan-400 shrink-0" size={14} />
                                    <span><strong>Multi-User Pack (3 to 7 seats)</strong> included</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-cyan-400 shrink-0" size={14} />
                                    <span><strong>10,000 Lead Pool Credits / mo</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-cyan-400 shrink-0" size={14} />
                                    <span>Dedicated isolated database cluster</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-cyan-400 shrink-0" size={14} />
                                    <span>Dedicated Account Manager &amp; 99.99% SLA</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="button"
                            onClick={() => handlePaddleCheckout("custom")}
                            className="w-full galaxy-btn-secondary mt-8"
                        >
                            <span>Get Multi-Company Enterprise</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>

                </div>

                {/* Trust Guarantee Reassurance Bar */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-gray-400">
                    <span className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        <span>256-Bit SSL Bank Encryption</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <CreditCard size={16} className="text-purple-400" />
                        <span>Powered by Paddle (Cards, Apple Pay, Google Pay, PayPal)</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-amber-400" />
                        <span>14-Day Money-Back Guarantee</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <Zap size={16} className="text-cyan-400" />
                        <span>Instant 30s Workspace Activation</span>
                    </span>
                </div>

                <div className="text-center mt-8">
                    <Link href="/pricing" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold text-xs tracking-wider uppercase transition-colors">
                        View Detailed Interactive Pricing Configurator &amp; Feature Matrix <ArrowRight size={13} />
                    </Link>
                </div>
            </section>

            {/* Core Stats Bar */}
            <Stats />

            {/* Features Breakdown */}
            <Features />

            {/* Industry Specific Configurations */}
            <IndustryShowcase />

            {/* Real User Testimonials */}
            <Testimonials />

            {/* Simple FAQ Section for High Conversion */}
            <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
                        <HelpCircle size={14} />
                        <span>Frequently Asked Questions</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Got Questions? We Have Answers.</h3>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                        <div 
                            key={idx}
                            className="bg-[#0B0F19]/90 border border-white/10 hover:border-purple-500/30 rounded-2xl overflow-hidden transition-all"
                        >
                            <button
                                type="button"
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 text-sm font-bold text-gray-200 hover:text-white"
                            >
                                <span>{faq.q}</span>
                                <ChevronDown 
                                    size={16} 
                                    className={`shrink-0 text-purple-400 transition-transform duration-200 ${
                                        openFaq === idx ? "rotate-180" : ""
                                    }`} 
                                />
                            </button>
                            {openFaq === idx && (
                                <div className="px-5 pb-4 text-xs sm:text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Final High-Converting Call To Action */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#0F172A]/80 to-pink-950/40 shadow-[0_0_80px_rgba(139,92,246,0.2)]">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
                            Ready to Run Your Entire Business on <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Beraxis</span>?
                        </h2>
                        <p className="text-gray-300 text-xs sm:text-base mb-8">
                            Join fast-growing companies replacing expensive legacy subscriptions. Start free forever or lock in the Early Bird deal today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-center">
                            <Link 
                                href="/signup" 
                                className="galaxy-btn-primary w-full sm:w-auto"
                            >
                                Start 1 App Free Forever
                            </Link>
                            <button
                                type="button"
                                onClick={() => handlePaddleCheckout("standard")}
                                className="galaxy-btn-outline w-full sm:w-auto"
                            >
                                Claim Early Bird Standard ($1/mo)
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
