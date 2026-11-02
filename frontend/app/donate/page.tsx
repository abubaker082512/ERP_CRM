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
    Copy,
    Check,
    Coffee,
    Award,
    ExternalLink,
    Lock,
    Building2,
    Code2
} from "lucide-react";
import { CREEM_PRODUCTS } from "@/lib/creemConfig";

export default function DonatePage() {
    const [selectedAmount, setSelectedAmount] = useState<number>(25);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [copiedBadge, setCopiedBadge] = useState<string | null>(null);
    const [activeBadgeTab, setActiveBadgeTab] = useState<"green" | "paperless">("green");

    const DONATE_URL = CREEM_PRODUCTS.donate.url; // https://www.creem.io/payment/prod_3Q2uUJ5aBPlOG6YQLS2HjJ

    const PRESET_AMOUNTS = [
        { 
            amount: 3, 
            label: "Coffee & AI Compute", 
            badge: "Micro-Karma",
            desc: "Powers 5,000 AI voice prompt computations and supports independent bootstrapped development." 
        },
        { 
            amount: 10, 
            label: "Paperless Advocate", 
            desc: "Funds green cloud hosting for 25 small businesses shifting from paper to digital ERP." 
        },
        { 
            amount: 25, 
            label: "Community Champion", 
            popular: true, 
            desc: "Directly funds the planting of 5 native trees + permanent logo & website link on our Supporters Wall." 
        },
        { 
            amount: 50, 
            label: "Eco-Cloud Guardian", 
            desc: "Powers low-emission compute clusters + featured business tile on our Open Supporters Wall." 
        },
        { 
            amount: 100, 
            label: "Academic & Tech Patron", 
            desc: "Sponsors free business simulation licenses and AI credits for 20 student teams + verified sponsor badge." 
        },
        { 
            amount: 250, 
            label: "Founding Eco-Sponsor", 
            badge: "VIP Dofollow Link",
            desc: "Permanent VIP placement on our Open Sustainability Wall with your company logo, founder quote, and dofollow backlink." 
        }
    ];

    const currentDonationValue = customAmount ? parseFloat(customAmount) || 3 : selectedAmount;

    const copyBadgeCode = (type: "green" | "paperless") => {
        const svgName = type === "green" ? "green-cloud-verified.svg" : "paperless-pioneer.svg";
        const altText = type === "green" ? "100% Green Cloud & Paperless Verified by Beraxis" : "Zero-Waste Digital ERP Verified by Beraxis";
        const code = `<a href="https://www.beraxis.online/donate" target="_blank" rel="noopener">\n  <img src="https://www.beraxis.online/badges/${svgName}" alt="${altText}" width="220" height="52" />\n</a>`;
        navigator.clipboard.writeText(code);
        setCopiedBadge(type);
        setTimeout(() => setCopiedBadge(null), 2500);
    };

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
                                        Starting from $3 USD. Support green cloud infrastructure or claim a permanent sponsor backlink.
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
                                    <p className="text-[11px] text-gray-400">Minimum $3.00 USD. You can donate any amount.</p>
                                </div>
                                <div className="relative w-36">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        min="3"
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
                                        <strong className="text-white">Minimum Contribution:</strong> $3.00 USD (Any amount accepted)
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
                                    <span>Donate ${currentDonationValue >= 3 ? currentDonationValue : 3} USD to BERAXIS</span>
                                    <ArrowRight size={16} />
                                </a>

                                <p className="text-[11px] text-center text-gray-400">
                                    Clicking opens the secure 1-click Creem checkout overlay. You can adjust your donation amount on the checkout screen.
                                </p>
                            </div>

                            {/* Sponsor Incentive Callout */}
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/30 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                                    <Award size={18} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-amber-200">Are you a Business, Agency, or Founder?</div>
                                    <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">
                                        Contributions of <strong>$25 or more</strong> qualify for permanent inclusion on our <strong>Open Sustainability Wall</strong> below, featuring your company logo, founder quote, and a high-authority dofollow website backlink.
                                    </p>
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

                    {/* ── NEW: Open Sustainability Wall & Founding Benefactors ── */}
                    <div className="bg-gradient-to-br from-[#0F172A]/95 via-[#0A1120]/95 to-[#050B14]/95 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 mb-20 shadow-2xl backdrop-blur-2xl">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                                    <Award size={13} className="text-amber-400" />
                                    <span>Public Wall of Honor</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-white">
                                    Our Founding Benefactors &amp; Eco-Sponsors
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
                                    Every organization or individual contributing $25+ receives permanent placement and a verified website link on this public wall.
                                </p>
                            </div>

                            <a
                                href="mailto:sponsors@beraxis.online?subject=Sponsor%20Details%20Submission&body=Hi%20Beraxis%20Team%2C%0A%0AI%20contributed%20to%20the%20Environmental%20Fund!%20Here%20are%20my%20details%20for%20the%20Wall%20of%20Honor%3A%0A%0AOrganization%20or%20Name%3A%20%0AWebsite%20URL%3A%20%0AContribution%20Amount%3A%20%24%0ATransaction%20Receipt%20Number%3A%20%0ALogo%20Attachment%20or%20Link%3A%20"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-emerald-300 transition-colors"
                            >
                                <ExternalLink size={14} />
                                <span>Submit Sponsor Details</span>
                            </a>
                        </div>

                        {/* Sponsor Tier Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            
                            {/* Founding Eco-Sponsor Spot 1 */}
                            <div className="bg-[#0A1120]/90 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group">
                                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500/20 to-transparent p-6 pointer-events-none" />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                                            Founding Partner
                                        </span>
                                        <span className="text-xs font-mono font-bold text-emerald-400">Offsets 5 Tons CO2</span>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-500/40 flex items-center justify-center font-black text-sm text-emerald-300">
                                            BX
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Beraxis Open Ecosystem</div>
                                            <a href="https://www.beraxis.online" target="_blank" rel="noopener noreferrer" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1">
                                                <span>beraxis.online</span>
                                                <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-400 italic">
                                        &ldquo;Committed to funding 100% renewable cloud compute and free software licenses for 10,000 students worldwide.&rdquo;
                                    </p>
                                </div>
                                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">
                                    <span>Verified Founding Supporter</span>
                                    <span className="text-emerald-400 font-bold">Tier: $250+</span>
                                </div>
                            </div>

                            {/* Community Champion Spot 2 */}
                            <div className="bg-[#0A1120]/90 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                            Community Champion
                                        </span>
                                        <span className="text-xs font-mono font-bold text-teal-400">5 Trees Planted</span>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-xs text-purple-300">
                                            CT
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">CleanTech Ventures</div>
                                            <span className="text-[11px] text-gray-400">Green Cloud Digitalization Backer</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-400 italic">
                                        &ldquo;Proud to sponsor paperless ERP adoption for early-stage logistics and retail operators.&rdquo;
                                    </p>
                                </div>
                                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">
                                    <span>Verified Supporter</span>
                                    <span className="text-emerald-400 font-bold">Tier: $50+</span>
                                </div>
                            </div>

                            {/* Open Sponsor Spot (Claim Your Tile) */}
                            <div className="bg-white/[0.02] border-2 border-dashed border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 hover:border-emerald-500/60 transition-colors">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                                    <Building2 size={22} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Your Company Logo Here</div>
                                    <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
                                        Contribute $25 or more to secure permanent placement, your brand logo, and a verified dofollow website backlink.
                                    </p>
                                </div>
                                <a
                                    href={DONATE_URL}
                                    data-creem-checkout
                                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-md shadow-emerald-500/20"
                                >
                                    Claim This Sponsor Tile
                                </a>
                            </div>

                        </div>
                    </div>

                    {/* ── NEW: Embeddable 'Green Cloud Verified' Digital Badge ── */}
                    <div className="bg-[#0F172A]/90 border border-cyan-500/30 rounded-3xl p-8 sm:p-10 mb-20 shadow-2xl backdrop-blur-xl">
                        <div className="max-w-3xl mb-8">
                            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                                <Code2 size={14} />
                                <span>Free For All Donors &amp; Paperless Users</span>
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                                Embed the &ldquo;Green Cloud Verified&rdquo; Badge on Your Website
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
                                Show your customers, investors, and team that your business operates on 100% paperless cloud infrastructure and supports global reforestation. Copy the HTML snippet below to embed directly into your website footer or app.
                            </p>
                        </div>

                        {/* Badge Selector Tabs */}
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                type="button"
                                onClick={() => setActiveBadgeTab("green")}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeBadgeTab === "green"
                                        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                                        : "bg-white/5 hover:bg-white/10 text-gray-300"
                                }`}
                            >
                                🌿 100% Green Cloud Badge
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveBadgeTab("paperless")}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeBadgeTab === "paperless"
                                        ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                                        : "bg-white/5 hover:bg-white/10 text-gray-300"
                                }`}
                            >
                                📄 Zero-Waste Paperless Badge
                            </button>
                        </div>

                        {/* Badge Preview & Embed Snippet Box */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#070D18] border border-white/10 rounded-2xl p-6">
                            
                            {/* Visual Preview */}
                            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-[#030712] border border-white/5 rounded-xl">
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-4">Live Preview</span>
                                <img
                                    src={activeBadgeTab === "green" ? "/badges/green-cloud-verified.svg" : "/badges/paperless-pioneer.svg"}
                                    alt="Beraxis Eco Badge Preview"
                                    width={220}
                                    height={52}
                                    className="drop-shadow-lg"
                                />
                                <span className="text-[10px] text-emerald-400 font-mono mt-3">220 × 52 SVG Vector</span>
                            </div>

                            {/* Embed Code & Copy Action */}
                            <div className="md:col-span-7 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-300">HTML Embed Snippet</span>
                                    <button
                                        type="button"
                                        onClick={() => copyBadgeCode(activeBadgeTab)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        {copiedBadge === activeBadgeTab ? (
                                            <>
                                                <Check size={14} className="text-emerald-400" />
                                                <span>Copied to Clipboard!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} />
                                                <span>Copy Embed Code</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-gray-300 overflow-x-auto leading-relaxed">
{`<a href="https://www.beraxis.online/donate" target="_blank" rel="noopener">
  <img src="https://www.beraxis.online/badges/${activeBadgeTab === 'green' ? 'green-cloud-verified.svg' : 'paperless-pioneer.svg'}" alt="${activeBadgeTab === 'green' ? '100% Green Cloud & Paperless Verified by Beraxis' : 'Zero-Waste Digital ERP Verified by Beraxis'}" width="220" height="52" />
</a>`}
                                </pre>

                                <p className="text-[10px] text-gray-400">
                                    Paste this snippet into your website footer, about page, or docs. It creates a verified trust mark and contributes to organic paperless awareness.
                                </p>
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
                                <h3 className="font-bold text-white text-sm mb-1">What is the minimum donation amount?</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    You can contribute starting at just $3.00 USD (which buys the team a coffee and powers 5,000 AI voice prompt computations). You can choose any preset tier or enter your own custom amount.
                                </p>
                            </div>

                            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4">
                                <h3 className="font-bold text-white text-sm mb-1">How do I get my company logo and website on the Supporters Wall?</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    Any contribution of $25 or more qualifies for permanent placement on our Open Sustainability Wall with your brand logo, name, and a verified dofollow website backlink. After completing your checkout, simply email <a href="mailto:sponsors@beraxis.online" className="text-emerald-400 hover:underline">sponsors@beraxis.online</a> with your receipt and logo.
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
