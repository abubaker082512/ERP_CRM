"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, Bot, MessageSquare, Settings as SettingsIcon } from "lucide-react";
import UniversalModuleSearch from "../shared/UniversalModuleSearch";

interface ManufacturingHeaderProps {
    searchTerm?: string;
    onSearchChange?: (val: string) => void;
    onNewOrder?: () => void;
}

export default function ManufacturingHeader({
    searchTerm = "",
    onSearchChange,
    onNewOrder,
}: ManufacturingHeaderProps) {
    const pathname = usePathname();

    const navItems = [
        { name: "Overview", href: "/manufacturing" },
        { name: "Operations", href: "/manufacturing/operations" },
        { name: "Planning", href: "/manufacturing/planning" },
        { name: "Products", href: "/manufacturing/products" },
        { name: "Reporting", href: "/manufacturing/reporting" },
        { name: "Configuration", href: "/manufacturing/configuration" },
    ];

    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white">
            <div className="flex items-center justify-between px-4 py-2 gap-4">
                <div className="flex items-center gap-4 shrink-0">
                    <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-200 hover:text-white">
                        <div className="bg-orange-600 w-7 h-7 flex items-center justify-center rounded text-sm font-bold text-white shadow-sm">
                            <Wrench size={16} />
                        </div>
                        Manufacturing
                    </Link>
                    {onNewOrder && (
                        <button
                            onClick={onNewOrder}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium transition shadow-sm ml-1"
                        >
                            + New
                        </button>
                    )}
                    <nav className="hidden md:flex items-center gap-4 ml-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`text-xs font-medium transition-colors ${pathname === item.href || (item.href !== "/manufacturing" && pathname.startsWith(item.href))
                                        ? "text-white border-b-2 border-orange-500 pb-0.5"
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
                        moduleName="Manufacturing"
                        placeholder="Search work orders, BOMs, operations, or jump to module..."
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
                        <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-xs font-bold text-white shadow-inner">
                            A
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
