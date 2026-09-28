"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, LayoutGrid, List, Target, Plus } from "lucide-react";

export default function RecruitmentHeader() {
    const pathname = usePathname();

    const navItems = [
        { name: "Job Positions", href: "/recruitment" },
        { name: "Applications", href: "/recruitment/applications" },
        { name: "Reporting", href: "/recruitment/reporting" },
        { name: "Configuration", href: "/recruitment/configuration" },
    ];

    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white">
            <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-200 hover:text-white">
                        <div className="bg-teal-600 w-7 h-7 flex items-center justify-center rounded text-sm font-bold text-white">
                            <Target size={16} />
                        </div>
                        Recruitment
                    </Link>
                    <nav className="flex items-center gap-6 ml-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`text-sm font-medium transition-colors ${pathname === item.href || (item.href !== "/recruitment" && pathname.startsWith(item.href))
                                        ? "text-white"
                                        : "text-gray-400 hover:text-gray-200"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 max-w-xl mx-8">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-[#0F172A] border border-gray-600 rounded px-10 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-[#0F172A] rounded border border-gray-600 p-0.5 mr-4">
                        <button className="p-1.5 bg-gray-700 rounded text-white"><LayoutGrid size={16} /></button>
                        <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400"><List size={16} /></button>
                    </div>
                    <button className="text-gray-400 hover:text-white flex items-center gap-1">
                        <Plus size={18} className="text-teal-400" />
                    </button>
                    <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
                        <span className="text-xs text-gray-300 hidden md:inline">ABT IT Innovation PVT LTD.</span>
                        <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-xs font-bold">A</div>
                    </div>
                </div>
            </div>
        </header>
    );
}
