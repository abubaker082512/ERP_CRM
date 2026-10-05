"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Users, Bot, MessageSquare, Plus, Settings } from 'lucide-react';
import UniversalModuleSearch from '@/components/shared/UniversalModuleSearch';

interface EmployeesHeaderProps {
    onNewClick?: () => void;
    searchTerm?: string;
    onSearchChange?: (val: string) => void;
}

export default function EmployeesHeader({ onNewClick, searchTerm = '', onSearchChange }: EmployeesHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: 'Employees', href: '/employees' },
        { name: 'Departments', href: '/employees/departments' },
        { name: 'Contracts', href: '/employees/contracts' },
        { name: 'Reporting', href: '/employees/reporting' },
        { name: 'Configuration', href: '/employees/configuration' },
    ];

    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-4">
                    <Link href="/" title="Dashboard" className="flex items-center gap-2 text-xl font-bold text-gray-200 hover:text-white transition-colors">
                        <div className="bg-purple-600/30 text-purple-400 border border-purple-500/30 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">
                            <Users size={18} />
                        </div>
                        Employees
                    </Link>

                    {onNewClick && (
                        <button
                            onClick={onNewClick}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-all active:scale-95 cursor-pointer ml-2"
                        >
                            <Plus size={16} /> New Employee
                        </button>
                    )}

                    <nav className="flex items-center gap-2 ml-3 overflow-x-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/employees' && pathname.startsWith(item.href));
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
                    placeholder="Search employees, departments, roles (Enter to jump)..."
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
                        className="flex items-center gap-2 border-l border-gray-700 pl-3 hover:opacity-90 transition-opacity"
                    >
                        <span className="text-xs text-gray-300 font-medium hidden xl:inline">ABT IT Innovation</span>
                        <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                            A
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
