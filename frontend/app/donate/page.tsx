"use client";

import PaymentLogos from "@/components/common/PaymentLogos";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { 
    Heart, 
    ShieldCheck, 
    Sparkles, 
    Globe, 
    Server, 
    Users, 
    ArrowRight, 
    CheckCircle2, 
    DollarSign,
    Leaf,
    TreePine,
    Recycle,
    Sun,
    GraduationCap,
    FileText,
    ExternalLink,
    Lock,
    Award
} from "lucide-react";
import { CREEM_PRODUCTS } from "@/lib/creemConfig";

export default function DonatePage() {
    const [selectedAmount, setSelectedAmount] = useState<number>(25);
    const [customAmount, setCustomAmount] = useState<string>("");

    const DONATE_URL = CREEM_PRODUCTS.donate.url; // https://www.creem.io/payment/prod_3Q2uUJ5aBPlOG6YQLS2HjJ

    const PRESET_AMOUNTS = [
        { 
            amount: 5, 
            label: "Green Seedling Supporter", 
            badge: "Minimum $5",
            desc: "Offsets 10,000 digital invoice computations with 100% renewable energy." 
        },
        { 
            amount: 15, 
            label: "Paperless Advocate", 
            desc: "Funds cloud hosting for 25 small businesses shifting from paper to digital ERP." 
        },
        { 
            amount: 25, 
            label: "Community Champion", 
            popular: true, 
            desc: "Directly funds the planting of 5 native trees + sponsors free tier for 3 rural startups." 
        },
        { 
            amount: 50, 
            label: "Eco-Cloud Guardian", 
            desc: "Powers our low-emission compute cluster & automated database backup nodes." 
        },
        { 
            amount: 100, 
            label: "Academic & Tech Patron", 
            desc: "Sponsors free business simulation licenses and AI credits for 20 student teams." 
        },
        { 
            amount: 250, 
            label: "Founding Eco-Sponsor", 
            desc: "Permanent recognition on our Open Sustainability Wall + offsets 5 metric tons of CO2." 
        }
    ];

    const currentDonationValue = customAmount ? parseFloat(customAmount) || 5 : selectedAmount;

    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
            <Navbar />

            <main className="flex-grow pt-28 sm:pt-36 pb-24 relative z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Hero Header */}
                    <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg shadow-emerald-500/10">
                            <Leaf size={14} className="text-emerald-400 animate-pulse" />
                            <span>BERAXIS Environmental Protection &amp; Community Fund</span>
                        </div>
                        
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                            Empower Fair Technology. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                                Protect Our Planet.
                            </span>
                        </h1>
                        
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                            Every dollar you donate directly accelerates <strong className="text-white">carbon-neutral green cloud computing</strong>, <strong className="text-white">100% paperless business digitalization</strong>, native tree planting, and free enterprise software licenses for underprivileged entrepreneurs and students worldwide.
                        </p>
                    </div>

                    {/* Impact Counter Badges */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                        <div className="bg-[#0F172A]/80 border border-emerald-500/20 rounded-2xl p-4 text-center backdrop-blur-xl">
                            <div className="flex justify-center mb-2">
                                <Sun size={24} className="text-amber-400" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
                            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mt-0.5">Renewable Cloud</div>
                            <p className="text-[10px] text-gray-400 mt-1">Hydro &amp; solar-backed datacenters</p>
                        </div>

                        <div className="bg-[#0F172A]/80 border border-teal-500/20 rounded-2xl p-4 text-center backdrop-blur-xl">
                            <div className="flex justify-center mb-2">
                                <Recycle size={24} className="text-teal-400" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-white">1.8M+</div>
                            <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider mt-0.5">Sheets of Paper Saved</div>
                            <p className="text-[10px] text-gray-400 mt-1">Through zero-waste digital ERP</p>
                        </div>

                        <div className="bg-[#0F172A]/80 border border-emerald-500/20 rounded-2xl p-4 text-center backdrop-blur-xl">
                            <div className="flex justify-center mb-2">
                                <TreePine size={24} className="text-emerald-400" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-white">12,450+</div>
                            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mt-0.5">Trees Planted</div>
                            <p className="text-[10px] text-gray-400 mt-1">With global reforestation partners</p>
                        </div>

                        <div className="bg-[#0F172A]/80 border border-purple-500/20 rounded-2xl p-4 text-center backdrop-blur-xl">
                            <div className="flex justify-center mb-2">
                                <GraduationCap size={24} className="text-purple-400" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-white">3,200+</div>
                            <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mt-0.5">Students &amp; Startups</div>
                            <p className="text-[10px] text-gray-400 mt-1">Subsidized 100% free licenses</p>
                        </div>
                    </div>

                    {/* Main Donation Container */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
                        
                        {/* Left: Donation Tiers & Action Card */}
                        <div className="lg:col-span-7 bg-[#0F172A]/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                                        <Heart size={22} className="text-rose-400 fill-rose-400" />
                                        <span>Select Your Contribution</span>
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        $5 USD is the minimum donation amount. You can donate any amount you wish.
                                    </p>
                                </div>
                                <span className="text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                                    Instant Tax Receipt
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
                                                    ? "bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]"
                                                    : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.07] hover:border-white/20"
                                            }`}
                                        >
                                            {p.popular && (
                                                <span className="absolute -top-2 right-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full">
                                                    Popular
                                                </span>
                                            )}
                                            {p.badge && !p.popular && (
                                                <span className="absolute -top-2 right-2 bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                                                    {p.badge}
                                                </span>
                                            )}
                                            <div className="text-xl font-black text-white">${p.amount}</div>
                                            <div className="text-[11px] font-bold text-gray-200 mt-0.5 leading-snug">{p.label}</div>
                                            <div className="text-[10px] text-gray-400 leading-tight mt-1 line-clamp-2">{p.desc}</div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Custom Amount Field */}
                            <div className="bg-[#0B1224] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <span>Or Enter Custom Amount (USD)</span>
                                    </div>
                                    <p className="text-[11px] text-gray-400">Minimum $5.00 USD. You can donate any amount.</p>
                                </div>
                                <div className="relative w-36">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        min="5"
                                        step="1"
                                        placeholder="50.00"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        className="w-full bg-white/5 border border-white/15 focus:border-emerald-500 rounded-xl py-2 pl-7 pr-3 text-sm text-white font-bold outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Minimum Amount & Payment Methods */}
                            <div className="p-4 rounded-2xl bg-[#0B1224] border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                    <DollarSign size={16} className="text-cyan-400 shrink-0" />
                                    <span className="text-gray-300">
                                        <strong className="text-white">Minimum Contribution:</strong> $5.00 USD (Any amount accepted)
                                    </span>
                                </div>
                                <PaymentLogos showTitle={false} compact={true} />
                            </div>

                            {/* Primary Donation Action Button with Creem MoR */}
                            <div className="space-y-3 pt-2">
                                <a
                                    href={DONATE_URL}
                                    data-creem-checkout
                                    data-creem-theme="dark"
                                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    <Heart size={18} className="fill-white text-white" />
                                    <span>Donate ${currentDonationValue >= 5 ? currentDonationValue : 5} USD to BERAXIS</span>
                                    <ArrowRight size={16} />
                                </a>

                                <p className="text-[11px] text-center text-gray-400">
                                    Clicking opens the secure 1-click Creem checkout overlay. You can enter or confirm your donation amount on the checkout screen.
                                </p>
                            </div>

                            {/* Official Creem Embedded Button */}
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

                        {/* Right: Detailed Impact & Programs Showcase */}
                        <div className="lg:col-span-5 space-y-6">
                            
                            {/* Environmental Protection Pillar Card */}
                            <div className="bg-[#0F172A]/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Leaf size={18} className="text-emerald-400" />
                                        <span>Environmental Protection</span>
                                    </h3>
                                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                        Net Zero Goal
                                    </span>
                                </div>

                                <div className="space-y-3.5 text-xs">
                                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                            <Server size={16} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">100% Renewable Cloud Infrastructure</div>
                                            <p className="text-gray-400 text-[11px] mt-0.5 leading-relaxed">
                                                Our servers operate across low-carbon facilities powered by hydro, geothermal, and solar energy, drastically reducing the emissions of every transaction.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                        <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                                            <Recycle size={16} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Paperless Zero-Waste Digitalization</div>
                                            <p className="text-gray-400 text-[11px] mt-0.5 leading-relaxed">
                                                By replacing physical paper receipts, warehouse clipboards, and file cabinets with cloud-native ERP workflows, we save thousands of trees annually.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                            <TreePine size={16} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Native Reforestation Partnerships</div>
                                            <p className="text-gray-400 text-[11px] mt-0.5 leading-relaxed">
                                                A portion of community donations directly finances the planting and care of native saplings in deforested habitats to restore local biodiversity.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social & Academic Programs Card */}
                            <div className="bg-[#0F172A]/90 border border-purple-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Sparkles size={18} className="text-purple-400" />
                                    <span>Social Programs &amp; Free Tier</span>
                                </h3>

                                <div className="space-y-3.5 text-xs">
                                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                                            <Users size={16} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Underprivileged Startup Subsidies</div>
                                            <p className="text-gray-400 text-[11px] mt-0.5 leading-relaxed">
                                                Ensuring early-stage founders in developing economies, rural farming cooperatives, and local creators get full ERP &amp; CRM power at $0.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                                            <GraduationCap size={16} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Free Academic &amp; Student Labs</div>
                                            <p className="text-gray-400 text-[11px] mt-0.5 leading-relaxed">
                                                Sponsoring educational licenses and AI Copilot tokens for universities, business schools, and future software engineers.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trust & Merchant of Record Guarantee */}
                            <div className="bg-[#0B1224] border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-3">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={20} className="text-emerald-400" />
                                    <h4 className="text-sm font-bold text-white">100% Regulated &amp; Encrypted Giving</h4>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    Transactions are processed securely via <strong>Creem Merchant of Record (MoR)</strong> with 256-bit bank encryption. We do not store raw payment card data. An official itemized donation receipt is emailed immediately.
                                </p>
                                <div className="pt-2 flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                                    <span className="flex items-center gap-1 text-emerald-300">
                                        <CheckCircle2 size={12} /> PCI-DSS Level 1
                                    </span>
                                    <span>•</span>
                                    <span>Apple Pay &amp; Google Pay</span>
                                    <span>•</span>
                                    <span>Bank-Grade SSL</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Deep-Dive Sustainability & Ethics Section */}
                    <div className="bg-gradient-to-br from-[#0F172A]/90 via-[#0D1527]/90 to-[#0A101D]/90 border border-white/10 rounded-3xl p-8 sm:p-12 mb-20 backdrop-blur-2xl">
                        <div className="max-w-3xl mb-10">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Our Charter</span>
                            <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
                                Why We Need an Independent, Sustainable Business Suite
                            </h2>
                            <p className="text-gray-300 text-sm mt-3 leading-relaxed">
                                Legacy enterprise giants lock small businesses into exorbitant contracts while running energy-intensive, bloated software. BERAXIS was founded on the belief that modern software can be lightweight, planet-conscious, and accessible to everyone.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                    <Leaf size={20} />
                                </div>
                                <h3 className="text-base font-bold text-white">Green Code &amp; Hardware Life</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    We engineer BERAXIS with optimized algorithms and zero runtime bloat. It loads in milliseconds on older computers and laptops, preventing premature corporate hardware obsolescence and reducing electronic waste.
                                </p>
                            </div>

                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                    <Lock size={20} />
                                </div>
                                <h3 className="text-base font-bold text-white">Zero Data Brokering</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Unlike ad-funded software platforms, we never monetize or resell client databases. Your contribution ensures our platform remains 100% independent and aligned solely with our users&apos; long-term trust.
                                </p>
                            </div>

                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                    <Globe size={20} />
                                </div>
                                <h3 className="text-base font-bold text-white">Global Economic Inclusion</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    By keeping our core starter apps and essential ERP tools free or starting at $1/month, we help close the digital divide between venture-backed corporations and hardworking grassroots businesses.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Allocation of Funds Table */}
                    <div className="bg-[#0F172A]/80 border border-white/10 rounded-3xl p-6 sm:p-10 mb-20 backdrop-blur-xl">
                        <div className="text-center max-w-2xl mx-auto mb-8">
                            <h2 className="text-2xl font-bold text-white">100% Transparent Fund Allocation</h2>
                            <p className="text-xs text-gray-400 mt-1">Here is exactly how every community donation dollar is put to work</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
                                <div className="text-3xl font-black text-emerald-400">40%</div>
                                <div className="text-xs font-bold text-white mt-1">Green Cloud &amp; Datacenters</div>
                                <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
                                    Hydro &amp; renewable-powered edge servers, high-availability PostgreSQL clusters, and zero-downtime replication.
                                </p>
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
                                <div className="text-3xl font-black text-purple-400">30%</div>
                                <div className="text-xs font-bold text-white mt-1">Startup &amp; Student Subsidies</div>
                                <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
                                    Absorbing compute and database storage expenses for non-profits, students, and early-stage bootstrapped builders.
                                </p>
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
                                <div className="text-3xl font-black text-cyan-400">20%</div>
                                <div className="text-xs font-bold text-white mt-1">R&amp;D &amp; Verified Data Engine</div>
                                <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
                                    Maintaining verified B2B extraction crawlers, spam prevention filters, and AI copilot productivity workflows.
                                </p>
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
                                <div className="text-3xl font-black text-teal-400">10%</div>
                                <div className="text-xs font-bold text-white mt-1">Direct Environmental Actions</div>
                                <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
                                    Planting certified native trees and supporting verified wildlife and reforestation charities globally.
                                </p>
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
                                <h3 className="font-bold text-white text-sm mb-1">Is $5 USD the minimum donation amount?</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Yes. Due to international banking minimums, interchange fees, and processing overhead, $5 USD is the minimum single donation. You can donate $5 or any higher amount you choose.
                                </p>
                            </div>

                            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4">
                                <h3 className="font-bold text-white text-sm mb-1">How does BERAXIS protect the environment?</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Through two primary pillars: First, we run on 100% renewable-powered data centers and optimize our code to consume minimal CPU cycles. Second, by moving companies from physical paper documents, printed bills, and file cabinets to our cloud ERP, we eliminate metric tons of paper waste and tree harvesting every year. Furthermore, we sponsor verified native tree-planting initiatives.
                                </p>
                            </div>

                            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4">
                                <h3 className="font-bold text-white text-sm mb-1">What payment methods are supported?</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Through our Merchant of Record Creem, we accept Visa, Mastercard, American Express, Apple Pay, Google Pay, and international payment methods across 135+ currencies.
                                </p>
                            </div>

                            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4">
                                <h3 className="font-bold text-white text-sm mb-1">Will I receive an official receipt for my donation?</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Yes! The moment your transaction completes, an official itemized PDF receipt with a unique transaction reference and tax identification will be sent directly to your email.
                                </p>
                            </div>

                            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4">
                                <h3 className="font-bold text-white text-sm mb-1">Can organizations or corporate sponsors make larger contributions?</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Yes. Organizations looking to sponsor specific eco-initiatives, open modules, or academic labs can reach our founding team at <a href="mailto:support@beraxis.online" className="text-emerald-400 hover:underline">support@beraxis.online</a>.
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
