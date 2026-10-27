import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Users, Package, Mic, Globe, ShoppingCart, BarChart3, ShieldCheck, CheckCircle2, ArrowRight, Zap, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Platform Features & Enterprise Modules | Free ERP & CRM · Beraxis AI",
  description: "Explore all Beraxis AI enterprise capabilities: Free CRM pipeline, real-time multi-warehouse inventory, Free POS, AI voice pilot, and native B2B leads directory for $1/month.",
  keywords: [
    "Free ERP",
    "Free CRM",
    "Free POS",
    "Free inventory management",
    "Free CRM software",
    "Beraxis features",
    "cloud ERP modules",
    "AI CRM software",
    "smart inventory system",
    "AI voice ERP",
    "Verified leads database",
    "business automation tools"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/features",
  },
  openGraph: {
    title: "Platform Features & Enterprise Modules | Beraxis AI",
    description: "Replace 5 fragmented tools with one cohesive glassmorphic command deck. 28 modules + global leads directory for $1/month.",
    url: "https://www.beraxis.online/features",
    siteName: "Beraxis",
  },
};

const FEATURE_MODULES = [
  {
    slug: "crm-pipeline",
    title: "AI CRM & Pipeline",
    badge: "Sales Velocity",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    description: "Drag-and-drop Kanban deal tracking with automated WhatsApp sync, AI opportunity scoring, and direct 1-click import from the B2B Leads Directory.",
    highlights: ["Interactive Kanban", "AI Win Scoring", "WhatsApp Sync", "1-Click Lead Import"],
    href: "/features/crm-pipeline"
  },
  {
    slug: "inventory",
    title: "Smart Cloud Inventory",
    badge: "Operations",
    icon: Package,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    description: "Multi-warehouse tracking with automated reorder points, barcode scanning, lot expiry dates, and real-time POS stock adjustments.",
    highlights: ["Multi-Warehouse", "Automated Reorders", "Barcode & Serial Tracking", "FIFO/LIFO Costing"],
    href: "/features/inventory"
  },
  {
    slug: "voice-pilot",
    title: "AI Voice Pilot",
    badge: "Autonomous AI",
    icon: Mic,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    description: "Command your enterprise hands-free. Issue natural spoken commands to generate invoices, query warehouse inventory, and log client meeting notes.",
    highlights: ["Natural Speech Input", "Under 45ms Latency", "Hands-Free Invoicing", "Instant CRM Transcripts"],
    href: "/features/voice-pilot"
  },
  {
    slug: "leads-pool",
    title: "Global B2B Leads Directory",
    badge: "Growth Engine",
    icon: Globe,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    description: "Stop paying thousands to Apollo or ZoomInfo. Search verified decision-maker contacts across 50+ countries with direct phone dials and emails.",
    highlights: ["Verified Business Contacts", "50+ Countries", "Zero Add-on Fees", "Direct CRM Pipeline Import"],
    href: "/leads-pool"
  },
  {
    slug: "pos-terminal",
    title: "Omnichannel POS & KDS",
    badge: "Retail & Dining",
    icon: ShoppingCart,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    description: "Touch-friendly point of sale with offline resilience, Kitchen Display Systems (KDS) for dining, and unified split-bill payment processing.",
    highlights: ["Touchscreen POS", "Kitchen Display KDS", "Offline Order Queue", "Loyalty Programs"],
    href: "/pos"
  },
  {
    slug: "accounting",
    title: "Double-Entry Accounting",
    badge: "Finance & GL",
    icon: BarChart3,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    description: "Audit-ready General Ledger, automated bank feeds reconciliation, tax reporting, and balance sheets synced directly with sales and inventory.",
    highlights: ["General Ledger (GL)", "Automated Bank Feeds", "Multi-Currency", "P&L / Balance Sheet"],
    href: "/accounting"
  }
];

export default function FeaturesHubPage() {
  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-wider mb-6">
            <Sparkles size={14} className="text-purple-400" /> Platform Architecture
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Built for Scale: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">28 Enterprise Modules</span>
          </h1>
          <p className="text-lg text-gray-300 font-light leading-relaxed">
            Discover how Beraxis replaces fragmented single-purpose tools with one cohesive, high-performance glassmorphic cockpit.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {FEATURE_MODULES.map((mod) => (
            <div
              key={mod.slug}
              className={`p-8 rounded-3xl bg-[#090D1A]/90 border ${mod.border} hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:-translate-y-1`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${mod.bg} ${mod.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <mod.icon size={26} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                    {mod.badge}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                  {mod.title}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                  {mod.description}
                </p>

                <div className="space-y-2 mb-8">
                  {mod.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={mod.href}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all group-hover:border-purple-500/40"
              >
                <span>Explore {mod.title}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

        {/* Comparison Callout */}
        <div className="text-center p-12 rounded-3xl bg-[#0F172A]/80 border border-white/10 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Want to See How Beraxis Compares to QuickBooks, Odoo &amp; HubSpot?
          </h2>
          <p className="text-gray-300 text-sm mb-6 max-w-2xl mx-auto">
            Check out our detailed head-to-head comparison matrices to see how Beraxis saves businesses thousands of dollars in SaaS subscription fees.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/compare" className="galaxy-btn-primary !px-7 !py-3 text-xs font-bold inline-flex items-center gap-2">
              View Competitor Comparisons <ArrowRight size={14} />
            </Link>
            <Link href="/pricing" className="px-7 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold">
              See Pricing ($1/mo)
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
