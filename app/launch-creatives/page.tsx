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
            <span>Interactive Video Simulator & Scripts (3 Reels)</span>
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
          <div className="mt-8 space-y-6">
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
