import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-white/10 py-16 relative z-10 bg-[#070B16] text-gray-400 text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12 text-left">
                    {/* Column 1: Brand Info & SEO Tagline */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo2.png" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} alt="Beraxis Logo" className="h-8 w-auto object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                            <span className="text-xl font-bold tracking-tighter text-white">BERAXIS<span className="text-purple-500">.</span></span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-sm">
                            The #1 AI-driven open-source Odoo alternative and next-generation ERP/CRM command center. Streamline operations, automate workflows with Voice Pilot, and scale globally.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-2">
                            <a href="https://wa.me/19707807993" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/20 px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all">
                                💬 WhatsApp Live Support
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Platform Modules */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4">ERP Modules</h4>
                        <ul className="space-y-2.5 text-xs">
                            <li><Link href="/crm" className="hover:text-white transition-colors">CRM Lead Pipeline</Link></li>
                            <li><Link href="/sales" className="hover:text-white transition-colors">Sales & Quotations</Link></li>
                            <li><Link href="/inventory" className="hover:text-white transition-colors">Smart Inventory</Link></li>
                            <li><Link href="/accounting" className="hover:text-white transition-colors">Double-Entry Accounting</Link></li>
                            <li><Link href="/payroll" className="hover:text-white transition-colors">HRMS & Payroll</Link></li>
                            <li><Link href="/pos" className="hover:text-white transition-colors">POS Retail Terminal</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Odoo Comparison & Solutions */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4">Odoo Comparison</h4>
                        <ul className="space-y-2.5 text-xs">
                            <li><a href="/#odoo-comparison" className="hover:text-white transition-colors text-purple-300 font-semibold">Beraxis vs Odoo Report</a></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Odoo Pricing Alternative</Link></li>
                            <li><Link href="/signup" className="hover:text-white transition-colors">Odoo Data Migration</Link></li>
                            <li><Link href="/apps" className="hover:text-white transition-colors">All 30+ ERP Apps</Link></li>
                            <li><Link href="/about" className="hover:text-white transition-colors">AI Voice Assistant ERP</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact & Phone Support */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4">Contact Hotline</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Have questions or need assistance? Contact our engineering team 24/7.
                        </p>
                        <div className="space-y-2 text-xs">
                            <p className="flex items-center gap-2 font-medium text-gray-300">
                                📞 <a href="tel:+19707807993" className="hover:text-white transition-colors">+1 (970) 780-7993</a>
                            </p>
                            <p className="flex items-center gap-2 font-medium text-gray-300">
                                ✉️ <a href="mailto:support@beraxis.online" className="hover:text-white transition-colors">support@beraxis.online</a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom copyright & SEO footer links */}
                <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} Beraxis Systems Inc. All rights reserved. The premier Odoo Alternative & AI ERP System.</p>
                    <div className="flex gap-6">
                        <Link href="/contact" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/pricing" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/billing" className="hover:text-white transition-colors">SLA Agreement</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
