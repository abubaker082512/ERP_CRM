"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { 
  Sparkles, 
  ArrowRight, 
  DollarSign, 
  TrendingUp, 
  Share2, 
  ShieldCheck, 
  Users, 
  CheckCircle, 
  HelpCircle,
  Copy,
  Check,
  Zap,
  Globe,
  Award
} from "lucide-react";
import { calculateAffiliateEarnings, getSocialShareLinks, BERAXIS_AFFILIATE_TIER } from "@/lib/referral-service";

export default function AffiliatesPage() {
  const [workspaceCount, setWorkspaceCount] = useState<number>(25);
  const [copied, setCopied] = useState<boolean>(false);
  const sampleLink = "https://www.beraxis.online/signup?ref=PARTNER";
  const shareLinks = getSocialShareLinks(sampleLink);
  const earnings = calculateAffiliateEarnings(workspaceCount, 12); // based on $12/yr or $5/mo

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(sampleLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B16] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-grow pt-28 sm:pt-36 pb-20 relative z-10 overflow-hidden">
        {/* Glow Ambient Blobs */}
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-purple-400 font-semibold">Affiliate & Partner Program</span>
          </div>

          {/* ── HERO SECTION ── */}
          <div className="text-center max-w-4xl mx-auto space-y-5 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Award size={14} className="text-purple-400" />
              <span>Official Growth Partner Program</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">30% Lifetime Commission</span> Promoting Modern Autonomous ERP
            </h1>

            <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Help businesses escape the $400/month SaaS tax. Refer founders, agencies, and retail shops to Beraxis and receive 30% recurring payouts on every subscription for the lifetime of their account.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center pt-3">
              <Link
                href="/signup?role=affiliate"
                className="galaxy-btn-primary !px-8 !py-3.5 text-sm font-extrabold shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Become a Partner for Free <ArrowRight size={15} />
              </Link>
              <Link
                href="/referrals"
                className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-sm font-semibold transition-all w-full sm:w-auto text-center"
              >
                Existing User Referral Dashboard
              </Link>
            </div>

            {/* Program Highlights Pill */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-400" /> 30% Recurring Lifetime</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-cyan-400" /> 30-Day Cookie Window</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-purple-400" /> Monthly Payouts via Stripe / PayPal / Wise</span>
            </div>
          </div>

          {/* ── INTERACTIVE EARNINGS CALCULATOR ── */}
          <div className="max-w-4xl mx-auto mb-20 p-6 sm:p-10 rounded-3xl bg-[#0F172A]/90 border border-purple-500/30 shadow-2xl backdrop-blur-xl relative">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-1">
                Interactive Earnings Calculator
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                How Much Can You Earn as a Beraxis Partner?
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Drag the slider to project your recurring monthly and annual passive earnings.
              </p>
            </div>

            {/* Slider */}
            <div className="space-y-4 max-w-xl mx-auto mb-10">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-300">Referred Active Workspaces:</span>
                <span className="text-xl font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/30">
                  {workspaceCount} Workspaces
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={workspaceCount}
                onChange={(e) => setWorkspaceCount(Number(e.target.value))}
                className="w-full h-2.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                <span>5 Workspaces</span>
                <span>50 Workspaces</span>
                <span>150 Workspaces</span>
                <span>250+ Workspaces</span>
              </div>
            </div>

            {/* Result Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#090D1A] border border-white/10 text-center">
                <span className="text-xs text-gray-400 block mb-1">Referred Workspaces</span>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">{workspaceCount}</span>
                <span className="text-[11px] text-gray-500 block mt-1">Active Accounts</span>
              </div>
              <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-center">
                <span className="text-xs text-purple-300 block mb-1">Your Monthly Payout (30%)</span>
                <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
                  ${(workspaceCount * 3.6).toFixed(0)}/mo
                </span>
                <span className="text-[11px] text-purple-300/70 block mt-1">Recurring Passive Income</span>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                <span className="text-xs text-emerald-300 block mb-1">Your Annual Projected Income</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  ${(workspaceCount * 3.6 * 12).toFixed(0)}/yr
                </span>
                <span className="text-[11px] text-emerald-300/70 block mt-1">Direct Bank / Stripe Deposit</span>
              </div>
            </div>
          </div>

          {/* ── 4-STEP PARTNER JOURNEY ── */}
          <div className="max-w-5xl mx-auto mb-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">How the Program Works in 4 Steps</h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Zero upfront cost, no technical experience required.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-3xl bg-[#0F172A]/70 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center border border-purple-500/30 text-sm">
                  01
                </div>
                <h3 className="text-base font-bold text-white">Join Free in 30s</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Sign up with your email. Your unique referral code and tracking link are generated immediately.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#0F172A]/70 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center border border-cyan-500/30 text-sm">
                  02
                </div>
                <h3 className="text-base font-bold text-white">Share Your Link</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Share via WhatsApp, LinkedIn, email, YouTube, or your blog using our pre-written social assets.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#0F172A]/70 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 font-bold flex items-center justify-center border border-pink-500/30 text-sm">
                  03
                </div>
                <h3 className="text-base font-bold text-white">30-Day Attribution</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  When visitors click your link, our 30-day tracking cookie attributes their account to you even if they buy weeks later.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#0F172A]/70 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30 text-sm">
                  04
                </div>
                <h3 className="text-base font-bold text-white">Get Paid Monthly</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Receive your 30% recurring commission on the 1st of every month automatically via Stripe, PayPal, or Wise.
                </p>
              </div>
            </div>
          </div>

          {/* ── 1-CLICK SOCIAL PROMOTION TOOLKIT ── */}
          <div className="max-w-4xl mx-auto mb-20 p-6 sm:p-8 rounded-3xl bg-[#0F172A]/80 border border-white/10 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">Fast Sharing Toolkit</span>
                <h3 className="text-xl font-bold text-white">Promote Beraxis in 1 Click</h3>
                <p className="text-xs text-gray-400">Share your tracking link directly with your network:</p>
              </div>

              {/* Copy Sample Link Box */}
              <div className="flex items-center gap-2 bg-[#090D1A] p-2 rounded-2xl border border-white/10">
                <span className="text-xs font-mono text-gray-400 px-2 truncate max-w-[200px] sm:max-w-xs">{sampleLink}</span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shrink-0"
                >
                  {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <span>Share WhatsApp</span>
              </a>
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <span>Share LinkedIn</span>
              </a>
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <span>Share Twitter/X</span>
              </a>
              <a
                href={shareLinks.email}
                className="p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <span>Share Email</span>
              </a>
            </div>
          </div>

          {/* ── FREQUENTLY ASKED QUESTIONS ── */}
          <div className="max-w-4xl mx-auto mb-20 space-y-4">
            <h2 className="text-2xl font-extrabold text-white text-center mb-8">
              Affiliate Program FAQs
            </h2>
            <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle size={16} className="text-purple-400" />
                How long does the 30% commission last?
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 pl-6 leading-relaxed">
                Your commission is recurring for the entire active lifetime of the customer's workspace. As long as they remain a paying subscriber, you get 30% of their subscription every single month or year.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle size={16} className="text-purple-400" />
                What if the customer starts on the Free Tier and upgrades later?
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 pl-6 leading-relaxed">
                You are still credited! Because our 30-day cookie window ties the user's initial account creation to your partner ID, when they upgrade to Standard or Enterprise down the road, your commission activates automatically.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle size={16} className="text-purple-400" />
                How and when do I get paid?
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 pl-6 leading-relaxed">
                Commissions are calculated at the end of each calendar month and disbursed on the 1st of the following month. We support Stripe Connect, PayPal, Wise, and direct bank wire once your balance meets the $50 threshold.
              </p>
            </div>
          </div>

          {/* ── BOTTOM CTA ── */}
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-purple-900/40 via-[#0F172A] to-cyan-950/40 border border-purple-500/30 text-center max-w-4xl mx-auto shadow-2xl space-y-5">
            <span className="px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30 inline-block">
              Start Earning Today
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Ready to Join the Beraxis Partner Network?
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm max-w-xl mx-auto font-light">
              Create your free affiliate account in under 30 seconds and start generating recurring passive income.
            </p>
            <div className="pt-2">
              <Link
                href="/signup?role=affiliate"
                className="galaxy-btn-primary !px-8 !py-3.5 text-sm font-extrabold shadow-lg shadow-purple-600/25 inline-flex items-center gap-2"
              >
                Register as an Affiliate Now <ArrowRight size={15} />
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
