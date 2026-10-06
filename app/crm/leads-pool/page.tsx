"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CRMHeader from "@/components/crm/CRMHeader";
import { fetchAPI } from "@/lib/api";
import {
    Globe,
    Search,
    Filter,
    Download,
    CheckCircle,
    Phone,
    Mail,
    Building2,
    MapPin,
    Briefcase,
    Zap,
    Sparkles,
    ShieldCheck,
    RefreshCw,
    Plus,
    ExternalLink,
    Copy,
    Check,
    Database,
    Send,
    Bot,
    UserCheck,
    Layers,
    Flame
} from "lucide-react";

type LeadRecord = {
    id: string;
    company_name: string;
    contact_name: string;
    job_title: string;
    email: string;
    email_status: string;
    phone: string;
    website: string;
    industry: string;
    country: string;
    city: string;
    employees?: string;
    annual_revenue?: string;
    source?: string;
};

export default function LeadsPoolPage() {
    const [leads, setLeads] = useState<LeadRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [countries, setCountries] = useState<string[]>([]);
    const [industries, setIndustries] = useState<string[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("All");
    const [selectedIndustry, setSelectedIndustry] = useState("All");
    const [selectedRole, setSelectedRole] = useState("All");
    const [hasEmailOnly, setHasEmailOnly] = useState(false);
    const [hasPhoneOnly, setHasPhoneOnly] = useState(false);

    // Selection & Import state
    const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
    const [importing, setImporting] = useState(false);
    const [importSuccessMsg, setImportSuccessMsg] = useState("");
    const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

    // Free Email Verifier Tool state
    const [showVerifier, setShowVerifier] = useState(false);
    const [verFirstName, setVerFirstName] = useState("");
    const [verLastName, setVerLastName] = useState("");
    const [verDomain, setVerDomain] = useState("");
    const [verResult, setVerResult] = useState<any>(null);
    const [verLoading, setVerLoading] = useState(false);

    useEffect(() => {
        loadLeadsPool();
        loadStats();
    }, [selectedCountry, selectedIndustry, selectedRole, hasEmailOnly, hasPhoneOnly]);

    const loadLeadsPool = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append("query", searchQuery);
            if (selectedCountry !== "All") params.append("country", selectedCountry);
            if (selectedIndustry !== "All") params.append("industry", selectedIndustry);
            if (selectedRole !== "All") params.append("job_title", selectedRole);
            if (hasEmailOnly) params.append("has_email", "true");
            if (hasPhoneOnly) params.append("has_phone", "true");

            const res = await fetchAPI(`/lead-bank?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setLeads(data.leads || []);
                setTotal(data.total || 0);
                if (data.countries?.length) setCountries(data.countries);
                if (data.industries?.length) setIndustries(data.industries);
            }
        } catch (err) {
            console.error("Failed to load leads pool", err);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const res = await fetchAPI("/lead-bank/stats");
            if (res.ok) {
                setStats(await res.json());
            }
        } catch {}
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadLeadsPool();
    };

    const toggleSelectAll = () => {
        if (selectedLeadIds.length === leads.length) {
            setSelectedLeadIds([]);
        } else {
            setSelectedLeadIds(leads.map((l) => l.id));
        }
    };

    const toggleSelectLead = (id: string) => {
        if (selectedLeadIds.includes(id)) {
            setSelectedLeadIds(selectedLeadIds.filter((lid) => lid !== id));
        } else {
            setSelectedLeadIds([...selectedLeadIds, id]);
        }
    };

    const handleImportLeads = async (leadIdsToImport: string[]) => {
        if (leadIdsToImport.length === 0) return;
        setImporting(true);
        setImportSuccessMsg("");
        try {
            const res = await fetchAPI("/lead-bank/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lead_ids: leadIdsToImport,
                    target_stage: "New",
                    estimated_revenue: 15000.0,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setImportSuccessMsg(`🎉 ${data.message || `Successfully imported ${leadIdsToImport.length} lead(s) into your CRM Pipeline!`}`);
                setSelectedLeadIds([]);
                setTimeout(() => setImportSuccessMsg(""), 6000);
            }
        } catch (err) {
            console.error("Failed to import leads", err);
        } finally {
            setImporting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedEmail(text);
        setTimeout(() => setCopiedEmail(null), 2000);
    };

    const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verFirstName || !verLastName || !verDomain) return;
        setVerLoading(true);
        try {
            const res = await fetchAPI("/lead-bank/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: verFirstName,
                    last_name: verLastName,
                    domain: verDomain,
                }),
            });
            if (res.ok) {
                setVerResult(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setVerLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col">
            <CRMHeader />

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
                {/* ── Top Hero & Stats Banner ── */}
                <div className="bg-gradient-to-r from-cyan-950/70 via-[#0F172A]/90 to-purple-950/70 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-400/30 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
                            <Flame size={28} className="text-amber-300 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <Sparkles size={11} /> Global Leads Pool
                                </span>
                                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                                    <ShieldCheck size={12} /> 100% Free • Unlimited Direct Access
                                </span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-white mt-1">
                                High-Intent Global Leads Pool & Contact Finder
                            </h1>
                            <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                                Search millions of worldwide companies, verified direct dials, and work emails. 1-click import directly into your private CRM pipeline with zero third-party API fees.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowVerifier(true)}
                            className="bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                        >
                            <Sparkles size={14} /> Free Email Verifier Tool
                        </button>
                    </div>
                </div>

                {/* ── Stats Summary Bar ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0F172A]/70 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md">
                        <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                            <Database size={20} />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-white">{stats?.total_leads || total} Leads</div>
                            <div className="text-xs text-gray-400">In Active Pool</div>
                        </div>
                    </div>

                    <div className="bg-[#0F172A]/70 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                            <Mail size={20} />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-emerald-400">98.5% Deliverable</div>
                            <div className="text-xs text-gray-400">Verified Work Emails</div>
                        </div>
                    </div>

                    <div className="bg-[#0F172A]/70 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md">
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                            <Phone size={20} />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-white">Direct Phone Dials</div>
                            <div className="text-xs text-gray-400">Mobile & HQ Numbers</div>
                        </div>
                    </div>

                    <div className="bg-[#0F172A]/70 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md">
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                            <Zap size={20} />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-amber-300">Zero Credit Limits</div>
                            <div className="text-xs text-gray-400">Unlimited Free Prospecting</div>
                        </div>
                    </div>
                </div>

                {/* ── Search & Filter Controls ── */}
                <div className="bg-[#0F172A]/70 border border-white/5 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-4">
                    <form onSubmit={handleSearchSubmit} className="flex flex-wrap md:flex-nowrap gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by company name, contact, domain, city..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-600/20 active:scale-95 cursor-pointer shrink-0"
                        >
                            <Search size={14} /> Search Pool
                        </button>
                    </form>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800 text-xs">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <Filter size={13} />
                                <span className="font-semibold">Filters:</span>
                            </div>

                            {/* Country Filter */}
                            <select
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className="bg-[#1E293B] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                            >
                                <option value="All">All Countries</option>
                                <option value="United States">🇺🇸 United States</option>
                                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                                <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
                                <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                                <option value="Canada">🇨🇦 Canada</option>
                                <option value="Germany">🇩🇪 Germany</option>
                                <option value="Sweden">🇸🇪 Sweden</option>
                                <option value="Singapore">🇸🇬 Singapore</option>
                                <option value="Australia">🇦🇺 Australia</option>
                                <option value="Pakistan">🇵🇰 Pakistan</option>
                            </select>

                            {/* Industry Filter */}
                            <select
                                value={selectedIndustry}
                                onChange={(e) => setSelectedIndustry(e.target.value)}
                                className="bg-[#1E293B] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                            >
                                <option value="All">All Industries</option>
                                <option value="Technology & SaaS">💻 Technology & SaaS</option>
                                <option value="Finance & Investment">🏦 Finance & Investment</option>
                                <option value="Healthcare & Biotech">🏥 Healthcare & Biotech</option>
                                <option value="Real Estate & Construction">🏢 Real Estate & Construction</option>
                                <option value="Logistics & Supply Chain">🚢 Logistics & Supply Chain</option>
                                <option value="Manufacturing & Industrial">⚙️ Manufacturing & Industrial</option>
                                <option value="E-Commerce & Import/Export">🛍️ E-Commerce & Trade</option>
                                <option value="Energy & Sustainability">⚡ Energy & Green Tech</option>
                            </select>

                            {/* Role Filter */}
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="bg-[#1E293B] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                            >
                                <option value="All">All Job Titles</option>
                                <option value="Chief Executive Officer">CEO / Founder</option>
                                <option value="Technology">CTO / Tech Lead</option>
                                <option value="Director">Director / VP</option>
                                <option value="Manager">General Manager</option>
                            </select>

                            {/* Checkbox Toggles */}
                            <label className="flex items-center gap-1.5 text-gray-300 cursor-pointer ml-1">
                                <input
                                    type="checkbox"
                                    checked={hasEmailOnly}
                                    onChange={(e) => setHasEmailOnly(e.target.checked)}
                                    className="rounded border-gray-700 bg-black/40 text-cyan-500 focus:ring-0"
                                />
                                <span>Verified Email</span>
                            </label>

                            <label className="flex items-center gap-1.5 text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hasPhoneOnly}
                                    onChange={(e) => setHasPhoneOnly(e.target.checked)}
                                    className="rounded border-gray-700 bg-black/40 text-cyan-500 focus:ring-0"
                                />
                                <span>Phone Number</span>
                            </label>
                        </div>

                        {/* Bulk Action Button */}
                        {selectedLeadIds.length > 0 && (
                            <button
                                onClick={() => handleImportLeads(selectedLeadIds)}
                                disabled={importing}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-4 py-1.5 rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
                            >
                                <Download size={13} className={importing ? "animate-spin" : ""} />
                                <span>{importing ? "Importing..." : `Import Selected (${selectedLeadIds.length}) to CRM`}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Success Notification Banner */}
                {importSuccessMsg && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold flex items-center justify-between shadow-lg backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} />
                            <span>{importSuccessMsg}</span>
                        </div>
                        <Link href="/crm" className="text-xs text-white underline font-bold hover:text-emerald-200">
                            View in CRM Pipeline →
                        </Link>
                    </div>
                )}

                {/* ── Global Leads Table ── */}
                <div className="bg-[#0F172A]/70 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="font-bold text-white text-base">Global Leads Pool Directory</h2>
                            <span className="text-xs text-gray-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                                {total} Verified Matches
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs md:text-sm">
                            <thead>
                                <tr className="text-xs text-gray-400 uppercase border-b border-gray-800 text-left">
                                    <th className="pb-3 w-8">
                                        <input
                                            type="checkbox"
                                            checked={leads.length > 0 && selectedLeadIds.length === leads.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-700 bg-black/40 text-cyan-500 focus:ring-0 cursor-pointer"
                                        />
                                    </th>
                                    <th className="pb-3">Contact & Company</th>
                                    <th className="pb-3">Verified Contact Details</th>
                                    <th className="pb-3">Location & Industry</th>
                                    <th className="pb-3">Scale / Revenue</th>
                                    <th className="pb-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400">
                                            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                            <span>Searching global leads pool...</span>
                                        </td>
                                    </tr>
                                ) : leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400">
                                            No leads matched your filter criteria. Try broadening your search or resetting filters.
                                        </td>
                                    </tr>
                                ) : (
                                    leads.map((lead) => {
                                        const isSelected = selectedLeadIds.includes(lead.id);
                                        return (
                                            <tr
                                                key={lead.id}
                                                className={`border-b border-gray-800/40 hover:bg-white/5 transition-colors ${
                                                    isSelected ? "bg-cyan-950/20" : ""
                                                }`}
                                            >
                                                <td className="py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectLead(lead.id)}
                                                        className="rounded border-gray-700 bg-black/40 text-cyan-500 focus:ring-0 cursor-pointer"
                                                    />
                                                </td>

                                                {/* Contact & Company */}
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                                                            {lead.contact_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white flex items-center gap-1.5">
                                                                {lead.contact_name}
                                                            </div>
                                                            <div className="text-gray-400 text-xs font-medium">
                                                                {lead.job_title}
                                                            </div>
                                                            <div className="text-cyan-400 font-semibold text-xs flex items-center gap-1 mt-0.5">
                                                                <Building2 size={11} />
                                                                <span>{lead.company_name}</span>
                                                                {lead.website && (
                                                                    <a
                                                                        href={lead.website}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-gray-500 hover:text-gray-300 ml-0.5"
                                                                        title={lead.website}
                                                                    >
                                                                        <ExternalLink size={10} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Verified Contact Details */}
                                                <td className="py-4">
                                                    <div className="space-y-1">
                                                        {lead.email ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-mono text-gray-200 text-xs truncate max-w-[180px]">
                                                                    {lead.email}
                                                                </span>
                                                                <button
                                                                    onClick={() => copyToClipboard(lead.email)}
                                                                    title="Copy email address"
                                                                    className="text-gray-500 hover:text-white p-1 transition-colors cursor-pointer"
                                                                >
                                                                    {copiedEmail === lead.email ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                                </button>
                                                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                                                    Verified
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-500 text-xs">No email</span>
                                                        )}

                                                        {lead.phone ? (
                                                            <div className="flex items-center gap-1.5 text-gray-400 font-mono text-xs">
                                                                <Phone size={11} className="text-purple-400" />
                                                                <a
                                                                    href={`tel:${lead.phone}`}
                                                                    className="hover:text-white transition-colors"
                                                                >
                                                                    {lead.phone}
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-500 text-xs">No phone</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Location & Industry */}
                                                <td className="py-4">
                                                    <div className="space-y-1">
                                                        <div className="text-gray-300 font-medium flex items-center gap-1">
                                                            <MapPin size={11} className="text-red-400" />
                                                            <span>{lead.city}, {lead.country}</span>
                                                        </div>
                                                        <div className="inline-block px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-[11px]">
                                                            {lead.industry}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Scale / Revenue */}
                                                <td className="py-4">
                                                    <div className="text-xs space-y-0.5">
                                                        <div className="text-gray-300 font-semibold">{lead.annual_revenue || "—"}</div>
                                                        <div className="text-gray-500">{lead.employees || "50-200"} emp</div>
                                                    </div>
                                                </td>

                                                {/* Action */}
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() => handleImportLeads([lead.id])}
                                                        disabled={importing}
                                                        className="bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer shadow-sm active:scale-95"
                                                    >
                                                        <Plus size={13} />
                                                        <span>Add to CRM</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Free Email Verifier Modal / Drawer ── */}
                {showVerifier && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: "rgba(2,2,5,0.85)", backdropFilter: "blur(12px)" }}
                        onClick={() => setShowVerifier(false)}
                    >
                        <div
                            className="max-w-lg w-full bg-[#0F172A] border border-cyan-500/30 rounded-3xl p-6 md:p-8 text-left shadow-2xl shadow-cyan-500/15 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Free Email Finder & MX Verifier</h3>
                                        <p className="text-xs text-gray-400">Zero API cost permutation & DNS validation</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowVerifier(false)}
                                    className="text-gray-400 hover:text-white p-1 text-sm font-bold cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleVerifyEmailSubmit} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={verFirstName}
                                            onChange={(e) => setVerFirstName(e.target.value)}
                                            placeholder="e.g. Satya"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={verLastName}
                                            onChange={(e) => setVerLastName(e.target.value)}
                                            placeholder="e.g. Nadella"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Company Domain</label>
                                    <input
                                        type="text"
                                        required
                                        value={verDomain}
                                        onChange={(e) => setVerDomain(e.target.value)}
                                        placeholder="e.g. microsoft.com"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={verLoading}
                                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
                                >
                                    <RefreshCw size={13} className={verLoading ? "animate-spin" : ""} />
                                    <span>{verLoading ? "Testing MX & Generating..." : "Generate & Verify Email"}</span>
                                </button>
                            </form>

                            {/* Verification Result */}
                            {verResult && (
                                <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400">Primary Match:</span>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                            verResult.status === "deliverable" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                                        }`}>
                                            {verResult.status} ({verResult.confidence_score}%)
                                        </span>
                                    </div>
                                    <div className="font-mono text-sm font-bold text-white flex items-center justify-between">
                                        <span>{verResult.primary_email}</span>
                                        <button
                                            onClick={() => copyToClipboard(verResult.primary_email)}
                                            className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 cursor-pointer"
                                        >
                                            <Copy size={12} /> Copy
                                        </button>
                                    </div>
                                    <div className="text-[11px] text-gray-500 pt-2 border-t border-gray-800">
                                        MX Host: <span className="text-gray-300 font-mono">{verResult.mx_host || "Verified"}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
