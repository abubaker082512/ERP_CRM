import { LayoutDashboard, Users, ShoppingCart, Package, ShieldCheck, Zap, Sparkles, Mic, CheckCircle2, XCircle, ArrowRight, Globe, Database, PhoneCall, Mail } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        title: "Global Leads Pool (10M+)",
        description: "Access 10M+ worldwide verified B2B leads across USA, UK, UAE, Saudi, Europe & Asia with direct dials, verified emails, and 1-click CRM import.",
        icon: Globe,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10"
    },
    {
        title: "Intelligent CRM & Pipeline",
        description: "Track leads, manage opportunities, and build lasting customer relationships with interactive Kanban drag-and-drop workflow automation.",
        icon: Users,
        color: "text-blue-400",
        bg: "bg-blue-500/10"
    },
    {
        title: "Omnichannel Sales & Invoicing",
        description: "Generate quotes, convert to sales orders, manage payment gateways (Stripe, Plisio Crypto, PayPal), and handle double-entry accounting.",
        icon: ShoppingCart,
        color: "text-pink-400",
        bg: "bg-pink-500/10"
    },
    {
        title: "Smart Multi-Warehouse Inventory",
        description: "Real-time stock tracking, barcode scanning, picking lists, automated reordering rules, and complete warehouse management.",
        icon: Package,
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    },
    {
        title: "AI Dual-Brain Context Engine",
        description: "Macro-Brain global intelligence combined with micro-tenant vector memory for hyper-personalized, secure data insights.",
        icon: Sparkles,
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    },
    {
        title: "Streaming Voice Pilot",
        description: "Hands-free voice assistant. Speak naturally to query metrics, draft quotes, log attendance, and trigger sandboxed workflows.",
        icon: Mic,
        color: "text-sky-400",
        bg: "bg-sky-500/10"
    },
    {
        title: "Executive BI Dashboards",
        description: "Bird's-eye view analytics, financial statements, real-time KPI graphs, and custom reporting for data-driven decisions.",
        icon: LayoutDashboard,
        color: "text-orange-400",
        bg: "bg-orange-500/10"
    },
    {
        title: "Enterprise Row-Level Security",
        description: "Bank-grade JWT encryption, Supabase PostgreSQL Row Level Security (RLS), and granular role-based permissions.",
        icon: ShieldCheck,
        color: "text-green-400",
        bg: "bg-green-500/10"
    }
];

const odooComparison = [
    {
        feature: "Global Leads Pool (10M+ Contacts)",
        beraxis: "100% Free & Built-In",
        odoo: "Expensive Third-Party Credits",
        winner: "beraxis"
    },
    {
        feature: "AI Voice Pilot Assistant",
        beraxis: "Included Native (Duplex Voice)",
        odoo: "Not Available / Complex Plugins",
        winner: "beraxis"
    },
    {
        feature: "Pricing Model",
        beraxis: "$199 Flat / Month (Unlimited Users)",
        odoo: "$24 - $40+ Per User / Per Month",
        winner: "beraxis"
    },
    {
        feature: "Free Starter Tier",
        beraxis: "One Full App Free Forever",
        odoo: "Strict 14-Day Expiration",
        winner: "beraxis"
    },
    {
        feature: "Architecture & Speed",
        beraxis: "Next.js 15 + FastAPI Edge (Sub-50ms)",
        odoo: "Legacy Python Monolith",
        winner: "beraxis"
    },
    {
        feature: "Crypto & Card Payments",
        beraxis: "Plisio Crypto + Stripe + Freemius Built-in",
        odoo: "Requires Third-Party Addons",
        winner: "beraxis"
    },
    {
        feature: "Multi-Tenant Data Isolation",
        beraxis: "Supabase Row Level Security (RLS)",
        odoo: "Complex Enterprise Sharding",
        winner: "beraxis"
    }
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-[#02040A] relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Title */}
                <div className="text-center mb-20">
                    <h2 className="text-3xl sm:text-5xl font-black mb-6 tracking-tight">
                        Everything You Need To <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">Scale Your Business</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
                        Replace fragmented software with one unified, deeply integrated AI ERP command center.
                    </p>
                </div>

                {/* Core Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-28">
                    {features.map((feature, idx) => (
                        <div 
                            key={idx} 
                            className="relative bg-[#090D1A]/80 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 rounded-2xl p-7 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 shadow-xl hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)] group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            
                            <div>
                                <div className={`relative ${feature.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-all duration-500 shadow-md group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]`}>
                                    <feature.icon className={`${feature.color} w-7 h-7`} />
                                </div>
                                <h3 className="text-lg font-bold mb-3 text-white tracking-wide group-hover:text-purple-300 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed font-light">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dedicated High-Impact Showcase: Global Leads Pool */}
                <div className="mb-24 bg-gradient-to-br from-cyan-950/40 via-[#070B16] to-purple-950/30 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-5">
                                <Globe size={14} className="animate-spin text-cyan-400" /> Free Native B2B Engine
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
                                Never Pay For Apollo or ZoomInfo Again: <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400">
                                    10M+ Global Leads Pool Built-in
                                </span>
                            </h3>
                            <p className="text-gray-300 text-base font-light leading-relaxed mb-6">
                                Stop burning thousands of dollars every month on separate lead enrichment tools. Beraxis comes with a pre-indexed, verified international leads pool. Discover decision-makers, direct phone numbers, and verified corporate emails, then import them directly into your sales pipeline in a single click.
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                                    <div className="text-xl sm:text-2xl font-black text-cyan-300">10M+</div>
                                    <div className="text-xs text-gray-400">B2B Contacts</div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                                    <div className="text-xl sm:text-2xl font-black text-purple-300">50+</div>
                                    <div className="text-xs text-gray-400">Countries Covered</div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 col-span-2 sm:col-span-1">
                                    <div className="text-xl sm:text-2xl font-black text-emerald-400">$0</div>
                                    <div className="text-xs text-gray-400">Zero Add-on Fees</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    href="/crm/leads-pool"
                                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition-all hover:scale-105"
                                >
                                    Launch Leads Pool <ArrowRight size={17} />
                                </Link>
                                <Link 
                                    href="/signup"
                                    className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 hover:text-white font-medium text-sm transition-all"
                                >
                                    Get Free Account
                                </Link>
                            </div>
                        </div>

                        {/* Visual Mock of Leads Pool in action */}
                        <div className="bg-[#0D1326] border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 text-xs text-gray-400">
                                <div className="flex items-center gap-2 font-mono text-cyan-300">
                                    <Database size={14} /> LIVE_PROSPECTING_FEED
                                </div>
                                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">1-Click Import</span>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-xs">
                                            SC
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">Sarah Jenkins • Chief Technology Officer</div>
                                            <div className="text-[11px] text-gray-400 flex items-center gap-2">
                                                <span>Apex Cloud AI</span> • <span className="text-cyan-400">San Francisco, USA</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
                                        <Mail size={11} /> Verified
                                    </span>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-xs">
                                            TA
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">Tariq Al-Mansoor • VP of Procurement</div>
                                            <div className="text-[11px] text-gray-400 flex items-center gap-2">
                                                <span>Gulf Horizon Logistics</span> • <span className="text-cyan-400">Dubai, UAE</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
                                        <PhoneCall size={11} /> Direct Dial
                                    </span>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-pink-600/30 text-pink-300 flex items-center justify-center font-bold text-xs">
                                            EM
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">Elena Müller • Head of Supply Chain</div>
                                            <div className="text-[11px] text-gray-400 flex items-center gap-2">
                                                <span>Nordic Green Energy</span> • <span className="text-cyan-400">Berlin, Germany</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 flex items-center gap-1">
                                        <Mail size={11} /> Permuted MX
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dedicated SEO Section: Beraxis vs Odoo Comparison Matrix */}
                <div id="odoo-comparison" className="scroll-mt-28 bg-[#070B16] border border-white/15 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full inline-block mb-4">
                            SEO Comparison Report
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                            Why Businesses Are Switching From <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Odoo to Beraxis</span>
                        </h3>
                        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                            See how Beraxis delivers 10x faster performance, native Voice AI, and predictable pricing compared to Odoo.
                        </p>
                    </div>

                    {/* Comparison Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-xs sm:text-sm uppercase tracking-wider text-gray-400">
                                    <th className="py-4 px-6">Capability / Feature</th>
                                    <th className="py-4 px-6 bg-purple-500/10 text-purple-300 font-bold rounded-t-xl">Beraxis ERP</th>
                                    <th className="py-4 px-6 text-gray-400">Odoo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm sm:text-base">
                                {odooComparison.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-5 px-6 font-semibold text-white flex items-center gap-2">
                                            {row.feature}
                                        </td>
                                        <td className="py-5 px-6 bg-purple-500/5 font-bold text-purple-200">
                                            <span className="flex items-center gap-2 text-emerald-400">
                                                <CheckCircle2 size={18} /> {row.beraxis}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-gray-400">
                                            <span className="flex items-center gap-2 text-gray-500">
                                                <XCircle size={18} className="text-red-400/70" /> {row.odoo}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Call to action inside comparison */}
                    <div className="mt-10 pt-8 border-t border-white/10 text-center flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-left">
                            <p className="text-white font-bold text-lg">Ready to migrate from Odoo?</p>
                            <p className="text-xs text-gray-400">Import your Odoo data seamlessly in under 5 minutes with our automated migration tool.</p>
                        </div>
                        <Link href="/signup" className="galaxy-btn-primary !px-7 !py-3.5 text-sm whitespace-nowrap flex items-center gap-2">
                            Switch To Beraxis Now <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
}
