import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { COMPARISONS, ComparisonItem } from "@/lib/comparisonData";
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  X, 
  ShieldCheck, 
  Flame, 
  Zap, 
  CheckCircle, 
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  DollarSign
} from "lucide-react";

interface CompareSlugProps {
  params: Promise<{
    slug: string;
  }>;
}

const SLUG_ALIASES: Record<string, string> = {
  "hubspot": "hubspot-alternative",
  "hubspot-vs-beraxis": "hubspot-alternative",
  "odoo": "odoo-alternative",
  "odoo-vs-beraxis": "odoo-alternative",
  "quickbooks": "quickbooks-alternative",
  "quickbooks-vs-beraxis": "quickbooks-alternative",
  "traditional-erp": "traditional-erp-vs-beraxis",
  "sap-alternative": "traditional-erp-vs-beraxis",
  "netsuite-alternative": "traditional-erp-vs-beraxis",
  "sap-vs-beraxis": "traditional-erp-vs-beraxis",
  "netsuite-vs-beraxis": "traditional-erp-vs-beraxis",
  "toast-alternative": "toast-square-pos-alternative",
  "square-alternative": "toast-square-pos-alternative",
  "toast-square-alternative": "toast-square-pos-alternative",
  "square-pos-alternative": "toast-square-pos-alternative",
  "toast-pos-alternative": "toast-square-pos-alternative",
};

function resolveComparison(slug: string): ComparisonItem | undefined {
  if (COMPARISONS[slug]) {
    return COMPARISONS[slug];
  }
  const canonical = SLUG_ALIASES[slug.toLowerCase().trim()];
  if (canonical && COMPARISONS[canonical]) {
    return COMPARISONS[canonical];
  }
  return undefined;
}

export async function generateStaticParams() {
  const primarySlugs = Object.keys(COMPARISONS);
  const aliasSlugs = Object.keys(SLUG_ALIASES);
  const allSlugs = Array.from(new Set([...primarySlugs, ...aliasSlugs]));
  return allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CompareSlugProps): Promise<Metadata> {
  const { slug } = await params;
  const comp = resolveComparison(slug);

  if (!comp) {
    return {
      title: "Comparison Not Found | Beraxis AI",
      description: "Software comparison page not found."
    };
  }

  const title = `Best Free ${comp.competitorName} Alternative (2026) | Beraxis AI`;
  const description = `${comp.heroHeadline}. ${comp.heroSubheadline.slice(0, 150)}... Save ${comp.annualSavings} annually with double-entry accounting, CRM, POS, and 25M+ leads for $1/mo.`;

  return {
    title,
    description,
    keywords: [
      `${comp.competitorName} alternative`,
      `Free ${comp.competitorName} alternative`,
      `Best alternative to ${comp.competitorName}`,
      `Beraxis vs ${comp.competitorName}`,
      "Free ERP software",
      "Free CRM software",
      "Cloud ERP comparison",
      "25M B2B leads directory"
    ],
    alternates: {
      canonical: `https://www.beraxis.online/compare/${comp.slug}`
    },
    openGraph: {
      title,
      description,
      url: `https://www.beraxis.online/compare/${comp.slug}`,
      siteName: "Beraxis AI",
      images: [
        {
          url: "https://www.beraxis.online/social_media_assets/ad4_carousel_comparison_square.png",
          width: 1080,
          height: 1080,
          alt: `Beraxis vs ${comp.competitorName}`
        }
      ]
    }
  };
}

export default async function CompareSlugPage({ params }: CompareSlugProps) {
  const { slug } = await params;
  const comp = resolveComparison(slug);

  if (!comp) {
    notFound();
  }

  const otherComparisons = Object.values(COMPARISONS).filter(c => c.slug !== comp.slug);

  return (
    <div className="min-h-screen bg-[#070B16] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="flex-grow pt-28 sm:pt-36 pb-20 relative z-10 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/compare" className="hover:text-white transition-colors">Comparisons</Link>
            <span>/</span>
            <span className="text-cyan-400 font-semibold">{comp.competitorName} Alternative</span>
          </div>

          {/* ── HERO SECTION ── */}
          <div className="text-center max-w-4xl mx-auto space-y-5 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-cyan-400" />
              <span>{comp.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              {comp.heroHeadline}
            </h1>

            <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              {comp.heroSubheadline}
            </p>

            {/* Price & Savings Pill Bar */}
            <div className="inline-flex flex-wrap items-center justify-center gap-4 p-4 rounded-3xl bg-[#0F172A]/90 border border-white/10 shadow-xl max-w-2xl mx-auto">
              <div className="text-left px-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">{comp.competitorName}</span>
                <span className="text-base sm:text-lg font-mono font-bold text-rose-400 line-through">{comp.competitorCostAnnual}</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
              <div className="text-left px-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Beraxis AI Standard</span>
                <span className="text-base sm:text-lg font-mono font-black text-emerald-300">{comp.beraxisCostAnnual}</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
              <div className="text-left px-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Your Annual Savings</span>
                <span className="text-base sm:text-lg font-mono font-black text-amber-300">{comp.annualSavings}</span>
              </div>
            </div>

            {/* Launch CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center pt-2">
              <Link 
                href="/pricing"
                className="galaxy-btn-primary !px-7 !py-3.5 text-sm w-full sm:w-auto font-extrabold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                Claim $1/mo Early Bird <ArrowRight size={15} />
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-sm font-semibold transition-all w-full sm:w-auto text-center"
              >
                Deploy 1 App 100% Free ($0)
              </Link>
            </div>
          </div>

          {/* ── KEY TAKEAWAY CARD ── */}
          <div className="max-w-4xl mx-auto mb-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-900 border border-cyan-500/30 shadow-2xl">
            <h2 className="text-lg font-extrabold text-white mb-2 flex items-center gap-2">
              <Zap size={18} className="text-cyan-400" />
              Executive Summary: Beraxis vs. {comp.competitorName}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
              {comp.keySummary}
            </p>
          </div>

          {/* ── SIDE-BY-SIDE: FLAWS VS. WINS ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
            {/* Competitor Pitfalls */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A]/70 border border-rose-500/20 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-rose-500/20">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
                  <X size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Why Businesses Leave {comp.competitorName}</h3>
                  <p className="text-[11px] text-gray-400">Common pain points and hidden limitations</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-gray-300 pt-2">
                {comp.competitorFlaws.map((flaw, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold mt-0.5">✕</span>
                    <span>{flaw}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Beraxis Advantage */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A]/70 border border-emerald-500/30 shadow-xl shadow-emerald-950/20 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-500/20">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  <Check size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">The Beraxis AI Advantage</h3>
                  <p className="text-[11px] text-gray-400">Modern architecture built for speed and value</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-gray-200 pt-2">
                {comp.beraxisWins.map((win, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── DETAILED FEATURE MATRIX TABLE ── */}
          <div className="rounded-3xl p-6 sm:p-10 bg-[#0F172A]/90 border border-white/10 shadow-2xl backdrop-blur-xl mb-20 max-w-5xl mx-auto">
            <div className="pb-6 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                Head-to-Head Breakdown
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Detailed Feature &amp; Capability Matrix
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Comparing daily business operations, software licensing, and built-in tooling.
              </p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase text-[11px] tracking-wider">
                    <th className="py-4 px-4 font-bold">Feature / Operational Capability</th>
                    <th className="py-4 px-4 font-bold text-cyan-400 bg-cyan-500/5 rounded-t-xl">Beraxis AI</th>
                    <th className="py-4 px-4 font-bold text-gray-400">{comp.competitorName}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {comp.matrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-gray-200">
                        <div>{row.feature}</div>
                        {row.note && <div className="text-[11px] text-gray-500 mt-0.5">{row.note}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-cyan-300 bg-cyan-500/5">
                        {typeof row.beraxis === "boolean" ? (
                          row.beraxis ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                              <Check size={16} /> Yes (Included)
                            </span>
                          ) : (
                            <X size={16} className="text-rose-400" />
                          )
                        ) : (
                          <span>{row.beraxis}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">
                        {typeof row.competitor === "boolean" ? (
                          row.competitor ? (
                            <span className="inline-flex items-center gap-1.5 text-gray-300">
                              <Check size={16} /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
                              <X size={16} /> Not Native
                            </span>
                          )
                        ) : (
                          <span>{row.competitor}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 3-STEP MIGRATION GUIDE ── */}
          <div className="max-w-5xl mx-auto mb-20">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-1">
                Zero Downtime Switch
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                How to Migrate from {comp.competitorName} in 3 Simple Steps
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Switch over during your lunch break with universal CSV import and automatic entity mapping.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comp.migrationSteps.map((step, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-[#0F172A]/80 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono font-black text-sm flex items-center justify-center">
                      {step.step}
                    </span>
                    <h3 className="text-base font-bold text-white">{step.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQ SECTION ── */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                Got Questions?
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Frequently Asked Questions About Switching
              </h2>
            </div>

            <div className="space-y-4">
              {comp.faqs.map((faq, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-[#0F172A]/80 border border-white/10 space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <HelpCircle size={16} className="text-cyan-400 shrink-0" />
                    {faq.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 pl-6 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── EXPLORE OTHER COMPARISONS ── */}
          <div className="max-w-5xl mx-auto mb-20 pt-10 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-6 text-center">
              Compare Beraxis Against Other Leading Platforms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherComparisons.map((other) => (
                <Link
                  key={other.slug}
                  href={`/compare/${other.slug}`}
                  className="p-4 rounded-2xl bg-[#0F172A] border border-white/10 hover:border-cyan-500/40 hover:bg-[#131B30] transition-all group"
                >
                  <span className="text-[10px] font-bold text-cyan-400 block mb-1 uppercase tracking-wider">{other.badge}</span>
                  <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Beraxis vs. {other.competitorName}
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono mt-1 block">Save {other.annualSavings}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── BOTTOM CTA ── */}
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-purple-900/40 via-[#0F172A] to-cyan-950/40 border border-purple-500/30 text-center relative overflow-hidden shadow-2xl max-w-5xl mx-auto">
            <div className="max-w-3xl mx-auto space-y-5">
              <span className="px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30 inline-block">
                Early Bird Special Active
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Replace {comp.competitorName} Today for Just $1/Month
              </h2>
              <p className="text-gray-300 text-sm sm:text-base font-light">
                Lock in your annual savings, tap our 25M+ B2B leads directory, and enjoy frictionless operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                <Link
                  href="/pricing"
                  className="galaxy-btn-primary !px-8 !py-3.5 text-sm font-bold w-full sm:w-auto"
                >
                  Claim $1/mo Plan Now
                </Link>
                <Link
                  href="/compare"
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium border border-white/15 transition w-full sm:w-auto"
                >
                  All Comparisons
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
