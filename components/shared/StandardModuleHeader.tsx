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
    const resolvedNewLabel = newButtonLabel || newButtonText;
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
                        className="flex items-center gap-2 pr-2 border-r border-gray-700/80 shrink-0 hover:opacity-90 transition-opacity"
                    >
                        <img src="/logo2.png" alt="Beraxis Logo" className="h-6 w-auto" />
                        <span className="font-extrabold text-sm tracking-tight text-white hidden xl:inline">BERAXIS</span>
                    </Link>

                    {/* Back to Apps Button */}
                    <Link
                        href="/apps"
                        title="Back to Apps Dashboard"
                        className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold cursor-pointer shrink-0"
                    >
                        <ArrowLeft size={15} />
                        <span className="hidden sm:inline">Back</span>
                    </Link>

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

                    {/* Module Name & Icon */}
                    <Link
                        href={menuItems[0]?.href || "/apps"}
                        className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-100 hover:text-white transition-colors ml-0.5"
                    >
                        <div className="bg-purple-600/30 text-purple-400 border border-purple-500/30 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg shadow-sm shrink-0">
                            {moduleIcon}
                        </div>
                        <span className="font-bold tracking-tight">{moduleName}</span>
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
                                                ? "text-white bg-white/15 border border-white/10 shadow-inner"
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
                <div className="flex-1 max-w-[200px] 2xl:max-w-[260px] mx-1 hidden xl:block min-w-0">
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
                <div className="2xl:hidden flex items-center px-3 py-1.5 gap-1.5 text-xs overflow-x-auto bg-[#1E293B]/90 border-t border-gray-700/50 scrollbar-none">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && item.href !== "/apps" && pathname.startsWith(item.href));
                        const itemBadge = item.href !== pathname ? getBadgeForHref(item.href) : 0;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                                    isActive
                                        ? "text-white bg-white/10"
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
