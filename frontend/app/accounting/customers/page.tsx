"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState, useEffect } from "react";
import { DollarSign, Plus, X, CheckCircle2, Printer, Trash2, Edit3, Ban } from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";
import InvoiceReceiptModal from "@/components/accounting/InvoiceReceiptModal";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

type InvoiceLineItem = {
    description: string;
    qty: number;
    unitPrice: number;
    taxRate: number;
};

type Invoice = {
    id: string;
    customer: string;
    amount: number;
    subtotal?: number;
    taxTotal?: number;
    discount?: number;
    items?: InvoiceLineItem[];
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
    const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
    const [selectedReceiptInvoice, setSelectedReceiptInvoice] = useState<Invoice | null>(null);

    // New/Edit Invoice Form State
    const [customerName, setCustomerName] = useState("");
    const [items, setItems] = useState<InvoiceLineItem[]>([
        { description: "Consulting / Services", qty: 1, unitPrice: 0, taxRate: 0 },
    ]);
    const [discount, setDiscount] = useState("0");
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

    const appendAutoGlEntry = (entry: {
        ref: string;
        journal: string;
        partner: string;
        amount: number;
        debitAccount: string;
        creditAccount: string;
        category: string;
    }) => {
        try {
            const key = getEntityStorageKey("accounting_entries");
            const existing = JSON.parse(localStorage.getItem(key) || "[]");
            const year = new Date().getFullYear();
            const prefix = entry.journal === "Bank" ? "BNK1" : "INV";
            const newEntry = {
                id: `${prefix}/${year}/${String(existing.length + 1).padStart(3, "0")}`,
                date: new Date().toISOString().split("T")[0],
                ref: entry.ref,
                journal: entry.journal,
                partner: entry.partner,
                amount: entry.amount,
                debitAccount: entry.debitAccount,
                creditAccount: entry.creditAccount,
                category: entry.category,
                auto_gl: true,
                status: "posted",
            };
            localStorage.setItem(key, JSON.stringify([newEntry, ...existing]));
        } catch {}
    };

    const subtotal = items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
    const taxTotal = items.reduce(
        (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0) * ((Number(it.taxRate) || 0) / 100),
        0
    );
    const discountNum = Number(discount) || 0;
    const computedTotal = Math.max(0, +(subtotal + taxTotal - discountNum).toFixed(2));

    const resetForm = () => {
        setEditingInvoiceId(null);
        setCustomerName("");
        setItems([{ description: "Consulting / Services", qty: 1, unitPrice: 0, taxRate: 0 }]);
        setDiscount("0");
        setStatus("posted");
        setDate(new Date().toISOString().split("T")[0]);
        setDueDate(new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]);
    };

    const handleOpenEdit = (inv: Invoice) => {
        setEditingInvoiceId(inv.id);
        setCustomerName(inv.customer);
        setItems(
            inv.items && inv.items.length > 0
                ? inv.items
                : [{ description: "Services Rendered", qty: 1, unitPrice: inv.amount, taxRate: 0 }]
        );
        setDiscount(String(inv.discount || 0));
        setStatus(inv.status);
        setDate(inv.date);
        setDueDate(inv.due_date);
        setShowNewModal(true);
    };

    const handleSaveInvoice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName.trim() || computedTotal <= 0) return;

        if (editingInvoiceId) {
            const updated = invoices.map((inv) =>
                inv.id === editingInvoiceId
                    ? {
                          ...inv,
                          customer: customerName.trim(),
                          amount: computedTotal,
                          subtotal,
                          taxTotal,
                          discount: discountNum,
                          items,
                          status,
                          date,
                          due_date: dueDate,
                      }
                    : inv
            );
            saveInvoices(updated);
        } else {
            const year = new Date().getFullYear();
            const nextNum = String(invoices.length + 1).padStart(3, "0");
            const newId = `INV/${year}/${nextNum}`;
            const newInv: Invoice = {
                id: newId,
                customer: customerName.trim(),
                amount: computedTotal,
                subtotal,
                taxTotal,
                discount: discountNum,
                items,
                status,
                date,
                due_date: dueDate,
            };
            saveInvoices([newInv, ...invoices]);

            if (status === "posted" || status === "paid") {
                appendAutoGlEntry({
                    ref: `Invoice ${newId} Recognized`,
                    journal: "Customer Invoices",
                    partner: customerName.trim(),
                    amount: computedTotal,
                    debitAccount: "1200 Accounts Receivable",
                    creditAccount: "4000 Sales Revenue",
                    category: "income",
                });
            }
            if (status === "paid") {
                appendAutoGlEntry({
                    ref: `Payment Received for ${newId}`,
                    journal: "Bank",
                    partner: customerName.trim(),
                    amount: computedTotal,
                    debitAccount: "1010 Bank",
                    creditAccount: "1200 Accounts Receivable",
                    category: "asset",
                });
            }
        }

        resetForm();
        setShowNewModal(false);
    };

    const handleMarkPaid = (id: string) => {
        const target = invoices.find((i) => i.id === id);
        const updated = invoices.map((inv) => (inv.id === id ? { ...inv, status: "paid" } : inv));
        saveInvoices(updated);
        if (target && target.status !== "paid") {
            appendAutoGlEntry({
                ref: `Payment Received for ${target.id}`,
                journal: "Bank",
                partner: target.customer,
                amount: target.amount,
                debitAccount: "1010 Bank",
                creditAccount: "1200 Accounts Receivable",
                category: "asset",
            });
        }
    };

    const handleVoidInvoice = (id: string) => {
        if (!confirm(`Void invoice ${id}?`)) return;
        saveInvoices(invoices.map((inv) => (inv.id === id ? { ...inv, status: "void" } : inv)));
    };

    const handleDeleteInvoice = (id: string) => {
        if (!confirm(`Delete invoice ${id} permanently?`)) return;
        saveInvoices(invoices.filter((inv) => inv.id !== id));
    };

    const filteredInvoices = invoices.filter(
        (inv) =>
            inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#0F172A] overflow-x-hidden">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search invoices..."
                onSearchChange={setSearchTerm}
                onNewClick={() => {
                    resetForm();
                    setShowNewModal(true);
                }}
                newButtonLabel="New Invoice"
            />

            <div className="flex-1 overflow-auto p-4 sm:p-6 pb-24">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Customer Invoices</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {filteredInvoices.length} invoices • $
                                {filteredInvoices
                                    .filter((i) => i.status !== "void")
                                    .reduce((sum, i) => sum + i.amount, 0)
                                    .toLocaleString()}{" "}
                                total ({activeBranch?.name || "Isolated Entity"})
                            </p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowNewModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
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
                            onClick={() => {
                                resetForm();
                                setShowNewModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                        >
                            <Plus size={16} /> Create First Invoice
                        </button>
                    </div>
                ) : currentView === "list" ? (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-x-auto">
                        <table className="w-full min-w-[760px]">
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
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b border-gray-700 hover:bg-[#1E293B]/80 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{invoice.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{invoice.customer}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(invoice.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(invoice.due_date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${invoice.amount.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                                                    invoice.status === "paid"
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : invoice.status === "posted"
                                                        ? "bg-blue-500/20 text-blue-400"
                                                        : invoice.status === "void"
                                                        ? "bg-red-500/20 text-red-400"
                                                        : "bg-gray-500/20 text-gray-400"
                                                }`}
                                            >
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {invoice.status !== "paid" && invoice.status !== "void" && (
                                                    <button
                                                        onClick={() => handleMarkPaid(invoice.id)}
                                                        className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <CheckCircle2 size={14} /> Mark Paid
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setSelectedReceiptInvoice(invoice)}
                                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
                                                    title="View / Print PDF Receipt"
                                                >
                                                    <Printer size={13} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(invoice)}
                                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-300 hover:text-white transition-colors cursor-pointer"
                                                    title="Edit Invoice"
                                                >
                                                    <Edit3 size={13} />
                                                </button>
                                                {invoice.status !== "void" && (
                                                    <button
                                                        onClick={() => handleVoidInvoice(invoice.id)}
                                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-amber-300 transition-colors cursor-pointer"
                                                        title="Void Invoice"
                                                    >
                                                        <Ban size={13} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteInvoice(invoice.id)}
                                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                                                    title="Delete Invoice"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {["draft", "posted", "paid"].map((st) => (
                            <div key={st} className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 capitalize">{st}</h3>
                                <div className="space-y-3">
                                    {filteredInvoices
                                        .filter((i) => i.status === st)
                                        .map((invoice) => (
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
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl my-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">
                                {editingInvoiceId ? `Edit Invoice ${editingInvoiceId}` : "Create Customer Invoice"}
                            </h3>
                            <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveInvoice} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-gray-300 mb-1 font-medium">Customer Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="e.g. Acme Client"
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3.5 py-2 text-white"
                                />
                            </div>

                            {/* Line Items */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-gray-300 font-medium">Invoice Line Items *</label>
                                    <button
                                        type="button"
                                        onClick={() => setItems([...items, { description: "", qty: 1, unitPrice: 0, taxRate: 0 }])}
                                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                                    >
                                        <Plus size={13} /> Add Line
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#0F172A] p-2 rounded-lg border border-gray-800">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Item / Service"
                                                value={item.description}
                                                onChange={(e) => {
                                                    const copy = [...items];
                                                    copy[idx].description = e.target.value;
                                                    setItems(copy);
                                                }}
                                                className="col-span-5 bg-transparent border border-gray-700 rounded px-2 py-1 text-xs text-white"
                                            />
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                placeholder="Qty"
                                                value={item.qty}
                                                onChange={(e) => {
                                                    const copy = [...items];
                                                    copy[idx].qty = Number(e.target.value) || 0;
                                                    setItems(copy);
                                                }}
                                                className="col-span-2 bg-transparent border border-gray-700 rounded px-2 py-1 text-xs text-white"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                required
                                                placeholder="Price $"
                                                value={item.unitPrice || ""}
                                                onChange={(e) => {
                                                    const copy = [...items];
                                                    copy[idx].unitPrice = Number(e.target.value) || 0;
                                                    setItems(copy);
                                                }}
                                                className="col-span-2 bg-transparent border border-gray-700 rounded px-2 py-1 text-xs text-white"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                placeholder="Tax %"
                                                value={item.taxRate || ""}
                                                onChange={(e) => {
                                                    const copy = [...items];
                                                    copy[idx].taxRate = Number(e.target.value) || 0;
                                                    setItems(copy);
                                                }}
                                                className="col-span-2 bg-transparent border border-gray-700 rounded px-2 py-1 text-xs text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => items.length > 1 && setItems(items.filter((_, i) => i !== idx))}
                                                className="col-span-1 text-gray-500 hover:text-red-400 flex justify-center"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-gray-300 mb-1 font-medium">Discount ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
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

                            <div className="grid grid-cols-2 gap-3 items-center bg-[#0F172A] p-3 rounded-xl border border-gray-800">
                                <div>
                                    <label className="block text-gray-400 text-xs mb-1">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="posted">Posted (Auto-Posts GL)</option>
                                        <option value="paid">Paid (Auto-Posts Bank &amp; GL)</option>
                                    </select>
                                </div>
                                <div className="text-right space-y-0.5 text-xs">
                                    <div className="text-gray-400">Subtotal: ${subtotal.toFixed(2)} • Tax: ${taxTotal.toFixed(2)}</div>
                                    <div className="text-lg font-extrabold text-emerald-400">Total: ${computedTotal.toLocaleString()}</div>
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
                                    {editingInvoiceId ? "Update Invoice" : "Save Invoice"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedReceiptInvoice && (
                <InvoiceReceiptModal
                    invoice={{
                        ...selectedReceiptInvoice,
                        items: selectedReceiptInvoice.items?.map((it) => ({
                            name: it.description,
                            qty: it.qty,
                            price: it.unitPrice,
                        })),
                    }}
                    onClose={() => setSelectedReceiptInvoice(null)}
                    companyName={activeBranch?.name || "Beraxis Commercial Entity"}
                />
            )}
        </div>
    );
}
