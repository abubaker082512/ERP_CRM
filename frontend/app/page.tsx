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
    CheckCircle,
    ArrowRight,
    Lock,
    Zap,
    X,
    PieChart
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Stats from "@/components/landing/Stats";
import Testimonials from "@/components/landing/Testimonials";
import { fetchAPI } from "@/lib/api";

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

// Detect if app name matches the selected free module
function matchesModule(appName: string, selectedModule: string): boolean {
    if (!selectedModule) return false;
    return appName.toLowerCase().trim() === selectedModule.toLowerCase().trim();
}

export default function Home() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [trialDays, setTrialDays] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [selectedModule, setSelectedModule] = useState<string>("");
    const [isFreePlan, setIsFreePlan] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPaidUser, setIsPaidUser] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("token");
        if (!token) {
            setIsLoggedIn(false);
            return;
        }
        setIsLoggedIn(true);
        // Read selected module from localStorage (set during free plan checkout)
        const mod = localStorage.getItem("selectedModule") || "";
        setSelectedModule(mod);
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

                // Detect free plan vs paid plan
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
            } else {
                router.push("/login");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!mounted || isLoggedIn === null) return null;

    if (!isLoggedIn) {
        return (
            <main className="min-h-screen bg-[#020205] text-white overflow-hidden">
                <Navbar />
                <Hero />
                
                {/* Product Preview Section */}
                <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28 animate-in fade-in duration-1000">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
                            Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Beraxis Command Center</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                            A glassmorphic, hyper-responsive command deck that consolidates all your business and customer operations into a single cohesive cockpit.
                        </p>
                    </div>

                    {/* CSS-based Glassmorphic Mockup Dashboard */}
                    <div className="relative border border-white/10 bg-[#0F172A]/70 backdrop-blur-2xl shadow-[0_0_50px_rgba(139,92,246,0.15)] rounded-3xl overflow-hidden aspect-[16/9] w-full p-4 md:p-6 group hover:border-purple-500/30 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>
                        
                        {/* Mock App Shell layout */}
                        <div className="h-full flex gap-4 text-xs font-sans">
                            {/* Sidebar Mockup */}
                            <div className="w-1/5 bg-[#141A28]/80 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shrink-0 hidden sm:flex">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
                                        <img src="/logo2.png" alt="Beraxis Logo" className="h-5 w-auto" />
                                        <span className="font-bold text-white tracking-wider uppercase text-[10px]">BERAXIS</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2.5 px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg font-bold"><LayoutDashboard size={14}/> Dashboard</div>
                                        <div className="flex items-center gap-2.5 px-3 py-2 text-gray-500 hover:text-gray-300 rounded-lg"><Users size={14}/> CRM Pipeline</div>
                                        <div className="flex items-center gap-2.5 px-3 py-2 text-gray-500 hover:text-gray-300 rounded-lg"><ShoppingCart size={14}/> Sales Orders</div>
                                        <div className="flex items-center gap-2.5 px-3 py-2 text-gray-500 hover:text-gray-300 rounded-lg"><Package size={14}/> Inventory</div>
                                        <div className="flex items-center gap-2.5 px-3 py-2 text-gray-500 hover:text-gray-300 rounded-lg"><BarChart3 size={14}/> Accounting</div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                    <span className="text-[9px] font-bold text-purple-400 block mb-1">PRO SERVICE ACTIVE</span>
                                    <span className="text-[10px] text-gray-400">whatsapp_sync_enabled</span>
                                </div>
                            </div>

                            {/* Main Mock Content */}
                            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                                {/* Header Mockup */}
                                <div className="h-12 bg-[#141A28]/60 border border-white/5 rounded-2xl px-4 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="font-bold text-gray-300">Live Enterprise Overview</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"><Bell size={12}/></div>
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">A</div>
                                    </div>
                                </div>

                                {/* Dashboard Grid Mockup */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
                                    {/* Stat Card 1 */}
                                    <div className="bg-[#1E293B]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/20 transition-colors">
                                        <div>
                                            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">MONTHLY REVENUE</span>
                                            <h3 className="text-xl font-bold text-white mt-1">$48,251.00</h3>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                                            <div className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Stat Card 2 */}
                                    <div className="bg-[#1E293B]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-pink-500/20 transition-colors">
                                        <div>
                                            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">CRM CONVERSION RATE</span>
                                            <h3 className="text-xl font-bold text-white mt-1">24.8%</h3>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                                            <div className="w-1/2 h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Stat Card 3 */}
                                    <div className="bg-[#1E293B]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
                                        <div>
                                            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">ACTIVE SUPPORT CHATS</span>
                                            <h3 className="text-xl font-bold text-emerald-400 mt-1">99.8% SLA</h3>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                                            <div className="w-[95%] h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Chart / Activity Simulator */}
                                    <div className="col-span-full md:col-span-2 bg-[#1E293B]/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-48 sm:h-auto">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-300">Sales Forecast vs Realization</span>
                                            <span className="text-[10px] text-gray-500">Real-time</span>
                                        </div>
                                        <div className="flex-1 flex items-end gap-3 pt-4 justify-between">
                                            <div className="w-12 bg-purple-500/20 rounded-t-lg h-2/5 relative group"><div className="absolute inset-x-0 bottom-0 bg-purple-500 rounded-t-lg h-3/5 group-hover:scale-y-110 transition-transform origin-bottom"></div></div>
                                            <div className="w-12 bg-purple-500/20 rounded-t-lg h-3/5 relative group"><div className="absolute inset-x-0 bottom-0 bg-purple-500 rounded-t-lg h-4/5 group-hover:scale-y-110 transition-transform origin-bottom"></div></div>
                                            <div className="w-12 bg-purple-500/20 rounded-t-lg h-4/5 relative group"><div className="absolute inset-x-0 bottom-0 bg-purple-500 rounded-t-lg h-2/3 group-hover:scale-y-110 transition-transform origin-bottom"></div></div>
                                            <div className="w-12 bg-purple-500/20 rounded-t-lg h-3/4 relative group"><div className="absolute inset-x-0 bottom-0 bg-purple-500 rounded-t-lg h-5/6 group-hover:scale-y-110 transition-transform origin-bottom"></div></div>
                                            <div className="w-12 bg-purple-500/20 rounded-t-lg h-[95%] relative group"><div className="absolute inset-x-0 bottom-0 bg-purple-500 rounded-t-lg h-4/5 group-hover:scale-y-110 transition-transform origin-bottom"></div></div>
                                            <div className="w-12 bg-purple-500/20 rounded-t-lg h-[85%] relative group"><div className="absolute inset-x-0 bottom-0 bg-purple-500 rounded-t-lg h-[90%] group-hover:scale-y-110 transition-transform origin-bottom"></div></div>
                                        </div>
                                    </div>

                                    {/* CRM Pipeline Activity feed */}
                                    <div className="bg-[#1E293B]/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hidden md:flex">
                                        <span className="font-bold text-gray-300 mb-3">Active Deal Leads</span>
                                        <div className="space-y-3 flex-1 overflow-y-auto">
                                            <div className="bg-[#0F172A]/50 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                                                <span className="font-bold text-white">Acme Corp Ltd</span>
                                                <span className="text-[9px] bg-purple-500/20 text-purple-400 font-bold px-2 py-0.5 rounded">Closed Won</span>
                                            </div>
                                            <div className="bg-[#0F172A]/50 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                                                <span className="font-bold text-white">X-Enterprise</span>
                                                <span className="text-[9px] bg-yellow-500/20 text-yellow-400 font-bold px-2 py-0.5 rounded">Negotiation</span>
                                            </div>
                                            <div className="bg-[#0F172A]/50 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                                                <span className="font-bold text-white">Novus Solutions</span>
                                                <span className="text-[9px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded">Proposition</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Stats />
                <Features />
                <Testimonials />
                
                {/* Pricing Section */}
                <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-40 mb-28 scroll-mt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
                            Transparent, Value-Packed <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Pricing</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                            Start with a single module forever free, or unlock the standard multi-app experience for only $24.90 per user seat.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
                        {/* Free Plan */}
                        <div className="galaxy-card p-6 md:p-8 flex flex-col justify-between bg-[#0F172A]/20">
                            <div>
                                <h3 className="text-xl font-bold text-gray-200 mb-2">One App Free</h3>
                                <p className="text-gray-400 text-xs mb-6">Choose any single module with unlimited users forever.</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-extrabold text-white">$0</span>
                                    <span className="text-gray-500 text-xs">/ seat / month</span>
                                </div>
                                <div className="space-y-3 pt-6 border-t border-white/5 text-xs text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                        <span>Use any **1** full module</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                        <span>Unlimited user seats</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                        <span>Managed Cloud Hosting</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => router.push('/signup')}
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-xl mt-8 transition-all border border-white/10 text-xs flex items-center justify-center gap-2"
                            >
                                Deploy Free App
                            </button>
                        </div>

                        {/* Standard Plan */}
                        <div className="galaxy-card p-6 md:p-8 flex flex-col justify-between border-purple-500/30 bg-[#0F172A]/40 relative shadow-2xl shadow-purple-500/5">
                            <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-[8px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-lg">
                                All Apps Included
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-purple-300 mb-2">Standard</h3>
                                <p className="text-gray-400 text-xs mb-6">Access all 28 integrated modules for your operations.</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-extrabold text-white">$24.90</span>
                                    <span className="text-gray-500 text-xs">/ seat / month</span>
                                </div>
                                <div className="space-y-3 pt-6 border-t border-purple-500/10 text-xs text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                        <span className="font-semibold text-white">All 28 enterprise modules</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                        <span>Standard Cloud SaaS</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-purple-400 shrink-0" size={14} />
                                        <span>Live Database Backups</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => router.push('/signup')}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-4 rounded-xl mt-8 transition-all shadow-lg text-xs flex items-center justify-center gap-2"
                            >
                                Deploy Standard
                            </button>
                        </div>

                        {/* Custom Plan */}
                        <div className="galaxy-card p-6 md:p-8 flex flex-col justify-between bg-[#0F172A]/20">
                            <div>
                                <h3 className="text-xl font-bold text-pink-300 mb-2">Custom</h3>
                                <p className="text-gray-400 text-xs mb-6">Studio customizations, multi-company support, and API access.</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-extrabold text-white">$37.40</span>
                                    <span className="text-gray-500 text-xs">/ seat / month</span>
                                </div>
                                <div className="space-y-3 pt-6 border-t border-white/5 text-xs text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-pink-400 shrink-0" size={14} />
                                        <span className="font-semibold text-white">Beraxis Studio customizer</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-pink-400 shrink-0" size={14} />
                                        <span>External APIs & Webhooks</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-pink-400 shrink-0" size={14} />
                                        <span className="font-semibold text-white">24/7 WhatsApp & Phone Support</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => router.push('/signup')}
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-xl mt-8 transition-all border border-white/10 text-xs flex items-center justify-center gap-2"
                            >
                                Configure Custom
                            </button>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/pricing" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold text-sm tracking-wider uppercase transition-colors">
                            View Detailed Interactive Pricing Configurator <ArrowRight size={14} />
                        </Link>
                    </div>
                </section>

                <Footer />
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-8">
            {/* Top Header Section */}
            <div className="max-w-7xl mx-auto mb-10 flex justify-between items-center bg-[#0F172A]/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20 border border-white/10">
                        {userData?.metadata?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{userData?.metadata?.name || "User"}</span>!
                        </h1>
                        <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
                            <Database size={12} className="text-purple-400" /> {userData?.tenant?.name || "Beraxis Workspace"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5">
                        <Bell size={20} />
                    </button>
                    <button 
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/login";
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all border border-white/5 font-medium"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {/* Trial Banner */}
            {trialDays !== null && !isAdmin && !isPaidUser && (
                <div className="max-w-7xl mx-auto mb-10 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 text-amber-200 flex justify-between items-center shadow-xl backdrop-blur-md">
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
                        className="bg-amber-500 hover:bg-amber-400 text-[#0F172A] px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                        Upgrade Now
                    </button>
                </div>
            )}

            {/* Free Plan Banner */}
            {isFreePlan && (
                <div className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-purple-900/40 to-pink-900/30 border border-purple-500/25 rounded-2xl p-5 flex justify-between items-center shadow-xl backdrop-blur-md">
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
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
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
                            className={`flex flex-col items-center gap-3 p-4 rounded-lg transition-all group relative ${
                                isLocked
                                    ? "opacity-40 grayscale cursor-pointer hover:opacity-55"
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
                        className="max-w-sm w-full bg-[#0F172A] border border-purple-500/25 rounded-3xl p-8 text-center shadow-2xl shadow-purple-500/15"
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-1">
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
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                        >
                            <Zap size={16} /> Upgrade to Unlock All Modules
                        </button>
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="mt-3 text-xs text-gray-500 hover:text-white transition-colors"
                        >
                            Stay on Free Plan
                        </button>
                    </div>
                </div>
            )}

            {/* Persistent Floating WhatsApp Support Widget for logged-in users */}
            <a 
                href="https://wa.me/19707807993" 
                target="_blank" 
                rel="noreferrer" 
                className="fixed bottom-8 right-8 z-50 bg-[#25D366] hover:bg-[#20BA56] text-white p-4 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 flex items-center justify-center group active:scale-95 border border-white/10"
                title="Chat with Beraxis Live Support"
            >
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap font-bold text-xs pl-0 group-hover:pl-2 group-hover:pr-2">
                    Live Chat Support
                </span>
                <MessageSquare className="w-5 h-5" />
            </a>
        </div>
    );
}
