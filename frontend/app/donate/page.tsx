"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { 
    Heart, 
    ShieldCheck, 
    Sparkles, 
    Zap, 
    Globe, 
    Server, 
    Users, 
    Lock, 
    ArrowRight, 
    CheckCircle2, 
    HelpCircle,
    Building2,
    DollarSign,
    Award
} from "lucide-react";
import { CREEM_PRODUCTS } from "@/lib/creemConfig";

export default function DonatePage() {
    const [selectedAmount, setSelectedAmount] = useState<number>(25);
    const [customAmount, setCustomAmount] = useState<string>("");

    const DONATE_URL = CREEM_PRODUCTS.donate.url; // https://www.creem.io/payment/prod_3Q2uUJ5aBPlOG6YQLS2HjJ

    const PRESET_AMOUNTS = [
        { amount: 5, label: "Coffee Supporter", desc: "Minimum $5 · Covers 1 day of CDN bandwidth" },
        { amount: 15, label: "Server Booster", desc: "Helps host verified leads crawlers" },
        { amount: 25, label: "Community Champion", popular: true, desc: "Sponsors free tier cloud resources for 5 startups" },
        { amount: 50, label: "Open Infrastructure", desc: "Powers automated database backups & testing" },
        { amount: 100, label: "Enterprise Patron", desc: "Supports AI copilot computing credits for students" },
        { amount: 250, label: "Founding Backer", desc: "Permanent honor on our open-source wall of supporters" }
    ];

    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">
            <Navbar />

            <main className="flex-grow pt-28 sm:pt-36 pb-24 relative z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Hero Header */}
                    <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg shadow-rose-500/10">
                            <Heart size={14} className="text-rose-400 fill-rose-400 animate-pulse" />
                            <span>BERAXIS Open Community & Sustainability Fund</span>
                        </div>
                        
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                            Support Fair-Priced, <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-300 to-cyan-400">
                                Open Business Technology
                            </span>
                        </h1>
                        
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                            BERAXIS was built on a simple conviction: small businesses, founders, and students shouldn&apos;t be priced out of modern enterprise software. Your generous contribution fuels our independent cloud infrastructure, verified B2B extraction engine, and forever-free starter tier.
                        </p>
                    </div>

                    {/* Main Donation Container */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
                        
                        {/* Left: Donation Tiers & Action Card */}
                        <div className="lg:col-span-7 bg-[#0F172A]/85 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                                        <Heart size={22} className="text-rose-400 fill-rose-400" />
                                        <span>Choose Your Contribution</span>
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        $5 USD is the minimum donation amount. You can donate any amount you wish.
                                    </p>
                                </div>
                                <span className="text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                                    Instant Receipt
                                </span>
                            </div>

                            {/* Preset Amount Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {PRESET_AMOUNTS.map((p) => {
                                    const isSelected = selectedAmount === p.amount && !customAmount;
                                    return (
                                        <button
                                            key={p.amount}
                                            type="button"
                                            onClick={() => { setSelectedAmount(p.amount); setCustomAmount(""); }}
                                            className={`p-3.5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                                                isSelected
                                                    ? "bg-rose-500/20 border-rose-500 text-white shadow-lg shadow-rose-500/20 scale-[1.02]"
                                                    : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.07] hover:border-white/20"
                                            }`}
                                        >
                                            {p.popular && (
                                                <span className="absolute -top-2 right-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full">
                                                    Popular
                                                </span>
                                            )}
                                            <div className="text-lg font-black text-white">${p.amount}</div>
                                            <div className="text-[11px] font-bold text-gray-300 mt-0.5">{p.label}</div>
                                            <div className="text-[10px] text-gray-400 leading-tight mt-1 line-clamp-2">{p.desc}</div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Minimum Amount Notice Callout */}
                            <div className="p-4 rounded-2xl bg-[#0B1224] border border-cyan-500/30 flex items-center justify-between flex-wrap gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <DollarSign size={16} className="text-cyan-400 shrink-0" />
                                    <span className="text-gray-300">
                                        <strong className="text-white">Minimum Donation:</strong> $5.00 USD
                                    </span>
                                </div>
                                <span className="text-[11px] text-cyan-300 font-semibold">
                                    Supports cards, Apple Pay & Google Pay
                                </span>
                            </div>

                            {/* Primary Donation Action Button with Creem MoR */}
                            <div className="space-y-3 pt-2">
                                <a
                                    href={DONATE_URL}
                                    data-creem-checkout
                                    data-creem-theme="dark"
                                    className="w-full bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-rose-500/30 flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    <Heart size={18} className="fill-white" />
                                    <span>Donate to BERAXIS (Min $5 USD)</span>
                                    <ArrowRight size={16} />
                                </a>

                                <p className="text-[11px] text-center text-gray-400">
                                    Clicking opens the secure 1-click Creem overlay modal. You can review or adjust your donation amount on the checkout screen.
                                </p>
                            </div>

                            {/* Official Creem Embedded Button (Requested by User) */}
                            <div className="border-t border-white/10 pt-4 flex flex-col items-center justify-center space-y-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                                    Official Fast Checkout Button
                                </span>
                                <div className="flex justify-center">
                                    <a
                                        href="https://www.creem.io/payment/prod_3Q2uUJ5aBPlOG6YQLS2HjJ"
                                        data-creem-checkout
                                        data-creem-theme="light"
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            padding: "11px 18px",
                                            borderRadius: "12px",
                                            border: "2px solid #151617",
                                            background: "#FFBE98",
                                            color: "#151617",
                                            boxShadow: "0 3px 0 0 #151617",
                                            fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
                                            fontSize: "14px",
                                            fontWeight: 700,
                                            lineHeight: 1,
                                            cursor: "pointer",
                                            textDecoration: "none"
                                        }}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 121 121" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: "block", flex: "0 0 auto" }}>
                                            <path d="M22.1102 11C24.1187 11 25.9669 12.0982 26.9281 13.8619L51.2059 58.4106C52.5699 60.9134 55.7048 61.8368 58.2077 60.473C60.7108 59.109 61.6342 55.9742 60.2701 53.4712L41.5466 19.113C39.554 15.4566 42.2004 11 46.3645 11H103.806C107.885 11 110.539 15.2933 108.715 18.9416L65.0579 106.254C63.0356 110.298 57.2654 110.298 55.2431 106.254L11.5863 18.9416C9.76212 15.2933 12.4156 11 16.4946 11H22.1102Z" fill="#151617" />
                                        </svg>
                                        <span>Buy with Creem</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Right: Where Funds Go & Transparency */}
                        <div className="lg:col-span-5 space-y-6">
                            
                            {/* Mission & Impact Card */}
                            <div className="bg-[#0F172A]/85 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Sparkles size={18} className="text-amber-400" />
                                    <span>Where Your Donation Goes</span>
                                </h3>

                                <div className="space-y-3.5 text-xs">
                                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                                            <Server size={16} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Cloud Server & Database Clusters</div>
                                            <p className="text-gray-400 text-[11px] mt-0.5">
                                                Keeping 99.9% uptime for PostgreSQL databases, CDN edges, and high-frequency sync across 14+ global regions.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                                            <Globe size={16} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Verified B2B Crawlers & Anti-Spam</div>
                                            <p className="text-gray-400 text-[11px] mt-0.5">
                                                Funding automated live crawlers that verify active corporate numbers and executive emails so users never waste time on dead leads.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                            <Users size={16} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Subsidizing Free Founders Tier</div>
                                            <p className="text-gray-400 text-[11px] mt-0.5">
                                                Allowing thousands of bootstrap teams, students, and early non-profits to run their business apps for $0.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trust & Merchant of Record Guarantee */}
                            <div className="bg-[#0B1224] border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-3">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={20} className="text-emerald-400" />
                                    <h4 className="text-sm font-bold text-white">100% Secure & Regulated Giving</h4>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    Payments are processed via <strong>Creem Merchant of Record (MoR)</strong> with 256-bit bank encryption. We do not store raw card numbers. An official donation receipt will be emailed immediately for your tax/accounting records.
                                </p>
                                <div className="pt-2 flex items-center gap-3 text-[11px] text-gray-400">
                                    <span className="flex items-center gap-1 text-emerald-300">
                                        <CheckCircle2 size={12} /> PCI-DSS Compliant
                                    </span>
                                    <span>•</span>
                                    <span>Apple Pay &amp; Google Pay</span>
                                    <span>•</span>
                                    <span>Encrypted SSL</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Donor FAQs */}
                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white">Donation Frequently Asked Questions</h2>
                            <p className="text-xs text-gray-400 mt-1">Everything you need to know about supporting BERAXIS</p>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4">
                                <h3 className="font-bold text-white text-sm mb-1">Is $5 USD really the minimum donation amount?</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Yes. Due to international credit card processing overhead and banking minimums, $5 USD is the minimum single transaction. You can donate $5 or any higher amount to support BERAXIS development.
                                </p>
                            </div>

                            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4">
                                <h3 className="font-bold text-white text-sm mb-1">What payment methods can I use?</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Through Creem, we accept Visa, Mastercard, American Express, Apple Pay, Google Pay, and international bank cards in over 135 currencies.
                                </p>
                            </div>

                            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4">
                                <h3 className="font-bold text-white text-sm mb-1">Will I get an official receipt for my donation?</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Yes! The moment your donation clears, an itemized PDF receipt with a unique transaction reference will be delivered directly to the email address you provide at checkout.
                                </p>
                            </div>

                            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4">
                                <h3 className="font-bold text-white text-sm mb-1">Can companies or sponsors contribute larger amounts?</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Absolutely. Corporate sponsors and organizations looking to fund specific open-source integrations or feature modules can also contact our leadership team directly at <a href="mailto:support@beraxis.online" className="text-cyan-400 hover:underline">support@beraxis.online</a>.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
