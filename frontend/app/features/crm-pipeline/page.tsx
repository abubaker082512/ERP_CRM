import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Users, Globe, Zap, CheckCircle2, ArrowRight, Sparkles, MessageSquare, BarChart3, Filter, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Free AI CRM Pipeline & Lead Management Software | Beraxis",
  description: "Accelerate deal velocity with Beraxis Free AI CRM. Includes visual Kanban stages, automated WhatsApp sync, and built-in global verified B2B leads for $1/month.",
  keywords: [
    "Free CRM",
    "Free CRM software",
    "Free AI CRM pipeline",
    "Free B2B CRM software",
    "lead pipeline management",
    "Free CRM with leads pool",
    "Kanban deal tracking",
    "automated sales pipeline",
    "small business CRM",
    "HubSpot free alternative",
    "Beraxis CRM"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/features/crm-pipeline",
  },
  openGraph: {
    title: "AI CRM Pipeline & Lead Management Software | Beraxis",
    description: "Close deals 30% faster with interactive Kanban, voice notes, WhatsApp sync, and verified B2B contacts built-in.",
    url: "https://www.beraxis.online/features/crm-pipeline",
    siteName: "Beraxis",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "Beraxis AI CRM Pipeline Preview",
      },
    ],
  },
};

export default function CrmPipelineFeaturePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does the Beraxis CRM differ from traditional CRMs like HubSpot or Salesforce?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Unlike HubSpot which charges escalating monthly fees per contact and locks sales pipelines behind enterprise tiers, Beraxis includes unlimited user seats, full visual Kanban automation, and a native B2B Leads Directory for just $1/month."
        }
      },
      {
        "@type": "Question",
        "name": "Can I import leads directly from the Leads Pool into my pipeline?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Search by industry, country, or job title in the Leads Pool, and click 'Import to CRM'. All verified corporate emails, direct dials, and company details populate immediately into your New Opportunity stage."
        }
      },
      {
        "@type": "Question",
        "name": "Does Beraxis CRM connect directly to invoicing and inventory?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. When an opportunity reaches 'Won', Beraxis can automatically generate a quote, sales order, or invoice, reserve warehouse stock, and log accounting journal entries with zero manual double data entry."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
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
        "name": "Features",
        "item": "https://www.beraxis.online/features"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "CRM Pipeline",
        "item": "https://www.beraxis.online/features/crm-pipeline"
      }
    ]
  };

  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb nav */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/features" className="hover:text-white">Features</Link>
          <span>/</span>
          <span className="text-purple-400">CRM Pipeline</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-300 uppercase tracking-wider mb-6">
            <Users size={14} className="text-blue-400" /> Autonomous Sales Cockpit
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            AI-Powered CRM Pipeline With Built-In <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">Global Leads</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed mb-8 max-w-3xl mx-auto">
            Stop switching between HubSpot, Apollo, and messy spreadsheets. Track high-value deals with drag-and-drop Kanban, AI opportunity scoring, WhatsApp sync, and 1-click global lead imports.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/pricing" className="galaxy-btn-primary !px-8 !py-4 text-base font-bold shadow-xl shadow-blue-500/25 flex items-center gap-2">
              Claim Early Bird ($1/mo) <ArrowRight size={16} />
            </Link>
            <Link href="/leads-pool" className="px-7 py-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-base transition-all flex items-center gap-2">
              <Globe size={16} /> Explore B2B Leads
            </Link>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="galaxy-card p-8 bg-[#0F172A]/40 border-white/10 hover:border-blue-500/40 transition-all rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Interactive Drag &amp; Drop Kanban</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Visualize deals across custom stages (New, Qualified, Proposition, Won, Lost). Track weighted pipeline revenue in real-time and automate next steps.
            </p>
          </div>

          <div className="galaxy-card p-8 bg-[#0F172A]/40 border-white/10 hover:border-cyan-500/40 transition-all rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
              <Globe size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Native B2B Leads Directory</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Zero add-on subscription fees. Search decision-makers by country, revenue, and industry, then import verified phone numbers and emails straight into your funnel.
            </p>
          </div>

          <div className="galaxy-card p-8 bg-[#0F172A]/40 border-white/10 hover:border-purple-500/40 transition-all rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
              <MessageSquare size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">WhatsApp &amp; Voice Sync</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Log call outcomes by voice note and automatically sync WhatsApp conversation histories so your entire sales team stays aligned on deal context.
            </p>
          </div>
        </div>

        {/* Feature Highlights Table */}
        <div className="bg-[#0b0e17]/90 border border-white/10 rounded-3xl p-8 sm:p-12 mb-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-8 text-center">
            Complete CRM Capability Matrix
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Multi-Currency Deal Valuations",
              "AI Win Probability Scoring",
              "Automatic Quotation Generator",
              "1-Click Leads Import",
              "Customer Activity Audit Logs",
              "Team Commission Split Tracking",
              "Omnichannel Email & WhatsApp Threads",
              "Full Double-Entry GL Integration",
              "Custom Custom-Fields Studio"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span className="text-sm text-gray-200 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqSchema.mainEntity.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#0F172A]/60 border border-white/10">
                <h3 className="text-base font-bold text-white mb-2">{faq.name}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="text-center p-12 rounded-3xl bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-pink-950/60 border border-blue-500/30">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Accelerate Your Sales Funnel?
          </h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto mb-6">
            Get instant access to the CRM pipeline, Global B2B Leads Directory, and all 28 ERP modules for just $1/month.
          </p>
          <Link href="/pricing" className="galaxy-btn-primary !px-8 !py-3.5 text-sm font-bold inline-flex items-center gap-2">
            Get Started Now ($1/mo) <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
