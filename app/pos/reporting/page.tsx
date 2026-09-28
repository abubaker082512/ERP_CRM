"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { ShoppingBag, TrendingUp, DollarSign, Users } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/pos" },
    { name: "Orders", href: "/pos/orders" },
    { name: "Products", href: "/pos/products" },
    { name: "Reporting", href: "/pos/reporting" },
    { name: "Configuration", href: "/pos/configuration" },
];

export default function POSReportingPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Point of Sale"
                moduleIcon={<ShoppingBag size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search reports..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">POS Reporting</h2>
                    <p className="text-sm text-gray-400 mt-1">Sales performance and session analytics</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <DollarSign size={24} className="text-blue-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">$12,450</div>
                        <div className="text-sm text-gray-400">Total Sales</div>
                        <div className="text-xs text-green-400 mt-2">+8% vs last week</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <ShoppingBag size={24} className="text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">145</div>
                        <div className="text-sm text-gray-400">Total Orders</div>
                        <div className="text-xs text-green-400 mt-2">+12 orders today</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <TrendingUp size={24} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">$85.50</div>
                        <div className="text-sm text-gray-400">Avg Order Value</div>
                        <div className="text-xs text-red-400 mt-2">-2% vs last week</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <Users size={24} className="text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">3</div>
                        <div className="text-sm text-gray-400">Active Sessions</div>
                        <div className="text-xs text-gray-500 mt-2">Across 2 shops</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Sales by Category</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <ShoppingBag size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Hourly Sales</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Selling Products</h3>
                        <div className="space-y-3">
                            {[
                                { name: "Office Chair", sold: 45, revenue: "$5,400" },
                                { name: "Wooden Desk", sold: 20, revenue: "$5,000" },
                                { name: "USB Cable", sold: 150, revenue: "$2,250" },
                            ].map((product, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div>
                                        <div className="font-medium text-white">{product.name}</div>
                                        <div className="text-sm text-gray-400">{product.sold} units sold</div>
                                    </div>
                                    <div className="text-green-400 font-semibold">{product.revenue}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Sales by Salesperson</h3>
                        <div className="space-y-3">
                            {[
                                { name: "John Doe", orders: 85, revenue: "$6,500" },
                                { name: "Jane Smith", orders: 60, revenue: "$5,950" },
                            ].map((person, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                            {person.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{person.name}</div>
                                            <div className="text-sm text-gray-400">{person.orders} orders</div>
                                        </div>
                                    </div>
                                    <div className="text-green-400 font-semibold">{person.revenue}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
