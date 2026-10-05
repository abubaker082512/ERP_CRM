"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, LayoutGrid, List, Bot, MessageSquare, Plus, Filter, Settings } from 'lucide-react';
import UniversalModuleSearch from '@/components/shared/UniversalModuleSearch';

interface ContactsHeaderProps {
    onNewClick?: () => void;
    searchTerm?: string;
    onSearchChange?: (val: string) => void;
    filterType?: 'all' | 'individual' | 'company';
    onFilterChange?: (type: 'all' | 'individual' | 'company') => void;
    viewMode?: 'grid' | 'list';
    onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export default function ContactsHeader({
    onNewClick,
    searchTerm = '',
    onSearchChange,
    filterType = 'all',
    onFilterChange,
    viewMode = 'grid',
    onViewModeChange,
}: ContactsHeaderProps) {
    const router = useRouter();

    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-2.5">
                {/* Brand & Module */}
                <div className="flex items-center gap-4">
                    <Link href="/" title="Dashboard" className="flex items-center gap-2 text-xl font-bold text-gray-200 hover:text-white transition-colors">
                        <div className="bg-blue-600/30 text-blue-400 border border-blue-500/30 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">
                            <Users size={18} />
                        </div>
                        Contacts
                    </Link>

                    {/* New Contact Action Button */}
                    {onNewClick && (
                        <button
                            onClick={onNewClick}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-all active:scale-95 cursor-pointer ml-2"
                        >
                            <Plus size={16} /> New Contact
                        </button>
                    )}

                    <nav className="flex items-center gap-4 ml-2">
                        <Link href="/contacts" className="text-white text-xs font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            Contacts
                        </Link>
                        <Link href="/contacts/config" className="text-gray-400 hover:text-gray-200 text-xs font-bold uppercase tracking-wider transition-colors px-2 py-1.5">
                            Configuration
                        </Link>
                    </nav>
                </div>

                {/* Search Bar with live search and filter badge */}
                <UniversalModuleSearch
                    placeholder="Search by name, email, phone, company, address..."
                    value={searchTerm}
                    onChange={onSearchChange}
                    className="mx-6"
                    customFilterBadge={
                        filterType !== 'all'
                            ? {
                                  label: filterType === 'individual' ? 'Individuals' : 'Companies',
                                  onRemove: () => onFilterChange?.('all'),
                              }
                            : undefined
                    }
                />

                {/* Right Controls & Actions */}
                <div className="flex items-center gap-3">
                    {/* Filter Type Pills */}
                    {onFilterChange && (
                        <div className="hidden md:flex items-center bg-[#0F172A] rounded-lg border border-gray-700 p-0.5">
                            <button
                                onClick={() => onFilterChange('all')}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                    filterType === 'all' ? 'bg-purple-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => onFilterChange('individual')}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                    filterType === 'individual' ? 'bg-purple-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                Individuals
                            </button>
                            <button
                                onClick={() => onFilterChange('company')}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                    filterType === 'company' ? 'bg-purple-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                Companies
                            </button>
                        </div>
                    )}

                    {/* Grid vs List Mode Toggle */}
                    {onViewModeChange && (
                        <div className="flex items-center bg-[#0F172A] rounded-lg border border-gray-700 p-0.5">
                            <button
                                onClick={() => onViewModeChange('grid')}
                                title="Grid View"
                                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                    viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <LayoutGrid size={15} />
                            </button>
                            <button
                                onClick={() => onViewModeChange('list')}
                                title="List Table View"
                                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                    viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <List size={15} />
                            </button>
                        </div>
                    )}

                    {/* AI Assistant */}
                    <button
                        onClick={() => router.push("/ai")}
                        title="AI Assistant"
                        className="text-gray-400 hover:text-purple-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Bot size={18} />
                    </button>

                    {/* Messages / Discuss */}
                    <button
                        onClick={() => router.push("/discuss")}
                        title="Discuss"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <MessageSquare size={18} />
                    </button>

                    {/* Settings */}
                    <button
                        onClick={() => router.push("/settings")}
                        title="Settings"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Settings size={18} />
                    </button>

                    {/* Profile */}
                    <Link
                        href="/settings"
                        title="Company Settings"
                        className="flex items-center gap-2 border-l border-gray-700 pl-3 hover:opacity-90 transition-opacity"
                    >
                        <span className="text-xs text-gray-300 font-medium hidden xl:inline">ABT IT Innovation</span>
                        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                            A
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
