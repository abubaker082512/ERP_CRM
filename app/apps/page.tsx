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
    Layers,
    Plus,
    CheckCircle2,
    Sparkles,
    Sliders,
    ArrowRight,
    Flame,
    Check
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import BeraxisSupportWidgets from "@/components/support/BeraxisSupportWidgets";
import UserProfileDropdown from "@/components/shared/UserProfileDropdown";
import { useBranchContext } from "@/lib/branchContext";
import { GLOBAL_INDUSTRIES, GlobalIndustryId, getIndustryById } from "@/lib/industryTaxonomy";
import BranchSetupWizardModal from "@/components/settings/BranchSetupWizardModal";
import UniversalBranchSwitcher from "@/components/shared/UniversalBranchSwitcher";

// Mapping icons for industry showcases
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
    GraduationCap
};

const allApps = [
    // F&B & POS
    { name: "Point of Sale", icon: ShoppingCart, color: "bg-amber-600", href: "/pos", category: "Commerce", badge: "F&B / Retail" },
    { name: "Kitchen Display (KDS)", icon: Flame, color: "bg-red-600", href: "/pos/kds", category: "Food & Beverage", badge: "F&B Dedicated" },
    { name: "Recipe & BOM Costing", icon: BookOpen, color: "bg-orange-600", href: "/pos/recipes", category: "Food & Beverage", badge: "F&B Dedicated" },
    { name: "Floor Plan & Tables", icon: Grid3x3, color: "bg-amber-700", href: "/pos/tables", category: "Food & Beverage", badge: "F&B Dedicated" },
    
    // Core Operations & Supply Chain
    { name: "Inventory", icon: Package, color: "bg-purple-600", href: "/inventory", category: "Supply Chain" },
    { name: "Barcode Hub", icon: Barcode, color: "bg-pink-600", href: "/barcode", category: "Commerce" },
    { name: "Purchase", icon: ShoppingCart, color: "bg-pink-600", href: "/purchase", category: "Supply Chain" },
    { name: "Sales", icon: BarChart3, color: "bg-orange-600", href: "/sales", category: "Commerce" },
    { name: "Accounting", icon: CreditCard, color: "bg-red-500", href: "/accounting", category: "Finance" },
    
    // CRM & Growth
    { name: "CRM", icon: Target, color: "bg-cyan-600", href: "/crm", category: "Sales & CRM" },
    { name: "Leads Pool", icon: Globe, color: "bg-cyan-500", href: "/crm/leads-pool", category: "Sales & CRM" },
    { name: "Contacts", icon: Users, color: "bg-purple-500", href: "/contacts", category: "Sales & CRM" },
    
    // Projects & Operations
    { name: "Project", icon: Palette, color: "bg-blue-600", href: "/project", category: "Operations" },
    { name: "Timesheets", icon: Clock, color: "bg-indigo-500", href: "/timesheets", category: "Operations" },
    { name: "Planning", icon: Grid3x3, color: "bg-yellow-500", href: "/planning", category: "Operations" },
    
    // HR & Talent
    { name: "Employees", icon: UserCircle, color: "bg-indigo-600", href: "/employees", category: "Human Resources" },
    { name: "Contracts", icon: PenTool, color: "bg-blue-500", href: "/employees/contracts", category: "Human Resources" },
    { name: "Payroll", icon: CreditCard, color: "bg-pink-400", href: "/payroll", category: "Human Resources" },
    { name: "Attendances", icon: UserCheck, color: "bg-orange-400", href: "/attendances", category: "Human Resources" },
    { name: "Recruitment", icon: Target, color: "bg-teal-600", href: "/recruitment", category: "Human Resources" },
    
    // Specialized Industry Subsystems
    { name: "Vehicle Job Cards", icon: Wrench, color: "bg-red-600", href: "/automotive", category: "Automotive", badge: "Auto Dedicated" },
    { name: "Property & Leases", icon: Building2, color: "bg-indigo-600", href: "/real-estate", category: "Real Estate", badge: "Real Estate" },
    { name: "Education & Academy", icon: GraduationCap, color: "bg-teal-600", href: "/education", category: "Education", badge: "Academy" },
    { name: "Appointments", icon: ClipboardList, color: "bg-cyan-500", href: "/appointments", category: "Services", badge: "Clinics/Spas" },
    { name: "Manufacturing", icon: Cog, color: "bg-orange-700", href: "/manufacturing", category: "Production", badge: "Factory" },
    
    // Collaboration & Documents
    { name: "Sign Digital", icon: PenTool, color: "bg-cyan-400", href: "/sign", category: "Legal & Docs" },
    { name: "Documents", icon: BookOpen, color: "bg-blue-400", href: "/documents", category: "Operations" },
    { name: "Discuss", icon: LayoutDashboard, color: "bg-orange-500", href: "/discuss", category: "Communication" },
    { name: "Knowledge", icon: BookOpen, color: "bg-teal-500", href: "/knowledge", category: "Operations" },
    { name: "To do", icon: CheckSquare, color: "bg-blue-500", href: "/todo", category: "Operations" },
    { name: "Calendar", icon: Calendar, color: "bg-yellow-600", href: "/calendar", category: "Operations" },
    { name: "Team & Contractors", icon: Users, color: "bg-purple-600", href: "/team", category: "Human Resources" },
    { name: "Helpdesk", icon: CheckSquare, color: "bg-indigo-500", href: "/helpdesk", category: "Services" },
    { name: "Surveys", icon: MessageSquare, color: "bg-blue-400", href: "/surveys", category: "Marketing" },
    { name: "Dashboards", icon: Grid3x3, color: "bg-pink-500", href: "/dashboard", category: "Analytics" },
    { name: "Reports", icon: PieChart, color: "bg-purple-700", href: "/reports", category: "Analytics" },
    { name: "Settings", icon: Cog, color: "bg-gray-500", href: "/settings", category: "Configuration" },
];

export default function AppsDashboardPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [viewMode, setViewMode] = useState<"tailored" | "all">("tailored");
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<any>(null);

    // Branch Context
    const {
        branches,
        activeBranch,
        activeIndustry,
        hasSelectedIndustry,
        setActiveBranchId,
        createBranch,
        resetToIndustrySelection,
        isModuleActive
    } = useBranchContext();

    // Industry Selection Gateway State (for first-time setup or adding a new company)
    const [isSelectingIndustry, setIsSelectingIndustry] = useState(false);
    const [selectedIndId, setSelectedIndId] = useState<GlobalIndustryId>("food_beverage");
    const [newCompanyName, setNewCompanyName] = useState("");
    const [newSubSector, setNewSubSector] = useState("");
    const [newOpMode, setNewOpMode] = useState("");
    const [newLocation, setNewLocation] = useState("Main Headquarters");
    const [newCurrency, setNewCurrency] = useState("$ USD");

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/login");
            return;
        }

        const cachedUserStr = localStorage.getItem("user");
        if (cachedUserStr) {
            try {
                setUserData(JSON.parse(cachedUserStr));
            } catch {}
        }
    }, [router]);

    // Update default subsector and mode when industry is clicked
    const handlePickIndustry = (indId: GlobalIndustryId) => {
        setSelectedIndId(indId);
        const ind = getIndustryById(indId);
        setNewSubSector(ind.subSectors[0] || "");
        setNewOpMode(ind.operationModes[0]?.id || "default");
        if (!newCompanyName || newCompanyName.endsWith("Hub") || newCompanyName.endsWith("Company") || newCompanyName.endsWith("Branch")) {
            setNewCompanyName(`${ind.name.split(" ")[0]} Company`);
        }
    };

    // Initialize defaults on mount or when opening industry selection
    const handleStartAddCompany = () => {
        const ind = getIndustryById("food_beverage");
        setSelectedIndId("food_beverage");
        setNewSubSector(ind.subSectors[0]);
        setNewOpMode(ind.operationModes[0]?.id || "hybrid");
        setNewCompanyName("Downtown Artisan Bakery & Cafe");
        setNewLocation("San Francisco HQ • 100 Market St");
        setNewCurrency("$ USD");
        setIsSelectingIndustry(true);
    };

    const handleLaunchCompany = (e: React.FormEvent) => {
        e.preventDefault();
        const ind = getIndustryById(selectedIndId);
        const companyNameFinal = newCompanyName.trim() || `${ind.name.split(" ")[0]} Company`;
        
        createBranch({
            name: companyNameFinal,
            code: `${selectedIndId.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
            industryId: selectedIndId,
            subSector: newSubSector || ind.subSectors[0],
            operationMode: newOpMode || ind.operationModes[0]?.id || "default",
            location: newLocation.trim() || "Main Facility",
            currency: newCurrency.trim() || "$ USD",
            enabledModules: ind.defaultModules,
            sharingRules: {
                shareEmployees: true,
                shareCustomers: true,
                shareInventory: false,
                shareAccounting: true,
                shareVendors: true
            },
            isPrimary: branches.length === 0
        });

        setIsSelectingIndustry(false);
    };

    const handleEditBranch = (b: any) => {
        setEditingBranch(b);
        setIsWizardOpen(true);
    };

    // Filter apps based on active branch selection
    const displayedApps = viewMode === "tailored"
        ? allApps.filter(app => isModuleActive(app.href) || app.href === "/settings" || app.href === "/dashboard")
        : allApps;

    // Selected archetype details for configuration drawer
    const chosenArchetype = getIndustryById(selectedIndId);
    const ChosenIcon = INDUSTRY_ICON_MAP[chosenArchetype.iconName] || Building2;

    // If no company has been configured yet OR user is in "Add New Company / Select Industry" mode
    const showIndustrySelectionGateway = !hasSelectedIndustry || isSelectingIndustry || !activeBranch;

    return (
        <div className="min-h-screen bg-[#06080e] text-white flex flex-col selection:bg-purple-500 selection:text-white">
            {/* Top Navigation Header */}
            <header className="border-b border-gray-800/80 bg-[#0c101c]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/apps" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                        <img src="/logo2.png" alt="Beraxis Logo" className="h-7 w-auto" />
                        <span className="font-extrabold text-base tracking-tight text-white">BERAXIS WORKSPACE</span>
                    </Link>
                    {activeBranch && (
                        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {activeIndustry.name}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Universal Multi-Branch Switcher & Company Actions */}
                    {hasSelectedIndustry && activeBranch && (
                        <>
                            <UniversalBranchSwitcher />
                            <button
                                onClick={handleStartAddCompany}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
                            >
                                <Plus size={14} /> + Add New Company
                            </button>
                        </>
                    )}

                    <Link
                        href="/"
                        title="Public Website"
                        className="hidden sm:flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition-colors px-2.5 py-1.5 rounded-xl border border-gray-800 hover:bg-gray-800/50 text-xs font-semibold"
                    >
                        <Globe size={14} /> Website
                    </Link>

                    <div className="w-px h-5 bg-gray-800 hidden sm:block" />
                    <UserProfileDropdown />
                </div>
            </header>

            {/* MAIN PORTAL AREA */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                
                {/* SCENARIO A: 10-INDUSTRY SELECTION GATEWAY (FIRST-TIME OR ADD NEW COMPANY) */}
                {showIndustrySelectionGateway ? (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
                        {/* Gateway Header Banner */}
                        <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                                <Sparkles size={14} className="text-purple-400" />
                                <span>Multi-Industry Adaptive Operating System</span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                                Select Your Business Industry Archetype
                            </h1>
                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                                Choose the single business category that matches your enterprise. Beraxis will automatically adapt its interface, modules, and workflows tailored strictly to your operations.
                            </p>
                            {branches.length > 0 && (
                                <div className="pt-2">
                                    <button
                                        onClick={() => setIsSelectingIndustry(false)}
                                        className="text-xs text-purple-400 hover:text-purple-300 underline font-semibold cursor-pointer"
                                    >
                                        ← Return to active workspace ({activeBranch?.name})
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Step 1: 10 Industry Cards Displayed Exactly Like App Tiles */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                                    Step 1: Select 1 Global Industry Archetype (10 Categories Worldwide)
                                </span>
                                <span className="text-xs text-purple-400 font-bold">
                                    Selected: {chosenArchetype.name}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                                {GLOBAL_INDUSTRIES.map(industry => {
                                    const isSelected = selectedIndId === industry.id;
                                    const IconComponent = INDUSTRY_ICON_MAP[industry.iconName] || Building2;

                                    return (
                                        <div
                                            key={industry.id}
                                            onClick={() => handlePickIndustry(industry.id)}
                                            className={`relative p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 group ${
                                                isSelected
                                                    ? "bg-gradient-to-b from-[#151c2e] to-[#1a233a] border-purple-500 shadow-xl shadow-purple-950/60 ring-2 ring-purple-500 scale-[1.02]"
                                                    : "bg-[#0d121f] border-gray-800 hover:border-gray-700 hover:bg-gray-900/60 text-gray-300"
                                            }`}
                                        >
                                            {isSelected && (
                                                <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] shadow-md">
                                                    <Check size={12} />
                                                </span>
                                            )}

                                            <div className="flex flex-col items-start gap-3">
                                                <div className={`w-12 h-12 rounded-2xl ${industry.themeColor} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform shrink-0`}>
                                                    <IconComponent size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-xs leading-snug">
                                                        {industry.name}
                                                    </h3>
                                                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">
                                                        {industry.tagline}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-gray-800/80 text-[10px] text-gray-400">
                                                <span className="font-bold text-purple-400">{industry.defaultModules.length}</span> Modules Included
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 2: Step-by-Step Configuration Drawer */}
                        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0e1322] via-[#121829] to-[#0e1322] border border-purple-500/40 shadow-2xl space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
                                <div className="flex items-center gap-3.5">
                                    <div className={`w-12 h-12 rounded-2xl ${chosenArchetype.themeColor} flex items-center justify-center text-white shadow-lg shrink-0`}>
                                        <ChosenIcon size={26} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                                            Step 2: Configure Operational Mode & Company Identity
                                        </span>
                                        <h2 className="text-xl font-extrabold text-white">
                                            {chosenArchetype.name} Setup
                                        </h2>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-300 max-w-md">
                                    {chosenArchetype.description}
                                </div>
                            </div>

                            <form onSubmit={handleLaunchCompany} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Company Name */}
                                    <div>
                                        <label className="font-bold text-gray-200 block mb-1.5 text-xs">
                                            Company / Business Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={newCompanyName}
                                            onChange={e => setNewCompanyName(e.target.value)}
                                            placeholder="e.g. Downtown Artisan Bakery & Cafe"
                                            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    {/* Nature / Sub-Sector */}
                                    <div>
                                        <label className="font-bold text-gray-200 block mb-1.5 text-xs">
                                            Specific Nature / Sub-Sector *
                                        </label>
                                        <select
                                            value={newSubSector}
                                            onChange={e => setNewSubSector(e.target.value)}
                                            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                        >
                                            {chosenArchetype.subSectors.map(sub => (
                                                <option key={sub} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Operating Mode */}
                                    <div>
                                        <label className="font-bold text-gray-200 block mb-1.5 text-xs">
                                            Operating Mode *
                                        </label>
                                        <select
                                            value={newOpMode}
                                            onChange={e => setNewOpMode(e.target.value)}
                                            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                        >
                                            {chosenArchetype.operationModes.map(m => (
                                                <option key={m.id} value={m.id}>{m.badge} - {m.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="font-bold text-gray-200 block mb-1.5 text-xs">
                                            Facility Location / City
                                        </label>
                                        <input
                                            type="text"
                                            value={newLocation}
                                            onChange={e => setNewLocation(e.target.value)}
                                            placeholder="e.g. 100 Market St, San Francisco, CA"
                                            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    {/* Currency */}
                                    <div>
                                        <label className="font-bold text-gray-200 block mb-1.5 text-xs">
                                            Operating Currency
                                        </label>
                                        <input
                                            type="text"
                                            value={newCurrency}
                                            onChange={e => setNewCurrency(e.target.value)}
                                            placeholder="e.g. $ USD, € EUR, £ GBP, د.إ AED"
                                            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    {/* Ready Modules Count Preview */}
                                    <div className="flex flex-col justify-end">
                                        <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800 text-xs">
                                            <span className="text-gray-400">Pre-configured Apps:</span>
                                            <div className="font-bold text-purple-400 text-sm mt-0.5">
                                                {chosenArchetype.defaultModules.length} Dedicated Modules
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Modules Preview Badges */}
                                <div className="space-y-2 pt-2 border-t border-gray-800/80">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block">
                                        Tailored Apps & Workflows Ready for this Business:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {chosenArchetype.defaultModules.map(modHref => {
                                            const appInfo = allApps.find(a => a.href === modHref);
                                            return (
                                                <span
                                                    key={modHref}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-200"
                                                >
                                                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                                                    <span>{appInfo?.name || modHref}</span>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                                    {branches.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsSelectingIndustry(false)}
                                            className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-extrabold shadow-xl shadow-purple-600/40 transition-all active:scale-95 cursor-pointer"
                                    >
                                        <Sparkles size={16} /> Launch {newCompanyName || "Company"} Workspace
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* SCENARIO B: TAILORED WORKSPACE DASHBOARD (DISPLAYED ONCE INDUSTRY IS ACTIVE) */
                    <div className="space-y-8 animate-in fade-in duration-150">
                        {/* 1. Multi-Entity / Business Branches Showcase Strip */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 block">
                                        Multi-Entity Workspace Orchestrator
                                    </span>
                                    <h2 className="text-lg font-extrabold text-white">
                                        Active Business Entities & Branches ({branches.length})
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleStartAddCompany}
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
                                    >
                                        <Plus size={14} /> + Add New Company
                                    </button>
                                    <button
                                        onClick={resetToIndustrySelection}
                                        title="Reset and pick industry fresh"
                                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all"
                                    >
                                        🔄 Reset
                                    </button>
                                </div>
                            </div>

                            {/* Branch Cards Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {branches.map(branch => {
                                    const isCurrent = branch.id === activeBranch.id;
                                    const ind = getIndustryById(branch.industryId);
                                    const IconComponent = INDUSTRY_ICON_MAP[ind.iconName] || Building2;

                                    return (
                                        <div
                                            key={branch.id}
                                            onClick={() => setActiveBranchId(branch.id)}
                                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                                                isCurrent
                                                    ? "bg-gradient-to-br from-[#151c2e] to-[#1a233a] border-purple-500 shadow-xl shadow-purple-950/60 ring-1 ring-purple-500"
                                                    : "bg-[#0d121f] border-gray-800/90 hover:border-gray-700 hover:bg-gray-900/60 text-gray-300"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-10 h-10 rounded-xl ${ind.themeColor} flex items-center justify-center text-white shadow-md shrink-0`}>
                                                        <IconComponent size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                                                            <span>{branch.name}</span>
                                                            {isCurrent && (
                                                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                                                                    ACTIVE
                                                                </span>
                                                            )}
                                                        </h3>
                                                        <p className="text-[10px] text-gray-400">{branch.subSector}</p>
                                                    </div>
                                                </div>
                                                <span className="font-mono text-[10px] text-gray-500">{branch.code}</span>
                                            </div>

                                            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-800/80">
                                                <span className="text-gray-400">Mode: <strong className="text-gray-200">{branch.operationMode}</strong></span>
                                                <span className="text-purple-400 font-bold">{branch.enabledModules.length} Modules Active</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Active Industry Spotlight & Operations Banner */}
                        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#111728] via-[#161d33] to-[#111728] border border-purple-500/30 space-y-4 shadow-2xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className={`w-12 h-12 rounded-2xl ${activeIndustry.themeColor} flex items-center justify-center text-white shadow-lg shadow-purple-900/40 shrink-0`}>
                                        {(() => {
                                            const IconComp = INDUSTRY_ICON_MAP[activeIndustry.iconName] || Building2;
                                            return <IconComp size={26} />;
                                        })()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                                                Tailored Industry Archetype
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                {activeBranch.operationMode.toUpperCase()}
                                            </span>
                                        </div>
                                        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                            {activeBranch.name} ({activeIndustry.name})
                                        </h1>
                                        <p className="text-xs text-gray-300 mt-0.5">
                                            {activeIndustry.tagline} • {activeBranch.location}
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Dedicated Routes Shortcuts */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {activeIndustry.specializedRoutes.map((route, idx) => (
                                        <Link
                                            key={idx}
                                            href={route.href}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-bold transition-all shadow-sm"
                                        >
                                            <Sparkles size={13} className="text-purple-400" />
                                            <span>{route.name}</span>
                                            <ArrowRight size={12} />
                                        </Link>
                                    ))}
                                    <button
                                        onClick={() => handleEditBranch(activeBranch)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-xs font-bold transition-all"
                                    >
                                        <Sliders size={13} /> Customize Modules
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. The Apps Grid (Tailored strictly to this Industry) */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d121f] p-3.5 rounded-2xl border border-gray-800">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-white">Workspace View Filter:</span>
                                    <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800">
                                        <button
                                            onClick={() => setViewMode("tailored")}
                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                                                viewMode === "tailored"
                                                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                                                    : "text-gray-400 hover:text-white"
                                            }`}
                                        >
                                            {activeBranch.name} Tailored ({displayedApps.length})
                                        </button>
                                        <button
                                            onClick={() => setViewMode("all")}
                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                                                viewMode === "all"
                                                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                                                    : "text-gray-400 hover:text-white"
                                            }`}
                                        >
                                            All 30+ Enterprise Modules
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleStartAddCompany}
                                        className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1.5 hover:underline"
                                    >
                                        <Plus size={13} /> + Add Another Company
                                    </button>
                                    <span className="text-gray-700">•</span>
                                    <button
                                        onClick={() => handleEditBranch(activeBranch)}
                                        className="text-xs text-gray-400 hover:text-gray-200 font-bold flex items-center gap-1.5 hover:underline"
                                    >
                                        <Sliders size={13} /> Add / Remove Modules
                                    </button>
                                </div>
                            </div>

                            {/* Apps Grid Tiles */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {displayedApps.map(app => {
                                    const IconComponent = app.icon;

                                    return (
                                        <Link
                                            key={app.name}
                                            href={app.href}
                                            className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-[#0e1320] hover:bg-[#151c2e] border border-gray-800/80 hover:border-purple-500/60 shadow-lg hover:shadow-2xl hover:shadow-purple-950/50 transition-all duration-200 active:scale-95"
                                        >
                                            {app.badge && (
                                                <span className="absolute top-2 right-2 text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                    {app.badge}
                                                </span>
                                            )}

                                            <div className={`w-14 h-14 rounded-2xl ${app.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                                                <IconComponent size={26} />
                                            </div>

                                            <span className="text-xs font-bold text-gray-200 group-hover:text-white mt-3 text-center tracking-tight line-clamp-1">
                                                {app.name}
                                            </span>
                                            <span className="text-[10px] text-gray-500 mt-0.5">{app.category}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Support Widgets */}
            <BeraxisSupportWidgets />

            {/* Branch Setup & Customizer Wizard Modal */}
            <BranchSetupWizardModal
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                editingBranch={editingBranch}
            />
        </div>
    );
}
