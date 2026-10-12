"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GLOBAL_INDUSTRIES,
  IndustryArchetype,
  GlobalIndustryId
} from "@/lib/industryTaxonomy";
import {
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Cog,
  Stethoscope,
  Truck,
  Building2,
  Wrench,
  HardHat,
  GraduationCap,
  Dumbbell,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Cog,
  Stethoscope,
  Truck,
  Building: Building2,
  Wrench,
  HardHat,
  GraduationCap,
  Dumbbell
};

export default function IndustryShowcase() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<GlobalIndustryId>("fitness_sports_club");

  const selectedIndustry = GLOBAL_INDUSTRIES.find(i => i.id === selectedId) || GLOBAL_INDUSTRIES[0];
  const IconComponent = ICON_MAP[selectedIndustry.iconName] || Building2;

  return (
    <section id="industries" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
      <div className="text-center mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} className="text-purple-400" />
          <span>Tailored Worldwide Archetypes</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
          Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">11 Global Industries</span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-3xl mx-auto font-light leading-relaxed">
          From padel clubs and artisan bakeries to dental clinics, auto repair garages, real estate brokerages, and discrete manufacturing plants — Beraxis auto-configures your exact workflow, POS, KDS, and operational tools out of the box.
        </p>
      </div>

      {/* 11 Industry Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
        {GLOBAL_INDUSTRIES.map(ind => {
          const isSelected = selectedId === ind.id;
          const TabIcon = ICON_MAP[ind.iconName] || Building2;

          return (
            <button
              key={ind.id}
              onClick={() => setSelectedId(ind.id)}
              className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer focus:outline-none ${
                isSelected
                  ? "bg-[#141b2c] border-purple-500 shadow-xl shadow-purple-900/40 ring-1 ring-purple-500"
                  : "bg-[#0b0e17]/80 border-white/5 hover:border-white/20 hover:bg-[#101524]"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-9 h-9 rounded-xl ${ind.themeColor} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                  <TabIcon size={18} />
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <div>
                <h4 className={`text-xs font-bold leading-snug transition-colors ${isSelected ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                  {ind.name.split(" (")[0]}
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{ind.tagline}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Industry Deep-Dive Card */}
      <div className="bg-[#0b0e17]/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Description */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${selectedIndustry.themeColor} flex items-center justify-center text-white shadow-xl shadow-black/50 shrink-0`}>
                <IconComponent size={28} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
                  Enterprise Industry Archetype
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {selectedIndustry.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedIndustry.tagline}</p>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              {selectedIndustry.description}
            </p>

            {/* Operating Modes Badges */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                Pre-Engineered Operation Modes:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedIndustry.operationModes.map(mode => (
                  <div
                    key={mode.id}
                    className="px-3 py-1.5 rounded-xl bg-[#141b2c] border border-white/10 text-xs text-gray-200 flex items-center gap-2"
                  >
                    <span className="font-bold text-white">{mode.badge}</span>
                    <span className="text-gray-400 text-[11px] hidden sm:inline">— {mode.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-Sectors Covered */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                Sub-Sectors & Business Models:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedIndustry.subSectors.map(sub => (
                  <span
                    key={sub}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-gray-300"
                  >
                    • {sub}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => router.push("/signup")}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Launch {selectedIndustry.name.split(" ")[0]} Workspace</span>
                <ArrowRight size={14} />
              </button>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 size={16} />
                <span>Includes 25.8M+ B2B Leads Pool & Full ERP/CRM Suite</span>
              </div>
            </div>
          </div>

          {/* Right Preview Box */}
          <div className="lg:col-span-5 bg-[#101524] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                Active Stack Blueprint
              </span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded">
                {selectedIndustry.defaultModules.length} Modules Included
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] text-gray-400 font-semibold block">Pre-Configured Departments:</span>
              <div className="flex flex-wrap gap-1">
                {selectedIndustry.defaultDepartments.map(dept => (
                  <span key={dept} className="text-[10px] bg-gray-900 border border-gray-800 text-gray-300 px-2 py-0.5 rounded-md">
                    {dept}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-[11px] text-gray-400 font-semibold block">Default Team Roles & Permissions:</span>
              <div className="flex flex-wrap gap-1">
                {selectedIndustry.defaultRoles.map(role => (
                  <span key={role} className="text-[10px] bg-purple-950/40 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <span className="text-[11px] text-gray-400 font-semibold block mb-2">Core Specialized Routes:</span>
              <div className="space-y-1.5">
                {selectedIndustry.specializedRoutes.map(route => (
                  <div key={route.name} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
                    <span className="font-semibold text-white">{route.name}</span>
                    <span className="text-[10px] font-mono text-purple-400">{route.href}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-xs">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1">
                    <Globe size={12} /> Global Leads Pool (Live Scraper)
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">/crm/leads-pool</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
