"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    LayoutDashboard, ShoppingCart, Users, Package, 
    BarChart3, MessageSquare, BookOpen, Settings, 
    Menu, X, Sparkles, Database, ShieldCheck, Wifi, WifiOff, Loader2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import GalaxyTopBar from './GalaxyTopBar';
import CommandOverlay from '../antigravity/CommandOverlay';

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

export default function GalaxyAppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAntigravityOpen, setIsAntigravityOpen] = useState(false);
    const [backendStatus, setBackendStatus] = useState<'unknown' | 'waking' | 'ready'>('unknown');
    const warmupRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setMounted(true);
        // Check for Super Admin privileges
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const SUPER_ADMIN_EMAILS = ['admin@erp-crm.com', 'admin2@erp-crm.com'];
                if (SUPER_ADMIN_EMAILS.includes(user.email)) {
                    setIsAdmin(true);
                }
            } catch (e) {}
        }

        // ── Backend Warm-up ──────────────────────────────────────────────
        // Ping the backend immediately on app load so Render wakes up
        // BEFORE the user tries to do something. This eliminates cold-start
        // delays for the user's first real action.
        const pingBackend = async () => {
            try {
                // Show banner only after 2 seconds (if still waiting)
                warmupRef.current = setTimeout(() => setBackendStatus('waking'), 2000);
                const res = await fetch('/api/v1/ping', { method: 'GET' });
                if (warmupRef.current) clearTimeout(warmupRef.current);
                if (res.ok) {
                    setBackendStatus('ready');
                    // Hide the 'ready' banner after 2 seconds
                    setTimeout(() => setBackendStatus('unknown'), 2000);
                }
            } catch {
                if (warmupRef.current) clearTimeout(warmupRef.current);
                setBackendStatus('waking');
                // Retry after 5 seconds
                setTimeout(pingBackend, 5000);
            }
        };
        pingBackend();

        return () => { if (warmupRef.current) clearTimeout(warmupRef.current); };
    }, []);

    useEffect(() => {
        // Automatically collapse the sidebar when navigating to any specific page other than /dashboard
        if (pathname && pathname !== '/dashboard') {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, [pathname]);

    if (!mounted) return null;

    // Don't show shell on landing, login, signup, shop, checkout, billing, or forgotten password page
    const isLandingPage = pathname === '/about' || pathname === '/contact' || pathname === '/' || pathname === '/pricing';
    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/billing' || pathname === '/checkout' || pathname === '/shop' || pathname.startsWith('/shop/') || isLandingPage;
    
    if (isAuthPage) return <>{children}</>;

    return (
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
                        <div className="flex items-center gap-2">
                            <img src="/logo2.png" alt="Beraxis Logo" className="h-6 w-auto" />
                            <span className="text-lg font-bold tracking-tighter text-white">BERAXIS</span>
                        </div>
                    ) : (
                        <img src="/logo2.png" alt="Beraxis Logo" className="h-6 w-auto mx-auto" />
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
                            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Premium</span>
                        </div>
                        <p className="text-xs text-gray-300 font-medium">Beraxis Elite Plan</p>
                        <p className="text-[10px] text-gray-500 mt-1">Unlimited Workspaces</p>
                    </div>
                </div>

            </aside>

            {/* Main Content */}
            <main className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${
                isSidebarOpen ? 'ml-64' : 'ml-0'
            }`}>
                <GalaxyTopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
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
                        {children}
                    </div>
                </div>
            </main>

            {/* Floating Antigravity Pilot Trigger */}
            <button
                onClick={() => setIsAntigravityOpen(true)}
                className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-tr from-sky-500 via-purple-500 to-pink-500 hover:opacity-90 rounded-full text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center"
                title="Open Antigravity Co-Pilot"
            >
                <Sparkles className="w-6 h-6 animate-pulse" />
            </button>

            {/* Antigravity Cockpit Overlay */}
            <CommandOverlay isOpen={isAntigravityOpen} onClose={() => setIsAntigravityOpen(false)} />
            </div>{/* end flex-1 overflow-hidden */}
        </div>
    );
}

