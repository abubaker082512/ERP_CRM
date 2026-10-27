import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Globe,
  Zap,
  Flame,
  MessageSquare,
  BarChart3,
  Filter,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
  Target
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI CRM Software | Best Free & Affordable CRM System 2026 | Beraxis",
  description: "Beraxis is the premier AI CRM software for growing sales teams. Visual Kanban deal pipelines, automated WhatsApp sync, and built-in global verified B2B leads directory for just $1/month. Start 100% free.",
  keywords: [
    "CRM",
    "CRM software",
    "AI CRM",
    "Free CRM",
    "Best CRM",
    "Best CRM software 2026",
    "Sales CRM",
    "B2B CRM software",
    "Small business CRM",
    "Affordable CRM",
    "CRM with leads pool",
    "Kanban sales pipeline",
    "HubSpot alternative CRM",
    "Salesforce alternative CRM",
    "Zoho CRM alternative",
    "Beraxis CRM"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/crm-software",
  },
  openGraph: {
    title: "Best AI CRM Software 2026 | Free Sales CRM System | Beraxis",
    description: "Close deals 30% faster. Unified visual Kanban stages, automated WhatsApp sync, and verified B2B contacts built-in for $1/month.",
    url: "https://www.beraxis.online/crm-software",
    siteName: "Beraxis",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "Beraxis AI CRM Software Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI CRM Software | Free Sales CRM System 2026 | Beraxis",
    description: "Close more deals with visual Kanban stages, automated WhatsApp messaging, and built-in B2B leads for $1/month.",
    images: ["https://www.beraxis.online/og-image.png"],
  },
};

export default function CrmSoftwareLandingPage() {
  const crmSchema = {
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
            "name": "CRM Software",
            "item": "https://www.beraxis.online/crm-software"
          }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Beraxis AI CRM Software",
        "operatingSystem": "Cloud, Web, iOS, Android",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Customer Relationship Management (CRM)",
        "description": "Autonomous AI CRM software unifying visual Kanban sales pipelines, verified B2B leads directory, automated WhatsApp messaging, and quotation generation for $1/month.",
        "offers": [
          {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD",
            "description": "Forever Free Tier: Full AI CRM module with unlimited contacts, deals, and users."
          },
          {
            "@type": "Offer",
            "price": "1.00",
            "priceCurrency": "USD",
            "description": "Early Bird Plan: $1/seat/month ($12 billed annually) unlocking all 28 modules + 1,500 lead credits/month."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is a CRM (Customer Relationship Management) system?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "A CRM (Customer Relationship Management) system is software that tracks, organizes, and nurtures interactions with prospects and customers. It records communication histories, manages visual sales pipelines, tracks deals through Kanban stages, and forecasts monthly revenue."
            }
          },
          {
            "@type": "Question",
            "name": "How does Beraxis CRM compare to HubSpot and Salesforce?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "HubSpot and Salesforce charge escalating penalties as your contact list grows, often reaching hundreds of dollars per user per month. Beraxis CRM provides unlimited contacts, unlimited deals, and a native verified B2B leads directory for just $1.00 per month."
            }
          },
          {
            "@type": "Question",
            "name": "Can I use Beraxis CRM for free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Beraxis offers a Forever Free Tier that lets you deploy the full CRM module with unlimited user seats, visual Kanban stages, and contact histories with zero credit card required."
            }
          },
          {
            "@type": "Question",
            "name": "Does Beraxis CRM have built-in B2B lead generation?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Beraxis includes a global directory of over 25,000,000 verified decision-maker emails and direct phone dials. You can search by country, industry, or job title and import prospects directly into your sales pipeline with a single click."
            }
          }
        ]
      }
    ]
  };

  const CRM_FEATURES = [
    {
      title: "Visual Kanban Sales Pipeline",
      desc: "Drag-and-drop opportunities through Qualified, Proposition, Won, and Lost stages with automated probability forecasting.",
      icon: Target,
      badge: "Deals"
    },
    {
      title: "Global B2B Leads Directory",
      desc: "Instant 1-click import of verified corporate decision-makers, direct phone dials, and validated business emails into your pipeline.",
      icon: Globe,
      badge: "Lead Gen"
    },
    {
      title: "Automated WhatsApp & Email Sync",
      desc: "Communicate directly with clients via WhatsApp and two-way email tracking so your sales reps never miss a critical follow-up.",
      icon: MessageSquare,
      badge: "Messaging"
    },
    {
      title: "1-Click Quotation & Invoice Generation",
      desc: "Convert won CRM opportunities into signed customer sales orders and accounting invoices instantly without manual re-entry.",
      icon: Zap,
      badge: "Speed"
    },
    {
      title: "Activity & Task Automation",
      desc: "Schedule automated calls, client meetings, product demos, and deadline reminders with calendar synchronization.",
      icon: Users,
      badge: "Productivity"
    },
    {
      title: "AI Revenue Forecasting & Analytics",
      desc: "Real-time conversion rates, sales rep performance leaderboards, and projected monthly recurring revenue (MRR) insights.",
      icon: BarChart3,
      badge: "Intelligence"
    }
  ];

  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crmSchema) }}
      />

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-purple-600/10 to-pink-500/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="text-center max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-300 uppercase tracking-wider mb-6 shadow-lg shadow-blue-500/10 backdrop-blur-md">
            <Sparkles size={14} className="text-blue-400" />
            <span>High-Velocity Sales CRM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-[4rem] font-black tracking-tight text-white mb-6 leading-[1.1]">
            The All-in-One{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              AI CRM Software
            </span>
            <span className="block mt-2 text-2xl sm:text-4xl text-gray-200 font-bold">
              With Verified B2B Leads Built-In
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            Stop paying $150/mo to HubSpot or Salesforce. Manage your entire sales pipeline with drag-and-drop Kanban, automated WhatsApp messaging, and verified corporate leads for just <strong className="text-white font-bold">$1/month</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/signup"
              className="galaxy-btn-primary !px-8 !py-4 text-sm font-black w-full sm:w-auto inline-flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30"
            >
              <span>Start Free CRM — Unlimited Users</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/pricing"
              className="px-7 py-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 hover:from-purple-900/60 hover:to-pink-900/60 border border-purple-500/30 text-purple-200 text-sm font-bold w-full sm:w-auto inline-flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Flame size={16} className="text-amber-400" />
              <span>Get CRM + All 28 Apps for $1/mo</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> Unlimited Contacts &amp; Deals</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> 1,500 Lead Credits/mo Included</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> 14-Day Money-Back Guarantee</span>
          </div>
        </div>
      </section>

      {/* CRM Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Engineered to Help Your Sales Team Win Deals Faster
          </h2>
          <p className="text-sm sm:text-base text-gray-300 font-light">
            Every feature you need to find, track, nurture, and close business clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CRM_FEATURES.map((feat, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#090D1A]/90 border border-white/10 hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
                    {feat.badge}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <feat.icon size={16} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison: HubSpot & Salesforce vs Beraxis CRM */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0F172A]/70 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">Cost &amp; Feature Comparison</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">HubSpot / Salesforce vs. Beraxis AI CRM</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="pb-4 font-semibold">Feature</th>
                  <th className="pb-4 font-semibold text-red-400">HubSpot / Salesforce</th>
                  <th className="pb-4 font-semibold text-emerald-400">Beraxis AI CRM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-4 font-medium text-white">Monthly Subscription</td>
                  <td className="py-4 text-red-300 font-mono line-through">$150 – $300 / user / mo</td>
                  <td className="py-4 text-emerald-300 font-bold font-mono">$1.00 / mo ($12/yr flat)</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-white">Contact Tier Limits</td>
                  <td className="py-4 text-red-400">Penalties after 1,000 contacts</td>
                  <td className="py-4 text-emerald-300 font-bold">Unlimited Contacts</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-white">Verified B2B Leads Pool</td>
                  <td className="py-4 text-gray-400">Not included ($99/mo third-party)</td>
                  <td className="py-4 text-emerald-300 font-bold">Global Leads Included</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-white">Direct ERP &amp; Invoicing Sync</td>
                  <td className="py-4 text-gray-400">Requires expensive integrations</td>
                  <td className="py-4 text-emerald-300 font-bold">1-Click Invoice &amp; Ledger Sync</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle size={14} />
            <span>CRM FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Frequently Asked Questions About AI CRM
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#090D1A] border border-white/10">
            <h3 className="text-base font-bold text-white mb-2">What is a CRM system and how does it help sales?</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              A CRM (Customer Relationship Management) system organizes all customer records, tracks communication histories, and provides visual drag-and-drop Kanban deal pipelines. It helps sales teams identify high-intent leads, follow up promptly, and close deals 30% faster.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#090D1A] border border-white/10">
            <h3 className="text-base font-bold text-white mb-2">Can I import leads directly into my sales stages?</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              Yes! You can search the built-in B2B Leads Directory by country, industry, or job title, and import verified prospects directly into your New Opportunity stage with one click.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#090D1A] border border-white/10">
            <h3 className="text-base font-bold text-white mb-2">Is there really an AI CRM for $1 per month?</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              Yes! Our Early Bird Plan costs just $1.00 per month ($12 billed annually) and unlocks the complete CRM pipeline, 1,500 lead search credits each month, and all 27 other enterprise modules (Accounting, POS, Inventory, HRMS, etc.).
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-blue-950 via-[#0B0F19] to-purple-950 border border-blue-500/40 text-center shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Accelerate Your Sales Pipeline With Beraxis CRM
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mb-8 font-light">
            Deploy your visual Kanban stages, search verified corporate leads, and close more deals starting today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="galaxy-btn-primary !px-8 !py-4 text-sm font-bold inline-flex items-center gap-2"
            >
              <span>Deploy Free CRM Forever</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/pricing"
              className="px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold"
            >
              Get CRM + All 28 Apps for $1/mo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
