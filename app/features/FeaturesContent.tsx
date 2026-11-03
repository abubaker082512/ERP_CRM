"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Sparkles,
  Search,
  Layers,
  Flame,
  Check
} from "lucide-react";
import {
  ALL_ENTERPRISE_MODULES,
  MODULE_CATEGORIES,
  EnterpriseModule
} from "@/lib/featuresData";

export default function FeaturesContent() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModules = useMemo(() => {
    return ALL_ENTERPRISE_MODULES.filter((mod) => {
      const matchesCategory =
        selectedCategory === "All" || mod.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        mod.title.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q) ||
        mod.badge.toLowerCase().includes(q) ||
        mod.replaces.toLowerCase().includes(q) ||
        mod.highlights.some((h) => h.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="relative z-10 pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ── 1. Hero Section ── */}
      <div className="text-center max-w-4xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-xs font-bold text-purple-200 uppercase tracking-wider mb-6 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
          <Sparkles size={14} className="text-purple-400 animate-pulse" />
          <span>Unified Enterprise Platform Architecture · 34+ Modules</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-white">
          Every Business Tool You Need. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
            One Intelligent Platform.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed max-w-3xl mx-auto mb-8">
          Replace 8+ fragmented, expensive subscriptions (Salesforce, QuickBooks, Odoo, Toast, ZoomInfo, DocuSign, Gusto). Every core, specialized, and minor operational module operates synchronously from a single high-performance cockpit.
        </p>

        {/* Action Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-300 mb-8 font-medium">
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
            <Check size={14} className="text-emerald-400" />
            <span>1 App 100% Free Forever</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
            <Check size={14} className="text-emerald-400" />
            <span>All 34+ Modules for $1/month</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
            <Check size={14} className="text-emerald-400" />
            <span>1,500 Monthly Lead Credits</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
            <Check size={14} className="text-emerald-400" />
            <span>No Credit Card Required</span>
          </span>
        </div>
      </div>

      {/* ── 2. Sticky Glassmorphic Filter & Search Bar ── */}
      <div className="sticky top-20 z-40 mb-12 p-3 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-[#090D1A]/90 border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_20px_40px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 34+ modules by name, feature (e.g. KDS, Barcode, Payroll, Leads, Sign, BOM)..."
              className="w-full bg-white/5 border border-white/10 focus:border-purple-400/60 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-gray-400 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Module Counter Badge */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <span className="text-xs text-gray-400 font-medium">
              Showing{" "}
              <strong className="text-white font-bold">
                {filteredModules.length}
              </strong>{" "}
              of {ALL_ENTERPRISE_MODULES.length} Modules
            </span>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pt-3 mt-2 border-t border-white/10 no-scrollbar">
          {MODULE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`h-[36px] px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_16px_rgba(168,85,247,0.3)] scale-[1.02]"
                    : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Complete Module Cards Grid ── */}
      {filteredModules.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-[#0F172A]/40 border border-white/10 mb-20">
          <Layers size={40} className="mx-auto text-gray-500 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">
            No modules match &quot;{searchQuery}&quot;
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Try searching for common terms like CRM, POS, Inventory, Payroll, Sign, or Leads.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="galaxy-btn-secondary !px-4 !py-2 text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-24">
          {filteredModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className={`group relative p-6 sm:p-7 rounded-3xl bg-[#090D1A]/90 backdrop-blur-xl border ${mod.border} hover:border-purple-400/50 transition-all duration-300 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.5)] hover:-translate-y-1`}
              >
                {/* Popular Ribbon */}
                {mod.isPopular && (
                  <div className="absolute -top-3 right-6 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider py-0.5 px-3 rounded-full shadow-md flex items-center gap-1">
                    <Flame size={11} className="text-amber-300 animate-pulse" />
                    <span>Popular Module</span>
                  </div>
                )}

                <div>
                  {/* Card Header: Icon + Category Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl ${mod.bg} ${mod.color} border border-white/10 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                      {mod.badge}
                    </span>
                  </div>

                  {/* Title & Replaces Tag */}
                  <h2 className="text-xl font-bold text-white mb-1.5 group-hover:text-purple-300 transition-colors">
                    {mod.title}
                  </h2>
                  <div className="text-[11px] text-amber-300/90 font-medium mb-3.5 flex items-center gap-1">
                    <span className="text-gray-400">Replaces:</span>
                    <span>{mod.replaces}</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                    {mod.description}
                  </p>

                  {/* Feature Bullet Badges */}
                  <div className="space-y-2 mb-6 pt-3 border-t border-white/5">
                    {mod.highlights.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-gray-300"
                      >
                        <CheckCircle2
                          size={13}
                          className="text-emerald-400 shrink-0"
                        />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Action Deep Link */}
                <Link
                  href={mod.href}
                  className="w-full h-[44px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all group-hover:border-purple-400/50 shadow-sm"
                >
                  <span>Explore {mod.title}</span>
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Architecture & Technical Pillars (SEO Heavy) ── */}
      <section className="mb-24 p-8 sm:p-12 rounded-3xl bg-[#090D1A]/90 border border-white/15 shadow-2xl backdrop-blur-2xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-4">
            <Zap size={14} className="text-cyan-400" />
            <span>Unified Single-Tenant Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
            Why Unified Architecture Destroys Fragmented SaaS
          </h2>
          <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed">
            In traditional setups, a company pays for 8 different vendors and spends thousands hiring integration engineers to keep Zapier or Make running. In Beraxis, data lives in one single PostgreSQL engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
              <Zap size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Zero Data Sync Latency</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              When a sales order is completed at your POS counter, inventory deducts immediately, a customer invoice is created, and the double-entry accounting General Ledger balances in under 15 milliseconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Row-Level Security &amp; 256-Bit SSL</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Protected by Supabase PostgreSQL Row Level Security (RLS). Every branch, warehouse, and team member sees only their permitted entities with strict audit vaults.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
              <Sparkles size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Dual-Brain Galaxy AI Copilot</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Cross-module intelligence. Ask questions in natural voice or text like &quot;Show me top 5 delinquent receivables this month&quot; or &quot;Reorder inventory below minimum safety stock.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Comparison CTA Section ── */}
      <section className="mb-24 text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#0F172A]/90 to-pink-950/40 border border-purple-500/30 shadow-[0_0_60px_rgba(139,92,246,0.2)]">
        <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
          Want to See How Beraxis Compares to QuickBooks, Odoo &amp; HubSpot?
        </h2>
        <p className="text-gray-300 text-xs sm:text-base max-w-2xl mx-auto mb-8 font-light">
          Review our granular feature-by-feature comparison matrices to see how fast-growing businesses save over $9,000 every year by switching to Beraxis.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/compare"
            className="galaxy-btn-primary w-full sm:w-auto"
          >
            <span>View Competitor Comparisons</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/pricing"
            className="galaxy-btn-secondary w-full sm:w-auto"
          >
            <span>See Early Bird Pricing ($1/mo)</span>
          </Link>
        </div>
      </section>

      {/* ── 6. Comprehensive SEO FAQ Accordion ── */}
      <section className="max-w-4xl mx-auto mb-20 text-left">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Frequently Asked Questions About Beraxis Features
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Everything you need to know about our modules, pricing, and migration.
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-[#090D1A]/90 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-2">
              Are all 34+ enterprise modules really included in the $1/month plan?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Yes! Under our Early Bird special ($12/year billed upfront or $5/month), every single module—including Double-Entry Accounting, Omnichannel POS, KDS, Smart Inventory, AI CRM, HR &amp; Payroll, e-Sign, and 1,500 monthly B2B Lead Credits—is 100% unlocked with zero hidden add-on paywalls.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090D1A]/90 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-2">
              Can I start for free without entering a credit card?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Absolutely. Our Free Forever plan allows you to pick any 1 full enterprise application (such as Accounting, Inventory, or CRM) completely free forever with zero credit card required.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090D1A]/90 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-2">
              How does the Global B2B Leads Directory work?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              The Leads Directory gives you instant access to over 14,000+ real verified operating enterprises across 50+ countries. Every lead includes company name, verified domain email, direct corporate phone dials, and city/country metadata that you can import into your CRM with 1 click.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090D1A]/90 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-2">
              Can I migrate my existing data from Odoo, QuickBooks, or Excel?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Yes. Beraxis includes 1-click automated CSV/Excel importers for customers, vendors, chart of accounts, product inventory catalogs, and past transactions with automated column matching.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
