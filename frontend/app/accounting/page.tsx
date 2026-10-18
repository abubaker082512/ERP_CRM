"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import {
    DollarSign,
    TrendingUp,
    FileText,
    CreditCard,
    Plus,
    MoreHorizontal,
    Building2,
    CheckCircle2,
    X
} from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

const TYPE_COLORS: Record<string, string> = {
    sale: "text-emerald-400",
    purchase: "text-rose-400",
    bank: "text-blue-400",
    cash: "text-amber-400",
    general: "text-purple-400",
};

export default function AccountingPage() {
    const router = useRouter();
    const { activeBranch, getEntityStorageKey } = useBranchContext();

    const [invoices, setInvoices] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [entries, setEntries] = useState<any[]>([]);
    const [journals, setJournals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Quick Transaction / Payment Modal
    const [showQuickModal, setShowQuickModal] = useState<"payment" | "cash" | null>(null);
    const [txRef, setTxRef] = useState("");
    const [txPartner, setTxPartner] = useState("");
    const [txAmount, setTxAmount] = useState("");
    const [txType, setTxType] = useState<"inflow" | "outflow">("inflow");

    useEffect(() => {
        setLoading(true);
        try {
            const invKey = getEntityStorageKey("accounting_invoices");
            const billKey = getEntityStorageKey("accounting_bills");
            const entryKey = getEntityStorageKey("accounting_entries");
            const journalKey = getEntityStorageKey("accounting_journals");

            const savedInv = localStorage.getItem(invKey);
            const savedBills = localStorage.getItem(billKey);
            const savedEntries = localStorage.getItem(entryKey);
            const savedJournals = localStorage.getItem(journalKey);

            setInvoices(savedInv ? JSON.parse(savedInv) : []);
            setBills(savedBills ? JSON.parse(savedBills) : []);
            setEntries(savedEntries ? JSON.parse(savedEntries) : []);
            setJournals(savedJournals ? JSON.parse(savedJournals) : []);
        } catch (err) {
            console.error("Failed to load entity accounting data:", err);
        } finally {
            setLoading(false);
        }
    }, [activeBranch, getEntityStorageKey]);

    const initializeJournals = () => {
        const defaultJournals = [
            { id: "j_sales", name: "Customer Invoices", code: "INV", type: "sale" },
            { id: "j_bills", name: "Vendor Bills", code: "BILL", type: "purchase" },
            { id: "j_bank", name: "Bank Operations", code: "BNK1", type: "bank" },
            { id: "j_cash", name: "Cash Register", code: "CSH1", type: "cash" },
            { id: "j_misc", name: "Miscellaneous Operations", code: "MISC", type: "general" },
        ];
        setJournals(defaultJournals);
        try {
            localStorage.setItem(getEntityStorageKey("accounting_journals"), JSON.stringify(defaultJournals));
        } catch {}
    };

    const handleRecordQuickTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(txAmount);
        if (!amt || isNaN(amt)) return;

        const journalName = showQuickModal === "payment" ? "Bank" : "Cash";
        const prefix = showQuickModal === "payment" ? "BNK1" : "CSH1";
        const newEntry = {
            id: `${prefix}/${new Date().getFullYear()}/${String(entries.length + 1).padStart(3, "0")}`,
            date: new Date().toISOString().split("T")[0],
            ref: txRef.trim() || (txType === "inflow" ? "Customer Receipt" : "Payment Disbursed"),
            journal: journalName,
            partner: txPartner.trim() || "-",
            amount: txType === "inflow" ? Math.abs(amt) : -Math.abs(amt),
            status: "posted",
            direction: txType,
        };

        const updated = [newEntry, ...entries];
        setEntries(updated);
        try {
            localStorage.setItem(getEntityStorageKey("accounting_entries"), JSON.stringify(updated));
        } catch {}

        setTxRef("");
        setTxPartner("");
        setTxAmount("");
        setShowQuickModal(null);
    };

    // Dynamically computed metrics for this isolated entity (0 by default for new accounts)
    const unpaidInvoices = invoices.filter(i => i.status !== "paid");
    const draftInvoices = invoices.filter(i => i.status === "draft");
    const paidInvoicesTotal = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const accountsReceivable = unpaidInvoices.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const draftInvoicesTotal = draftInvoices.reduce((s, i) => s + (Number(i.amount) || 0), 0);

    const unpaidBills = bills.filter(b => b.status !== "paid");
    const paidBillsTotal = bills.filter(b => b.status === "paid").reduce((s, b) => s + (Number(b.amount) || 0), 0);
    const accountsPayable = unpaidBills.reduce((s, b) => s + (Number(b.amount) || 0), 0);
    const lateBills = unpaidBills.filter(b => b.due_date && new Date(b.due_date) < new Date());
    const lateBillsTotal = lateBills.reduce((s, b) => s + (Number(b.amount) || 0), 0);

    const bankEntriesTotal = entries
        .filter(e => e.journal === "Bank")
        .reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const cashEntriesTotal = entries
        .filter(e => e.journal === "Cash")
        .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const bankBalance = paidInvoicesTotal - paidBillsTotal + bankEntriesTotal;
    const cashBalance = cashEntriesTotal;
    const totalCashAndBank = bankBalance + cashBalance;

    const totalRevenue = invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0) + entries.filter(e => Number(e.amount) > 0).reduce((s, e) => s + Number(e.amount), 0);
    const totalExpenses = bills.reduce((s, b) => s + (Number(b.amount) || 0), 0) + entries.filter(e => Number(e.amount) < 0).reduce((s, e) => s + Math.abs(Number(e.amount)), 0);
    const netProfit = totalRevenue - totalExpenses;

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search accounting..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-2xl font-semibold text-gray-200">Accounting Dashboard</h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <Building2 size={12} /> {activeBranch?.name || "Isolated Entity Ledger"}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                            Dedicated financial ledger for <strong className="text-gray-200">{activeBranch?.name || "your entity"}</strong> ({activeBranch?.entityType === "individual" ? "Individual Entity" : "Company Organization"}) — 100% isolated records
                        </p>
                    </div>
                </div>

                {/* Key Metrics (Starts at $0 for every new entity) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <DollarSign size={24} className="text-blue-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">${totalCashAndBank.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Cash & Bank Balance</div>
                        <div className="text-xs text-gray-500 mt-2">
                            {entries.length === 0 && invoices.length === 0 ? "No transactions recorded yet" : `${entries.length} ledger entries recorded`}
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <FileText size={24} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">${accountsReceivable.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Accounts Receivable</div>
                        <div className="text-xs text-gray-500 mt-2">{unpaidInvoices.length} invoices pending</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-red-500/20 p-3 rounded-lg w-fit mb-4">
                            <CreditCard size={24} className="text-red-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">${accountsPayable.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Accounts Payable</div>
                        <div className="text-xs text-gray-500 mt-2">{unpaidBills.length} bills due</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <TrendingUp size={24} className="text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">${netProfit.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Net Profit (YTD)</div>
                        <div className="text-xs text-gray-500 mt-2">
                            {invoices.length === 0 && bills.length === 0 ? "Start invoicing to track profit" : "Real-time entity P&L"}
                        </div>
                    </div>
                </div>

                {/* Journals Summary Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Customer Invoices</h3>
                            <Link href="/accounting/customers" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">To Validate (Draft)</div>
                                <div className="text-white font-medium">{draftInvoices.length} invoices (${draftInvoicesTotal.toLocaleString()})</div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">Unpaid</div>
                                <div className="text-white font-medium">{unpaidInvoices.length} invoices (${accountsReceivable.toLocaleString()})</div>
                            </div>
                            <button
                                onClick={() => router.push("/accounting/customers")}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium cursor-pointer"
                            >
                                New Invoice
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Vendor Bills</h3>
                            <Link href="/accounting/vendors" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">To Pay</div>
                                <div className="text-white font-medium">{unpaidBills.length} bills (${accountsPayable.toLocaleString()})</div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">Late</div>
                                <div className="text-red-400 font-medium">{lateBills.length} bills (${lateBillsTotal.toLocaleString()})</div>
                            </div>
                            <button
                                onClick={() => router.push("/accounting/vendors")}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium cursor-pointer"
                            >
                                Record Vendor Bill
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Bank</h3>
                            <Link href="/accounting/journal" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">Balance in GL</div>
                                <div className="text-white font-medium">${bankBalance.toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">Outstanding Payments</div>
                                <div className="text-white font-medium">${accountsPayable.toLocaleString()}</div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowQuickModal("payment")}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium cursor-pointer"
                                >
                                    Create Payment
                                </button>
                                <button
                                    onClick={() => router.push("/accounting/journal")}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm font-medium cursor-pointer"
                                >
                                    View Ledger
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Cash</h3>
                            <Link href="/accounting/journal" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">Balance in GL</div>
                                <div className="text-white font-medium">${cashBalance.toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">Outstanding Receipts</div>
                                <div className="text-white font-medium">$0</div>
                            </div>
                            <button
                                onClick={() => setShowQuickModal("cash")}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium cursor-pointer"
                            >
                                New Cash Transaction
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-gray-400">Loading journals...</div>
                ) : journals.length === 0 ? (
                    <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-10 text-center">
                        <h3 className="text-lg font-medium text-white mb-2">No Accounting Journals Configured Yet</h3>
                        <p className="text-gray-400 mb-6 text-sm">
                            Initialize default accounting journals for <strong className="text-white">{activeBranch?.name || "your entity"}</strong> to organize general ledger entries.
                        </p>
                        <button
                            onClick={initializeJournals}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg cursor-pointer"
                        >
                            Setup Default Journals
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {journals.map((journal) => (
                            <div key={journal.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-6">
                                    <Link href="/accounting/journal" className="block w-full">
                                        <h3 className={`font-semibold text-lg hover:underline ${TYPE_COLORS[journal.type] || 'text-gray-300'}`}>{journal.name}</h3>
                                        <p className="text-sm text-gray-400">{journal.code}</p>
                                    </Link>
                                    <button className="text-gray-500 hover:text-white">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                <div className="flex justify-between items-end">
                                    <Link href="/accounting/journal" className="bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/30 px-4 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-all">
                                        <Plus size={16} /> New Entry
                                    </Link>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 mb-1">Entries</p>
                                        <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-sm font-semibold">
                                            {entries.filter(e => e.journal?.toLowerCase().includes(journal.type)).length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Bank Payment / Cash Transaction Modal */}
            {showQuickModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">
                                {showQuickModal === "payment" ? "Record Bank Payment / Receipt" : "Record Cash Transaction"}
                            </h3>
                            <button onClick={() => setShowQuickModal(null)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleRecordQuickTransaction} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-gray-300 mb-1 font-medium">Transaction Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTxType("inflow")}
                                        className={`py-2 rounded-lg font-semibold border ${
                                            txType === "inflow"
                                                ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                                                : "bg-gray-900 border-gray-700 text-gray-400"
                                        }`}
                                    >
                                        + Money In (Receipt)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTxType("outflow")}
                                        className={`py-2 rounded-lg font-semibold border ${
                                            txType === "outflow"
                                                ? "bg-rose-600/20 border-rose-500 text-rose-300"
                                                : "bg-gray-900 border-gray-700 text-gray-400"
                                        }`}
                                    >
                                        - Money Out (Payment)
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1 font-medium">Amount ($) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={txAmount}
                                    onChange={(e) => setTxAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3.5 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1 font-medium">Customer / Vendor Name</label>
                                <input
                                    type="text"
                                    value={txPartner}
                                    onChange={(e) => setTxPartner(e.target.value)}
                                    placeholder="e.g. Client or Supplier Name"
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3.5 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1 font-medium">Reference / Description</label>
                                <input
                                    type="text"
                                    value={txRef}
                                    onChange={(e) => setTxRef(e.target.value)}
                                    placeholder="e.g. Invoice Payment or Office Supplies"
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3.5 py-2 text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowQuickModal(null)}
                                    className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                                >
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
