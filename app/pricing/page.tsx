"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Check, X, HelpCircle, Users, ArrowRight, MessageSquare, PhoneCall, Sparkles, Zap, Flame, Building2, CreditCard } from "lucide-react";
import { DEFAULT_PRICING_CONFIG, PricingConfig } from "@/lib/pricingConfig";

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"annually" | "monthly">("annually");
    const [usersCount, setUsersCount] = useState<number>(5);
    const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);

    // Fetch dynamic pricing from Super Admin configuration
    useEffect(() => {
        fetch("/api/admin/pricing")
            .then(res => res.json())
            .then(data => {
                if (data && data.standard) {
                    setPricing(data);
                }
            })
            .catch(() => {
                // Silently fallback to DEFAULT_PRICING_CONFIG ($1 annual / $5 monthly)
            });
    }, []);

    const isAnnual = billingCycle === "annually";

    // Active rates from config
    const standardRate = isAnnual 
        ? pricing.standard.annual_monthly_rate 
        : pricing.standard.monthly_rate;
    
    const customRate = isAnnual 
        ? pricing.custom.annual_monthly_rate 
        : pricing.custom.monthly_rate;

    const standardTotal = (usersCount * standardRate).toFixed(2);
    const customTotal = (usersCount * customRate).toFixed(2);

    // Strikethrough reference rates
    const standardOriginalRate = isAnnual 
        ? (pricing.standard.original_annual_rate || 24.90) 
        : (pricing.standard.original_monthly_rate || 31.10);

    // Dynamic savings: Annual ($1/mo) vs Monthly ($5/mo) savings over a 1-year period
    const annualSavingsPerSeat = Math.max(0, (pricing.standard.monthly_rate - pricing.standard.annual_monthly_rate) * 12);
    const annualSavings = (usersCount * annualSavingsPerSeat).toFixed(0);


    const modules = [
        { name: "Discuss & Channels", free: true, standard: true, custom: true },
        { name: "CRM Leads & Pipelines", free: false, standard: true, custom: true },
        { name: "Sales & Orders", free: false, standard: true, custom: true },
        { name: "Inventory Management", free: false, standard: true, custom: true },
        { name: "Accounting & Finance", free: false, standard: true, custom: true },
        { name: "HRMS & Employees", free: false, standard: true, custom: true },
        { name: "Payroll", free: false, standard: true, custom: true },
        { name: "Helpdesk Tickets", free: false, standard: true, custom: true },
        { name: "Discuss Polling", free: true, standard: true, custom: true },
        { name: "Manufacturing MRP", free: false, standard: true, custom: true },
        { name: "Timesheets & Planning", free: false, standard: true, custom: true },
        { name: "Point of Sale (POS)", free: false, standard: true, custom: true },
        { name: "Purchase Management", free: false, standard: true, custom: true },
        { name: "Surveys & Documents", free: false, standard: true, custom: true },
        { name: "Single vs Multi-Company", free: "1 Company", standard: "1 Company", custom: "3 Included (+ $15/extra)" },
        { name: "Lead Pool Credits / User / Mo", free: "50 Previews", standard: "1,500 (+ Top-up)", custom: "5,000+" },
        { name: "Beraxis Studio Customizer", free: false, standard: false, custom: true },
        { name: "External API Integrations", free: false, standard: false, custom: true },
        { name: "Dedicated Isolated Cloud Databases", free: false, standard: false, custom: true },
    ];

    const faqs = [
        {
            q: "How does company management work between Standard and Custom?",
            a: "The Standard Plan is designed for operating a single company workspace (1 Company) with all 28 modules unlocked. If your business operates multiple entities, subsidiaries, or legal branches, the Custom Enterprise plan includes 3 companies out-of-the-box, with extra companies available for $15/company/month."
        },
        {
            q: "Can I buy additional Lead Credits in the Lead Pool?",
            a: "Yes! While the Standard Plan includes 1,500 lead credits per user seat every month, you can easily top-up additional credit packs directly inside your CRM Leads Pool cockpit starting at $10 for 1,000 verified leads ($0.01/lead)."
        },
        {
            q: "How does the Lead Pool credits system work on the Standard Plan?",
            a: "Every user seat on the Standard plan receives 1,500 verified B2B lead credits each month (e.g., a 5-seat team gets 7,500 leads per month). Each credit unlocks full decision-maker contact details, runs real-time SMTP deliverability verification, and allows 1-click import into your CRM pipeline."
        },
        {
            q: "Can I change my plan or user count later?",
            a: "Yes! You can instantly scale your user seats up or down, or upgrade from Standard to Custom, directly inside your settings panel. Prorated credits will automatically apply."
        },
        {
            q: "Is there really a completely free option?",
            a: "Absolutely. Our 'One App Free' plan lets you use any single module (like CRM, Inventory, or Discuss) with unlimited users forever, at $0 cost."
        },
        {
            q: "What support channels are active for the Custom plan?",
            a: "Custom tier clients get direct access to our 24/7 Phone & WhatsApp hotline (+1 970 780 7993) with dedicated account manager SLAs under 30 minutes."
        },
        {
            q: "How does the annual billing discount work?",
            a: "By selecting annual billing, you lock in the Early Bird $1/month/seat rate (billed as $12/user for the entire year upfront), saving 96% compared to standard pricing."
        }
    ];

    return (
        <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
            <Navbar />
 
            {/* Hero Header */}
            <div className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                        Scale on Your Own <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Terms</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-light leading-relaxed">
                        Access all 28 modules, robust cloud infrastructure, and 24/7 human support. Simple, user-based plans mimicking industry-standard transparency.
                    </p>
                </div>

                {/* Interactive Configurator Area */}
                <div className="max-w-4xl mx-auto mb-16 bg-[#0F172A]/40 border border-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* Interactive Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                    <Users size={16} className="text-purple-400" /> Number of Users
                                </label>
                                <span className="text-2xl font-black text-purple-400">{usersCount} {usersCount === 1 ? "User" : "Users"}</span>
                            </div>
                            <input 
                                type="range" 
                                min={1} 
                                max={100} 
                                value={usersCount} 
                                onChange={(e) => setUsersCount(parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-all"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                                <span>1 User</span>
                                <span>25 Users</span>
                                <span>50 Users</span>
                                <span>75 Users</span>
                                <span>100+ Users</span>
                            </div>
                        </div>

                        {/* Billing cycle & Savings visual */}
                        <div className="flex flex-col items-center md:items-end justify-center">
                            <div className="flex bg-[#070B16] p-1.5 rounded-2xl border border-white/5 mb-4">
                                <button 
                                    onClick={() => setBillingCycle("annually")}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${billingCycle === "annually" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25" : "text-gray-400 hover:text-white"}`}
                                >
                                    Annually ($1/mo Early Bird)
                                </button>
                                <button 
                                    onClick={() => setBillingCycle("monthly")}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${billingCycle === "monthly" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25" : "text-gray-400 hover:text-white"}`}
                                >
                                    Monthly ($5/mo Early Bird)
                                </button>
                            </div>
                            {billingCycle === "annually" ? (
                                <span className="text-xs bg-emerald-500/10 text-emerald-400 font-extrabold uppercase px-3 py-1 rounded-full border border-emerald-500/20 tracking-wider flex items-center gap-1.5">
                                    💰 Save ${annualSavings}/year vs Monthly on Standard!
                                </span>
                            ) : (
                                <span className="text-xs bg-purple-500/10 text-purple-300 font-extrabold uppercase px-3 py-1 rounded-full border border-purple-500/20 tracking-wider">
                                    🚀 Early Bird Monthly: Only $5/seat/month
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Core Pricing Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch mb-28">
                    {/* Tier 1: One App Free */}
                    <div className="galaxy-card p-8 flex flex-col justify-between border-white/5 bg-[#0F172A]/20">
                        <div>
                            <div className="mb-4">
                                <span className="text-xs bg-white/5 text-gray-400 uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border border-white/10">Forever Free</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">One App Free</h3>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed">Perfect to start. Use any single app (e.g. Discuss or CRM) with unlimited users.</p>
                            
                            <div className="flex items-baseline gap-1 mb-8 border-b border-white/5 pb-8">
                                <span className="text-5xl font-extrabold text-white">$0</span>
                                <span className="text-gray-500 text-sm">/ seat / month</span>
                            </div>

                            <ul className="space-y-4 text-sm text-gray-300">
                                <li className="flex items-center gap-3">
                                    <Check className="text-purple-400" size={16} />
                                    <span>Choose **any 1** full ERP/CRM module</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="text-purple-400" size={16} />
                                    <span>Unlimited Users</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="text-purple-400" size={16} />
                                    <span>Single Company Workspace (1 Company)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="text-purple-400" size={16} />
                                    <span>50 Starter Lead Pool Previews</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="text-purple-400" size={16} />
                                    <span>Fully Managed SaaS hosting</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-500">
                                    <X size={16} />
                                    <span>No Multi-company dashboard</span>
                                </li>
                            </ul>
                        </div>

                        <Link 
                            href="/signup" 
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-4 rounded-xl mt-8 transition-all border border-white/10 flex items-center justify-center gap-2"
                        >
                            Deploy Free Space <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Tier 2: Standard Plan */}
                    <div className="galaxy-card p-8 flex flex-col justify-between border-purple-500/30 bg-[#0F172A]/40 relative shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/20">
                        <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                            <Flame size={13} className="text-yellow-300 animate-pulse" />
                            {pricing.standard.is_early_bird ? (pricing.standard.badge_text || "Early Bird Launch Special") : "Highly Recommended"}
                        </div>
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <span className="text-xs bg-purple-500/20 text-purple-300 uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border border-purple-500/30">
                                    All 28 Modules Included
                                </span>
                                {pricing.standard.is_early_bird && (
                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                                        Early Bird
                                    </span>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Standard Plan</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">Unlock all 28 integrated modules on cloud hosting. Streamline all processes.</p>
                            
                            <div className="flex flex-col mb-8 border-b border-white/5 pb-8">
                                {/* Strike-through comparison */}
                                {pricing.standard.is_early_bird && standardOriginalRate > standardRate && (
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-base text-gray-500 line-through font-bold">
                                            ${standardOriginalRate.toFixed(2)}
                                        </span>
                                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                            {Math.round(((standardOriginalRate - standardRate) / standardOriginalRate) * 100)}% OFF EARLY BIRD
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white">${standardRate.toFixed(2)}</span>
                                    <span className="text-gray-400 text-sm">/ seat / month</span>
                                </div>

                                <div className="mt-3 flex flex-col gap-1">
                                    <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">
                                        Total: ${standardTotal} / month ({usersCount} {usersCount === 1 ? "seat" : "seats"})
                                    </span>
                                    {isAnnual && (
                                        <span className="text-[11px] text-gray-400">
                                            Billed annually at ${(parseFloat(standardTotal) * 12).toFixed(2)} / year ({usersCount} seats × ${standardRate.toFixed(2)}/mo × 12 mos)
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-4 text-sm text-gray-300">
                                <li className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-xl p-2.5 -mx-1 text-white font-bold">
                                    <Building2 className="text-purple-400 shrink-0" size={16} />
                                    <span>Single Company Workspace (1 Company included)</span>
                                </li>
                                <li className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-2.5 -mx-1 text-cyan-200 font-bold shadow-sm">
                                    <Zap className="text-cyan-400 shrink-0" size={16} />
                                    <span>1,500 Verified B2B Lead Credits / user / month</span>
                                </li>
                                <li className="flex items-center gap-3 text-xs text-gray-300">
                                    <Check className="text-emerald-400 shrink-0" size={15} />
                                    <span>Buy extra lead packs anytime in Lead Pool ($10 / 1,000)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="text-purple-400" size={16} />
                                    <span className="font-semibold text-white">All 28 Business Modules unlocked</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="text-purple-400" size={16} />
                                    <span>Early Bird rate locked in for active term</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="text-purple-400" size={16} />
                                    <span>Live Database Backups & High-Performance CDN</span>
                                </li>
                            </ul>
                        </div>

                        <a 
                            href={`/checkout?plan=standard&billing=${billingCycle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold py-3.5 px-4 rounded-xl mt-8 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95 text-center"
                        >
                            Pay with Card (${standardRate.toFixed(2)}/mo) <ArrowRight size={16} />
                        </a>
                    </div>

                    {/* Tier 3: Custom Plan */}
                    <div className="galaxy-card p-8 flex flex-col justify-between border-pink-500/20 bg-[#0F172A]/20">
                        <div>
                            <div className="mb-4">
                                <span className="text-xs bg-pink-500/10 text-pink-400 uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border border-pink-500/20">Custom developer tools</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Custom</h3>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed">For multi-company management, external integrations, API access, and Studio customizer.</p>
                            
                            <div className="flex flex-col mb-8 border-b border-white/5 pb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-extrabold text-white">${customRate.toFixed(2)}</span>
                                    <span className="text-gray-500 text-sm">/ seat / month</span>
                                </div>
                                <span className="text-xs text-pink-400 mt-2 font-bold uppercase tracking-wider">
                                    Total: ${customTotal} / month ({usersCount} {usersCount === 1 ? "seat" : "seats"})
                                </span>
                            </div>

                            <ul className="space-y-4 text-sm text-gray-300">
                                <li className="flex items-center gap-3 bg-pink-500/15 border border-pink-500/30 rounded-xl p-2.5 -mx-1 text-pink-100 font-bold shadow-sm">
                                    <Building2 className="text-pink-400 shrink-0" size={16} />
                                    <span>Multi-Company: 3 Companies included (+ $15/mo per extra company)</span>
                                </li>
                                <li className="flex items-center gap-3 bg-pink-500/10 border border-pink-500/30 rounded-xl p-2.5 -mx-1 text-pink-200 font-bold shadow-sm">
                                    <Zap className="text-pink-400 shrink-0" size={16} />
                                    <span>5,000+ Custom Lead Credits / user / month</span>
                                </li>
                                <li className="flex items-center gap-3 text-xs text-gray-300">
                                    <Check className="text-pink-400 shrink-0" size={15} />
                                    <span>Buy extra high-volume lead credits on-demand</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="text-pink-400" size={16} />
                                    <span className="font-semibold text-white">Beraxis Studio Customizer app</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="text-pink-400" size={16} />
                                    <span>External API & Webhooks Access</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="text-pink-400" size={16} />
                                    <span className="font-semibold text-white">24/7 Phone & WhatsApp Hotline support</span>
                                </li>
                            </ul>
                        </div>

                        <a 
                            href={`/checkout?plan=custom&billing=${billingCycle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-4 rounded-xl mt-8 transition-all border border-white/10 flex items-center justify-center gap-2 hover:border-pink-500/30"
                        >
                            Pay with Card <ArrowRight size={16} />
                        </a>
                    </div>
                </div>

                
                {/* Dedicated Leads Pool Solo Spotlight Banner */}
                <div className="max-w-5xl mx-auto mb-16 relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 p-8 backdrop-blur-xl shadow-2xl shadow-amber-500/5">
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-rose-500 text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-1 rounded-bl-xl shadow-md">
                        Standalone Lead Generation
                    </div>
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="space-y-3 text-center lg:text-left flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                                <span>🎯 Only Need Leads? Standalone Tier Available</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-white">
                                Leads Pool Solo — <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">$10/month</span>
                            </h3>
                            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
                                Get dedicated monthly access to our <strong className="text-white">25.8M+ verified global B2B contacts database</strong> without subscribing to full ERP suites. Includes <span className="text-amber-300 font-bold">1,500 direct contacts every month</span> with direct phone, WhatsApp dials, and deliverable corporate emails.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-1 justify-center lg:justify-start text-xs text-gray-300">
                                <span className="flex items-center gap-1.5"><Check size={14} className="text-amber-400" /> 1,500 Contacts / Month</span>
                                <span className="flex items-center gap-1.5"><Check size={14} className="text-amber-400" /> WhatsApp &amp; Mobile Dials</span>
                                <span className="flex items-center gap-1.5"><Check size={14} className="text-amber-400" /> 1-Click CSV/Excel Export</span>
                                <span className="flex items-center gap-1.5"><Check size={14} className="text-amber-400" /> Paddle Global Checkout (Cards, Apple Pay, PayPal)</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center sm:items-end shrink-0 gap-3">
                            <div className="text-right">
                                <span className="text-4xl font-black text-white">$10</span>
                                <span className="text-gray-400 text-xs"> / month</span>
                            </div>
                            <a
                                href="/checkout?plan=leadspool&billing=monthly"
                                className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-extrabold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-center text-sm flex items-center justify-center gap-2"
                            >
                                Get Leads Pool Solo <ArrowRight size={16} />
                            </a>
                            <span className="text-[11px] text-gray-400">Cancel anytime • Instant access</span>
                        </div>
                    </div>
                </div>

                {/* Call-to-action Support banner */}
                <div className="max-w-4xl mx-auto mb-28 border border-white/10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl p-8 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
                    <div className="space-y-2 text-center md:text-left">
                        <h4 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
                            📞 Immediate Live Assistance Available
                        </h4>
                        <p className="text-sm text-gray-400 max-w-xl">
                            Need help mapping your enterprise migration or selecting a billing package? Connect instantly with our active desk.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
                        <a 
                            href="https://wa.me/19707807993" 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-center text-sm flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={16} /> WhatsApp Chat
                        </a>
                        <a 
                            href="tel:+19707807993" 
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-6 py-3.5 rounded-xl transition-all text-center text-sm flex items-center justify-center gap-2"
                        >
                            <PhoneCall size={16} /> Call +1 (970) 780-7993
                        </a>
                    </div>
                </div>

                {/* Module Features Matrix */}
                <div className="max-w-5xl mx-auto mb-28">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-center text-white mb-12">Detailed Module Feature Matrix</h3>
                    <div className="border border-white/10 rounded-3xl bg-[#0F172A]/20 overflow-hidden backdrop-blur-md shadow-2xl">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-[#0F172A]/80 text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                                    <th className="py-5 px-6">Beraxis Enterprise Modules</th>
                                    <th className="py-5 px-6 text-center">One App Free</th>
                                    <th className="py-5 px-6 text-center">Standard Plan</th>
                                    <th className="py-5 px-6 text-center">Custom Plan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300">
                                {modules.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-6 font-semibold text-white">{m.name}</td>
                                        <td className="py-4 px-6 text-center">
                                            {typeof m.free === "string" ? (
                                                <span className="text-[11px] font-bold text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md inline-block">{m.free}</span>
                                            ) : m.free ? (
                                                <Check size={16} className="text-purple-400 mx-auto" />
                                            ) : (
                                                <X size={16} className="text-gray-600 mx-auto" />
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {typeof m.standard === "string" ? (
                                                <span className="text-[11px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-md inline-block">{m.standard}</span>
                                            ) : m.standard ? (
                                                <Check size={16} className="text-purple-400 mx-auto" />
                                            ) : (
                                                <X size={16} className="text-gray-600 mx-auto" />
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {typeof m.custom === "string" ? (
                                                <span className="text-[11px] font-bold text-pink-300 bg-pink-500/15 border border-pink-500/30 px-2 py-0.5 rounded-md inline-block">{m.custom}</span>
                                            ) : m.custom ? (
                                                <Check size={16} className="text-pink-400 mx-auto" />
                                            ) : (
                                                <X size={16} className="text-gray-600 mx-auto" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ Accordion */}
                <div className="max-w-4xl mx-auto mb-20 border-t border-white/5 pt-20">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-center text-white mb-16">Frequently Asked Billing Questions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="galaxy-card p-6 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-3 flex items-start gap-2">
                                        <HelpCircle size={18} className="text-purple-400 shrink-0 mt-0.5" />
                                        <span>{faq.q}</span>
                                    </h4>
                                    <p className="text-sm text-gray-400 leading-relaxed pl-7">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
