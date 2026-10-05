"use client";

import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { CalendarRange, Bot, MessageSquare, Settings as SettingsIcon, ArrowLeft, LayoutGrid, Globe } from 'lucide-react';
import UniversalModuleSearch from "../shared/UniversalModuleSearch";

interface PlanningHeaderProps {
    searchTerm?: string;
    onSearchChange?: (val: string) => void;
    onNewShift?: () => void;
}

export default function PlanningHeader({
    searchTerm = "",
    onSearchChange,
    onNewShift,
}: PlanningHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { name: "Schedule", href: "/planning" },
        { name: "Calendar View", href: "/calendar" },
        { name: "Reports", href: "/reports" },
        { name: "Settings", href: "/settings" },
    ];

    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white">
            <div className="flex items-center justify-between px-4 py-2 gap-4">
                <div className="flex items-center gap-4 shrink-0">
                    
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

                    <Link href="/planning" className="flex items-center gap-2 text-xl font-semibold text-gray-200 hover:text-white">
                        <div className="bg-cyan-600 w-7 h-7 flex items-center justify-center rounded text-sm font-bold text-white shadow-sm">
                            <CalendarRange size={16} />
                        </div>
                        Planning
                    </Link>
                    {onNewShift && (
                        <button
                            onClick={onNewShift}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-xs font-medium transition shadow-sm ml-1"
                        >
                            + New Shift
                        </button>
                    )}
                    <nav className="hidden md:flex items-center gap-4 ml-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`text-xs font-medium transition-colors ${pathname === item.href || (item.href !== "/planning" && pathname.startsWith(item.href))
                                        ? "text-white border-b-2 border-cyan-500 pb-0.5"
                                        : "text-gray-400 hover:text-gray-200"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 max-w-xl mx-2">
                    <UniversalModuleSearch
                        moduleName="Planning"
                        placeholder="Search shifts, roles, schedules, or jump to module..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Link
                        href="/ai"
                        title="AI Assistant"
                        className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-gray-800 rounded transition"
                    >
                        <Bot size={18} />
                    </Link>
                    <Link
                        href="/discuss"
                        title="Discuss"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition relative"
                    >
                        <MessageSquare size={18} />
                    </Link>
                    <Link
                        href="/settings"
                        title="Settings"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition"
                    >
                        <SettingsIcon size={18} />
                    </Link>
                    <div className="flex items-center gap-2 border-l border-gray-700 pl-3">
                        <span className="text-xs text-gray-300 hidden xl:inline font-medium">ABT IT Innovation PVT LTD.</span>
                        <div className="w-6 h-6 bg-cyan-600 rounded flex items-center justify-center text-xs font-bold text-white shadow-inner">
                            A
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
