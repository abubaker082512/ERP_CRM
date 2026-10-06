"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Target, Bot, MessageSquare, Plus, Settings, ArrowLeft, LayoutGrid, Globe } from 'lucide-react';
import UniversalModuleSearch from '@/components/shared/UniversalModuleSearch';

interface CRMHeaderProps {
    onNewClick?: () => void;
    searchTerm?: string;
    onSearchChange?: (val: string) => void;
}

export default function CRMHeader({ onNewClick, searchTerm = '', onSearchChange }: CRMHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: 'Pipeline', href: '/crm' },
        { name: 'Leads Pool 🌐', href: '/crm/leads-pool' },
        { name: 'Activities & History', href: '/crm/activities' },
        { name: 'Sales', href: '/sales' },
        { name: 'Reporting', href: '/crm/reporting' },
        { name: 'Configuration', href: '/crm/configuration' },
    ];

    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-4">
                    
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

                    <Link href="/crm" title="Dashboard" className="flex items-center gap-2 text-xl font-bold text-gray-200 hover:text-white transition-colors">
                        <div className="bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">
                            <Target size={18} />
                        </div>
                        CRM
                    </Link>

                    {onNewClick && (
                        <button
                            onClick={onNewClick}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-all active:scale-95 cursor-pointer ml-2"
                        >
                            <Plus size={16} /> New Deal
                        </button>
                    )}

                    <nav className="flex items-center gap-2 ml-3 overflow-x-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/crm' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                                        isActive
                                            ? 'text-white bg-white/10 border border-white/10'
                                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Universal Search Bar */}
                <UniversalModuleSearch
                    placeholder="Search CRM leads, opportunities, activities (Enter to jump)..."
                    value={searchTerm}
                    onChange={onSearchChange}
                    className="mx-6"
                />

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/ai")}
                        title="AI Search & Assistant"
                        className="text-gray-400 hover:text-purple-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Bot size={18} />
                    </button>

                    <button
                        onClick={() => router.push("/discuss")}
                        title="Discuss"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 relative transition-colors cursor-pointer"
                    >
                        <MessageSquare size={18} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
                    </button>

                    <button
                        onClick={() => router.push("/settings")}
                        title="Settings"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Settings size={18} />
                    </button>

                    <Link
                        href="/billing"
                        title="Subscription & Plan"
                        className="flex items-center gap-1.5 border-l border-gray-700 pl-3 hover:opacity-90 transition-opacity"
                    >
                        <div className="flex flex-col text-right hidden xl:flex">
                            <span className="text-xs text-gray-200 font-semibold truncate max-w-[130px]">ABT IT Innovation</span>
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Free Plan</span>
                        </div>
                        <div className="w-7 h-7 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                            <Target size={13} />
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
