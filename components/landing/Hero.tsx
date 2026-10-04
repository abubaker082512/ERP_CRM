import Link from 'next/link';
import { ArrowRight, PlayCircle, ShieldCheck, Zap, Globe, Sparkles, CheckCircle, Mic, Layers, Cpu } from 'lucide-react';

export default function Hero() {
    return (
        <div className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
            {/* Immersive Background Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-cyan-600/15 rounded-full blur-[160px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                
                {/* SEO & High-Converting Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/30 mb-8 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                    <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-purple-200 tracking-wide">
                        The #1 AI-Driven Odoo Alternative — 10x Faster & Smarter
                    </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.08]">
                    Manage Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400 animate-gradient-x">Universe</span><br />
                    With AI & Voice Pilot
                </h1>

                {/* Subheadline with key SEO keywords (Odoo, ERP, CRM, AI Voice Pilot) */}
                <p className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 font-light leading-relaxed">
                    Beraxis ERP unifies CRM, Sales, Inventory, Accounting, HRMS, and POS under one context-aware AI framework with hands-free duplex Voice Pilot. The modern open-source alternative to Odoo built for speed and seamless growth.
                </p>

                {/* Call To Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/signup" className="galaxy-btn-primary !px-9 !py-4 text-lg w-full sm:w-auto flex items-center justify-center gap-3 group shadow-[0_0_35px_rgba(168,85,247,0.4)]">
                        Launch Your Free Workspace <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={22} />
                    </Link>
                    
                    <a href="#odoo-comparison" className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold transition-all flex items-center justify-center gap-2.5 w-full sm:w-auto backdrop-blur-md hover:border-purple-400/40">
                        <Layers size={20} className="text-purple-400" /> Compare vs Odoo
                    </a>

                    <Link href="/contact" className="px-7 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-medium transition-all flex items-center justify-center gap-2 w-full sm:w-auto backdrop-blur-md">
                        <PlayCircle size={20} className="text-pink-400" /> Book Demo
                    </Link>
                </div>

                {/* Live ERP Interactive Preview Mock Container */}
                <div className="mt-16 max-w-5xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-[#090D1A]/90 border border-white/15 rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden text-left">
                        {/* Header bar */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <span className="text-xs font-mono text-gray-400 border-l border-white/10 pl-3">beraxis.online/dashboard</span>
                            </div>
                            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full text-xs text-purple-300 font-medium">
                                <Mic size={14} className="animate-pulse text-purple-400" /> AI Voice Assistant Listening...
                            </div>
                        </div>

                        {/* ERP Mock Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1: CRM & Pipeline */}
                            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">CRM Pipeline</span>
                                    <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">+42% Growth</span>
                                </div>
                                <div className="text-2xl font-extrabold text-white">$184,500</div>
                                <p className="text-xs text-gray-400 mt-1">28 Active Deals in Pipeline</p>
                                <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-[78%]"></div>
                                </div>
                            </div>

                            {/* Card 2: Voice Command Demo */}
                            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl p-5 border border-purple-500/30">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                                        <Cpu size={14} /> Voice Command
                                    </span>
                                    <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded font-mono">Live</span>
                                </div>
                                <p className="text-sm font-medium text-white italic">"Create invoice for Acme Corp and update inventory status."</p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                                    <CheckCircle size={14} /> Executed in 120ms
                                </div>
                            </div>

                            {/* Card 3: Odoo Migration Speed */}
                            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Speed vs Odoo</span>
                                    <span className="text-xs bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded">10x Faster</span>
                                </div>
                                <div className="text-2xl font-extrabold text-white">45ms <span className="text-xs font-normal text-gray-400">Response</span></div>
                                <p className="text-xs text-gray-400 mt-1">Global Edge Sync Enabled</p>
                                <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                                    <div className="bg-emerald-400 h-full w-[95%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Indicators / Badges */}
                <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-75">
                    <div className="flex items-center justify-center gap-2.5 text-sm text-gray-300 font-medium">
                        <ShieldCheck size={18} className="text-purple-400" /> Enterprise RLS Security
                    </div>
                    <div className="flex items-center justify-center gap-2.5 text-sm text-gray-300 font-medium">
                        <Zap size={18} className="text-amber-400" /> Real-time Sub-second Sync
                    </div>
                    <div className="flex items-center justify-center gap-2.5 text-sm text-gray-300 font-medium">
                        <Globe size={18} className="text-cyan-400" /> Global Cloud Infrastructure
                    </div>
                    <div className="flex items-center justify-center gap-2.5 text-sm text-gray-300 font-medium">
                        <Sparkles size={18} className="text-pink-400" /> 100% Odoo Feature Parity
                    </div>
                </div>
            </div>
        </div>
    );
}
