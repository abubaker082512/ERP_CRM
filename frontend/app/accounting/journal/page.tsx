"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { DollarSign, Plus, X } from "lucide-react";
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
    status: string;
};

export default function AccountingJournalPage() {
    const { activeBranch, getEntityStorageKey } = useBranchContext();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showNewModal, setShowNewModal] = useState(false);

    const [ref, setRef] = useState("");
    const [journal, setJournal] = useState("Miscellaneous");
    const [partner, setPartner] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [status, setStatus] = useState("posted");

    useEffect(() => {
        try {
            const key = getEntityStorageKey("accounting_entries");
            const saved = localStorage.getItem(key);
            setEntries(saved ? JSON.parse(saved) : []);
        } catch {
            setEntries([]);
        }
    }, [activeBranch, getEntityStorageKey]);

    const handleCreateEntry = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;

        const year = new Date().getFullYear();
        const prefix = journal === "Bank" ? "BNK1" : journal === "Cash" ? "CSH1" : "MISC";
        const nextNum = String(entries.length + 1).padStart(3, "0");
        const newEntry: JournalEntry = {
            id: `${prefix}/${year}/${nextNum}`,
            date,
            ref: ref.trim() || "Journal Entry",
            journal,
            partner: partner.trim(),
            amount: parseFloat(amount) || 0,
            status,
        };

        const updated = [newEntry, ...entries];
        setEntries(updated);
        try {
            localStorage.setItem(getEntityStorageKey("accounting_entries"), JSON.stringify(updated));
        } catch {}

        setRef("");
        setPartner("");
        setAmount("");
        setShowNewModal(false);
    };

    const filteredEntries = entries.filter(
        e =>
            e.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.partner || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search journal entries..."
                onSearchChange={setSearchTerm}
                onNewClick={() => setShowNewModal(true)}
                newButtonLabel="New Entry"
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-200">Journal Entries</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Manage general ledger entries for <strong className="text-gray-200">{activeBranch?.name || "your entity"}</strong>
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus size={16} /> New Journal Entry
                    </button>
                </div>

                {filteredEntries.length === 0 ? (
                    <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-12 text-center">
                        <h3 className="text-lg font-semibold text-white mb-2">No Journal Entries Yet</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Your entity general ledger starts completely clean with zero pre-filled entries.
                        </p>
                        <button
                            onClick={() => setShowNewModal(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                        >
                            <Plus size={16} /> Create First Journal Entry
                        </button>
                    </div>
                ) : (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Number</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Reference</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Journal</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Partner</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map(entry => (
                                    <tr key={entry.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 text-gray-400">{new Date(entry.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 font-medium text-white">{entry.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{entry.ref}</td>
                                        <td className="px-4 py-3 text-gray-300">{entry.journal}</td>
                                        <td className="px-4 py-3 text-gray-300">{entry.partner || "-"}</td>
                                        <td className="px-4 py-3 text-white font-medium">${entry.amount.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                entry.status === "posted"
                                                    ? "bg-blue-500/20 text-blue-400"
                                                    : "bg-gray-500/20 text-gray-400"
                                            }`}>
                                                {entry.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showNewModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">New Journal Entry</h3>
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
                                    placeholder="e.g. Capital Injection or Expense Adjustment"
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
                                    <label className="block text-gray-300 mb-1 font-medium">Amount ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3.5 py-2 text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 mb-1 font-medium">Partner (Optional)</label>
                                    <input
                                        type="text"
                                        value={partner}
                                        onChange={(e) => setPartner(e.target.value)}
                                        placeholder="Partner name"
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3.5 py-2 text-white"
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
                                    Post Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
