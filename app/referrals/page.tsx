"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Gift, 
  ArrowRight, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  Flame,
  CheckCircle2
} from "lucide-react";
import { generateReferralLink, getSocialShareLinks } from "@/lib/referral-service";

export default function ReferralsDashboardPage() {
  const [userCode, setUserCode] = useState<string>("BX");
  const [copied, setCopied] = useState<boolean>(false);
  const [stats, setStats] = useState({
    clicks: 14,
    signups: 3,
    activeSubscribers: 1,
    freeMonthsEarned: 3,
    cashCommissionUsd: 10.80
  });

  useEffect(() => {
    // Generate or fetch user specific referral code
    try {
      const stored = localStorage.getItem("beraxis_user_ref_code");
      if (stored) {
        setUserCode(stored);
      } else {
        const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
        const code = `BX${rand}`;
        localStorage.setItem("beraxis_user_ref_code", code);
        setUserCode(code);
      }
    } catch {
      setUserCode("BXPROMO");
    }
  }, []);

  const referralLink = generateReferralLink(userCode);
  const shareLinks = getSocialShareLinks(referralLink);

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">
      <Navbar />

      <main className="flex-grow pt-28 sm:pt-36 pb-20 relative z-10 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-purple-400 font-semibold">Customer Referral Hub</span>
          </div>

          {/* ── HEADER ── */}
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Gift size={14} className="text-purple-400" />
              <span>Give 1 Month Free, Get 1 Year Free</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Invite Businesses, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">Earn Free Months & Cash</span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
              Every business that registers a workspace through your link receives 1 month of Beraxis Standard completely free. When they upgrade, you earn subscription credits or 30% recurring commission.
            </p>
          </div>

          {/* ── REFERRAL LINK CARD ── */}
          <div className="max-w-3xl mx-auto mb-12 p-6 sm:p-8 rounded-3xl bg-[#0F172A]/90 border border-purple-500/30 shadow-2xl backdrop-blur-xl space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-1">Your Personal Invitation Link</span>
              <p className="text-xs text-gray-400">Share this link with founders, business partners, or counter staff:</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 bg-[#090D1A] border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono text-purple-300 select-all truncate">
                {referralLink}
              </div>
              <button
                onClick={handleCopy}
                className="galaxy-btn-primary !px-6 !py-3 text-xs font-bold flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {copied ? <Check size={15} className="text-emerald-300" /> : <Copy size={15} />}
                <span>{copied ? "Link Copied!" : "Copy Link"}</span>
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-3">1-Click Fast Sharing:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <span>WhatsApp</span>
                </a>
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <span>LinkedIn</span>
                </a>
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <span>Twitter/X</span>
                </a>
                <a
                  href={shareLinks.email}
                  className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>

          {/* ── REFERRAL PERFORMANCE STATS RIBBON ── */}
          <div className="max-w-4xl mx-auto mb-16">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 text-center">Your Live Referral Performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0F172A] border border-white/10 text-center">
                <span className="text-xs text-gray-400 block mb-1">Link Clicks</span>
                <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">{stats.clicks}</span>
                <span className="text-[11px] text-gray-500 block mt-1">Unique Visitors</span>
              </div>
              <div className="p-5 rounded-2xl bg-[#0F172A] border border-white/10 text-center">
                <span className="text-xs text-gray-400 block mb-1">Signups Created</span>
                <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">{stats.signups}</span>
                <span className="text-[11px] text-gray-500 block mt-1">Free Workspaces</span>
              </div>
              <div className="p-5 rounded-2xl bg-[#0F172A] border border-white/10 text-center">
                <span className="text-xs text-gray-400 block mb-1">Active Subscribers</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{stats.activeSubscribers}</span>
                <span className="text-[11px] text-gray-500 block mt-1">Paid Accounts</span>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 text-center">
                <span className="text-xs text-purple-300 block mb-1">Earned Credit</span>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">${stats.cashCommissionUsd.toFixed(2)}</span>
                <span className="text-[11px] text-purple-300/70 block mt-1">Or {stats.freeMonthsEarned} Free Months</span>
              </div>
            </div>
          </div>

          {/* ── REFERRAL RULES & BENEFITS ── */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-2xl bg-[#0F172A]/70 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs mb-3">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Give 1 Month Free</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                When people use your link, their workspace unlocks immediate access to the full Standard Plan with zero payment upfront.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0F172A]/70 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs mb-3">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Get 1 Year Free Credit</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                For every 3 paying businesses you introduce, your company receives 1 full year of Beraxis Standard completely free.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0F172A]/70 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs mb-3">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Or Switch to Cash Payouts</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Want cash instead of credits? Register for our formal affiliate tier to receive 30% lifetime cash payouts via Stripe Connect.
              </p>
            </div>
          </div>

          {/* ── CALL TO ACTION ── */}
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-3">Looking to partner as an agency, influencer, or consultant?</p>
            <Link
              href="/affiliates"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1.5 transition"
            >
              <span>Explore our 30% Lifetime Affiliate Program &amp; Media Kit</span>
              <ArrowRight size={13} />
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
