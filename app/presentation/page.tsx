'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 9;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev < totalSlides ? prev + 1 : prev));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 1 ? prev - 1 : prev));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans relative overflow-x-hidden select-none">
      {/* Ambient background glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[650px] h-[650px] bg-purple-600/20 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-between px-6 md:px-12 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo2.png" alt="Beraxis Logo" className="h-8 w-auto object-contain transition group-hover:scale-105" />
          <span className="text-xl font-extrabold tracking-tight text-white flex items-center">
            BERAXIS<span className="text-purple-500">.</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30 font-semibold uppercase tracking-wider ml-1">
            Growth & Financial Deck
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 tracking-wider">
            SLIDE {currentSlide} / {totalSlides}
          </span>
          <button
            onClick={prevSlide}
            disabled={currentSlide === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs transition"
          >
            ◀ Prev
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs transition shadow-lg shadow-sky-600/20"
          >
            Next ▶
          </button>
          <a
            href="/Beraxis_Growth_and_Financial_Pitch_Deck.pdf"
            download
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 text-sky-400 transition"
          >
            📥 Growth PDF
          </a>
        </div>
      </header>

      {/* Slide Container - Centered */}
      <main className="pt-20 min-h-screen flex items-center justify-center p-6 md:p-12">
        {/* SLIDE 1: Cover */}
        {currentSlide === 1 && (
          <div className="max-w-4xl w-full text-center space-y-6 animate-fadeIn">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-slate-900/80 backdrop-blur rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo2.png" alt="Beraxis" className="h-16 w-auto object-contain mx-auto" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold text-xs tracking-wide">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" /> SCALING THE AUTONOMOUS ENTERPRISE PLATFORM
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Scaling The Autonomous Operating System <br />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                $0.8M → $62M ARR
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Disrupting legacy ERP complexity with 15-minute setup, 26.6x LTV:CAC unit economics, 84% gross margins, and native outbound revenue generation.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 max-w-3xl mx-auto text-center">
              <div className="bg-slate-900/70 backdrop-blur p-4 rounded-xl border border-sky-500/30 shadow-lg shadow-sky-500/10">
                <div className="text-2xl font-extrabold text-sky-400">$34.8B</div>
                <div className="text-xs text-slate-400 mt-1">SMB Cloud ERP TAM</div>
              </div>
              <div className="bg-slate-900/70 backdrop-blur p-4 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <div className="text-2xl font-extrabold text-emerald-400">$62M ARR</div>
                <div className="text-xs text-slate-400 mt-1">Year 5 Target</div>
              </div>
              <div className="bg-slate-900/70 backdrop-blur p-4 rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <div className="text-2xl font-extrabold text-purple-400">26.6x</div>
                <div className="text-xs text-slate-400 mt-1">LTV : CAC Ratio</div>
              </div>
              <div className="bg-slate-900/70 backdrop-blur p-4 rounded-xl border border-amber-500/30 shadow-lg shadow-amber-500/10">
                <div className="text-2xl font-extrabold text-amber-400">84%</div>
                <div className="text-xs text-slate-400 mt-1">SaaS Gross Margin</div>
              </div>
            </div>

            <div className="pt-6 flex justify-center gap-4">
              <button
                onClick={nextSlide}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 font-bold text-white hover:opacity-95 shadow-xl shadow-purple-500/25 transition text-sm"
              >
                Explore Growth Deck →
              </button>
              <Link
                href="/"
                className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-sm transition border border-slate-700"
              >
                Launch Beraxis App ↗
              </Link>
            </div>
          </div>
        )}

        {/* SLIDE 2: Market TAM */}
        {currentSlide === 2 && (
          <div className="max-w-5xl w-full space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-extrabold">Massive Market Opportunity: $62B → $136B Wave</h2>
              <p className="text-slate-400 text-sm">Enterprise ERP is shifting downmarket to 30M+ SMBs demanding AI over consulting delays</p>
            </div>

            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 space-y-3 text-xs text-slate-300">
                <div className="bg-slate-900/70 p-4 rounded-xl border border-sky-500/30 space-y-1.5">
                  <h4 className="font-bold text-sky-400 text-sm">📈 13.8% Industry CAGR</h4>
                  <p>Legacy ERPs are rapidly being replaced by autonomous cloud platforms.</p>
                </div>
                <div className="bg-slate-900/70 p-4 rounded-xl border border-purple-500/30 space-y-1.5">
                  <h4 className="font-bold text-purple-400 text-sm">🎯 The $34.8B SMB Opportunity</h4>
                  <p>Odoo charges heavy consulting fees; GoHighLevel lacks true accounting & inventory.</p>
                </div>
                <div className="bg-slate-900/70 p-4 rounded-xl border border-emerald-500/30 space-y-1.5">
                  <h4 className="font-bold text-emerald-400 text-sm">🚀 Initial Target (SOM)</h4>
                  <p>Capturing just 1.2% of the switchers market represents <b>$98M+ ARR</b>.</p>
                </div>
              </div>

              <div className="md:col-span-8 flex justify-center">
                <div className="bg-slate-900/80 p-2 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/deck_assets/chart_market_tam.png" alt="Market TAM Chart" className="w-full h-auto rounded-xl object-contain max-h-[340px]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: Competitors (Odoo, Zoho, GoHighLevel) */}
        {currentSlide === 3 && (
          <div className="max-w-5xl w-full space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-extrabold">Competitive Disruption: Beraxis vs. Odoo, Zoho & GoHighLevel</h2>
              <p className="text-slate-400 text-sm">Why Beraxis wins against CRM-only platforms and bloated legacy ERP suites</p>
            </div>

            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 space-y-3 text-xs text-slate-300">
                <div className="bg-slate-900/70 p-3.5 rounded-xl border border-emerald-500/30 space-y-1">
                  <h4 className="font-bold text-emerald-400 text-sm">⚡ vs. Odoo</h4>
                  <p>Odoo takes 90 days of expensive consulting; Beraxis deploys in <b>15 minutes</b> with free migration.</p>
                </div>
                <div className="bg-slate-900/70 p-3.5 rounded-xl border border-sky-500/30 space-y-1">
                  <h4 className="font-bold text-sky-400 text-sm">⚡ vs. GoHighLevel (GHL)</h4>
                  <p>GHL is great for marketing/CRM but has <b>ZERO accounting & inventory</b>. Beraxis is a true end-to-end ERP.</p>
                </div>
                <div className="bg-slate-900/70 p-3.5 rounded-xl border border-purple-500/30 space-y-1">
                  <h4 className="font-bold text-purple-400 text-sm">⚡ vs. Zoho One</h4>
                  <p>Zoho is 40+ stitched apps with sync lag; Beraxis runs on one unified Next.js database.</p>
                </div>
              </div>

              <div className="md:col-span-8 flex justify-center">
                <div className="bg-slate-900/80 p-2 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/deck_assets/chart_competitor_comparison.png" alt="Competitor Comparison Chart" className="w-full h-auto rounded-xl object-contain max-h-[340px]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: Dashboard Showcase */}
        {currentSlide === 4 && (
          <div className="max-w-5xl w-full space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-extrabold">Live Product Execution: Next-Gen Core</h2>
              <p className="text-slate-400 text-sm">High-performance Next.js 14 architecture with 25+ synchronized enterprise modules</p>
            </div>

            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 space-y-3">
                <div className="bg-slate-900/70 p-3.5 rounded-xl border border-sky-500/30">
                  <h4 className="font-bold text-sky-400 text-sm">💼 CRM & 94.2% AI Scoring</h4>
                  <p className="text-xs text-slate-300 mt-1">Predicts deal win probability & analyzes email sentiment.</p>
                </div>
                <div className="bg-slate-900/70 p-3.5 rounded-xl border border-emerald-500/30">
                  <h4 className="font-bold text-emerald-400 text-sm">🧾 3-Sec OCR Accounting</h4>
                  <p className="text-xs text-slate-300 mt-1">Auto-extracts supplier bills into general ledger.</p>
                </div>
                <div className="bg-slate-900/70 p-3.5 rounded-xl border border-purple-500/30">
                  <h4 className="font-bold text-purple-400 text-sm">📦 Predictive Inventory MRP</h4>
                  <p className="text-xs text-slate-300 mt-1">Multi-warehouse stock & automated Bill of Materials.</p>
                </div>
              </div>

              <div className="md:col-span-8 flex justify-center">
                <div className="bg-slate-900/80 p-2 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/deck_assets/dashboard_hero.jpg" alt="Live Dashboard" className="w-full h-auto rounded-xl object-cover max-h-[340px]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: Unit Economics */}
        {currentSlide === 5 && (
          <div className="max-w-5xl w-full space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-extrabold">World-Class Unit Economics: Highly Efficient</h2>
              <p className="text-slate-400 text-sm">26.6x LTV:CAC with 1.1-month payback and 84% Gross Margins</p>
            </div>

            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 space-y-3 text-xs text-slate-300">
                <div className="bg-slate-900/70 p-3.5 rounded-xl border border-emerald-500/30 space-y-1">
                  <h4 className="font-bold text-emerald-400 text-sm">💎 $4,800 LTV vs $180 CAC</h4>
                  <p>Capital-efficient distribution driven by viral partner referrals.</p>
                </div>
                <div className="bg-slate-900/70 p-3.5 rounded-xl border border-sky-500/30 space-y-1">
                  <h4 className="font-bold text-sky-400 text-sm">⚡ 1.1 Month Payback</h4>
                  <p>Recovers customer acquisition costs almost immediately.</p>
                </div>
                <div className="bg-slate-900/70 p-3.5 rounded-xl border border-purple-500/30 space-y-1">
                  <h4 className="font-bold text-purple-400 text-sm">📊 132% NRR Expansion</h4>
                  <p>Accounts expand spend via AI calling minutes and document credits.</p>
                </div>
              </div>

              <div className="md:col-span-8 flex justify-center">
                <div className="bg-slate-900/80 p-2 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/deck_assets/chart_unit_economics.png" alt="Unit Economics Chart" className="w-full h-auto rounded-xl object-contain max-h-[340px]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: Financial Forecast */}
        {currentSlide === 6 && (
          <div className="max-w-5xl w-full space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-extrabold">5-Year Financial Forecast ($0.8M → $62M ARR)</h2>
              <p className="text-slate-400 text-sm">Data-backed pathway to $62M ARR and 18,000+ active enterprise accounts</p>
            </div>

            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 space-y-2.5 text-xs text-slate-300">
                <div className="bg-slate-900/70 p-3 rounded-xl border border-sky-500/30">
                  <b className="text-sky-400">Year 1: $835K ARR</b> — 350 SMBs via direct blitz.
                </div>
                <div className="bg-slate-900/70 p-3 rounded-xl border border-indigo-500/30">
                  <b className="text-indigo-400">Year 2: $4.6M ARR</b> — 1,800 Accounts + AI Outbound.
                </div>
                <div className="bg-slate-900/70 p-3 rounded-xl border border-purple-500/30">
                  <b className="text-purple-400">Year 3: $16.5M ARR</b> — 5,500 Accounts & Partners.
                </div>
                <div className="bg-slate-900/70 p-3 rounded-xl border border-emerald-500/30">
                  <b className="text-emerald-400">Year 5: $62.0M ARR</b> — 18,000+ Global Accounts.
                </div>
              </div>

              <div className="md:col-span-8 flex justify-center">
                <div className="bg-slate-900/80 p-2 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/deck_assets/chart_arr_growth.png" alt="ARR Growth Chart" className="w-full h-auto rounded-xl object-contain max-h-[340px]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 7: Outbound Flywheel */}
        {currentSlide === 7 && (
          <div className="max-w-5xl w-full space-y-6 text-center animate-fadeIn">
            <div className="space-y-1">
              <span className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30 font-semibold">
                Autonomous Revenue Engine
              </span>
              <h2 className="text-3xl font-extrabold mt-2">The Expansion Flywheel: Marketing & AI Calling</h2>
              <p className="text-slate-400 text-sm">Expanding ARPU and driving 132% Net Revenue Retention</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-slate-900/70 p-6 rounded-2xl space-y-3 border border-sky-500/30 shadow-lg shadow-sky-500/10">
                <div className="text-2xl">📊</div>
                <h3 className="font-bold text-sky-400 text-lg">1. Marketing Suite</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Centralized campaign tracking, landing page builder, and attribution. Replaces HubSpot ($800/mo).
                </p>
              </div>

              <div className="bg-slate-900/70 p-6 rounded-2xl space-y-3 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <div className="text-2xl">✉️</div>
                <h3 className="font-bold text-purple-400 text-lg">2. Cold Email Engine</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mailbox warmup, AI-personalized copy, and automated multi-step sequences. Replaces Instantly ($150/mo).
                </p>
              </div>

              <div className="bg-slate-900/70 p-6 rounded-2xl space-y-3 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <div className="text-2xl">📞</div>
                <h3 className="font-bold text-emerald-400 text-lg">3. AI Cold Calling</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Voice agents dial inbound leads in 60s, qualify prospects, and book calendar meetings (plus SDR option).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 8: GTM */}
        {currentSlide === 8 && (
          <div className="max-w-5xl w-full space-y-6 text-center animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold">Go-To-Market: 4 Scalable Distribution Engines</h2>
              <p className="text-slate-400 text-sm">Rapid acquisition roadmap to onboard hundreds of businesses</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4 text-left">
              <div className="bg-slate-900/70 p-5 rounded-xl border border-sky-500/30">
                <span className="text-xs text-sky-400 font-bold">ENGINE 1</span>
                <h4 className="font-bold text-white text-sm mt-1">Direct Outbound</h4>
                <p className="text-xs text-slate-400 mt-2">LinkedIn DMs & WhatsApp outreach with free white-glove setup.</p>
              </div>
              <div className="bg-slate-900/70 p-5 rounded-xl border border-emerald-500/30">
                <span className="text-xs text-emerald-400 font-bold">ENGINE 2</span>
                <h4 className="font-bold text-white text-sm mt-1">Free Migration</h4>
                <p className="text-xs text-slate-400 mt-2">We clean & migrate Excel/Odoo data in 24 hours.</p>
              </div>
              <div className="bg-slate-900/70 p-5 rounded-xl border border-purple-500/30">
                <span className="text-xs text-purple-400 font-bold">ENGINE 3</span>
                <h4 className="font-bold text-white text-sm mt-1">Partner Portal</h4>
                <p className="text-xs text-slate-400 mt-2">Accountants get free multi-client access + 20% rev-share.</p>
              </div>
              <div className="bg-slate-900/70 p-5 rounded-xl border border-amber-500/30">
                <span className="text-xs text-amber-400 font-bold">ENGINE 4</span>
                <h4 className="font-bold text-white text-sm mt-1">PQL Free Tier</h4>
                <p className="text-xs text-slate-400 mt-2">14-day trial + 1 module free forever drives 65% activation.</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 9: Capital & Vision */}
        {currentSlide === 9 && (
          <div className="max-w-4xl w-full text-center space-y-6 animate-fadeIn">
            <h2 className="text-4xl font-extrabold">Building The #1 Autonomous AI ERP & CRM</h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">Transforming how millions of growing businesses manage operations and generate revenue.</p>

            <div className="p-8 bg-slate-900/90 rounded-2xl border border-purple-500/40 space-y-4 shadow-2xl max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold">Explore The Live Platform & Financial Model</h3>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link
                  href="/"
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:opacity-95 font-bold text-white transition shadow-lg shadow-purple-600/30 text-sm"
                >
                  🚀 Launch Beraxis Platform
                </Link>
                <a
                  href="/Beraxis_Growth_and_Financial_Pitch_Deck.pdf"
                  download
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-white transition border border-slate-700 text-sm"
                >
                  📥 Download Growth Deck (PDF)
                </a>
              </div>
              <div className="pt-2 text-xs text-slate-400">
                Executive Inquiries: <a href="mailto:admin@beraxis.online" className="text-sky-400 hover:underline">admin@beraxis.online</a> &nbsp;|&nbsp; Web: <a href="https://www.beraxis.online" className="text-purple-400 hover:underline">www.beraxis.online</a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
