"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { ShoppingBag, Package, Tag, DollarSign } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/pos" },
    { name: "Orders", href: "/pos/orders" },
    { name: "Products", href: "/pos/products" },
    { name: "Reporting", href: "/pos/reporting" },
    { name: "Configuration", href: "/pos/configuration" },
];

type Product = {
    id: string;
    name: string;
    category: string;
    price: number;
    cost: number;
    stock: number;
    barcode: string;
};

const mockProducts: Product[] = [
    { id: "PRD/001", name: "Office Chair", category: "Furniture", price: 120.00, cost: 80.00, stock: 45, barcode: "123456789" },
    { id: "PRD/002", name: "Wooden Desk", category: "Furniture", price: 250.00, cost: 150.00, stock: 20, barcode: "987654321" },
    { id: "PRD/003", name: "USB Cable", category: "Electronics", price: 15.00, cost: 5.00, stock: 150, barcode: "456123789" },
];

export default function POSProductsPage() {
    const [products] = useState<Product[]>(mockProducts);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Point of Sale"
                moduleIcon={<ShoppingBag size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search products..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Products</h2>
                            <p className="text-sm text-gray-400 mt-1">{products.length} available items</p>
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Category</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Barcode</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Cost</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Price</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Stock</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{product.name}</td>
                                        <td className="px-4 py-3 text-gray-300">{product.category}</td>
                                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{product.barcode}</td>
                                        <td className="px-4 py-3 text-gray-400">${product.cost.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${product.price.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-white">{product.stock}</td>
                                        <td className="px-4 py-3">
                                            <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all group">
                                <div className="aspect-square bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                                    <Package size={48} className="text-gray-600 group-hover:text-blue-500 transition-colors" />
                                </div>

                                <h3 className="font-semibold text-white mb-1">{product.name}</h3>
                                <p className="text-sm text-gray-400 mb-3">{product.category}</p>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                                    <span className="text-green-400 font-bold text-lg">${product.price}</span>
                                    <span className="text-sm text-gray-400">{product.stock} units</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
