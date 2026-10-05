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
    LogOut,
    Bell,
    Database,
    Lock,
    Zap,
    X,
    PieChart,
    Globe
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import BeraxisSupportWidgets from "@/components/support/BeraxisSupportWidgets";

const apps = [
    { name: "Discuss", icon: LayoutDashboard, color: "bg-orange-500", href: "/discuss" },
    { name: "Calendar", icon: Calendar, color: "bg-yellow-600", href: "/calendar" },
    { name: "Appointments", icon: ClipboardList, color: "bg-cyan-500", href: "/appointments" },
    { name: "To do", icon: CheckSquare, color: "bg-blue-500", href: "/todo" },
    { name: "Knowledge", icon: BookOpen, color: "bg-teal-500", href: "/knowledge" },
    { name: "Contacts", icon: Users, color: "bg-purple-500", href: "/contacts" },
    { name: "CRM", icon: Target, color: "bg-cyan-600", href: "/crm" },
    { name: "Sales", icon: BarChart3, color: "bg-orange-600", href: "/sales" },
    { name: "Dashboards", icon: Grid3x3, color: "bg-pink-500", href: "/dashboard" },
    { name: "Point of Sale", icon: ShoppingCart, color: "bg-amber-600", href: "/pos" },
    { name: "Purchase", icon: ShoppingCart, color: "bg-pink-600", href: "/purchase" },
    { name: "Accounting", icon: CreditCard, color: "bg-red-500", href: "/accounting" },
    { name: "Project", icon: Palette, color: "bg-blue-600", href: "/project" },
    { name: "Timesheets", icon: Clock, color: "bg-indigo-500", href: "/timesheets" },
    { name: "Planning", icon: Grid3x3, color: "bg-yellow-500", href: "/planning" },
    { name: "Surveys", icon: MessageSquare, color: "bg-blue-400", href: "/surveys" },
    { name: "Inventory", icon: Package, color: "bg-purple-600", href: "/inventory" },
    { name: "Barcode", icon: Barcode, color: "bg-pink-600", href: "/barcode" },
    { name: "Sign", icon: PenTool, color: "bg-cyan-400", href: "/sign" },
    { name: "Employees", icon: UserCircle, color: "bg-indigo-600", href: "/employees" },
    { name: "Payroll", icon: CreditCard, color: "bg-pink-400", href: "/payroll" },
    { name: "Attendances", icon: UserCheck, color: "bg-orange-400", href: "/attendances" },
    { name: "Recruitment", icon: Target, color: "bg-teal-600", href: "/recruitment" },
    { name: "Manufacturing", icon: Cog, color: "bg-orange-700", href: "/manufacturing" },
    { name: "Helpdesk", icon: CheckSquare, color: "bg-indigo-500", href: "/helpdesk" },
    { name: "Documents", icon: BookOpen, color: "bg-blue-400", href: "/documents" },
    { name: "Team", icon: Users, color: "bg-purple-600", href: "/team" },
    { name: "Reports", icon: PieChart, color: "bg-purple-700", href: "/reports" },
    { name: "Settings", icon: Cog, color: "bg-gray-500", href: "/settings" },
];

function matchesModule(appName: string, selectedModule: string): boolean {
    if (!selectedModule) return false;
    return appName.toLowerCase().trim() === selectedModule.toLowerCase().trim();
}

export default function AppsDashboardPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [trialDays, setTrialDays] = useState<number | null>(null);
    const [selectedModule, setSelectedModule] = useState<string>("");
    const [isFreePlan, setIsFreePlan] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPaidUser, setIsPaidUser] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/login");
            return;
        }

        const mod = localStorage.getItem("selectedModule") || "";
        setSelectedModule(mod);

        const cachedUserStr = localStorage.getItem("user");
        if (cachedUserStr) {
            try {
                const cached = JSON.parse(cachedUserStr);
                setUserData(cached);
                const SUPER_ADMIN_EMAILS = ['admin@beraxis.online', 'admin2@erp-crm.com'];
                setIsAdmin(SUPER_ADMIN_EMAILS.includes(cached.email));
            } catch {}
        }

        // Silent background fetch to update fresh subscription and user details
        fetchUserData();
    }, [router]);

    const fetchUserData = async () => {
        try {
            const res = await fetchAPI("/auth/me");
            if (res.ok) {
                const data = await res.json();
                setUserData(data);

                const SUPER_ADMIN_EMAILS = ['admin@beraxis.online', 'admin2@erp-crm.com'];
                const isUserAdmin = SUPER_ADMIN_EMAILS.includes(data.email);
                setIsAdmin(isUserAdmin);

                if (data.tenant?.trial_ends_at) {
                    const ends = new Date(data.tenant.trial_ends_at);
                    const now = new Date();
                    const diffTime = ends.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    setTrialDays(diffDays > 0 ? diffDays : 0);
                }

                try {
                    const meta = JSON.parse(data.tenant?.stripe_customer_id || "{}");
                    if (data.tenant?.subscription_status === "active") {
                        if (meta?.plan === "One App Free" && !isUserAdmin) {
                            setIsFreePlan(true);
                        } else {
                            setIsPaidUser(true);
                        }
                    }
                } catch {}
            } else if (res.status === 401) {
                router.replace("/login");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-transparent text-white p-4 md:p-8 relative">
            {/* Top Command Banner */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-wrap justify-between items-center bg-[#0F172A]/60 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white/10 shadow-2xl gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20 border border-white/10 shrink-0">
                        {userData?.metadata?.name?.charAt(0) || userData?.email?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{userData?.metadata?.name || userData?.email?.split('@')[0] || "User"}</span>!
                        </h1>
                        <p className="text-gray-400 text-xs md:text-sm font-medium flex items-center gap-2 mt-0.5">
                            <Database size={12} className="text-purple-400" /> {userData?.tenant?.name || "Beraxis Workspace"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Visit Public Website Button */}
                    <Link
                        href="/"
                        title="Visit Main Website"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white transition-all border border-purple-500/30 text-xs font-semibold cursor-pointer"
                    >
                        <Globe size={15} />
                        <span>Visit Website</span>
                    </Link>

                    <button
                        onClick={() => router.push("/settings")}
                        className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5 cursor-pointer"
                        title="Notifications"
                    >
                        <Bell size={18} />
                    </button>
                    
                    <button 
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/login";
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/5 hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-all border border-white/5 text-xs font-medium cursor-pointer"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>

            {/* Trial Banner */}
            {trialDays !== null && !isAdmin && !isPaidUser && (
                <div className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/25 rounded-2xl p-4 md:p-5 text-amber-200 flex flex-wrap justify-between items-center shadow-xl backdrop-blur-md gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                            <Clock size={18} />
                        </div>
                        <p className="text-sm font-medium">
                            Your free trial will expire in <span className="text-amber-400 font-bold underline decoration-2 underline-offset-4">{trialDays} days</span>. 
                            Unlock the full power of Beraxis today.
                        </p>
                    </div>
                    <button 
                        onClick={() => router.push('/billing')}
                        className="bg-amber-500 hover:bg-amber-400 text-[#0F172A] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                    >
                        Upgrade Now
                    </button>
                </div>
            )}

            {/* Free Plan Banner */}
            {isFreePlan && (
                <div className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-purple-900/40 to-pink-900/30 border border-purple-500/25 rounded-2xl p-4 md:p-5 flex flex-wrap justify-between items-center shadow-xl backdrop-blur-md gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                            <Zap size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Free Plan — 1 Module Active</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {selectedModule ? <><span className="text-purple-400 font-medium">{selectedModule}</span> is your active module. All others are locked.</> : "Upgrade to unlock all 28 modules."}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/billing')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 cursor-pointer"
                    >
                        <Zap size={12} /> Upgrade Now
                    </button>
                </div>
            )}

            {/* App Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {apps.map((app) => {
                    const isLocked = isFreePlan && !matchesModule(app.name, selectedModule);
                    return (
                        <button
                            key={app.name}
                            onClick={() => {
                                if (isLocked) { setShowUpgradeModal(true); return; }
                                router.push(app.href);
                            }}
                            className={`flex flex-col items-center gap-3 p-4 rounded-lg transition-all group relative cursor-pointer ${
                                isLocked
                                    ? "opacity-40 grayscale hover:opacity-55"
                                    : "hover:bg-surface/50"
                            }`}
                        >
                            {/* Lock overlay */}
                            {isLocked && (
                                <div className="absolute top-1 right-1 w-5 h-5 bg-gray-800/90 border border-white/10 rounded-full flex items-center justify-center z-10">
                                    <Lock size={9} className="text-gray-400" />
                                </div>
                            )}
                            <div className={`${app.color} p-4 rounded-2xl shadow-lg transition-transform ${
                                isLocked ? "" : "group-hover:scale-110"
                            }`}>
                                <app.icon className="w-8 h-8 text-white" />
                            </div>
                            <span className={`text-sm transition-colors ${
                                isLocked ? "text-gray-500" : "text-gray-300 group-hover:text-white"
                            }`}>
                                {app.name}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Upgrade Modal for locked modules */}
            {showUpgradeModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(2,2,5,0.85)", backdropFilter: "blur(12px)" }}
                    onClick={() => setShowUpgradeModal(false)}
                >
                    <div
                        className="max-w-sm w-full bg-[#0F172A] border border-purple-500/25 rounded-3xl p-8 text-center shadow-2xl shadow-purple-500/15 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 cursor-pointer">
                            <X size={16} />
                        </button>
                        <div className="w-16 h-16 bg-purple-500/15 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-purple-500/20">
                            <Lock size={28} className="text-purple-400" />
                        </div>
                        <h2 className="text-xl font-black text-white mb-2">Module Locked</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            This module is only available on the <span className="text-white font-bold">Standard</span> or <span className="text-white font-bold">Premium</span> plan.
                            {selectedModule && <> Your current free module is <span className="text-purple-400 font-bold">{selectedModule}</span>.</>}
                        </p>
                        <button
                            onClick={() => { setShowUpgradeModal(false); router.push('/billing'); }}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Zap size={16} /> Upgrade to Unlock All Modules
                        </button>
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="mt-3 text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
                        >
                            Stay on Free Plan
                        </button>
                    </div>
                </div>
            )}

            {/* Persistent Support Widgets: WhatsApp on the Left, AI Support on the Right */}
            <BeraxisSupportWidgets />
        </div>
    );
}
