"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
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
    Mic,
    UploadCloud,
    FileSpreadsheet,
    Presentation,
    Sun,
    Moon,
    Search,
    ArrowRight
} from "lucide-react";
import BeraxisSupportWidgets from "@/components/support/BeraxisSupportWidgets";
import UserProfileDropdown from "@/components/shared/UserProfileDropdown";
import { useBranchContext } from "@/lib/branchContext";
import { useTheme } from "@/lib/themeContext";
import { GLOBAL_INDUSTRIES, GlobalIndustryId, getIndustryById } from "@/lib/industryTaxonomy";
import UniversalBranchSwitcher from "@/components/shared/UniversalBranchSwitcher";
import BranchSetupWizardModal from "@/components/settings/BranchSetupWizardModal";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";

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
    // Primary User Executive Dashboard (Always Row 1, Position 1)
    { name: "Dashboard", icon: LayoutDashboard, color: "bg-gradient-to-br from-[#8B5CF6] to-[#EC4899]", href: "/dashboard" },
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
    { name: "Docs (Word)", icon: BookOpen, color: "bg-[#3b82f6]", href: "/documents" },
    { name: "Sheets (Excel)", icon: FileSpreadsheet, color: "bg-emerald-600", href: "/spreadsheets" },
    { name: "Slides (PPT)", icon: Presentation, color: "bg-indigo-600", href: "/slides" },
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
    { name: "Migration Hub", icon: UploadCloud, color: "bg-cyan-600", href: "/migration" },
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
    const { isLight, toggleTheme } = useTheme();
    const spotlightInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                spotlightInputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

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
        refreshUserContext,
        currencySymbol
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
    const [scopeMode, setScopeMode] = useState<"single" | "all">("single");
    const [appCategory, setAppCategory] = useState<"all" | "finance" | "crm" | "ops" | "office">("all");
    const [appSearch, setAppSearch] = useState("");
    const [showLaunchpad, setShowLaunchpad] = useState(false);
    const [bentoStats, setBentoStats] = useState({ revenue: 0, netProfit: 0, invoices: 0, staffAndTickets: 0 });

    useEffect(() => {
        if (typeof window === "undefined") return;
        const targets = scopeMode === "all" && branches.length > 0 ? branches : activeBranch ? [activeBranch] : [];
        let rev = 0, exp = 0, invs = 0, staff = 0;
        for (const b of targets) {
            const prefix = `entity_${b.id}_`;
            try {
                const invList = JSON.parse(localStorage.getItem(`${prefix}accounting_invoices`) || "[]");
                if (Array.isArray(invList)) {
                    const activeInvs = invList.filter((i: any) => i.status !== "void");
                    invs += activeInvs.length;
                    rev += activeInvs.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
                }
                const billList = JSON.parse(localStorage.getItem(`${prefix}accounting_bills`) || "[]");
                if (Array.isArray(billList)) {
                    exp += billList.filter((x: any) => x.status !== "void").reduce((s: number, x: any) => s + (Number(x.amount) || 0), 0);
                }
                const emps = JSON.parse(localStorage.getItem(`${prefix}hr_employees`) || "[]");
                const tkts = JSON.parse(localStorage.getItem(`${prefix}helpdesk_tickets`) || "[]");
                if (Array.isArray(emps)) staff += emps.length;
                if (Array.isArray(tkts)) staff += tkts.length;
            } catch {}
        }
        setBentoStats({ revenue: rev, netProfit: rev - exp, invoices: invs, staffAndTickets: staff });
    }, [scopeMode, branches, activeBranch]);

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

    const handleReconfigureWorkspace = () => {
        const ind = getIndustryById((activeBranch?.industryId as GlobalIndustryId) || "professional_services");
        setSelectedIndId(ind.id);
        setSelectedSubSector(activeBranch?.subSector || ind.subSectors[0]);
        setSelectedOpMode(activeBranch?.operationMode || ind.operationModes[0]?.id || "default");
        setCompanyName(activeBranch?.name || "");
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
    const displayedApps = (activeBranch
        ? isFreePlan
            ? allApps.filter(app => {
                  if (app.href === "/crm/leads-pool") return false;
                  if (app.href === "/dashboard" || app.href === "/settings") return true;
                  const activeFreeHref =
                      freeSelectedApp ||
                      activeBranch.enabledModules.find(
                          m => m !== "/settings" && m !== "/crm/leads-pool" && m !== "/dashboard"
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
        : []
    ).sort((a, b) => (a.href === "/dashboard" ? -1 : b.href === "/dashboard" ? 1 : 0));

    const chosenInd = getIndustryById(selectedIndId);
    const ChosenIcon = INDUSTRY_ICON_MAP[chosenInd.iconName] || Building2;

    const showOnboarding = !hasSelectedIndustry || isSelectingIndustry || !activeBranch;

    if (!mounted) return null;

    return (
        <div className={`min-h-screen flex flex-col selection:bg-purple-500 selection:text-white relative overflow-hidden transition-colors duration-300 ${
            isLight
                ? "bg-[#F6F7FB] text-slate-900"
                : "bg-transparent text-white"
        }`}>
            {/* Top Navigation Bar */}
            <header className={`border-b backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 py-2 flex flex-wrap xl:flex-nowrap items-center justify-between gap-2 transition-colors ${
                isLight
                    ? "border-slate-200/90 bg-white/95 text-slate-900 shadow-sm"
                    : "border-white/10 bg-[#090d16]/90 text-white"
            }`}>
                <div className="flex items-center gap-2 shrink-0">
                    <Link href="/apps" className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0 whitespace-nowrap">
                        <img src="/logo2.png" alt="Beraxis Logo" className="h-7 w-auto" />
                        <span className={`font-extrabold text-sm tracking-tight whitespace-nowrap ${isLight ? "text-slate-900" : "text-white"}`}>BERAXIS WORKSPACE</span>
                    </Link>
                    <span
                        className={`hidden 2xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border whitespace-nowrap ${
                            isFreePlan
                                ? isLight
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                                : isLight
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        }`}
                    >
                        {isFreePlan ? "FREE PLAN" : `${userPlan.toUpperCase()} PLAN`}
                    </span>
                </div>

                <div className="flex flex-wrap xl:flex-nowrap items-center justify-end gap-1.5 sm:gap-2 min-w-0">
                    {hasSelectedIndustry && activeBranch && (
                        <>
                            <UniversalBranchSwitcher />
                            <button
                                onClick={() => {
                                    if (isFreePlan) {
                                        setUpgradePromptModal({
                                            open: true,
                                            title: "Unlock All 28 Apps & Global Leads Directory",
                                            reason: "Your Free Plan allows 1 Major App + Settings. Upgrade to a Paid Plan ($1/mo Early Bird) to install unlimited ERP/CRM apps and unlock the Global B2B Leads Directory."
                                        });
                                    } else {
                                        setIsManageAppsModalOpen(true);
                                    }
                                }}
                                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 border rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm active:scale-95 cursor-pointer ${
                                    isLight
                                        ? "bg-white hover:bg-purple-50 border-purple-200 text-purple-700"
                                        : "bg-[#141b2c] hover:bg-[#1c243a] border-purple-500/40 text-purple-300 hover:text-white"
                                }`}
                                title="Install or manage apps for active company"
                            >
                                <Settings size={13} className="text-purple-500 shrink-0" />
                                <span>{isFreePlan ? "Unlock Apps" : "Manage Apps"}</span>
                            </button>
                            <button
                                onClick={handleOpenIndustrySelection}
                                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
                            >
                                <Plus size={13} className="shrink-0" /> Add Company
                            </button>
                            <Link
                                href="/migration"
                                className={`hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 border rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm active:scale-95 ${
                                    isLight
                                        ? "bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-800"
                                        : "bg-cyan-950/40 hover:bg-cyan-900/50 border-cyan-500/40 text-cyan-300 hover:text-white"
                                }`}
                                title="Import historical data from QuickBooks, Odoo, HubSpot & Excel"
                            >
                                <Sparkles size={13} className="text-cyan-500" />
                                <span>Migrate Data</span>
                            </Link>
                        </>
                    )}

                    {/* Light / Dark Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={isLight ? "Switch to Dark Cosmic Theme" : "Switch to Frosted Light Theme"}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isLight
                                ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
                                : "bg-white/5 hover:bg-white/10 border-white/15 text-amber-300"
                        }`}
                    >
                        {isLight ? <Moon size={13} /> : <Sun size={13} />}
                        <span className="hidden xl:inline">{isLight ? "Dark" : "Light"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent("open-voice-pilot"))}
                        title="Launch Voice Operations (Alt+V)"
                        className={`flex items-center gap-1.5 transition-all px-2.5 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap cursor-pointer ${
                            isLight
                                ? "bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700"
                                : "text-pink-200 hover:text-white border-pink-500/30 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/35 hover:to-pink-600/35"
                        }`}
                    >
                        <Mic size={13} className="text-pink-500 animate-pulse" />
                        <span className="hidden sm:inline">Voice Ops</span>
                    </button>

                    <Link
                        href="/billing"
                        title="Subscription & Plans"
                        className={`hidden sm:flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap ${
                            isLight
                                ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
                                : "text-amber-300 hover:text-amber-200 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20"
                        }`}
                    >
                        <Crown size={13} /> {isFreePlan ? "Upgrade Plan" : "Billing"}
                    </Link>

                    <Link
                        href="/"
                        title="Public Website"
                        className={`hidden sm:flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${
                            isLight
                                ? "text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100"
                                : "text-gray-400 hover:text-cyan-300 border-white/5 hover:bg-white/5"
                        }`}
                    >
                        <Globe size={14} /> Website
                    </Link>

                    <div className="w-px h-5 bg-white/10 hidden sm:block" />
                    <UserProfileDropdown />
                </div>
            </header>

            {/* Main Canvas Area */}
            <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-2 flex flex-col justify-start relative z-10">
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

                                                {/* ─── 1-CLICK MIGRATION CALLOUT FOR SWITCHING USERS ─── */}
                        <div className="max-w-4xl mx-auto p-4 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-[#0e1628] to-purple-950/50 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                                    <UploadCloud size={22} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-white text-sm">Switching from QuickBooks, Odoo, Toast, or Excel?</span>
                                        <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-cyan-500/30">
                                            1-Click Hub
                                        </span>
                                    </div>
                                    <p className="text-gray-300 text-xs mt-0.5">
                                        Import your existing customers, products, chart of accounts, and sales history with zero data loss.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/migration"
                                target="_blank"
                                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold px-4 py-2 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95"
                            >
                                <UploadCloud size={14} />
                                <span>Open Migration Hub</span>
                            </Link>
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
                    /* ─── OPTION C: SPOTLIGHT COMMAND LAUNCHER (Dark Cosmic & Frosted Light) ─── */
                    <div className="py-3 pb-14 animate-in fade-in duration-200 space-y-4 max-w-6xl mx-auto w-full px-1 sm:px-4">
                        {/* Centered Spotlight Command Hero */}
                        <div className="beraxis-glass-hero p-5 sm:p-6 text-center space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className={`flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest ${isLight ? "text-purple-700" : "text-[#38BDF8]"}`}>
                                    <Sparkles size={12} />
                                    <span>
                                        {scopeMode === "all"
                                            ? `All Companies Consolidated (${branches.length || 1})`
                                            : `${activeBranch?.name || "Workspace"} · ${activeIndustry.name}`}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`inline-flex p-0.5 rounded-xl border text-[11px] font-bold ${isLight ? "bg-slate-100 border-slate-200" : "bg-[#060B19]/80 border-white/10"}`}>
                                        <button
                                            type="button"
                                            onClick={() => setScopeMode("single")}
                                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                                scopeMode === "single"
                                                    ? "beraxis-glow-pill"
                                                    : isLight ? "text-slate-600 hover:text-slate-900" : "text-gray-400 hover:text-white"
                                            }`}
                                        >
                                            Single Company
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setScopeMode("all")}
                                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                                scopeMode === "all"
                                                    ? "beraxis-glow-pill"
                                                    : isLight ? "text-slate-600 hover:text-slate-900" : "text-gray-400 hover:text-white"
                                            }`}
                                        >
                                            All ({branches.length || 1})
                                        </button>
                                    </div>

                                    <Link
                                        href="/dashboard"
                                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#38BDF8] text-white text-[11px] font-extrabold shadow-md hover:opacity-95 transition-all flex items-center gap-1"
                                    >
                                        User Dashboard <ArrowRight size={12} />
                                    </Link>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                                    What would you like to run in {scopeMode === "all" ? "your companies" : activeBranch?.name || "your workspace"} today?
                                </h1>

                                {/* Spotlight Search & AI Command Bar */}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (appSearch.trim()) {
                                            router.push(`/ai?q=${encodeURIComponent(appSearch.trim())}`);
                                        }
                                    }}
                                    className={`max-w-2xl mx-auto flex items-center gap-2 rounded-2xl border px-4 py-2.5 transition-all backdrop-blur-md ${
                                        isLight
                                            ? "bg-white/75 border-slate-300/80 shadow-sm focus-within:bg-white/95 focus-within:border-purple-500"
                                            : "bg-white/[0.06] border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] focus-within:bg-white/[0.11] focus-within:border-purple-400/75"
                                    }`}
                                >
                                    <Search size={16} className={isLight ? "text-slate-400" : "text-gray-400"} />
                                    <input
                                        ref={spotlightInputRef}
                                        type="text"
                                        value={appSearch}
                                        onChange={(e) => setAppSearch(e.target.value)}
                                        placeholder="Search apps, jump to a module, or ask BERAXIS AI (Press Enter)..."
                                        className={`flex-1 bg-transparent text-xs sm:text-sm outline-none ${
                                            isLight ? "text-slate-900 placeholder-slate-400" : "text-white placeholder-gray-400"
                                        }`}
                                    />
                                    {appSearch ? (
                                        <button
                                            type="submit"
                                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold cursor-pointer flex items-center gap-1"
                                        >
                                            Ask AI <ArrowRight size={11} />
                                        </button>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-md bg-purple-600/20 border border-purple-500/30 text-[11px] font-mono font-bold text-purple-400">
                                            ⌘K
                                        </span>
                                    )}
                                </form>
                            </div>

                            {/* Compact Horizontal KPI Pills + Quick Actions */}
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                                <div className={`px-3.5 py-1.5 rounded-full border backdrop-blur-sm flex items-center gap-2 ${isLight ? "bg-white/75 border-slate-200/80 text-slate-600" : "bg-white/[0.05] border-white/15 text-gray-200"}`}>
                                    <span className="text-[10px] uppercase font-bold opacity-75">Revenue</span>
                                    <strong className={`font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                                        <AnimatedCounter value={bentoStats.revenue} prefix={currencySymbol} />
                                    </strong>
                                </div>
                                <div className={`px-3.5 py-1.5 rounded-full border backdrop-blur-sm flex items-center gap-2 ${isLight ? "bg-white/75 border-slate-200/80 text-slate-600" : "bg-white/[0.05] border-white/15 text-gray-200"}`}>
                                    <span className="text-[10px] uppercase font-bold opacity-75">Net Profit</span>
                                    <strong className={`font-black ${isLight ? "text-cyan-700" : "text-[#38BDF8]"}`}>
                                        <AnimatedCounter value={bentoStats.netProfit} prefix={currencySymbol} />
                                    </strong>
                                </div>
                                <div className={`px-3.5 py-1.5 rounded-full border backdrop-blur-sm flex items-center gap-2 ${isLight ? "bg-white/75 border-slate-200/80 text-slate-600" : "bg-white/[0.05] border-white/15 text-gray-200"}`}>
                                    <span className="text-[10px] uppercase font-bold opacity-75">Invoices</span>
                                    <strong className={`font-black ${isLight ? "text-amber-700" : "text-[#FBBF24]"}`}>
                                        <AnimatedCounter value={bentoStats.invoices} />
                                    </strong>
                                </div>
                                <div className={`px-3.5 py-1.5 rounded-full border backdrop-blur-sm flex items-center gap-2 ${isLight ? "bg-white/75 border-slate-200/80 text-slate-600" : "bg-white/[0.05] border-white/15 text-gray-200"}`}>
                                    <span className="text-[10px] uppercase font-bold opacity-75">Users</span>
                                    <strong className={`font-black ${isLight ? "text-emerald-700" : "text-[#34D399]"}`}>
                                        <AnimatedCounter value={Math.max(1, bentoStats.staffAndTickets)} />
                                    </strong>
                                </div>
                                <span className={`hidden sm:inline ${isLight ? "text-slate-300" : "text-white/20"}`}>|</span>
                                <Link href="/accounting/customers" className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-colors ${isLight ? "bg-white hover:bg-purple-50 border-slate-200 text-purple-700" : "bg-white/5 hover:bg-purple-500/20 border-white/10 text-purple-200"}`}>
                                    + Invoice
                                </Link>
                                <Link href="/crm" className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-colors ${isLight ? "bg-white hover:bg-cyan-50 border-slate-200 text-cyan-700" : "bg-white/5 hover:bg-cyan-500/20 border-white/10 text-cyan-200"}`}>
                                    + CRM Deal
                                </Link>
                                <Link href="/employees" className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-colors ${isLight ? "bg-white hover:bg-emerald-50 border-slate-200 text-emerald-700" : "bg-white/5 hover:bg-emerald-500/20 border-white/10 text-emerald-200"}`}>
                                    + Employee
                                </Link>
                                <Link href="/approvals" className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-colors ${isLight ? "bg-white hover:bg-amber-50 border-slate-200 text-amber-700" : "bg-white/5 hover:bg-amber-500/20 border-white/10 text-amber-200"}`}>
                                    Approvals
                                </Link>
                            </div>
                        </div>

                        {isFreePlan && (
                            <div className={`border rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg ${
                                isLight
                                    ? "bg-gradient-to-r from-purple-50 via-white to-amber-50 border-purple-200"
                                    : "bg-gradient-to-r from-purple-950/60 via-[#0F172A]/90 to-amber-950/40 border-purple-500/30"
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                                        <Crown size={20} />
                                    </div>
                                    <div>
                                        <div className={`text-xs sm:text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                                            <span>Free Plan Workspace ({activeBranch?.name})</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                                                1 Major App + Settings
                                            </span>
                                        </div>
                                        <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                                            Upgrade to Standard ($1/mo Annual Early Bird) to unlock all 28 ERP/CRM apps and the{" "}
                                            <strong className={isLight ? "text-cyan-700" : "text-cyan-300"}>Global Verified B2B Leads Directory</strong>.
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

                        {/* Centered Responsive Glass App Dock */}
                        <div className="beraxis-glass-dock p-4 sm:p-6 space-y-5">
                            <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${isLight ? "border-slate-200" : "border-white/10"}`}>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {[
                                        { id: "all", label: "All Apps" },
                                        { id: "finance", label: "Finance & Sales" },
                                        { id: "crm", label: "CRM & Leads" },
                                        { id: "ops", label: "Operations & HR" },
                                        { id: "office", label: "Office Suite" },
                                    ].map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setAppCategory(cat.id as any)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                appCategory === cat.id
                                                    ? "beraxis-glow-pill"
                                                    : isLight
                                                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                                <span className={`text-[11px] font-semibold ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                                    Click any app to launch
                                </span>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5">
                            {displayedApps.filter((app) => {
                                if (appSearch && !app.name.toLowerCase().includes(appSearch.toLowerCase())) return false;
                                if (appCategory === "all") return true;
                                if (appCategory === "finance") return ["/dashboard", "/accounting", "/sales", "/purchase", "/pos"].some(p => app.href.startsWith(p));
                                if (appCategory === "crm") return ["/dashboard", "/crm", "/contacts", "/discuss", "/calendar"].some(p => app.href.startsWith(p));
                                if (appCategory === "ops") return ["/dashboard", "/inventory", "/barcode", "/manufacturing", "/employees", "/payroll", "/project", "/helpdesk"].some(p => app.href.startsWith(p));
                                if (appCategory === "office") return ["/dashboard", "/documents", "/spreadsheets", "/slides", "/meet", "/knowledge", "/sign", "/todo"].some(p => app.href.startsWith(p));
                                return true;
                            }).map(app => {
                                const IconComponent = app.icon;

                                return (
                                    <Link
                                        key={app.name}
                                        href={app.href}
                                        className="group flex flex-col items-center gap-2 focus:outline-none cursor-pointer"
                                    >
                                        <div
                                            className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-[68px] lg:h-[68px] rounded-2xl ${app.color} ring-1 ring-inset ring-white/25 flex items-center justify-center text-white shadow-lg ${isLight ? "shadow-slate-900/15" : "shadow-black/50"} group-hover:scale-105 group-hover:ring-white/45 transition-all duration-200 ease-out`}
                                        >
                                            <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={1.8} />
                                        </div>

                                        <span className={`text-[11px] sm:text-xs font-semibold transition-colors text-center tracking-tight leading-tight ${
                                            isLight
                                                ? "text-slate-700 group-hover:text-slate-950"
                                                : "text-gray-200 group-hover:text-white"
                                        }`}>
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
                                    className="group flex flex-col items-center gap-2 focus:outline-none cursor-pointer relative"
                                    title="Leads Pool is available only on Paid Plans"
                                >
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[68px] lg:h-[68px] rounded-2xl bg-gray-900/65 backdrop-blur-md border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-black/40 group-hover:scale-105 transition-transform duration-200 ease-out relative">
                                        <Globe className="w-6 h-6 sm:w-7 sm:h-7 opacity-40" strokeWidth={1.8} />
                                        <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                                            <Lock size={8} /> PAID
                                        </div>
                                    </div>
                                    <span className="text-[11px] sm:text-xs font-medium text-amber-300/80 group-hover:text-amber-300 transition-colors text-center tracking-tight leading-tight">
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
                                className="group flex flex-col items-center gap-2 focus:outline-none cursor-pointer"
                                title={isFreePlan ? "Upgrade to unlock more apps" : "Add or remove modules from active company"}
                            >
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-[68px] lg:h-[68px] rounded-2xl border-2 border-dashed backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 ease-out ${
                                    isLight
                                        ? "bg-purple-50/75 border-purple-300 hover:border-purple-500 text-purple-700 shadow-slate-900/10"
                                        : "bg-white/[0.04] border-purple-400/50 hover:border-purple-300 text-purple-300 hover:text-white shadow-black/40"
                                }`}>
                                    <Plus className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
                                </div>
                                <span className={`text-[11px] sm:text-xs font-semibold transition-colors text-center tracking-tight leading-tight ${
                                    isLight ? "text-purple-700 group-hover:text-purple-900" : "text-purple-300 group-hover:text-purple-200"
                                }`}>
                                    {isFreePlan ? "+ Unlock Apps" : "+ Add Apps"}
                                </span>
                            </button>
                            </div>
                        </div>

                        {/* Compact Collapsible Quickstart Launchpad Bar */}
                        <div className="beraxis-glass-dock px-4 py-2.5 flex items-center justify-between gap-3">
                            <div className={`flex items-center gap-2 text-xs font-bold ${isLight ? "text-slate-700" : "text-gray-300"}`}>
                                <Sparkles size={14} className="text-[#8B5CF6]" />
                                <span>Quickstart Launchpad &amp; Blueprint Setup</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowLaunchpad(!showLaunchpad)}
                                className="px-3 py-1 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/10 text-[11px] font-bold text-[#38BDF8] cursor-pointer"
                            >
                                {showLaunchpad ? "Hide Checklist ↑" : "Expand Checklist ↓"}
                            </button>
                        </div>

                        {showLaunchpad && (
                            <OnboardingChecklist
                                hasSelectedIndustry={hasSelectedIndustry}
                                onOpenIndustryPicker={handleReconfigureWorkspace}
                            />
                        )}
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
