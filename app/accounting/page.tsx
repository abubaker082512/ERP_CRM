"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    FileText,
    CreditCard,
    Plus,
    MoreHorizontal,
    Landmark,
    Wallet,
    BookOpen,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    Calendar,
    Building2,
    PieChart,
    BarChart3,
    ShieldCheck,
    Receipt,
    ExternalLink,
    RefreshCw,
    X
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

const TYPE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
    sale: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    purchase: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    cash: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    bank: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    general: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }
};

const DEFAULT_INITIAL_JOURNALS = [
    {
        id: "j-inv",
        name: "Customer Invoices",
        code: "INV",
        type: "sale",
        balance: 45200,
        pending_count: 12,
        unvalidated_count: 3,
        last_entry: "INV/2026/089"
    },
    {
        id: "j-bill",
        name: "Vendor Bills",
        code: "BILL",
        type: "purchase",
        balance: 18400,
        pending_count: 5,
        unvalidated_count: 1,
        last_entry: "BILL/2026/042"
    },
    {
        id: "j-bnk",
        name: "Bank of America (Operating)",
        code: "BNK1",
        type: "bank",
        balance: 98500,
        pending_count: 2,
        unvalidated_count: 0,
        last_entry: "BNK-REC-441"
    },
    {
        id: "j-csh",
        name: "Petty Cash Account",
        code: "CSH",
        type: "cash",
        balance: 26000,
        pending_count: 4,
        unvalidated_count: 0,
        last_entry: "CSH-EXP-119"
    },
    {
        id: "j-gen",
        name: "General Operations Journal",
        code: "GEN",
        type: "general",
        balance: 0,
        pending_count: 0,
        unvalidated_count: 0,
        last_entry: "MISC/2026/007"
    },
    {
        id: "j-tax",
        name: "Tax & GST Settlement",
        code: "TAX",
        type: "general",
        balance: 6200,
        pending_count: 1,
        unvalidated_count: 0,
        last_entry: "TAX-Q1-2026"
    }
];

export default function AccountingPage() {
    const [journals, setJournals] = useState<any[]>(DEFAULT_INITIAL_JOURNALS);
    const [loading, setLoading] = useState<boolean>(false);

    // Create Entry / Invoice Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalType, setModalType] = useState<"invoice" | "bill" | "journal">("invoice");
    const [partnerName, setPartnerName] = useState("");
    const [entryAmount, setEntryAmount] = useState("");
    const [entryReference, setEntryReference] = useState("");
    const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedJournalId, setSelectedJournalId] = useState("j-inv");
    const [createSuccessMsg, setCreateSuccessMsg] = useState("");

    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        try {
            const res = await fetchAPI("/accounting/journals");
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    setJournals(data);
                }
            }
        } catch (error) {
            console.error("Error fetching journals:", error);
        }
    };

    const handleCreateEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!partnerName || !entryAmount) return;

        const newEntry = {
            id: `entry-${Date.now()}`,
            name: `${modalType === "invoice" ? "INV" : modalType === "bill" ? "BILL" : "MISC"}/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
            partner_name: partnerName,
            amount: parseFloat(entryAmount) || 0,
            date: entryDate,
            reference: entryReference,
            type: modalType
        };

        // Update local journals count and balance
        setJournals(prev => prev.map(j => {
            if (j.id === selectedJournalId || (modalType === "invoice" && j.type === "sale") || (modalType === "bill" && j.type === "purchase")) {
                return {
                    ...j,
                    balance: j.balance + newEntry.amount,
                    pending_count: j.pending_count + 1,
                    last_entry: newEntry.name
                };
            }
            return j;
        }));

        setCreateSuccessMsg(`🎉 Successfully created ${modalType.toUpperCase()} ${newEntry.name} for ${partnerName} ($${parseFloat(entryAmount).toLocaleString()})`);
        setTimeout(() => setCreateSuccessMsg(""), 6000);

        setShowCreateModal(false);
        setPartnerName("");
        setEntryAmount("");
        setEntryReference("");
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search invoices, bills, journal items..."
                onNewClick={() => setShowCreateModal(true)}
                newButtonText="New Entry"
            />

            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
                {/* Header & Quick Action Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            <span>Accounting & Finance Dashboard</span>
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                                Live Financials
                            </span>
                        </h2>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">
                            Real-time double-entry general ledger, customer invoices, vendor bills, and automated bank reconciliation.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={() => { setModalType("invoice"); setSelectedJournalId("j-inv"); setShowCreateModal(true); }}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/25 transition-all cursor-pointer active:scale-95"
                        >
                            <Plus size={15} /> Customer Invoice
                        </button>
                        <button
                            onClick={() => { setModalType("bill"); setSelectedJournalId("j-bill"); setShowCreateModal(true); }}
                            className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/25 transition-all cursor-pointer active:scale-95"
                        >
                            <Plus size={15} /> Vendor Bill
                        </button>
                        <Link
                            href="/accounting/reporting"
                            className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                            <PieChart size={15} /> Financial Reports
                        </Link>
                    </div>
                </div>

                {/* Success Notification */}
                {createSuccessMsg && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold flex items-center justify-between shadow-lg backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            <span>{createSuccessMsg}</span>
                        </div>
                        <button onClick={() => setCreateSuccessMsg("")} className="text-gray-400 hover:text-white cursor-pointer">
                            ✕
                        </button>
                    </div>
                )}

                {/* Key Financial Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-[#1E293B] rounded-2xl p-5 border border-gray-700/80 shadow-lg relative overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-blue-500/20 p-2.5 rounded-xl">
                                <Landmark size={22} className="text-blue-400" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                <TrendingUp size={14} /> +8.4% MoM
                            </span>
                        </div>
                        <div className="text-2xl md:text-3xl font-black text-white">$124,500.00</div>
                        <div className="text-xs font-semibold text-gray-400 mt-1">Total Bank & Cash Balance</div>
                        <div className="text-[11px] text-gray-500 mt-2">Reconciled across 2 active bank feeds</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-2xl p-5 border border-gray-700/80 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-emerald-500/20 p-2.5 rounded-xl">
                                <ArrowDownRight size={22} className="text-emerald-400" />
                            </div>
                            <span className="bg-emerald-500/15 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                12 Pending
                            </span>
                        </div>
                        <div className="text-2xl md:text-3xl font-black text-emerald-400">$45,200.00</div>
                        <div className="text-xs font-semibold text-gray-400 mt-1">Accounts Receivable (A/R)</div>
                        <div className="text-[11px] text-gray-500 mt-2">Customer invoices awaiting payment</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-2xl p-5 border border-gray-700/80 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-rose-500/20 p-2.5 rounded-xl">
                                <ArrowUpRight size={22} className="text-rose-400" />
                            </div>
                            <span className="bg-rose-500/15 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                5 Due Soon
                            </span>
                        </div>
                        <div className="text-2xl md:text-3xl font-black text-rose-400">$18,400.00</div>
                        <div className="text-xs font-semibold text-gray-400 mt-1">Accounts Payable (A/P)</div>
                        <div className="text-[11px] text-gray-500 mt-2">Vendor bills due this fiscal period</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-2xl p-5 border border-gray-700/80 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-purple-500/20 p-2.5 rounded-xl">
                                <TrendingUp size={22} className="text-purple-400" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                <TrendingUp size={14} /> +15.2% YoY
                            </span>
                        </div>
                        <div className="text-2xl md:text-3xl font-black text-purple-300">$32,100.00</div>
                        <div className="text-xs font-semibold text-gray-400 mt-1">Net Operating Profit (YTD)</div>
                        <div className="text-[11px] text-gray-500 mt-2">Revenue $148K • Expenses $116K</div>
                    </div>
                </div>

                {/* Operations Overview & Direct Journals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Invoices Box */}
                    <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/40">
                            <div className="flex items-center gap-2">
                                <Receipt size={18} className="text-blue-400" />
                                <h3 className="font-bold text-white text-sm">Customer Invoices Overview</h3>
                            </div>
                            <Link href="/accounting/customers" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                View Invoices <ExternalLink size={12} />
                            </Link>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-[#0F172A]/70 border border-gray-700/60">
                                <div>
                                    <div className="text-xs text-gray-400">To Validate & Post</div>
                                    <div className="text-base font-bold text-white">3 invoices</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400">Subtotal</div>
                                    <div className="text-sm font-bold text-amber-400">$4,500.00</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 rounded-xl bg-[#0F172A]/70 border border-gray-700/60">
                                <div>
                                    <div className="text-xs text-gray-400">Unpaid Customer Invoices</div>
                                    <div className="text-base font-bold text-white">12 open invoices</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400">Receivable Balance</div>
                                    <div className="text-sm font-bold text-emerald-400">$45,200.00</div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setModalType("invoice"); setSelectedJournalId("j-inv"); setShowCreateModal(true); }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <Plus size={14} /> Create Invoice
                                </button>
                                <Link
                                    href="/accounting/customers"
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white py-2 rounded-xl text-xs font-bold border border-white/10 text-center transition-all"
                                >
                                    Customer Ledger
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Vendor Bills Box */}
                    <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/40">
                            <div className="flex items-center gap-2">
                                <CreditCard size={18} className="text-rose-400" />
                                <h3 className="font-bold text-white text-sm">Vendor Bills & Outgoing Expenses</h3>
                            </div>
                            <Link href="/accounting/vendors" className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1">
                                View Bills <ExternalLink size={12} />
                            </Link>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-[#0F172A]/70 border border-gray-700/60">
                                <div>
                                    <div className="text-xs text-gray-400">To Pay This Week</div>
                                    <div className="text-base font-bold text-white">5 bills</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400">Payable Total</div>
                                    <div className="text-sm font-bold text-rose-400">$18,400.00</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 rounded-xl bg-[#0F172A]/70 border border-gray-700/60">
                                <div>
                                    <div className="text-xs text-gray-400">Past Due / Overdue</div>
                                    <div className="text-base font-bold text-red-400">1 overdue bill</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400">Overdue Total</div>
                                    <div className="text-sm font-bold text-red-400">$2,100.00</div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setModalType("bill"); setSelectedJournalId("j-bill"); setShowCreateModal(true); }}
                                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-xl text-xs font-bold shadow-md shadow-rose-600/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <Plus size={14} /> Record Vendor Bill
                                </button>
                                <Link
                                    href="/accounting/vendors"
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white py-2 rounded-xl text-xs font-bold border border-white/10 text-center transition-all"
                                >
                                    Vendor Ledger
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accounting Journals Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-purple-400" />
                            <h3 className="text-lg font-bold text-white">Active Accounting Journals</h3>
                            <span className="text-xs text-gray-400">({journals.length} configured)</span>
                        </div>

                        <Link
                            href="/accounting/journal"
                            className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                        >
                            Open General Ledger →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {journals.map((journal) => {
                            const typeStyle = TYPE_COLORS[journal.type] || TYPE_COLORS.general;
                            return (
                                <div
                                    key={journal.id}
                                    className="bg-[#1E293B] border border-gray-700/80 hover:border-purple-500/50 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className={`font-bold text-base text-white group-hover:text-purple-300 transition-colors`}>
                                                    {journal.name}
                                                </h4>
                                                <span className="font-mono text-xs text-gray-400">Code: {journal.code}</span>
                                            </div>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                                                {journal.type || "general"}
                                            </span>
                                        </div>

                                        <div className="p-3 bg-[#0F172A]/70 rounded-xl border border-gray-700/50 space-y-1.5 mb-4">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">Journal Balance</span>
                                                <span className="font-mono font-bold text-white">${(journal.balance || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">Unposted Items</span>
                                                <span className="font-semibold text-amber-400">{journal.pending_count || 0} entries</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">Last Sequence</span>
                                                <span className="font-mono text-gray-300 text-[11px]">{journal.last_entry || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-700/60">
                                        <button
                                            onClick={() => {
                                                setSelectedJournalId(journal.id);
                                                setModalType(journal.type === "sale" ? "invoice" : journal.type === "purchase" ? "bill" : "journal");
                                                setShowCreateModal(true);
                                            }}
                                            className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                        >
                                            <Plus size={13} /> New Entry
                                        </button>

                                        <Link
                                            href={`/accounting/journal/${journal.id}`}
                                            className="text-xs text-gray-400 hover:text-white font-medium"
                                        >
                                            View Items →
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Create Invoice / Bill / Journal Entry Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${modalType === "invoice" ? "bg-blue-500/20 text-blue-400" : modalType === "bill" ? "bg-rose-500/20 text-rose-400" : "bg-purple-500/20 text-purple-400"}`}>
                                    <Receipt size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">
                                        {modalType === "invoice" ? "Create Customer Invoice" : modalType === "bill" ? "Record Vendor Bill" : "New Journal Entry"}
                                    </h3>
                                    <p className="text-xs text-gray-400">Post transaction directly to General Ledger</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-white text-sm p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">
                                    {modalType === "invoice" ? "Customer / Client Name" : modalType === "bill" ? "Vendor / Supplier Name" : "Account / Title"}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={partnerName}
                                    onChange={(e) => setPartnerName(e.target.value)}
                                    placeholder={modalType === "invoice" ? "e.g. Acme Corp, Systems Ltd" : "e.g. Dell Enterprise, AWS Cloud"}
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Amount ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={entryAmount}
                                        onChange={(e) => setEntryAmount(e.target.value)}
                                        placeholder="e.g. 15000.00"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Transaction Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={entryDate}
                                        onChange={(e) => setEntryDate(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Target Journal</label>
                                <select
                                    value={selectedJournalId}
                                    onChange={(e) => setSelectedJournalId(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                                >
                                    {journals.map(j => (
                                        <option key={j.id} value={j.id}>{j.name} ({j.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Reference / Note (Optional)</label>
                                <input
                                    type="text"
                                    value={entryReference}
                                    onChange={(e) => setEntryReference(e.target.value)}
                                    placeholder="e.g. Software License Renewal Q1, Consulting Services"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                                >
                                    Save & Post Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
