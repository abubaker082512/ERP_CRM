"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Users,
  Globe,
  ShieldCheck,
  Zap,
  Layers,
  DollarSign,
  Award,
  BarChart3,
  Maximize2,
  Minimize2,
  Building2,
  Mic,
  Database
} from "lucide-react";

interface SlideData {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
}

const SLIDES: SlideData[] = [
  { id: 1, tag: "01 / COVER", title: "BERAXIS AI", subtitle: "The Autonomous AI Operating System Replacing Legacy SaaS Sprawl" },
  { id: 2, tag: "02 / THE PROBLEM", title: "The $960/Mo SaaS Tax & The ERP Consultant Trap", subtitle: "30M+ growing SMBs are trapped between fragmented point tools and broken legacy ERPs" },
  { id: 3, tag: "03 / THE SOLUTION", title: "Autonomous Business OS in 30 Seconds", subtitle: "One unified platform replacing Odoo, HubSpot, QuickBooks, Square & Apollo with Dual-Brain AI" },
  { id: 4, tag: "04 / LIVE TRACTION", title: "100+ Active Users Milestone Achieved ($0 Ad Spend)", subtitle: "Real-world organic adoption, 307 live production routes, and compounding search velocity" },
  { id: 5, tag: "05 / PRODUCT DEPTH", title: "28 Synchronized Modules & 15 Industry Archetypes", subtitle: "Full-stack operational moat built on a single unified schema with zero plugin dependencies" },
  { id: 6, tag: "06 / MARKET SIZE", title: "Massive Market Wave: $62B → $136B Global TAM", subtitle: "Enterprise ERP is shifting downmarket to 30M+ SMBs demanding AI over consulting delays" },
  { id: 7, tag: "07 / COMPETITION", title: "Why BERAXIS AI Wins Every Head-to-Head", subtitle: "The only platform combining GAAP ERP, 25M+ B2B Leads, and Duplex Voice AI at 1/20th the TCO" },
  { id: 8, tag: "08 / BUSINESS MODEL", title: "Disruptive PLG Wedge → High-ARPU Expansion", subtitle: "Frictionless entry eliminates buyer resistance while AI & multi-seat scaling drive 132% NRR" },
  { id: 9, tag: "09 / UNIT ECONOMICS", title: "World-Class Efficiency: 26.6x LTV:CAC & 84% Margin", subtitle: "Serverless edge architecture and programmatic organic distribution yield elite SaaS metrics" },
  { id: 10, tag: "10 / GO-TO-MARKET", title: "4 Scalable Global Distribution Engines", subtitle: "Repeatable, low-CAC acquisition channels scaling from 100+ users to 18,000+ global accounts" },
  { id: 11, tag: "11 / FINANCIALS", title: "5-Year Financial Forecast: $835K → $62.0M ARR", subtitle: "Milestone-driven scaling trajectory across North America, Europe, UK, and MENA" },
  { id: 12, tag: "12 / THE ASK & VISION", title: "Raising $3.0M USD for Up to 30% Equity", subtitle: "Deploying $3,000,000 USD in growth capital to scale autonomous AI, global GTM, and partner channels" }
];

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalSlides = SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides ? prev + 1 : prev));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const activeMeta = SLIDES[currentSlide - 1];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="fixed top-[-15%] left-[-10%] w-[600px] h-[600px] bg-sky-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[650px] h-[650px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

      {/* Top Deck Control Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#080D1A]/90 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo-full.png"
              onError={(e) => { (e.target as HTMLImageElement).src = "/logo2.png"; }}
              alt="BERAXIS AI"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </Link>
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] bg-emerald-500/15 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider">
            <Award size={12} className="text-emerald-400" /> 100+ Users Milestone Deck
          </span>
        </div>

        {/* Slide Progress Pills */}
        <div className="hidden lg:flex items-center gap-1.5">
          {SLIDES.map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(s.id)}
              title={s.title}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                s.id === currentSlide
                  ? "w-7 bg-gradient-to-r from-cyan-400 to-purple-500"
                  : "w-2 bg-white/15 hover:bg-white/35"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs font-mono font-bold text-slate-400">
            {String(currentSlide).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
          </span>
          <button
            onClick={prevSlide}
            disabled={currentSlide === 1}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-white/10 transition cursor-pointer"
            title="Previous Slide (←)"
          >
            <ArrowLeft size={15} />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition cursor-pointer"
            title="Next Slide (→)"
          >
            <span>Next</span>
            <ArrowRight size={14} />
          </button>
          <a
            href="/Beraxis_Investor_Pitch_Deck.pdf"
            download
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
          >
            <Download size={14} />
            <span>PDF Deck</span>
          </a>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 transition cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* Main Slide Stage */}
      <main className="flex-grow flex flex-col justify-center items-center pt-20 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full relative z-10">
        {/* Slide Header Pill */}
        <div className="w-full mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold uppercase tracking-widest mb-2">
            <Sparkles size={12} />
            <span>{activeMeta.tag}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            {activeMeta.title}
          </h1>
          <p className="text-xs sm:text-base text-slate-400 mt-1.5 max-w-3xl mx-auto">
            {activeMeta.subtitle}
          </p>
        </div>

        {/* SLIDE 1: COVER */}
        {currentSlide === 1 && (
          <div className="w-full max-w-5xl space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-950/50">
              <Award size={16} className="text-emerald-400 animate-pulse" />
              <span>★ 100+ ACTIVE USERS MILESTONE ACHIEVED WITH $0 PAID AD SPEND ★</span>
            </div>

            <div className="bg-[#0B1120]/90 border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
              <p className="text-sm sm:text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed">
                <strong>BERAXIS AI</strong> unifies <strong>28 Enterprise Modules</strong> (GAAP Accounting, Visual CRM, Touch POS, Multi-Warehouse Inventory, HRMS &amp; MRP), <strong>12 Turnkey Industry Blueprints</strong>, <strong>25,000,000+ Verified Global B2B Leads</strong>, and a <strong>Streaming Duplex AI Voice Pilot</strong> into a single glassmorphic operating system.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">100+ Users</div>
                  <div className="text-xs text-slate-400 mt-1">Organic Launch Milestone</div>
                </div>
                <div className="bg-sky-950/30 border border-sky-500/30 rounded-2xl p-4">
                  <div className="text-2xl sm:text-3xl font-black text-sky-400">28 Apps</div>
                  <div className="text-xs text-slate-400 mt-1">+ 15 Industry Archetypes</div>
                </div>
                <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-4">
                  <div className="text-2xl sm:text-3xl font-black text-purple-400">25M+ Leads</div>
                  <div className="text-xs text-slate-400 mt-1">Built-In B2B Directory</div>
                </div>
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4">
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">26.6x</div>
                  <div className="text-xs text-slate-400 mt-1">LTV:CAC (84% Margin)</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-400">
                <span>💰 <strong className="text-emerald-400">Raising:</strong> $3.0M USD (Up to 30% Equity)</span>
                <span>•</span>
                <span>🏢 <strong>Headquarters:</strong> Islamabad, Pakistan</span>
                <span>•</span>
                <span>💎 <strong>Early Bird:</strong> $1.00 USD/user/mo → <strong>Standard:</strong> $24.99 USD/user/mo</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: THE PROBLEM */}
        {currentSlide === 2 && (
          <div className="w-full max-w-6xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0B1120]/90 border border-rose-500/30 rounded-2xl p-6 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-400">Pain Point 01</div>
                <h3 className="text-xl font-extrabold text-white">The $960/Mo SaaS Tool Sprawl</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To run a 15-person company, founders stitch together 5+ disconnected subscriptions:
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-1">
                  <li>• <strong>HubSpot CRM:</strong> $300/mo</li>
                  <li>• <strong>QuickBooks Online:</strong> $90/mo</li>
                  <li>• <strong>Katana / Cin7 Inventory:</strong> $350/mo</li>
                  <li>• <strong>Gusto Payroll:</strong> $120/mo</li>
                  <li>• <strong>Apollo / Instantly Leads:</strong> $100/mo</li>
                </ul>
                <div className="pt-2 border-t border-white/10 text-xs text-rose-300 font-semibold">
                  Result: $11,500+/yr &amp; 15.2 hrs/week lost re-typing data.
                </div>
              </div>

              <div className="bg-[#0B1120]/90 border border-amber-500/30 rounded-2xl p-6 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Pain Point 02</div>
                <h3 className="text-xl font-extrabold text-white">The Odoo &amp; ERP Consultant Trap</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When SMBs attempt to consolidate onto legacy ERPs like Odoo, SAP, or NetSuite, they hit a wall:
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-1">
                  <li>• <strong>73% of ERP implementations</strong> fail or blow past budget.</li>
                  <li>• <strong>$15,000–$50,000</strong> in mandatory $150/hr partner fees.</li>
                  <li>• <strong>3 to 6 months</strong> of complex setup before going live.</li>
                  <li>• <strong>Broken Upgrades:</strong> Custom Python/XML modules break on every version release.</li>
                </ul>
                <div className="pt-2 border-t border-white/10 text-xs text-amber-300 font-semibold">
                  Odoo Community strips dynamic accounting to force Enterprise upgrades.
                </div>
              </div>

              <div className="bg-[#0B1120]/90 border border-purple-500/30 rounded-2xl p-6 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400">Pain Point 03</div>
                <h3 className="text-xl font-extrabold text-white">Empty CRMs &amp; 50-Click Fatigue</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Legacy software was built for passive record-keeping, not autonomous execution:
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-1">
                  <li>• <strong>Empty Database Tax:</strong> Salesforce &amp; HubSpot charge $300/seat with zero leads included.</li>
                  <li>• <strong>Menu Fatigue:</strong> Logging a bill or checking warehouse stock takes 12+ submenu clicks.</li>
                  <li>• <strong>Zero AI Autonomy:</strong> No native voice copilot or instant OCR ledger posting.</li>
                </ul>
                <div className="pt-2 border-t border-white/10 text-xs text-purple-300 font-semibold">
                  Founders want an AI OS that actively drives revenue.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: THE SOLUTION */}
        {currentSlide === 3 && (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-center">
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-[#0B1120]/90 border border-cyan-500/30 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-cyan-400">1. 1-Click 'Explain Business' AI Auto-Setup</h4>
                <p className="text-xs text-slate-300 mt-1">
                  15 global industry archetypes with our 1-Click 'Explain Your Business' Auto-Setup Engine auto-configure Charts of Accounts, tax rules, POS registers, and workflows in 1 click — zero consultants.
                </p>
              </div>
              <div className="bg-[#0B1120]/90 border border-emerald-500/30 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-emerald-400">2. 3.1-Second AI Receipt &amp; Bill OCR</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Drop any supplier PDF or paper receipt; AI extracts line items, tax codes, and posts balanced double-entry journal entries automatically.
                </p>
              </div>
              <div className="bg-[#0B1120]/90 border border-purple-500/30 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-purple-400">3. Streaming Duplex AI Voice Pilot</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Speak natural commands: &ldquo;Create an invoice for Acme Corp for $1,500&rdquo; or &ldquo;Show today&apos;s cash register P&amp;L.&rdquo;
                </p>
              </div>
              <div className="bg-[#0B1120]/90 border border-amber-500/30 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-amber-400">4. 25,000,000+ Built-In B2B Leads</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Pre-loaded global corporate directory with verified emails, direct dials, and 94.2% AI win-probability scoring.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <div className="bg-[#0B1120] border border-white/15 rounded-2xl p-2.5 shadow-2xl">
                <img
                  src="/deck_assets/dashboard_hero.jpg"
                  alt="BERAXIS AI Live Frontpage"
                  className="w-full h-auto rounded-xl object-cover max-h-[210px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0B1120] border border-white/15 rounded-2xl p-2 shadow-xl">
                  <img
                    src="/images/showcase/apps-screen.png"
                    alt="BERAXIS AI 28 Unified Apps Cockpit"
                    className="w-full h-auto rounded-lg object-cover max-h-[160px]"
                  />
                </div>
                <div className="bg-[#0B1120] border border-white/15 rounded-2xl p-2 shadow-xl">
                  <img
                    src="/images/showcase/dashboard-screen.png"
                    alt="BERAXIS AI Live Executive Dashboard"
                    className="w-full h-auto rounded-lg object-cover max-h-[160px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: LIVE TRACTION & 100 USERS MILESTONE */}
        {currentSlide === 4 && (
          <div className="w-full max-w-6xl space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-5 text-center">
                <div className="text-3xl font-black text-emerald-400">100+ Users</div>
                <div className="text-xs text-slate-300 font-semibold mt-1">Active Workspaces Onboarded</div>
                <div className="text-[11px] text-emerald-300/80 mt-0.5">$0 Paid Marketing Spend</div>
              </div>
              <div className="bg-sky-950/30 border border-sky-500/40 rounded-2xl p-5 text-center">
                <div className="text-3xl font-black text-sky-400">307 Routes</div>
                <div className="text-xs text-slate-300 font-semibold mt-1">Pre-Rendered Static Pages</div>
                <div className="text-[11px] text-sky-300/80 mt-0.5">Next.js 15 Edge + FastAPI</div>
              </div>
              <div className="bg-purple-950/30 border border-purple-500/40 rounded-2xl p-5 text-center">
                <div className="text-3xl font-black text-purple-400">428+ / Wk</div>
                <div className="text-xs text-slate-300 font-semibold mt-1">Google Search Impressions</div>
                <div className="text-[11px] text-purple-300/80 mt-0.5">+3,000% Commercial Query Spike</div>
              </div>
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-5 text-center">
                <div className="text-3xl font-black text-amber-400">99.9% SLA</div>
                <div className="text-xs text-slate-300 font-semibold mt-1">Multi-Tenant PostgreSQL RLS</div>
                <div className="text-[11px] text-amber-300/80 mt-0.5">Creem MoR, Paddle, Stripe &amp; Crypto</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0B1120]/90 border border-white/15 rounded-2xl p-5 space-y-2">
                <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <Users size={18} /> 100+ Users Milestone
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Surpassed <strong>100+ registered early-adopter business workspaces</strong> across retail, padel &amp; sports clubs, clinics, auto garages, and agencies — achieved 100% organically through our 1-App Free Forever PLG wedge.
                </p>
              </div>
              <div className="bg-[#0B1120]/90 border border-white/15 rounded-2xl p-5 space-y-2">
                <h3 className="text-base font-bold text-sky-400 flex items-center gap-2">
                  <TrendingUp size={18} /> Verified SEO Momentum
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Google Search Console verified <strong>64+ canonical hubs &amp; 307 static routes</strong>. Already ranking for high-intent commercial searches: <em>&ldquo;Odoo alternative&rdquo;</em>, <em>&ldquo;affordable cloud ERP&rdquo;</em> (+3,000% growth), and <em>&ldquo;CRM for padel club&rdquo;</em>.
                </p>
              </div>
              <div className="bg-[#0B1120]/90 border border-white/15 rounded-2xl p-5 space-y-2">
                <h3 className="text-base font-bold text-purple-400 flex items-center gap-2">
                  <Globe size={18} /> Global Payment &amp; Ops Ready
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Headquartered in Islamabad, Pakistan with capital-efficient engineering execution. Live international billing via Creem Merchant of Record, Paddle, Stripe, DirectPay, and 30+ cryptocurrencies.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: PRODUCT DEPTH */}
        {currentSlide === 5 && (
          <div className="w-full max-w-6xl space-y-5 text-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-[#0B1120]/90 border border-cyan-500/30 rounded-2xl p-5 space-y-2">
                <h4 className="text-sm font-bold text-cyan-400">Financial &amp; Accounting Core</h4>
                <ul className="space-y-1.5 text-slate-300">
                  <li>• GAAP/IFRS Double-Entry Ledger</li>
                  <li>• Automated Trial Balance &amp; P&amp;L</li>
                  <li>• Real-Time Balance Sheets</li>
                  <li>• 3.1s AI Receipt &amp; Bill OCR</li>
                  <li>• Multi-Currency &amp; Tax Engine</li>
                  <li>• Recurring Subscription Billing</li>
                  <li>• Multi-Company Consolidation</li>
                </ul>
              </div>
              <div className="bg-[#0B1120]/90 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
                <h4 className="text-sm font-bold text-emerald-400">CRM, POS &amp; Revenue Engine</h4>
                <ul className="space-y-1.5 text-slate-300">
                  <li>• Visual Kanban Deal Pipeline</li>
                  <li>• 25M+ Verified B2B Leads Pool</li>
                  <li>• 94.2% AI Win-Probability Score</li>
                  <li>• Omnichannel Touch POS</li>
                  <li>• Barcode &amp; 4-Way Split Bills</li>
                  <li>• E-Commerce Storefront</li>
                  <li>• Native Cold Email &amp; AI Calling</li>
                </ul>
              </div>
              <div className="bg-[#0B1120]/90 border border-purple-500/30 rounded-2xl p-5 space-y-2">
                <h4 className="text-sm font-bold text-purple-400">Supply Chain, MRP &amp; HR</h4>
                <ul className="space-y-1.5 text-slate-300">
                  <li>• Multi-Warehouse Inventory</li>
                  <li>• Batch, Lot &amp; Serial Tracking</li>
                  <li>• Discrete Manufacturing (MRP)</li>
                  <li>• Bill of Materials (BOM)</li>
                  <li>• Purchase Orders &amp; Vendor RFQs</li>
                  <li>• HRMS, Attendance &amp; Payroll</li>
                  <li>• Project WBS, E-Sign &amp; Helpdesk</li>
                </ul>
              </div>
              <div className="bg-[#0B1120]/90 border border-amber-500/30 rounded-2xl p-5 space-y-2">
                <h4 className="text-sm font-bold text-amber-400">15 Industry Archetypes</h4>
                <ul className="space-y-1 text-slate-300">
                  <li>1. Padel &amp; Sports Clubs</li>
                  <li>2. Dental &amp; Medical Clinics (EMR)</li>
                  <li>3. Bakeries &amp; Dining (KDS)</li>
                  <li>4. Auto Repair Garages</li>
                  <li>5. Real Estate &amp; Leases</li>
                  <li>6. Retail &amp; Supermarkets</li>
                  <li>7. Construction &amp; WBS</li>
                  <li>8. Schools &amp; Academies</li>
                  <li>9. NGOs &amp; Grants | 10. MRP</li>
                  <li>11. Logistics | 12. Agencies</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0B1120] border border-white/15 rounded-2xl p-2.5 shadow-xl">
                <img
                  src="/images/showcase/apps-screen.png"
                  alt="BERAXIS AI 34+ Unified Enterprise Apps"
                  className="w-full h-auto rounded-xl object-cover max-h-[190px]"
                />
              </div>
              <div className="bg-[#0B1120] border border-white/15 rounded-2xl p-2.5 shadow-xl">
                <img
                  src="/images/showcase/industry-screen.png"
                  alt="BERAXIS AI 15 Industry Archetypes"
                  className="w-full h-auto rounded-xl object-cover max-h-[190px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: MARKET OPPORTUNITY */}
        {currentSlide === 6 && (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#0B1120]/90 border border-sky-500/30 rounded-2xl p-5">
                <div className="text-2xl font-black text-sky-400">$136B Global TAM</div>
                <div className="text-xs text-slate-300 mt-1">
                  Global Cloud ERP &amp; CRM market expanding at a <strong>13.8% CAGR</strong> through 2030 as legacy on-premise systems retire.
                </div>
              </div>
              <div className="bg-[#0B1120]/90 border border-purple-500/30 rounded-2xl p-5">
                <div className="text-2xl font-black text-purple-400">$34.8B SMB &amp; Mid-Market SAM</div>
                <div className="text-xs text-slate-300 mt-1">
                  30M+ underserved SMBs across North America, Europe, UK, MENA, and APAC actively seeking affordable AI automation.
                </div>
              </div>
              <div className="bg-[#0B1120]/90 border border-emerald-500/30 rounded-2xl p-5">
                <div className="text-2xl font-black text-emerald-400">$98M+ Target SOM</div>
                <div className="text-xs text-slate-300 mt-1">
                  Capturing just <strong>1.2% of the high-intent Odoo / HubSpot / QuickBooks switchers market</strong> yields $98M+ in recurring revenue.
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-[#0B1120] border border-white/15 rounded-2xl p-3 shadow-2xl">
                <img
                  src="/deck_assets/chart_market_tam.png"
                  alt="Market TAM Chart"
                  className="w-full h-auto rounded-xl object-contain max-h-[360px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 7: COMPETITIVE LANDSCAPE */}
        {currentSlide === 7 && (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-3 text-xs">
              <div className="bg-[#0B1120]/90 border border-emerald-500/30 rounded-2xl p-4">
                <h4 className="font-bold text-emerald-400 text-sm">⚡ vs. Odoo ERP</h4>
                <p className="text-slate-300 mt-1">
                  Odoo takes 90 days &amp; $15,000+ in consultants, and strips accounting from Community. BERAXIS AI activates in 30 seconds with full GAAP accounting and zero consultant fees.
                </p>
              </div>
              <div className="bg-[#0B1120]/90 border border-sky-500/30 rounded-2xl p-4">
                <h4 className="font-bold text-sky-400 text-sm">⚡ vs. HubSpot &amp; Salesforce</h4>
                <p className="text-slate-300 mt-1">
                  They charge $300–$800/mo for an empty CRM with zero accounting, POS, or inventory. BERAXIS AI includes CRM + 25M B2B leads + full ERP.
                </p>
              </div>
              <div className="bg-[#0B1120]/90 border border-purple-500/30 rounded-2xl p-4">
                <h4 className="font-bold text-purple-400 text-sm">⚡ vs. GoHighLevel &amp; QuickBooks</h4>
                <p className="text-slate-300 mt-1">
                  GHL lacks double-entry accounting &amp; inventory; QuickBooks lacks CRM, POS &amp; B2B leads. BERAXIS AI unifies both front-office growth and back-office finance.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-[#0B1120] border border-white/15 rounded-2xl p-3 shadow-2xl">
                <img
                  src="/deck_assets/chart_competitor_comparison.png"
                  alt="Competitor Comparison"
                  className="w-full h-auto rounded-xl object-contain max-h-[360px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 8: BUSINESS MODEL & PRICING WEDGE */}
        {currentSlide === 8 && (
          <div className="w-full max-w-6xl space-y-6 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0B1120]/90 border border-emerald-500/30 rounded-2xl p-6 space-y-3">
                <span className="text-[11px] bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-full font-bold uppercase">
                  Tier 1 • Viral PQL Hook
                </span>
                <h3 className="text-xl font-extrabold text-white">One App Free Forever</h3>
                <div className="text-3xl font-black text-emerald-400">$0 <span className="text-xs font-normal text-slate-400">/ forever</span></div>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
                  <li>• Pick any 1 full module (CRM, POS, or Accounting) free forever</li>
                  <li>• Unlimited records &amp; zero credit card</li>
                  <li>• Drives 65%+ visitor-to-signup conversion</li>
                </ul>
              </div>

              <div className="bg-gradient-to-b from-purple-950/50 to-[#0B1120] border border-purple-500/50 rounded-2xl p-6 space-y-3 shadow-xl">
                <span className="text-[11px] bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full font-bold uppercase">
                  Tier 2 • Early Bird Launch Wedge
                </span>
                <h3 className="text-xl font-extrabold text-white">Early Bird All-28 Suite</h3>
                <div className="text-3xl font-black text-purple-300">$1.00 USD <span className="text-xs font-normal text-slate-400">/ user / mo</span></div>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
                  <li>• Introductory Early Bird rate ($12/yr billed annually)</li>
                  <li>• Unlocks all 28+ enterprise modules</li>
                  <li>• 1,500 verified B2B lead credits/month</li>
                  <li>• 3.1s AI Receipt OCR &amp; Voice Pilot</li>
                </ul>
              </div>

              <div className="bg-[#0B1120]/90 border border-cyan-500/30 rounded-2xl p-6 space-y-3">
                <span className="text-[11px] bg-cyan-500/15 text-cyan-300 px-2.5 py-1 rounded-full font-bold uppercase">
                  Tier 3 • Post-Early Bird Standard
                </span>
                <h3 className="text-xl font-extrabold text-white">Standard Per-User Scale</h3>
                <div className="text-3xl font-black text-cyan-400">$24.99 USD <span className="text-xs font-normal text-slate-400">/ user / mo</span></div>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
                  <li>• Post-launch recurring price per user per month</li>
                  <li>• Multi-company &amp; multi-branch consolidation</li>
                  <li>• Native Cold Email &amp; AI Voice Calling</li>
                  <li>• Usage expansion: $0.12/min AI calling &amp; bulk lead packs</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 9: UNIT ECONOMICS */}
        {currentSlide === 9 && (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-3 text-xs">
              <div className="bg-[#0B1120]/90 border border-emerald-500/30 rounded-2xl p-4">
                <h4 className="font-bold text-emerald-400 text-sm">💎 $4,800 LTV vs. $180 Blended CAC (26.6x)</h4>
                <p className="text-slate-300 mt-1">
                  Programmatic SEO (307 pages) and our 30% partner referral portal keep customer acquisition costs ultra-low while full ERP lock-in drives 24–36+ month retention.
                </p>
              </div>
              <div className="bg-[#0B1120]/90 border border-sky-500/30 rounded-2xl p-4">
                <h4 className="font-bold text-sky-400 text-sm">⚡ 1.1-Month CAC Payback Period</h4>
                <p className="text-slate-300 mt-1">
                  Upfront annual billing and immediate usage expansion recover acquisition spend in under 35 days.
                </p>
              </div>
              <div className="bg-[#0B1120]/90 border border-purple-500/30 rounded-2xl p-4">
                <h4 className="font-bold text-purple-400 text-sm">📊 84% Gross Margin &amp; 132% NRR</h4>
                <p className="text-slate-300 mt-1">
                  Serverless Next.js + multi-tenant Supabase RLS keeps hosting and AI inference under $12–$32/mo per enterprise account.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-[#0B1120] border border-white/15 rounded-2xl p-3 shadow-2xl">
                <img
                  src="/deck_assets/chart_unit_economics.png"
                  alt="Unit Economics Chart"
                  className="w-full h-auto rounded-xl object-contain max-h-[360px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 10: GO-TO-MARKET */}
        {currentSlide === 10 && (
          <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#0B1120]/90 border border-cyan-500/30 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-bold text-cyan-400">ENGINE 01</span>
              <h3 className="text-base font-extrabold text-white">Programmatic SEO Hub</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                307 static routes targeting high-intent queries (<em>&ldquo;Odoo Alternative&rdquo;</em>, <em>&ldquo;$1 Cloud ERP&rdquo;</em>, <em>&ldquo;Padel Club CRM&rdquo;</em>). Already generating 428+ weekly Google impressions.
              </p>
            </div>
            <div className="bg-[#0B1120]/90 border border-purple-500/30 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-bold text-purple-400">ENGINE 02</span>
              <h3 className="text-base font-extrabold text-white">30% Partner &amp; CPA Portal</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Live affiliate portal (<code>/affiliates</code>) offering 30% recurring revenue share to bookkeepers, CPAs, and IT consultants who migrate 10–50 clients each.
              </p>
            </div>
            <div className="bg-[#0B1120]/90 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-bold text-emerald-400">ENGINE 03</span>
              <h3 className="text-base font-extrabold text-white">24-Hr Free Migration</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Eliminates ERP switching friction: our AI schema mapper + concierge team migrates messy Odoo, QuickBooks, or Excel data in under 24 hours for free.
              </p>
            </div>
            <div className="bg-[#0B1120]/90 border border-amber-500/30 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-bold text-amber-400">ENGINE 04</span>
              <h3 className="text-base font-extrabold text-white">AI Outbound Dogfooding</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Using BERAXIS AI&apos;s own 25M+ B2B Lead Pool, automated email warmup, and AI Voice Calling agents to prospect 10,000+ SMBs/month at near-zero cost.
              </p>
            </div>
          </div>
        )}

        {/* SLIDE 11: 5-YEAR FINANCIAL FORECAST */}
        {currentSlide === 11 && (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-2.5 text-xs">
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5">
                <strong className="text-emerald-400">Current Milestone:</strong> 100+ Active Users onboarded organically ($0 CAC).
              </div>
              <div className="bg-[#0B1120]/90 border border-sky-500/30 rounded-xl p-3.5">
                <strong className="text-sky-400">Year 1 — $835K ARR:</strong> 1,500 Free Users / 350 Paying SMBs via SEO &amp; PLG wedge.
              </div>
              <div className="bg-[#0B1120]/90 border border-indigo-500/30 rounded-xl p-3.5">
                <strong className="text-indigo-400">Year 2 — $4.6M ARR:</strong> 1,800 Paying Accounts + AI Voice Calling monetization.
              </div>
              <div className="bg-[#0B1120]/90 border border-purple-500/30 rounded-xl p-3.5">
                <strong className="text-purple-400">Year 3 — $16.5M ARR:</strong> 5,500 Accounts powered by 250+ CPA &amp; agency partners.
              </div>
              <div className="bg-[#0B1120]/90 border border-amber-500/30 rounded-xl p-3.5">
                <strong className="text-amber-400">Year 5 — $62.0M ARR:</strong> 18,000+ Global Accounts at 84% SaaS Gross Margin.
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-[#0B1120] border border-white/15 rounded-2xl p-3 shadow-2xl">
                <img
                  src="/deck_assets/chart_arr_growth.png"
                  alt="ARR Growth Trajectory"
                  className="w-full h-auto rounded-xl object-contain max-h-[360px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 12: THE ASK & INVESTMENT CLOSE */}
        {currentSlide === 12 && (
          <div className="w-full max-w-5xl space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-[#0B1120]/90 border border-cyan-500/30 rounded-2xl p-4">
                <div className="text-2xl font-black text-cyan-400">40% ($1.20M)</div>
                <div className="text-xs font-bold text-white mt-1">Autonomous AI &amp; R&amp;D</div>
                <div className="text-[11px] text-slate-400 mt-1">Voice Pilot v2, mobile apps &amp; 50+ banking/tax APIs</div>
              </div>
              <div className="bg-[#0B1120]/90 border border-purple-500/30 rounded-2xl p-4">
                <div className="text-2xl font-black text-purple-400">35% ($1.05M)</div>
                <div className="text-xs font-bold text-white mt-1">Global GTM &amp; Sales</div>
                <div className="text-[11px] text-slate-400 mt-1">Scale US, UK, EU &amp; MENA acquisition funnels</div>
              </div>
              <div className="bg-[#0B1120]/90 border border-emerald-500/30 rounded-2xl p-4">
                <div className="text-2xl font-black text-emerald-400">15% ($450K)</div>
                <div className="text-xs font-bold text-white mt-1">Channel Ecosystem</div>
                <div className="text-[11px] text-slate-400 mt-1">Onboard 250+ accounting &amp; ERP partner agencies</div>
              </div>
              <div className="bg-[#0B1120]/90 border border-amber-500/30 rounded-2xl p-4">
                <div className="text-2xl font-black text-amber-400">10% ($300K)</div>
                <div className="text-xs font-bold text-white mt-1">Security &amp; Concierge</div>
                <div className="text-[11px] text-slate-400 mt-1">SOC-2 Type II &amp; 24/7 migration engineers</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-sky-950/50 via-[#0B1120] to-purple-950/50 border border-cyan-500/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                Investment Round Open • Raising $3,000,000 USD for Up to 30% Equity
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Partner With BERAXIS AI — The Future of Autonomous Business Operations
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
                Product is 100% built and live in production. 100+ users milestone achieved with $0 ad spend. Ready to scale globally.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <a
                  href="/Beraxis_Investor_Pitch_Deck.pdf"
                  download
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold text-white text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 transition"
                >
                  <Download size={16} />
                  <span>Download Full Investor Deck (PDF)</span>
                </a>
                <Link
                  href="/signup"
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-white text-xs sm:text-sm border border-white/15 flex items-center gap-2 transition"
                >
                  <span>Explore Live Workspace</span>
                  <ExternalLink size={15} />
                </Link>
              </div>
              <div className="pt-3 text-xs text-slate-400 flex flex-wrap justify-center gap-4">
                <span>📧 <strong>Investor Relations:</strong> support@beraxis.online</span>
                <span>•</span>
                <span>📞 <strong>Direct / WhatsApp:</strong> +1 (970) 780-7993</span>
                <span>•</span>
                <span>🌐 <strong>Web:</strong> www.beraxis.online</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Keyboard Hint Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-10 bg-[#080D1A]/80 backdrop-blur-md border-t border-white/5 px-6 flex items-center justify-between text-[11px] text-slate-500 z-40">
        <span>Confidential Investor Presentation • BERAXIS AI Systems Inc.</span>
        <span className="hidden sm:inline">Use Keyboard Arrows (← →) or Spacebar to navigate slides</span>
      </footer>
    </div>
  );
}
