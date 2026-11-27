"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    ArrowLeft,
    LayoutGrid,
    Globe,
    Settings,
    Bot,
    MessageSquare,
    Plus,
    Sun,
    Moon
} from "lucide-react";
import UniversalModuleSearch from "./UniversalModuleSearch";
import UserProfileDropdown from "./UserProfileDropdown";
import UniversalBranchSwitcher from "./UniversalBranchSwitcher";
import NotificationBellDropdown from "./NotificationBellDropdown";
import { useTheme } from "@/lib/themeContext";
import { useNotifications } from "@/lib/notificationContext";

export type MenuItem = {
    name: string;
    href: string;
};

export type StandardModuleHeaderProps = {
    moduleName: string;
    moduleIcon: React.ReactNode;
    menuItems?: MenuItem[];
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (val: string) => void;
    onSearch?: (val: string) => void;
    onNewClick?: () => void;
    newButtonText?: string;
    newButtonLabel?: string;
    actionButton?: React.ReactNode;
    planBadge?: string;
};

export default function StandardModuleHeader({
    moduleName,
    moduleIcon,
    menuItems = [],
    searchPlaceholder,
    searchValue = "",
    onSearchChange,
    onSearch,
    onNewClick,
    newButtonText = "New",
    newButtonLabel,
    actionButton
}: StandardModuleHeaderProps) {
    const resolvedNewLabel = (newButtonLabel || newButtonText || "New").replace(/^\+\s*/, "");
    const pathname = usePathname();
    const router = useRouter();
    const { isLight, toggleTheme } = useTheme();
    const { getBadgeForHref } = useNotifications();
    const discussUnread = getBadgeForHref("/discuss");

    return (
        <header className={`border-b sticky top-0 z-50 shadow-md w-full max-w-full overflow-x-clip transition-colors ${
            isLight
                ? "bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md"
                : "bg-[#1E293B] border-gray-700 text-white"
        }`}>
            <div className="flex flex-wrap xl:flex-nowrap items-center justify-between px-3 sm:px-4 py-2 gap-2 min-w-0">
                {/* Left Section: Beraxis Logo, Back, Apps, Website, Module Logo & Inline Nav Pills */}
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
                    {/* Beraxis Logo & Branding */}
                    <Link
                        href="/apps"
                        title="Beraxis Workspace"
                        className={`flex items-center gap-2 pr-2 border-r shrink-0 hover:opacity-90 transition-opacity ${
                            isLight ? "border-slate-200" : "border-gray-700/80"
                        }`}
                    >
                        <img src="/logo2.png" alt="Beraxis Logo" className="h-6 w-auto" />
                        <span className={`font-extrabold text-sm tracking-tight hidden 2xl:inline ${isLight ? "text-slate-900" : "text-white"}`}>BERAXIS</span>
                    </Link>

                    {/* Back to Apps Button */}
                    <Link
                        href="/apps"
                        title="Back to Apps Dashboard"
                        className={`flex items-center gap-1 transition-colors px-2 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer shrink-0 ${
                            isLight
                                ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900"
                                : "text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/5"
                        }`}
                    >
                        <ArrowLeft size={15} />
                        <span className="hidden 2xl:inline">Back</span>
                    </Link>

                    {/* Apps Dashboard Launcher Button */}
                    <Link
                        href="/apps"
                        title="Workspace Apps Dashboard"
                        className={`flex items-center gap-1 transition-colors p-1.5 rounded-lg shrink-0 ${
                            isLight ? "text-slate-600 hover:text-purple-700 hover:bg-purple-50" : "text-gray-400 hover:text-purple-300 hover:bg-purple-600/20"
                        }`}
                    >
                        <LayoutGrid size={17} />
                    </Link>

                    {/* Public Website Button */}
                    <Link
                        href="/"
                        title="Public Website"
                        className={`flex items-center gap-1 transition-colors p-1.5 rounded-lg shrink-0 ${
                            isLight ? "text-slate-600 hover:text-cyan-700 hover:bg-cyan-50" : "text-gray-400 hover:text-cyan-300 hover:bg-cyan-600/20"
                        }`}
                    >
                        <Globe size={17} />
                    </Link>

                    {/* Module Name & Icon */}
                    <Link
                        href={menuItems[0]?.href || "/apps"}
                        className={`flex items-center gap-2 text-sm sm:text-base font-bold transition-colors ml-0.5 ${
                            isLight ? "text-slate-900 hover:text-purple-700" : "text-gray-100 hover:text-white"
                        }`}
                    >
                        <div className={`border w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg shadow-sm shrink-0 ${
                            isLight ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-purple-600/30 text-purple-400 border-purple-500/30"
                        }`}>
                            {moduleIcon}
                        </div>
                        <span className="font-bold tracking-tight truncate max-w-[180px] 2xl:max-w-none">{moduleName}</span>
                    </Link>

                    {/* Optional New Action Button */}
                    {onNewClick && (
                        <button
                            onClick={onNewClick}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md shadow-purple-900/30 transition-all active:scale-95 cursor-pointer ml-1 shrink-0"
                        >
                            <Plus size={14} /> {resolvedNewLabel}
                        </button>
                    )}

                    {/* Custom Action Button */}
                    {actionButton && <div className="shrink-0">{actionButton}</div>}

                    {/* Navigation Pills (inline on ultra-wide 2xl+, clean sub-bar below on <=1535px) */}
                    {menuItems && menuItems.length > 0 && (
                        <nav className="hidden 2xl:flex items-center gap-1 ml-2 overflow-x-auto scrollbar-none">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href || (item.href !== "/" && item.href !== "/apps" && pathname.startsWith(item.href));
                                const itemBadge = item.href !== pathname ? getBadgeForHref(item.href) : 0;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                                            isActive
                                                ? isLight
                                                    ? "text-purple-800 bg-purple-100 border border-purple-200 shadow-sm"
                                                    : "text-white bg-white/15 border border-white/10 shadow-inner"
                                                : isLight
                                                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                                        }`}
                                    >
                                        <span>{item.name}</span>
                                        {itemBadge > 0 && (
                                            <span className="px-1.5 rounded-full bg-rose-500 text-white text-[9px] font-black">
                                                {itemBadge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    )}
                </div>

                {/* Center: Universal Search */}
                <div className="flex-1 max-w-[165px] 2xl:max-w-[260px] mx-1 hidden 2xl:block min-w-0">
                    <UniversalModuleSearch
                        moduleName={moduleName}
                        placeholder={searchPlaceholder || `Search ${moduleName}...`}
                        value={searchValue}
                        onChange={onSearchChange}
                        onSearch={onSearch}
                    />
                </div>

                {/* Right Action Icons, Branch Switcher & User Profile Dropdown */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <UniversalBranchSwitcher />
                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={isLight ? "Switch to Dark Cosmic Theme" : "Switch to Frosted Light Theme"}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isLight
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-amber-300 hover:bg-white/10"
                        }`}
                    >
                        {isLight ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                    <Link
                        href="/ai"
                        title="AI Business Assistant"
                        className="text-gray-400 hover:text-purple-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Bot size={17} />
                    </Link>

                    <NotificationBellDropdown />

                    <Link
                        href="/discuss"
                        title="Team Chat & Discuss"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 relative transition-colors cursor-pointer"
                    >
                        <MessageSquare size={17} />
                        {discussUnread > 0 && (
                            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center">
                                {discussUnread > 99 ? "99+" : discussUnread}
                            </span>
                        )}
                    </Link>

                    <Link
                        href="/settings"
                        title="System Settings"
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Settings size={17} />
                    </Link>

                    {/* Vertical Divider */}
                    <div className="w-px h-5 bg-gray-700 mx-1"></div>

                    {/* Integrated User Profile Dropdown with Full Name & Plan */}
                    <UserProfileDropdown />
                </div>
            </div>

            {/* Mobile / Tablet Horizontal Navigation Scrollbar for smaller viewports */}
            {menuItems && menuItems.length > 0 && (
                <div className={`2xl:hidden flex items-center px-3 py-1.5 gap-1.5 text-xs overflow-x-auto border-t scrollbar-none ${
                    isLight ? "bg-slate-50/95 border-slate-200" : "bg-[#1E293B]/90 border-gray-700/50"
                }`}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && item.href !== "/apps" && pathname.startsWith(item.href));
                        const itemBadge = item.href !== pathname ? getBadgeForHref(item.href) : 0;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                                    isActive
                                        ? isLight
                                            ? "text-purple-800 bg-purple-100 border border-purple-200"
                                            : "text-white bg-white/10"
                                        : isLight
                                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                                        : "text-gray-400 hover:text-gray-200"
                                }`}
                            >
                                <span>{item.name}</span>
                                {itemBadge > 0 && (
                                    <span className="px-1.5 rounded-full bg-rose-500 text-white text-[9px] font-black">
                                        {itemBadge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </header>
    );
}
