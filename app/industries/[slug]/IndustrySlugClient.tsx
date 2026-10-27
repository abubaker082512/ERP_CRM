"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { IndustryData } from "@/lib/industryData";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Globe,
  Zap,
  Building2,
  Flame,
  ChevronDown,
  ShieldCheck,
  Check
} from "lucide-react";

interface IndustrySlugClientProps {
  industry: IndustryData;
  otherIndustries: IndustryData[];
}

export default function IndustrySlugClient({ industry, otherIndustries }: IndustrySlugClientProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb nav */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/industries" className="hover:text-white">Industries</Link>
          <span>/</span>
          <span className="text-purple-400">{industry.name}</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-wider mb-6">
            <Sparkles size={14} className="text-purple-400" />
            <span>{industry.badge}</span>
          </div>

          {/* Clean Single H1 tag */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            {industry.h1}
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed mb-8 max-w-3xl mx-auto">
            {industry.metaDescription}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/pricing"
              className="galaxy-btn-primary !px-9 !py-4 text-base font-bold shadow-xl shadow-purple-500/25 flex items-center gap-2 group"
            >
              <span>Launch {industry.name.split(" ")[0]} ERP ($1/mo)</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/signup"
              className="px-7 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-base transition-all flex items-center gap-2"
            >
              Deploy 1 App Free ($0)
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Check size={14} /> Full 28 Modules Unlocked
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <Globe size={14} /> Global B2B Leads Directory Included
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-purple-400 font-medium">
              <ShieldCheck size={14} /> Unlimited User Seats
            </span>
          </div>
        </div>

        {/* Problem vs. Beraxis Solution Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
              Operational Comparison
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Why Generic Software Fails <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{industry.name}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#090D1A]/90 border border-red-500/20 shadow-xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                  <XCircle size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">The Old Way: Fragmented Tools</h3>
                  <p className="text-xs text-gray-400">Multiple monthly subscriptions and manual copy-pasting</p>
                </div>
              </div>

              <div className="space-y-4">
                {industry.painPoints.map((point, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <h4 className="text-sm font-bold text-red-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      {point.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed pl-3.5">
                      {point.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* The Beraxis Way */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#090D1A]/90 border border-emerald-500/30 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 pb-4 border-b border-white/10 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">The Beraxis Way: Pre-Configured Blueprint</h3>
                  <p className="text-xs text-emerald-400 font-medium">All-in-one cockpit engineered specifically for this industry</p>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                {industry.solutions.map((sol, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                    <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      {sol.title}
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed pl-5">
                      {sol.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Specialized Capabilities Grid */}
        <div className="mb-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Key Capabilities for {industry.name}
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              Everything required to run, market, and scale your business from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industry.keyFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0F172A]/40 border border-white/10 hover:border-purple-500/30 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-light">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-Engineered Operation Modes */}
        <div className="mb-24 p-8 sm:p-12 rounded-3xl bg-[#070B16] border border-white/15 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Pre-Engineered Operation Modes
            </h2>
            <p className="text-xs text-gray-400">
              Switch operational modes with 1 click based on your exact business archetype.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {industry.operationModes.map((mode, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#101422] border border-white/10 space-y-3">
                <span className="text-xs font-bold text-purple-300 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 inline-block">
                  {mode.badge}
                </span>
                <h3 className="text-base font-bold text-white">{mode.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{mode.desc}</p>
              </div>
            ))}
          </div>

          {/* Departments & Roles pill list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-white/10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-3">
                Pre-Configured Departments:
              </span>
              <div className="flex flex-wrap gap-2">
                {industry.departments.map(d => (
                  <span key={d} className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-200">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-3">
                Standard Staff Roles &amp; Permissions:
              </span>
              <div className="flex flex-wrap gap-2">
                {industry.roles.map(r => (
                  <span key={r} className="text-xs px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-300">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-xs text-gray-400">Everything you need to know about Beraxis for {industry.name}</p>
          </div>

          <div className="space-y-4">
            {industry.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#090D1A]/90 border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex justify-between items-center gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="text-base font-bold text-white">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-purple-400 shrink-0 transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & CTA Banner */}
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-purple-950 via-[#0B0F19] to-pink-950 border border-purple-500/30 text-center mb-24 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 uppercase tracking-wider mb-4">
            <Flame size={14} className="text-amber-400 animate-pulse" />
            <span>Early Bird Launch Special</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Ready to Transform Your {industry.name}?
          </h2>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-light">
            Deploy your dedicated industry workspace in under 60 seconds. Get all 28 modules, unlimited team seats, and the global leads directory for just <strong className="text-white font-bold">$1/month</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/pricing"
              className="galaxy-btn-primary !px-9 !py-4 text-base font-bold shadow-xl shadow-purple-500/30 flex items-center gap-2"
            >
              <span>Get Started for $1/Month</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/signup"
              className="px-7 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-sm transition-all"
            >
              Start 1 App Forever Free ($0)
            </Link>
          </div>
        </div>

        {/* Other Industries Grid */}
        <div className="pt-12 border-t border-white/10">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Explore Other Industry Blueprints</h3>
              <p className="text-xs text-gray-400">Beraxis comes pre-engineered for 12 global commercial sectors</p>
            </div>
            <Link href="/industries" className="text-purple-400 hover:text-purple-300 text-xs font-semibold flex items-center gap-1">
              View All Industries <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {otherIndustries.slice(0, 8).map(other => (
              <Link
                key={other.slug}
                href={`/industries/${other.slug}`}
                className="p-4 rounded-2xl bg-[#090D1A]/70 border border-white/5 hover:border-purple-500/40 hover:bg-[#101424] transition-all group"
              >
                <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors block mb-1">
                  {other.name}
                </span>
                <span className="text-[11px] text-gray-400 line-clamp-1">
                  {other.tagline}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
