"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, LayoutGrid, Globe, Settings, Bot, MessageSquare } from "lucide-react";
import UniversalModuleSearch from "./UniversalModuleSearch";

type MenuItem = {
    name: string;
    href: string;
};

type ModuleHeaderProps = {
    moduleName: string;
    moduleIcon: React.ReactNode;
    menuItems: MenuItem[];
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (val: string) => void;
    onSearch?: (val: string) => void;
};

export default function StandardModuleHeader({
    moduleName,
    moduleIcon,
    menuItems,
    searchPlaceholder = "Search...",
    searchValue,
    onSearchChange,
    onSearch,
}: ModuleHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white sticky top-0 z-50">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/60 gap-4">
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        title="Go back"
                        className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    {/* Apps Dashboard Launcher Button */}
                    <Link
                        href="/apps"
                        title="Workspace Apps Dashboard"
                        className="flex items-center gap-1 text-gray-400 hover:text-purple-300 transition-colors p-1.5 rounded-lg hover:bg-purple-600/20"
                    >
                        <LayoutGrid size={18} />
                    </Link>

                    {/* Public Website Button */}
                    <Link
                        href="/"
                        title="Public Website"
                        className="flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition-colors p-1.5 rounded-lg hover:bg-cyan-600/20"
                    >
                        <Globe size={18} />
                    </Link>

                    {/* Module Name & Icon */}
                    <Link
                        href={menuItems[0]?.href || "/apps"}
                        className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-100 hover:text-white transition-colors ml-1"
                    >
                        <div className="bg-purple-600/30 text-purple-400 border border-purple-500/30 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg shadow-sm shrink-0">
                            {moduleIcon}
                        </div>
                        <span className="truncate">{moduleName}</span>
                    </Link>
                </div>

                {/* Universal Search Bar */}
                <div className="flex-1 max-w-xl mx-2">
                    <UniversalModuleSearch
                        moduleName={moduleName}
                        placeholder={searchPlaceholder || `Search ${moduleName}...`}
                        value={searchValue}
                        onChange={onSearchChange}
                        onSearch={onSearch}
                    />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button
                        onClick={() => router.push("/ai")}
                        title="AI Assistant & Smart Search"
                        className="text-gray-400 hover:text-purple-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Bot size={19} />
                    </button>

                    <button
                        onClick={() => router.push("/discuss")}
                        title="Discuss & Messages"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 relative transition-colors cursor-pointer"
                    >
                        <MessageSquare size={19} />
                        <span className="absolute top-1 right-1 bg-purple-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                            3
                        </span>
                    </button>

                    <button
                        onClick={() => router.push("/settings")}
                        title="System Settings"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Settings size={19} />
                    </button>

                    <Link
                        href="/settings"
                        title="Company Profile"
                        className="flex items-center gap-2 border-l border-gray-700 pl-3 hover:opacity-80 transition-opacity"
                    >
                        <span className="text-xs text-gray-300 font-medium hidden xl:inline">ABT IT Innovation PVT LTD.</span>
                        <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner">
                            A
                        </div>
                    </Link>
                </div>
            </div>

            {/* Menu Navigation Items Bar */}
            {menuItems && menuItems.length > 0 && (
                <div className="flex items-center px-4 py-1.5 gap-6 text-sm overflow-x-auto bg-[#1E293B]/60 scrollbar-none">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && item.href !== "/apps" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`font-medium transition-colors whitespace-nowrap text-xs ${
                                    isActive
                                        ? "text-purple-400 border-b-2 border-purple-500 pb-0.5"
                                        : "text-gray-400 hover:text-gray-200"
                                }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            )}
        </header>
    );
}
