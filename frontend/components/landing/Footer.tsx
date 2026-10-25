"use client";

import Link from "next/link";
import { ShieldCheck, Phone, Mail, MessageSquare, Globe, ArrowRight, Sparkles, Scale, Lock, FileText, CheckCircle2, MapPin } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 pt-20 pb-12 relative z-10 bg-[#050711] text-gray-400 text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main 6-Column Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16 text-left">
                    
                    {/* Column 1: Brand Info & Contact */}
                    <div className="col-span-2 space-y-4">
                        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
                            <img 
                                src="/logo-full.png" 
                                onError={(e) => { (e.target as HTMLImageElement).src = '/logo2.png'; }} 
                                alt="Beraxis Autonomous AI ERP & CRM Platform" 
                                className="h-8 w-auto object-contain" 
                            />
                        </Link>
                        <p className="text-xs text-gray-400 font-light leading-relaxed max-w-sm">
                            The #1 autonomous AI ERP &amp; CRM command center. Unify 28 business modules with built-in 25M+ B2B leads directory, point of sale, smart inventory, and voice assist pilot for $1/month.
                        </p>
                        
                        <div className="space-y-2 pt-2 text-xs">
                            <p className="flex items-center gap-2 text-gray-300 font-medium">
                                <Phone size={14} className="text-purple-400 shrink-0" />
                                <a href="tel:+19707807993" className="hover:text-white transition-colors">+1 (970) 780-7993</a>
                            </p>
                            <p className="flex items-center gap-2 text-gray-300 font-medium">
                                <Mail size={14} className="text-cyan-400 shrink-0" />
                                <a href="mailto:support@beraxis.online" className="hover:text-white transition-colors">support@beraxis.online</a>
                            </p>
                            <p className="flex items-start gap-2 text-gray-300 font-medium">
                                <MapPin size={14} className="text-rose-400 shrink-0 mt-0.5" />
                                <span>20, 21, Mobile Arena, SOAN Garden, Islamabad</span>
                            </p>
                        </div>

                        <div className="pt-2 flex flex-wrap gap-2">
                            <a 
                                href="https://wa.me/19707807993" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/20 px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all"
                            >
                                <MessageSquare size={13} />
                                <span>WhatsApp 24/7 Support</span>
                            </a>
                            <Link
                                href="/leads-pool"
                                className="inline-flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/20 px-3 py-2 rounded-xl text-xs transition-all"
                            >
                                <Globe size={13} />
                                <span>25M+ Leads Directory</span>
                            </Link>
                        </div>
                    </div>

                    {/* Column 2: Platform Modules */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-1.5">
                            <Sparkles size={13} className="text-purple-400" />
                            <span>ERP Modules</span>
                        </h4>
                        <ul className="space-y-2.5 text-xs font-light">
                            <li><Link href="/features/crm-pipeline" className="hover:text-white transition-colors">CRM Lead Pipeline</Link></li>
                            <li><Link href="/features/inventory" className="hover:text-white transition-colors">Smart Inventory</Link></li>
                            <li><Link href="/features/voice-pilot" className="hover:text-white transition-colors">AI Voice Pilot</Link></li>
                            <li><Link href="/accounting" className="hover:text-white transition-colors">Double-Entry Accounting</Link></li>
                            <li><Link href="/pos" className="hover:text-white transition-colors">Point of Sale (POS)</Link></li>
                            <li><Link href="/sales" className="hover:text-white transition-colors">Sales &amp; Quotations</Link></li>
                            <li><Link href="/payroll" className="hover:text-white transition-colors">HRMS &amp; Payroll</Link></li>
                            <li><Link href="/manufacturing" className="hover:text-white transition-colors">Manufacturing &amp; MRP</Link></li>
                            <li><Link href="/apps" className="hover:text-white transition-colors">All 28 Apps Index</Link></li>
                            <li><Link href="/features" className="hover:text-purple-300 font-semibold text-purple-400 flex items-center gap-1">Features Directory &rarr;</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: 12 Industry Archetypes */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-1.5">
                            <Globe size={13} className="text-cyan-400" />
                            <span>Industries</span>
                        </h4>
                        <ul className="space-y-2.5 text-xs font-light">
                            <li><Link href="/industries/padel-clubs" className="hover:text-white transition-colors">Padel &amp; Sports Clubs</Link></li>
                            <li><Link href="/industries/dental-clinics" className="hover:text-white transition-colors">Dental &amp; Clinics EMR</Link></li>
                            <li><Link href="/industries/bakeries-restaurants" className="hover:text-white transition-colors">Bakeries &amp; Dining KDS</Link></li>
                            <li><Link href="/industries/automotive-garages" className="hover:text-white transition-colors">Auto Repair Garages</Link></li>
                            <li><Link href="/industries/real-estate" className="hover:text-white transition-colors">Real Estate &amp; Leases</Link></li>
                            <li><Link href="/industries/retail-supermarkets" className="hover:text-white transition-colors">Retail &amp; Supermarkets</Link></li>
                            <li><Link href="/industries/construction-contracting" className="hover:text-white transition-colors">Construction &amp; WBS</Link></li>
                            <li><Link href="/industries/education-academies" className="hover:text-white transition-colors">Schools &amp; Academies</Link></li>
                            <li><Link href="/industries/ngos-non-profits" className="hover:text-white transition-colors">NGOs &amp; Grants</Link></li>
                            <li><Link href="/industries/manufacturing" className="hover:text-white transition-colors">Discrete Manufacturing</Link></li>
                            <li><Link href="/industries/logistics-wholesale" className="hover:text-white transition-colors">Logistics &amp; Wholesale</Link></li>
                            <li><Link href="/industries/professional-services" className="hover:text-white transition-colors">Professional Services</Link></li>
                            <li><Link href="/industries" className="hover:text-cyan-300 font-semibold text-cyan-400 flex items-center gap-1">All 12 Archetypes &rarr;</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Software Comparisons */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-1.5">
                            <Scale size={13} className="text-amber-400" />
                            <span>Compare vs.</span>
                        </h4>
                        <ul className="space-y-2.5 text-xs font-light">
                            <li><Link href="/compare/quickbooks-alternative" className="hover:text-white transition-colors">QuickBooks Alternative</Link></li>
                            <li><Link href="/compare/odoo-alternative" className="hover:text-white transition-colors">Odoo ERP Alternative</Link></li>
                            <li><Link href="/compare/hubspot-alternative" className="hover:text-white transition-colors">HubSpot CRM Alternative</Link></li>
                            <li><Link href="/compare/zoho-crm-alternative" className="hover:text-white transition-colors">Zoho CRM Alternative</Link></li>
                            <li><Link href="/compare/toast-square-pos-alternative" className="hover:text-white transition-colors">Toast &amp; Square Alternative</Link></li>
                            <li><Link href="/compare/traditional-erp-vs-beraxis" className="hover:text-white transition-colors">Traditional ERP vs Beraxis</Link></li>
                            <li><Link href="/compare" className="hover:text-amber-300 font-semibold text-amber-400 flex items-center gap-1">All Comparisons Hub &rarr;</Link></li>
                            
                            <li className="pt-3 border-t border-white/5"><span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Tools &amp; Hubs</span></li>
                            <li><Link href="/leads-pool" className="hover:text-white transition-colors">25M+ Leads Pool</Link></li>
                            <li><Link href="/affiliates" className="hover:text-purple-300 font-semibold text-purple-400">Affiliate Program (30%)</Link></li>
                            <li><Link href="/referrals" className="hover:text-white transition-colors">Customer Referrals</Link></li>
                            <li><Link href="/digital-launch-hub.html" className="hover:text-white transition-colors">Digital Launch Hub</Link></li>
                        </ul>
                    </div>

                    {/* Column 5: Legal & Compliance */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-emerald-400" />
                            <span>Legal &amp; Trust</span>
                        </h4>
                        <ul className="space-y-2.5 text-xs font-light">
                            <li><Link href="/privacy" className="hover:text-white transition-colors font-medium text-gray-300">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors font-medium text-gray-300">Terms of Service</Link></li>
                            <li><Link href="/sla" className="hover:text-white transition-colors font-medium text-gray-300">99.9% Uptime SLA</Link></li>
                            <li><Link href="/security" className="hover:text-white transition-colors font-medium text-gray-300">Enterprise Security &amp; RLS</Link></li>
                            <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie &amp; Tracking Policy</Link></li>
                            <li><Link href="/privacy#gdpr" className="hover:text-white transition-colors">GDPR &amp; CCPA Rights</Link></li>
                            <li><Link href="/refund-policy" className="hover:text-white transition-colors font-medium text-emerald-400">Refund Policy (14-Day Money-Back)</Link></li>
                            <li><Link href="/terms#acceptable-use" className="hover:text-white transition-colors">Acceptable Use Policy</Link></li>
                            <li><Link href="/sitemap.xml" className="hover:text-white transition-colors text-gray-500">XML Sitemap Index</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Secondary Quick Navigation Row */}
                <div className="py-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center gap-6">
                        <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link>
                        <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing ($1/mo Plan)</Link>
                        <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">Insights &amp; Engineering Blog</Link>
                        <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Support</Link>
                        <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Customer Login</Link>
                        <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Create Free Account</Link>
                    </div>

                    <div className="flex items-center gap-3 text-gray-500 text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>All Systems Operational (99.9% SLA)</span>
                        </span>
                    </div>
                </div>

                {/* Bottom Copyright Bar */}
                <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>© {currentYear} Beraxis Systems Inc. All rights reserved. The Premier Autonomous Cloud ERP &amp; AI CRM System.</p>
                    <div className="flex flex-wrap gap-4 text-xs">
                        <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
                        <span>•</span>
                        <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
                        <span>•</span>
                        <Link href="/refund-policy" className="hover:text-gray-300 transition-colors">Refund Policy</Link>
                        <span>•</span>
                        <Link href="/sla" className="hover:text-gray-300 transition-colors">SLA</Link>
                        <span>•</span>
                        <Link href="/security" className="hover:text-gray-300 transition-colors">Security</Link>
                        <span>•</span>
                        <Link href="/cookies" className="hover:text-gray-300 transition-colors">Cookies</Link>
                        <span>•</span>
                        <Link href="/sitemap.xml" className="hover:text-gray-300 transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
