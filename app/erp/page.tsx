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
  Scale
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cloud ERP Software | Best Free & Affordable ERP System 2026 | Beraxis",
  description: "Beraxis is the premier AI Cloud ERP software. Unify 28 enterprise modules: double-entry accounting, multi-warehouse inventory, touch POS, HRMS payroll, and CRM for just $1/month. Start 1 app 100% free forever.",
  keywords: [
    "ERP",
    "ERP software",
    "Cloud ERP",
    "Free ERP",
    "Best ERP",
    "Best ERP software 2026",
    "Enterprise Resource Planning",
    "Small business ERP",
    "Affordable ERP",
    "AI ERP system",
    "ERP and CRM",
    "Odoo alternative ERP",
    "NetSuite alternative",
    "SAP alternative for SMB",
    "Open source ERP cloud",
    "Beraxis ERP"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/erp",
  },
  openGraph: {
    title: "Best Cloud ERP Software 2026 | Free ERP System | Beraxis",
    description: "Replace complex, expensive ERPs like SAP and NetSuite. Full-suite Cloud ERP with 28 unified modules, AI copilot, and 25M+ B2B leads for $1/month.",
    url: "https://www.beraxis.online/erp",
    siteName: "Beraxis",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "Beraxis Cloud ERP Software Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloud ERP Software | Free & Affordable ERP 2026 | Beraxis",
    description: "Unify accounting, inventory, POS, HR, and CRM in one autonomous cloud ERP for $1/month.",
    images: ["https://www.beraxis.online/og-image.png"],
  },
};

export default function ErpLandingPage() {
  const erpSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.beraxis.online"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "ERP Software",
            "item": "https://www.beraxis.online/erp"
          }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Beraxis Cloud ERP",
        "operatingSystem": "Cloud, Web, iOS, Android",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Enterprise Resource Planning (ERP)",
        "description": "Autonomous cloud ERP system unifying 28 modules: financial accounting, multi-warehouse inventory, POS, manufacturing, HRMS, and CRM for $1/month.",
        "offers": [
          {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD",
            "description": "Forever Free Tier: 1 full ERP module with unlimited users and zero credit card required."
          },
          {
            "@type": "Offer",
            "price": "1.00",
            "priceCurrency": "USD",
            "description": "Early Bird Plan: $1/seat/month ($12 billed annually) unlocking all 28 ERP modules + 1,500 lead credits/month."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is an ERP (Enterprise Resource Planning) system?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "An ERP (Enterprise Resource Planning) system is a unified software platform that connects and automates core business operations across an entire organization, including double-entry accounting, warehouse inventory, sales, purchasing, human resources, point of sale, and customer relationships."
            }
          },
          {
            "@type": "Question",
            "name": "Why is Beraxis the best cloud ERP for small and mid-sized businesses?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Unlike traditional ERP systems like SAP, Oracle, and NetSuite (which cost tens of thousands of dollars and take months to implement) or Odoo (which charges high fees per module), Beraxis delivers an autonomous, modern cloud ERP with 28 unified modules for just $1.00 per month."
            }
          },
          {
            "@type": "Question",
            "name": "Can I use Beraxis ERP for free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Beraxis offers a 100% Forever Free Tier that lets any business deploy any single complete ERP module—such as Accounting, POS, Inventory, or CRM—with unlimited user seats and zero credit card required."
            }
          },
          {
            "@type": "Question",
            "name": "What modules are included in Beraxis Cloud ERP?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Beraxis ERP includes 28 unified modules: Double-Entry General Ledger, Invoicing, Multi-Warehouse Inventory, Barcode Tracking, Touch POS, Sales Quotations, Purchasing & RFQs, Manufacturing MRP, HRMS Attendance & Payroll, AI Voice Pilot, and an integrated 25M+ B2B Leads Directory."
            }
          }
        ]
      }
    ]
  };

  const ERP_MODULES = [
    {
      title: "Double-Entry Accounting & Ledger",
      desc: "Audit-ready balance sheets, profit & loss statements, automated bank reconciliation, and automated tax calculations.",
      icon: BarChart3,
      badge: "Finance"
    },
    {
      title: "Multi-Warehouse Inventory",
      desc: "Real-time stock valuation, automated reorder thresholds, barcode & serial tracking, and multi-location transfers.",
      icon: Package,
      badge: "Supply Chain"
    },
    {
      title: "Omnichannel Touch POS",
      desc: "High-speed retail and restaurant point-of-sale supporting barcode scanners, receipt printers, and offline cash drawers.",
      icon: ShoppingCart,
      badge: "Commerce"
    },
    {
      title: "Manufacturing & MRP",
      desc: "Multi-level Bills of Materials (BOM), work center routing, production scheduling, and raw material cost allocation.",
      icon: Layers,
      badge: "Production"
    },
    {
      title: "HRMS & Payroll Management",
      desc: "Biometric attendance tracking, employee leave approvals, salary slips, and multi-tier organizational charts.",
      icon: Users,
      badge: "People"
    },
    {
      title: "Built-In AI Voice Pilot",
      desc: "Command your ERP hands-free using natural conversational voice commands to generate invoices and query stock levels in real time.",
      icon: Sparkles,
      badge: "AI Copilot"
    }
  ];

  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(erpSchema) }}
      />

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-purple-600/15 via-pink-600/10 to-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="text-center max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-wider mb-6 shadow-lg shadow-purple-500/10 backdrop-blur-md">
            <Sparkles size={14} className="text-purple-400" />
            <span>Next-Generation Cloud ERP</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-[4rem] font-black tracking-tight text-white mb-6 leading-[1.1]">
            The All-in-One{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              Cloud ERP Software
            </span>
            <span className="block mt-2 text-2xl sm:text-4xl text-gray-200 font-bold">
              Built to Scale Your Business Without SaaS Bloat
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            Replace complex, million-dollar ERP systems like SAP, NetSuite, and Odoo. Run Accounting, Inventory, POS, Manufacturing, and HRMS across 28 unified modules for just <strong className="text-white font-bold">$1/month</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/signup"
              className="galaxy-btn-primary !px-8 !py-4 text-sm font-black w-full sm:w-auto inline-flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30"
            >
              <span>Start Free ERP — 1 App Free Forever</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/pricing"
              className="px-7 py-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 hover:from-purple-900/60 hover:to-pink-900/60 border border-purple-500/30 text-purple-200 text-sm font-bold w-full sm:w-auto inline-flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Flame size={16} className="text-amber-400" />
              <span>Get All 28 Apps for $1/mo</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> No Credit Card Required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> Instant 30-Second Cloud Setup</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> 14-Day Money-Back Guarantee</span>
          </div>
        </div>
      </section>

      {/* Core ERP Modules Breakdown */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Everything Your Enterprise Needs in One ERP
          </h2>
          <p className="text-sm sm:text-base text-gray-300 font-light">
            Stop stitching together 5 different software subscriptions. Beraxis natively integrates all core operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ERP_MODULES.map((mod, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#090D1A]/90 border border-white/10 hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                    {mod.badge}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <mod.icon size={16} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                  {mod.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison: Traditional ERP vs Beraxis Cloud ERP */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0F172A]/70 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">Cost &amp; Complexity Breakdown</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Traditional ERP vs. Beraxis Cloud ERP</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="pb-4 font-semibold">Capability</th>
                  <th className="pb-4 font-semibold text-red-400">Traditional ERP (SAP / NetSuite / Odoo)</th>
                  <th className="pb-4 font-semibold text-emerald-400">Beraxis Cloud ERP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-4 font-medium text-white">Monthly Subscription Cost</td>
                  <td className="py-4 text-red-300 font-mono line-through">$150 – $800 / user / mo</td>
                  <td className="py-4 text-emerald-300 font-bold font-mono">$1.00 / mo ($12/yr flat)</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-white">Free Forever Option</td>
                  <td className="py-4 text-gray-400">14-day trial or limited community</td>
                  <td className="py-4 text-emerald-300 font-bold">1 App 100% Free Forever</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-white">Implementation Time</td>
                  <td className="py-4 text-gray-400">3 to 9 months with consultants</td>
                  <td className="py-4 text-emerald-300 font-bold">Instant 30-Second Cloud Setup</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-white">Integrated B2B Leads Pool</td>
                  <td className="py-4 text-red-400">None (Requires Apollo / ZoomInfo $99/mo)</td>
                  <td className="py-4 text-emerald-300 font-bold">25M+ Verified Leads Built-In</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-white">Autonomous AI Voice Copilot</td>
                  <td className="py-4 text-gray-400">Complex add-on or unavailable</td>
                  <td className="py-4 text-emerald-300 font-bold">Included on All Screens</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle size={14} />
            <span>ERP FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Frequently Asked Questions About Cloud ERP
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#090D1A] border border-white/10">
            <h3 className="text-base font-bold text-white mb-2">What is an ERP system?</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              An ERP (Enterprise Resource Planning) system unifies all critical business workflows—including accounting, inventory, purchasing, POS, manufacturing, and HRMS—into a single database so company leadership and team members operate on synchronized, real-time data.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#090D1A] border border-white/10">
            <h3 className="text-base font-bold text-white mb-2">Why is Cloud ERP better than on-premise ERP?</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              Cloud ERP eliminates expensive server hardware, manual database backups, and costly IT maintenance. Beraxis Cloud ERP updates automatically, secures all tenant databases with row-level encryption, and is accessible from any web browser or mobile device anywhere in the world.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#090D1A] border border-white/10">
            <h3 className="text-base font-bold text-white mb-2">Can small businesses use Beraxis ERP for free?</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              Yes! Our Forever Free Tier allows small businesses to pick any 1 full ERP module (such as Accounting, POS, or Inventory) and use it forever with unlimited team members. When your business is ready to expand, you can upgrade to unlock all 28 modules for only $1.00/month.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-purple-950 via-[#0B0F19] to-pink-950 border border-purple-500/40 text-center shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Ready to Run Your Business on the World&apos;s Fastest Cloud ERP?
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mb-8 font-light">
            Join thousands of modern enterprises scaling with Beraxis. Zero setup fees, zero long-term contracts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="galaxy-btn-primary !px-8 !py-4 text-sm font-bold inline-flex items-center gap-2"
            >
              <span>Deploy 1 App Free Forever</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/pricing"
              className="px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold"
            >
              Unlock All 28 Apps for $1/mo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
