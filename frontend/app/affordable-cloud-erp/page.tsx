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
  Globe,
  Flame,
  Layers,
  HelpCircle,
  Building2,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Scale,
  Check,
  X
} from "lucide-react";

export const metadata: Metadata = {
  title: "Affordable Cloud ERP with Monthly Subscription Pricing ($1/mo) | BERAXIS AI",
  description: "Looking for affordable cloud ERP options with monthly subscription pricing? BERAXIS AI provides all 28 business modules: GAAP accounting, CRM, POS & inventory for $1/month. 1 App 100% Free Forever with zero credit card required.",
  keywords: [
    "affordable cloud erp options with monthly subscription pricing",
    "affordable cloud erp",
    "cloud erp monthly subscription",
    "1 dollar erp",
    "one dollar erp",
    "cheap erp for small business",
    "best affordable erp 2026",
    "cheap cloud erp software",
    "low cost erp systems",
    "free cloud erp software",
    "Odoo alternative ERP",
    "BERAXIS AI"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/affordable-cloud-erp",
  },
  openGraph: {
    title: "Affordable Cloud ERP Options with Monthly Subscription Pricing ($1/mo) | BERAXIS AI",
    description: "Deploy all 28 business apps for $1/month. Complete double-entry accounting, CRM, multi-warehouse inventory, and POS with 1 App Free Forever.",
    url: "https://www.beraxis.online/affordable-cloud-erp",
    siteName: "BERAXIS AI",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "Affordable Cloud ERP with Monthly Subscription Pricing",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Affordable Cloud ERP with Monthly Subscription Pricing ($1/mo) | BERAXIS AI",
    description: "Replace $800/mo tool sprawl with all-in-one Cloud ERP for $1/mo. Accounting, CRM, POS, and inventory included.",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
  },
};

const faqs = [
  {
    q: "What makes BERAXIS AI the most affordable cloud ERP with monthly subscription pricing?",
    a: "Unlike legacy ERPs (SAP, NetSuite, Odoo) that charge $30–$200 per user per month plus $15,000+ in mandatory consultant setup fees, BERAXIS AI provides an Early Bird Standard Plan for just $1.00/month ($12 billed annually) or $5/month month-to-month. You get all 28 enterprise modules with unlimited user seats and zero consultant fees."
  },
  {
    q: "Can I try this affordable cloud ERP for free without entering a credit card?",
    a: "Yes! BERAXIS AI offers a Forever Free Tier. You can select any 1 full ERP module (such as Free Accounting, Free CRM, or Free POS) and use it forever with unlimited transactions and zero credit card required."
  },
  {
    q: "Does this low-cost cloud ERP include full double-entry accounting?",
    a: "Yes. BERAXIS AI includes complete GAAP and IFRS-compliant double-entry accounting: automated general ledgers, trial balance, balance sheets, profit & loss, tax reconciliation, multi-currency support, and a 3-second AI OCR receipt scanner that drops bills directly into your ledger."
  },
  {
    q: "Are there hidden fees, per-user penalties, or mandatory app purchases?",
    a: "No. What you see is what you pay. Our Standard Plan unlocks all 28 applications across the entire platform, including 1,500 verified monthly B2B lead generation credits, with no surprise per-app fees."
  },
  {
    q: "How does the monthly subscription work compared to annual billing?",
    a: "Our Early Bird Plan is $1.00/month when billed annually ($12.00/year upfront). If you prefer month-to-month flexibility without any annual commitment, it is just $5.00/month, cancellable at any time."
  },
  {
    q: "How fast can my company migrate our existing data?",
    a: "You can import your customers, vendors, chart of accounts, and product inventory CSV/Excel files in under 5 minutes using our 1-click automated import wizard. Our engineering team also provides free concierge data migration assistance."
  }
];

export default function AffordableCloudErpPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "BERAXIS AI Affordable Cloud ERP",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Affordable Cloud ERP Software",
        "operatingSystem": "Web, Cloud, iOS, Android",
        "description": "Affordable cloud ERP with monthly subscription pricing ($1/month). Complete GAAP accounting, CRM, POS, inventory, and AI Voice Pilot.",
        "offers": {
          "@type": "Offer",
          "price": "1.00",
          "priceCurrency": "USD",
          "priceValidUntil": "2027-12-31",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "142",
          "bestRating": "5",
          "worstRating": "1"
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
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.beraxis.online" },
          { "@type": "ListItem", "position": 2, "name": "Affordable Cloud ERP", "item": "https://www.beraxis.online/affordable-cloud-erp" }
        ]
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-purple-600/20 via-pink-600/15 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-cyan-400 font-semibold">Affordable Cloud ERP</span>
          </div>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto space-y-5 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-cyan-400" />
              <span>Affordable Cloud ERP Options with Monthly Subscription Pricing</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              The Most Affordable Cloud ERP with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-300">
                Monthly Subscription Pricing
              </span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
              Stop paying $800+/month for fragmented business software and $25,000 consultant onboarding fees. BERAXIS AI unifies double-entry accounting, CRM, POS, and inventory across 28 modules for <strong>just $1/month</strong> — with <strong>1 App 100% Free Forever</strong>.
            </p>

            {/* Price & Savings Pill Bar */}
            <div className="inline-flex flex-wrap items-center justify-center gap-4 p-4 rounded-3xl bg-[#0F172A]/90 border border-white/10 shadow-xl max-w-2xl mx-auto">
              <div className="text-left px-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Legacy Cloud ERP</span>
                <span className="text-base sm:text-lg font-mono font-bold text-rose-400 line-through">$1,200 – $5,000/yr</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
              <div className="text-left px-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">BERAXIS AI Early Bird</span>
                <span className="text-base sm:text-lg font-mono font-black text-emerald-300">$1.00 / mo ($12/yr)</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
              <div className="text-left px-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Your Annual Savings</span>
                <span className="text-base sm:text-lg font-mono font-black text-amber-300">$1,188 – $4,988+/yr</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center pt-3">
              <Link
                href="/signup"
                className="galaxy-btn-primary !px-8 !py-4 text-sm font-extrabold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                Start 1 App Free Forever (No Card) <ArrowRight size={16} />
              </Link>
              <Link
                href="/pricing"
                className="galaxy-btn-secondary !px-8 !py-4 text-sm font-bold flex items-center justify-center gap-2"
              >
                <Flame size={16} className="text-amber-400" />
                Claim $1/Mo Early Bird Deal
              </Link>
            </div>
          </div>

          {/* Head-to-Head Pricing Comparison Table */}
          <div className="bg-[#070B16] border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl mb-20 overflow-hidden">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
                Transparent Cost Comparison
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                How BERAXIS AI Compares to Traditional Cloud ERPs
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs sm:text-sm uppercase tracking-wider text-gray-400">
                    <th className="py-4 px-6">ERP Solution</th>
                    <th className="py-4 px-6">Monthly Subscription</th>
                    <th className="py-4 px-6">Implementation Cost</th>
                    <th className="py-4 px-6">Included Apps</th>
                    <th className="py-4 px-6">Free Forever Option</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                  <tr className="bg-purple-950/20 border-l-4 border-l-purple-500 font-semibold text-white">
                    <td className="py-4 px-6 text-purple-300 font-bold flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-400" /> BERAXIS AI
                    </td>
                    <td className="py-4 px-6 text-emerald-400 font-bold">$1.00 / month ($12/yr)</td>
                    <td className="py-4 px-6 text-emerald-400 font-bold">$0 (Self-Service 30s)</td>
                    <td className="py-4 px-6 text-gray-200">All 28 Enterprise Apps</td>
                    <td className="py-4 px-6 text-emerald-400 font-bold">✓ 1 App Free Forever</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-4 px-6 text-gray-300">Odoo Enterprise</td>
                    <td className="py-4 px-6 text-rose-400">$24.90 – $37.40 / user / mo</td>
                    <td className="py-4 px-6 text-rose-400">$5,000 – $25,000</td>
                    <td className="py-4 px-6 text-gray-400">Per-app or Enterprise only</td>
                    <td className="py-4 px-6 text-gray-500">Restricted (No accounting)</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-4 px-6 text-gray-300">QuickBooks Online + Addons</td>
                    <td className="py-4 px-6 text-rose-400">$85 – $200 / month</td>
                    <td className="py-4 px-6 text-rose-400">$1,000 – $3,000</td>
                    <td className="py-4 px-6 text-gray-400">Accounting only (Extra $ for POS/CRM)</td>
                    <td className="py-4 px-6 text-gray-500">✗ No Free Tier (14-Day Trial)</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-4 px-6 text-gray-300">NetSuite ERP</td>
                    <td className="py-4 px-6 text-rose-400">$999+ base + $99/user/mo</td>
                    <td className="py-4 px-6 text-rose-400">$15,000 – $50,000</td>
                    <td className="py-4 px-6 text-gray-400">Modular contract lock-in</td>
                    <td className="py-4 px-6 text-gray-500">✗ No Free Tier</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Core Feature Superpowers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="bg-[#0F172A]/70 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Double-Entry Accounting</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Complete GAAP/IFRS general ledger, automated trial balance, balance sheets, and real-time P&L with a 3-second AI receipt OCR scanner.
              </p>
            </div>

            <div className="bg-[#0F172A]/70 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">CRM & 25M+ B2B Leads</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Visual Kanban sales pipeline with 1,500 monthly pre-verified international B2B leads with direct phone numbers and verified emails.
              </p>
            </div>

            <div className="bg-[#0F172A]/70 border border-white/10 rounded-2xl p-6 hover:border-amber-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Package size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">POS & Smart Inventory</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                High-speed touch Point of Sale for retail and dining, barcode scanning, multi-warehouse stock routing, and automated low-stock reorder triggers.
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Frequently Asked Questions About Our Affordable Cloud ERP
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Everything you need to know about pricing, monthly plans, and features.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <HelpCircle size={16} className="text-cyan-400 shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div className="text-center rounded-3xl p-8 sm:p-12 border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#0F172A]/90 to-pink-950/40 shadow-2xl">
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
              Ready for an Affordable Cloud ERP That Actually Scales?
            </h2>
            <p className="text-gray-300 text-xs sm:text-base max-w-xl mx-auto mb-8">
              Join thousands of businesses replacing bloated $800/month SaaS stacks. Start free forever or lock in your $1/month Early Bird rate today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
              <Link href="/signup" className="galaxy-btn-primary !px-8 !py-3.5 text-sm">
                Start 1 App Free Forever
              </Link>
              <Link href="/pricing" className="galaxy-btn-secondary !px-8 !py-3.5 text-sm">
                View All Plans ($1/mo)
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
