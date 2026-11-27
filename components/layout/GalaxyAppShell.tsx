"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    LayoutDashboard, ShoppingCart, Users, Package, 
    BarChart3, MessageSquare, BookOpen, Settings, 
    Menu, X, Sparkles, Database, ShieldCheck, Wifi, WifiOff, Loader2, LogOut,
    CheckSquare, Calendar
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import GalaxyTopBar from './GalaxyTopBar';
import CommandOverlay from '../antigravity/CommandOverlay';
import BeraxisSupportWidgets from '../support/BeraxisSupportWidgets';
import InactivitySessionTracker from '../auth/InactivitySessionTracker';
import DonationMilestoneToast from '../common/DonationMilestoneToast';
import { BranchProvider, useBranchContext } from '@/lib/branchContext';
import { NotificationProvider, useNotifications } from '@/lib/notificationContext';
import { useTheme } from '@/lib/themeContext';

const navItems = [
    { name: 'All Apps', icon: Sparkles, href: '/apps' },
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Tasks', icon: CheckSquare, href: '/tasks' },
    { name: 'Approvals', icon: ShieldCheck, href: '/approvals' },
    { name: 'Discuss', icon: MessageSquare, href: '/discuss' },
    { name: 'Calendar', icon: Calendar, href: '/calendar' },
    { name: 'CRM', icon: Users, href: '/crm' },
    { name: 'Sales', icon: ShoppingCart, href: '/sales' },
    { name: 'Inventory', icon: Package, href: '/inventory' },
    { name: 'Accounting', icon: BarChart3, href: '/accounting' },
    { name: 'Reports', icon: BarChart3, href: '/reports' },
    { name: 'Knowledge', icon: BookOpen, href: '/knowledge' },
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'SaaS Admin', icon: ShieldCheck, href: '/super-admin' },
];

function SidebarNavItems({
    pathname,
    isSidebarOpen,
    isAdmin,
}: {
    pathname: string | null;
    isSidebarOpen: boolean;
    isAdmin: boolean;
}) {
    const { getBadgeForHref, totalUnread } = useNotifications();
    const { isLight } = useTheme();
    return (
        <nav className="px-2.5 space-y-1.5 flex-1 overflow-y-auto scrollbar-none pb-28">
            {navItems
                .filter((item) => item.name !== 'SaaS Admin' || isAdmin)
                .map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' && item.href !== '/apps' && Boolean(pathname?.startsWith(item.href)));
                    const badge =
                        item.href === '/apps' ? totalUnread : getBadgeForHref(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={badge > 0 ? `${item.name} (${badge})` : item.name}
                            className={`flex items-center ${
                                isSidebarOpen ? 'gap-3 px-3.5 justify-between' : 'justify-center px-0'
                            } py-2.5 rounded-2xl transition-all duration-200 relative group ${
                                isActive
                                    ? 'beraxis-glow-pill text-white'
                                    : isLight
                                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <span className="flex items-center gap-3 min-w-0">
                                <span className="relative shrink-0">
                                    <item.icon
                                        size={19}
                                        className={`shrink-0 transition-colors duration-200 ${
                                            isActive
                                                ? isLight ? 'text-white' : 'text-[#38BDF8]'
                                                : isLight ? 'text-slate-500 group-hover:text-purple-700' : 'text-gray-500 group-hover:text-gray-200'
                                        }`}
                                    />
                                    {!isSidebarOpen && badge > 0 && (
                                        <span className="absolute -top-2 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow">
                                            {badge > 99 ? '99+' : badge}
                                        </span>
                                    )}
                                </span>
                                {isSidebarOpen && (
                                    <span className="font-semibold text-xs tracking-wide truncate">
                                        {item.name}
                                    </span>
                                )}
                            </span>
                            {isSidebarOpen && badge > 0 && (
                                <span className="min-w-[20px] h-[20px] px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                    {badge > 99 ? '99+' : badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
        </nav>
    );
}

function SidebarPlanInfo() {
    const { userPlan } = useBranchContext();
    const label =
        userPlan === "premium" ? "ENTERPRISE" :
        userPlan === "standard" ? "STANDARD PLAN" :
        userPlan === "leadspool" ? "LEADS POOL" : "ONE APP FREE";
    const title =
        userPlan === "premium" ? "Beraxis Custom Enterprise" :
        userPlan === "standard" ? "Beraxis Standard ($1/mo)" :
        userPlan === "leadspool" ? "Leads Pool Solo" : "One App Free Plan";
    const sub =
        userPlan === "premium" ? "Multi-Company + All 28+ Apps" :
        userPlan === "standard" ? "All 28+ Apps + 1,500 Leads/mo" :
        userPlan === "leadspool" ? "Verified B2B Leads Pool" : "1 Major App + Settings";
    return (
        <>
            <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-purple-400" />
                <span suppressHydrationWarning className="text-[10px] font-bold uppercase tracking-widest text-purple-400">{label}</span>
            </div>
            <p suppressHydrationWarning className="text-xs text-gray-300 font-medium">{title}</p>
            <p suppressHydrationWarning className="text-[10px] text-gray-500 mt-1">{sub}</p>
        </>
    );
}

function WorkspaceModuleGuard({ pathname, children }: { pathname: string; children: React.ReactNode }) {
    const { hasSelectedIndustry, isFreePlan, freeSelectedApp, isModuleEnabled } = useBranchContext();

    // If pathname is a public or legal page, never block with an entity setup modal
    const isPublic =
        pathname === '' ||
        pathname === '/' ||
        pathname.startsWith('/acceptable-use') ||
        pathname.startsWith('/erp') ||
        pathname.startsWith('/crm-software') ||
        pathname.startsWith('/refund') ||
        pathname.startsWith('/terms') ||
        pathname.startsWith('/privacy') ||
        pathname.startsWith('/security') ||
        pathname.startsWith('/sla') ||
        pathname.startsWith('/cookies') ||
        pathname.startsWith('/about') ||
        pathname.startsWith('/ai') ||
        pathname.startsWith('/ai-auto-setup') ||
        pathname.startsWith('/contact') ||
        pathname.startsWith('/pricing') ||
        pathname.startsWith('/donate') ||
        pathname.startsWith('/checkout') ||
        pathname.startsWith('/affiliates') ||
        pathname.startsWith('/referrals') ||
        pathname.startsWith('/blog') ||
        pathname.startsWith('/compare') ||
        pathname.startsWith('/affordable-cloud-erp') ||
        pathname.startsWith('/one-dollar-erp') ||
        pathname.startsWith('/cheap-erp-for-small-business') ||
        pathname.startsWith('/cheap-erp-system') ||
        pathname.startsWith('/affordable-cloud-erp') ||
        pathname.startsWith('/one-dollar-erp') ||
        pathname.startsWith('/cheap-erp-for-small-business') ||
        pathname.startsWith('/features') ||
        pathname.startsWith('/industries') ||
        pathname.startsWith('/shop') ||
        pathname.startsWith('/meet') ||
        pathname.startsWith('/lead-pool') ||
        pathname.startsWith('/leads-pool') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/pitch-deck') ||
        pathname.startsWith('/presentation') ||
        pathname.startsWith('/launch-creatives') ||
        pathname.startsWith('/appointments/book') ||
        pathname.startsWith('/recruitment/apply');

    if (isPublic) {
        return <>{children}</>;
    }

    // Always allow Settings, AI, Billing, Team, Approvals, Tasks, Discuss, Calendar, Super Admin, and Leads Pool
    const isAlwaysAllowed =
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/billing') ||
        pathname.startsWith('/team') ||
        pathname.startsWith('/approvals') ||
        pathname.startsWith('/tasks') ||
        pathname.startsWith('/discuss') ||
        pathname.startsWith('/calendar') ||
        pathname.startsWith('/super-admin');

    if (isFreePlan && !isAlwaysAllowed && !isModuleEnabled(pathname)) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6 text-white">
                <div className="max-w-lg w-full bg-[#0F172A] border border-amber-500/40 rounded-3xl p-8 text-center shadow-2xl space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                        <ShieldCheck size={28} />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase">
                        🔒 One App Free Plan Limit
                    </div>
                    <h2 className="text-xl font-black text-white">Module Locked on Free Plan</h2>
                    <p className="text-xs text-gray-300 leading-relaxed">
                        Your <strong className="text-amber-300">One App Free Plan</strong> includes <strong className="text-white">1 Selected Major App ({freeSelectedApp.replace('/', '').toUpperCase()}) + Settings</strong>.
                        To access additional ERP modules or the Global Leads Pool, upgrade to Standard ($1/mo Early Bird, billed $12/yr) or Custom ($37.40/mo).
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Link
                            href="/apps"
                            className="flex-1 py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs transition-all"
                        >
                            ← Back to My Workspace
                        </Link>
                        <Link
                            href="/billing"
                            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all"
                        >
                            Upgrade Plan →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export default function GalaxyAppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [planLabel, setPlanLabel] = useState("ONE APP FREE");
    const [planTitle, setPlanTitle] = useState("One App Free Plan");
    const [planSubtitle, setPlanSubtitle] = useState("1 Major App + Settings");
    const [isAntigravityOpen, setIsAntigravityOpen] = useState(false);
    const [backendStatus, setBackendStatus] = useState<'unknown' | 'waking' | 'ready'>('unknown');
    const warmupRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setMounted(true);
        // Check for Super Admin and Subscription privileges
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const SUPER_ADMIN_EMAILS = ['admin@beraxis.online', 'admin2@erp-crm.com'];
                const isUserAdmin = SUPER_ADMIN_EMAILS.includes(user.email);
                if (isUserAdmin) {
                    setIsAdmin(true);
                    setPlanLabel("ENTERPRISE");
                    setPlanTitle("Beraxis Elite Plan");
                    setPlanSubtitle("Unlimited Workspaces");
                } else if (user.tenant?.subscription_status === "active") {
                    setPlanLabel("PAID PLAN");
                    setPlanTitle("Beraxis Pro Plan");
                    setPlanSubtitle("All Modules + Leads Pool");
                } else {
                    setPlanLabel("ONE APP FREE");
                    setPlanTitle("One App Free Plan");
                    setPlanSubtitle("1 Major App + Settings");
                }
            } catch (e) {}
        }

        // ── Backend Warm-up ──────────────────────────────────────────────
        const pingBackend = async () => {
            try {
                warmupRef.current = setTimeout(() => setBackendStatus('waking'), 2000);
                const res = await fetch('/api/v1/ping', { method: 'GET' });
                if (warmupRef.current) clearTimeout(warmupRef.current);
                if (res.ok) {
                    setBackendStatus('ready');
                    setTimeout(() => setBackendStatus('unknown'), 2000);
                }
            } catch {
                if (warmupRef.current) clearTimeout(warmupRef.current);
                setBackendStatus('waking');
                setTimeout(pingBackend, 5000);
            }
        };
        pingBackend();

        const handleOpenVoicePilot = () => setIsAntigravityOpen(true);
        const handleGlobalShortcut = (e: KeyboardEvent) => {
            if ((e.altKey && e.key.toLowerCase() === 'v') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'v')) {
                e.preventDefault();
                setIsAntigravityOpen((prev) => !prev);
            }
        };
        window.addEventListener('open-voice-pilot', handleOpenVoicePilot);
        window.addEventListener('keydown', handleGlobalShortcut);

        return () => {
            if (warmupRef.current) clearTimeout(warmupRef.current);
            window.removeEventListener('open-voice-pilot', handleOpenVoicePilot);
            window.removeEventListener('keydown', handleGlobalShortcut);
        };
    }, []);

    useEffect(() => {
        if (pathname && pathname !== '/dashboard') {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, [pathname]);

    const cleanPath = pathname || '';

    // 1. All Public Marketing, SEO, Comparison, Industry, Feature, Blog, Legal, and Public Flow Pages
    // These must render clean <BranchProvider>{children}</BranchProvider> on BOTH Server (SSR) and Client immediately!
    // No hydration gates, no null returns — guarantees 100% full HTML output for crawlers (Semrush, Googlebot, etc.)
    const isPublicMarketingPage = 
        cleanPath === '' ||
        cleanPath === '/' || 
        cleanPath.startsWith('/pricing') ||
        cleanPath.startsWith('/donate') || 
        cleanPath.startsWith('/about') || 
        cleanPath.startsWith('/ai') || 
        cleanPath.startsWith('/contact') || 
        cleanPath.startsWith('/leads-pool') || 
        cleanPath.startsWith('/lead-pool') || 
        cleanPath.startsWith('/pitch-deck') || 
        cleanPath.startsWith('/presentation') || 
        cleanPath.startsWith('/launch-creatives') || 
        cleanPath.startsWith('/acceptable-use') || 
        cleanPath.startsWith('/erp') || 
        cleanPath.startsWith('/crm-software') || 
        cleanPath.startsWith('/privacy') || 
        cleanPath.startsWith('/terms') || 
        cleanPath.startsWith('/refund') || 
        cleanPath.startsWith('/sla') || 
        cleanPath.startsWith('/security') || 
        cleanPath.startsWith('/cookies') || 
        cleanPath.startsWith('/login') || 
        cleanPath.startsWith('/signup') || 
        cleanPath.startsWith('/forgot-password') || 
        cleanPath.startsWith('/checkout') || 
        cleanPath.startsWith('/affiliates') || 
        cleanPath.startsWith('/referrals') || 
        cleanPath.startsWith('/blog') || 
        cleanPath.startsWith('/compare') || 
        cleanPath.startsWith('/features') || 
        cleanPath.startsWith('/industries') || 
        cleanPath.startsWith('/shop') || 
        cleanPath.startsWith('/meet') || 
        cleanPath.startsWith('/f/') || 
        cleanPath.startsWith('/appointments/book') ||
        cleanPath.startsWith('/recruitment/apply');

    if (isPublicMarketingPage) {
        return (
            <BranchProvider>
                <NotificationProvider>
                    {children}
                    {mounted && !cleanPath.startsWith('/meet') && !cleanPath.startsWith('/appointments/book') && (
                        <BeraxisSupportWidgets />
                    )}
                </NotificationProvider>
            </BranchProvider>
        );
    }

    // 2. Standalone Workspace Cockpits (e.g. /apps, /dashboard, /billing)
    // Render full-bleed page with children; mount interactive client floating widgets only when mounted on client.
    const isStandaloneWorkspace = 
        cleanPath === '/apps' || 
        cleanPath === '/dashboard' || 
        cleanPath === '/billing' ||
        cleanPath.startsWith('/super-admin');

    if (isStandaloneWorkspace) {
        return (
            <BranchProvider>
                <NotificationProvider>
                    {children}
                    {mounted && (
                        <>
                            {cleanPath !== '/apps' && !cleanPath.startsWith('/super-admin') && <BeraxisSupportWidgets />}
                            {!cleanPath.startsWith('/super-admin') && <InactivitySessionTracker />}
                            <CommandOverlay isOpen={isAntigravityOpen} onClose={() => setIsAntigravityOpen(false)} />
                        </>
                    )}
                </NotificationProvider>
            </BranchProvider>
        );
    }

    return (
        <BranchProvider>
            <NotificationProvider>
            <div className="flex h-screen overflow-hidden bg-transparent flex-col">
            {/* Backend Connection Banner */}
            {backendStatus === 'waking' && (
                <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2 text-xs text-amber-400 shrink-0 z-[100]">
                    <Loader2 size={12} className="animate-spin" />
                    <span>Connecting to server — this takes up to 30 seconds on cold start. Please wait...</span>
                </div>
            )}
            {backendStatus === 'ready' && (
                <div className="w-full bg-green-500/10 border-b border-green-500/20 px-4 py-2 flex items-center justify-center gap-2 text-xs text-green-400 shrink-0 z-[100]">
                    <Wifi size={12} />
                    <span>Server connected ✓ — you're good to go!</span>
                </div>
            )}
            <div className="flex flex-1 overflow-hidden">
            {/* Sidebar: Sleek Collapsible Translucent Icon Rail */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 bg-[#060B19]/35 backdrop-blur-md backdrop-saturate-150 border-r border-white/15 shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)] transition-all duration-300 ease-out flex flex-col ${
                    isSidebarOpen ? 'w-60' : 'w-[76px]'
                }`}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 mb-3 shrink-0">
                    <Link href="/apps" className="flex items-center overflow-hidden">
                        {isSidebarOpen ? (
                            <img src="/logo-full.png" alt="Beraxis Logo" className="h-7 w-auto object-contain" />
                        ) : (
                            <img src="/logo2.png" alt="Beraxis Logo" className="h-8 w-8 mx-auto object-contain rounded-lg" />
                        )}
                    </Link>
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        title={isSidebarOpen ? "Collapse Rail" : "Expand Sidebar"}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 text-gray-400 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
                    >
                        {isSidebarOpen ? <X size={14} /> : <Menu size={14} />}
                    </button>
                </div>

                {/* Nav Items with Live Numeric Notification Badges */}
                <SidebarNavItems pathname={pathname} isSidebarOpen={isSidebarOpen} isAdmin={isAdmin} />

                {/* Sidebar Footer */}
                <div className="absolute bottom-4 left-0 right-0 px-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/5 relative overflow-hidden group transition-all duration-500 ${
                        isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}>
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Sparkles size={24} className="text-purple-400" />
                        </div>
                        <SidebarPlanInfo />
                        <button
                            onClick={() => {
                                try {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('refresh_token');
                                    localStorage.removeItem('user');
                                    localStorage.removeItem('auth_data');
                                    localStorage.removeItem('beraxis_session_id');
                                    sessionStorage.clear();
                                    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                                    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                                    document.cookie = "sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                                    document.cookie = "sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                                } catch (e) {}
                                window.location.href = '/login';
                            }}
                            className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-[11px] font-semibold transition-all cursor-pointer"
                        >
                            <LogOut size={12} /> Sign Out
                        </button>
                    </div>
                </div>

            </aside>

            {/* Main Content */}
            <main className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-out ${
                isSidebarOpen ? 'ml-60' : 'ml-[76px]'
            }`}>
                <div 
                    className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-transparent relative custom-scrollbar"
                    style={{ 
                        willChange: 'scroll-position',
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'contain'
                    }}
                >
                    {/* Background Ambient Glows - use fixed for no layout cost */}
                    <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" style={{zIndex:0}}></div>
                    <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/5 blur-[120px] rounded-full pointer-events-none" style={{zIndex:0}}></div>
                    
                    <div className="relative z-10 p-8 min-h-full">
                        <WorkspaceModuleGuard pathname={cleanPath}>
                            {children}
                        </WorkspaceModuleGuard>
                    </div>
                </div>
            </main>

            {/* Persistent Support Widgets: WhatsApp on Left, AI Support on Right */}
            {mounted && <BeraxisSupportWidgets />}
            {mounted && <DonationMilestoneToast />}

            {/* Inactivity Auto-Logout & Session Tracker (1 minute idle limit) */}
            {mounted && <InactivitySessionTracker />}

            {/* Antigravity Cockpit Overlay */}
            {mounted && <CommandOverlay isOpen={isAntigravityOpen} onClose={() => setIsAntigravityOpen(false)} />}
                </div>{/* end flex-1 overflow-hidden */}
            </div>
            </NotificationProvider>
        </BranchProvider>
    );
}

