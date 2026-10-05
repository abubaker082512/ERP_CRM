"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    BarChart3,
    ArrowLeft,
    LayoutGrid,
    Globe,
    Bot,
    MessageSquare,
    Settings,
    RefreshCw,
    Sparkles,
    Zap
} from "lucide-react";
import UniversalModuleSearch from "@/components/shared/UniversalModuleSearch";

interface DashboardHeaderProps {
    onSync?: () => void;
    isSyncing?: boolean;
    searchTerm?: string;
    onSearchChange?: (val: string) => void;
    planBadge?: string;
}

export default function DashboardHeader({
    onSync,
    isSyncing = false,
    searchTerm = "",
    onSearchChange,
    planBadge = "Free Tier",
}: DashboardHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: "Overview", href: "/dashboard" },
        { name: "Sales Analytics", href: "/sales/reporting" },
        { name: "CRM Pipeline", href: "/crm/reporting" },
        { name: "Accounting Flow", href: "/accounting/reporting" },
        { name: "Inventory Pulse", href: "/inventory/reporting" },
    ];

    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-2.5 gap-3">
                {/* Left Section: Back, Apps, Website & Module Logo */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        title="Go back"
                        className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold cursor-pointer shrink-0"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    {/* Apps Dashboard Launcher Button */}
                    <Link
                        href="/apps"
                        title="Workspace Apps Dashboard"
                        className="flex items-center gap-1 text-gray-400 hover:text-purple-300 transition-colors p-1.5 rounded-lg hover:bg-purple-600/20 shrink-0"
                    >
                        <LayoutGrid size={18} />
                    </Link>

                    {/* Public Website Button */}
                    <Link
                        href="/"
                        title="Public Website"
                        className="flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition-colors p-1.5 rounded-lg hover:bg-cyan-600/20 shrink-0"
                    >
                        <Globe size={18} />
                    </Link>

                    <Link
                        href="/dashboard"
                        title="Executive Dashboard"
                        className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-100 hover:text-white transition-colors ml-1"
                    >
                        <div className="bg-pink-600/30 text-pink-400 border border-pink-500/30 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm shrink-0">
                            <BarChart3 size={18} />
                        </div>
                        <span className="hidden md:inline font-bold tracking-tight">Executive Dashboard</span>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1 ml-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                                        isActive
                                            ? "text-white bg-white/10 border border-white/10"
                                            : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Center: Universal Search */}
                <div className="flex-1 max-w-lg mx-2 hidden sm:block">
                    <UniversalModuleSearch
                        moduleName="Dashboard"
                        placeholder="Search metrics, orders, leads, or jump anywhere..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>

                {/* Right Action Icons & Sync */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {onSync && (
                        <button
                            onClick={onSync}
                            title="Sync live metrics"
                            className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                            <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
                            <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync"}</span>
                        </button>
                    )}

                    <Link
                        href="/ai"
                        title="Galaxy AI Business Intelligence"
                        className="text-gray-400 hover:text-purple-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Bot size={18} />
                    </Link>

                    <Link
                        href="/discuss"
                        title="Team Chat & Discuss"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <MessageSquare size={18} />
                    </Link>

                    <Link
                        href="/settings"
                        title="Settings"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Settings size={18} />
                    </Link>

                    <Link
                        href="/billing"
                        title="Subscription & Plan"
                        className="flex items-center gap-1.5 border-l border-gray-700 pl-3 hover:opacity-90 transition-opacity"
                    >
                        <div className="flex flex-col text-right hidden xl:flex">
                            <span className="text-xs text-gray-200 font-semibold truncate max-w-[120px]">Workspace</span>
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{planBadge}</span>
                        </div>
                        <div className="w-7 h-7 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                            <Zap size={13} />
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
