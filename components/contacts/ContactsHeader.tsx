"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, LayoutGrid, List, Bot, MessageSquare, Plus, Filter, Settings, ArrowLeft, Globe } from 'lucide-react';
import UniversalModuleSearch from '@/components/shared/UniversalModuleSearch';
import UserProfileDropdown from '@/components/shared/UserProfileDropdown';

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
        <header className="bg-[#1E293B] border-b border-gray-700 text-white sticky top-0 z-50 shadow-md">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 gap-2 sm:gap-3">
                {/* Brand & Module */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Beraxis Logo & Branding */}
                    <Link
                        href="/apps"
                        title="Beraxis Workspace"
                        className="flex items-center gap-2 pr-2 border-r border-gray-700/80 shrink-0 hover:opacity-90 transition-opacity"
                    >
                        <img src="/logo2.png" alt="Beraxis Logo" className="h-6 w-auto" />
                        <span className="font-extrabold text-sm tracking-tight text-white hidden xl:inline">BERAXIS</span>
                    </Link>

                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        title="Go back"
                        className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold cursor-pointer shrink-0"
                    >
                        <ArrowLeft size={15} />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    {/* Apps Dashboard Launcher Button */}
                    <Link
                        href="/apps"
                        title="Workspace Apps Dashboard"
                        className="flex items-center gap-1 text-gray-400 hover:text-purple-300 transition-colors p-1.5 rounded-lg hover:bg-purple-600/20 shrink-0"
                    >
                        <LayoutGrid size={17} />
                    </Link>

                    {/* Public Website Button */}
                    <Link
                        href="/"
                        title="Public Website"
                        className="flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition-colors p-1.5 rounded-lg hover:bg-cyan-600/20 shrink-0"
                    >
                        <Globe size={17} />
                    </Link>

                    {/* Module Title */}
                    <Link href="/contacts" title="Contacts Overview" className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-100 hover:text-white transition-colors ml-0.5">
                        <div className="bg-blue-600/30 text-blue-400 border border-blue-500/30 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg shadow-sm shrink-0">
                            <Users size={17} />
                        </div>
                        <span className="font-bold tracking-tight">Contacts</span>
                    </Link>

                    {/* New Contact Action */}
                    {onNewClick && (
                        <button
                            onClick={onNewClick}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md shadow-purple-900/30 transition-all active:scale-95 cursor-pointer ml-1 shrink-0"
                        >
                            <Plus size={14} /> New Contact
                        </button>
                    )}

                    {/* Quick Filters */}
                    {onFilterChange && (
                        <div className="hidden lg:flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5 text-xs ml-1">
                            <button
                                onClick={() => onFilterChange('all')}
                                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                                    filterType === 'all'
                                        ? 'bg-purple-600/40 text-purple-200 border border-purple-500/30'
                                        : 'text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => onFilterChange('individual')}
                                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                                    filterType === 'individual'
                                        ? 'bg-purple-600/40 text-purple-200 border border-purple-500/30'
                                        : 'text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                People
                            </button>
                            <button
                                onClick={() => onFilterChange('company')}
                                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                                    filterType === 'company'
                                        ? 'bg-purple-600/40 text-purple-200 border border-purple-500/30'
                                        : 'text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                Companies
                            </button>
                        </div>
                    )}
                </div>

                {/* Universal Search Bar */}
                <div className="flex-1 max-w-md mx-2 hidden md:block">
                    <UniversalModuleSearch
                        placeholder="Search contacts, companies, emails, phones..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>

                {/* Actions, Views & User Profile Dropdown */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    {/* View Switchers */}
                    {onViewModeChange && (
                        <div className="flex items-center bg-black/20 p-1 rounded-lg border border-white/5">
                            <button
                                onClick={() => onViewModeChange('grid')}
                                title="Card Grid View"
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
                        <Bot size={17} />
                    </button>

                    {/* Messages / Discuss */}
                    <button
                        onClick={() => router.push("/discuss")}
                        title="Discuss"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <MessageSquare size={17} />
                    </button>

                    {/* Settings */}
                    <button
                        onClick={() => router.push("/settings")}
                        title="Settings"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Settings size={17} />
                    </button>

                    {/* Vertical Divider */}
                    <div className="w-px h-5 bg-gray-700 mx-1"></div>

                    {/* Integrated User Profile Dropdown */}
                    <UserProfileDropdown />
                </div>
            </div>
        </header>
    );
}
