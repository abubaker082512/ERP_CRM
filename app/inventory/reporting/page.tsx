"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { Package, TrendingUp, DollarSign, AlertTriangle, BarChart3 } from "lucide-react";

const MENU_ITEMS = [
    { name: "Products", href: "/inventory" },
    { name: "Operations", href: "/inventory/operations" },
    { name: "Warehouses", href: "/inventory/warehouses" },
    { name: "Reporting", href: "/inventory/reporting" },
    { name: "Configuration", href: "/inventory/configuration" },
];

export default function InventoryReportingPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Inventory"
                moduleIcon={<Package size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search reports..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Inventory Reporting</h2>
                    <p className="text-sm text-gray-400 mt-1">Analytics and insights for inventory management</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <Package size={24} className="text-blue-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">1,247</div>
                        <div className="text-sm text-gray-400">Total Products</div>
                        <div className="text-xs text-green-400 mt-2">+8% from last month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <DollarSign size={24} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">$1.2M</div>
                        <div className="text-sm text-gray-400">Stock Value</div>
                        <div className="text-xs text-green-400 mt-2">+12% from last month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <AlertTriangle size={24} className="text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">42</div>
                        <div className="text-sm text-gray-400">Low Stock Items</div>
                        <div className="text-xs text-yellow-400 mt-2">Needs attention</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <BarChart3 size={24} className="text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">94%</div>
                        <div className="text-sm text-gray-400">Stock Accuracy</div>
                        <div className="text-xs text-green-400 mt-2">+2% improvement</div>
                    </div>
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Stock Movement</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Stock by Category</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Package size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Inventory Turnover</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
                        <div className="space-y-3">
                            {[
                                { name: "Product A", value: "$45,000", qty: "1,200 units" },
                                { name: "Product B", value: "$38,000", qty: "950 units" },
                                { name: "Product C", value: "$32,000", qty: "800 units" },
                            ].map((product, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div>
                                        <div className="font-medium text-white">{product.name}</div>
                                        <div className="text-sm text-gray-400">{product.qty}</div>
                                    </div>
                                    <div className="text-green-400 font-semibold">{product.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
