"use client";
import { fetchAPI } from '@/lib/api';

import ManufacturingHeader from "@/components/manufacturing/ManufacturingHeader";
import { Plus, Wrench, Package, Clock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

type ProductionOrder = {
    id: string;
    name: string;
    product_id: string;
    product_qty: number;
    state: string;
    reservation_state: string;
    date_planned_start: string;
    product_name?: string;
};

type WorkCenter = {
    id: string;
    name: string;
    code: string;
    capacity: number;
    cost_per_hour: number;
};

type Product = {
    id: string;
    name: string;
};

type Bom = {
    id: string;
    code: string;
    product_id: string;
};

export default function ManufacturingPage() {
    const [orders, setOrders] = useState<ProductionOrder[]>([]);
    const [workcenters, setWorkcenters] = useState<WorkCenter[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [boms, setBoms] = useState<Bom[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'mo' | 'wc'>('mo');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New MO Form State
    const [selectedProductId, setSelectedProductId] = useState("");
    const [selectedBomId, setSelectedBomId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [plannedStart, setPlannedStart] = useState(new Date().toISOString().split('T')[0]);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [moRes, wcRes, prodRes, bomsRes] = await Promise.all([
                fetchAPI("/mrp/production"),
                fetchAPI("/mrp/workcenters"),
                fetchAPI("/inventory/products"),
                fetchAPI("/mrp/boms")
            ]);
            
            let loadedProducts: Product[] = [];
            if (prodRes.ok) {
                loadedProducts = await prodRes.json();
                setProducts(loadedProducts);
            }
            if (bomsRes.ok) setBoms(await bomsRes.json());
            if (wcRes.ok) setWorkcenters(await wcRes.json());
            
            if (moRes.ok) {
                const moData: ProductionOrder[] = await moRes.json();
                // Map product names
                const mappedData = moData.map(mo => ({
                    ...mo,
                    product_name: loadedProducts.find(p => p.id === mo.product_id)?.name || mo.product_name || "Enterprise Server X1"
                }));
                setOrders(mappedData);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const createOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !quantity || !plannedStart) return;

        setCreating(true);
        try {
            const res = await fetchAPI("/mrp/production", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: selectedProductId,
                    product_qty: quantity,
                    date_planned_start: new Date(plannedStart).toISOString(),
                    bom_id: selectedBomId || null,
                    state: "draft"
                })
            });
            if (res.ok) {
                setIsModalOpen(false);
                setSelectedProductId("");
                setSelectedBomId("");
                setQuantity(1);
                loadData();
            }
        } catch (err) {
            console.error("Error creating MO", err);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0B101E]">
            <ManufacturingHeader />

            <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full text-white">
                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-[#1E293B] rounded-lg p-1 w-fit border border-gray-800">
                    <button onClick={() => setActiveTab('mo')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'mo' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                        🏭 Manufacturing Orders
                    </button>
                    <button onClick={() => setActiveTab('wc')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'wc' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                        🛠️ Work Centers
                    </button>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">
                        {activeTab === 'mo' ? 'Manufacturing Overview' : 'Work Centers'}
                    </h2>
                    {activeTab === 'mo' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold shadow-lg shadow-orange-600/20 active:scale-95 text-sm transition-all"
                        >
                            <Plus size={16} /> New Order
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-[#1E293B] border border-gray-700 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-gray-400 text-sm">To Process</p>
                                    <p className="text-2xl font-bold text-white">{orders.filter(o => o.state === 'draft').length}</p>
                                </div>
                                <div className="bg-blue-500/20 p-2.5 rounded-lg text-blue-500"><Clock size={24} /></div>
                            </div>
                            <div className="bg-[#1E293B] border border-gray-700 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-gray-400 text-sm">In Progress</p>
                                    <p className="text-2xl font-bold text-white">{orders.filter(o => o.state === 'progress' || o.state === 'confirmed').length}</p>
                                </div>
                                <div className="bg-orange-500/20 p-2.5 rounded-lg text-orange-500"><Wrench size={24} /></div>
                            </div>
                            <div className="bg-[#1E293B] border border-gray-700 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-gray-400 text-sm">Completed</p>
                                    <p className="text-2xl font-bold text-white">{orders.filter(o => o.state === 'done').length}</p>
                                </div>
                                <div className="bg-green-500/20 p-2.5 rounded-lg text-green-500"><CheckCircle size={24} /></div>
                            </div>
                        </div>

                        {activeTab === 'mo' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        onClick={() => window.location.href = `/manufacturing/${order.id}`}
                                        className="bg-[#1E293B] border border-gray-700 rounded-2xl p-5 hover:border-orange-500 transition-colors cursor-pointer group shadow"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white group-hover:text-orange-400 truncate w-36 transition-colors">{order.name}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                order.state === 'done' ? 'bg-green-500/20 text-green-400' :
                                                order.state === 'confirmed' || order.state === 'progress' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-gray-700 text-gray-300'
                                            }`}>
                                                {order.state}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 mt-1">
                                            <Package size={14} className="text-orange-400" />
                                            <span className="font-semibold text-gray-300 truncate w-48">{order.product_name}</span>
                                        </div>
                                        <div className={`text-[9px] font-bold uppercase tracking-widest mb-4 ${
                                            order.reservation_state === 'assigned' ? 'text-green-400' : 'text-orange-400'
                                        }`}>
                                            Readiness: {order.reservation_state || 'Waiting'}
                                        </div>

                                        <div className="flex justify-between items-end border-t border-gray-800 pt-3">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase">Quantity</p>
                                                <p className="text-lg font-bold text-white">{order.product_qty}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-500 uppercase">Scheduled</p>
                                                <p className="text-sm text-gray-300 font-semibold">{new Date(order.date_planned_start).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {orders.length === 0 && (
                                    <div className="col-span-full text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl text-gray-500 italic">
                                        <Wrench size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-sm">No manufacturing orders yet. Click &quot;New Order&quot; to begin.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {workcenters.map(wc => (
                                    <div key={wc.id} className="galaxy-card p-5 border-t-2 border-orange-500 shadow">
                                        <h3 className="text-white font-bold mb-1">{wc.name}</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mb-4">{wc.code || 'WC-DEFAULT'}</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase">Capacity</p>
                                                <p className="text-sm text-white font-mono">{wc.capacity}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase">Cost/Hr</p>
                                                <p className="text-sm text-orange-400 font-mono">${wc.cost_per_hour}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {workcenters.length === 0 && (
                                     <div className="col-span-full text-center py-12 text-gray-500">No work centers configured.</div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MO Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-6">New Manufacturing Order</h3>
                        <form onSubmit={createOrder} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product to Produce</label>
                                <select 
                                    required 
                                    value={selectedProductId} 
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors text-sm"
                                >
                                    <option value="">Choose a product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quantity</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="1" 
                                        value={quantity} 
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Scheduled Date</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={plannedStart} 
                                        onChange={(e) => setPlannedStart(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill of Materials (BoM)</label>
                                <select 
                                    value={selectedBomId} 
                                    onChange={(e) => setSelectedBomId(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors text-sm"
                                >
                                    <option value="">Use default BoM...</option>
                                    {boms.filter(b => b.product_id === selectedProductId).map(b => (
                                        <option key={b.id} value={b.id}>{b.code || "BOM-DEFAULT"}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-400 hover:text-white font-bold text-sm">Cancel</button>
                                <button type="submit" disabled={creating || !selectedProductId} className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg">
                                    {creating ? "Creating..." : "Create Order"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
