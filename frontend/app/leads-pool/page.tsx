"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
    Globe,
    Search,
    Users,
    Database,
    Sparkles,
    CheckCircle2,
    ArrowRight,
    ShieldCheck,
    Zap,
    TrendingUp,
    DollarSign,
    Filter,
    Building2,
    Mail,
    Phone,
    Star,
    Layers,
    Lock,
    Eye,
    ChevronRight,
    Bot,
    Send,
    Flame,
    Check,
    HelpCircle
} from "lucide-react";

// Curated live demo prospects for the interactive sandbox
const DEMO_LEADS = [
    {
        id: "dl-1",
        name: "Marcus Vance",
        title: "Chief Technology Officer",
        seniority: "C-Level",
        company: "Aether Dynamics Inc.",
        industry: "SaaS / Cloud Infrastructure",
        location: "San Francisco, USA",
        country: "USA",
        headcount: "250-500",
        intentScore: 96,
        intentLabel: "High Buying Intent",
        verifiedEmail: "m.vance@aetherdynamics.io",
        phone: "+1 (415) 892-****"
    },
    {
        id: "dl-2",
        name: "Elena Rostova",
        title: "VP of Global Procurement",
        seniority: "VP",
        company: "Vanguard Logistics Global",
        industry: "Supply Chain & Logistics",
        location: "Hamburg, Germany",
        country: "Germany",
        headcount: "1,000-5,000",
        intentScore: 92,
        intentLabel: "Contract Renewal Stage",
        verifiedEmail: "elena.r@vanguard-logistics.de",
        phone: "+49 (40) 781-****"
    },
    {
        id: "dl-3",
        name: "Tariq Al-Mansoor",
        title: "Founder & Chief Executive",
        seniority: "Founder",
        company: "Crestview FinTech Solutions",
        industry: "FinTech & Payments",
        location: "Dubai, United Arab Emirates",
        country: "UAE",
        headcount: "50-100",
        intentScore: 94,
        intentLabel: "Active Expansion",
        verifiedEmail: "tariq@crestviewpay.ae",
        phone: "+971 (4) 390-****"
    },
    {
        id: "dl-4",
        name: "Sarah Jenkins",
        title: "Head of Revenue Operations",
        seniority: "Director",
        company: "OmniScale Commerce",
        industry: "E-Commerce & Retail",
        location: "Austin, TX, USA",
        country: "USA",
        headcount: "100-250",
        intentScore: 89,
        intentLabel: "Tool Replacement Signal",
        verifiedEmail: "s.jenkins@omniscale.com",
        phone: "+1 (512) 402-****"
    },
    {
        id: "dl-5",
        name: "Kenji Takahashi",
        title: "Director of Enterprise Systems",
        seniority: "Director",
        company: "Nippon Robotics Group",
        industry: "Manufacturing & AI",
        location: "Tokyo, Japan",
        country: "Japan",
        headcount: "5,000+",
        intentScore: 91,
        intentLabel: "ERP Modernization RFQ",
        verifiedEmail: "k.takahashi@nippon-robotics.jp",
        phone: "+81 (3) 5401-****"
    },
    {
        id: "dl-6",
        name: "Camille Dubois",
        title: "Chief Commercial Officer",
        seniority: "C-Level",
        company: "Lumina Health Systems",
        industry: "Healthcare & MedTech",
        location: "Paris, France",
        country: "France",
        headcount: "500-1,000",
        intentScore: 87,
        intentLabel: "Budget Approved",
        verifiedEmail: "c.dubois@luminahealth.fr",
        phone: "+33 (1) 42-68-****"
    },
    {
        id: "dl-7",
        name: "David Sterling",
        title: "VP of Engineering & Architecture",
        seniority: "VP",
        company: "Quantum Logic Systems",
        industry: "Cybersecurity",
        location: "London, United Kingdom",
        country: "UK",
        headcount: "250-500",
        intentScore: 95,
        intentLabel: "High Buying Intent",
        verifiedEmail: "david.s@quantumlogic.co.uk",
        phone: "+44 (20) 7946-****"
    },
    {
        id: "dl-8",
        name: "Priya Sundaram",
        title: "VP of People & Operations",
        seniority: "VP",
        company: "Apex HyperScale Networks",
        industry: "Telecommunications",
        location: "Bengaluru, India",
        country: "India",
        headcount: "1,000-5,000",
        intentScore: 88,
        intentLabel: "Rapid Hiring Spree",
        verifiedEmail: "p.sundaram@apexscale.in",
        phone: "+91 (80) 6712-****"
    }
];

export default function LeadsPoolPublicPage() {
    // Interactive sandbox states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState("All");
    const [selectedCountry, setSelectedCountry] = useState("All");
    const [selectedSeniority, setSelectedSeniority] = useState("All");
    
    // Interactive ROI Calculator State
    const [monthlyLeadsNeeded, setMonthlyLeadsNeeded] = useState(1500);

    // Selected lead for modal preview
    const [previewLead, setPreviewLead] = useState<typeof DEMO_LEADS[0] | null>(null);

    // Filtered demo leads
    const filteredLeads = useMemo(() => {
        return DEMO_LEADS.filter((item) => {
            const matchesSearch =
                !searchTerm ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesIndustry = selectedIndustry === "All" || item.industry.includes(selectedIndustry);
            const matchesCountry = selectedCountry === "All" || item.country === selectedCountry;
            const matchesSeniority = selectedSeniority === "All" || item.seniority === selectedSeniority;

            return matchesSearch && matchesIndustry && matchesCountry && matchesSeniority;
        });
    }, [searchTerm, selectedIndustry, selectedCountry, selectedSeniority]);

    // Dynamic cost calculator
    const traditionalStackCost = useMemo(() => {
        // Apollo Pro ($99/mo) + ZoomInfo ($1,200/mo min) + SalesNav ($99/mo) + Sync tool ($150/mo) = ~$1,500/mo base + credits
        const baseMonthly = 1250;
        const perLeadRate = 0.65;
        const annual = (baseMonthly + monthlyLeadsNeeded * perLeadRate) * 12;
        return Math.round(annual);
    }, [monthlyLeadsNeeded]);

    return (
        <main className="min-h-screen bg-[#020205] text-white overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative pt-36 pb-20 overflow-hidden">
                {/* Radial Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-600/15 via-purple-600/10 to-pink-600/10 rounded-full blur-[140px] pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-8 backdrop-blur-md shadow-lg shadow-cyan-950/40">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-cyan-200 tracking-wide flex items-center gap-2">
                            <span className="bg-cyan-500/25 text-cyan-300 text-[11px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                                25M+ Verified B2B Contacts
                            </span>
                            Live Intelligence Built Directly Into Your ERP
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.08]">
                        Stop Buying Stale Lists.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500">
                            Mine Verified B2B Leads
                        </span><br />
                        Directly in Your CRM.
                    </h1>

                    {/* Subheadline */}
                    <p className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 font-light leading-relaxed">
                        Say goodbye to overpriced third-party databases, broken scraper plugins, and CSV import errors. 
                        Beraxis gives you instant access to over <strong className="text-white font-semibold">25,000,000+ verified decision-makers</strong> worldwide with real-time email verification and 1-click CRM ingestion.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/signup"
                            className="galaxy-btn-primary !px-9 !py-4 text-lg w-full sm:w-auto flex items-center justify-center gap-3 group shadow-xl shadow-cyan-500/20"
                        >
                            <span>Claim Free Workspace & Access Leads</span>
                            <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={22} />
                        </Link>

                        <a
                            href="#interactive-demo"
                            className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold transition-all flex items-center justify-center gap-2.5 w-full sm:w-auto backdrop-blur-sm hover:border-cyan-400/40"
                        >
                            <Sparkles size={20} className="text-cyan-400" /> Test Interactive Demo
                        </a>
                    </div>

                    {/* Highlights Ribbon */}
                    <div className="mt-16 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">25.4M+</p>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Verified B2B Executives</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">180+</p>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Global Countries Covered</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">98.6%</p>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Email Deliverability Rate</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">&lt; 1 Sec</p>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">1-Click Native CRM Sync</p>
                        </div>
                    </div>

                </div>
            </section>

            {/* INTERACTIVE LIVE SANDBOX DEMONSTRATION */}
            <section id="interactive-demo" className="py-24 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full inline-block mb-4">
                        Live Interactive Sandbox
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
                        Experience the Lead Pool <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">In Action</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                        Test out our search filters, explore sample verified prospects, and see how easy it is to identify decision-makers before even creating your free account.
                    </p>
                </div>

                {/* Sandbox Card */}
                <div className="bg-[#090D1A]/90 border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    {/* Top control bar: search and filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {/* Search input */}
                        <div className="relative md:col-span-1">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search role, company, city..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#121829] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                        </div>

                        {/* Industry filter */}
                        <div>
                            <select
                                value={selectedIndustry}
                                onChange={(e) => setSelectedIndustry(e.target.value)}
                                className="w-full bg-[#121829] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                            >
                                <option value="All">All Industries</option>
                                <option value="SaaS">SaaS / Cloud Infrastructure</option>
                                <option value="Logistics">Supply Chain & Logistics</option>
                                <option value="FinTech">FinTech & Payments</option>
                                <option value="E-Commerce">E-Commerce & Retail</option>
                                <option value="Manufacturing">Manufacturing & Robotics</option>
                                <option value="Healthcare">Healthcare & MedTech</option>
                                <option value="Cybersecurity">Cybersecurity</option>
                            </select>
                        </div>

                        {/* Country filter */}
                        <div>
                            <select
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className="w-full bg-[#121829] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                            >
                                <option value="All">All Countries</option>
                                <option value="USA">United States</option>
                                <option value="Germany">Germany</option>
                                <option value="UAE">United Arab Emirates</option>
                                <option value="UK">United Kingdom</option>
                                <option value="Japan">Japan</option>
                                <option value="France">France</option>
                                <option value="India">India</option>
                            </select>
                        </div>

                        {/* Seniority filter */}
                        <div>
                            <select
                                value={selectedSeniority}
                                onChange={(e) => setSelectedSeniority(e.target.value)}
                                className="w-full bg-[#121829] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                            >
                                <option value="All">All Seniorities</option>
                                <option value="C-Level">C-Level (CEO, CTO, CCO)</option>
                                <option value="Founder">Founders & Owners</option>
                                <option value="VP">VPs & Senior Execs</option>
                                <option value="Director">Directors & Heads</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Counter & Demo Notice */}
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{filteredLeads.length} Sample Profiles</span>
                            <span>matching live demonstration filters</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 text-cyan-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            Live Interactive Sandbox Mode
                        </div>
                    </div>

                    {/* Interactive Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 bg-white/[0.02]">
                                    <th className="py-3 px-4">Executive Name & Role</th>
                                    <th className="py-3 px-4">Company & Industry</th>
                                    <th className="py-3 px-4">Location</th>
                                    <th className="py-3 px-4">Intent Score</th>
                                    <th className="py-3 px-4">Verified Channels</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors">
                                        {/* Name & Role */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md">
                                                    {lead.name.split(" ").map(n => n[0]).join("")}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{lead.name}</p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                                        <span>{lead.title}</span>
                                                        <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                                                            {lead.seniority}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Company & Industry */}
                                        <td className="py-4 px-4">
                                            <p className="font-semibold text-gray-200">{lead.company}</p>
                                            <p className="text-xs text-gray-500">{lead.industry} • {lead.headcount} team</p>
                                        </td>

                                        {/* Location */}
                                        <td className="py-4 px-4 text-gray-300 text-xs">
                                            {lead.location}
                                        </td>

                                        {/* Intent Score */}
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">
                                                <Flame size={12} className="text-orange-400" />
                                                <span>{lead.intentScore}%</span>
                                                <span className="text-[10px] text-gray-400 font-normal hidden lg:inline">({lead.intentLabel})</span>
                                            </span>
                                        </td>

                                        {/* Verified Channels */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1 text-[11px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20 font-medium">
                                                    <Mail size={11} /> Verified
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[11px] bg-white/5 text-gray-300 px-2 py-0.5 rounded border border-white/10 font-medium">
                                                    <Phone size={11} /> Direct Dial
                                                </span>
                                            </div>
                                        </td>

                                        {/* Action */}
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() => setPreviewLead(lead)}
                                                className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer hover:border-cyan-400"
                                            >
                                                <Eye size={13} />
                                                <span>Preview & Sync</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom CTA bar inside table */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <ShieldCheck size={16} className="text-emerald-400" />
                            <span>100% GDPR, CCPA & CAN-SPAM Compliant Data Architecture</span>
                        </div>
                        <Link
                            href="/signup"
                            className="galaxy-btn-primary !px-6 !py-2.5 text-xs font-bold flex items-center gap-2"
                        >
                            <span>Access Full 25,000,000+ Database Now</span>
                            <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* PREVIEW & SYNC MODAL */}
            {previewLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#0B1120] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
                        <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
                                    Verified Decision Maker Profile
                                </span>
                                <h3 className="text-xl font-bold text-white mt-2">{previewLead.name}</h3>
                                <p className="text-xs text-gray-400">{previewLead.title} @ <strong className="text-white">{previewLead.company}</strong></p>
                            </div>
                            <button
                                onClick={() => setPreviewLead(null)}
                                className="text-gray-400 hover:text-white text-lg p-1 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Prospect Details */}
                        <div className="space-y-4 mb-6 text-sm">
                            <div className="bg-[#141C30] rounded-xl p-3 border border-white/5 flex items-center justify-between">
                                <span className="text-xs text-gray-400 flex items-center gap-2"><Mail size={14} className="text-cyan-400" /> Work Email</span>
                                <span className="font-mono text-cyan-200 text-xs font-semibold">{previewLead.verifiedEmail}</span>
                            </div>

                            <div className="bg-[#141C30] rounded-xl p-3 border border-white/5 flex items-center justify-between">
                                <span className="text-xs text-gray-400 flex items-center gap-2"><Phone size={14} className="text-emerald-400" /> Direct Dial</span>
                                <span className="font-mono text-emerald-200 text-xs font-semibold">{previewLead.phone}</span>
                            </div>

                            <div className="bg-[#141C30] rounded-xl p-3 border border-white/5 flex items-center justify-between">
                                <span className="text-xs text-gray-400 flex items-center gap-2"><Flame size={14} className="text-orange-400" /> Buyer Intent Signal</span>
                                <span className="text-xs font-bold text-emerald-400">{previewLead.intentScore}% ({previewLead.intentLabel})</span>
                            </div>

                            <div className="bg-[#141C30] rounded-xl p-3 border border-white/5 flex items-center justify-between">
                                <span className="text-xs text-gray-400 flex items-center gap-2"><Globe size={14} className="text-purple-400" /> Location</span>
                                <span className="text-xs font-medium text-white">{previewLead.location}</span>
                            </div>
                        </div>

                        {/* Value proposition message */}
                        <div className="bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4 mb-6 text-center">
                            <p className="text-xs font-semibold text-white mb-1">
                                Ready to import this lead and 25M+ others straight to your CRM?
                            </p>
                            <p className="text-[11px] text-gray-400">
                                In your Beraxis workspace, clicking "Add to CRM" creates instant opportunity records with automated win probability and smart cadences.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/signup"
                                className="galaxy-btn-primary flex-1 !py-3 text-sm font-bold text-center flex items-center justify-center gap-2"
                            >
                                <span>Start Free Trial & Sync Leads</span>
                                <ArrowRight size={16} />
                            </Link>
                            <button
                                onClick={() => setPreviewLead(null)}
                                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ROI & COST SAVINGS CALCULATOR */}
            <section className="py-24 bg-[#050811] border-y border-white/10 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left column: Explanation & Slider */}
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full inline-block mb-4">
                                Cost & Efficiency Calculator
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight">
                                How Much Are You Wasting On <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Fragmented Lead Subscriptions?</span>
                            </h2>
                            <p className="text-gray-400 text-base mb-8 leading-relaxed">
                                Traditional B2B companies pay tens of thousands of dollars each year for Apollo, ZoomInfo, LinkedIn Sales Navigator, and Zapier bridges. With Beraxis, your leads pool is unified directly into your CRM.
                            </p>

                            {/* Slider Box */}
                            <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-sm font-bold text-gray-200">
                                        Estimated B2B Leads Needed Per Month:
                                    </label>
                                    <span className="text-2xl font-black text-cyan-400 font-mono">
                                        {monthlyLeadsNeeded.toLocaleString()}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="200"
                                    max="10000"
                                    step="100"
                                    value={monthlyLeadsNeeded}
                                    onChange={(e) => setMonthlyLeadsNeeded(Number(e.target.value))}
                                    className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                                    <span>200 leads/mo</span>
                                    <span>5,000 leads/mo</span>
                                    <span>10,000 leads/mo</span>
                                </div>
                            </div>
                        </div>

                        {/* Right column: Comparison Cards */}
                        <div className="space-y-6">
                            {/* Competitor Cost Card */}
                            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs uppercase font-bold text-red-400 tracking-wider">Traditional Fragmented Stack</p>
                                        <p className="text-xs text-gray-400 mt-0.5">ZoomInfo / Apollo + Sales Nav + Connectors</p>
                                    </div>
                                    <span className="text-2xl font-black text-red-400 line-through">
                                        ${traditionalStackCost.toLocaleString()} / yr
                                    </span>
                                </div>
                                <ul className="space-y-2 text-xs text-gray-400">
                                    <li className="flex items-center gap-2">✕ Expensive annual upfront contracts with rigid credit limits</li>
                                    <li className="flex items-center gap-2">✕ Constant manual CSV exports and data import mismatches</li>
                                    <li className="flex items-center gap-2">✕ Per-seat surcharges for every sales representative</li>
                                </ul>
                            </div>

                            {/* Beraxis Value Card */}
                            <div className="bg-gradient-to-br from-cyan-950/60 to-purple-950/60 border border-cyan-500/40 rounded-2xl p-6 relative shadow-xl shadow-cyan-900/20">
                                <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                                    Included In Platform
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs uppercase font-bold text-cyan-300 tracking-wider">Beraxis Unified Leads Pool</p>
                                        <p className="text-xs text-gray-300 mt-0.5">Built natively into your ERP & CRM Cockpit</p>
                                    </div>
                                    <span className="text-3xl font-black text-emerald-400">
                                        $0 <span className="text-xs font-normal text-gray-300">Extra Fees</span>
                                    </span>
                                </div>
                                <ul className="space-y-2 text-xs text-cyan-100 mb-6">
                                    <li className="flex items-center gap-2 font-medium">✓ Unlimited search across 25M+ pre-verified B2B records</li>
                                    <li className="flex items-center gap-2 font-medium">✓ Instant 1-click sync directly into your CRM Kanban pipeline</li>
                                    <li className="flex items-center gap-2 font-medium">✓ Real-time AI web scraper & email verifier included</li>
                                </ul>
                                <div className="pt-4 border-t border-cyan-500/20 flex items-center justify-between">
                                    <span className="text-xs font-bold text-white">Estimated Annual Net Savings:</span>
                                    <span className="text-xl font-black text-emerald-400 font-mono">
                                        ${traditionalStackCost.toLocaleString()} / year
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3-STEP AUTONOMOUS WORKFLOW */}
            <section className="py-24 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full inline-block mb-4">
                        Autonomous Ingestion Flow
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
                        How Beraxis Leads Pool Works in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">3 Seconds</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                        Engineered so your business development team can focus on closing deals rather than formatting spreadsheets.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <div className="bg-[#0B1120] border border-white/10 rounded-3xl p-8 relative hover:border-cyan-500/40 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-black text-cyan-400 text-lg mb-6">
                            01
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Query or Live Scrape</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Search by job title, exact industry, headcount, or country. Or deploy our Live Scraper to extract real-time contacts from live corporate registries.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-[#0B1120] border border-white/10 rounded-3xl p-8 relative hover:border-purple-500/40 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-black text-purple-400 text-lg mb-6">
                            02
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">AI Verification & Intent Scoring</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Every contact is evaluated through multi-step SMTP checks, syntax verification, and expansion signals to predict buyer readiness.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-[#0B1120] border border-white/10 rounded-3xl p-8 relative hover:border-pink-500/40 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center font-black text-pink-400 text-lg mb-6">
                            03
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">1-Click Pipeline Ingestion</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Click "Add to CRM" or speak with Voice Pilot. The prospect instantly creates an opportunity card in your Kanban pipeline ready for quotation and outreach.
                        </p>
                    </div>
                </div>
            </section>

            {/* VOICE PILOT HIGHLIGHT */}
            <section className="py-20 bg-gradient-to-r from-purple-950/40 via-[#070B16] to-cyan-950/40 border-y border-white/10 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-2xl">
                            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 rounded-full inline-flex items-center gap-2 mb-4">
                                <Bot size={14} /> Native Voice Pilot Capability
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                                "Hey Beraxis, Add 25 SaaS CEOs in Texas to My Pipeline."
                            </h2>
                            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                You don't even have to click. With Beraxis Duplex Voice Pilot, you can command your ERP through natural speech while on your commute or during strategy meetings.
                            </p>
                        </div>
                        <div className="shrink-0">
                            <Link
                                href="/signup"
                                className="galaxy-btn-primary !px-8 !py-4 text-base font-bold flex items-center gap-2 shadow-xl shadow-purple-500/25"
                            >
                                <span>Try Voice Pilot & Leads Pool</span>
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FREQUENTLY ASKED QUESTIONS */}
            <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Everything you need to know about our global lead directory and CRM integration.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#090D1A] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-base font-bold text-white mb-2">Are the leads really included without third-party fees?</h3>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                            Yes! Unlike traditional software providers who charge $500–$2,000/month for external contact integrations or API connectors, Beraxis provides direct access to the Global Leads Directory right inside your workspace.
                        </p>
                    </div>

                    <div className="bg-[#090D1A] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-base font-bold text-white mb-2">How fresh and accurate is the contact data?</h3>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                            Our database is continuously updated through automated crawlers, corporate registry filings, and real-time SMTP handshake verification. Emails have an average deliverability rate of 98.6%.
                        </p>
                    </div>

                    <div className="bg-[#090D1A] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-base font-bold text-white mb-2">Can I export leads to CSV or sync with other tools?</h3>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                            Yes. You can export filtered prospect lists directly to CSV or JSON with 1 click, or let Beraxis automatically sync them into your Sales, Quotations, and WhatsApp sequences.
                        </p>
                    </div>

                    <div className="bg-[#090D1A] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-base font-bold text-white mb-2">Is the data compliant with international privacy laws?</h3>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                            All data consists strictly of publicly available B2B professional business records in full compliance with GDPR legitimate interest provisions, CCPA, and CAN-SPAM regulations.
                        </p>
                    </div>
                </div>
            </section>

            {/* BOTTOM CALL TO ACTION */}
            <section className="py-20 relative z-10 text-center bg-[#070B16] border-t border-white/10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                        Fuel Your Sales Engine Today.
                    </h2>
                    <p className="text-gray-400 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
                        Get started with your free Beraxis workspace in 60 seconds. No credit card required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="galaxy-btn-primary !px-10 !py-4 text-base font-bold flex items-center justify-center gap-2"
                        >
                            <span>Launch Your Free Workspace</span>
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            href="/pricing"
                            className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            <span>View All Plans</span>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
