import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-white/10 py-16 relative z-10 bg-[#070B16] text-gray-400 text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">
                    {/* Column 1: Brand Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo2.png" alt="Beraxis Logo" className="h-8 w-auto" />
                            <span className="text-xl font-bold tracking-tighter text-white">BERAXIS<span className="text-purple-500">.</span></span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            The next-generation AI-powered ERP & CRM command center. Streamline your operations, synchronize databases, and scale beyond boundaries.
                        </p>
                        <div className="pt-2">
                            <a href="https://wa.me/19707807993" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/20 px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all">
                                💬 WhatsApp Live Support
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Platform Modules */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4">Platform</h4>
                        <ul className="space-y-2.5 text-xs">
                            <li><Link href="/discuss" className="hover:text-white transition-colors">Discuss & Messaging</Link></li>
                            <li><Link href="/crm" className="hover:text-white transition-colors">CRM Lead Pipeline</Link></li>
                            <li><Link href="/sales" className="hover:text-white transition-colors">Sales Order Management</Link></li>
                            <li><Link href="/inventory" className="hover:text-white transition-colors">Inventory Overview</Link></li>
                            <li><Link href="/accounting" className="hover:text-white transition-colors">Double-Entry Accounting</Link></li>
                            <li><Link href="/helpdesk" className="hover:text-white transition-colors">SLA Helpdesk Tickets</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Company & Resources */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4">Company</h4>
                        <ul className="space-y-2.5 text-xs">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Our Vision</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Get in Touch</Link></li>
                            <li><Link href="/billing" className="hover:text-white transition-colors">Upgrade & Billing</Link></li>
                            <li><a href="#" className="hover:text-white transition-colors">Partner Network</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Platform Status</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact & Phone Support */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4">Support Hotline</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Have any questions or need direct assistance? Contact our team 24/7.
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

                {/* Bottom copyright */}
                <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                    <p>© {new Date().getFullYear()} Beraxis. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">SLA Agreement</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
