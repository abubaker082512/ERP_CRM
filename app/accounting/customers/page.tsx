"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState, useEffect } from "react";
import { DollarSign, Plus, X, CheckCircle2 } from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

type Invoice = {
    id: string;
    customer: string;
    amount: number;
    status: string;
    date: string;
    due_date: string;
};

export default function AccountingCustomersPage() {
    const { activeBranch, getEntityStorageKey } = useBranchContext();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [currentView, setCurrentView] = useState<ViewType>("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [showNewModal, setShowNewModal] = useState(false);

    // New Invoice Form State
    const [customerName, setCustomerName] = useState("");
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState("posted");
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]);

    useEffect(() => {
        try {
            const key = getEntityStorageKey("accounting_invoices");
            const saved = localStorage.getItem(key);
            setInvoices(saved ? JSON.parse(saved) : []);
        } catch {
            setInvoices([]);
        }
    }, [activeBranch, getEntityStorageKey]);

    const saveInvoices = (updated: Invoice[]) => {
        setInvoices(updated);
        try {
            localStorage.setItem(getEntityStorageKey("accounting_invoices"), JSON.stringify(updated));
        } catch {}
    };

    const handleCreateInvoice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName.trim() || !amount) return;

        const year = new Date().getFullYear();
        const nextNum = String(invoices.length + 1).padStart(3, "0");
        const newInv: Invoice = {
            id: `INV/${year}/${nextNum}`,
            customer: customerName.trim(),
            amount: parseFloat(amount) || 0,
            status,
            date,
            due_date: dueDate,
        };

        saveInvoices([newInv, ...invoices]);
        setCustomerName("");
        setAmount("");
        setShowNewModal(false);
    };

    const handleMarkPaid = (id: string) => {
        const updated = invoices.map(inv => (inv.id === id ? { ...inv, status: "paid" } : inv));
        saveInvoices(updated);
    };

    const filteredInvoices = invoices.filter(
        inv =>
            inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search invoices..."
                onSearchChange={setSearchTerm}
                onNewClick={() => setShowNewModal(true)}
                newButtonLabel="New Invoice"
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Customer Invoices</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {filteredInvoices.length} invoices • ${filteredInvoices.reduce((sum, i) => sum + i.amount, 0).toLocaleString()} total ({activeBranch?.name || "Isolated Entity"})
                            </p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus size={16} /> New Invoice
                    </button>
                </div>

                {filteredInvoices.length === 0 ? (
                    <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-12 text-center">
                        <h3 className="text-lg font-semibold text-white mb-2">No Customer Invoices Yet</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Your entity ledger starts completely clean with zero pre-filled records. Create your first customer invoice below.
                        </p>
                        <button
                            onClick={() => setShowNewModal(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                        >
                            <Plus size={16} /> Create First Invoice
                        </button>
                    </div>
                ) : currentView === "list" ? (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Number</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Invoice Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Due Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map(invoice => (
                                    <tr key={invoice.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{invoice.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{invoice.customer}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(invoice.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(invoice.due_date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${invoice.amount.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                invoice.status === "paid"
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : invoice.status === "posted"
                                                    ? "bg-blue-500/20 text-blue-400"
                                                    : "bg-gray-500/20 text-gray-400"
                                            }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {invoice.status !== "paid" ? (
                                                <button
                                                    onClick={() => handleMarkPaid(invoice.id)}
                                                    className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <CheckCircle2 size={14} /> Mark Paid
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-500">Paid</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {["draft", "posted", "paid"].map(st => (
                            <div key={st} className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 capitalize">{st}</h3>
                                <div className="space-y-3">
                                    {filteredInvoices.filter(i => i.status === st).map(invoice => (
                                        <div key={invoice.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium text-white">{invoice.id}</span>
                                                <span className="text-green-400 font-semibold">${invoice.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-2">{invoice.customer}</div>
                                            <div className="text-xs text-gray-500">Due: {new Date(invoice.due_date).toLocaleDateString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showNewModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Create Customer Invoice</h3>
                            <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateInvoice} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-gray-300 mb-1 font-medium">Customer Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="e.g. Client Name"
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3.5 py-2 text-white"
                                />
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
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 mb-1 font-medium">Invoice Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1 font-medium">Due Date</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1 font-medium">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3.5 py-2 text-white"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="posted">Posted</option>
                                    <option value="paid">Paid</option>
                                </select>
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
                                    Save Invoice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
