"use client";

import Link from 'next/link';
import { 
    Menu, 
    X, 
    LayoutDashboard, 
    LogOut, 
    ArrowRight, 
    ChevronDown, 
    Building2, 
    Users, 
    Database, 
    Sparkles, 
    ShieldCheck, 
    Heart, 
    Briefcase, 
    Gift, 
    PhoneCall, 
    Scale,
    Leaf
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        window.location.href = "/";
    };

    const handleMouseEnter = (menu: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveDropdown(menu);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 150);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-[#0A0F1D]/90 backdrop-blur-md border-b border-white/10" style={{transform: 'translateZ(0)', willChange: 'transform'}}>
            {/* Top Announcement Bar */}
            <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border-b border-white/10 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 flex-wrap">
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    Special Launch
                </span>
                <span className="text-gray-300">
                    Get all 28 AI ERP &amp; CRM modules + 1,500 Lead Credits/mo for just <strong className="text-white font-semibold">$1/month</strong> ($12/yr billed upfront).
                </span>
                <Link href="/pricing" className="text-purple-300 hover:text-white font-semibold ml-1 inline-flex items-center gap-0.5 hover:underline">
                    View Plans <ArrowRight size={11} />
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    
                    {/* Left: Logo & Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                            <img 
                                src="/logo-full.png" 
                                onError={(e) => { (e.target as HTMLImageElement).src = '/logo2.png'; }} 
                                alt="Beraxis Autonomous AI ERP & CRM Platform" 
                                className="h-8 sm:h-9 w-auto object-contain" 
                            />
                        </Link>
                    </div>

                    {/* Center: Desktop Navigation Links (Properly Centered with Balanced Spacing) */}
                    <div className="hidden lg:flex items-center justify-center space-x-1 xl:space-x-2 flex-1 mx-4">
                        <Link 
                            href="/" 
                            className="text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                        >
                            Home
                        </Link>

                        {/* Dropdown 1: Products */}
                        <div 
                            className="relative"
                            onMouseEnter={() => handleMouseEnter("products")}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === "products" ? null : "products")}
                                className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                                    activeDropdown === "products" ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <span>Products</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === "products" ? "rotate-180 text-purple-400" : "text-gray-400"}`} />
                            </button>

                            {activeDropdown === "products" && (
                                <div className="absolute top-full left-0 w-80 pt-2 animate-in fade-in zoom-in-95 duration-150 z-50">
                                    <div className="bg-[#0F172A]/95 border border-purple-500/20 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl space-y-1">
                                        <Link
                                            href="/erp"
                                            onClick={() => setActiveDropdown(null)}
                                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <Building2 size={16} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">ERP Software</div>
                                                <div className="text-[11px] text-gray-400 leading-snug">Financial accounting, inventory, billing &amp; supply chain.</div>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/crm-software"
                                            onClick={() => setActiveDropdown(null)}
                                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <Users size={16} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">AI CRM Platform</div>
                                                <div className="text-[11px] text-gray-400 leading-snug">Deal pipeline, omnichannel client tracking &amp; analytics.</div>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/leads-pool"
                                            onClick={() => setActiveDropdown(null)}
                                            className="flex items-start gap-3 p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 hover:border-cyan-400/40 transition-colors group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <Database size={16} className="text-cyan-400" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                                                    <span>B2B Leads Directory</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                                </div>
                                                <div className="text-[11px] text-gray-400 leading-snug">100% verified real international corporate leads with direct dials.</div>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/features"
                                            onClick={() => setActiveDropdown(null)}
                                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <Sparkles size={16} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Features &amp; 28 Apps</div>
                                                <div className="text-[11px] text-gray-400 leading-snug">Full breakdown of all 28 integrated modules &amp; Studio tool.</div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Direct: Industries */}
                        <Link 
                            href="/industries" 
                            className="text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                        >
                            Industries
                        </Link>

                        {/* Direct: Pricing (Clean, Professional, No distracting badges) */}
                        <Link 
                            href="/pricing" 
                            className="text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                        >
                            Pricing
                        </Link>

                        {/* Dropdown 2: Resources & Company */}
                        <div 
                            className="relative"
                            onMouseEnter={() => handleMouseEnter("resources")}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === "resources" ? null : "resources")}
                                className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                                    activeDropdown === "resources" ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <span>Resources</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === "resources" ? "rotate-180 text-purple-400" : "text-gray-400"}`} />
                            </button>

                            {activeDropdown === "resources" && (
                                <div className="absolute top-full left-0 w-72 pt-2 animate-in fade-in zoom-in-95 duration-150 z-50">
                                    <div className="bg-[#0F172A]/95 border border-purple-500/20 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl space-y-1">
                                        <Link
                                            href="/about"
                                            onClick={() => setActiveDropdown(null)}
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-white/5 text-gray-300 flex items-center justify-center shrink-0 group-hover:text-white">
                                                <Briefcase size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">About Us</div>
                                                <div className="text-[10px] text-gray-400">Our mission, vision &amp; leadership.</div>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/compare"
                                            onClick={() => setActiveDropdown(null)}
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-300 flex items-center justify-center shrink-0">
                                                <Scale size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Compare Competitors</div>
                                                <div className="text-[10px] text-gray-400">vs Odoo, HubSpot, QuickBooks, Zoho.</div>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/affiliates"
                                            onClick={() => setActiveDropdown(null)}
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-300 flex items-center justify-center shrink-0">
                                                <Gift size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Affiliate Program</div>
                                                <div className="text-[10px] text-gray-400">Earn 30% recurring partner revenue.</div>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/contact"
                                            onClick={() => setActiveDropdown(null)}
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-300 flex items-center justify-center shrink-0">
                                                <PhoneCall size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Contact Support</div>
                                                <div className="text-[10px] text-gray-400">24/7 hotline, WhatsApp desk &amp; SLAs.</div>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/donate"
                                            onClick={() => setActiveDropdown(null)}
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group border-t border-white/5"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                                                <Leaf size={14} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-emerald-300 transition-colors">Environmental &amp; Community Fund</div>
                                                <div className="text-[10px] text-gray-400">Green cloud &amp; student sponsorships.</div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Direct: Donate (Clean Text Navigation Link) */}
                        <Link 
                            href="/donate" 
                            className="text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                        >
                            Donate
                        </Link>
                    </div>

                    {/* Right: Action / Auth CTA Buttons */}
                    <div className="hidden lg:flex items-center gap-3 shrink-0">
                        {isLoggedIn ? (
                            <>
                                <Link 
                                    href="/apps" 
                                    className="galaxy-btn-primary !px-5 !py-2 text-sm shadow-lg shadow-purple-500/25 flex items-center gap-2"
                                >
                                    <LayoutDashboard size={15} />
                                    <span>Go to Workspace</span>
                                    <ArrowRight size={14} />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-400 hover:text-white transition-colors text-sm font-medium px-2 py-1.5 flex items-center gap-1 cursor-pointer"
                                >
                                    <LogOut size={15} />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link 
                                    href="/login" 
                                    className="text-gray-300 hover:text-white transition-colors text-sm font-semibold px-3 py-2 rounded-xl hover:bg-white/5"
                                >
                                    Log in
                                </Link>
                                <Link 
                                    href="/signup" 
                                    className="galaxy-btn-primary !px-5 !py-2 text-sm shadow-lg shadow-purple-500/25 flex items-center gap-1.5"
                                >
                                    <span>Get Started Free</span>
                                    <ArrowRight size={14} />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-400 hover:text-white focus:outline-none p-2 rounded-xl hover:bg-white/5"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isOpen && (
                <div className="lg:hidden bg-[#0A0F1D]/98 border-b border-white/10 px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto backdrop-blur-2xl animate-in slide-in-from-top-4 duration-200">
                    
                    {/* Products Category */}
                    <div className="space-y-1">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-3 py-1">
                            Products &amp; Tools
                        </div>
                        <Link href="/erp" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-gray-200 hover:text-white hover:bg-white/5 rounded-xl">
                            <Building2 size={16} className="text-purple-400" />
                            <span>ERP Software</span>
                        </Link>
                        <Link href="/crm-software" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-gray-200 hover:text-white hover:bg-white/5 rounded-xl">
                            <Users size={16} className="text-blue-400" />
                            <span>CRM Platform</span>
                        </Link>
                        <Link href="/leads-pool" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                            <Database size={16} className="text-cyan-400" />
                            <span>B2B Leads Directory</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-auto"></span>
                        </Link>
                        <Link href="/features" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-gray-200 hover:text-white hover:bg-white/5 rounded-xl">
                            <Sparkles size={16} className="text-emerald-400" />
                            <span>Features &amp; 28 Apps</span>
                        </Link>
                    </div>

                    {/* Core Navigation Links */}
                    <div className="space-y-1 pt-2 border-t border-white/5">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-3 py-1">
                            Navigation
                        </div>
                        <Link href="/industries" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl">
                            Industries
                        </Link>
                        <Link href="/pricing" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl">
                            Pricing
                        </Link>
                        <Link href="/donate" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl">
                            <Leaf size={14} className="text-emerald-400" />
                            <span>Donate &amp; Eco Fund</span>
                        </Link>
                    </div>

                    {/* Resources & Company */}
                    <div className="space-y-1 pt-2 border-t border-white/5">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-3 py-1">
                            Company &amp; Resources
                        </div>
                        <Link href="/about" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl">
                            About Us
                        </Link>
                        <Link href="/compare" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl">
                            Compare Competitors
                        </Link>
                        <Link href="/affiliates" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-medium text-purple-300 hover:text-purple-200 hover:bg-white/5 rounded-xl">
                            Affiliate Program (30% RevShare)
                        </Link>
                        <Link href="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl">
                            Contact Support
                        </Link>
                    </div>

                    {/* Auth CTA in Mobile */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                        {isLoggedIn ? (
                            <>
                                <Link 
                                    href="/apps" 
                                    onClick={() => setIsOpen(false)} 
                                    className="block px-3 py-2.5 text-center galaxy-btn-primary font-bold rounded-xl text-sm"
                                >
                                    Go to Workspace Cockpit
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-center text-xs text-gray-400 hover:text-red-400 py-1"
                                >
                                    Log out
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Link 
                                    href="/login" 
                                    onClick={() => setIsOpen(false)}
                                    className="py-2.5 text-center text-sm font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl"
                                >
                                    Log in
                                </Link>
                                <Link 
                                    href="/signup" 
                                    onClick={() => setIsOpen(false)}
                                    className="py-2.5 text-center text-sm font-bold text-white galaxy-btn-primary rounded-xl"
                                >
                                    Sign Up Free
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </nav>
    );
}
