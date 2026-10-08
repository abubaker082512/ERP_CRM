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
        setActiveBranchId,
        isModuleActive,
        toggleModuleForActiveBranch
    } = useBranchContext();

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

    const handleCreateBranch = () => {
        setEditingBranch(null);
        setIsWizardOpen(true);
    };

    const handleEditBranch = (b: any) => {
        setEditingBranch(b);
        setIsWizardOpen(true);
    };

    // Filter apps based on active branch selection
    const displayedApps = viewMode === "tailored"
        ? allApps.filter(app => isModuleActive(app.href) || app.href === "/settings" || app.href === "/dashboard")
        : allApps;

    return (
        <div className="min-h-screen bg-[#06080e] text-white flex flex-col selection:bg-purple-500 selection:text-white">
            {/* Top Navigation Header */}
            <header className="border-b border-gray-800/80 bg-[#0c101c]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/apps" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                        <img src="/logo2.png" alt="Beraxis Logo" className="h-7 w-auto" />
                        <span className="font-extrabold text-base tracking-tight text-white">BERAXIS WORKSPACE</span>
                    </Link>
                    <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Multi-Industry ERP OS
                    </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Universal Multi-Branch Switcher */}
                    <UniversalBranchSwitcher />

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

            {/* Main Content Hub */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
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
                        <button
                            onClick={handleCreateBranch}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
                        >
                            <Plus size={14} /> + New Business Branch
                        </button>
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

                {/* 3. Worldwide Industry Archetypes Browser Strip (Design matched with Apps Tiles) */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                                Global Industry Archetypes Directory
                            </span>
                            <h3 className="text-sm font-bold text-gray-200">
                                Supported Worldwide Business Categories (10 Sectors)
                            </h3>
                        </div>
                        <span className="text-xs text-purple-400 font-semibold">
                            Click any industry to launch instant setup
                        </span>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                        {GLOBAL_INDUSTRIES.map(industry => {
                            const IconComp = INDUSTRY_ICON_MAP[industry.iconName] || Building2;
                            const isCurrent = activeBranch.industryId === industry.id;

                            return (
                                <button
                                    key={industry.id}
                                    onClick={() => {
                                        setEditingBranch({
                                            ...activeBranch,
                                            industryId: industry.id,
                                            subSector: industry.subSectors[0],
                                            operationMode: industry.operationModes[0]?.id || "default",
                                            enabledModules: industry.defaultModules
                                        });
                                        setIsWizardOpen(true);
                                    }}
                                    className={`px-4 py-3 rounded-2xl text-left shrink-0 transition-all border flex items-center gap-3 w-72 ${
                                        isCurrent
                                            ? "bg-[#151c2e] border-purple-500 text-white shadow-lg shadow-purple-950/50 ring-1 ring-purple-500"
                                            : "bg-[#0d121f] border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-900/50"
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl ${industry.themeColor} flex items-center justify-center text-white shadow-md shrink-0`}>
                                        <IconComp size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-xs text-white truncate flex items-center gap-1">
                                            <span className="truncate">{industry.name}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{industry.tagline}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4. The Apps Grid (Dynamically filtered by Active Industry & Branch) */}
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
                                    {activeBranch.name} Active ({displayedApps.length})
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

                        <button
                            onClick={() => handleEditBranch(activeBranch)}
                            className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1.5 hover:underline"
                        >
                            <Sliders size={13} /> Add / Remove Modules for this Branch
                        </button>
                    </div>

                    {/* Apps Grid Tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {displayedApps.map(app => {
                            const IconComponent = app.icon;
                            const isEnabled = isModuleActive(app.href);

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
