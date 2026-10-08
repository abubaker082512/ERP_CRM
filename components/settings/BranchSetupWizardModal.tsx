"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  GLOBAL_INDUSTRIES,
  GlobalIndustryId,
  getIndustryById,
  IndustryArchetype
} from "@/lib/industryTaxonomy";
import { useBranchContext, BusinessBranch, BranchSharingRules } from "@/lib/branchContext";
import {
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Sliders,
  Check,
  Package,
  Layers,
  ShoppingBag,
  Briefcase,
  Cog,
  Stethoscope,
  Truck,
  HardHat,
  GraduationCap,
  Wrench,
  UtensilsCrossed,
  HelpCircle,
  Plus,
  Dumbbell
} from "lucide-react";

// Icon mapping
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

// All available 30+ Enterprise Modules
const ALL_SYSTEM_MODULES = [
  { name: "Club & Fitness Hub", href: "/club", category: "Sports & Fitness", icon: Dumbbell, color: "bg-emerald-600" },
  { name: "Point of Sale (POS)", href: "/pos", category: "Commerce", icon: ShoppingBag, color: "bg-amber-600" },
  { name: "Kitchen Display (KDS)", href: "/pos/kds", category: "Food & Beverage", icon: UtensilsCrossed, color: "bg-red-600" },
  { name: "Recipe & BOM Costing", href: "/pos/recipes", category: "Food & Beverage", icon: Layers, color: "bg-orange-600" },
  { name: "Floor Plan & Tables", href: "/pos/tables", category: "Food & Beverage", icon: Building2, color: "bg-amber-700" },
  { name: "Inventory Management", href: "/inventory", category: "Supply Chain", icon: Package, color: "bg-purple-600" },
  { name: "Barcode Generator", href: "/barcode", category: "Commerce", icon: Package, color: "bg-pink-600" },
  { name: "Purchase & Vendors", href: "/purchase", category: "Supply Chain", icon: ShoppingBag, color: "bg-pink-600" },
  { name: "Sales & Invoicing", href: "/sales", category: "Commerce", icon: Layers, color: "bg-orange-600" },
  { name: "Accounting & Finance", href: "/accounting", category: "Finance", icon: Layers, color: "bg-red-500" },
  { name: "CRM & Pipelines", href: "/crm", category: "Sales & CRM", icon: Briefcase, color: "bg-cyan-600" },
  { name: "Contacts & Clients", href: "/contacts", category: "Sales & CRM", icon: Briefcase, color: "bg-purple-500" },
  { name: "Project Management", href: "/project", category: "Operations", icon: Layers, color: "bg-blue-600" },
  { name: "Timesheets", href: "/timesheets", category: "Operations", icon: Sliders, color: "bg-indigo-500" },
  { name: "Planning & Shift Scheduling", href: "/planning", category: "Operations", icon: Sliders, color: "bg-yellow-500" },
  { name: "Manufacturing Orders", href: "/manufacturing", category: "Production", icon: Cog, color: "bg-orange-700" },
  { name: "Employees & Staff", href: "/employees", category: "Human Resources", icon: Briefcase, color: "bg-indigo-600" },
  { name: "Payroll & Payslips", href: "/payroll", category: "Human Resources", icon: Layers, color: "bg-pink-400" },
  { name: "Biometric Attendance", href: "/attendances", category: "Human Resources", icon: CheckCircle2, color: "bg-orange-400" },
  { name: "Recruitment & Jobs", href: "/recruitment", category: "Human Resources", icon: Briefcase, color: "bg-teal-600" },
  { name: "Contracts & Legal Sign", href: "/employees/contracts", category: "Human Resources", icon: Layers, color: "bg-blue-500" },
  { name: "Sign Digital Studio", href: "/sign", category: "Legal & Docs", icon: Layers, color: "bg-cyan-400" },
  { name: "Appointments & Clinic", href: "/appointments", category: "Services", icon: Stethoscope, color: "bg-cyan-500" },
  { name: "Vehicle Job Cards", href: "/automotive", category: "Automotive", icon: Wrench, color: "bg-red-600" },
  { name: "Property & Tenant Leases", href: "/real-estate", category: "Real Estate", icon: Building2, color: "bg-indigo-600" },
  { name: "Education & Academy", href: "/education", category: "Education", icon: GraduationCap, color: "bg-teal-600" },
  { name: "Documents & Vault", href: "/documents", category: "Operations", icon: Layers, color: "bg-blue-400" },
  { name: "Helpdesk & Tickets", href: "/helpdesk", category: "Services", icon: HelpCircle, color: "bg-indigo-500" },
  { name: "Video Meet Rooms", href: "/meet", category: "Communication", icon: Layers, color: "bg-purple-600" },
  { name: "Surveys & Feedback", href: "/surveys", category: "Marketing", icon: Layers, color: "bg-blue-400" },
  { name: "Knowledge Base", href: "/knowledge", category: "Operations", icon: Layers, color: "bg-teal-500" }
];

interface BranchSetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBranch?: BusinessBranch | null;
}

export default function BranchSetupWizardModal({
  isOpen,
  onClose,
  editingBranch = null
}: BranchSetupWizardModalProps) {
  const { createBranch, updateBranch } = useBranchContext();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // AI Prompt text
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // Wizard state
  const [selectedIndustryId, setSelectedIndustryId] = useState<GlobalIndustryId>(
    editingBranch?.industryId || "food_beverage"
  );
  const [branchName, setBranchName] = useState(editingBranch?.name || "");
  const [branchCode, setBranchCode] = useState(editingBranch?.code || "");
  const [subSector, setSubSector] = useState(editingBranch?.subSector || "");
  const [operationMode, setOperationMode] = useState(editingBranch?.operationMode || "");
  const [location, setLocation] = useState(editingBranch?.location || "San Francisco HQ • 100 Market St");
  const [currency, setCurrency] = useState(editingBranch?.currency || "$ USD");

  // Sharing Rules
  const [sharingRules, setSharingRules] = useState<BranchSharingRules>(
    editingBranch?.sharingRules || {
      shareEmployees: true,
      shareCustomers: true,
      shareInventory: false,
      shareAccounting: true,
      shareVendors: true
    }
  );

  // Selected Modules Checklist
  const [selectedModules, setSelectedModules] = useState<string[]>(
    editingBranch?.enabledModules || getIndustryById(selectedIndustryId).defaultModules
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const currentIndustry = getIndustryById(selectedIndustryId);

  // AI Analyzer simulation
  const handleAiAutoConfigure = () => {
    if (!aiPrompt.trim()) return;
    setIsAiAnalyzing(true);

    setTimeout(() => {
      const lower = aiPrompt.toLowerCase();
      let matchedIndustry: GlobalIndustryId = "food_beverage";
      let matchedSub = "Artisan Bakery & Pastry Shop";
      let matchedMode = "hybrid";

      if (lower.includes("bake") || lower.includes("cafe") || lower.includes("restaurant") || lower.includes("food") || lower.includes("kitchen") || lower.includes("pizza") || lower.includes("bar")) {
        matchedIndustry = "food_beverage";
        matchedSub = lower.includes("bake") ? "Artisan Bakery & Pastry Shop" : lower.includes("cafe") || lower.includes("coffee") ? "Specialty Coffee Cafe" : "Quick Service Restaurant (QSR)";
        matchedMode = lower.includes("takeaway") || lower.includes("delivery") ? "hybrid" : "dine_in";
      } else if (lower.includes("shop") || lower.includes("store") || lower.includes("retail") || lower.includes("cloth") || lower.includes("boutique") || lower.includes("grocery")) {
        matchedIndustry = "retail_supermarket";
        matchedSub = "Fashion & Apparel Boutique";
        matchedMode = "counter_pos";
      } else if (lower.includes("software") || lower.includes("agency") || lower.includes("consult") || lower.includes("law") || lower.includes("legal") || lower.includes("accounting")) {
        matchedIndustry = "professional_services";
        matchedSub = "Software & IT Engineering Agency";
        matchedMode = "hourly_billable";
      } else if (lower.includes("factory") || lower.includes("manufactur") || lower.includes("cnc") || lower.includes("fabricat")) {
        matchedIndustry = "manufacturing";
        matchedSub = "Discrete Product Manufacturing";
        matchedMode = "make_to_stock";
      } else if (lower.includes("clinic") || lower.includes("dental") || lower.includes("doctor") || lower.includes("spa") || lower.includes("salon")) {
        matchedIndustry = "healthcare_wellness";
        matchedSub = lower.includes("dental") ? "Dental Practice" : "Medical & Specialist Clinic";
        matchedMode = "appointment_only";
      } else if (lower.includes("car") || lower.includes("auto") || lower.includes("garage") || lower.includes("repair") || lower.includes("mechanic")) {
        matchedIndustry = "automotive_workshop";
        matchedSub = "Auto Repair & Service Garage";
        matchedMode = "garage_service";
      } else if (lower.includes("property") || lower.includes("real estate") || lower.includes("tenant") || lower.includes("rent")) {
        matchedIndustry = "real_estate";
        matchedSub = "Residential Property Management";
        matchedMode = "leasing_management";
      } else if (lower.includes("school") || lower.includes("academy") || lower.includes("course") || lower.includes("student") || lower.includes("gym")) {
        matchedIndustry = "education_academies";
        matchedSub = "Training Academy & Institute";
        matchedMode = "term_tuition";
      }

      setSelectedIndustryId(matchedIndustry);
      const ind = getIndustryById(matchedIndustry);
      setSubSector(matchedSub);
      setOperationMode(matchedMode);
      setSelectedModules(ind.defaultModules);
      if (!branchName) {
        setBranchName(aiPrompt.length < 30 ? aiPrompt : `${ind.name.split(" ")[0]} Branch`);
      }
      setIsAiAnalyzing(false);
      setStep(2);
    }, 600);
  };

  const handleSelectIndustry = (indId: GlobalIndustryId) => {
    setSelectedIndustryId(indId);
    const ind = getIndustryById(indId);
    setSubSector(ind.subSectors[0]);
    setOperationMode(ind.operationModes[0]?.id || "");
    setSelectedModules(ind.defaultModules);
    if (!branchName) {
      setBranchName(`${ind.name.split(" ")[0]} Hub`);
    }
  };

  const toggleModule = (href: string) => {
    if (selectedModules.includes(href)) {
      setSelectedModules(selectedModules.filter(m => m !== href));
    } else {
      setSelectedModules([...selectedModules, href]);
    }
  };

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) return;

    const payload = {
      name: branchName.trim(),
      code: branchCode.trim() || `${selectedIndustryId.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      industryId: selectedIndustryId,
      subSector: subSector || currentIndustry.subSectors[0],
      operationMode: operationMode || currentIndustry.operationModes[0]?.id || "default",
      location: location.trim() || "Main Facility",
      currency: currency.trim() || "$ USD",
      enabledModules: selectedModules,
      sharingRules,
      isPrimary: false
    };

    if (editingBranch) {
      updateBranch(editingBranch.id, payload);
    } else {
      createBranch(payload);
    }

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto selection:bg-purple-500 selection:text-white">
      <div className="bg-[#0b0e17] border border-gray-700/80 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-white my-auto">
        {/* Wizard Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#101524] rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-600/30 text-white">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {editingBranch ? "Configure Branch & Industry" : "Multi-Entity Industry Onboarding"}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Step {step} of 4
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                {step === 1 && "Select or describe your worldwide industry archetype"}
                {step === 2 && "Configure business branch details & operational mode"}
                {step === 3 && "Set cross-entity resource sharing rules"}
                {step === 4 && "Pre-finalization review & customize active modules"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wizard Step Progress Bar */}
        <div className="grid grid-cols-4 border-b border-gray-800 text-[11px] font-bold text-center bg-gray-900/40 shrink-0">
          {[
            { num: 1, label: "1. Industry Sector" },
            { num: 2, label: "2. Operations & Mode" },
            { num: 3, label: "3. Sharing Rules" },
            { num: 4, label: "4. Review & Modules" }
          ].map(s => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num as any)}
              className={`py-2.5 transition-all border-b-2 ${
                step === s.num
                  ? "border-purple-500 text-purple-300 bg-purple-600/10 font-extrabold"
                  : step > s.num
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-gray-500"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Wizard Step Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs custom-scrollbar">
          {/* STEP 1: INDUSTRY SELECTOR & AI PROMPT */}
          {step === 1 && (
            <div className="space-y-5">
              {/* AI Natural Language Profiler Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 border border-purple-500/30 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <Sparkles size={16} className="animate-spin text-purple-400" />
                  <span>AI Business Auto-Configurator</span>
                </div>
                <p className="text-gray-300 text-xs">
                  Type your business type in plain English (e.g. <em>&quot;We operate an artisan bakery and specialty cafe with dine-in tables, takeaway counter, and fresh batch pastry production&quot;</em>):
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAiAutoConfigure()}
                    placeholder="e.g. Boutique fashion retail store with size/color variants and barcode scanner..."
                    className="flex-1 bg-gray-950/80 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    disabled={isAiAnalyzing || !aiPrompt.trim()}
                    onClick={handleAiAutoConfigure}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {isAiAnalyzing ? "Analyzing..." : "Auto-Detect"}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-3">
                  Or Select Worldwide Industry Archetype (10 Global Categories):
                </span>

                {/* Industry Grid Styled exactly like the Apps Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {GLOBAL_INDUSTRIES.map(industry => {
                    const isSelected = selectedIndustryId === industry.id;
                    const IconComponent = ICON_MAP[industry.iconName] || Building2;
                    return (
                      <div
                        key={industry.id}
                        onClick={() => handleSelectIndustry(industry.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? "bg-[#161c2c] border-purple-500 shadow-xl shadow-purple-950/60 ring-1 ring-purple-500"
                            : "bg-[#101420] border-gray-800 hover:border-gray-700 hover:bg-gray-900/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-11 h-11 rounded-2xl ${industry.themeColor} flex items-center justify-center text-white shadow-lg shrink-0`}>
                            <IconComponent size={22} />
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-bold text-sm text-white flex items-center gap-1.5">
                              <span>{industry.name}</span>
                              {isSelected && <CheckCircle2 size={14} className="text-emerald-400" />}
                            </div>
                            <p className="text-[11px] text-gray-400 line-clamp-1">{industry.tagline}</p>
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-2">
                          {industry.description}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1 border-t border-gray-800/80">
                          {industry.operationModes.map(m => (
                            <span key={m.id} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-900 text-gray-300 border border-gray-800">
                              {m.badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BRANCH DETAILS & OPERATIONAL SETTINGS */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#101524] border border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${currentIndustry.themeColor} flex items-center justify-center text-white font-bold`}>
                    {currentIndustry.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-purple-400">Selected Archetype</span>
                    <h4 className="font-bold text-white text-sm">{currentIndustry.name}</h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold hover:underline"
                >
                  Change Category
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Branch / Business Unit Name *</label>
                  <input
                    type="text"
                    required
                    value={branchName}
                    onChange={e => setBranchName(e.target.value)}
                    placeholder="e.g. Downtown Artisan Bakery & Cafe"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Branch Code / Identifier</label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={e => setBranchCode(e.target.value)}
                    placeholder="e.g. DT-BAKE-01"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Specific Sub-Sector / Nature</label>
                  <select
                    value={subSector}
                    onChange={e => setSubSector(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {currentIndustry.subSectors.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-300 block mb-1">Operating Mode Setting *</label>
                  <select
                    value={operationMode}
                    onChange={e => setOperationMode(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {currentIndustry.operationModes.map(mode => (
                      <option key={mode.id} value={mode.id}>{mode.badge} - {mode.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Facility Address / City</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. 100 Market St, San Francisco, CA"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Primary Operating Currency</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    placeholder="e.g. $ USD, € EUR, £ GBP, د.إ AED"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SELECTABLE CROSS-ENTITY SHARING RULES */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-1">
                <h4 className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                  <Sliders size={14} /> Multi-Entity Resource Sharing Matrix
                </h4>
                <p className="text-gray-300 text-[11px]">
                  Configure which data and records are synchronized across all company branches versus kept isolated to this specific branch.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-850">
                  <div>
                    <span className="font-bold text-white block">Share Employee & HR Directory</span>
                    <span className="text-[10px] text-gray-400">Staff roster & payroll contracts accessible across branches</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sharingRules.shareEmployees}
                    onChange={e => setSharingRules({ ...sharingRules, shareEmployees: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                </label>

                <label className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-850">
                  <div>
                    <span className="font-bold text-white block">Share CRM & Customer Contacts</span>
                    <span className="text-[10px] text-gray-400">Universal customer accounts and loyalty points</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sharingRules.shareCustomers}
                    onChange={e => setSharingRules({ ...sharingRules, shareCustomers: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                </label>

                <label className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-850">
                  <div>
                    <span className="font-bold text-white block">Share Product Catalog (Global Master)</span>
                    <span className="text-[10px] text-gray-400">Shared product SKUs with branch-isolated stock counts</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sharingRules.shareInventory}
                    onChange={e => setSharingRules({ ...sharingRules, shareInventory: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                </label>

                <label className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-850">
                  <div>
                    <span className="font-bold text-white block">Consolidated Accounting General Ledger</span>
                    <span className="text-[10px] text-gray-400">Combined balance sheets with branch-level P&L tracking</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sharingRules.shareAccounting}
                    onChange={e => setSharingRules({ ...sharingRules, shareAccounting: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                </label>

                <label className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-850 sm:col-span-2">
                  <div>
                    <span className="font-bold text-white block">Share Vendors & Purchase Master</span>
                    <span className="text-[10px] text-gray-400">Shared suppliers and central procurement agreements</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sharingRules.shareVendors}
                    onChange={e => setSharingRules({ ...sharingRules, shareVendors: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: PRE-FINALIZATION REVIEW & MODULE TOGGLES */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-400">Ready to Activate</span>
                  <h4 className="font-bold text-white text-sm">
                    {branchName || "New Branch"} • {currentIndustry.name}
                  </h4>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    Mode: <strong className="text-white">{operationMode}</strong> • {selectedModules.length} Modules Active
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-purple-600 text-white font-bold px-3 py-1 rounded-full">
                    {selectedModules.length} Apps Enabled
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Review & Customize Active Modules (1-Click Add or Remove Any App):
                  </span>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSelectedModules(currentIndustry.defaultModules)}
                      className="text-purple-400 hover:underline font-bold"
                    >
                      Reset to Industry Defaults
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedModules(ALL_SYSTEM_MODULES.map(m => m.href))}
                      className="text-blue-400 hover:underline font-bold"
                    >
                      Enable All Apps
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto p-1 border border-gray-800/80 rounded-2xl bg-gray-950/50">
                  {ALL_SYSTEM_MODULES.map(module => {
                    const isEnabled = selectedModules.includes(module.href);
                    const isRecommended = currentIndustry.defaultModules.includes(module.href);
                    const ModIcon = module.icon;

                    return (
                      <div
                        key={module.href}
                        onClick={() => toggleModule(module.href)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isEnabled
                            ? "bg-[#141926] border-purple-500/80 text-white shadow-sm"
                            : "bg-gray-900/40 border-gray-800 text-gray-400 hover:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${module.color} flex items-center justify-center text-white shrink-0`}>
                            <ModIcon size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              <span>{module.name}</span>
                              {isRecommended && (
                                <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500">{module.category}</span>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isEnabled ? "bg-purple-600 border-purple-500 text-white" : "border-gray-700 bg-gray-900"
                        }`}>
                          {isEnabled && <Check size={12} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-4 border-t border-gray-800 flex justify-between items-center bg-[#101524] rounded-b-3xl shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-bold transition-all"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold"
            >
              Cancel
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
              >
                Continue to Step {step + 1} <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalize}
                className="flex items-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                <CheckCircle2 size={16} /> {editingBranch ? "Save & Activate" : "Launch & Activate Entity"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
