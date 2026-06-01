"use client";

import { useRouter } from "next/navigation";
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
    Database
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
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
    { name: "Settings", icon: Cog, color: "bg-gray-500", href: "/settings" },
];

export default function Home() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [trialDays, setTrialDays] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("token");
        if (!token) {
            setIsLoggedIn(false);
            return;
        }
        setIsLoggedIn(true);
        fetchUserData();
    }, [router]);

    const fetchUserData = async () => {
        try {
            const res = await fetchAPI("/auth/me");
            if (res.ok) {
                const data = await res.json();
                setUserData(data);
                
                if (data.tenant?.trial_ends_at) {
                    const ends = new Date(data.tenant.trial_ends_at);
                    const now = new Date();
                    const diffTime = ends.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    setTrialDays(diffDays > 0 ? diffDays : 0);
                }
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
                <Stats />
                <Features />
                <Testimonials />
                
                {/* Simple Footer */}
                <footer className="border-t border-white/10 py-12 text-center text-gray-500 text-sm relative z-10 bg-[#0F172A]">
                    <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">
                        <img src="/logo2.png" alt="Beraxis Logo" className="h-8 w-auto mb-4 opacity-80 hover:opacity-100 transition-opacity" />
                        <p>© {new Date().getFullYear()} Beraxis. All rights reserved.</p>
                        <p className="mt-2">Empowering businesses to scale beyond boundaries.</p>
                    </div>
                </footer>
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
            {trialDays !== null && (
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

            {/* App Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {apps.map((app) => (
                    <button
                        key={app.name}
                        onClick={() => router.push(app.href)}
                        className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-surface/50 transition-all group"
                    >
                        <div className={`${app.color} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                            <app.icon className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                            {app.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
