"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bell, Settings, User } from "lucide-react";

type MenuItem = {
    name: string;
    href: string;
};

type ModuleHeaderProps = {
    moduleName: string;
    moduleIcon: React.ReactNode;
    menuItems: MenuItem[];
    searchPlaceholder?: string;
};

export default function StandardModuleHeader({
    moduleName,
    moduleIcon,
    menuItems,
    searchPlaceholder = "Search...",
}: ModuleHeaderProps) {
    const pathname = usePathname();

    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white sticky top-0 z-50">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    {/* Home Button */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <Home size={20} />
                    </Link>

                    {/* Module Name */}
                    <Link
                        href={menuItems[0]?.href || "/"}
                        className="flex items-center gap-2 text-xl font-semibold text-gray-200 hover:text-white"
                    >
                        <div className="bg-blue-500 w-8 h-8 flex items-center justify-center rounded">
                            {moduleIcon}
                        </div>
                        {moduleName}
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-xl mx-8">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="w-full bg-[#0F172A] border border-gray-600 rounded px-10 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button className="text-gray-400 hover:text-white relative">
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            3
                        </span>
                    </button>
                    <button className="text-gray-400 hover:text-white">
                        <Settings size={20} />
                    </button>
                    <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
                        <span className="text-xs text-gray-300 hidden md:inline">
                            ABT IT Innovation PVT LTD.
                        </span>
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                            A
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex items-center gap-1 px-4">
                {menuItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== menuItems[0].href && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`px-4 py-3 text-sm font-medium transition-colors relative ${isActive
                                    ? "text-white bg-[#0F172A]"
                                    : "text-gray-400 hover:text-gray-200 hover:bg-[#0F172A]/50"
                                }`}
                        >
                            {item.name}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}
