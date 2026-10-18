import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { INDUSTRIES_MAP } from "@/lib/industryData";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  Globe,
  Flame,
  Zap
} from "lucide-react";

export const metadata: Metadata = {
  title: "Industry-Specific AI ERP & Business Operating Systems | Beraxis",
  description: "Explore tailored ERP, CRM, and POS blueprints for 12 global industries: padel clubs, dental clinics, artisan bakeries, auto workshops, real estate, and schools for $1/month.",
  keywords: [
    "industry ERP software",
    "vertical SaaS ERP",
    "padel club ERP",
    "dental clinic software",
    "bakery POS software",
    "auto workshop management",
    "real estate property ERP",
    "school management system",
    "manufacturing MRP cloud"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/industries",
  },
  openGraph: {
    title: "Industry-Specific AI ERP & Business Operating Systems | Beraxis",
    description: "Pre-configured operational blueprints, workflows, roles, and POS for 12 global industries. $1/month.",
    url: "https://www.beraxis.online/industries",
    siteName: "Beraxis",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "Beraxis 12 Global Industry Blueprints",
      },
    ],
  },
};

export default function IndustriesHubPage() {
  const industriesList = Object.values(INDUSTRIES_MAP);

  const hubSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Beraxis Industry-Specific AI ERP Blueprints",
    "description": "Tailored business management blueprints for padel clubs, dental clinics, bakeries, auto repair garages, real estate, and schools.",
    "itemListElement": industriesList.map((ind, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": ind.name,
      "url": `https://www.beraxis.online/industries/${ind.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }}
      />

      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-wider mb-6">
            <Sparkles size={14} className="text-purple-400" />
            <span>Vertical AI Operating Systems</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Tailored AI ERP Blueprints For <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">12 Global Industries</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed max-w-3xl mx-auto mb-8">
            One size never fits all. Rather than generic software bloat, Beraxis comes pre-engineered with the exact workflows, POS, KDS, court schedulers, tooth charts, and roles required by your specific trade.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <span className="text-xs px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Zero Configuration Headaches
            </span>
            <span className="text-xs px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 flex items-center gap-1.5">
              <Globe size={14} /> 25M+ Verified B2B Leads Built-In
            </span>
            <span className="text-xs px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-300 flex items-center gap-1.5">
              <Flame size={14} /> $1/Month Early Bird Special
            </span>
          </div>
        </div>

        {/* 12 Industries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {industriesList.map((ind) => (
            <div
              key={ind.slug}
              className="p-8 rounded-3xl bg-[#090D1A]/90 border border-white/10 hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:-translate-y-1 relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold text-purple-300 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                    {ind.badge}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {ind.operationModes.length} Modes
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {ind.name}
                </h2>
                <p className="text-xs text-purple-400 font-medium mb-4">{ind.tagline}</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-6 font-light line-clamp-3">
                  {ind.metaDescription}
                </p>

                <div className="space-y-2 mb-8">
                  {ind.keyFeatures.slice(0, 3).map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span className="line-clamp-1">{feat.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={`/industries/${ind.slug}`}
                className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all group-hover:border-purple-500/40"
              >
                <span>View {ind.name.split(" ")[0]} Blueprint</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-purple-950 via-[#0B0F19] to-pink-950 border border-purple-500/30 text-center shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Don&apos;t See Your Exact Business Type?
          </h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto mb-8 font-light">
            Beraxis includes the interactive Studio tool, allowing you to create custom fields, custom stages, and custom document prints for any unique commercial business model.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/pricing"
              className="galaxy-btn-primary !px-8 !py-3.5 text-sm font-bold inline-flex items-center gap-2"
            >
              <span>Deploy Early Bird Plan ($1/mo)</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/signup"
              className="px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-sm font-semibold"
            >
              Start Free Workspace
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
