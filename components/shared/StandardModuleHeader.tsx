"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Bell, Settings, Bot, MessageSquare } from "lucide-react";
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
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/60">
                <div className="flex items-center gap-4">
                    {/* Home Button */}
                    <Link
                        href="/"
                        title="Main Dashboard"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                    >
                        <Home size={20} />
                    </Link>

                    {/* Module Name */}
                    <Link
                        href={menuItems[0]?.href || "/"}
                        className="flex items-center gap-2.5 text-lg font-bold text-gray-100 hover:text-white transition-colors"
                    >
                        <div className="bg-purple-600/30 text-purple-400 border border-purple-500/30 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">
                            {moduleIcon}
                        </div>
                        <span>{moduleName}</span>
                    </Link>
                </div>

                {/* Universal Search Bar */}
                <UniversalModuleSearch
                    placeholder={searchPlaceholder || `Search ${moduleName}...`}
                    value={searchValue}
                    onChange={onSearchChange}
                    onSearch={onSearch}
                    className="mx-6"
                />

                {/* Right Actions */}
                <div className="flex items-center gap-3">
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
                        <span className="absolute 1 top-1 right-1 bg-purple-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
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
                        className="flex items-center gap-2 border-l border-gray-700 pl-3 hover:opacity-90 transition-opacity"
                    >
                        <span className="text-xs text-gray-300 font-medium hidden lg:inline">
                            ABT IT Innovation
                        </span>
                        <div className="w-7 h-7 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                            A
                        </div>
                    </Link>
                </div>
            </div>

            {/* Navigation Sub-Menu */}
            <nav className="flex items-center gap-1 px-4 overflow-x-auto">
                {menuItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== menuItems[0]?.href && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap ${
                                isActive
                                    ? "text-white bg-[#0F172A]"
                                    : "text-gray-400 hover:text-gray-200 hover:bg-[#0F172A]/50"
                            }`}
                        >
                            {item.name}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}
