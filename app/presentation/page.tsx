'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 8;

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
      <div className="fixed top-[-10%] left-[-10%] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[650px] h-[650px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-between px-6 md:px-12 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo2.png" alt="Beraxis Logo" className="h-8 w-auto object-contain transition group-hover:scale-105" />
          <span className="text-xl font-extrabold tracking-tight text-white flex items-center">
            BERAXIS<span className="text-purple-500">.</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30 font-semibold uppercase tracking-wider ml-1">
            AI ERP & CRM
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
            href="/Client_Executive_Pitch_and_Demo_Deck.pdf"
            download
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 text-sky-400 transition"
          >
            📥 PDF Deck
          </a>
        </div>
      </header>

      {/* Slide Container */}
      <main className="pt-20 min-h-screen flex items-center justify-center p-6 md:p-12">
        {/* SLIDE 1: Cover */}
        {currentSlide === 1 && (
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-slate-900/80 backdrop-blur rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo2.png" alt="Beraxis" className="h-16 w-auto object-contain mx-auto" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold text-xs tracking-wide">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" /> BERAXIS AUTONOMOUS ENTERPRISE SYSTEM
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Run Your Entire Business Smarter, Faster & <br />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                On Autopilot
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Replacing 6-month legacy ERP headaches with 15-minute setup, 3-second OCR invoice ingestion, predictive sales scoring, and native outbound revenue engines.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 max-w-4xl mx-auto text-left">
              <div className="bg-slate-900/70 backdrop-blur p-4 rounded-xl border border-sky-500/30 shadow-lg shadow-sky-500/10">
                <div className="text-2xl font-extrabold text-sky-400">15 Mins</div>
                <div className="text-xs text-slate-400 mt-0.5">Time to Go-Live</div>
              </div>
              <div className="bg-slate-900/70 backdrop-blur p-4 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <div className="text-2xl font-extrabold text-emerald-400">3 Seconds</div>
                <div className="text-xs text-slate-400 mt-0.5">AI OCR Receipt Scan</div>
              </div>
              <div className="bg-slate-900/70 backdrop-blur p-4 rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <div className="text-2xl font-extrabold text-purple-400">94.2%</div>
                <div className="text-xs text-slate-400 mt-0.5">AI Lead Scoring</div>
              </div>
              <div className="bg-slate-900/70 backdrop-blur p-4 rounded-xl border border-amber-500/30 shadow-lg shadow-amber-500/10">
                <div className="text-2xl font-extrabold text-amber-400">+$42,300+</div>
                <div className="text-xs text-slate-400 mt-0.5">Avg Annual Client ROI</div>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={nextSlide}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 font-bold text-white hover:opacity-95 shadow-xl shadow-purple-500/25 transition text-sm"
              >
                Explore Presentation Deck →
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

        {/* SLIDE 2: Hard Facts */}
        {currentSlide === 2 && (
          <div className="max-w-6xl mx-auto w-full space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-extrabold">The Reality: Why Traditional Business Software is Failing You</h2>
              <p className="text-slate-400 text-sm">Industry benchmarks show why modern companies are migrating to Beraxis AI</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-950/20 backdrop-blur p-6 rounded-2xl border border-red-500/30 space-y-4">
                <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                  <span>❌ The Legacy Trap (Odoo / SAP / Excel Sprawl)</span>
                </h3>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li>• <b className="text-white">73% of Implementations Fail:</b> Complex consulting projects taking 3-6 months and thousands in fees (Gartner).</li>
                  <li>• <b className="text-white">15.2 Hours Wasted Weekly:</b> Employees manually typing supplier invoices and copying numbers to Excel.</li>
                  <li>• <b className="text-white">Siloed Subscriptions:</b> Paying separately for HubSpot ($300), QuickBooks ($90), Katana ($350).</li>
                  <li>• <b className="text-white">Delayed Decision Making:</b> Waiting weeks for accountants to compile outdated financial reports.</li>
                </ul>
              </div>

              <div className="bg-emerald-950/20 backdrop-blur p-6 rounded-2xl border border-emerald-500/30 space-y-4">
                <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <span>✅ The Beraxis AI Operating System</span>
                </h3>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li>• <b className="text-white">Live in 15 Minutes:</b> Zero-friction activation with 1-click import and free white-glove data migration.</li>
                  <li>• <b className="text-white">3-Second OCR Ingestion:</b> Drop any supplier PDF receipt and auto-create double-entry ledger records.</li>
                  <li>• <b className="text-white">All-in-One Synchronized Core:</b> Sales CRM, Books, Warehouse, HR & Outbound in 1 workspace.</li>
                  <li>• <b className="text-white">Predictive AI Analytics:</b> Real-time cash flow, inventory reorder alerts, and deal win probability.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: Dashboard Showcase */}
        {currentSlide === 3 && (
          <div className="max-w-6xl mx-auto w-full space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-extrabold">Live Product Interface: Built for Speed</h2>
                <p className="text-slate-400 text-sm">Ultra-responsive Next.js 14 command center uniting every department</p>
              </div>
              <span className="text-xs bg-purple-900/40 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">Beraxis Live Build</span>
            </div>

            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 space-y-3">
                <div className="bg-slate-900/70 p-4 rounded-xl border border-sky-500/30">
                  <h4 className="font-bold text-sky-400 text-sm">⚡ Zero Learning Curve</h4>
                  <p className="text-xs text-slate-300 mt-1">Clutter-free UI that any employee can master on Day 1.</p>
                </div>
                <div className="bg-slate-900/70 p-4 rounded-xl border border-purple-500/30">
                  <h4 className="font-bold text-purple-400 text-sm">⚡ Instant Department Sync</h4>
                  <p className="text-xs text-slate-300 mt-1">Sales Order confirmation automatically updates stock & drafts invoice.</p>
                </div>
                <div className="bg-slate-900/70 p-4 rounded-xl border border-emerald-500/30">
                  <h4 className="font-bold text-emerald-400 text-sm">⚡ Role-Based Security</h4>
                  <p className="text-xs text-slate-300 mt-1">Granular permissions keep financial records strictly protected.</p>
                </div>
              </div>

              <div className="md:col-span-8">
                <div className="bg-slate-900/80 p-2 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/deck_assets/dashboard_hero.jpg"
                    alt="Live Dashboard"
                    className="w-full h-auto rounded-xl object-cover hover:scale-[1.02] transition duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: CRM & Accounting */}
        {currentSlide === 4 && (
          <div className="max-w-6xl mx-auto w-full space-y-4">
            <div>
              <h2 className="text-3xl font-extrabold">Intelligent CRM & Automated Accounting</h2>
              <p className="text-slate-400 text-sm">AI OCR Scanning and Predictive Deal Scoring</p>
            </div>

            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 space-y-4 text-xs text-slate-300">
                <div className="bg-slate-900/70 p-4 rounded-xl border border-sky-500/30 space-y-2">
                  <h4 className="font-bold text-sky-400 text-sm">💼 Intelligent CRM</h4>
                  <p>• <b>AI Lead Scoring:</b> 94.2% accuracy predicting deal closure.</p>
                  <p>• <b>Email Sentiment Alerts:</b> Flag frustrated accounts early.</p>
                  <p>• <b>1-Click Quotes to Orders:</b> Accelerate deal closure.</p>
                </div>

                <div className="bg-slate-900/70 p-4 rounded-xl border border-emerald-500/30 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-sm">📈 Automated Accounting</h4>
                  <p>• <b>3-Sec OCR Scanner:</b> Drop PDF bills, auto-fill ledger.</p>
                  <p>• <b>Automated Bank Feeds:</b> Instant reconciliation.</p>
                  <p>• <b>Real-Time Financials:</b> Live P&L and Balance Sheet.</p>
                </div>
              </div>

              <div className="md:col-span-8">
                <div className="bg-slate-900/80 p-2 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/deck_assets/crm_accounting_view.jpg"
                    alt="CRM & Accounting"
                    className="w-full h-auto rounded-xl object-cover hover:scale-[1.02] transition duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: Inventory & HRMS */}
        {currentSlide === 5 && (
          <div className="max-w-6xl mx-auto w-full space-y-4">
            <div>
              <h2 className="text-3xl font-extrabold">Smart Inventory, Manufacturing & HRMS</h2>
              <p className="text-slate-400 text-sm">Complete logistics and employee operations under one roof</p>
            </div>

            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 space-y-4 text-xs text-slate-300">
                <div className="bg-slate-900/70 p-4 rounded-xl border border-purple-500/30 space-y-2">
                  <h4 className="font-bold text-purple-400 text-sm">🏭 Smart Inventory & MRP</h4>
                  <p>• <b>Multi-Warehouse Tracking:</b> Real-time location balances.</p>
                  <p>• <b>Predictive Demand:</b> Forecast stockouts before they hit.</p>
                  <p>• <b>Bill of Materials (BOM):</b> Automated raw material consumption.</p>
                </div>

                <div className="bg-slate-900/70 p-4 rounded-xl border border-sky-500/30 space-y-2">
                  <h4 className="font-bold text-sky-400 text-sm">👥 HRMS & Payroll</h4>
                  <p>• <b>Centralized Directory:</b> Staff records & contracts.</p>
                  <p>• <b>Leave Requests:</b> Self-service approval flows.</p>
                  <p>• <b>1-Click Payroll:</b> Salary slips & tax calculations.</p>
                </div>
              </div>

              <div className="md:col-span-8">
                <div className="bg-slate-900/80 p-2 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/deck_assets/inventory_ops_view.jpg"
                    alt="Inventory & HRMS"
                    className="w-full h-auto rounded-xl object-cover hover:scale-[1.02] transition duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: Autonomous Growth Engine */}
        {currentSlide === 6 && (
          <div className="max-w-6xl mx-auto w-full space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30 font-semibold">
                Autonomous Revenue Engine
              </span>
              <h2 className="text-3xl font-extrabold mt-2">We Don&apos;t Just Record Business — We Help You Win It</h2>
              <p className="text-slate-400 text-sm">Native Marketing, Cold Emailing, and AI Voice Calling Agents</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-900/70 p-6 rounded-2xl space-y-3 border border-sky-500/30 shadow-lg shadow-sky-500/10">
                <div className="text-2xl">📊</div>
                <h3 className="font-bold text-sky-400 text-lg">1. Marketing Suite</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Centralized campaign tracking, landing page builder, and multi-channel attribution. Leads flow directly into CRM stages.
                </p>
                <div className="text-[11px] text-sky-300 bg-sky-950/40 p-2.5 rounded-lg border border-sky-500/20">
                  Replaces HubSpot Marketing ($800/mo)
                </div>
              </div>

              <div className="bg-slate-900/70 p-6 rounded-2xl space-y-3 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <div className="text-2xl">✉️</div>
                <h3 className="font-bold text-purple-400 text-lg">2. Cold Email Engine</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Automated mailbox warmup, AI-generated personalized outreach copy, and sequence follow-ups directly synced to CRM deals.
                </p>
                <div className="text-[11px] text-purple-300 bg-purple-950/40 p-2.5 rounded-lg border border-purple-500/20">
                  Replaces Lemlist / Instantly ($150/mo)
                </div>
              </div>

              <div className="bg-slate-900/70 p-6 rounded-2xl space-y-3 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <div className="text-2xl">📞</div>
                <h3 className="font-bold text-emerald-400 text-lg">3. AI Cold Calling</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Autonomous AI voice agents that dial inbound leads in 60s, qualify prospects, and book calendar meetings (with human SDR support option).
                </p>
                <div className="text-[11px] text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">
                  Transcripts & Sentiment logged in CRM
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 7: Financial ROI */}
        {currentSlide === 7 && (
          <div className="max-w-5xl mx-auto w-full space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-extrabold">Measurable ROI: Why Beraxis Pays for Itself</h2>
              <p className="text-slate-400 text-sm">Hard-dollar annual savings for a typical 25-person growing company</p>
            </div>

            <div className="bg-slate-900/80 rounded-2xl overflow-hidden border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-300 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Expense Category</th>
                    <th className="p-4 text-red-400">Old Fragmented Approach</th>
                    <th className="p-4 text-emerald-400">With Beraxis AI ERP</th>
                    <th className="p-4 text-sky-400">Your Net Annual Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-4 font-bold text-white">Software Subscriptions</td>
                    <td className="p-4">HubSpot + QuickBooks + Katana + Gusto = $960/mo</td>
                    <td className="p-4 text-emerald-300 font-semibold">Single Unified ERP = $199/mo</td>
                    <td className="p-4 font-bold text-emerald-400">+$9,132 / Year Saved</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white">Manual Invoicing Labor</td>
                    <td className="p-4">15.2 hrs/wk typing supplier bills and receipts</td>
                    <td className="p-4 text-emerald-300 font-semibold">3-sec OCR extraction & auto-reconcile</td>
                    <td className="p-4 font-bold text-emerald-400">+$14,592 / Year Saved</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white">Prevented Stockouts</td>
                    <td className="p-4">Lost orders from stockouts & delayed quotes</td>
                    <td className="p-4 text-emerald-300 font-semibold">AI Demand Forecast + 1-Click Quotes</td>
                    <td className="p-4 font-bold text-emerald-400">+$18,600 / Year Captured</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-500/40 text-center">
              <span className="text-xl font-extrabold text-emerald-400">TOTAL ESTIMATED CLIENT VALUE: +$42,324 / YEAR IN MEASURABLE ROI</span>
              <p className="text-xs text-slate-400 mt-0.5">The platform pays for itself within the first 30 days of active deployment.</p>
            </div>
          </div>
        )}

        {/* SLIDE 8: Onboarding & Close */}
        {currentSlide === 8 && (
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div>
              <h2 className="text-4xl font-extrabold">100% Zero-Risk Onboarding Guarantee</h2>
              <p className="text-slate-400 text-sm mt-1">We handle the entire transition so you experience zero business downtime</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="bg-slate-900/70 p-4 rounded-xl border border-sky-500/30">
                <span className="text-xs text-sky-400 font-bold">1. 14-DAY TRIAL</span>
                <h4 className="font-bold text-white text-sm mt-1">Full Access</h4>
                <p className="text-[11px] text-slate-400 mt-1">No credit card required to start.</p>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-emerald-500/30">
                <span className="text-xs text-emerald-400 font-bold">2. FREE MIGRATION</span>
                <h4 className="font-bold text-white text-sm mt-1">Data Concierge</h4>
                <p className="text-[11px] text-slate-400 mt-1">We format & load your Excel data.</p>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-purple-500/30">
                <span className="text-xs text-purple-400 font-bold">3. 15-MIN JUMPSTART</span>
                <h4 className="font-bold text-white text-sm mt-1">Fast Setup</h4>
                <p className="text-[11px] text-slate-400 mt-1">Interactive checklist & sample data.</p>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-amber-500/30">
                <span className="text-xs text-amber-400 font-bold">4. DEDICATED HELP</span>
                <h4 className="font-bold text-white text-sm mt-1">Direct Line</h4>
                <p className="text-[11px] text-slate-400 mt-1">Private WhatsApp/Slack channel.</p>
              </div>
            </div>

            <div className="p-8 bg-slate-900/90 rounded-2xl border border-purple-500/40 space-y-4 shadow-2xl">
              <h3 className="text-2xl font-bold">Ready to Upgrade to Beraxis AI ERP?</h3>
              <p className="text-slate-300 text-sm">Launch your private workspace today or schedule a personalized team demo.</p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link
                  href="/"
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:opacity-95 font-bold text-white transition shadow-lg shadow-purple-600/30 text-sm"
                >
                  🚀 Launch Beraxis Live Workspace
                </Link>
                <a
                  href="/Client_Executive_Pitch_and_Demo_Deck.pdf"
                  download
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-white transition border border-slate-700 text-sm"
                >
                  📥 Download Executive PDF Deck
                </a>
              </div>
              <div className="pt-2 text-xs text-slate-400">
                Priority Support: <a href="mailto:admin@beraxis.online" className="text-sky-400 hover:underline">admin@beraxis.online</a> &nbsp;|&nbsp; Web: <a href="https://www.beraxis.online" className="text-purple-400 hover:underline">www.beraxis.online</a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
