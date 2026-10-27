"use client";

import { useState } from "react";
import Link from "next/link";
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
  Database, 
  BarChart3, 
  DollarSign, 
  Layers 
} from "lucide-react";

export default function CompareHubPage() {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>("quickbooks-alternative");
  const comparisonList = Object.values(COMPARISONS);
  const activeComp = COMPARISONS[selectedCompetitor] || comparisonList[0];

  return (
    <div className="min-h-screen bg-[#020205] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      <Navbar />

      <main className="flex-grow pt-28 sm:pt-36 pb-20 relative z-10 overflow-hidden">
        {/* Seamless Ambient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(120,119,198,0.14),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-cyan-400">Comparisons</span>
          </div>

          {/* Hero Header */}
          <div className="text-center max-w-4xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-cyan-400" />
              <span>Transparent Software Comparisons</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Why High-Growth Businesses Are Replacing Their <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400">Entire SaaS Stack</span> With Beraxis
            </h1>
            <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Stop paying \$400+/month for fragmented apps, brittle integrations, and \$20,000 consultant onboarding. See how Beraxis unifies your operations for just \$1/month.
            </p>

            {/* Launch Deal Banner */}
            <div className="inline-flex flex-wrap items-center justify-center gap-3 p-2 rounded-2xl bg-[#0F172A]/80 border border-white/10 text-xs mt-2">
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1.5">
                <Flame size={13} className="text-amber-400" /> Early Bird Special
              </span>
              <span className="text-gray-300">Standard Plan: <strong>$1.00/mo</strong> ($12/yr) vs. $5.00/mo monthly • 1 App 100% Free Forever</span>
              <Link href="/pricing" className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                View Pricing <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {comparisonList.map((item) => {
              const isSelected = selectedCompetitor === item.slug;
              return (
                <div 
                  key={item.slug}
                  className={`rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden bg-[#0F172A]/70 backdrop-blur-xl ${
                    isSelected 
                      ? "border-cyan-500 shadow-2xl shadow-cyan-500/20 ring-1 ring-cyan-500/50" 
                      : "border-white/10 hover:border-white/20 hover:bg-[#141C33]"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold uppercase tracking-wider">
                        {item.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        Save {item.annualSavings}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Beraxis vs. {item.competitorName}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {item.competitorTagline}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#090D1A] border border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-gray-400">
                        <span>{item.competitorName}:</span>
                        <span className="text-rose-400 font-mono font-bold line-through">{item.competitorCostAnnual}</span>
                      </div>
                      <div className="flex justify-between items-center text-white font-semibold">
                        <span>Beraxis AI Standard:</span>
                        <span className="text-emerald-400 font-mono font-bold">{item.beraxisCostAnnual}</span>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-xs text-gray-300 pt-2">
                      {item.beraxisWins.slice(0, 3).map((win, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{win}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedCompetitor(item.slug)}
                      className="text-xs text-gray-400 hover:text-white transition-colors font-medium"
                    >
                      {isSelected ? "Active in Preview" : "Preview Matrix"}
                    </button>
                    <Link
                      href={`/compare/${item.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 transition-all group-hover:translate-x-0.5"
                    >
                      <span>Full Breakdown</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Live Comparison Preview Section */}
          <div className="rounded-3xl p-6 sm:p-10 bg-[#0F172A]/90 border border-white/10 shadow-2xl backdrop-blur-xl mb-20 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  Feature Matrix Preview
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Beraxis AI vs. {activeComp.competitorName}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Comparing operational capability, cost structure, and AI capabilities.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/compare/${activeComp.slug}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <span>Read Detailed {activeComp.competitorName} Guide</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase text-[11px] tracking-wider">
                    <th className="py-4 px-4 font-bold">Feature / Operational Capability</th>
                    <th className="py-4 px-4 font-bold text-cyan-400 bg-cyan-500/5 rounded-t-xl">Beraxis AI</th>
                    <th className="py-4 px-4 font-bold text-gray-400">{activeComp.competitorName}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeComp.matrix.map((row, idx) => (
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

            {/* Quick Summary Pill Callout */}
            <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-amber-950/20 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">Estimated Annual Savings: {activeComp.annualSavings}</div>
                  <div className="text-gray-400">Based on standard annual software subscriptions and third-party plugin fees.</div>
                </div>
              </div>
              <Link
                href="/billing?promo=EARLYBIRD1"
                className="px-4 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-black text-center shrink-0 transition"
              >
                Claim $1/mo Deal
              </Link>
            </div>
          </div>

          {/* Bottom Conversion CTA */}
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-purple-900/40 via-[#0F172A] to-cyan-950/40 border border-purple-500/30 text-center relative overflow-hidden shadow-2xl">
            <div className="max-w-3xl mx-auto space-y-5">
              <span className="px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30 inline-block">
                Zero Risk • Instant Setup
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Ready to Eliminate Your SaaS Tax and Experience Modern Business AI?
              </h2>
              <p className="text-gray-300 text-sm sm:text-base">
                Join thousands of businesses streamlining with Beraxis. Start completely free with 1 App Forever (No credit card required) or lock in the Early-Bird Standard Plan for \$1/month.
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
