"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import InventoryHeader from '@/components/inventory/InventoryHeader';
import { Package, MoreHorizontal, TrendingUp, AlertTriangle, Warehouse, RefreshCw, Plus, Search, X, Loader2, Barcode } from 'lucide-react';
import Link from 'next/link';

type StockPicking = {
    id: string;
    name: string;
    state: string;
    picking_type_code: string;
    scheduled_date: string;
    origin: string;
};

type StockQuant = {
    id: string;
    product_id: string;
    location_id: string;
    quantity: number;
    reserved_quantity: number;
};

type Product = {
    id: string;
    name: string;
    sku: string;
    list_price: number;
    cost_price: number;
    description?: string;
};

const STATE_COLORS: Record<string, string> = {
    draft:   'bg-gray-500/20 text-gray-400',
    waiting: 'bg-yellow-500/20 text-yellow-400',
    ready:   'bg-blue-500/20 text-blue-400',
    done:    'bg-green-500/20 text-green-400',
    cancel:  'bg-red-500/20 text-red-400',
};

export default function InventoryPage() {
    const [pickings, setPickings] = useState<StockPicking[]>([]);
    const [quants, setQuants] = useState<StockQuant[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'moves' | 'stock' | 'products'>('overview');
    
    // Product Search & Add States
    const [prodSearch, setProdSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newSku, setNewSku] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [newCost, setNewCost] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newQty, setNewQty] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pickingsRes, quantsRes, productsRes] = await Promise.all([
                fetchAPI("/inventory/pickings"),
                fetchAPI("/inventory/quants"),
                fetchAPI("/inventory/products")
            ]);
            if (pickingsRes.ok) {
                const data = await pickingsRes.json();
                setPickings(Array.isArray(data) ? data : []);
            }
            if (quantsRes.ok) {
                const data = await quantsRes.json();
                setQuants(Array.isArray(data) ? data : []);
            }
            if (productsRes.ok) {
                const data = await productsRes.json();
                setProducts(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Inventory fetch failed", err);
            setPickings([]);
            setQuants([]);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getPickingsCount = (type: string) => {
        return pickings.filter(p => p.picking_type_code === type && p.state !== 'done' && p.state !== 'cancel').length;
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError("");
        if (!newName.trim() || !newPrice) return;

        setAddLoading(true);
        try {
            const res = await fetchAPI("/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName.trim(),
                    list_price: parseFloat(newPrice),
                    cost_price: newCost ? parseFloat(newCost) : 0.0,
                    sku: newSku.trim() || undefined,
                    description: newDesc.trim() || undefined,
                    quantity_on_hand: newQty ? parseInt(newQty) : 0
                })
            });

            if (res.ok) {
                setIsAddOpen(false);
                setNewName("");
                setNewSku("");
                setNewPrice("");
                setNewCost("");
                setNewDesc("");
                setNewQty("");
                // Reload list
                fetchData();
            } else {
                const err = await res.json().catch(() => ({ detail: "Failed to create product" }));
                setAddError(err.detail || "Failed to create product");
            }
        } catch (err: any) {
            setAddError(err.message || "Network error");
        } finally {
            setAddLoading(false);
        }
    };

    const getProductStock = (prodId: string) => {
        return quants.filter(q => q.product_id === prodId).reduce((sum, q) => sum + (q.quantity || 0), 0);
    };

    const operations = [
        { id: 1, name: 'Receipts', warehouse: 'Main Warehouse', count: getPickingsCount('incoming'), color: 'text-blue-500', icon: '📥' },
        { id: 2, name: 'Internal Transfers', warehouse: 'Main Warehouse', count: getPickingsCount('internal'), color: 'text-orange-500', icon: '🔄' },
        { id: 3, name: 'Delivery Orders', warehouse: 'Main Warehouse', count: getPickingsCount('outgoing'), color: 'text-green-500', icon: '📦' },
        { id: 4, name: 'Returns', warehouse: 'Main Warehouse', count: 0, color: 'text-red-500', icon: '↩️' },
        { id: 5, name: 'Manufacturing', warehouse: 'Main Warehouse', count: 0, color: 'text-purple-500', icon: '🏭' },
    ];

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
        (p.sku && p.sku.toLowerCase().includes(prodSearch.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex-1 overflow-auto p-6">
                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-[#1E293B] rounded-lg p-1 w-fit">
                    {(['overview', 'moves', 'stock', 'products'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                                activeTab === tab
                                    ? 'bg-purple-600 text-white shadow'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab === 'overview' ? '📊 Overview' : tab === 'moves' ? '🔀 Transfers' : tab === 'stock' ? '📦 Stock Levels' : '🏷️ Products'}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-200 mb-6">Inventory Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {operations.map((op) => (
                                 <div key={op.id} className="galaxy-card p-5 cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-2xl mb-2">{op.icon}</div>
                                            <h3 className={`font-semibold text-base ${op.color}`}>{op.name}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">{op.warehouse}</p>
                                        </div>
                                        <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('moves')}
                                        className="w-full bg-purple-600/10 hover:bg-purple-600 border border-purple-600/30 hover:border-purple-600 text-purple-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                    >
                                        {op.count} To Process
                                    </button>
                                </div>
                            ))}
                            
                            <div className="galaxy-card p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-green-500/20 p-2 rounded-lg">
                                        <TrendingUp className="text-green-400" size={20} />
                                    </div>
                                    <h3 className="font-semibold text-gray-200">Stock Movements</h3>
                                </div>
                                <p className="text-3xl font-bold text-white">{loading ? '...' : pickings.length}</p>
                                <p className="text-xs text-gray-400 mt-1">Total recorded transfers</p>
                            </div>
                            
                            <div className="galaxy-card p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-blue-500/20 p-2 rounded-lg">
                                        <Package className="text-blue-400" size={20} />
                                    </div>
                                    <h3 className="font-semibold text-gray-200">Products Catalog</h3>
                                </div>
                                <p className="text-3xl font-bold text-white">{loading ? '...' : products.length}</p>
                                <p className="text-xs text-gray-400 mt-1">Total items registered</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'moves' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-200">Stock Transfers</h2>
                            <button
                                onClick={fetchData}
                                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
                            >
                                <RefreshCw size={14} /> Refresh
                            </button>
                        </div>
                        <div className="galaxy-card overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-800 bg-[#0F172A]">
                                        <th className="px-6 py-3 text-left">Reference</th>
                                        <th className="px-6 py-3 text-left">Product ID</th>
                                        <th className="px-6 py-3 text-right">Quantity</th>
                                        <th className="px-6 py-3 text-center">State</th>
                                        <th className="px-6 py-3 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                                    ) : pickings.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No stock pickings found</td></tr>
                                    ) : pickings.map(picking => (
                                        <tr key={picking.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                                            <td className="px-6 py-4">
                                                <Link href={`/inventory/picking/${picking.id}`} className="text-purple-400 hover:underline font-medium">
                                                    {picking.name || '—'}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 uppercase text-[10px] tracking-widest font-bold">{picking.picking_type_code}</td>
                                            <td className="px-6 py-4 text-right text-white font-mono">{picking.origin || '—'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${STATE_COLORS[picking.state] || STATE_COLORS.draft}`}>
                                                    {picking.state}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{picking.scheduled_date ? new Date(picking.scheduled_date).toLocaleDateString() : 'Draft'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'stock' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-200 mb-6">Current Stock Levels</h2>
                        <div className="galaxy-card overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-800 bg-[#0F172A]">
                                        <th className="px-6 py-3 text-left">Product ID</th>
                                        <th className="px-6 py-3 text-left">Location ID</th>
                                        <th className="px-6 py-3 text-right">On Hand</th>
                                        <th className="px-6 py-3 text-right">Reserved</th>
                                        <th className="px-6 py-3 text-right">Available</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                                    ) : quants.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No stock data found</td></tr>
                                    ) : quants.map(q => (
                                        <tr key={q.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                                            <td className="px-6 py-4">
                                                <Link href={`/inventory/products/${q.product_id}`} className="text-purple-400 hover:underline font-mono text-xs">
                                                    {q.product_id?.substring(0, 8)}...
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 font-mono text-xs">{q.location_id?.substring(0, 8)}...</td>
                                            <td className="px-6 py-4 text-right font-bold text-white">{q.quantity}</td>
                                            <td className="px-6 py-4 text-right text-yellow-400">{q.reserved_quantity}</td>
                                            <td className="px-6 py-4 text-right text-green-400">{q.quantity - q.reserved_quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search products by name or SKU/barcode..." 
                                    value={prodSearch}
                                    onChange={e => setProdSearch(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:border-purple-500 text-sm shadow-sm"
                                />
                            </div>
                            <button 
                                onClick={() => setIsAddOpen(true)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95 flex items-center gap-2 w-fit"
                            >
                                <Plus size={16} /> Add Product
                            </button>
                        </div>

                        <div className="galaxy-card overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-800 bg-[#0F172A]">
                                        <th className="px-6 py-4 text-left">Product Name</th>
                                        <th className="px-6 py-4 text-left">SKU / Barcode</th>
                                        <th className="px-6 py-4 text-right">Sale Price</th>
                                        <th className="px-6 py-4 text-right">Cost Price</th>
                                        <th className="px-6 py-4 text-right">Stock On Hand</th>
                                        <th className="px-6 py-4 text-center">Trace</th>
                                      </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                                    ) : filteredProducts.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No products found. Click 'Add Product' to create one.</td></tr>
                                    ) : filteredProducts.map(p => (
                                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-gray-200">{p.name}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-400">{p.sku || '—'}</td>
                                            <td className="px-6 py-4 text-right font-medium text-green-400">${(p.list_price || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-gray-400">${(p.cost_price || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-bold text-white">{getProductStock(p.id)} units</td>
                                            <td className="px-6 py-4 text-center">
                                                <Link 
                                                    href={`/inventory/products/${p.id}`}
                                                    className="bg-purple-600/10 hover:bg-purple-600 border border-purple-600/20 text-purple-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-block"
                                                >
                                                    Audit Trail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1A2236] rounded-2xl p-6 w-full max-w-lg border border-white/8 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-white">Create Detailed Product</h3>
                                <p className="text-gray-500 text-xs mt-0.5">Register a new product in inventory and accounting catalogs</p>
                            </div>
                            <button onClick={() => { setIsAddOpen(false); setAddError(""); }} className="text-gray-500 hover:text-white p-1 rounded-xl hover:bg-white/5">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Product Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none transition-all"
                                    placeholder="e.g. Dell Latitude 5420 Laptop"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">SKU / Barcode</label>
                                    <input
                                        type="text"
                                        value={newSku}
                                        onChange={e => setNewSku(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none transition-all"
                                        placeholder="e.g. 190198273412"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Initial Quantity On Hand</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newQty}
                                        onChange={e => setNewQty(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none transition-all"
                                        placeholder="e.g. 50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Sales Price ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={newPrice}
                                        onChange={e => setNewPrice(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none transition-all"
                                        placeholder="799.99"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Cost Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newCost}
                                        onChange={e => setNewCost(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none transition-all"
                                        placeholder="450.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Internal Notes / Description</label>
                                <textarea
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    rows={3}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none transition-all resize-none"
                                    placeholder="Enter details, specs, or tracking instructions..."
                                />
                            </div>

                            {addError && (
                                <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2">
                                    <span className="shrink-0 mt-0.5">⚠</span>
                                    <span>{addError}</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                                <button type="button" onClick={() => { setIsAddOpen(false); setAddError(""); }} disabled={addLoading}
                                    className="px-4 py-2.5 text-sm text-gray-400 hover:text-white font-medium transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addLoading || !newName.trim() || !newPrice}
                                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2"
                                >
                                    {addLoading ? <><Loader2 size={15} className="animate-spin" /> Registering...</> : <><Plus size={15} /> Save Product</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
