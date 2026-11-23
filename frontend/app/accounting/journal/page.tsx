"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { DollarSign, Plus, X, Trash2 } from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

type JournalEntry = {
    id: string;
    date: string;
    ref: string;
    journal: string;
    partner: string;
    amount: number;
    debitAccount?: string;
    creditAccount?: string;
    category?: string;
    auto_gl?: boolean;
    status: string;
};

export default function AccountingJournalPage() {
    const { activeBranch, getEntityStorageKey, currencySymbol } = useBranchContext();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showNewModal, setShowNewModal] = useState(false);

    const [ref, setRef] = useState("");
    const [journal, setJournal] = useState("Miscellaneous");
    const [category, setCategory] = useState("equity");
    const [debitAccount, setDebitAccount] = useState("1010 Bank");
    const [creditAccount, setCreditAccount] = useState("3000 Owner Capital / Equity");
    const [partner, setPartner] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [status] = useState("posted");

    useEffect(() => {
        try {
            const key = getEntityStorageKey("accounting_entries");
            const saved = localStorage.getItem(key);
            setEntries(saved ? JSON.parse(saved) : []);
        } catch {
            setEntries([]);
        }
    }, [activeBranch, getEntityStorageKey]);

    const saveEntries = (updated: JournalEntry[]) => {
        setEntries(updated);
        try {
            localStorage.setItem(getEntityStorageKey("accounting_entries"), JSON.stringify(updated));
        } catch {}
    };

    const handleCreateEntry = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || isNaN(parsedAmount)) return;

        const year = new Date().getFullYear();
        const prefix = journal === "Bank" ? "BNK1" : journal === "Cash" ? "CSH1" : "MISC";
        const nextNum = String(entries.length + 1).padStart(3, "0");
        const signedAmount = category === "expense" ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);
        const newEntry: JournalEntry = {
            id: `${prefix}/${year}/${nextNum}`,
            date,
            ref: ref.trim() || "Journal Entry",
            journal,
            partner: partner.trim(),
            amount: signedAmount,
            debitAccount,
            creditAccount,
            category,
            status,
        };

        saveEntries([newEntry, ...entries]);
        setRef("");
        setPartner("");
        setAmount("");
        setShowNewModal(false);
    };

    const handleDeleteEntry = (id: string) => {
        if (!confirm(`Delete journal entry ${id}?`)) return;
        saveEntries(entries.filter((e) => e.id !== id));
    };

    const filteredEntries = entries.filter(
        (e) =>
            e.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.partner || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#0F172A] overflow-x-hidden">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search journal entries..."
                onSearchChange={setSearchTerm}
                onNewClick={() => setShowNewModal(true)}
                newButtonLabel="New Entry"
            />

            <div className="flex-1 overflow-auto p-4 sm:p-6 pb-24">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-200">Journal Entries (General Ledger)</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Balanced double-entry ledger for <strong className="text-gray-200">{activeBranch?.name || "your entity"}</strong>
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                        <Plus size={16} /> New Journal Entry
                    </button>
                </div>

                {filteredEntries.length === 0 ? (
                    <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-12 text-center">
                        <h3 className="text-lg font-semibold text-white mb-2">No Journal Entries Yet</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Your entity general ledger starts completely clean. Posting invoices or creating manual entries will populate balanced GL lines here.
                        </p>
                        <button
                            onClick={() => setShowNewModal(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                        >
                            <Plus size={16} /> Create First Journal Entry
                        </button>
                    </div>
                ) : (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-x-auto">
                        <table className="w-full min-w-[820px]">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Number</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Reference</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Debit / Credit</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Journal</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Amount</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((entry) => (
                                    <tr key={entry.id} className="border-b border-gray-700 hover:bg-[#1E293B]/80 transition-colors">
                                        <td className="px-4 py-3 text-gray-400 text-sm">{new Date(entry.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 font-medium text-white text-sm">{entry.id}</td>
                                        <td className="px-4 py-3 text-gray-300 text-sm">
                                            <div>{entry.ref}</div>
                                            {entry.partner && <div className="text-xs text-gray-500">{entry.partner}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            <div className="text-emerald-400">DR: {entry.debitAccount || "1010 Bank / Cash"}</div>
                                            <div className="text-amber-300">CR: {entry.creditAccount || "3000 Equity / Offset"}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300 text-sm">{entry.journal}</td>
                                        <td className="px-4 py-3 text-white font-semibold text-sm">{currencySymbol}{Math.abs(entry.amount).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${entry.status === "posted" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}`}>
                                                {entry.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleDeleteEntry(entry.id)}
                                                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                                                title="Delete Entry"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showNewModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl my-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">New Double-Entry Journal</h3>
                            <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateEntry} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-gray-300 mb-1 font-medium">Reference / Description *</label>
                                <input
                                    type="text"
                                    required
                                    value={ref}
                                    onChange={(e) => setRef(e.target.value)}
                                    placeholder="e.g. Initial Capital Injection or Office Rent"
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3.5 py-2 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 mb-1 font-medium">Journal</label>
                                    <select
                                        value={journal}
                                        onChange={(e) => setJournal(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3.5 py-2 text-white"
                                    >
                                        <option value="Bank">Bank</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Miscellaneous">Miscellaneous</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1 font-medium">Entry Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3.5 py-2 text-white"
                                    >
                                        <option value="equity">Equity / Capital (Non-P&amp;L)</option>
                                        <option value="income">Operating Income</option>
                                        <option value="expense">Operating Expense</option>
                                        <option value="asset">Asset / Transfer</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 mb-1 font-medium">Debit Account (DR)</label>
                                    <input
                                        type="text"
                                        required
                                        value={debitAccount}
                                        onChange={(e) => setDebitAccount(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1 font-medium">Credit Account (CR)</label>
                                    <input
                                        type="text"
                                        required
                                        value={creditAccount}
                                        onChange={(e) => setCreditAccount(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white text-xs"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-gray-300 mb-1 font-medium">Amount ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1 font-medium">Partner</label>
                                    <input
                                        type="text"
                                        value={partner}
                                        onChange={(e) => setPartner(e.target.value)}
                                        placeholder="Optional"
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1 font-medium">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewModal(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                                >
                                    Post Balanced Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
