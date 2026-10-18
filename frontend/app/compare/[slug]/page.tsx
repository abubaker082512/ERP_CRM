"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { COMPARISONS } from "@/lib/comparisonData";
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  X, 
  ShieldCheck, 
  Flame, 
  Zap, 
  TrendingUp, 
  Layers, 
  HelpCircle,
  Clock,
  DollarSign
} from "lucide-react";

interface CompareSlugProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CompareSlugPage({ params }: CompareSlugProps) {
  const resolvedParams = use(params);
  const comp = COMPARISONS[resolvedParams.slug];

  if (!comp) {
    return notFound();
  }

  const otherComparisons = Object.values(COMPARISONS).filter(c => c.slug !== comp.slug);

  return (
    <div className="min-h-screen bg-[#070B16] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="flex-grow pt-28 sm:pt-36 pb-20 relative z-10 overflow-hidden">
        {/* Ambient Lights */}
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/compare" className="hover:text-white transition-colors">Comparisons</Link>
            <span>/</span>
            <span className="text-cyan-400">{comp.competitorName} Alternative</span>
          </div>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto space-y-4 mb-14">
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

            {/* Savings Callout Box */}
            <div className="inline-flex flex-wrap items-center justify-center gap-4 p-4 rounded-3xl bg-[#0F172A]/90 border border-emerald-500/30 text-xs sm:text-sm mt-3 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-gray-300">Annual Cost Difference:</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-rose-400 line-through font-bold">{comp.competitorName}: {comp.competitorCostAnnual}</span>
                <span className="text-gray-400">vs</span>
                <span className="text-emerald-400 font-extrabold text-sm sm:text-base">Beraxis: {comp.beraxisCostAnnual}</span>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Save {comp.annualSavings}
              </span>
            </div>
          </div>

          {/* Quick Pitch Summary Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A]/70 border border-white/10 backdrop-blur-xl mb-16 max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Zap size={18} className="text-cyan-400" />
              <span>Executive Summary</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {comp.keySummary}
            </p>
          </div>

          {/* Side-by-Side Pros & Cons Contrast */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* Left: Competitor Flaws */}
            <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/10 border border-rose-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-rose-500/20 mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Legacy Architecture</span>
                  <h3 className="text-xl font-bold text-white">Why Businesses Leave {comp.competitorName}</h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  ❌
                </div>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-gray-300">
                {comp.competitorFlaws.map((flaw, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <X size={18} className="text-rose-400 shrink-0 mt-0.5" />
                    <span>{flaw}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Beraxis Wins */}
            <div className="p-6 sm:p-8 rounded-3xl bg-emerald-950/15 border border-emerald-500/30 relative overflow-hidden shadow-xl shadow-emerald-950/30">
              <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20 mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Modern Autonomous Engine</span>
                  <h3 className="text-xl font-bold text-white">The Beraxis AI Advantage</h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✨
                </div>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-gray-200">
                {comp.beraxisWins.map((win, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-medium">{win}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Full Detailed Feature Comparison Matrix */}
          <div className="rounded-3xl p-6 sm:p-10 bg-[#0F172A]/90 border border-white/10 shadow-2xl backdrop-blur-xl mb-20">
            <div className="pb-6 border-b border-white/10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Detailed Feature Matrix: Beraxis AI vs. {comp.competitorName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Comparing operational features, workflows, and transparent licensing terms.
              </p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase text-[11px] tracking-wider">
                    <th className="py-4 px-4 font-bold">Capability / Module</th>
                    <th className="py-4 px-4 font-bold text-cyan-400 bg-cyan-500/5 rounded-t-xl">Beraxis AI</th>
                    <th className="py-4 px-4 font-bold text-gray-400">{comp.competitorName}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {comp.matrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-medium text-gray-200">
                        <div className="font-bold text-white">{row.feature}</div>
                        {row.note && <div className="text-[11px] text-gray-400 mt-0.5">{row.note}</div>}
                      </td>
                      <td className="py-4 px-4 font-bold text-cyan-300 bg-cyan-500/5">
                        {typeof row.beraxis === "boolean" ? (
                          row.beraxis ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                              <Check size={16} /> Included Native
                            </span>
                          ) : (
                            <X size={16} className="text-rose-400" />
                          )
                        ) : (
                          <span className="text-emerald-400 font-bold">{row.beraxis}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-400">
                        {typeof row.competitor === "boolean" ? (
                          row.competitor ? (
                            <span className="inline-flex items-center gap-1.5 text-gray-300">
                              <Check size={16} /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
                              <X size={16} /> Not Native / Missing
                            </span>
                          )
                        ) : (
                          <span className="text-gray-300">{row.competitor}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3-Step Zero-Downtime Migration Guide */}
          <div className="mb-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                Zero Friction Transition
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                How to Migrate From {comp.competitorName} in Under 30 Minutes
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Our universal data importers let you transfer customers, items, and opening balances without downtime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comp.migrationSteps.map((step, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-[#0F172A]/70 border border-white/10 relative">
                  <div className="text-3xl font-black text-cyan-500/30 mb-3 font-mono">
                    {step.step}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SEO FAQ Section */}
          <div className="p-6 sm:p-10 rounded-3xl bg-[#0F172A]/80 border border-white/10 mb-20 max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
              <HelpCircle size={22} className="text-cyan-400" />
              <span>Frequently Asked Questions: Beraxis vs. {comp.competitorName}</span>
            </h2>

            <div className="space-y-6">
              {comp.faqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#090D1A] border border-white/5 space-y-2">
                  <h3 className="text-sm font-bold text-white">
                    {faq.q}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Explore Other Comparisons (Internal Linking SEO) */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <h3 className="text-lg font-bold text-white">Explore More Comparisons</h3>
              <p className="text-xs text-gray-400">See how Beraxis compares against other platforms in your operational stack.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherComparisons.map((other) => (
                <Link
                  key={other.slug}
                  href={`/compare/${other.slug}`}
                  className="p-4 rounded-2xl bg-[#0F172A]/60 border border-white/5 hover:border-cyan-500/30 hover:bg-[#141C33] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider block mb-1">
                      {other.badge}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      vs. {other.competitorName}
                    </h4>
                  </div>
                  <div className="mt-3 text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <span>Save {other.annualSavings}</span>
                    <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Conversion CTA */}
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-cyan-950/40 via-[#0F172A] to-purple-950/40 border border-cyan-500/30 text-center relative overflow-hidden shadow-2xl">
            <div className="max-w-3xl mx-auto space-y-5">
              <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-500/30 inline-block">
                Start Today in 30 Seconds
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Replace {comp.competitorName} and Upgrade to Beraxis AI Today
              </h2>
              <p className="text-gray-300 text-sm sm:text-base">
                Claim your early-bird Standard Plan at just <strong>$1.00/month</strong> ($12/year billed annually) or start completely free with 1 App Forever. No credit card required.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-4">
                <Link 
                  href="/billing?promo=EARLYBIRD1"
                  className="px-6 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-2"
                >
                  <span>Claim Early-Bird $1/mo Deal</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-3.5 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 text-white text-sm border border-slate-700 transition flex items-center gap-2"
                >
                  <span>Start 1 App Free Forever</span>
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
