"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowRight,
    PlayCircle,
    PauseCircle,
    ShieldCheck,
    Zap,
    Globe,
    Sparkles,
    CheckCircle,
    Mic,
    Cpu,
    Flame,
    Volume2,
    VolumeX,
    Calculator,
    X,
    Search,
    Building2,
    Mail,
    Phone,
    Check
} from "lucide-react";
import { useExperiment, initSocialAttribution } from "@/lib/abTesting";

export default function Hero() {
    // A/B Testing Hooks with zero-SEO-penalty bot allocation
    const headlineExp = useExperiment("hero_headline_v1", "control");
    const ctaExp = useExperiment("hero_cta_v1", "control");
    const mediaExp = useExperiment("hero_media_v1", "control");

    // Initialize social ad attribution tracking (UTM parameters)
    useEffect(() => {
        initSocialAttribution();
    }, []);

    // Interactive Savings Calculator Modal State
    const [isCalcOpen, setIsCalcOpen] = useState(false);

    // AI Commercial Video Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    // Interactive Hero Headline Carousel State (Auto-rotates every 6s, pauses on hover)
    const [activeSlide, setActiveSlide] = useState(0);
    const [isCarouselPaused, setIsCarouselPaused] = useState(false);

    useEffect(() => {
        if (isCarouselPaused) return;
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % 3);
        }, 6000);
        return () => clearInterval(timer);
    }, [isCarouselPaused]);

    // Interactive Leads Search State (Variant C of Media Exp)
    const [leadSearchQuery, setLeadSearchQuery] = useState("Padel Clubs");
    const [importedLeads, setImportedLeads] = useState<Record<string, boolean>>({});

    // Sample mock leads data for the interactive in-hero widget
    const mockLeadsData: Record<string, Array<{ name: string; title: string; company: string; city: string; email: string; phone: string }>> = {
        "Padel Clubs": [
            { name: "Carlos Mendoza", title: "Managing Director", company: "Smash Padel Arena", city: "Miami, FL", email: "carlos@smashpadel.com", phone: "+1 (305) 555-0192" },
            { name: "Elena Rostova", title: "Club Owner", company: "Prime Padel Club", city: "Madrid, ES", email: "elena@primepadel.es", phone: "+34 91 555 4321" },
            { name: "Marcus Vance", title: "Operations Head", company: "Urban Padel Hub", city: "Austin, TX", email: "marcus@urbanpadel.io", phone: "+1 (512) 555-7832" },
        ],
        "Dental Clinics": [
            { name: "Dr. Sarah Jenkins", title: "Principal Dentist", company: "Apex Dental Studio", city: "Chicago, IL", email: "dr.jenkins@apexdental.com", phone: "+1 (312) 555-0143" },
            { name: "Dr. Omar Al-Fayed", title: "Clinical Director", company: "Pearl Smiles Care", city: "Dubai, UAE", email: "omar@pearlsmiles.ae", phone: "+971 4 555 8921" },
            { name: "Dr. Chloe Martin", title: "Orthodontist Owner", company: "Lumina Dental Group", city: "Seattle, WA", email: "chloe@luminadental.com", phone: "+1 (206) 555-6671" },
        ],
        "Bakeries": [
            { name: "Julien Dupont", title: "Head Baker & Owner", company: "Artisan Croissant Co", city: "New York, NY", email: "julien@artisancroissant.com", phone: "+1 (212) 555-4890" },
            { name: "Sophie Meier", title: "General Manager", company: "Golden Crust Patisserie", city: "Zurich, CH", email: "sophie@goldencrust.ch", phone: "+41 44 555 1290" },
            { name: "Marco Rossi", title: "Founder", company: "Firenze Woodfired Bakery", city: "Boston, MA", email: "marco@firenzebakes.com", phone: "+1 (617) 555-9012" },
        ],
        "SaaS Founders": [
            { name: "Alex Chen", title: "CEO & Co-Founder", company: "CloudScale Logic", city: "San Francisco, CA", email: "alex@cloudscale.ai", phone: "+1 (415) 555-3211" },
            { name: "Liam O'Connor", title: "Founder", company: "PipelineFlow Systems", city: "Dublin, IE", email: "liam@pipelineflow.io", phone: "+353 1 555 7761" },
            { name: "Priya Sharma", title: "Managing Director", company: "HyperData Automation", city: "Bengaluru, IN", email: "priya@hyperdata.in", phone: "+91 80 555 4390" },
        ]
    };

    const currentLeads = mockLeadsData[leadSearchQuery] || mockLeadsData["Padel Clubs"];

    const handleImportLead = (leadEmail: string) => {
        setImportedLeads(prev => ({ ...prev, [leadEmail]: true }));
        mediaExp.trackConversion("lead_preview_clicked", { lead_email: leadEmail });
    };

    const heroSlides = [
        {
            id: "erp_crm_suite",
            tabLabel: "AI ERP & CRM Suite",
            headline: (
                <>
                    The All-in-One <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400">AI ERP &amp; CRM</span><br />
                    With 25M+ B2B Leads Built-In
                </>
            ),
            subheadline: (
                <>
                    Unify <strong className="text-white font-medium">28 ERP &amp; CRM modules</strong> — Accounting, Inventory, POS, HRMS, Voice AI, and <strong className="text-cyan-300 font-medium">25M+ verified B2B leads</strong> — in one cloud command deck for <strong className="text-amber-300 font-semibold">$1/month</strong>.
                </>
            )
        },
        {
            id: "odoo_competitor",
            tabLabel: "Odoo & HubSpot Alternative",
            headline: (
                <>
                    Replace 5 Disconnected Tools<br />
                    With One Unified <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-400 to-purple-400">AI ERP &amp; CRM</span>
                </>
            ),
            subheadline: (
                <>
                    The modern <strong className="text-white font-medium">Cloud ERP &amp; CRM</strong> built to outpace Odoo and HubSpot. Eliminate $400/mo in fragmented SaaS bills and run your entire company for <strong className="text-amber-300 font-semibold">$1/month</strong>.
                </>
            )
        },
        {
            id: "leads_erp_crm",
            tabLabel: "25M+ B2B Leads + CRM",
            headline: (
                <>
                    Acquire Customers &amp; Run Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-400">ERP</span><br />
                    With AI CRM &amp; 25M+ B2B Leads
                </>
            ),
            subheadline: (
                <>
                    Discover verified decision-makers, import them into your <strong className="text-white font-medium">AI CRM pipeline</strong> in one click, and automate <strong className="text-white font-medium">ERP quotes, inventory, POS, and accounting</strong>.
                </>
            )
        }
    ];

    const currentSlide = heroSlides[activeSlide] || heroSlides[0];

    return (
        <div className="relative min-h-[85vh] flex items-center justify-center pt-28 sm:pt-32 pb-14 overflow-hidden transform-gpu">
            {/* Lightweight Background Radial Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

            <div
                className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
                onMouseEnter={() => setIsCarouselPaused(true)}
                onMouseLeave={() => setIsCarouselPaused(false)}
            >
                {/* ── Single Clean Carousel Pill Switcher ── */}
                <div className="inline-flex flex-wrap items-center justify-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 mb-6 backdrop-blur-md">
                    {heroSlides.map((slide, idx) => (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() => setActiveSlide(idx)}
                            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeSlide === idx
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${activeSlide === idx ? "bg-white" : "bg-gray-600"}`} />
                            <span>{slide.tabLabel}</span>
                        </button>
                    ))}
                </div>

                {/* ── Balanced, Clean 2-Line Headline & Concise Subheadline ── */}
                <div key={currentSlide.id} className="animate-in fade-in duration-500">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 leading-[1.15]">
                        {currentSlide.headline}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
                        {currentSlide.subheadline}
                    </p>
                </div>

                {/* ── Streamlined 2-Button Call To Actions ── */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Link 
                        href="/pricing" 
                        onClick={() => ctaExp.trackConversion("pricing_click", { style: "clean_hero" })}
                        className="galaxy-btn-primary !px-6 !py-3 text-sm sm:text-base w-full sm:w-auto flex items-center justify-center gap-2 group shadow-lg shadow-purple-500/25 font-bold rounded-xl"
                    >
                        Claim $1/mo Early Bird <ArrowRight className="group-hover:translate-x-1 transition-transform" size={17} />
                    </Link>

                    <Link 
                        href="/signup" 
                        onClick={() => ctaExp.trackConversion("signup_click", { style: "clean_hero" })}
                        className="px-6 py-3 rounded-xl bg-white/[0.07] hover:bg-white/15 border border-white/15 text-white text-sm sm:text-base font-semibold transition-all flex items-center justify-center gap-2 w-full sm:w-auto backdrop-blur-sm"
                    >
                        Start Free ($0)
                    </Link>

                    <Link 
                        href="/leads-pool" 
                        onClick={() => ctaExp.trackConversion("leads_click", { style: "clean_hero" })}
                        className="px-5 py-3 rounded-xl text-cyan-300 hover:text-cyan-200 text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5"
                    >
                        <Globe size={15} className="text-cyan-400" /> Explore 25M+ Leads
                    </Link>
                </div>

                {/* Subtle Single-Line Reassurance */}
                <p className="text-[11px] sm:text-xs text-gray-500 mt-4 font-normal">
                    28 AI ERP &amp; CRM Modules • 1,500 Lead Credits/mo Included • No Credit Card Required for Free Tier
                </p>

                {/* ── Visual Media Showcase (Experiment 3: hero_media_v1) ── */}
                <div className="mt-16 max-w-5xl mx-auto relative">
                    
                    {/* VARIANT B: AI Female Founder Video Commercial */}
                    {mediaExp.variant === "ai_commercial" ? (
                        <div className="relative bg-[#090D1A]/95 border border-purple-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left transform-gpu">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                    </div>
                                    <span className="text-xs font-mono text-purple-300 border-l border-white/10 pl-3 flex items-center gap-1.5">
                                        <Sparkles size={13} className="text-purple-400" /> AI Founder Commercial · 46s Cinematic Pitch
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 px-3 py-1 rounded-full text-xs text-purple-200 font-medium">
                                    <Flame size={13} className="text-amber-400" /> Official Video Showcase
                                </div>
                            </div>

                            {/* Video Player Container */}
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 group">
                                <video
                                    id="hero-ai-video"
                                    src="/social_media_assets/ai_female_model_commercial_16x9.mp4"
                                    poster="/social_media_assets/ai_female_model_commercial_preview.gif"
                                    controls
                                    playsInline
                                    muted={isMuted}
                                    onPlay={() => {
                                        setIsPlaying(true);
                                        mediaExp.trackConversion("video_played");
                                    }}
                                    onPause={() => setIsPlaying(false)}
                                    className="w-full h-full object-cover"
                                />

                                {/* Quick Audio Toggle Overlay */}
                                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                                    <button
                                        onClick={() => {
                                            const vid = document.getElementById("hero-ai-video") as HTMLVideoElement;
                                            if (vid) {
                                                vid.muted = !vid.muted;
                                                setIsMuted(vid.muted);
                                            }
                                        }}
                                        className="bg-black/70 hover:bg-black/90 text-white p-2.5 rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                                        title={isMuted ? "Unmute Video" : "Mute Video"}
                                    >
                                        {isMuted ? <VolumeX size={18} className="text-amber-400" /> : <Volume2 size={18} className="text-emerald-400" />}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-300">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={14} className="text-emerald-400" />
                                    <span>Watch how Beraxis replaces your $400/mo software stack with one autonomous command center.</span>
                                </div>
                                <Link 
                                    href="/pricing"
                                    onClick={() => mediaExp.trackConversion("cta_click", { source: "video_container" })}
                                    className="text-purple-400 hover:text-purple-300 font-bold inline-flex items-center gap-1 group"
                                >
                                    Claim $1/mo Deal <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                    /* VARIANT C: Live Interactive 25M+ Leads Search Widget */
                    ) : mediaExp.variant === "interactive_leads" ? (
                        <div className="relative bg-[#090D1A]/95 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left transform-gpu">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                    </div>
                                    <span className="text-xs font-mono text-cyan-300 border-l border-white/10 pl-3 flex items-center gap-1.5">
                                        <Globe size={13} className="text-cyan-400" /> Live Interactive Leads Search Sandbox (25M+ Verified Contacts)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/40 px-3 py-1 rounded-full text-xs text-cyan-200 font-medium">
                                    <Sparkles size={13} className="text-cyan-300" /> 1-Click Pipeline Import
                                </div>
                            </div>

                            {/* Industry Pill Quick Selectors */}
                            <div className="flex flex-wrap gap-2 mb-5">
                                {Object.keys(mockLeadsData).map(industry => (
                                    <button
                                        key={industry}
                                        onClick={() => {
                                            setLeadSearchQuery(industry);
                                            mediaExp.trackConversion("leads_searched", { query: industry });
                                        }}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            leadSearchQuery === industry
                                                ? "bg-cyan-500 text-black font-extrabold shadow-md shadow-cyan-500/30"
                                                : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                                        }`}
                                    >
                                        {industry}
                                    </button>
                                ))}
                            </div>

                            {/* Search bar simulation */}
                            <div className="relative mb-5">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                                <input
                                    type="text"
                                    value={leadSearchQuery}
                                    onChange={(e) => setLeadSearchQuery(e.target.value)}
                                    placeholder="Search 25M+ contacts by industry or title..."
                                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>

                            {/* Live Result Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {currentLeads.map((lead) => {
                                    const isImported = importedLeads[lead.email];
                                    return (
                                        <div key={lead.email} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded">Verified Direct</span>
                                                    <span className="text-[10px] text-gray-400">{lead.city}</span>
                                                </div>
                                                <div className="text-sm font-bold text-white">{lead.name}</div>
                                                <div className="text-xs text-cyan-300 font-medium">{lead.title}</div>
                                                <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                    <Building2 size={11} /> {lead.company}
                                                </div>
                                                <div className="mt-2.5 space-y-1 text-[11px] text-gray-400 font-mono">
                                                    <div className="flex items-center gap-1 truncate"><Mail size={11} className="text-emerald-400 shrink-0" /> {lead.email}</div>
                                                    <div className="flex items-center gap-1"><Phone size={11} className="text-purple-400 shrink-0" /> {lead.phone}</div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleImportLead(lead.email)}
                                                disabled={isImported}
                                                className={`mt-4 w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                                    isImported
                                                        ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default"
                                                        : "bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 hover:border-cyan-400"
                                                }`}
                                            >
                                                {isImported ? (
                                                    <><Check size={13} className="text-emerald-400" /> Added to CRM Deals</>
                                                ) : (
                                                    <><PlusCircleIcon /> 1-Click Import to CRM</>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
                                <span>Showing 3 of 25,480,192 verified B2B decision-maker records.</span>
                                <Link 
                                    href="/leads-pool"
                                    onClick={() => mediaExp.trackConversion("cta_click", { source: "leads_widget" })}
                                    className="text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1 group"
                                >
                                    Open Full Leads Explorer <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                    /* VARIANT A: Canonical Control Glassmorphic Mockup */
                    ) : (
                        <div className="relative bg-[#090D1A]/95 border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left transform-gpu">
                            {/* Header bar */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                    </div>
                                    <span className="text-xs font-mono text-gray-400 border-l border-white/10 pl-3">beraxis.online/crm/leads-pool</span>
                                </div>
                                <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full text-xs text-purple-300 font-medium">
                                    <Mic size={14} className="animate-pulse text-purple-400" /> AI Voice Assistant Active
                                </div>
                            </div>

                            {/* ERP Mock Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Card 1: Global Leads Pool */}
                                <div className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 rounded-xl p-5 border border-cyan-500/30 relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                                            <Globe size={14} /> Leads Pool
                                        </span>
                                        <span className="text-xs bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded">25M+ Records</span>
                                    </div>
                                    <div className="text-2xl font-extrabold text-white">Global B2B Contacts</div>
                                    <p className="text-xs text-gray-300 mt-1">Verified Emails, Direct Dials & 1-Click Import</p>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                                        <CheckCircle size={14} /> 100% Free Included
                                    </div>
                                </div>

                                {/* Card 2: Voice Command Demo */}
                                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-5 border border-purple-500/30">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                                            <Cpu size={14} /> Voice Command
                                        </span>
                                        <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded font-mono">Live</span>
                                    </div>
                                    <p className="text-sm font-medium text-white italic">"Import 50 SaaS CEOs from USA to my CRM pipeline."</p>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                                        <CheckCircle size={14} /> Executed in 45ms
                                    </div>
                                </div>

                                {/* Card 3: Speed vs Legacy */}
                                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Speed vs Others</span>
                                        <span className="text-xs bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded">10x Faster</span>
                                    </div>
                                    <div className="text-2xl font-extrabold text-white">45ms <span className="text-xs font-normal text-gray-400">Response</span></div>
                                    <p className="text-xs text-gray-400 mt-1">Global Edge Sync Enabled</p>
                                    <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                                        <div className="bg-emerald-400 h-full w-[95%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Trust Indicators / Badges */}
                <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-75">
                    <div className="flex items-center justify-center gap-2.5 text-sm text-gray-300 font-medium">
                        <ShieldCheck size={18} className="text-purple-400" /> Enterprise RLS Security
                    </div>
                    <div className="flex items-center justify-center gap-2.5 text-sm text-gray-300 font-medium">
                        <Globe size={18} className="text-cyan-400" /> 25M+ Global Leads Pool
                    </div>
                    <div className="flex items-center justify-center gap-2.5 text-sm text-gray-300 font-medium">
                        <Zap size={18} className="text-amber-400" /> Real-time Sub-second Sync
                    </div>
                    <div className="flex items-center justify-center gap-2.5 text-sm text-gray-300 font-medium">
                        <Sparkles size={18} className="text-pink-400" /> 100% Full-Suite Feature Parity
                    </div>
                </div>
            </div>

            {/* ── Interactive SaaS Savings Calculator Modal ── */}
            {isCalcOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative w-full max-w-2xl bg-[#090D1A] border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
                        <button
                            onClick={() => setIsCalcOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
                                <Calculator size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black text-white">Your SaaS Stack Cost vs Beraxis</h3>
                                <p className="text-xs sm:text-sm text-gray-300">Compare what you pay today across fragmented SaaS tools.</p>
                            </div>
                        </div>

                        {/* Cost Comparison Table */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                                <span className="text-gray-300">HubSpot / Salesforce (CRM & Pipeline)</span>
                                <span className="font-mono font-bold text-red-400">$150 / mo</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                                <span className="text-gray-300">QuickBooks / Xero (Double-entry Accounting)</span>
                                <span className="font-mono font-bold text-red-400">$85 / mo</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                                <span className="text-gray-300">Toast / Square (POS & Inventory Management)</span>
                                <span className="font-mono font-bold text-red-400">$69 / mo</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                                <span className="text-gray-300">Apollo / ZoomInfo (B2B Leads Database)</span>
                                <span className="font-mono font-bold text-red-400">$99 / mo</span>
                            </div>
                            
                            {/* Summary bar */}
                            <div className="pt-3 border-t border-white/15 flex items-center justify-between font-bold text-base">
                                <span className="text-gray-300">Total Traditional Cost:</span>
                                <span className="text-red-400 font-mono line-through">$403 / month ($4,836/yr)</span>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-purple-500/20 border border-emerald-500/50 flex items-center justify-between font-extrabold text-lg">
                                <div className="flex items-center gap-2 text-emerald-300">
                                    <CheckCircle size={20} className="text-emerald-400" />
                                    <span>Beraxis All-In-One:</span>
                                </div>
                                <span className="text-emerald-300 font-mono">$1 / month ($12/yr)</span>
                            </div>
                        </div>

                        {/* Grand Total Savings Callout */}
                        <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
                            <span className="text-xs uppercase tracking-wider font-bold text-amber-300 block mb-1">Your Total Annual Savings</span>
                            <span className="text-3xl sm:text-4xl font-black text-white">$4,824 / year</span>
                            <span className="text-xs text-amber-200/80 block mt-1">99.7% cost reduction with all 28 enterprise modules included</span>
                        </div>

                        {/* CTA button */}
                        <Link
                            href="/pricing"
                            onClick={() => {
                                setIsCalcOpen(false);
                                ctaExp.trackConversion("pricing_click", { source: "calculator_modal" });
                            }}
                            className="galaxy-btn-primary !py-4 text-base w-full flex items-center justify-center gap-2 group font-black"
                        >
                            Claim $1/mo Early Bird Access & Save $4,824 <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

function PlusCircleIcon() {
    return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m-4-4h8" />
        </svg>
    );
}
