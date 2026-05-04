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
    PenTool
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
                    <div className="max-w-7xl mx-auto px-4">
                        <p>© {new Date().getFullYear()} Galaxy ERP. All rights reserved.</p>
                        <p className="mt-2">Empowering businesses to scale beyond boundaries.</p>
                    </div>
                </footer>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-8">
            {/* Trial Banner */}
            {trialDays !== null && (
                <div className="max-w-7xl mx-auto mb-8 bg-amber-900/50 border border-amber-700 rounded-lg p-4 text-amber-200 flex justify-between items-center shadow-lg">
                    <p className="text-sm">
                        Hello {userData?.metadata?.name || "User"}! Your free trial will expire in <span className="font-bold underline">{trialDays} days</span>.{" "}
                        Unlock all premium features today.
                    </p>
                    <button 
                        onClick={() => router.push('/billing')}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 rounded text-xs font-bold transition-all shadow-md"
                    >
                        Buy Subscription
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
