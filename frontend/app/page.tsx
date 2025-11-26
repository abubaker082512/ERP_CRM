"use client";

import { useRouter } from "next/navigation";
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
    Palette
} from "lucide-react";

const apps = [
    { name: "Dashboard", icon: Grid3x3, color: "bg-pink-500", href: "/dashboard" },
    { name: "CRM", icon: Target, color: "bg-cyan-600", href: "/crm" },
    { name: "Sales", icon: BarChart3, color: "bg-orange-600", href: "/sales" },
    { name: "Contacts", icon: Users, color: "bg-purple-500", href: "/contacts" },
    { name: "Inventory", icon: Package, color: "bg-purple-600", href: "/inventory" },
    { name: "Purchase", icon: ShoppingCart, color: "bg-pink-600", href: "/purchase" },
    { name: "Accounting", icon: CreditCard, color: "bg-red-500", href: "/accounting" },
    { name: "Manufacturing", icon: Cog, color: "bg-orange-700", href: "/manufacturing" },
    { name: "Employees", icon: UserCircle, color: "bg-indigo-600", href: "/employees" },
    { name: "Payroll", icon: CreditCard, color: "bg-pink-400", href: "/payroll" },
    { name: "Project", icon: Palette, color: "bg-blue-600", href: "/project" },
    { name: "Helpdesk", icon: CheckSquare, color: "bg-indigo-500", href: "/helpdesk" },
    { name: "Documents", icon: BookOpen, color: "bg-blue-400", href: "/documents" },
    { name: "Discuss", icon: LayoutDashboard, color: "bg-orange-500", href: "/discuss" },
    { name: "Calendar", icon: Calendar, color: "bg-yellow-600", href: "/calendar" },
    { name: "Settings", icon: Cog, color: "bg-gray-500", href: "/settings" },
];

export default function Home() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background p-8">
            {/* Trial Banner */}
            <div className="max-w-7xl mx-auto mb-8 bg-amber-900/50 border border-amber-700 rounded-lg p-4 text-amber-200">
                <p className="text-sm">
                    Your free trial will expire in <span className="font-bold">14 days</span>.{" "}
                    <button className="underline hover:text-amber-100">Register your subscription</button> or{" "}
                    <button className="underline hover:text-amber-100">buy a subscription</button>.
                </p>
            </div>

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
