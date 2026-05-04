"use client";

import { useState } from 'react';
import { Bell, User, Settings, LogOut, ChevronDown, Rocket, Sparkles, Users, ShoppingCart, MessageSquare, Package } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import { useRouter } from 'next/navigation';

export default function GalaxyTopBar() {
    const [showProfile, setShowProfile] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-40 w-full bg-[#0F172A]/60 backdrop-blur-md border-b border-white/5 px-6 py-3 flex items-center justify-between">
            {/* Left Section: Branding & Search */}
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Rocket size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
                        GALAXY
                    </span>
                    <Sparkles size={12} className="text-purple-400 animate-pulse-glow" />
                </div>
                
                <GlobalSearch />

                {/* Quick Action Launchpad */}
                <div className="relative group">
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all">
                        <Sparkles size={14} className="text-purple-400" />
                        <span className="text-xs font-medium text-gray-300">Quick Actions</span>
                    </button>
                    
                    {/* Hover Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-64 galaxy-card p-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform scale-95 group-hover:scale-100 origin-top-left">
                        <div className="grid grid-cols-2 gap-2">
                            <QuickActionBtn icon={<Users size={14}/>} label="New Lead" color="bg-purple-500/20" />
                            <QuickActionBtn icon={<ShoppingCart size={14}/>} label="New Order" color="bg-pink-500/20" />
                            <QuickActionBtn icon={<MessageSquare size={14}/>} label="Send Chat" color="bg-blue-500/20" />
                            <QuickActionBtn icon={<Package size={14}/>} label="Check Stock" color="bg-green-500/20" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section: Actions & Profile */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-[#0F172A]"></span>
                </button>

                {/* Vertical Divider */}
                <div className="w-px h-6 bg-white/10 mx-2"></div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-3 p-1 pr-3 hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-white/10"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-[1px]">
                            <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center">
                                <User size={14} className="text-gray-300" />
                            </div>
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-xs font-semibold text-white">Administrator</p>
                            <p className="text-[10px] text-gray-500">Galaxy Admin</p>
                        </div>
                        <ChevronDown size={14} className={`text-gray-500 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
                    </button>

                    {showProfile && (
                        <div className="absolute top-full right-0 mt-2 w-56 galaxy-card p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="px-3 py-2 border-b border-white/5 mb-1 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                                User Account
                            </div>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                <User size={16} /> Profile Settings
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                <Settings size={16} /> Preferences
                            </button>
                            <div className="h-px bg-white/5 my-1.5"></div>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function QuickActionBtn({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
    return (
        <button className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/5 transition-all group/btn border border-transparent hover:border-white/5">
            <div className="${color} p-2 rounded-lg mb-2 group-hover/btn:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-[10px] font-medium text-gray-400 group-hover/btn:text-white transition-colors">{label}</span>
        </button>
    );
}
