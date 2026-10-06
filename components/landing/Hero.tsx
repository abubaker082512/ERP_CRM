import Link from 'next/link';
import { ArrowRight, PlayCircle, ShieldCheck, Zap, Globe, Sparkles, CheckCircle, Mic, Layers, Cpu } from 'lucide-react';

export default function Hero() {
    return (
        <div className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden transform-gpu">
            {/* Lightweight Background Radial Orbs (No high-cost blur filters) */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                
                {/* SEO & High-Converting Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20 border border-purple-500/40 mb-8 backdrop-blur-sm shadow-lg shadow-purple-900/20">
                    <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-purple-200 tracking-wide flex items-center gap-2">
                        <span className="bg-cyan-500/30 text-cyan-200 text-[11px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">New</span>
                        Global Leads Pool Live — 10M+ Free B2B Contacts & 1-Click CRM Import!
                    </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.08]">
                    Manage Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400">Universe</span><br />
                    With AI, Voice & Leads Pool
                </h1>

                {/* Subheadline with key SEO keywords */}
                <p className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 font-light leading-relaxed">
                    Beraxis ERP unifies CRM with a built-in <strong className="text-white font-semibold">Worldwide Leads Pool</strong>, Omnichannel Sales, Inventory, Accounting, HRMS, and Duplex Voice Pilot. The modern open-source alternative to Odoo built for explosive growth.
                </p>

                {/* Call To Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/signup" className="galaxy-btn-primary !px-9 !py-4 text-lg w-full sm:w-auto flex items-center justify-center gap-3 group shadow-lg shadow-purple-500/20">
                        Launch Your Free Workspace <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={22} />
                    </Link>
                    
                    <Link href="/crm/leads-pool" className="px-8 py-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold transition-all flex items-center justify-center gap-2.5 w-full sm:w-auto backdrop-blur-sm hover:border-cyan-400/50">
                        <Globe size={20} className="text-cyan-400" /> Explore Leads Pool
                    </Link>

                    <a href="#odoo-comparison" className="px-7 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium transition-all flex items-center justify-center gap-2.5 w-full sm:w-auto backdrop-blur-sm hover:border-purple-400/40">
                        <Layers size={20} className="text-purple-400" /> Compare vs Odoo
                    </a>
                </div>

                {/* Fast ERP Showcase Preview Container */}
                <div className="mt-16 max-w-5xl mx-auto relative">
                    <div className="relative bg-[#090D1A]/95 border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left transform-gpu">
                        {/* Header bar */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <span className="text-xs font-mono text-gray-400 border-l border-white/10 pl-3">beraxis.online/crm/leads-pool</span>
                            </div>
                            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full text-xs text-purple-300 font-medium">
                                <Mic size={14} className="animate-pulse text-purple-400" /> AI Voice Assistant Active
                            </div>
                        </div>

                        {/* ERP Mock Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1: Global Leads Pool */}
                            <div className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 rounded-xl p-5 border border-cyan-500/30 relative overflow-hidden">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                                        <Globe size={14} /> Leads Pool
                                    </span>
                                    <span className="text-xs bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded">10M+ Records</span>
                                </div>
                                <div className="text-2xl font-extrabold text-white">Global B2B Contacts</div>
                                <p className="text-xs text-gray-300 mt-1">Verified Emails, Direct Dials & 1-Click Import</p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                                    <CheckCircle size={14} /> 100% Free Included
                                </div>
                            </div>

                            {/* Card 2: Voice Command Demo */}
                            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-5 border border-purple-500/30">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                                        <Cpu size={14} /> Voice Command
                                    </span>
                                    <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded font-mono">Live</span>
                                </div>
                                <p className="text-sm font-medium text-white italic">"Import 50 SaaS CEOs from USA to my CRM pipeline."</p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                                    <CheckCircle size={14} /> Executed in 45ms
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
                        <Globe size={18} className="text-cyan-400" /> 10M+ Global Leads Pool
                    </div>
                    <div className="flex items-center justify-center gap-2.5 text-sm text-gray-300 font-medium">
                        <Zap size={18} className="text-amber-400" /> Real-time Sub-second Sync
                    </div>
                    <div className="flex items-center justify-center gap-2.5 text-sm text-gray-300 font-medium">
                        <Sparkles size={18} className="text-pink-400" /> 100% Odoo Feature Parity
                    </div>
                </div>
            </div>
        </div>
    );
}
