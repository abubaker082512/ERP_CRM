import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Sparkles,
  Mic,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bot,
  BrainCircuit,
  FileSearch,
  TrendingUp,
  Volume2,
  Database,
  Terminal,
  Cpu,
  Layers,
  Check
} from "lucide-react";

export const metadata: Metadata = {
  title: "Autonomous AI Copilot & Voice ERP Pilot | Beraxis AI ERP & CRM",
  description: "Experience the #1 Autonomous AI ERP & CRM Copilot. Issue natural speech voice commands, automate double-entry bookkeeping, score B2B leads, and run cross-module operations with zero latency for $1/month.",
  keywords: [
    "AI ERP",
    "AI CRM",
    "Autonomous ERP",
    "Voice AI business assistant",
    "AI Voice Pilot",
    "AI ERP software",
    "AI CRM software",
    "Free AI ERP",
    "AI accounting software",
    "AI receipt OCR",
    "AI lead scoring",
    "Beraxis AI"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/ai",
  },
  openGraph: {
    title: "Autonomous AI Copilot & Voice ERP Pilot | Beraxis AI",
    description: "Issue natural voice commands, automate bookkeeping, and manage 34+ unified enterprise modules with zero latency.",
    url: "https://www.beraxis.online/ai",
    siteName: "Beraxis",
    images: [
      {
        url: "/images/showcase/dashboard-screen.png",
        width: 1200,
        height: 630,
        alt: "Beraxis Autonomous AI Voice Pilot Cockpit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Autonomous AI Copilot & Voice ERP Pilot | Beraxis AI",
    description: "Natural language voice commands, automated double-entry ledger, and AI CRM for $1/month.",
    images: ["/images/showcase/dashboard-screen.png"],
  },
};

const SAMPLE_VOICE_COMMANDS = [
  {
    command: '"Create a $1,250 invoice for Acme Corp and email it with Net-30 terms"',
    action: "Autonomous Accounting",
    result: "General Ledger entry generated, tax calculated, invoice PDF minted & sent to contact.",
    latency: "38ms"
  },
  {
    command: '"Check safety stock levels in Central Warehouse and reorder low SKUs"',
    action: "Smart Inventory",
    result: "Inventory scanned: 3 items below threshold. Draft Purchase Order sent to preferred vendor.",
    latency: "42ms"
  },
  {
    command: '"Import 50 high-intent technology leads from Germany into CRM pipeline"',
    action: "Leads Directory",
    result: "50 verified corporate contacts allocated with direct dials and corporate emails.",
    latency: "45ms"
  },
  {
    command: '"Show me total cashflow and delinquent receivables for this quarter"',
    action: "Executive Analytics",
    result: "Real-time P&L summary loaded with aging debtor report and WhatsApp reminder shortcuts.",
    latency: "31ms"
  }
];

export default function AiPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Beraxis Autonomous AI Voice Pilot",
    "operatingSystem": "Web, iOS, Android, macOS, Windows",
    "applicationCategory": "BusinessApplication, ArtificialIntelligenceApplication",
    "description": "Voice-driven autonomous AI ERP and CRM copilot with real-time speech processing, AI OCR bookkeeping, and cross-module database intelligence.",
    "url": "https://www.beraxis.online/ai",
    "offers": {
      "@type": "Offer",
      "price": "1.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <div className="relative z-10 pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* ── 1. Hero Section ── */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-xs font-bold text-purple-200 uppercase tracking-wider mb-6 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
            <Sparkles size={14} className="text-purple-400 animate-pulse" />
            <span>Dual-Brain Autonomous AI Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-white">
            Run Your Business at the <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300">
              Speed of Thought.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed max-w-3xl mx-auto mb-8">
            Eliminate 50-click menu fatigue. The Beraxis AI Voice Pilot listens to natural spoken language, parses complex operational intent, and executes transactions across Accounting, POS, Inventory, and CRM in under 45 milliseconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/signup"
              className="galaxy-btn-primary w-full sm:w-auto"
            >
              <span>Deploy AI Free Forever</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/apps"
              className="galaxy-btn-secondary w-full sm:w-auto"
            >
              <Mic size={16} className="text-purple-400" />
              <span>Launch Live Apps Cockpit</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-300 font-medium">
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <Check size={14} className="text-emerald-400" />
              <span>&lt; 45ms Latency</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <Check size={14} className="text-emerald-400" />
              <span>Zero Hallucination SQL Sandbox</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <Check size={14} className="text-emerald-400" />
              <span>Voice &amp; Text Command Bar</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <Check size={14} className="text-emerald-400" />
              <span>Included in $1/mo Plan</span>
            </span>
          </div>
        </div>

        {/* ── 2. Interactive Voice Pilot Simulation Deck ── */}
        <section className="mb-24 p-6 sm:p-10 rounded-3xl bg-[#090D1A]/95 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden">
          <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Mic size={20} className="animate-pulse text-purple-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>AI Voice Pilot Live Command Deck</span>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Ready
                  </span>
                </h3>
                <p className="text-xs text-gray-400">Speak or type natural commands from any module in your cockpit</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-mono">
              <Terminal size={14} className="text-cyan-400" />
              <span>Shortcut: Alt + V</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_VOICE_COMMANDS.map((cmd, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#0B0F1E] border border-white/10 hover:border-purple-400/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {cmd.action}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                      <Zap size={11} /> {cmd.latency}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {cmd.command}
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {cmd.result}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Four Core AI Pillars ── */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
            Four Breakthrough Autonomous Capabilities
          </h2>
          <p className="text-sm sm:text-base text-gray-300 font-light">
            Engineered into the core PostgreSQL engine so operations execute instantly with zero brittle webhooks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <div className="p-6 rounded-3xl bg-[#0B0F1E] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-5 border border-purple-500/20">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Dual-Brain Intelligence</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Connects structured SQL tables with generative intent models. Translates human language into validated schema transactions safely.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B0F1E] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-5 border border-cyan-500/20">
                <FileSearch size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3-Second Bill OCR</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Drop receipt photos or vendor invoice PDFs. AI extracts vendor, date, line items, taxes, and auto-balances the General Ledger.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B0F1E] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-5 border border-pink-500/20">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Predictive Lead Scoring</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Scans the 26,000+ B2B Leads Directory to highlight high-probability enterprise buyers matching your ideal customer profile.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B0F1E] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
                <Cpu size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Autonomous Stock Reorder</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Monitors warehouse burn rates, seasonality, and supplier lead times to draft Purchase Orders automatically before stockouts hit.
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. High-Intent FAQ Section ── */}
        <section className="max-w-4xl mx-auto mb-20 text-left">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Frequently Asked Questions About Beraxis AI
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Clear answers regarding security, privacy, and included modules.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-5 rounded-2xl bg-[#0B0F1E] border border-white/10">
              <h3 className="text-sm font-bold text-white mb-2">
                Is the AI Voice Pilot included in the $1/month plan?
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Yes! Under our Standard Plan ($1/month billed annually at $12/yr), all AI voice pilot capabilities, receipt OCR parsing, automated reordering, and 1,500 monthly lead discovery credits are 100% unlocked with zero add-on charges.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0F1E] border border-white/10">
              <h3 className="text-sm font-bold text-white mb-2">
                Is my business data used to train public AI models?
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Never. Your tenant data is isolated by Supabase PostgreSQL Row Level Security (RLS). Prompts and queries are executed within a sandboxed operational session and never stored, sold, or used for model training.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0F1E] border border-white/10">
              <h3 className="text-sm font-bold text-white mb-2">
                How does the AI prevent financial accounting hallucinations?
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                The AI does not manipulate database numbers directly. It translates natural language into validated, double-entry transactional schemas that must strictly obey debit-equals-credit accounting rules before committing.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
