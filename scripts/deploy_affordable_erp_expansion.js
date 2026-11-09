const fs = require('fs');
const path = require('path');

function syncFile(relPath) {
  const src = path.join(__dirname, '..', 'frontend', relPath);
  const dest = path.join(__dirname, '..', relPath);
  if (fs.existsSync(src)) {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dest, fs.readFileSync(src, 'utf8'), 'utf8');
    console.log(`[SYNCED] frontend/${relPath} -> ${relPath}`);
  }
}

// -------------------------------------------------------------
// 1. UPDATE INDUSTRY DATA (Padel Club CRM & Management Software)
// -------------------------------------------------------------
console.log('1. Updating padel-clubs in frontend/lib/industryData.ts with double quotes...');
let indData = fs.readFileSync(path.join(__dirname, '../frontend/lib/industryData.ts'), 'utf8');

indData = indData.replace(
  `h1: "ERP for Padel Clubs & Sports Centers",`,
  `h1: "Padel Club Management Software & CRM",`
);
indData = indData.replace(
  `metaTitle: "ERP for Padel Clubs & Sports Centers | Beraxis AI",`,
  `metaTitle: "Padel Club Management Software & CRM | Court Bookings, Pro Shop POS & Memberships · BERAXIS AI",`
);
indData = indData.replace(
  `metaDescription: "Streamline court booking calendars, padel racket rental POS, tournament ladders, and recurring membership billing. Automated sports club ERP for $1/month.",`,
  `metaDescription: "The #1 CRM and management software for padel clubs & sports centers. Real-time court bookings, 4-way split bills, pro-shop POS, and member subscriptions for $1/month.",`
);
indData = indData.replace(
  `keywords: [\n      "ERP for padel clubs",`,
  `keywords: [\n      "CRM for padel club",\n      "padel club management software",\n      "padel club CRM",\n      "padel court booking software",\n      "ERP for padel clubs",`
);
indData = indData.replace(
  `keywords: [\r\n      "ERP for padel clubs",`,
  `keywords: [\r\n      "CRM for padel club",\r\n      "padel club management software",\r\n      "padel club CRM",\r\n      "padel court booking software",\r\n      "ERP for padel clubs",`
);

fs.writeFileSync(path.join(__dirname, '../frontend/lib/industryData.ts'), indData, 'utf8');
syncFile('lib/industryData.ts');

// -------------------------------------------------------------
// 2. CREATE PAGE 1: /affordable-cloud-erp/page.tsx
// -------------------------------------------------------------
console.log('2. Creating frontend/app/affordable-cloud-erp/page.tsx...');
const affordableCloudErpDir = path.join(__dirname, '../frontend/app/affordable-cloud-erp');
if (!fs.existsSync(affordableCloudErpDir)) fs.mkdirSync(affordableCloudErpDir, { recursive: true });

const affordableCloudErpContent = `import { Metadata } from "next";
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
              Stop paying \$800+/month for fragmented business software and \$25,000 consultant onboarding fees. BERAXIS AI unifies double-entry accounting, CRM, POS, and inventory across 28 modules for <strong>just \$1/month</strong> — with <strong>1 App 100% Free Forever</strong>.
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
`;

fs.writeFileSync(path.join(affordableCloudErpDir, 'page.tsx'), affordableCloudErpContent, 'utf8');
syncFile('app/affordable-cloud-erp/page.tsx');

// -------------------------------------------------------------
// 3. CREATE PAGE 2: /one-dollar-erp/page.tsx
// -------------------------------------------------------------
console.log('3. Creating frontend/app/one-dollar-erp/page.tsx...');
const oneDollarErpDir = path.join(__dirname, '../frontend/app/one-dollar-erp');
if (!fs.existsSync(oneDollarErpDir)) fs.mkdirSync(oneDollarErpDir, { recursive: true });

const oneDollarErpContent = `import { Metadata } from "next";
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
              Why pay \$300/month for HubSpot and \$85/month for QuickBooks? BERAXIS AI gives you all 28 enterprise apps — double-entry accounting, CRM, POS, multi-warehouse stock, and 1,500 lead credits — for <strong>\$1/month</strong> ($12 billed annually) or 1 App Free Forever.
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
`;

fs.writeFileSync(path.join(oneDollarErpDir, 'page.tsx'), oneDollarErpContent, 'utf8');
syncFile('app/one-dollar-erp/page.tsx');

// -------------------------------------------------------------
// 4. CREATE PAGE 3: /cheap-erp-for-small-business/page.tsx
// -------------------------------------------------------------
console.log('4. Creating frontend/app/cheap-erp-for-small-business/page.tsx...');
const cheapErpDir = path.join(__dirname, '../frontend/app/cheap-erp-for-small-business');
if (!fs.existsSync(cheapErpDir)) fs.mkdirSync(cheapErpDir, { recursive: true });

const cheapErpContent = `import { Metadata } from "next";
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
              Designed specifically for growing small businesses that need real GAAP accounting, fast touch POS, stock control, and CRM — without paying \$20,000 consultant fees or \$500/month software bills.
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
`;

fs.writeFileSync(path.join(cheapErpDir, 'page.tsx'), cheapErpContent, 'utf8');
syncFile('app/cheap-erp-for-small-business/page.tsx');

// -------------------------------------------------------------
// 5. UPDATE GALAXYAPPSHELL (isPublic whitelist)
// -------------------------------------------------------------
console.log('5. Updating GalaxyAppShell.tsx...');
let shell = fs.readFileSync(path.join(__dirname, '../frontend/components/layout/GalaxyAppShell.tsx'), 'utf8');

shell = shell.replace(
  `        pathname.startsWith('/compare') ||`,
  `        pathname.startsWith('/compare') ||\n        pathname.startsWith('/affordable-cloud-erp') ||\n        pathname.startsWith('/one-dollar-erp') ||\n        pathname.startsWith('/cheap-erp-for-small-business') ||`
);
shell = shell.replace(
  `        pathname.startsWith('/compare') ||\r\n`,
  `        pathname.startsWith('/compare') ||\r\n        pathname.startsWith('/affordable-cloud-erp') ||\r\n        pathname.startsWith('/one-dollar-erp') ||\r\n        pathname.startsWith('/cheap-erp-for-small-business') ||\r\n`
);

fs.writeFileSync(path.join(__dirname, '../frontend/components/layout/GalaxyAppShell.tsx'), shell, 'utf8');
syncFile('components/layout/GalaxyAppShell.tsx');

// -------------------------------------------------------------
// 6. UPDATE SITEMAP.TS (Add the 3 new URLs)
// -------------------------------------------------------------
console.log('6. Updating sitemap.ts with new high-priority routes...');
let sitemapFile = fs.readFileSync(path.join(__dirname, '../frontend/app/sitemap.ts'), 'utf8');

sitemapFile = sitemapFile.replace(
  `    { url: \`\${baseUrl}/pricing\`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },`,
  `    { url: \`\${baseUrl}/pricing\`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },\n    { url: \`\${baseUrl}/affordable-cloud-erp\`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },\n    { url: \`\${baseUrl}/one-dollar-erp\`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },\n    { url: \`\${baseUrl}/cheap-erp-for-small-business\`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },`
);
sitemapFile = sitemapFile.replace(
  `    { url: \`\${baseUrl}/pricing\`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },\r\n`,
  `    { url: \`\${baseUrl}/pricing\`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },\r\n    { url: \`\${baseUrl}/affordable-cloud-erp\`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },\r\n    { url: \`\${baseUrl}/one-dollar-erp\`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },\r\n    { url: \`\${baseUrl}/cheap-erp-for-small-business\`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },\r\n`
);

fs.writeFileSync(path.join(__dirname, '../frontend/app/sitemap.ts'), sitemapFile, 'utf8');
syncFile('app/sitemap.ts');

// -------------------------------------------------------------
// 7. UPDATE FOOTER.TSX (Add links to new affordable ERP pages)
// -------------------------------------------------------------
console.log('7. Updating footer links...');
let footer = fs.readFileSync(path.join(__dirname, '../frontend/components/landing/Footer.tsx'), 'utf8');

const target1 = '<Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing ($1/mo Plan)</Link>';
const repl1 = '<Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing ($1/mo Plan)</Link>\n                        <Link href="/affordable-cloud-erp" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Affordable Cloud ERP</Link>\n                        <Link href="/one-dollar-erp" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">$1 ERP</Link>';

const target2 = '<li><Link href="/donate" className="hover:text-rose-300 font-semibold text-rose-400">💙 Donate to Beraxis</Link></li>';
const repl2 = '<li><Link href="/donate" className="hover:text-rose-300 font-semibold text-rose-400">💙 Donate to Beraxis</Link></li>\n                            <li className="pt-3 border-t border-white/5"><span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Affordable ERP</span></li>\n                            <li><Link href="/affordable-cloud-erp" className="hover:text-emerald-300 font-semibold text-emerald-400">⚡ Affordable Cloud ERP ($1/mo)</Link></li>\n                            <li><Link href="/one-dollar-erp" className="hover:text-cyan-300 font-semibold text-cyan-400">$1 Dollar ERP</Link></li>\n                            <li><Link href="/cheap-erp-for-small-business" className="hover:text-purple-300 font-semibold text-purple-400">Cheap ERP for Small Business</Link></li>';

if (footer.includes(target1)) {
  footer = footer.replace(target1, repl1);
}
if (footer.includes(target2)) {
  footer = footer.replace(target2, repl2);
}

fs.writeFileSync(path.join(__dirname, '../frontend/components/landing/Footer.tsx'), footer, 'utf8');
syncFile('components/landing/Footer.tsx');

console.log('ALL EXPANSION UPDATES COMPLETED.');
