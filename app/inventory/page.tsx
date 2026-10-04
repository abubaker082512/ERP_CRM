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
    sku?: string;
    quantity: number;
    unit_price: number;
    category?: string;
    created_at?: string;
};

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentView, setCurrentView] = useState<ViewType>("list");
    const [prodSearch, setProdSearch] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI("/products");
            if (res.ok) {
                const data = await res.json();
                const mapped = (data || []).map((p: any) => ({
                    id: p.id,
                    name: p.name || "Product",
                    sku: p.default_code || p.sku || "N/A",
                    quantity: p.qty_available ?? p.quantity ?? 0,
                    unit_price: p.list_price ?? p.unit_price ?? 0,
                    category: p.category || "General",
                    created_at: p.created_at || new Date().toISOString()
                }));
                setProducts(mapped);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
        (p.sku && p.sku.toLowerCase().includes(prodSearch.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Inventory"
                moduleIcon={<Package size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search products, SKU..."
                onSearch={setProdSearch}
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

                {loading ? (
                    <div className="text-gray-400 py-8 text-center">Loading inventory products...</div>
                ) : currentView === "list" ? (
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
                                {filteredProducts.map(product => (
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
                                        <td className="px-4 py-3 text-gray-300">${Number(product.unit_price || 0).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">
                                            ${(product.quantity * product.unit_price).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                            No products found. Add your first product to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
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
                                        <span className="text-green-400 font-medium">
                                            ${Number(product.unit_price || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
