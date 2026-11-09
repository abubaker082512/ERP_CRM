import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Flame,
  HelpCircle,
  Building2,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  DollarSign
} from "lucide-react";

export const metadata: Metadata = {
  title: "The $1 Dollar ERP Software (2026) | Full AI Business Suite for $1/Month · BERAXIS AI",
  description: "Can you run your entire business for $1 per month? Yes. BERAXIS AI unlocks all 28 enterprise modules: double-entry accounting, CRM, POS, inventory & 1,500 B2B lead credits for $1.00/month. No setup fees, no lock-in.",
  keywords: [
    "1 dollar erp",
    "one dollar erp",
    "dollar erp",
    "1 dollar erp software",
    "one dollar erp software",
    "dollar erp system",
    "cheapest erp software",
    "affordable cloud erp options with monthly subscription pricing",
    "affordable cloud erp",
    "free erp software",
    "BERAXIS AI"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/one-dollar-erp",
  },
  openGraph: {
    title: "The $1 Dollar ERP Software (2026) | Full AI Business Suite for $1/Month · BERAXIS AI",
    description: "Run your entire business for $1/month. Double-entry accounting, CRM, POS, inventory, and 1,500 B2B lead credits across all 28 modules.",
    url: "https://www.beraxis.online/one-dollar-erp",
    siteName: "BERAXIS AI",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "The 1 Dollar ERP Software - BERAXIS AI",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The $1 Dollar ERP Software (2026) | Full AI Business Suite for $1/Month · BERAXIS AI",
    description: "Run your entire business for $1/month. Double-entry accounting, CRM, POS, inventory, and B2B leads across all 28 modules.",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
  },
};

const faqs = [
  {
    q: "Is it really $1.00 per month or is there a catch?",
    a: "It is genuinely $1.00 per month ($12 billed annually) during our public launch Early Bird special. You unlock all 28 enterprise modules with unlimited user seats, 1,500 monthly verified B2B lead credits, and zero hidden per-app fees."
  },
  {
    q: "How can BERAXIS AI afford to offer a full ERP for just $1 per month?",
    a: "Traditional ERP companies spend 60% of their revenue on high-pressure sales reps and certified implementation consultants. BERAXIS AI was built on modern serverless Next.js and cloud infrastructure with zero sales bloat, automated AI migrations, and self-service onboarding, allowing us to pass 95% in cost savings directly to founders."
  },
  {
    q: "What if I only want one app and do not want to pay anything?",
    a: "We have a 100% Free Forever Tier! You can choose any 1 app (such as Free CRM, Free Accounting, or Free POS) and use it forever with unlimited records and zero credit card required."
  },
  {
    q: "What happens if I need to cancel my subscription?",
    a: "You can cancel anytime with a single click in your dashboard settings. You also get a 14-day unconditional money-back guarantee, so there is zero risk."
  },
  {
    q: "Is my business financial data secure on a $1/month ERP?",
    a: "Yes. BERAXIS AI uses bank-grade 256-bit SSL encryption, PostgreSQL Row Level Security (RLS) for tenant data isolation, daily automated encrypted backups, and PCI-DSS compliant payment processing."
  }
];

export default function OneDollarErpPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "BERAXIS AI 1 Dollar ERP",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, Cloud, iOS, Android",
        "description": "The $1 Dollar ERP Software. Full suite with double-entry accounting, CRM, POS, inventory, and verified B2B leads for $1/month.",
        "offers": {
          "@type": "Offer",
          "price": "1.00",
          "priceCurrency": "USD",
          "priceValidUntil": "2027-12-31",
          "availability": "https://schema.org/InStock"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-grow pt-28 sm:pt-36 pb-20 relative z-10 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-600/20 via-purple-600/15 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">$1 Dollar ERP</span>
          </div>

          {/* Hero */}
          <div className="text-center max-w-4xl mx-auto space-y-5 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <DollarSign size={14} className="text-emerald-400" />
              <span>The $1 Dollar ERP Software Revolution</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Run Your Entire Business for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400">
                $1.00 Per Month
              </span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
              Why pay $300/month for HubSpot and $85/month for QuickBooks? BERAXIS AI gives you all 28 enterprise apps — double-entry accounting, CRM, POS, multi-warehouse stock, and 1,500 lead credits — for <strong>$1/month</strong> ($12 billed annually) or 1 App Free Forever.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center pt-3">
              <Link
                href="/pricing"
                className="galaxy-btn-primary !px-8 !py-4 text-sm font-extrabold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                Claim $1/Mo Early Bird Deal <ArrowRight size={16} />
              </Link>
              <Link
                href="/signup"
                className="galaxy-btn-secondary !px-8 !py-4 text-sm font-bold"
              >
                Start 1 App Free Forever (No Card)
              </Link>
            </div>
          </div>

          {/* What You Get for $1/Month */}
          <div className="bg-[#070B16] border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl mb-16">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
                Everything Included
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                What’s Included in Your $1/Month ERP Suite
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">GAAP Double-Entry Accounting</div>
                  <div className="text-gray-400 text-[11px]">Ledgers, balance sheets, P&L, 3s AI receipt scanner.</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Visual Sales Kanban CRM</div>
                  <div className="text-gray-400 text-[11px]">Deal stages, task automation & customer profiles.</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">1,500 Lead Credits/Month</div>
                  <div className="text-gray-400 text-[11px]">25M+ international B2B verified directory with direct dials.</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">High-Speed Point of Sale (POS)</div>
                  <div className="text-gray-400 text-[11px]">Barcode scanning, cash register reconciliation & split tabs.</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Multi-Warehouse Inventory</div>
                  <div className="text-gray-400 text-[11px]">Batch/serial tracking, low-stock reorder triggers.</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">HRMS & Payroll System</div>
                  <div className="text-gray-400 text-[11px]">Employee attendance, salary slips, leave requests.</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">12 Industry Archetypes</div>
                  <div className="text-gray-400 text-[11px]">Pre-configured for Padel, Auto, Clinics, Dining, Retail.</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">AI Voice Pilot Copilot</div>
                  <div className="text-gray-400 text-[11px]">Conversational voice commands for instant operations.</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-8">
              Frequently Asked Questions About the $1 ERP
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <HelpCircle size={16} className="text-emerald-400 shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center rounded-3xl p-8 sm:p-12 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#0F172A]/90 to-purple-950/40">
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
              Get Your $1 Dollar ERP Workspace in 30 Seconds
            </h2>
            <p className="text-gray-300 text-xs sm:text-base max-w-xl mx-auto mb-8">
              No credit card required for the 1-App Free Forever tier, or lock in all 28 modules for $1/month today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
              <Link href="/pricing" className="galaxy-btn-primary !px-8 !py-3.5 text-sm">
                Claim $1/Mo Early Bird Deal
              </Link>
              <Link href="/signup" className="galaxy-btn-secondary !px-8 !py-3.5 text-sm">
                Start 1 App Free Forever
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
