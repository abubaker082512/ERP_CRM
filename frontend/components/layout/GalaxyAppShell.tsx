"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    LayoutDashboard, ShoppingCart, Users, Package, 
    BarChart3, MessageSquare, BookOpen, Settings, 
    Menu, X, Sparkles, Database, ShieldCheck, Wifi, WifiOff, Loader2, LogOut
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import GalaxyTopBar from './GalaxyTopBar';
import CommandOverlay from '../antigravity/CommandOverlay';
import BeraxisSupportWidgets from '../support/BeraxisSupportWidgets';
import InactivitySessionTracker from '../auth/InactivitySessionTracker';
import { BranchProvider, useBranchContext } from '@/lib/branchContext';

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'CRM', icon: Users, href: '/crm' },
    { name: 'Sales', icon: ShoppingCart, href: '/sales' },
    { name: 'Inventory', icon: Package, href: '/inventory' },
    { name: 'Accounting', icon: BarChart3, href: '/accounting' },
    { name: 'Discuss', icon: MessageSquare, href: '/discuss' },
    { name: 'Knowledge', icon: BookOpen, href: '/knowledge' },
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'SaaS Admin', icon: ShieldCheck, href: '/super-admin' },
];

function WorkspaceModuleGuard({ pathname, children }: { pathname: string; children: React.ReactNode }) {
    const { hasSelectedIndustry, isFreePlan, freeSelectedApp, isModuleEnabled } = useBranchContext();

    // Always allow Settings, AI, Billing, Super Admin, and Leads Pool (which renders its own Paid Plan gate)
    const isAlwaysAllowed =
        pathname.startsWith('/settings') ||
        pathname.startsWith('/billing') ||
        pathname.startsWith('/super-admin') ||
        pathname.startsWith('/crm/leads-pool') ||
        pathname.startsWith('/crm/lead-bank');

    if (!hasSelectedIndustry && ! pathname.startsWith('/super-admin')) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6 text-white">
                <div className="max-w-lg w-full bg-[#0F172A] border border-purple-500/40 rounded-3xl p-8 text-center shadow-2xl space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                        <Sparkles size={28} />
                    </div>
                    <h2 className="text-xl font-black text-white">Complete Your Industry & Entity Setup First</h2>
                    <p className="text-xs text-gray-300 leading-relaxed">
                        Every user and company under Beraxis is an independent entity with its own isolated workspace. Please select your industry sector, entity structure (Individual or Company), and free app to initialize your workspace.
                    </p>
                    <Link
                        href="/apps"
                        className="inline-flex items-center justify-center w-full py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
                    >
                        Configure Industry & Entity Now →
                    </Link>
                </div>
            </div>
        );
    }

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
                        To access additional ERP modules or the Global Leads Pool, upgrade to Standard ($18/mo) or Premium ($25/mo).
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
        cleanPath === '/pricing' || 
        cleanPath === '/about' || 
        cleanPath === '/contact' || 
        cleanPath === '/team' || 
        cleanPath === '/leads-pool' || 
        cleanPath === '/lead-pool' || 
        cleanPath === '/pitch-deck' || 
        cleanPath === '/presentation' || 
        cleanPath === '/launch-creatives' || 
        cleanPath === '/privacy' || 
        cleanPath === '/terms' || 
        cleanPath === '/sla' || 
        cleanPath === '/security' || 
        cleanPath === '/cookies' || 
        cleanPath === '/login' || 
        cleanPath === '/signup' || 
        cleanPath === '/forgot-password' || 
        cleanPath === '/checkout' || 
        cleanPath.startsWith('/blog') || 
        cleanPath.startsWith('/compare') || 
        cleanPath.startsWith('/features') || 
        cleanPath.startsWith('/industries') || 
        cleanPath.startsWith('/shop') || 
        cleanPath.startsWith('/meet') || 
        cleanPath.startsWith('/appointments/book');

    if (isPublicMarketingPage) {
        return (
            <BranchProvider>
                {children}
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
                {children}
                {mounted && (
                    <>
                        {cleanPath !== '/apps' && !cleanPath.startsWith('/super-admin') && <BeraxisSupportWidgets />}
                        {!cleanPath.startsWith('/super-admin') && <InactivitySessionTracker />}
                        <CommandOverlay isOpen={isAntigravityOpen} onClose={() => setIsAntigravityOpen(false)} />
                    </>
                )}
            </BranchProvider>
        );
    }

    return (
        <BranchProvider>
            <div className="flex h-screen overflow-hidden bg-[#020205] flex-col">
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
            {/* Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 bg-[#0F172A]/80 backdrop-blur-2xl border-r border-white/5 transition-all duration-500 ease-in-out w-64 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center px-6 border-b border-white/5 mb-4">
                    {isSidebarOpen ? (
                        <div className="flex items-center">
                            <img src="/logo-full.png" alt="Beraxis Logo" className="h-7 w-auto object-contain" />
                        </div>
                    ) : (
                        <img src="/logo2.png" alt="Beraxis Logo" className="h-7 w-auto mx-auto object-contain" />
                    )}
                </div>

                {/* Nav Items */}
                <nav className="px-3 space-y-1">
                    {navItems.filter(item => item.name !== 'SaaS Admin' || isAdmin).map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`galaxy-nav-item group ${isActive ? 'active' : ''}`}
                            >
                                <item.icon 
                                    size={20} 
                                    className={`shrink-0 transition-colors duration-300 ${
                                        isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'
                                    }`} 
                                />
                                {isSidebarOpen && (
                                    <span className="font-medium text-sm tracking-wide transition-opacity duration-300">
                                        {item.name}
                                    </span>
                                )}
                                {isActive && isSidebarOpen && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-l-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-4 left-0 right-0 px-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/5 relative overflow-hidden group transition-all duration-500 ${
                        isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}>
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Sparkles size={24} className="text-purple-400" />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck size={14} className="text-purple-400" />
                            <span suppressHydrationWarning className="text-[10px] font-bold uppercase tracking-widest text-purple-400">{planLabel}</span>
                        </div>
                        <p suppressHydrationWarning className="text-xs text-gray-300 font-medium">{planTitle}</p>
                        <p suppressHydrationWarning className="text-[10px] text-gray-500 mt-1">{planSubtitle}</p>
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
            <main className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${
                isSidebarOpen ? 'ml-64' : 'ml-0'
            }`}>
                <div 
                    className="flex-1 overflow-y-auto overflow-x-hidden bg-[#020205] relative custom-scrollbar"
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

            {/* Inactivity Auto-Logout & Session Tracker (1 minute idle limit) */}
            {mounted && <InactivitySessionTracker />}

            {/* Antigravity Cockpit Overlay */}
            {mounted && <CommandOverlay isOpen={isAntigravityOpen} onClose={() => setIsAntigravityOpen(false)} />}
                </div>{/* end flex-1 overflow-hidden */}
            </div>
        </BranchProvider>
    );
}

