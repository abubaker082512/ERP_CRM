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
  BarChart3
} from "lucide-react";

export const metadata: Metadata = {
  title: "Best Cheap ERP Software for Small Business (2026) | Free & $1/Mo · BERAXIS AI",
  description: "Looking for the best cheap ERP software for small business in 2026? BERAXIS AI replaces expensive tool sprawl with full double-entry accounting, CRM, POS, and inventory for $1/month or 1 App 100% Free Forever.",
  keywords: [
    "cheap erp for small business",
    "best cheap erp software for small business",
    "affordable erp for small business",
    "low cost erp for small business",
    "cheap cloud erp",
    "budget erp software 2026",
    "small business erp software",
    "free small business erp",
    "affordable cloud erp options with monthly subscription pricing",
    "BERAXIS AI"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/cheap-erp-for-small-business",
  },
  openGraph: {
    title: "Best Cheap ERP Software for Small Business (2026) | Free & $1/Mo · BERAXIS AI",
    description: "The #1 rated cheap ERP software for small business. Full accounting, CRM, POS, and inventory for $1/month.",
    url: "https://www.beraxis.online/cheap-erp-for-small-business",
    siteName: "BERAXIS AI",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "Best Cheap ERP Software for Small Business",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Cheap ERP Software for Small Business (2026) | Free & $1/Mo · BERAXIS AI",
    description: "The #1 rated cheap ERP software for small business. Full accounting, CRM, POS, and inventory for $1/month.",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
  },
};

const faqs = [
  {
    q: "Why do small businesses need a dedicated ERP instead of separate spreadsheets?",
    a: "Spreadsheets lack audit trails, cause inventory stockouts, fail double-entry tax compliance, and require manual copy-pasting. BERAXIS AI unifies your sales receipts, accounting ledgers, and inventory counts automatically in real time."
  },
  {
    q: "How does BERAXIS AI keep prices cheap without sacrificing enterprise features?",
    a: "We eliminated expensive implementation partners ($150/hr) by building 12 pre-configured industry blueprints that auto-configure your departments, roles, and registers in 1 click."
  },
  {
    q: "Can a small business start completely free?",
    a: "Yes. Our One App Free Forever tier lets any small business run 1 full module (such as Free Invoicing, Free CRM, or Free POS) with unlimited seats and zero credit card required."
  },
  {
    q: "What industries does this cheap small business ERP support?",
    a: "BERAXIS AI includes dedicated archetypes for Padel & Sports Clubs, Auto Repair Garages, Dental & Medical Clinics, Bakeries & Restaurants, Retail Shops, Real Estate, and Construction."
  }
];

export default function CheapErpForSmallBusinessPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "BERAXIS AI Cheap ERP for Small Business",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Small Business ERP Software",
        "operatingSystem": "Web, Cloud, iOS, Android",
        "description": "The best cheap ERP software for small businesses. GAAP accounting, CRM, POS, inventory, and B2B leads for $1/month.",
        "offers": {
          "@type": "Offer",
          "price": "1.00",
          "priceCurrency": "USD",
          "priceValidUntil": "2027-12-31"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-purple-400 font-semibold">Cheap ERP for Small Business</span>
          </div>

          <div className="text-center max-w-4xl mx-auto space-y-5 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-purple-400" />
              <span>Small Business Operations & Financial Core</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              The Best Cheap ERP Software for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                Small Business in 2026
              </span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
              Designed specifically for growing small businesses that need real GAAP accounting, fast touch POS, stock control, and CRM — without paying $20,000 consultant fees or $500/month software bills.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center pt-3">
              <Link
                href="/signup"
                className="galaxy-btn-primary !px-8 !py-4 text-sm font-extrabold flex items-center justify-center gap-2"
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

          {/* 3 Core Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-[#0F172A]/70 border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Zero Consultant Fees</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Choose your industry blueprint and launch with automated charts of accounts, roles, and tax settings in under 15 minutes.
              </p>
            </div>

            <div className="bg-[#0F172A]/70 border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3-Second AI Receipt OCR</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Drop supplier receipts and invoices directly into your ledger. AI extracts totals, taxes, and line items automatically.
              </p>
            </div>

            <div className="bg-[#0F172A]/70 border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Unlimited User Seats</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Never pay penalties when your team grows. Add cashiers, accountants, and sales reps with granular role permissions for free.
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-8">
              Frequently Asked Questions About Small Business ERP
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <HelpCircle size={16} className="text-purple-400 shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Banner */}
          <div className="text-center rounded-3xl p-8 sm:p-12 border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#0F172A]/90 to-pink-950/40">
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
              Upgrade Your Small Business Operations Today
            </h2>
            <p className="text-gray-300 text-xs sm:text-base max-w-xl mx-auto mb-8">
              No credit card required. Pick any 1 app 100% free forever, or unlock all 28 modules for $1/month.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
              <Link href="/signup" className="galaxy-btn-primary !px-8 !py-3.5 text-sm">
                Start 1 App Free Forever
              </Link>
              <Link href="/pricing" className="galaxy-btn-secondary !px-8 !py-3.5 text-sm">
                Claim $1/Mo Early Bird Deal
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
