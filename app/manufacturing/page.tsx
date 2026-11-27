"use client";
import { fetchAPI } from '@/lib/api';

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState, useEffect } from "react";
import { Wrench, Settings, Package, Clock, AlertTriangle, Plus, X } from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

const MENU_ITEMS = [
    { name: "Manufacturing Orders", href: "/manufacturing" },
    { name: "Work Orders", href: "/manufacturing/work-orders" },
    { name: "Bill of Materials", href: "/manufacturing/bom" },
    { name: "Reporting", href: "/manufacturing/reporting" },
    { name: "Configuration", href: "/manufacturing/configuration" },
];

type ManufacturingOrder = {
    id: string;
    product: string;
    quantity: number;
    status: string;
    deadline: string;
    source: string;
};

const mockOrders: ManufacturingOrder[] = [];

export default function ManufacturingPage() {
    const { activeBranch, userEmail, getEntityStorageKey } = useBranchContext();
    const [orders, setOrders] = useState<ManufacturingOrder[]>(mockOrders);
    const [currentView, setCurrentView] = useState<ViewType>("list");
    const [showNewModal, setShowNewModal] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [batchSector, setBatchSector] = useState<"manufacturing" | "agriculture_agritech">("manufacturing");
    const [moForm, setMoForm] = useState({ product: "", quantity: "10", deadline: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0], source: "SO-001" });

    useEffect(() => {
        try {
            const saved = localStorage.getItem(getEntityStorageKey("mrp_orders"));
            if (saved) setOrders(JSON.parse(saved));
        } catch {}
        if (activeBranch?.id) {
            let email = "";
            try { email = JSON.parse(localStorage.getItem("user") || "{}").email || ""; } catch {}
            fetch(`/api/industry-ops?company_id=${encodeURIComponent(activeBranch.id)}&email=${encodeURIComponent(email)}&domain=manufacturing`, { cache: "no-store" })
                .then((r) => (r.ok ? r.json() : null))
                .then((d) => {
                    if (d && Array.isArray(d.items) && d.items.length > 0) {
                        setOrders(d.items);
                        try { localStorage.setItem(getEntityStorageKey("mrp_orders"), JSON.stringify(d.items)); } catch {}
                    }
                })
                .catch(() => {});
        }
    }, [activeBranch, getEntityStorageKey]);

    const handleCreateMO = (e: React.FormEvent) => {
        e.preventDefault();
        if (!moForm.product.trim()) return;
        const newMO: ManufacturingOrder = {
            id: `MO-${String(orders.length + 1).padStart(3, "0")}`,
            product: moForm.product.trim(),
            quantity: Number(moForm.quantity) || 1,
            status: "confirmed",
            deadline: moForm.deadline,
            source: moForm.source.trim() || "Manual",
        };
        const next = [newMO, ...orders];
        setOrders(next);
        try {
            localStorage.setItem(getEntityStorageKey("mrp_orders"), JSON.stringify(next));
            if (activeBranch?.id) {
                let email = "";
                try { email = JSON.parse(localStorage.getItem("user") || "{}").email || ""; } catch {}
                fetch("/api/industry-ops", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "save_collection", company_id: activeBranch.id, email, domain: "manufacturing", items: next }),
                }).catch(() => {});
            }
        } catch {}
        setMoForm({ product: "", quantity: "10", deadline: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0], source: "SO-001" });
        setShowNewModal(false);
    };

    const handleCompleteMO = async (order: ManufacturingOrder) => {
        try {
            const res = await fetch("/api/industry-ops", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "complete_manufacturing_order",
                    company_id: activeBranch?.id,
                    email: userEmail,
                    industryId: batchSector,
                    id: order.id,
                    product: order.product,
                    quantity: order.quantity,
                    source: order.source,
                }),
            });
            const data = await res.json();
            const next = orders.map((o) => (o.id === order.id ? { ...o, status: "done" } : o));
            setOrders(next);
            try { localStorage.setItem(getEntityStorageKey("mrp_orders"), JSON.stringify(next)); } catch {}
            if (data.success) {
                setToastMsg(`Completed ${order.id}: Consumed BOM raw inputs & stocked +${order.quantity} "${order.product}" into Live Inventory!`);
                setTimeout(() => setToastMsg(""), 5000);
            }
        } catch {}
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Manufacturing"
                moduleIcon={<Wrench size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search orders..."
                onNewClick={() => setShowNewModal(true)}
                newButtonLabel="New MO"
            />

            <div className="flex-1 overflow-auto p-6">
                {toastMsg && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                        {toastMsg}
                    </div>
                )}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">
                                {batchSector === "agriculture_agritech" ? "AgriTech Harvest, Milling & Solar Batch Runs" : "Manufacturing & Assembly Orders"}
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">{orders.length} active production batches</p>
                        </div>
                        <div className="flex bg-[#1E293B] p-1 rounded-lg border border-gray-700 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => setBatchSector("manufacturing")}
                                className={`px-3 py-1 rounded cursor-pointer ${batchSector === "manufacturing" ? "bg-purple-600 text-white" : "text-gray-400"}`}
                            >
                                Factory MRP
                            </button>
                            <button
                                type="button"
                                onClick={() => setBatchSector("agriculture_agritech")}
                                className={`px-3 py-1 rounded cursor-pointer ${batchSector === "agriculture_agritech" ? "bg-emerald-600 text-white" : "text-gray-400"}`}
                            >
                                AgriTech / Solar Batch
                            </button>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus size={16} /> New MO
                    </button>
                </div>

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Reference</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Product</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Quantity</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Source</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Deadline</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{order.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{order.product}</td>
                                        <td className="px-4 py-3 text-white font-medium">{order.quantity}</td>
                                        <td className="px-4 py-3 text-gray-400">{order.source}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(order.deadline).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                                    order.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 space-x-2">
                                            {order.status !== "done" ? (
                                                <button
                                                    onClick={() => handleCompleteMO(order)}
                                                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                                                >
                                                    ✓ Complete &amp; Stock FG
                                                </button>
                                            ) : (
                                                <span className="text-xs text-emerald-400 font-semibold">Stocked in Inventory</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['confirmed', 'in_progress', 'done'].map(status => (
                            <div key={status} className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 capitalize">{status.replace('_', ' ')}</h3>
                                <div className="space-y-3">
                                    {orders.filter(o => o.status === status).map(order => (
                                        <div key={order.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium text-white">{order.product}</span>
                                                <span className="text-blue-400 font-semibold">{order.quantity} units</span>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-2">{order.id}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={12} />
                                                Deadline: {new Date(order.deadline).toLocaleDateString()}
                                            </div>
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
                            <h3 className="text-lg font-bold">New Manufacturing Order</h3>
                            <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateMO} className="space-y-3 text-sm">
                            <div>
                                <label className="block text-gray-300 mb-1">Product to Manufacture *</label>
                                <input type="text" required value={moForm.product} onChange={e => setMoForm({ ...moForm, product: e.target.value })} placeholder="e.g. Custom Server Rack" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">Quantity</label>
                                    <input type="number" min="1" value={moForm.quantity} onChange={e => setMoForm({ ...moForm, quantity: e.target.value })} className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Deadline</label>
                                    <input type="date" value={moForm.deadline} onChange={e => setMoForm({ ...moForm, deadline: e.target.value })} className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300">Cancel</button>
                                <button type="submit" className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold">Create MO</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
