"use client";

import Link from 'next/link';
import { Database, Menu, X, LayoutDashboard, LogOut, ArrowRight, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        window.location.href = "/";
    };

    return (
        <nav className="fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-[#0F172A]/90 backdrop-blur-md border-b border-white/10" style={{transform: 'translateZ(0)', willChange: 'transform'}}>
            {/* Top Early Bird Deal Banner */}
            <div className="bg-gradient-to-r from-purple-950 via-rose-950/90 to-amber-950/90 border-b border-purple-500/20 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 flex-wrap">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-black uppercase text-[10px] tracking-wider flex items-center gap-1 shadow-sm">
                    <Flame size={11} className="text-amber-400 animate-pulse" /> Early Bird Special
                </span>
                <span className="text-gray-200">
                    Get All 28 AI ERP &amp; CRM Modules + 1,500 Lead Credits/mo for just <strong className="text-white font-extrabold underline decoration-amber-400">$1/mo ($12/year billed annually)</strong> or $5/mo month-to-month.
                </span>
                <Link href="/pricing" className="text-amber-300 hover:text-amber-200 font-extrabold ml-1 inline-flex items-center gap-0.5 hover:underline">
                    Claim Deal <ArrowRight size={11} />
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center hover:opacity-90 transition-opacity">
                        <img src="/logo-full.png" onError={(e) => { (e.target as HTMLImageElement).src = '/logo2.png'; }} alt="Beraxis Autonomous AI ERP & CRM Platform" className="h-8 sm:h-9 w-auto object-contain" />
                    </Link>
 
                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-7 items-center">
                        <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Home</Link>
                        <Link href="/leads-pool" className="text-cyan-300 hover:text-cyan-200 transition-colors text-sm font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-400/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                            Lead Pool
                        </Link>
                        <Link href="/features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Features</Link>
                        <Link href="/industries" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Industries</Link>
                        <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Pricing</Link>
                        <Link href="/compare" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Compare</Link>
                        <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">About</Link>
                        <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Contact</Link>
                        
                        <div className="flex items-center gap-4 ml-4">
                            {isLoggedIn ? (
                                <>
                                    <Link 
                                        href="/apps" 
                                        className="galaxy-btn-primary !px-5 !py-2 text-sm shadow-lg shadow-purple-500/25 flex items-center gap-2"
                                    >
                                        <LayoutDashboard size={16} />
                                        <span>Go to Workspace</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-400 hover:text-red-400 transition-colors text-sm font-medium flex items-center gap-1 cursor-pointer"
                                    >
                                        <LogOut size={15} />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Log in</Link>
                                    <Link href="/signup" className="galaxy-btn-primary !px-5 !py-2 text-sm shadow-lg shadow-purple-500/25">
                                        Get Started Free
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
 
                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-300 hover:text-white focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>
 
            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-[#0F172A]/98 backdrop-blur-2xl border-b border-white/10 absolute top-full left-0 right-0 w-full shadow-2xl max-h-[calc(100vh-80px)] overflow-y-auto">
                    <div className="px-4 pt-3 pb-8 space-y-2 flex flex-col">
                        <Link href="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Home</Link>
                        <Link href="/leads-pool" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
                            🎯 Lead Pool (25M+ Directory)
                        </Link>
                        <Link href="/features" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Features</Link>
                        <Link href="/industries" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Industries</Link>
                        <Link href="/pricing" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Pricing</Link>
                        <Link href="/compare" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Compare</Link>
                        <Link href="/about" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">About</Link>
                        <Link href="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Contact</Link>
                        <div className="h-px bg-white/10 my-4"></div>
                        
                        {isLoggedIn ? (
                            <>
                                <Link 
                                    href="/apps" 
                                    onClick={() => setIsOpen(false)} 
                                    className="block px-3 py-2 text-center galaxy-btn-primary font-bold"
                                >
                                    Go to Workspace
                                </Link>
                                <button
                                    onClick={() => { setIsOpen(false); handleLogout(); }}
                                    className="block w-full text-center px-3 py-2 text-base font-medium text-red-400 hover:bg-white/5 rounded-md"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Log in</Link>
                                <Link href="/signup" onClick={() => setIsOpen(false)} className="block px-3 py-2 mt-2 text-center galaxy-btn-primary">
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
