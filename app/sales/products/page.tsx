"use client";
import { fetchAPI } from '@/lib/api';

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { BarChart3, Package, DollarSign, Tag } from "lucide-react";

const MENU_ITEMS = [
    { name: "Quotations", href: "/sales" },
    { name: "Orders", href: "/sales/orders" },
    { name: "Customers", href: "/sales/customers" },
    { name: "Products", href: "/sales/products" },
    { name: "Reporting", href: "/sales/reporting" },
    { name: "Configuration", href: "/sales/configuration" },
];

type Product = {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    cost: number;
    stock: number;
};

const mockProducts: Product[] = [
    { id: "1", name: "Product A", sku: "PRD-001", category: "Electronics", price: 299.99, cost: 150.00, stock: 45 },
    { id: "2", name: "Product B", sku: "PRD-002", category: "Accessories", price: 49.99, cost: 25.00, stock: 120 },
    { id: "3", name: "Product C", sku: "PRD-003", category: "Software", price: 199.99, cost: 50.00, stock: 0 },
];

export default function SalesProductsPage() {
    const [products] = useState<Product[]>(mockProducts);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Sales"
                moduleIcon={<BarChart3 size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search products..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Products</h2>
                            <p className="text-sm text-gray-400 mt-1">{products.length} products available</p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                </div>

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Product</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">SKU</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Category</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Price</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Cost</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Margin</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => {
                                    const margin = ((product.price - product.cost) / product.price * 100).toFixed(1);
                                    return (
                                        <tr key={product.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Package size={16} className="text-blue-400" />
                                                    <span className="font-medium text-white">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">{product.sku}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-green-400 font-semibold">${product.price.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-gray-300">${product.cost.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-blue-400">{margin}%</td>
                                            <td className="px-4 py-3">
                                                <span className={product.stock === 0 ? 'text-red-400' : product.stock < 50 ? 'text-yellow-400' : 'text-gray-300'}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map(product => {
                            const margin = ((product.price - product.cost) / product.price * 100).toFixed(1);
                            return (
                                <div key={product.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Package size={20} className="text-blue-400" />
                                        <h3 className="font-semibold text-white">{product.name}</h3>
                                    </div>
                                    <div className="space-y-2 text-sm mb-4">
                                        <div className="flex justify-between text-gray-400">
                                            <span>SKU:</span>
                                            <span className="text-gray-300">{product.sku}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>Category:</span>
                                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                                                {product.category}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>Price:</span>
                                            <span className="text-green-400 font-semibold">${product.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>Margin:</span>
                                            <span className="text-blue-400">{margin}%</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>Stock:</span>
                                            <span className={product.stock === 0 ? 'text-red-400 font-semibold' : product.stock < 50 ? 'text-yellow-400' : 'text-gray-300'}>
                                                {product.stock}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
