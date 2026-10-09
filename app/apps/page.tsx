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
    Dumbbell
} from "lucide-react";
import BeraxisSupportWidgets from "@/components/support/BeraxisSupportWidgets";
import UserProfileDropdown from "@/components/shared/UserProfileDropdown";
import { useBranchContext } from "@/lib/branchContext";
import { GLOBAL_INDUSTRIES, GlobalIndustryId, getIndustryById } from "@/lib/industryTaxonomy";
import UniversalBranchSwitcher from "@/components/shared/UniversalBranchSwitcher";

// Icon mapping for 10 global industries
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
    Dumbbell
};

// All 30+ Enterprise apps with vibrant colors matching Screenshot 1
const allApps = [
    // Specialized Industry & Sports Hubs
    { name: "Club & Fitness", icon: Dumbbell, color: "bg-emerald-600", href: "/club" },
    
    // Commerce & POS
    { name: "Point of Sale", icon: ShoppingCart, color: "bg-amber-600", href: "/pos" },
    { name: "Kitchen Display", icon: UtensilsCrossed, color: "bg-red-600", href: "/pos/kds" },
    { name: "Recipes & BOM", icon: BookOpen, color: "bg-orange-600", href: "/pos/recipes" },
    { name: "Floor & Tables", icon: Grid3x3, color: "bg-amber-700", href: "/pos/tables" },
    
    // Core Operations & Supply Chain
    { name: "Inventory", icon: Package, color: "bg-purple-600", href: "/inventory" },
    { name: "Barcode", icon: Barcode, color: "bg-[#e11d74]", href: "/barcode" },
    { name: "Purchase", icon: ShoppingCart, color: "bg-pink-600", href: "/purchase" },
    { name: "Sales", icon: BarChart3, color: "bg-orange-500", href: "/sales" },
    { name: "Accounting", icon: CreditCard, color: "bg-red-500", href: "/accounting" },
    
    // CRM & Growth
    { name: "CRM", icon: Target, color: "bg-cyan-600", href: "/crm" },
    { name: "Leads Pool", icon: Globe, color: "bg-cyan-500", href: "/crm/leads-pool" },
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
    { name: "Academy", icon: GraduationCap, color: "bg-teal-600", href: "/education" },
    { name: "Appointments", icon: ClipboardList, color: "bg-cyan-500", href: "/appointments" },
    { name: "Discuss", icon: LayoutDashboard, color: "bg-orange-500", href: "/discuss" },
    { name: "Knowledge", icon: BookOpen, color: "bg-teal-500", href: "/knowledge" },
    { name: "To do", icon: CheckSquare, color: "bg-blue-500", href: "/todo" },
    { name: "Calendar", icon: Calendar, color: "bg-yellow-600", href: "/calendar" },
    { name: "Surveys", icon: MessageSquare, color: "bg-blue-400", href: "/surveys" },
    { name: "Dashboards", icon: Grid3x3, color: "bg-pink-500", href: "/dashboard" },
    { name: "Settings", icon: Cog, color: "bg-[#64748b]", href: "/settings" }
];

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
        createBranch,
        resetToIndustrySelection,
        isModuleActive
    } = useBranchContext();

    // Industry Selection Mode
    const [isSelectingIndustry, setIsSelectingIndustry] = useState(false);
    const [selectedIndId, setSelectedIndId] = useState<GlobalIndustryId>("food_beverage");
    const [selectedSubSector, setSelectedSubSector] = useState("");
    const [selectedOpMode, setSelectedOpMode] = useState("");
    const [companyName, setCompanyName] = useState("");

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

    const handlePickIndustry = (indId: GlobalIndustryId) => {
        setSelectedIndId(indId);
        const ind = getIndustryById(indId);
        setSelectedSubSector(ind.subSectors[0] || "");
        setSelectedOpMode(ind.operationModes[0]?.id || "default");
        if (!companyName || companyName.endsWith("Company") || companyName.endsWith("Hub")) {
            setCompanyName(`${ind.name.split(" ")[0]} Company`);
        }
    };

    const handleOpenIndustrySelection = () => {
        const ind = getIndustryById("food_beverage");
        setSelectedIndId("food_beverage");
        setSelectedSubSector(ind.subSectors[0]);
        setSelectedOpMode(ind.operationModes[0]?.id || "hybrid");
        setCompanyName("Downtown Artisan Bakery & Cafe");
        setIsSelectingIndustry(true);
    };

    const handleConfirmLaunch = (e: React.FormEvent) => {
        e.preventDefault();
        const ind = getIndustryById(selectedIndId);
        const nameFinal = companyName.trim() || `${ind.name.split(" ")[0]} Company`;

        createBranch({
            name: nameFinal,
            code: `${selectedIndId.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
            industryId: selectedIndId,
            subSector: selectedSubSector || ind.subSectors[0],
            operationMode: selectedOpMode || ind.operationModes[0]?.id || "default",
            location: "Main Location",
            currency: "$ USD",
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

    // Filter apps based on active industry/branch
    const displayedApps = activeBranch
        ? allApps.filter(app => isModuleActive(app.href) || app.href === "/settings" || app.href === "/dashboard" || app.href === "/crm/leads-pool")
        : allApps;

    const chosenInd = getIndustryById(selectedIndId);
    const ChosenIcon = INDUSTRY_ICON_MAP[chosenInd.iconName] || Building2;

    const showOnboarding = !hasSelectedIndustry || isSelectingIndustry || !activeBranch;

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
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {hasSelectedIndustry && activeBranch && (
                        <>
                            <UniversalBranchSwitcher />
                            <button
                                onClick={handleOpenIndustrySelection}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
                            >
                                <Plus size={14} /> + Add New Company
                            </button>
                        </>
                    )}

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
                
                {/* ─── ONBOARDING / INDUSTRY SELECTION GATEWAY (Ultra Clean) ─── */}
                {showOnboarding ? (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200 py-4">
                        <div className="text-center space-y-2 max-w-2xl mx-auto">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Select Your Business Industry
                            </h1>
                            <p className="text-gray-400 text-xs sm:text-sm">
                                Choose the industry that matches your company to instantly load its tailored apps.
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

                        {/* 10 Clean Industry Squircle Icons */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
                            {GLOBAL_INDUSTRIES.map(industry => {
                                const isSelected = selectedIndId === industry.id;
                                const IconComponent = INDUSTRY_ICON_MAP[industry.iconName] || Building2;

                                return (
                                    <button
                                        key={industry.id}
                                        type="button"
                                        onClick={() => handlePickIndustry(industry.id)}
                                        className="flex flex-col items-center gap-3 p-2 rounded-2xl group transition-all cursor-pointer focus:outline-none"
                                    >
                                        <div
                                            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl ${industry.themeColor} flex items-center justify-center text-white shadow-xl transition-all duration-200 group-hover:scale-105 ${
                                                isSelected ? "ring-4 ring-purple-400 scale-105 shadow-purple-600/50" : "opacity-85 group-hover:opacity-100"
                                            }`}
                                        >
                                            <IconComponent className="w-9 h-9 text-white" />
                                        </div>
                                        <span className={`text-xs sm:text-sm font-semibold text-center transition-colors ${
                                            isSelected ? "text-purple-300 font-bold" : "text-gray-300 group-hover:text-white"
                                        }`}>
                                            {industry.name.split(" (")[0]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Clean Configuration Form */}
                        <div className="max-w-xl mx-auto bg-[#0e1322]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                                <div className={`w-10 h-10 rounded-xl ${chosenInd.themeColor} flex items-center justify-center text-white`}>
                                    <ChosenIcon size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{chosenInd.name}</h3>
                                    <p className="text-[11px] text-gray-400">{chosenInd.tagline}</p>
                                </div>
                            </div>

                            <form onSubmit={handleConfirmLaunch} className="space-y-4 text-xs">
                                <div>
                                    <label className="font-bold text-gray-300 block mb-1">Company / Branch Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                        placeholder="e.g. Downtown Artisan Bakery & Cafe"
                                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-gray-300 block mb-1">Sub-Sector</label>
                                        <select
                                            value={selectedSubSector}
                                            onChange={e => setSelectedSubSector(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                                        >
                                            {chosenInd.subSectors.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-gray-300 block mb-1">Operating Mode</label>
                                        <select
                                            value={selectedOpMode}
                                            onChange={e => setSelectedOpMode(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                                        >
                                            {chosenInd.operationModes.map(m => (
                                                <option key={m.id} value={m.id}>{m.badge} - {m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-3 flex items-center justify-between">
                                    <span className="text-[11px] text-gray-400">
                                        {chosenInd.defaultModules.length} tailored apps will be configured
                                    </span>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
                                    >
                                        <span>Launch Workspace</span>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* ─── ULTRA-CLEAN APP GRID (MATCHING SCREENSHOT 1) ─── */
                    <div className="py-6 sm:py-12 animate-in fade-in duration-200">
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
                                        <div className={`w-20 h-20 sm:w-22 sm:h-22 rounded-3xl ${app.color} flex items-center justify-center text-white shadow-xl shadow-black/40 group-hover:scale-110 transition-transform duration-200 ease-out`}>
                                            <IconComponent className="w-10 h-10 text-white" strokeWidth={1.8} />
                                        </div>

                                        {/* Clean Label Beneath Icon */}
                                        <span className="text-xs sm:text-sm font-medium text-gray-300 group-hover:text-white transition-colors text-center tracking-tight">
                                            {app.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* Persistent Support Widgets */}
            <BeraxisSupportWidgets />
        </div>
    );
}
