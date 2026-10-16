"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Download, 
  Play, 
  Pause, 
  RotateCcw, 
  ExternalLink,
  Tag,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";

export default function LaunchCreativesPage() {
  const [activeTab, setActiveTab] = useState<"graphics" | "videos" | "copy">("graphics");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Video simulator state
  const [currentVideoId, setCurrentVideoId] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSeconds, setCurrentSeconds] = useState<number>(0);
  const [demoFormat, setDemoFormat] = useState<"16x9" | "9x16">("16x9");

  const videoData: Record<number, {
    title: string;
    desc: string;
    duration: number;
    steps: Array<{ time: number; image: string; badge: string; headline: string; sub: string; offer: string; }>;
  }> = {
    1: {
      title: 'Reel 1: "The 3-Second Invoice Scanner" (Viral 25s Demo)',
      desc: 'High-converting hook showing invoice upload and instant zero-error balance sheet ledger update.',
      duration: 25,
      steps: [
        { time: 0, image: '/deck_assets/crm_accounting_view.jpg', badge: '⚡ 3-Sec AI OCR Engine', headline: '"Never type an invoice into QuickBooks manually again."', sub: 'AI reads totals, taxes & books automatically in 3.1s.', offer: '🔥 Code: LAUNCH9 ($9.99 Standard)' },
        { time: 6, image: '/deck_assets/dashboard_hero.jpg', badge: '📊 Instant General Ledger', headline: 'Direct sync to Profit & Loss and Cash Flow.', sub: 'Zero manual data entry. Zero reconciliation headache.', offer: '🎁 1 App 100% Free Forever' },
        { time: 14, image: '/deck_assets/inventory_ops_view.jpg', badge: '📦 Unified Inventory & CRM', headline: 'Track every stock item & customer pipeline in 1 place.', sub: 'All business metrics live on one unified dashboard.', offer: '⭐ Code: EARLYBIRD15 ($15.99/mo)' },
        { time: 20, image: '/deck_assets/analytics_growth_view.jpg', badge: '🚀 Launch Offer Live', headline: 'Claim 1 App Free Forever or $9.99 Standard Pass', sub: 'Visit www.beraxis.online right now to get started.', offer: '👉 www.beraxis.online' }
      ]
    },
    2: {
      title: 'Reel 2: "Kill Your $400/Month SaaS Stack" (30s B2B)',
      desc: 'Direct comparison demonstrating how Beraxis replaces QuickBooks, HubSpot, and inventory software.',
      duration: 30,
      steps: [
        { time: 0, image: '/deck_assets/chart_competitor_comparison.png', badge: '❌ Stop SaaS Bloat', headline: 'You are spending $400/mo on 5 separate tools.', sub: 'Accounting + CRM + Inventory + OCR plugins = nightmare.', offer: '⚡ Replace 5 Tools with Beraxis' },
        { time: 8, image: '/deck_assets/dashboard_hero.jpg', badge: '✨ The Beraxis Solution', headline: 'All your operations unified into one AI dashboard.', sub: 'Built for founders, agencies, and growing companies.', offer: '🔥 Code: LAUNCH9 ($9.99 for 1 mo)' },
        { time: 18, image: '/deck_assets/crm_accounting_view.jpg', badge: '🤖 Built-in AI Automation', headline: 'AI auto-drafts invoices and updates CRM pipelines.', sub: 'Save 15+ hours of manual admin every week.', offer: '⭐ Code: EARLYBIRD15 ($15.99/mo)' },
        { time: 25, image: '/deck_assets/analytics_growth_view.jpg', badge: '🎁 Start Free Today', headline: 'No Credit Card Required for 1 Free App', sub: 'Get started in 30 seconds at www.beraxis.online', offer: '🚀 www.beraxis.online' }
      ]
    },
    3: {
      title: 'Reel 3: "Founder Launch Story & Early Bird Pass" (35s)',
      desc: 'Authentic founder walkthrough explaining the launch offer and why 1 app is free forever.',
      duration: 35,
      steps: [
        { time: 0, image: '/deck_assets/dashboard_hero.jpg', badge: '🚀 Public Launch Day', headline: '"Why we made Beraxis AI Free for 1 App Forever"', sub: 'Every business deserves enterprise-grade automation.', offer: '🎁 1 App 100% Free Forever' },
        { time: 10, image: '/deck_assets/inventory_ops_view.jpg', badge: '⚡ Enterprise Features', headline: 'Manage clients, invoices, stock & financials seamlessly.', sub: 'Built with next-gen AI and lightning-fast cloud sync.', offer: '🔥 Standard: $9.99 (Code: LAUNCH9)' },
        { time: 22, image: '/deck_assets/chart_arr_growth.png', badge: '⭐ Lifetime Early Bird Lock', headline: 'Lock in $15.99/Month before prices increase.', sub: 'Lifetime price lock for our first early bird members.', offer: '⭐ Code: EARLYBIRD15' },
        { time: 30, image: '/deck_assets/analytics_growth_view.jpg', badge: '🌐 Launching Now', headline: 'Join thousands of businesses streamlining with AI.', sub: 'Sign up now at www.beraxis.online', offer: '👉 www.beraxis.online' }
      ]
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSeconds((prev) => {
          const maxDur = videoData[currentVideoId].duration;
          if (prev >= maxDur) return 0;
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentVideoId]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const currentVideo = videoData[currentVideoId];
  let activeStep = currentVideo.steps[0];
  for (let i = currentVideo.steps.length - 1; i >= 0; i--) {
    if (currentSeconds >= currentVideo.steps[i].time) {
      activeStep = currentVideo.steps[i];
      break;
    }
  }

  const progressPct = (currentSeconds / currentVideo.duration) * 100;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 selection:bg-cyan-500 selection:text-black pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Digital Marketing & Launch Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Beraxis <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-400">Launch Media Hub</span>
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              High-resolution digital ad banners, interactive video mockups, frame-by-frame production scripts, and one-click campaign copy.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/digital-launch-hub.html" 
              target="_blank"
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Standalone HTML Hub</span>
            </Link>
            <Link 
              href="/billing?promo=LAUNCH9" 
              className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-black shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition"
            >
              <Zap className="w-4 h-4" />
              <span>Test $9.99 Promo Checkout</span>
            </Link>
          </div>
        </div>

        {/* Pricing Offer Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Starter Tier</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">100% FREE FOREVER</span>
            </div>
            <div className="text-2xl font-black text-white mt-2">$0 <span className="text-xs font-normal text-slate-400">/ forever</span></div>
            <p className="text-xs text-slate-300 mt-1">1 Module Package with 1 App only (Full Accounting, CRM, or Inventory). No Credit Card required.</p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-yellow-500/40 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Standard Package</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300">CODE: LAUNCH9</span>
            </div>
            <div className="text-2xl font-black text-white mt-2">$9.99 <span className="text-xs font-normal text-slate-400">/ 1 month only</span></div>
            <p className="text-xs text-slate-300 mt-1">Full access multi-app workspace for 30 days. Perfect for startups kicking off.</p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Custom / Early Bird</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">CODE: EARLYBIRD15</span>
            </div>
            <div className="text-2xl font-black text-white mt-2">$15.99 <span className="text-xs font-normal text-slate-400">/ month lifetime lock</span></div>
            <p className="text-xs text-slate-300 mt-1">Unlimited modules & AI automation engine locked in at $15.99/month forever.</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 border-b border-slate-800 mt-10 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("graphics")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "graphics"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Digital Ad Creatives (5 High-Res Graphics)</span>
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "videos"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Live Video Demos & Commercials (Full HD)</span>
          </button>
          <button
            onClick={() => setActiveTab("copy")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "copy"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>Copy-Paste Social & Ad Campaigns</span>
          </button>
        </div>

        {/* TAB 1: GRAPHICS */}
        {activeTab === "graphics" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Digital Ad Creatives (Ready for Social Media & Ads Manager)</h2>
                <p className="text-xs text-slate-400">Optimized for Meta Ads, Instagram Feed/Reels, LinkedIn B2B, Twitter, and TikTok.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Graphic 1 */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group hover:border-slate-700 transition">
                <div>
                  <div className="relative rounded-xl overflow-hidden aspect-square border border-slate-800">
                    <img src="/social_media_assets/ad1_instagram_feed_launch9.png" alt="Instagram Feed Ad $9.99" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500 text-black">1080 x 1080 Feed</span>
                  </div>
                  <h3 className="font-bold text-white text-base mt-4">Standard Launch Offer ($9.99)</h3>
                  <p className="text-xs text-slate-400 mt-1">Instagram Feed, Facebook Feed, and Google Discovery format.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-yellow-400">Code: LAUNCH9</span>
                  <a href="/social_media_assets/ad1_instagram_feed_launch9.png" download className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 transition">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>

              {/* Graphic 2 */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group hover:border-slate-700 transition">
                <div>
                  <div className="relative rounded-xl overflow-hidden aspect-[9/16] max-h-[340px] border border-slate-800">
                    <img src="/social_media_assets/ad2_tiktok_reels_story.png" alt="Story / Reel Ad" className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-400 text-black">1080 x 1920 Story/Reel</span>
                  </div>
                  <h3 className="font-bold text-white text-base mt-4">3-Sec OCR + Launch Pricing</h3>
                  <p className="text-xs text-slate-400 mt-1">Vertical video cover / story for TikTok, Reels & Shorts.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300">Vertical Full HD</span>
                  <a href="/social_media_assets/ad2_tiktok_reels_story.png" download className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 transition">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>

              {/* Graphic 3 */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group hover:border-slate-700 transition">
                <div>
                  <div className="relative rounded-xl overflow-hidden aspect-[1200/628] border border-slate-800">
                    <img src="/social_media_assets/ad3_linkedin_landscape_earlybird15.png" alt="LinkedIn Early Bird Ad" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500 text-white">1200 x 628 Landscape</span>
                  </div>
                  <h3 className="font-bold text-white text-base mt-4">Early Bird Pro Lifetime ($15.99)</h3>
                  <p className="text-xs text-slate-400 mt-1">High conversion for LinkedIn Sponsored Content & X/Twitter.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-300">Code: EARLYBIRD15</span>
                  <a href="/social_media_assets/ad3_linkedin_landscape_earlybird15.png" download className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 transition">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>

              {/* Graphic 4 */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group hover:border-slate-700 transition">
                <div>
                  <div className="relative rounded-xl overflow-hidden aspect-square border border-slate-800">
                    <img src="/social_media_assets/ad4_carousel_comparison_square.png" alt="Comparison Ad" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white">1080 x 1080 Comparison</span>
                  </div>
                  <h3 className="font-bold text-white text-base mt-4">Beraxis vs Old Way ($350+ Legacy)</h3>
                  <p className="text-xs text-slate-400 mt-1">Direct contrast showing cost savings and AI automation.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Cost Savings</span>
                  <a href="/social_media_assets/ad4_carousel_comparison_square.png" download className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 transition">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>

              {/* Graphic 5 */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group hover:border-slate-700 transition">
                <div>
                  <div className="relative rounded-xl overflow-hidden aspect-[1200/628] border border-slate-800">
                    <img src="/social_media_assets/ad5_free_tier_banner.png" alt="Free Forever Banner" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-black">1200 x 628 Lead Gen</span>
                  </div>
                  <h3 className="font-bold text-white text-base mt-4">1 App Included 100% Free Forever</h3>
                  <p className="text-xs text-slate-400 mt-1">Zero-friction lead generation banner (No CC Required).</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">$0 / No CC</span>
                  <a href="/social_media_assets/ad5_free_tier_banner.png" download className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 transition">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: VIDEOS */}
        {activeTab === "videos" && (
          <div className="mt-8 space-y-10">

            {/* FEATURED: LIVE PRODUCT DEMONSTRATION VIDEO */}
            <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold mb-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    FEATURED • 12-INDUSTRY GLOBAL COMMERCIAL (2:12)
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Beraxis AI: 12 Industries, POS, ERP, CRM & 25M+ Leads
                  </h2>
                  <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                    Recorded in the live Beraxis workspace. Showcasing all 12 global industry archetypes, high-speed Point of Sale checkout, Cloud ERP financials, visual Smart CRM, and the proprietary 25M+ B2B Inbound Lead Pool with studio acoustic guitar/piano soundtrack and zero-overlapping narration.
                  </p>
                </div>

                {/* Aspect Ratio Switcher */}
                <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
                  <button
                    onClick={() => setDemoFormat("16x9")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                      demoFormat === "16x9"
                        ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>🖥️ 16:9 Landscape (Full HD)</span>
                  </button>
                  <button
                    onClick={() => setDemoFormat("9x16")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                      demoFormat === "9x16"
                        ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>📱 9:16 Vertical (Reels/TikTok)</span>
                  </button>
                </div>
              </div>

              {/* Video Player Display */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Player Box */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  <div className={`w-full overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-2xl relative ${
                    demoFormat === "16x9" ? "aspect-video" : "max-w-[340px] aspect-[9/16] mx-auto"
                  }`}>
                    <video
                      key={demoFormat}
                      controls
                      playsInline
                      preload="metadata"
                      poster="/social_media_assets/beraxis_12_industries_commercial_preview.gif"
                      src={demoFormat === "16x9" ? "/social_media_assets/beraxis_12_industries_commercial_16x9.mp4" : "/social_media_assets/beraxis_12_industries_commercial_9x16.mp4"}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Quick Action Download Buttons */}
                  <div className="w-full mt-4 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href="/social_media_assets/beraxis_12_industries_commercial_16x9.mp4"
                      download
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download 16:9 MP4 (15.9 MB)</span>
                    </a>
                    <a
                      href="/social_media_assets/beraxis_12_industries_commercial_9x16.mp4"
                      download
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 flex items-center gap-2 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download 9:16 Reel MP4 (9.2 MB)</span>
                    </a>
                    <a
                      href="/social_media_assets/beraxis_12_industries_commercial_preview.gif"
                      download
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 flex items-center gap-2 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Preview GIF (2.1 MB)</span>
                    </a>
                  </div>
                </div>

                {/* Operations Breakdown */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    ⚡ 6 Master Scenes Choreographed (2:12)
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold text-xs mt-0.5">0:00</span>
                      <div>
                        <div className="text-xs font-bold text-white">What Kind of Business Are You? (12 Global Archetypes)</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Showcase across F&B, Retail, Professional Services, Healthcare, Logistics, Real Estate, Automotive, and NGOs.</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-400 font-mono font-bold text-xs mt-0.5">0:26</span>
                      <div>
                        <div className="text-xs font-bold text-white">Dynamic Industry Reconfiguration</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Interactive clicks adapting operational modes, department trees, and specialized modules in real-time.</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono font-bold text-xs mt-0.5">0:45</span>
                      <div>
                        <div className="text-xs font-bold text-white">Enterprise Point of Sale (POS)</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">High-speed touch orders, categories, bakery & drinks carts, multi-terminal registers, and instant receipt sync.</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-400 font-mono font-bold text-xs mt-0.5">1:01</span>
                      <div>
                        <div className="text-xs font-bold text-white">Cloud ERP Financials & Smart CRM</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Visual sales Kanban pipeline, general ledger accounting balance sheets, and multi-warehouse stock counts.</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-bold text-xs mt-0.5">1:26</span>
                      <div>
                        <div className="text-xs font-bold text-white">25,000,000+ Inbound AI Lead Pool</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Proprietary B2B leads engine with hot AI intent scores (96/100), revenue filters, and 1-click CRM pipeline routing.</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-900/40 bg-emerald-950/20 flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 font-mono font-bold text-xs mt-0.5">1:48</span>
                      <div>
                        <div className="text-xs font-bold text-emerald-300">Early-Bird Pricing ($1/mo vs $5/mo) & 1 App Free Forever</div>
                        <div className="text-[11px] text-slate-300 mt-0.5">Transparent early-bird rate: Standard $1/mo Annual ($12/yr) vs $5/mo Monthly. 1 App Free forever with no credit card required.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ADDITIONAL COMMERCIALS & INFLUENCER ADS GALLERY */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Production Commercials & Influencer Video Ads</h3>
                <p className="text-xs text-slate-400">High-converting social ad creatives ready for Meta Ads Manager, TikTok Spark Ads, and YouTube pre-rolls.</p>
              </div>

              {/* FLAGSHIP AI FEMALE MODEL PRESENTER COMMERCIAL */}
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border-2 border-purple-500/40 shadow-2xl shadow-purple-500/10 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold mb-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                      NEW • AI FEMALE FOUNDER PRESENTER COMMERCIAL (46s)
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      "Stop Overpaying for Software" — AI Presenter Commercial
                    </h3>
                    <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                      Stylized creator commercial featuring a charismatic AI female tech founder speaking directly to camera with cinematic Ken Burns camera tracking, floating live UI cards, cost breakdown comparison, and upbeat studio acoustic guitar & piano music.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-purple-400">46.0s Full HD</span>
                    <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">Dual Format</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Video Player */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-2xl overflow-hidden bg-black border-2 border-purple-500/30 shadow-2xl">
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        poster="/social_media_assets/ai_female_model_commercial_preview.gif"
                        src="/social_media_assets/ai_female_model_commercial_9x16.mp4"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-full mt-4 flex items-center justify-center gap-3">
                      <a
                        href="/social_media_assets/ai_female_model_commercial_9x16.mp4"
                        download
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white flex items-center gap-2 shadow-lg shadow-purple-500/25 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download 9:16 Reel (13.9 MB)</span>
                      </a>
                      <a
                        href="/social_media_assets/ai_female_model_commercial_16x9.mp4"
                        download
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 flex items-center gap-2 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>16:9 Landscape (8.1 MB)</span>
                      </a>
                    </div>
                  </div>

                  {/* Scene Breakdown & Pitch Angle */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                      ⚡ 4 Dynamic Presenter Scenes (46.0s)
                    </div>
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-mono font-bold text-xs mt-0.5">0:00</span>
                        <div>
                          <div className="text-xs font-bold text-white">The $400 SaaS Tax Disruptive Hook</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Direct eye contact from AI presenter calling out subscription bloat: QuickBooks ($85/mo), HubSpot ($50/mo), inventory apps ($120/mo).</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono font-bold text-xs mt-0.5">0:09</span>
                        <div>
                          <div className="text-xs font-bold text-white">Gesture Demonstration & Floating UI Card</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Presenter gestures to a floating 3D glass card demonstrating 25M+ B2B leads, Cloud ERP financials, and touch POS.</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-bold text-xs mt-0.5">0:25</span>
                        <div>
                          <div className="text-xs font-bold text-emerald-300">Radical Cost Disruption ($1/mo vs $20k Setup)</div>
                          <div className="text-[11px] text-slate-300 mt-0.5">Contrast against legacy SAP/NetSuite fees with Beraxis $1/mo early-bird annual plan or 1 App 100% Free Forever.</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                        <span className="px-2 py-0.5 rounded bg-yellow-950 text-yellow-400 font-mono font-bold text-xs mt-0.5">0:36</span>
                        <div>
                          <div className="text-xs font-bold text-yellow-300">Live Phone Display & Irresistible CTA</div>
                          <div className="text-[11px] text-slate-300 mt-0.5">Presenter holding phone showing the live Beraxis app with glowing CTA directing viewers to www.beraxis.online.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Video 1: Master Commercial */}
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="relative rounded-xl overflow-hidden aspect-[9/16] max-h-[300px] bg-black border border-slate-800">
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        src="/social_media_assets/beraxis_master_commercial_32s.mp4"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-400 text-black">32s Commercial</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mt-3">Cinematic Master Commercial (32s)</h4>
                    <p className="text-xs text-slate-400 mt-1">SaaS overload transformation with full voiceover, dynamic soundtrack & pricing reveal.</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-300">5.0 MB MP4</span>
                    <a href="/social_media_assets/beraxis_master_commercial_32s.mp4" download className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 transition">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>

                {/* Video 2: Influencer Scale Ad */}
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="relative rounded-xl overflow-hidden aspect-[9/16] max-h-[300px] bg-black border border-slate-800">
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        src="/social_media_assets/female_influencer_scale_ad_30s.mp4"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-400 text-black">30s Influencer</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mt-3">Influencer Scale Ad ($1 vs $5)</h4>
                    <p className="text-xs text-slate-400 mt-1">Creator walkthrough highlighting early-bird $1/mo annual rate and lead pool.</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-300">6.2 MB MP4</span>
                    <a href="/social_media_assets/female_influencer_scale_ad_30s.mp4" download className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 transition">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>

                {/* Video 3: Influencer $1 Offer */}
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="relative rounded-xl overflow-hidden aspect-[9/16] max-h-[300px] bg-black border border-slate-800">
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        src="/social_media_assets/female_influencer_ad_1dollar.mp4"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-400 text-black">Viral Reel</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mt-3">Influencer Viral Hook Reel (30s)</h4>
                    <p className="text-xs text-slate-400 mt-1">High-energy viral hook focusing on $1/month early-bird access and free tier.</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-yellow-300">3.2 MB MP4</span>
                    <a href="/social_media_assets/female_influencer_ad_1dollar.mp4" download className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 transition">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 8-PART SHORT PITCH ADS & CUSTOMER ENGAGEMENT COMMERCIALS SUITE */}
            <div className="space-y-10 pt-8 border-t border-slate-800">
              
              {/* SECTION 1: SHORT PREMIUM PITCH ADS */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-1">
                      <span>⚡ 5 SHORT PREMIUM PITCH ADS (15s–45s)</span>
                    </div>
                    <h3 className="text-2xl font-black text-white">Ultra-High Conversion Pitch Ads</h3>
                    <p className="text-xs text-slate-400">Paced for instant attention retention, direct competitor contrast, and early-bird $1/mo trial activation.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">🎸 Studio Acoustic Music</span>
                    <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300">100% Zero-Overlap Audio</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Ad 1: SaaS Tax */}
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group hover:border-cyan-500/40 transition">
                    <div>
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-slate-800">
                        <img src="/social_media_assets/ad1_saas_tax_preview.gif" alt="Ad 1 SaaS Tax" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white">Ad 1 • 37.5s</span>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-cyan-400">Dual Format</span>
                      </div>
                      <h4 className="font-bold text-white text-base mt-3">The $400 SaaS Tax</h4>
                      <p className="text-xs text-slate-400 mt-1">Directly exposes SaaS subscription bloat ($400/mo) and replaces QuickBooks, HubSpot, and fragmented tools with Beraxis for $1/mo.</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <a href="/social_media_assets/ad1_saas_tax_16x9.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>16:9 (3.1M)</span>
                        </a>
                        <a href="/social_media_assets/ad1_saas_tax_9x16.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>9:16 (2.2M)</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Ad 2: Customer Generator */}
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group hover:border-cyan-500/40 transition">
                    <div>
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-slate-800">
                        <img src="/social_media_assets/ad2_customer_generator_preview.gif" alt="Ad 2 Customer Generator" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black">Ad 2 • 43.5s</span>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-cyan-400">Dual Format</span>
                      </div>
                      <h4 className="font-bold text-white text-base mt-3">The Customer Generator (25M+ Leads)</h4>
                      <p className="text-xs text-slate-400 mt-1">Differentiates Beraxis from dead ERP databases by showcasing the built-in 25M+ lead engine that fills sales pipelines automatically.</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <a href="/social_media_assets/ad2_customer_generator_16x9.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>16:9 (3.6M)</span>
                        </a>
                        <a href="/social_media_assets/ad2_customer_generator_9x16.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>9:16 (2.4M)</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Ad 3: 12-Industry Chameleon */}
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group hover:border-cyan-500/40 transition">
                    <div>
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-slate-800">
                        <img src="/social_media_assets/ad3_industry_chameleon_preview.gif" alt="Ad 3 12 Industries" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500 text-white">Ad 3 • 49.4s</span>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-cyan-400">Dual Format</span>
                      </div>
                      <h4 className="font-bold text-white text-base mt-3">The 12-Industry Chameleon</h4>
                      <p className="text-xs text-slate-400 mt-1">Bakery, garage, real estate, or retail: demonstrates 1-click archetype morphing, instant department trees, and specialized touch POS.</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <a href="/social_media_assets/ad3_industry_chameleon_16x9.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>16:9 (5.2M)</span>
                        </a>
                        <a href="/social_media_assets/ad3_industry_chameleon_9x16.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>9:16 (3.0M)</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Ad 4: 15s Executive Speed Pitch */}
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group hover:border-cyan-500/40 transition">
                    <div>
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-slate-800">
                        <img src="/social_media_assets/ad4_speed_pitch_preview.gif" alt="Ad 4 Speed Pitch" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-black">Ad 4 • 26.8s</span>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-cyan-400">Speed Pitch</span>
                      </div>
                      <h4 className="font-bold text-white text-base mt-3">15s Executive Speed Pitch</h4>
                      <p className="text-xs text-slate-400 mt-1">Ultra-rapid punchy pitch delivering the full core value proposition: 1 app free forever, $1/month full access, zero credit card friction.</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <a href="/social_media_assets/ad4_speed_pitch_16x9.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>16:9 (3.1M)</span>
                        </a>
                        <a href="/social_media_assets/ad4_speed_pitch_9x16.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>9:16 (1.9M)</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Ad 5: Anti-Legacy ERP Manifesto */}
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group hover:border-cyan-500/40 transition">
                    <div>
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-slate-800">
                        <img src="/social_media_assets/ad5_anti_legacy_preview.gif" alt="Ad 5 Anti Legacy" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-black">Ad 5 • 57.0s</span>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-cyan-400">Manifesto</span>
                      </div>
                      <h4 className="font-bold text-white text-base mt-3">The Anti-Legacy ERP Manifesto</h4>
                      <p className="text-xs text-slate-400 mt-1">Ditches the $20,000 consultant fees and 6-month onboarding hell of SAP & NetSuite. Deploy modern ERP & POS in 30 seconds for $1/month.</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <a href="/social_media_assets/ad5_anti_legacy_16x9.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>16:9 (4.6M)</span>
                        </a>
                        <a href="/social_media_assets/ad5_anti_legacy_9x16.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>9:16 (3.1M)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CUSTOMER ENGAGEMENT COMMERCIALS */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold mb-1">
                      <span>🎯 3 CUSTOMER ENGAGEMENT COMMERCIALS (45s–70s)</span>
                    </div>
                    <h3 className="text-2xl font-black text-white">Lifecycle & Pipeline Commercials</h3>
                    <p className="text-xs text-slate-400">Engineered for deep buyer engagement, demonstrating step-by-step ROI, customer retention, and deal closing acceleration.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-yellow-400">⚡ Live System Tours</span>
                    <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-purple-300">📈 Proven Conversion Funnels</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Engagement Ad 1: Retention Machine */}
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group hover:border-purple-500/40 transition">
                    <div>
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-slate-800">
                        <img src="/social_media_assets/engagement_ad1_retention_preview.gif" alt="Engagement Ad 1 Retention" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500 text-white">Engagement 1 • 48.1s</span>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-cyan-400">Dual Format</span>
                      </div>
                      <h4 className="font-bold text-white text-base mt-3">The Retention Machine</h4>
                      <p className="text-xs text-slate-400 mt-1">Converts one-time buyers into lifetime high-LTV advocates with automated replenishment alerts, loyalty points, and purchase pattern triggers.</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <a href="/social_media_assets/engagement_ad1_retention_16x9.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>16:9 (5.0M)</span>
                        </a>
                        <a href="/social_media_assets/engagement_ad1_retention_9x16.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>9:16 (3.0M)</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Ad 2: Smart CRM Pipeline */}
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group hover:border-purple-500/40 transition">
                    <div>
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-slate-800">
                        <img src="/social_media_assets/engagement_ad2_crm_pipeline_preview.gif" alt="Engagement Ad 2 CRM" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">Engagement 2 • 58.2s</span>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-cyan-400">Dual Format</span>
                      </div>
                      <h4 className="font-bold text-white text-base mt-3">Close Deals 3x Faster: Smart CRM</h4>
                      <p className="text-xs text-slate-400 mt-1">Visual sales drag-and-drop Kanban, auto-generated PDF proposals, digital signature tracking, and automatic accounting ledger sync.</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <a href="/social_media_assets/engagement_ad2_crm_pipeline_16x9.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>16:9 (5.6M)</span>
                        </a>
                        <a href="/social_media_assets/engagement_ad2_crm_pipeline_9x16.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>9:16 (3.3M)</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Ad 3: Leads to Clients */}
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group hover:border-purple-500/40 transition">
                    <div>
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-slate-800">
                        <img src="/social_media_assets/engagement_ad3_leads_to_clients_preview.gif" alt="Engagement Ad 3 Leads to Clients" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-black">Engagement 3 • 69.0s</span>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-cyan-400">Dual Format</span>
                      </div>
                      <h4 className="font-bold text-white text-base mt-3">From 25M Cold Leads to Clients</h4>
                      <p className="text-xs text-slate-400 mt-1">The complete growth engine: filter verified decision makers, push qualified prospects directly to CRM, trigger email sequences, and cash out at POS.</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <a href="/social_media_assets/engagement_ad3_leads_to_clients_16x9.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>16:9 (6.5M)</span>
                        </a>
                        <a href="/social_media_assets/engagement_ad3_leads_to_clients_9x16.mp4" download className="w-[48%] py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-center flex items-center justify-center gap-1.5 transition">
                          <Download className="w-3.5 h-3.5" />
                          <span>9:16 (4.1M)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Interactive Storyboard Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800">
              
              {/* Phone Simulator */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-[300px] h-[580px] bg-black rounded-[40px] border-4 border-slate-700 shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col justify-between">
                  {/* Status Bar */}
                  <div className="relative z-20 px-6 pt-3 flex justify-between items-center text-[10px] text-white">
                    <span>9:41</span>
                    <div className="w-16 h-3.5 bg-black rounded-full mx-auto border border-slate-800"></div>
                    <span>5G 100%</span>
                  </div>

                  {/* Animated Background */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                    style={{ backgroundImage: `url('${activeStep.image}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

                    {/* In-Video Badges & Captions */}
                    <div className="absolute bottom-16 left-4 right-14 z-20 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/90 text-black uppercase">
                          {activeStep.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {activeStep.headline}
                      </h4>
                      <p className="text-[11px] text-slate-200">
                        {activeStep.sub}
                      </p>
                      
                      <div className="inline-block px-2.5 py-1 rounded bg-yellow-500/90 text-black font-bold text-[10px]">
                        {activeStep.offer}
                      </div>
                    </div>

                    {/* Reel sidebar icons */}
                    <div className="absolute bottom-16 right-2 flex flex-col items-center gap-3 z-20 text-white text-[10px]">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-red-400 text-sm">❤️</div>
                        <span>14.2K</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-cyan-400 text-sm">💬</div>
                        <span>842</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-yellow-400 text-sm">🚀</div>
                        <span>Share</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative z-20 p-4">
                    <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-400 h-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Storyboard Controls & Text */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Interactive Video Storyboard</span>
                  <h3 className="text-2xl font-bold text-white mt-1">{currentVideo.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{currentVideo.desc}</p>
                </div>

                {/* Video Selectors */}
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((vid) => (
                    <button
                      key={vid}
                      onClick={() => {
                        setCurrentVideoId(vid);
                        setCurrentSeconds(0);
                        setIsPlaying(false);
                      }}
                      className={`p-3 rounded-xl text-left transition ${
                        currentVideoId === vid
                          ? "bg-slate-800 border-2 border-cyan-400"
                          : "bg-slate-900 border border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-[10px] font-bold text-cyan-400">REEL #{vid}</div>
                      <div className="text-xs font-semibold text-white truncate">{videoData[vid].title.split(":")[1]}</div>
                      <div className="text-[10px] text-slate-400">{videoData[vid].duration} Seconds</div>
                    </button>
                  ))}
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? "Pause Preview" : "Play Simulation"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentSeconds(0);
                      setIsPlaying(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restart</span>
                  </button>
                  <span className="text-xs font-mono text-slate-400">
                    {String(Math.floor(currentSeconds / 60)).padStart(2, '0')}:{String(currentSeconds % 60).padStart(2, '0')} / {String(Math.floor(currentVideo.duration / 60)).padStart(2, '0')}:{String(currentVideo.duration % 60).padStart(2, '0')}
                  </span>
                </div>

                {/* Shot List Breakdown */}
                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">🎬 Scene-by-Scene Shot List & Voiceover:</div>
                  {currentVideo.steps.map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono font-bold">{s.time}s</span>
                      <div className="space-y-0.5">
                        <div className="font-bold text-white">{s.badge} — {s.headline}</div>
                        <div className="text-slate-400">{s.sub}</div>
                        <div className="text-[10px] text-yellow-400 font-semibold">{s.offer}</div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 3: COPY PASTE */}
        {activeTab === "copy" && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Meta Ad Copy */}
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-600/30 text-blue-400 border border-blue-500/30">
                    Meta Ads (FB & IG Feed)
                  </span>
                  <button
                    onClick={() => handleCopy("meta", `Still paying $300+/mo across 5 different apps for CRM, Invoicing, and Inventory? 🤯\n\nMeet Beraxis AI — the unified AI ERP & CRM that automates your business:\n⚡ Snap an invoice ➔ Auto-booked to Ledger in 3 seconds flat\n📊 Live Customer CRM & Sales Pipeline\n📦 Automated Stock & Inventory tracking\n🤖 Autonomous AI Business Copilot\n\n🎁 STARTER PLAN: 1 Full App 100% Free Forever (No CC Needed)\n🔥 STANDARD LAUNCH: $9.99 for 1 Month (Code: LAUNCH9)\n⭐ EARLY BIRD PRO: $15.99 / Mo Lifetime (Code: EARLYBIRD15)\n\n👉 Claim your launch offer today: https://www.beraxis.online`)}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    {copiedId === "meta" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "meta" ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-300 space-y-2 bg-slate-950/80 p-4 rounded-xl font-mono leading-relaxed border border-slate-800">
                  <p><strong className="text-yellow-400">🎯 Primary Text:</strong></p>
                  <p>Still paying $300+/mo across 5 different apps for CRM, Invoicing, and Inventory? 🤯</p>
                  <p>Meet Beraxis AI — the unified AI ERP & CRM that automates your business:</p>
                  <p>⚡ Snap an invoice ➔ Auto-booked in 3s<br />
                  📊 Live Customer CRM & Sales Pipeline<br />
                  📦 Automated Stock & Inventory tracking<br />
                  🤖 Autonomous AI Business Copilot</p>
                  <p>🎁 <strong>STARTER:</strong> 1 Full App 100% Free Forever<br />
                  🔥 <strong>STANDARD:</strong> $9.99 for 1 Mo (Code: <strong>LAUNCH9</strong>)<br />
                  ⭐ <strong>EARLY BIRD:</strong> $15.99 / Mo (Code: <strong>EARLYBIRD15</strong>)</p>
                  <p>👉 https://www.beraxis.online</p>
                </div>
              </div>
            </div>

            {/* LinkedIn B2B Copy */}
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-sky-600/30 text-sky-400 border border-sky-500/30">
                    LinkedIn B2B Launch Post
                  </span>
                  <button
                    onClick={() => handleCopy("linkedin", `Most small-to-midsize businesses are bleeding cash on SaaS sprawl.\n\nYou pay for QuickBooks for accounting, HubSpot for CRM, an inventory app, plus third-party OCR plugins. That’s $3,000+ to $5,000 every single year.\n\nWe built Beraxis AI to fix this once and for all:\n1️⃣ Unified ERP engine that reconciles transactions in real-time.\n2️⃣ Intelligent OCR that parses invoices in 3.1 seconds.\n3️⃣ Integrated CRM pipeline synced directly with your ledger.\n\n🚀 Special Launch Offers:\n• 1 Module is 100% FREE forever with 1 full app included.\n• Standard tier is just $9.99 for 1 month with code LAUNCH9.\n• Full Early Bird is $15.99/mo lifetime with code EARLYBIRD15.\n\nTest drive the platform live at https://www.beraxis.online\n\n#ERP #CRM #ArtificialIntelligence #FinTech #Startups`)}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    {copiedId === "linkedin" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "linkedin" ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-300 space-y-2 bg-slate-950/80 p-4 rounded-xl font-mono leading-relaxed border border-slate-800">
                  <p>Most businesses are bleeding cash on SaaS sprawl ($3k-$5k/yr).</p>
                  <p>We built @Beraxis AI to replace 5 tools with 1 high-speed platform:</p>
                  <p>1️⃣ Real-time Accounting & General Ledger<br />
                  2️⃣ 3.1-second AI OCR Invoice Extraction<br />
                  3️⃣ Integrated CRM & Sales Pipeline</p>
                  <p>🎁 1 Full App Free Forever (No CC)<br />
                  🔥 $9.99 for 1 Month (Code: LAUNCH9)<br />
                  ⭐ $15.99 / Month Early Bird (Code: EARLYBIRD15)</p>
                  <p>👉 https://www.beraxis.online</p>
                </div>
              </div>
            </div>

            {/* Twitter Thread */}
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-700/50 text-slate-200 border border-slate-600">
                    X / Twitter Launch Thread
                  </span>
                  <button
                    onClick={() => handleCopy("twitter", `🧵 1/5: We just launched Beraxis AI — the all-in-one ERP & CRM that replaces 5 fragmented SaaS tools.\n\n2/5: Manual bookkeeping is dead. Drop any PDF or snap of an invoice into Beraxis. Our OCR engine parses it in 3.1s.\n\n3/5: No more copying client details between CRM and invoices. Beraxis unifies CRM, Stock Inventory, and Financials.\n\n4/5: Special Launch Offer:\n• 1 App is 100% Free Forever\n• Standard: $9.99 for 1 Month (Code: LAUNCH9)\n• Early Bird: $15.99 / mo (Code: EARLYBIRD15)\n\n5/5: Try it live: https://www.beraxis.online 🚀`)}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    {copiedId === "twitter" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "twitter" ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-300 space-y-2 bg-slate-950/80 p-4 rounded-xl font-mono leading-relaxed border border-slate-800">
                  <p>🧵 1/5: We just launched Beraxis AI — the all-in-one ERP & CRM.</p>
                  <p>2/5: Drop any invoice ➔ 3.1s OCR extraction straight into ledger.</p>
                  <p>3/5: CRM + Inventory + Accounting unified.</p>
                  <p>4/5: 1 App Free Forever | $9.99 Standard (LAUNCH9) | $15.99 Early Bird (EARLYBIRD15)</p>
                  <p>5/5: https://www.beraxis.online</p>
                </div>
              </div>
            </div>

            {/* TikTok / Reels */}
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-pink-600/30 text-pink-400 border border-pink-500/30">
                    TikTok / Reels Caption & Hashtags
                  </span>
                  <button
                    onClick={() => handleCopy("tiktok", `Why is nobody talking about this AI business tool yet? 🤯\n\nYou can scan any invoice in 3 seconds, manage customer CRM pipelines, and track all your warehouse stock in one place.\n\nThey have a 100% FREE plan for 1 app, or get the full standard suite for $9.99 with code "LAUNCH9" or early bird lifetime for $15.99 with code "EARLYBIRD15" 🔥\n\nLink in bio to try it free 👉 @Beraxis\n\n#businessowner #smallbusinesscheck #sidehustle #productivityhacks #erp #crm #techtools #businesshacks #ai`)}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    {copiedId === "tiktok" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "tiktok" ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-300 space-y-2 bg-slate-950/80 p-4 rounded-xl font-mono leading-relaxed border border-slate-800">
                  <p>🎵 Audio: Trending upbeat tech / corporate lo-fi beat</p>
                  <p>Why is nobody talking about this AI business tool yet? 🤯</p>
                  <p>Scan invoices in 3s, manage CRM and track inventory in 1 place.</p>
                  <p>🎁 1 App 100% Free Forever<br />
                  🔥 $9.99 for 1 mo (Code: LAUNCH9)<br />
                  ⭐ $15.99 / mo (Code: EARLYBIRD15)</p>
                  <p>#businessowner #smallbusinesscheck #sidehustle #erp #crm #ai</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
