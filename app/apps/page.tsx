"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Calendar,
    ClipboardList,
    CheckSquare,
    BookOpen,
    Users,
    BarChart3,
    ShoppingCart,
    Package,
    Barcode,
    Clock,
    Grid3x3,
    UserCircle,
    CreditCard,
    UserCheck,
    Target,
    Cog,
    Palette,
    MessageSquare,
    PenTool,
    PieChart,
    Globe,
    Building2,
    UtensilsCrossed,
    ShoppingBag,
    Briefcase,
    Stethoscope,
    Wrench,
    GraduationCap,
    Truck,
    HardHat,
    Plus,
    Sparkles,
    Check,
    ChevronRight,
    Sliders,
    X,
    Dumbbell,
    HeartHandshake,
    Settings,
    Lock,
    Crown,
    User,
    Mic
} from "lucide-react";
import BeraxisSupportWidgets from "@/components/support/BeraxisSupportWidgets";
import UserProfileDropdown from "@/components/shared/UserProfileDropdown";
import { useBranchContext } from "@/lib/branchContext";
import { GLOBAL_INDUSTRIES, GlobalIndustryId, getIndustryById } from "@/lib/industryTaxonomy";
import UniversalBranchSwitcher from "@/components/shared/UniversalBranchSwitcher";
import BranchSetupWizardModal from "@/components/settings/BranchSetupWizardModal";

// Icon mapping for 12 global industries
const INDUSTRY_ICON_MAP: Record<string, any> = {
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
    Dumbbell,
    HeartHandshake
};

// Complete Enterprise App Catalog
const allApps = [
    // Core & Retail
    { name: "Point of Sale", icon: ShoppingBag, color: "bg-amber-600", href: "/pos" },
    { name: "Kitchen (KDS)", icon: UtensilsCrossed, color: "bg-red-600", href: "/pos/kds" },
    { name: "Recipes & BOM", icon: ClipboardList, color: "bg-orange-600", href: "/pos/recipes" },
    { name: "Floor & Tables", icon: Grid3x3, color: "bg-amber-700", href: "/pos/tables" },
    { name: "Club Hub", icon: Dumbbell, color: "bg-emerald-600", href: "/club" },
    { name: "NGOs & Grants", icon: HeartHandshake, color: "bg-rose-600", href: "/ngos" },
    { name: "Website", icon: Globe, color: "bg-blue-600", href: "/website" },
    { name: "eCommerce", icon: ShoppingCart, color: "bg-emerald-600", href: "/shop" },
    { name: "Inventory", icon: Package, color: "bg-purple-600", href: "/inventory" },
    { name: "Barcode", icon: Barcode, color: "bg-[#e11d74]", href: "/barcode" },
    { name: "Purchase", icon: ShoppingCart, color: "bg-pink-600", href: "/purchase" },
    { name: "Sales", icon: BarChart3, color: "bg-orange-500", href: "/sales" },
    { name: "Accounting", icon: CreditCard, color: "bg-red-500", href: "/accounting" },

    // CRM & Growth
    { name: "CRM", icon: Target, color: "bg-cyan-600", href: "/crm" },
    { name: "Leads Pool", icon: Globe, color: "bg-cyan-500", href: "/crm/leads-pool", paidOnly: true },
    { name: "Contacts", icon: Users, color: "bg-purple-500", href: "/contacts" },

    // Operations & Projects
    { name: "Project", icon: Palette, color: "bg-blue-600", href: "/project" },
    { name: "Timesheets", icon: Clock, color: "bg-indigo-500", href: "/timesheets" },
    { name: "Planning", icon: Grid3x3, color: "bg-yellow-500", href: "/planning" },
    { name: "Manufacturing", icon: Cog, color: "bg-[#d9480f]", href: "/manufacturing" },

    // HR & Talent
    { name: "Employees", icon: UserCircle, color: "bg-[#4338ca]", href: "/employees" },
    { name: "Contracts", icon: PenTool, color: "bg-blue-500", href: "/employees/contracts" },
    { name: "Payroll", icon: CreditCard, color: "bg-[#f43f5e]", href: "/payroll" },
    { name: "Attendances", icon: UserCheck, color: "bg-[#f97316]", href: "/attendances" },
    { name: "Recruitment", icon: Target, color: "bg-[#0d9488]", href: "/recruitment" },
    { name: "Team", icon: Users, color: "bg-[#9333ea]", href: "/team" },

    // Specialized Subsystems
    { name: "Sign", icon: PenTool, color: "bg-[#06b6d4]", href: "/sign" },
    { name: "Documents", icon: BookOpen, color: "bg-[#3b82f6]", href: "/documents" },
    { name: "Helpdesk", icon: CheckSquare, color: "bg-[#6366f1]", href: "/helpdesk" },
    { name: "Reports", icon: PieChart, color: "bg-[#7e22ce]", href: "/reports" },
    { name: "Vehicle Jobs", icon: Wrench, color: "bg-red-600", href: "/automotive" },
    { name: "Properties", icon: Building2, color: "bg-indigo-600", href: "/real-estate" },
    { name: "Education", icon: GraduationCap, color: "bg-teal-600", href: "/education" },
    { name: "Appointments", icon: Calendar, color: "bg-cyan-500", href: "/appointments" },
    { name: "Discuss", icon: MessageSquare, color: "bg-orange-500", href: "/discuss" },
    { name: "Meet", icon: Users, color: "bg-purple-600", href: "/meet" },
    { name: "Knowledge", icon: BookOpen, color: "bg-teal-500", href: "/knowledge" },
    { name: "To do", icon: CheckSquare, color: "bg-blue-500", href: "/todo" },
    { name: "Calendar", icon: Calendar, color: "bg-yellow-600", href: "/calendar" },
    { name: "Surveys", icon: MessageSquare, color: "bg-blue-400", href: "/surveys" },
    { name: "Dashboards", icon: Grid3x3, color: "bg-pink-500", href: "/dashboard" },
    { name: "Settings", icon: Cog, color: "bg-[#64748b]", href: "/settings" }
];

// Selectable apps for Free Plan (excludes Settings which is always free, and excludes Leads Pool which is Paid Only)
const FREE_PLAN_SELECTABLE_APPS = allApps.filter(
    app => app.href !== "/settings" && app.href !== "/crm/leads-pool"
);

export default function AppsDashboardPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    // Branch Context
    const {
        branches,
        activeBranch,
        activeIndustry,
        hasSelectedIndustry,
        isFreePlan,
        userPlan,
        freeSelectedApp,
        setFreeSelectedApp,
        createBranch,
        isModuleActive,
        refreshUserContext
    } = useBranchContext();

    // Industry Selection & Onboarding Mode
    const [isSelectingIndustry, setIsSelectingIndustry] = useState(false);
    const [isManageAppsModalOpen, setIsManageAppsModalOpen] = useState(false);
    const [upgradePromptModal, setUpgradePromptModal] = useState<{ open: boolean; title: string; reason: string }>({
        open: false,
        title: "",
        reason: ""
    });

    const [selectedIndId, setSelectedIndId] = useState<GlobalIndustryId>("professional_services");
    const [selectedSubSector, setSelectedSubSector] = useState("");
    const [selectedOpMode, setSelectedOpMode] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [entityType, setEntityType] = useState<"individual" | "company">("individual");
    const [chosenFreeAppHref, setChosenFreeAppHref] = useState<string>("/accounting");

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/login");
            return;
        }

        refreshUserContext();

        const cachedUserStr = localStorage.getItem("user");
        if (cachedUserStr) {
            try {
                const parsed = JSON.parse(cachedUserStr);
                setUserData(parsed);
                const accType = parsed.account_type || parsed.user_metadata?.account_type || "individual";
                setEntityType(accType === "company" ? "company" : "individual");
                const initialCompName =
                    parsed.company_name ||
                    parsed.user_metadata?.company_name ||
                    (parsed.name ? `${parsed.name}'s Entity` : "");
                if (initialCompName) {
                    setCompanyName(initialCompName);
                }
            } catch {}
        }

        const defaultInd = getIndustryById("professional_services");
        setSelectedSubSector(defaultInd.subSectors[0] || "");
        setSelectedOpMode(defaultInd.operationModes[0]?.id || "default");
    }, [router, refreshUserContext]);

    useEffect(() => {
        if (freeSelectedApp && freeSelectedApp !== "/settings" && freeSelectedApp !== "/crm/leads-pool") {
            setChosenFreeAppHref(freeSelectedApp);
        }
    }, [freeSelectedApp]);

    const handlePickIndustry = (indId: GlobalIndustryId) => {
        setSelectedIndId(indId);
        const ind = getIndustryById(indId);
        setSelectedSubSector(ind.subSectors[0] || "");
        setSelectedOpMode(ind.operationModes[0]?.id || "default");
        // Recommend primary app from this industry if on Free Plan and user hasn't explicitly picked from billing
        if (isFreePlan && !freeSelectedApp) {
            const firstRecommended = ind.defaultModules.find(
                m => m !== "/settings" && m !== "/crm/leads-pool"
            );
            if (firstRecommended) {
                setChosenFreeAppHref(firstRecommended);
            }
        }
    };

    const handleOpenIndustrySelection = () => {
        if (isFreePlan && branches.length >= 1) {
            setUpgradePromptModal({
                open: true,
                title: "Multi-Company Requires Paid Plan",
                reason: "Your Free Plan includes 1 independent Company / Individual Entity workspace. Upgrade to Standard or Custom Enterprise to create and manage multiple companies."
            });
            return;
        }
        const ind = getIndustryById("professional_services");
        setSelectedIndId("professional_services");
        setSelectedSubSector(ind.subSectors[0]);
        setSelectedOpMode(ind.operationModes[0]?.id || "default");
        setCompanyName("");
        setIsSelectingIndustry(true);
    };

    const handleConfirmLaunch = (e: React.FormEvent) => {
        e.preventDefault();
        const ind = getIndustryById(selectedIndId);
        const fallbackName =
            entityType === "individual"
                ? `${userData?.name || userData?.email?.split("@")[0] || "My"} Individual Entity`
                : `${ind.name.split(" ")[0]} Company`;
        const nameFinal = companyName.trim() || fallbackName;

        let modulesToEnable: string[];
        if (isFreePlan) {
            const appToUse = chosenFreeAppHref || "/accounting";
            setFreeSelectedApp(appToUse);
            modulesToEnable = [appToUse, "/settings"];
        } else {
            modulesToEnable = Array.from(new Set([...ind.defaultModules, "/settings"]));
        }

        // Persist entityType on user object
        try {
            if (userData) {
                const updatedUser = {
                    ...userData,
                    account_type: entityType,
                    company_name: nameFinal
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }
        } catch {}

        createBranch({
            name: nameFinal,
            code: `${selectedIndId.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
            industryId: selectedIndId,
            subSector: selectedSubSector || ind.subSectors[0],
            operationMode: selectedOpMode || ind.operationModes[0]?.id || "default",
            location: "Main Location",
            currency: "$ USD",
            enabledModules: modulesToEnable,
            sharingRules: {
                shareEmployees: false,
                shareCustomers: false,
                shareInventory: false,
                shareAccounting: false,
                shareVendors: false
            },
            isPrimary: branches.length === 0,
            accountType: entityType
        });

        setIsSelectingIndustry(false);
    };

    // Strict App Filtering:
    // - On Free Plan: ONLY the 1 chosen major app + Settings (/settings). NEVER Leads Pool!
    // - On Paid Plan: All enabled modules for the active industry/company + Leads Pool + Settings.
    const displayedApps = activeBranch
        ? isFreePlan
            ? allApps.filter(app => {
                  if (app.href === "/crm/leads-pool") return false;
                  if (app.href === "/settings") return true;
                  const activeFreeHref =
                      freeSelectedApp ||
                      activeBranch.enabledModules.find(
                          m => m !== "/settings" && m !== "/crm/leads-pool"
                      ) ||
                      chosenFreeAppHref;
                  return app.href === activeFreeHref;
              })
            : allApps.filter(
                  app =>
                      isModuleActive(app.href) ||
                      app.href === "/settings" ||
                      app.href === "/dashboard" ||
                      app.href === "/crm/leads-pool"
              )
        : [];

    const chosenInd = getIndustryById(selectedIndId);
    const ChosenIcon = INDUSTRY_ICON_MAP[chosenInd.iconName] || Building2;

    const showOnboarding = !hasSelectedIndustry || isSelectingIndustry || !activeBranch;

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col selection:bg-purple-500 selection:text-white">
            {/* Top Navigation Bar */}
            <header className="border-b border-white/5 bg-[#090d16]/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/apps" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                        <img src="/logo2.png" alt="Beraxis Logo" className="h-7 w-auto" />
                        <span className="font-extrabold text-base tracking-tight text-white">BERAXIS WORKSPACE</span>
                    </Link>
                    {activeBranch && (
                        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {activeIndustry.name}
                        </span>
                    )}
                    <span
                        className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            isFreePlan
                                ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                                : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        }`}
                    >
                        {isFreePlan ? "FREE PLAN (1 APP + SETTINGS)" : `${userPlan.toUpperCase()} PLAN`}
                    </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {hasSelectedIndustry && activeBranch && (
                        <>
                            <UniversalBranchSwitcher />
                            <button
                                onClick={() => {
                                    if (isFreePlan) {
                                        setUpgradePromptModal({
                                            open: true,
                                            title: "Unlock All 28 Apps & 25M+ Leads Pool",
                                            reason: "Your Free Plan allows 1 Major App + Settings. Upgrade to a Paid Plan ($1/mo Early Bird) to install unlimited ERP/CRM apps and unlock the 25.8M+ B2B Leads Pool."
                                        });
                                    } else {
                                        setIsManageAppsModalOpen(true);
                                    }
                                }}
                                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#141b2c] hover:bg-[#1c243a] border border-purple-500/40 text-purple-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                                title="Install or manage apps for active company"
                            >
                                <Settings size={13} className="text-purple-400" />
                                <span>{isFreePlan ? "Unlock More Apps" : "+ Manage Apps"}</span>
                            </button>
                            <button
                                onClick={handleOpenIndustrySelection}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
                            >
                                <Plus size={14} /> + Add New Company
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent("open-voice-pilot"))}
                        title="Launch Voice Operations (Alt+V)"
                        className="flex items-center gap-1.5 text-pink-200 hover:text-white transition-all px-2.5 py-1.5 rounded-xl border border-pink-500/30 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/35 hover:to-pink-600/35 text-xs font-bold cursor-pointer"
                    >
                        <Mic size={13} className="text-pink-400 animate-pulse" />
                        <span className="hidden sm:inline">Voice Ops</span>
                    </button>

                    <Link
                        href="/billing"
                        title="Subscription & Plans"
                        className="hidden sm:flex items-center gap-1 text-amber-300 hover:text-amber-200 transition-colors px-2.5 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold"
                    >
                        <Crown size={13} /> {isFreePlan ? "Upgrade Plan" : "Billing"}
                    </Link>

                    <Link
                        href="/"
                        title="Public Website"
                        className="hidden sm:flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition-colors px-2.5 py-1.5 rounded-xl border border-white/5 hover:bg-white/5 text-xs font-semibold"
                    >
                        <Globe size={14} /> Website
                    </Link>

                    <div className="w-px h-5 bg-white/10 hidden sm:block" />
                    <UserProfileDropdown />
                </div>
            </header>

            {/* Main Canvas Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 flex flex-col justify-center">
                {/* ─── ONBOARDING / INDUSTRY & COMPANY SELECTION GATEWAY ─── */}
                {showOnboarding ? (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200 py-4">
                        <div className="text-center space-y-2 max-w-2xl mx-auto">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                <Sparkles size={12} /> Independent Entity & Workspace Setup
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Set Up Your Company & Business Industry
                            </h1>
                            <p className="text-gray-400 text-xs sm:text-sm">
                                Every account operates as an independent, isolated entity with its own private database. Select your industry and configure your workspace below.
                            </p>
                            {branches.length > 0 && (
                                <button
                                    onClick={() => setIsSelectingIndustry(false)}
                                    className="text-xs text-purple-400 hover:underline pt-1 inline-block"
                                >
                                    ← Back to active workspace ({activeBranch?.name})
                                </button>
                            )}
                        </div>

                        {/* Step 1: 12 Clean Industry Squircle Icons */}
                        <div>
                            <div className="text-center text-xs font-bold uppercase tracking-wider text-purple-300 mb-4">
                                1. Choose Your Industry Sector
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5 max-w-5xl mx-auto">
                                {GLOBAL_INDUSTRIES.map(industry => {
                                    const isSelected = selectedIndId === industry.id;
                                    const IconComponent = INDUSTRY_ICON_MAP[industry.iconName] || Building2;

                                    return (
                                        <button
                                            key={industry.id}
                                            type="button"
                                            onClick={() => handlePickIndustry(industry.id)}
                                            className="flex flex-col items-center gap-2.5 p-2 rounded-2xl group transition-all cursor-pointer focus:outline-none"
                                        >
                                            <div
                                                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl ${industry.themeColor} flex items-center justify-center text-white shadow-xl transition-all duration-200 group-hover:scale-105 ${
                                                    isSelected
                                                        ? "ring-4 ring-purple-400 scale-105 shadow-purple-600/50"
                                                        : "opacity-85 group-hover:opacity-100"
                                                }`}
                                            >
                                                <IconComponent className="w-8 h-8 text-white" />
                                            </div>
                                            <span
                                                className={`text-xs font-semibold text-center transition-colors ${
                                                    isSelected
                                                        ? "text-purple-300 font-bold"
                                                        : "text-gray-300 group-hover:text-white"
                                                }`}
                                            >
                                                {industry.name.split(" (")[0]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 2 & 3: Entity Details + Free Plan 1-App Selection */}
                        <div className="max-w-3xl mx-auto bg-[#0e1322]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-xl ${chosenInd.themeColor} flex items-center justify-center text-white shadow-lg`}>
                                        <ChosenIcon size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm sm:text-base">{chosenInd.name}</h3>
                                        <p className="text-xs text-gray-400">{chosenInd.tagline}</p>
                                    </div>
                                </div>
                                <span
                                    className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border ${
                                        isFreePlan
                                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                            : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                    }`}
                                >
                                    {isFreePlan ? "Free Plan: 1 App + Settings" : `${userPlan.toUpperCase()} Plan: All Apps + Leads Pool`}
                                </span>
                            </div>

                            <form onSubmit={handleConfirmLaunch} className="space-y-5 text-xs">
                                {/* Entity Type Selector: Individual vs Company */}
                                <div>
                                    <label className="font-bold text-gray-300 block mb-2">
                                        2. Entity Structure (Independent Isolated Account)
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setEntityType("individual")}
                                            className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                                                entityType === "individual"
                                                    ? "border-purple-500 bg-purple-500/15 text-white shadow-lg"
                                                    : "border-white/10 bg-black/40 text-gray-400 hover:text-white"
                                            }`}
                                        >
                                            <User size={18} className="text-purple-400 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold text-xs text-white">Individual Entity (Single User)</div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    Operate as an independent individual company with your own private data.
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setEntityType("company")}
                                            className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                                                entityType === "company"
                                                    ? "border-purple-500 bg-purple-500/15 text-white shadow-lg"
                                                    : "border-white/10 bg-black/40 text-gray-400 hover:text-white"
                                            }`}
                                        >
                                            <Building2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold text-xs text-white">Company Organization</div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    Form an isolated company workspace (supports team members on paid plans).
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="sm:col-span-1">
                                        <label className="font-bold text-gray-300 block mb-1">
                                            {entityType === "individual" ? "Entity / Workspace Name *" : "Company Name *"}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={companyName}
                                            onChange={e => setCompanyName(e.target.value)}
                                            placeholder={entityType === "individual" ? "e.g. Alex Consulting" : "e.g. Acme Corp"}
                                            className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-gray-300 block mb-1">Sub-Sector</label>
                                        <select
                                            value={selectedSubSector}
                                            onChange={e => setSelectedSubSector(e.target.value)}
                                            className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                        >
                                            {chosenInd.subSectors.map(s => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-gray-300 block mb-1">Operating Mode</label>
                                        <select
                                            value={selectedOpMode}
                                            onChange={e => setSelectedOpMode(e.target.value)}
                                            className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                        >
                                            {chosenInd.operationModes.map(m => (
                                                <option key={m.id} value={m.id}>
                                                    {m.badge} - {m.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Step 3: Free Plan 1-App Selector */}
                                {isFreePlan && (
                                    <div className="pt-2 border-t border-white/10 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <label className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                                                    <span>3. Select Your 1 Free Major App</span>
                                                    <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-normal">
                                                        + Settings included automatically
                                                    </span>
                                                </label>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    On the Free Plan, you can select <strong className="text-white">1 major app</strong> below.{" "}
                                                    <span className="text-amber-300/90 font-semibold">
                                                        Note: Leads Pool (25.8M+ B2B Leads) is only available on Paid Plans.
                                                    </span>
                                                </p>
                                            </div>
                                            <Link
                                                href="/billing"
                                                className="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline shrink-0"
                                            >
                                                Want all 28 apps + Leads Pool? Upgrade ($1/mo) →
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-2 bg-black/40 border border-white/10 rounded-2xl">
                                            {FREE_PLAN_SELECTABLE_APPS.map(app => {
                                                const AppIcon = app.icon;
                                                const isPicked = chosenFreeAppHref === app.href;
                                                const isIndDefault = chosenInd.defaultModules.includes(app.href);
                                                return (
                                                    <button
                                                        key={app.href}
                                                        type="button"
                                                        onClick={() => setChosenFreeAppHref(app.href)}
                                                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                                                            isPicked
                                                                ? "border-purple-500 bg-purple-600/25 text-white ring-2 ring-purple-500/40 shadow-md"
                                                                : "border-white/5 bg-white/[0.03] text-gray-400 hover:bg-white/[0.08] hover:text-white"
                                                        }`}
                                                    >
                                                        <div className={`w-7 h-7 rounded-lg ${app.color} flex items-center justify-center text-white shrink-0`}>
                                                            <AppIcon size={14} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-bold text-[11px] truncate">{app.name}</div>
                                                            {isIndDefault && (
                                                                <div className="text-[9px] text-purple-300 truncate">Recommended</div>
                                                            )}
                                                        </div>
                                                        {isPicked && <Check size={13} className="text-emerald-400 shrink-0" />}
                                                    </button>
                                                );
                                            })}

                                            {/* Locked Leads Pool Tile (Paid Only) */}
                                            <Link
                                                href="/billing"
                                                className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300/70 hover:bg-amber-500/10 transition-all flex items-center gap-2 cursor-pointer"
                                                title="Leads Pool requires a Paid Plan"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-amber-400 shrink-0">
                                                    <Lock size={13} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-bold text-[11px] truncate">Leads Pool</div>
                                                    <div className="text-[9px] text-amber-400 font-semibold truncate">Paid Plan Only</div>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
                                    <span className="text-[11px] text-gray-400">
                                        {isFreePlan ? (
                                            <>
                                                Active on Launch:{" "}
                                                <strong className="text-white">
                                                    {allApps.find(a => a.href === chosenFreeAppHref)?.name || "Accounting"}
                                                </strong>{" "}
                                                + <strong className="text-white">Settings</strong> (100% Isolated Data)
                                            </>
                                        ) : (
                                            <>{chosenInd.defaultModules.length} tailored industry apps + Leads Pool will be configured</>
                                        )}
                                    </span>
                                    <button
                                        type="submit"
                                        className="flex items-center justify-center gap-1.5 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
                                    >
                                        <span>Launch Isolated Workspace</span>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* ─── WORKSPACE APP GRID ─── */
                    <div className="py-6 sm:py-12 animate-in fade-in duration-200 space-y-10">
                        {isFreePlan && (
                            <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-950/60 via-[#0F172A]/90 to-amber-950/40 border border-purple-500/30 rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                                        <Crown size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                                            <span>Free Plan Workspace ({activeBranch?.name})</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                1 Major App + Settings
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            Upgrade to Standard ($1/mo Annual Early Bird) to unlock all 28 ERP/CRM apps and the{" "}
                                            <strong className="text-cyan-300">25.8M+ Verified B2B Leads Pool</strong>.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/billing"
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg whitespace-nowrap transition-all"
                                >
                                    Upgrade Plan →
                                </Link>
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12 max-w-6xl mx-auto">
                            {displayedApps.map(app => {
                                const IconComponent = app.icon;

                                return (
                                    <Link
                                        key={app.name}
                                        href={app.href}
                                        className="group flex flex-col items-center gap-3.5 focus:outline-none cursor-pointer"
                                    >
                                        {/* Vibrant Squircle Icon */}
                                        <div
                                            className={`w-20 h-20 sm:w-22 sm:h-22 rounded-3xl ${app.color} flex items-center justify-center text-white shadow-xl shadow-black/40 group-hover:scale-110 transition-transform duration-200 ease-out`}
                                        >
                                            <IconComponent className="w-10 h-10 text-white" strokeWidth={1.8} />
                                        </div>

                                        {/* Clean Label Beneath Icon */}
                                        <span className="text-xs sm:text-sm font-medium text-gray-300 group-hover:text-white transition-colors text-center tracking-tight">
                                            {app.name}
                                        </span>
                                    </Link>
                                );
                            })}

                            {/* Locked Leads Pool Tile for Free Plan Users */}
                            {isFreePlan && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setUpgradePromptModal({
                                            open: true,
                                            title: "Leads Pool Requires a Paid Plan",
                                            reason: "The 25.8M+ Verified B2B Leads Pool & Live Business Scraper is exclusively available on Paid Plans (Standard or Custom Enterprise). Upgrade your subscription to unlock instant lead extraction."
                                        })
                                    }
                                    className="group flex flex-col items-center gap-3.5 focus:outline-none cursor-pointer relative"
                                    title="Leads Pool is available only on Paid Plans"
                                >
                                    <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gray-900/80 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-black/40 group-hover:scale-105 transition-transform duration-200 ease-out relative">
                                        <Globe className="w-9 h-9 opacity-40" strokeWidth={1.8} />
                                        <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                                            <Lock size={10} /> PAID
                                        </div>
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium text-amber-300/80 group-hover:text-amber-300 transition-colors text-center tracking-tight">
                                        Leads Pool 🔒
                                    </span>
                                </button>
                            )}

                            {/* + Add / Install More Apps Tile */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (isFreePlan) {
                                        setUpgradePromptModal({
                                            open: true,
                                            title: "Upgrade to Unlock All 28 Modules",
                                            reason: "Free Plan users can access 1 selected major app plus Settings. Upgrade to Standard ($1/mo Early Bird) or Custom Enterprise to unlock all 28 ERP & CRM apps."
                                        });
                                    } else {
                                        setIsManageAppsModalOpen(true);
                                    }
                                }}
                                className="group flex flex-col items-center gap-3.5 focus:outline-none cursor-pointer"
                                title={isFreePlan ? "Upgrade to unlock more apps" : "Add or remove modules from active company"}
                            >
                                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-purple-900/30 via-[#141b2c] to-indigo-950/30 border-2 border-dashed border-purple-500/50 hover:border-purple-400 flex items-center justify-center text-purple-300 hover:text-white shadow-xl shadow-black/40 group-hover:scale-110 transition-transform duration-200 ease-out">
                                    <Plus className="w-9 h-9" strokeWidth={2} />
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-purple-400 group-hover:text-purple-300 transition-colors text-center tracking-tight">
                                    {isFreePlan ? "+ Unlock Apps" : "+ Add Apps"}
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Upgrade Plan Modal for Free Plan Restrictions */}
            {upgradePromptModal.open && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-[#0F172A] border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                            <Lock size={26} />
                        </div>
                        <h3 className="text-lg font-extrabold text-white">{upgradePromptModal.title}</h3>
                        <p className="text-xs text-gray-300 leading-relaxed">{upgradePromptModal.reason}</p>
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setUpgradePromptModal({ open: false, title: "", reason: "" })}
                                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-bold"
                            >
                                Close
                            </button>
                            <Link
                                href="/billing"
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg"
                            >
                                View Paid Plans →
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Persistent Support Widgets */}
            <BeraxisSupportWidgets />

            {/* Manage Apps & Entity Configuration Modal */}
            <BranchSetupWizardModal
                isOpen={isManageAppsModalOpen}
                onClose={() => setIsManageAppsModalOpen(false)}
                editingBranch={activeBranch}
            />
        </div>
    );
}
