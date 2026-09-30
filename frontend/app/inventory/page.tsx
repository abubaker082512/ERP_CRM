"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useEffect, useState } from "react";
import { Plus, Package, TrendingUp, AlertCircle } from "lucide-react";

import { fetchAPI } from "@/lib/api";

const MENU_ITEMS = [
    { name: "Products", href: "/inventory" },
    { name: "Operations", href: "/inventory/operations" },
    { name: "Warehouses", href: "/inventory/warehouses" },
    { name: "Reporting", href: "/inventory/reporting" },
    { name: "Configuration", href: "/inventory/configuration" },
];

type Product = {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    category: string;
    created_at: string;
};

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetchAPI("/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
        (p.sku && p.sku.toLowerCase().includes(prodSearch.toLowerCase()))
    );

    const currencySymbol = getCurrencySymbol();

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Inventory"
                moduleIcon={<Package size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search products, SKU..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Products</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {products.length} products in stock
                            </p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                        <Plus size={18} /> New Product
                    </button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Total Products</span>
                            <Package size={16} className="text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{products.length}</div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Total Value</span>
                            <TrendingUp size={16} className="text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            ${products.reduce((sum, p) => sum + (p.quantity * p.unit_price), 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Low Stock</span>
                            <AlertCircle size={16} className="text-yellow-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {products.filter(p => p.quantity < 10).length}
                        </div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Categories</span>
                            <Package size={16} className="text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {new Set(products.map(p => p.category)).size}
                        </div>
                    </div>
                </div>

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                                        <input type="checkbox" className="w-4 h-4 mr-2" />
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">SKU</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Category</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Quantity</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Unit Price</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total Value</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" className="w-4 h-4" />
                                                <div className="flex items-center gap-2">
                                                    <Package size={16} className="text-blue-400" />
                                                    <span className="font-medium text-white">{product.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{product.sku}</td>
                                        <td className="px-4 py-3 text-gray-300">{product.category}</td>
                                        <td className="px-4 py-3">
                                            <span className={`${product.quantity < 10 ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                {product.quantity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">${product.unit_price.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">
                                            ${(product.quantity * product.unit_price).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                            No products found. Add your first product to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map(product => (
                            <div key={product.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                <div className="flex items-center gap-2 mb-3">
                                    <Package size={20} className="text-blue-400" />
                                    <h3 className="font-semibold text-white">{product.name}</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-400">
                                        <span>SKU:</span>
                                        <span className="text-gray-300">{product.sku}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Category:</span>
                                        <span className="text-gray-300">{product.category}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Quantity:</span>
                                        <span className={product.quantity < 10 ? 'text-yellow-400 font-semibold' : 'text-gray-300'}>
                                            {product.quantity}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Unit Price:</span>
                                        <span className="text-gray-300">${product.unit_price.toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-700 flex justify-between">
                                        <span className="text-gray-400">Total Value:</span>
                                        <span className="text-green-400 font-semibold">
                                            ${(product.quantity * product.unit_price).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2"
                                >
                                    {addLoading ? <><Loader2 size={15} className="animate-spin" /> Registering...</> : <><Plus size={15} /> Save Product</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1A2236] rounded-2xl p-6 w-full max-w-lg border border-white/8 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-white">Edit Product Details</h3>
                                <p className="text-gray-500 text-xs mt-0.5">Update catalog details for this item</p>
                            </div>
                            <button onClick={() => setEditingProduct(null)} className="text-gray-500 hover:text-white p-1 rounded-xl hover:bg-white/5">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleEditProduct} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Product Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">SKU / Barcode</label>
                                <input
                                    type="text"
                                    value={editSku}
                                    onChange={e => setEditSku(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Sales Price ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={editPrice}
                                        onChange={e => setEditPrice(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Cost Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editCost}
                                        onChange={e => setEditCost(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Internal Notes / Description</label>
                                <textarea
                                    value={editDesc}
                                    onChange={e => setEditDesc(e.target.value)}
                                    rows={3}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none transition-all resize-none"
                                />
                            </div>

                            {editError && (
                                <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2">
                                    <span className="shrink-0 mt-0.5">⚠</span>
                                    <span>{editError}</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                                <button type="button" onClick={() => setEditingProduct(null)} disabled={editLoading}
                                    className="px-4 py-2.5 text-sm text-gray-400 hover:text-white font-medium transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading || !editName.trim() || !editPrice}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2"
                                >
                                    {editLoading ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Stock Adjustment Modal */}
            {adjustingProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1A2236] rounded-2xl p-6 w-full max-w-md border border-white/8 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-white">Adjust Product Stock</h3>
                                <p className="text-gray-400 text-xs mt-0.5">Manage stock count for: <span className="text-purple-400 font-semibold">{adjustingProduct.name}</span></p>
                            </div>
                            <button onClick={() => setAdjustingProduct(null)} className="text-gray-500 hover:text-white p-1 rounded-xl hover:bg-white/5">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleAdjustStock} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Select Stock Location</label>
                                <select 
                                    value={selectedLocation}
                                    onChange={e => setSelectedLocation(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none"
                                >
                                    {locations.filter(l => l.usage === "internal").map(l => (
                                        <option key={l.id} value={l.id}>{l.name} (On hand: {getProductStockAtLocation(adjustingProduct.id, l.id)} units)</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Adjustment Action</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["add", "remove", "set"] as const).map(type => (
                                        <button 
                                            key={type}
                                            type="button"
                                            onClick={() => setAdjustType(type)}
                                            className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                                                adjustType === type 
                                                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20" 
                                                    : "bg-[#0F172A] border-white/10 text-gray-400 hover:bg-white/5"
                                            }`}
                                        >
                                            {type === "add" ? "➕ Add" : type === "remove" ? "➖ Remove" : "⚙️ Set (New Total)"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Quantity</label>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    required
                                    placeholder={adjustType === "set" ? "Enter final absolute quantity..." : "Enter adjustment quantity..."}
                                    value={adjustQty}
                                    onChange={e => setAdjustQty(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none transition-all"
                                />
                            </div>

                            {adjustError && (
                                <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2">
                                    <span className="shrink-0 mt-0.5">⚠</span>
                                    <span>{adjustError}</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                                <button type="button" onClick={() => setAdjustingProduct(null)} disabled={adjustLoading}
                                    className="px-4 py-2.5 text-sm text-gray-400 hover:text-white font-medium transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adjustLoading || !selectedLocation || !adjustQty}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2"
                                >
                                    {adjustLoading ? <><Loader2 size={15} className="animate-spin" /> Adjusting...</> : "Apply Adjustment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
