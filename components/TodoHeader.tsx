"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckSquare, Plus, Bot, MessageSquare, Settings as SettingsIcon, ArrowLeft, LayoutGrid, Globe } from 'lucide-react';
import UniversalModuleSearch from "./shared/UniversalModuleSearch";
import UserProfileDropdown from "./shared/UserProfileDropdown";

interface TodoHeaderProps {
    onNewClick?: () => void;
    searchTerm?: string;
    onSearchChange?: (val: string) => void;
}

export default function TodoHeader({
    onNewClick,
    searchTerm = "",
    onSearchChange,
}: TodoHeaderProps) {
    const router = useRouter();
    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white sticky top-0 z-50 shadow-md">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 gap-2 sm:gap-3">
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

                    <Link href="/todo" className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-100 hover:text-white ml-0.5">
                        <div className="bg-blue-600 text-white w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg shadow-sm">
                            <CheckSquare size={17} />
                        </div>
                        <span className="font-bold tracking-tight">To-Do</span>
                    </Link>
                    {onNewClick && (
                        <button
                            onClick={onNewClick}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md shadow-purple-900/30 transition-all active:scale-95 cursor-pointer ml-1 shrink-0"
                        >
                            <Plus size={14} /> New Task
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-md mx-2 hidden md:block">
                    <UniversalModuleSearch
                        moduleName="Tasks"
                        placeholder="Search tasks, descriptions..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>

                {/* Right side icons & Profile Dropdown */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    <button
                        onClick={() => router.push("/ai")}
                        title="AI Assistant"
                        className="text-gray-400 hover:text-purple-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Bot size={17} />
                    </button>
                    <button
                        onClick={() => router.push("/discuss")}
                        title="Discuss"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <MessageSquare size={17} />
                    </button>
                    <button
                        onClick={() => router.push("/settings")}
                        title="Settings"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <SettingsIcon size={17} />
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
