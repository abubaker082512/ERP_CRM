"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Target, Bot, MessageSquare, Plus, Settings, ArrowLeft, LayoutGrid, Globe } from 'lucide-react';
import UniversalModuleSearch from '@/components/shared/UniversalModuleSearch';
import { useBranchContext } from '@/lib/branchContext';

interface CRMHeaderProps {
    onNewClick?: () => void;
    searchTerm?: string;
    onSearchChange?: (val: string) => void;
}

export default function CRMHeader({ onNewClick, searchTerm = '', onSearchChange }: CRMHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { activeBranch, isFreePlan } = useBranchContext();

    const entityDisplayName = activeBranch?.name || "My Workspace";
    const entityInitial = entityDisplayName.charAt(0).toUpperCase() || "W";

    const navItems = [
        { name: 'Pipeline', href: '/crm', paidOnly: false },
        { name: isFreePlan ? 'Leads Pool 🔒 (Paid)' : 'Leads Pool 🌐', href: '/crm/leads-pool', paidOnly: true },
        { name: 'Activities & History', href: '/crm/activities', paidOnly: false },
        { name: 'Sales', href: '/sales', paidOnly: false },
        { name: 'Reporting', href: '/crm/reporting', paidOnly: false },
        { name: 'Configuration', href: '/crm/configuration', paidOnly: false },
    ];

    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white sticky top-0 z-50 w-full max-w-full overflow-x-clip">
            <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2 gap-2 min-w-0">
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

                    <Link href="/crm" title="Dashboard" className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-200 hover:text-white transition-colors shrink-0">
                        <div className="bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">
                            <Target size={18} />
                        </div>
                        <span>CRM</span>
                    </Link>

                    {onNewClick && (
                        <button
                            onClick={onNewClick}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                            <Plus size={15} /> New Deal
                        </button>
                    )}

                    <nav className="hidden 2xl:flex items-center gap-1.5 ml-2 overflow-x-auto scrollbar-none">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/crm' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
                                        isActive
                                            ? 'text-white bg-white/10 border border-white/10'
                                            : item.paidOnly && isFreePlan
                                            ? 'text-amber-400/90 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20'
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
                <div className="w-56 xl:w-64 mx-2 hidden xl:block shrink-0">
                    <UniversalModuleSearch
                        placeholder="Search CRM leads, deals..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
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
                        href="/settings"
                        title="Company Settings"
                        className="flex items-center gap-2 border-l border-gray-700 pl-2.5 hover:opacity-90 transition-opacity"
                    >
                        <span className="text-xs text-gray-300 font-medium hidden xl:inline max-w-[140px] truncate">{entityDisplayName}</span>
                        <div className="w-7 h-7 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                            {entityInitial}
                        </div>
                    </Link>
                </div>
            </div>

            {/* Sub-bar navigation for viewports < 2xl */}
            <div className="2xl:hidden flex items-center px-3 py-1.5 gap-1.5 text-xs overflow-x-auto bg-[#1E293B]/90 border-t border-gray-700/50 scrollbar-none">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/crm' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                                isActive
                                    ? 'text-white bg-white/10'
                                    : item.paidOnly && isFreePlan
                                    ? 'text-amber-400/90 bg-amber-500/10'
                                    : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </div>
        </header>
    );
}
