"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Check, X, HelpCircle, Users, ArrowRight, MessageSquare, PhoneCall } from "lucide-react";

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"annually" | "monthly">("annually");
    const [usersCount, setUsersCount] = useState<number>(5);

    // Odoo pricing models
    // Standard: Annually = $24.90/user/mo, Monthly = $31.10/user/mo
    // Custom: Annually = $37.40/user/mo, Monthly = $46.80/user/mo
    const standardRate = billingCycle === "annually" ? 24.90 : 31.10;
    const customRate = billingCycle === "annually" ? 37.40 : 46.80;

    const standardTotal = (usersCount * standardRate).toFixed(2);
    const customTotal = (usersCount * customRate).toFixed(2);

    // Dynamic annual savings calculations
    const annualSavings = (usersCount * (31.10 - 24.90) * 12).toFixed(0);

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
        { name: "Beraxis Studio Customizer", free: false, standard: false, custom: true },
        { name: "Multi-Company Support", free: false, standard: false, custom: true },
        { name: "External API Integrations", free: false, standard: false, custom: true },
        { name: "Custom Databases (Odoo.sh equivalent)", free: false, standard: false, custom: true },
    ];

    const faqs = [
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
            a: "By selecting annual billing, you receive a discount of approximately 20% compared to paying month-to-month, saving hundreds of dollars per seat."
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
                                    Annually (Save ~20%)
                                </button>
                                <button 
                                    onClick={() => setBillingCycle("monthly")}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${billingCycle === "monthly" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25" : "text-gray-400 hover:text-white"}`}
                                >
                                    Monthly
                                </button>
                            </div>
                            {billingCycle === "annually" && (
                                <span className="text-xs bg-emerald-500/10 text-emerald-400 font-extrabold uppercase px-3 py-1 rounded-full border border-emerald-500/20 tracking-wider">
                                    💰 Saving ${annualSavings}/year on Standard Plan
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
                    <div className="galaxy-card p-8 flex flex-col justify-between border-purple-500/20 bg-[#0F172A]/40 relative shadow-2xl shadow-purple-500/5">
                        <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg">
                            Highly Recommended
                        </div>
                        <div>
                            <div className="mb-4">
                                <span className="text-xs bg-purple-500/10 text-purple-400 uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border border-purple-500/20">All Modules Included</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Standard</h3>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed">Unlock all 28 integrated modules on cloud hosting. Streamline all processes.</p>
                            
                            <div className="flex flex-col mb-8 border-b border-white/5 pb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-extrabold text-white">${standardRate.toFixed(2)}</span>
                                    <span className="text-gray-500 text-sm">/ seat / month</span>
                                </div>
                                <span className="text-xs text-purple-400 mt-2 font-bold uppercase tracking-wider">
                                    Total: ${standardTotal} / month ({usersCount} {usersCount === 1 ? "seat" : "seats"})
                                </span>
                            </div>

                            <ul className="space-y-4 text-sm text-gray-300">
                                <li className="flex items-center gap-3">
                                    <Check className="text-purple-400" size={16} />
                                    <span className="font-semibold text-white">All 28 Business Modules unlocked</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="text-purple-400" size={16} />
                                    <span>Live Database Backups</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="text-purple-400" size={16} />
                                    <span>High-Performance CDN</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-500">
                                    <X size={16} />
                                    <span>No Custom Code / API access</span>
                                </li>
                            </ul>
                        </div>

                        <Link 
                            href="/signup" 
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 px-4 rounded-xl mt-8 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95"
                        >
                            Launch Standard <ArrowRight size={16} />
                        </Link>
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
                                <li className="flex items-center gap-3">
                                    <Check className="text-pink-400" size={16} />
                                    <span>Everything in Standard plan</span>
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

                        <Link 
                            href="/signup" 
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-4 rounded-xl mt-8 transition-all border border-white/10 flex items-center justify-center gap-2 hover:border-pink-500/30"
                        >
                            Configure Custom <ArrowRight size={16} />
                        </Link>
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
                                            {m.free ? <Check size={16} className="text-purple-400 mx-auto" /> : <X size={16} className="text-gray-600 mx-auto" />}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {m.standard ? <Check size={16} className="text-purple-400 mx-auto" /> : <X size={16} className="text-gray-600 mx-auto" />}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {m.custom ? <Check size={16} className="text-pink-400 mx-auto" /> : <X size={16} className="text-gray-600 mx-auto" />}
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
