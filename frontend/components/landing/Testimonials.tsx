"use client";

import Link from "next/link";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Flame,
  Users,
  Building2,
  Check
} from "lucide-react";

interface TestimonialItem {
  name: string;
  role: string;
  company: string;
  industry: string;
  industryColor: string;
  avatarBg: string;
  initials: string;
  roi: string;
  quote: string;
  rating: number;
  migratedFrom?: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Dr. Marcus Vance",
    role: "Founder & Lead Surgeon",
    company: "Vance Family Dental & Clinics",
    industry: "Healthcare & Dental",
    industryColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    avatarBg: "from-cyan-500 to-blue-600",
    initials: "MV",
    roi: "Saved 12 hrs/week",
    migratedFrom: "Replaced 4 fragmented tools",
    rating: 5,
    quote:
      "We replaced 4 disconnected clinic tools with Beraxis. Scheduling, patient invoicing, and clinic inventory sync run seamlessly in one tab. It saved our front desk over 12 hours every week."
  },
  {
    name: "Sofia Martinez",
    role: "Managing Partner",
    company: "PadelPoint Club & Fitness",
    industry: "Sports & Fitness Clubs",
    industryColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    avatarBg: "from-emerald-500 to-teal-600",
    initials: "SM",
    roi: "Zero POS lag on courts",
    migratedFrom: "Switched from generic POS",
    rating: 5,
    quote:
      "The court booking engine combined with the touch POS and member billing runs without a hitch. Our coaches and players love the speed, and the $1/month launch pricing made this an absolute no-brainer."
  },
  {
    name: "Jason Reed",
    role: "Owner & Master Technician",
    company: "Apex Auto Garages & Fleet",
    industry: "Automotive Workshops",
    industryColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    avatarBg: "from-amber-500 to-orange-600",
    initials: "JR",
    roi: "3,800 records migrated in 15m",
    migratedFrom: "QuickBooks + Spreadsheets",
    rating: 5,
    quote:
      "We imported 3,800 customer job cards and vehicle records from our old system in 15 minutes flat using their 1-Click Migration Hub. Zero data loss and instant WhatsApp invoice delivery to drivers."
  },
  {
    name: "David Chen",
    role: "VP of Operations",
    company: "NovaCraft Discrete Manufacturing",
    industry: "Manufacturing & MRP",
    industryColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    avatarBg: "from-purple-500 to-indigo-600",
    initials: "DC",
    roi: "Cut software costs by $680/mo",
    migratedFrom: "Legacy ERP Quote ($20k)",
    rating: 5,
    quote:
      "The multi-level BOMs and stock replenishment triggers are on par with Tier-1 enterprise ERPs that quoted us $20,000 upfront. We configured our entire plant blueprint in 2 days."
  },
  {
    name: "Tariq Al-Mansoor",
    role: "Director of Retail Operations",
    company: "Al-Mansoor Retail & E-Commerce",
    industry: "Retail & Supermarkets",
    industryColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    avatarBg: "from-pink-500 to-rose-600",
    initials: "TA",
    roi: "+22% repeat orders",
    migratedFrom: "Odoo Community + Shopify",
    rating: 5,
    quote:
      "Printing barcodes and sending PDF receipts directly via WhatsApp with one tap has increased our repeat customer retention by 22%. It completely eliminated 3 separate subscription fees."
  },
  {
    name: "Rachel Adams",
    role: "Managing Principal",
    company: "Beacon Strategic Advisory",
    industry: "Professional Services & Legal",
    industryColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    avatarBg: "from-blue-600 to-purple-600",
    initials: "RA",
    roi: "100% billable accuracy",
    migratedFrom: "HubSpot + Harvest",
    rating: 5,
    quote:
      "The AI Voice Pilot alone pays for itself — our consultants log timesheets, client meetings, and deals by voice while driving between offices. It's the most responsive business cockpit we've used."
  }
];

const RANKINGS = [
  {
    platform: "Product Hunt",
    badge: "#1 Product of the Day",
    rating: "Top Rated ERP / CRM",
    color: "from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-300"
  },
  {
    platform: "G2 Crowd",
    badge: "High Performer 2026",
    rating: "4.9 / 5 Stars Overall",
    color: "from-red-500/20 to-rose-500/10 border-red-500/30 text-rose-300"
  },
  {
    platform: "Capterra",
    badge: "Best Value & Ease of Use",
    rating: "Top Business Software",
    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-cyan-300"
  },
  {
    platform: "Enterprise Trust",
    badge: "99.9% Uptime SLA",
    rating: "256-Bit SSL • Cloud Isolated",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300"
  }
];

export default function Testimonials() {
  return (
    <section className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-cyan-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/30 shadow-inner">
          <Flame size={14} className="text-pink-400" />
          <span>Proven Adoption • 100+ Active Workspaces</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Loved by Over{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
            100+ Fast-Growing Businesses
          </span>
        </h2>

        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          From medical clinics and automotive garages to multi-court padel clubs and manufacturing plants &mdash; see why 100+ founders replaced fragmented subscriptions with Beraxis.
        </p>
      </div>

      {/* ─── MOMENTUM ANCHOR BANNER: '100+ WORKSPACES • YOU CAN BE NEXT' ─── */}
      <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/50 via-[#0e1628] to-cyan-950/50 border border-purple-500/30 shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
          {/* Avatar Pile */}
          <div className="flex -space-x-3 shrink-0">
            {TESTIMONIALS.slice(0, 5).map((t, i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.avatarBg} border-2 border-[#0e1628] flex items-center justify-center text-white text-xs font-extrabold shadow-lg`}
              >
                {t.initials}
              </div>
            ))}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-[#0e1628] flex items-center justify-center text-white text-xs font-black shadow-lg">
              +100
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                100+ Workspaces Live This Quarter
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
              Join Over 100+ Businesses Already Scaling &mdash; <span className="text-pink-400">You Can Be Next</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
              Launch all 28 business modules, 1,500 monthly lead credits, and 1-Click Migration for just $1/month.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Start Workspace Now</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/migration"
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 text-sm font-bold transition-all text-center"
          >
            Migrate in 1-Click
          </Link>
        </div>
      </div>

      {/* ─── RANKINGS & AUTHORITY BADGES STRIP ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-14">
        {RANKINGS.map((badge, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-gradient-to-br ${badge.color} border backdrop-blur-md flex flex-col justify-between shadow-lg`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold tracking-wide uppercase">{badge.platform}</span>
              <Award size={16} />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-white">{badge.badge}</div>
              <div className="text-[11px] text-gray-300 font-medium mt-0.5">{badge.rating}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── 6 DETAILED INDUSTRY TESTIMONIAL CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-[#0e1322]/80 hover:bg-[#12192e]/90 border border-white/10 hover:border-purple-500/40 shadow-xl hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 flex flex-col justify-between group backdrop-blur-xl"
          >
            <div>
              {/* Header: Rating & Verified Pill */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                  <span className="text-xs font-bold text-gray-300 ml-1.5">5.0</span>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 size={11} />
                  <span>Verified Workspace</span>
                </div>
              </div>

              {/* Metric Callout Pill */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                  <TrendingUp size={12} className="text-pink-400" />
                  {t.roi}
                </span>

                {t.migratedFrom && (
                  <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                    {t.migratedFrom}
                  </span>
                )}
              </div>

              {/* Quote Body */}
              <p className="text-gray-200 text-xs sm:text-sm leading-relaxed mb-6 font-normal italic">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>

            {/* Author Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${t.avatarBg} flex items-center justify-center text-white font-extrabold text-xs shadow-md shrink-0`}
                >
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-xs truncate group-hover:text-purple-300 transition-colors">
                    {t.name}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">{t.role}</div>
                  <div className="text-[10px] text-gray-500 truncate">{t.company}</div>
                </div>
              </div>

              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border shrink-0 ${t.industryColor}`}
              >
                {t.industry.split(" ")[0]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── BOTTOM SOCIAL PROOF SUMMARY ─── */}
      <div className="mt-14 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-4 px-6 py-3 rounded-2xl bg-[#0e1628]/80 border border-white/10 text-xs text-gray-300 shadow-lg">
          <span className="flex items-center gap-1.5 text-white font-bold">
            <Check size={14} className="text-emerald-400" /> 100+ Onboarded Companies
          </span>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 text-white font-bold">
            <Check size={14} className="text-emerald-400" /> 4.9/5 Average Review Score
          </span>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 text-white font-bold">
            <Check size={14} className="text-emerald-400" /> Zero Vendor Lock-In Guarantee
          </span>
        </div>
      </div>
    </section>
  );
}
