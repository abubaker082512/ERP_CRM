"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { exportToCSV, exportToExcel } from "@/lib/exportUtils";
import {
    ShoppingCart,
    FileText,
    DollarSign,
    Calendar,
    Plus,
    Building2,
    CheckCircle2,
    Clock,
    Truck,
    Download,
    FileSpreadsheet,
    Printer,
    Search,
    Filter,
    ArrowRight,
    X,
    Trash2,
    Sparkles,
    Check
} from "lucide-react";

const MENU_ITEMS = [
    { name: "RFQs & Orders", href: "/purchase" },
    { name: "Purchase Orders", href: "/purchase/orders" },
    { name: "Vendors Directory", href: "/purchase/vendors" },
    { name: "Products & Pricing", href: "/purchase/products" },
    { name: "Reporting", href: "/purchase/reporting" },
    { name: "Configuration", href: "/purchase/configuration" },
];

export type PurchaseRecord = {
    id: string;
    name: string;
    vendor_name: string;
    amount_total: number;
    state: "draft" | "sent" | "confirmed" | "received" | "done" | "cancel";
    date_order: string;
    lines_count?: number;
    payment_status?: string;
    delivery_status?: string;
    notes?: string;
};

const SEEDED_PURCHASES: PurchaseRecord[] = [
    {
        id: "PO/2026/001",
        name: "RFQ-2026-001",
        vendor_name: "Zebra Technologies Ltd (RFID)",
        amount_total: 18500,
        state: "confirmed",
        date_order: "2026-03-08",
        lines_count: 3,
        payment_status: "Paid",
        delivery_status: "Shipped",
        notes: "Warehouse handheld scanner batch with firmware v4.2"
    },
    {
        id: "PO/2026/002",
        name: "RFQ-2026-002",
        vendor_name: "Dell Technologies EMEA",
        amount_total: 42000,
        state: "sent",
        date_order: "2026-03-09",
        lines_count: 5,
        payment_status: "Pending",
        delivery_status: "Processing",
        notes: "PowerEdge R750 cloud compute servers for regional deployment"
    },
    {
        id: "PO/2026/003",
        name: "RFQ-2026-003",
        vendor_name: "Cisco Systems Pakistan",
        amount_total: 12400,
        state: "done",
        date_order: "2026-03-05",
        lines_count: 2,
        payment_status: "Paid",
        delivery_status: "Delivered",
        notes: "Catalyst 9300 enterprise switches and optic patch cables"
    },
    {
        id: "PO/2026/004",
        name: "RFQ-2026-004",
        vendor_name: "Master Packaging Karachi",
        amount_total: 4800,
        state: "draft",
        date_order: "2026-03-10",
        lines_count: 1,
        payment_status: "Draft",
        delivery_status: "Pending",
        notes: "Custom corrugated shipping boxes with Beraxis logo branding"
    }
];

export default function PurchasePage() {
    const router = useRouter();
    const [purchases, setPurchases] = useState<PurchaseRecord[]>(SEEDED_PURCHASES);
    const [currentView, setCurrentView] = useState<ViewType>("list");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Quick Add Purchase Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newVendor, setNewVendor] = useState("Zebra Technologies Ltd (RFID)");
    const [newTotal, setNewTotal] = useState("5000");
    const [newNotes, setNewNotes] = useState("");
    const [toastMsg, setToastMsg] = useState("");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 4500);
    };

    useEffect(() => {
        loadPurchases();
    }, []);

    const loadPurchases = async () => {
        try {
            setLoading(true);
            const res = await fetchAPI("/purchase");
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setPurchases(data);
                }
            }
        } catch {
            // Keep seeded data
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePurchase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVendor.trim()) return;

        const newRecord: PurchaseRecord = {
            id: `PO/2026/00${purchases.length + 1}`,
            name: `RFQ-2026-00${purchases.length + 1}`,
            vendor_name: newVendor.trim(),
            amount_total: parseFloat(newTotal) || 0,
            state: "draft",
            date_order: new Date().toISOString().slice(0, 10),
            lines_count: 1,
            payment_status: "Draft",
            delivery_status: "Pending",
            notes: newNotes.trim()
        };

        setPurchases([newRecord, ...purchases]);
        setIsAddModalOpen(false);
        setNewNotes("");
        showToast(`🎉 Purchase order ${newRecord.id} generated for ${newRecord.vendor_name}!`);
    };

    const handleStatusChange = (id: string, nextState: PurchaseRecord["state"]) => {
        setPurchases(purchases.map(p => p.id === id ? { ...p, state: nextState } : p));
        showToast(`Purchase order ${id} status updated to ${nextState.toUpperCase()}`);
    };

    const handleExportCSV = () => {
        const headers = ["PO #", "Vendor", "Total ($)", "Status", "Order Date", "Notes"];
        const rows = purchases.map(p => [
            p.id,
            p.vendor_name,
            p.amount_total,
            p.state,
            p.date_order,
            p.notes || ""
        ]);
        exportToCSV(`Purchase_Orders_${new Date().toISOString().slice(0, 10)}`, headers, rows);
        showToast("📊 CSV file exported!");
    };

    const handleExportExcel = () => {
        const headers = ["PO #", "Vendor", "Total ($)", "Status", "Order Date", "Notes"];
        const rows = purchases.map(p => [
            p.id,
            p.vendor_name,
            p.amount_total,
            p.state,
            p.date_order,
            p.notes || ""
        ]);
        exportToExcel(`Purchase_Orders_${new Date().toISOString().slice(0, 10)}`, headers, rows, "PurchaseOrders");
        showToast("📊 Excel file exported!");
    };

    const filteredPurchases = purchases.filter(p => {
        const matchesStatus = statusFilter === "all" || p.state === statusFilter;
        const matchesSearch = p.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
            p.id.toLowerCase().includes(search.toLowerCase()) ||
            (p.notes || "").toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const totalSpend = purchases.reduce((sum, p) => sum + (p.amount_total || 0), 0);
    const confirmedSpend = purchases.filter(p => p.state === "confirmed" || p.state === "done").reduce((sum, p) => sum + p.amount_total, 0);

    const getStateBadge = (state: PurchaseRecord["state"]) => {
        switch (state) {
            case "confirmed": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
            case "done": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
            case "sent": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            case "received": return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
            case "cancel": return "bg-rose-500/20 text-rose-300 border-rose-500/30";
            default: return "bg-amber-500/20 text-amber-300 border-amber-500/30";
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Purchase"
                moduleIcon={<ShoppingCart size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search vendor, PO #, items..."
                onNewClick={() => setIsAddModalOpen(true)}
                newButtonText="+ New Purchase RFQ"
            />

            {toastMsg && (
                <div className="fixed top-16 right-6 z-50 bg-[#1E293B] border border-purple-500/40 text-purple-200 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-2xl backdrop-blur-md animate-in fade-in">
                    <Sparkles size={16} className="text-purple-400 shrink-0" />
                    <span>{toastMsg}</span>
                </div>
            )}

            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
                {/* Metrics Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#1E293B] border border-gray-700/80 p-4 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Total Purchasing Volume</span>
                            <DollarSign size={16} className="text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-white font-mono">
                            ${totalSpend.toLocaleString()}
                        </div>
                        <span className="text-[11px] text-gray-400">Across {purchases.length} vendor orders</span>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-700/80 p-4 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Confirmed Orders</span>
                            <CheckCircle2 size={16} className="text-emerald-400" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-400 font-mono">
                            ${confirmedSpend.toLocaleString()}
                        </div>
                        <span className="text-[11px] text-emerald-400/80 font-medium">Ready for receipt & billing</span>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-700/80 p-4 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Pending Inbound Shipments</span>
                            <Truck size={16} className="text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white font-mono">
                            {purchases.filter(p => p.state === "sent" || p.state === "confirmed").length}
                        </div>
                        <span className="text-[11px] text-blue-300">Awaiting warehouse dock intake</span>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-700/80 p-4 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Draft Requests (RFQs)</span>
                            <Clock size={16} className="text-amber-400" />
                        </div>
                        <div className="text-2xl font-bold text-white font-mono">
                            {purchases.filter(p => p.state === "draft").length}
                        </div>
                        <span className="text-[11px] text-amber-300">In vendor negotiation</span>
                    </div>
                </div>

                {/* Controls Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E293B] p-4 rounded-2xl border border-gray-700/80">
                    <div className="flex items-center gap-2 flex-wrap">
                        {["all", "draft", "sent", "confirmed", "received", "done"].map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    statusFilter === st
                                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={handleExportCSV}
                            className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Export to CSV"
                        >
                            <Download size={14} />
                            <span>CSV</span>
                        </button>

                        <button
                            onClick={handleExportExcel}
                            className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Export to Excel"
                        >
                            <FileSpreadsheet size={14} />
                            <span>Excel</span>
                        </button>

                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                        >
                            <Plus size={15} />
                            <span>Add Purchase Order</span>
                        </button>
                    </div>
                </div>

                {/* View Render */}
                {currentView === "list" ? (
                    <div className="bg-[#1E293B] rounded-2xl border border-gray-700/80 overflow-hidden shadow-2xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#0F172A] border-b border-gray-700 text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
                                <tr>
                                    <th className="px-5 py-3.5">PO Number</th>
                                    <th className="px-5 py-3.5">Vendor</th>
                                    <th className="px-5 py-3.5">Total Amount</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Payment</th>
                                    <th className="px-5 py-3.5">Order Date</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredPurchases.map((po) => (
                                    <tr key={po.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-4 font-mono font-bold text-purple-400">
                                            {po.id}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-white">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-gray-400" />
                                                <span>{po.vendor_name}</span>
                                            </div>
                                            {po.notes && (
                                                <span className="text-[11px] text-gray-400 block mt-0.5">{po.notes}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 font-mono font-bold text-white text-sm">
                                            ${po.amount_total.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStateBadge(po.state)}`}>
                                                {po.state}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-300">
                                            <span className={`text-[11px] font-semibold ${po.payment_status === "Paid" ? "text-emerald-400" : "text-amber-400"}`}>
                                                {po.payment_status || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-400 font-mono">
                                            {po.date_order}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {po.state === "draft" && (
                                                    <button
                                                        onClick={() => handleStatusChange(po.id, "sent")}
                                                        className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                                    >
                                                        Send RFQ
                                                    </button>
                                                )}
                                                {po.state === "sent" && (
                                                    <button
                                                        onClick={() => handleStatusChange(po.id, "confirmed")}
                                                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                                    >
                                                        Confirm PO
                                                    </button>
                                                )}
                                                {po.state === "confirmed" && (
                                                    <button
                                                        onClick={() => handleStatusChange(po.id, "done")}
                                                        className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                                    >
                                                        Mark Received
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* KANBAN VIEW */
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {(["draft", "sent", "confirmed", "done"] as const).map((stage) => {
                            const stageItems = filteredPurchases.filter(p => p.state === stage);
                            return (
                                <div key={stage} className="bg-[#1E293B]/60 border border-gray-700/80 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-700 text-xs font-bold uppercase tracking-wider text-gray-300">
                                        <span>{stage}</span>
                                        <span className="bg-[#0F172A] px-2 py-0.5 rounded-full text-purple-400 font-mono">
                                            {stageItems.length}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {stageItems.map((po) => (
                                            <div key={po.id} className="bg-[#1E293B] border border-gray-700 hover:border-purple-500/50 p-3.5 rounded-xl space-y-2 shadow-sm transition-all">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-mono font-bold text-purple-400">{po.id}</span>
                                                    <span className="text-gray-400 text-[10px]">{po.date_order}</span>
                                                </div>
                                                <div className="text-xs font-semibold text-white">{po.vendor_name}</div>
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
                                                    <span className="font-bold text-white font-mono">${po.amount_total.toLocaleString()}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStateBadge(po.state)}`}>{po.state}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* QUICK ADD PURCHASE MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                    <div className="bg-[#141C2E] border border-purple-500/30 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                                    <ShoppingCart size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">New Purchase Order / RFQ</h3>
                                    <p className="text-xs text-gray-400">Create and dispatch request to supplier</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePurchase} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Vendor / Supplier Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newVendor}
                                    onChange={(e) => setNewVendor(e.target.value)}
                                    placeholder="e.g. Dell Technologies EMEA"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Estimated Total ($) *</label>
                                <input
                                    type="number"
                                    required
                                    value={newTotal}
                                    onChange={(e) => setNewTotal(e.target.value)}
                                    placeholder="e.g. 15000"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Items / Specifications / Notes</label>
                                <textarea
                                    rows={3}
                                    value={newNotes}
                                    onChange={(e) => setNewNotes(e.target.value)}
                                    placeholder="Order items, hardware SKUs, delivery dock instructions..."
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="flex gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                                >
                                    Create Purchase Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
