"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { BarChart3, TrendingUp, DollarSign, Users, Award } from "lucide-react";

const MENU_ITEMS = [
    { name: "Quotations", href: "/sales" },
    { name: "Orders", href: "/sales/orders" },
    { name: "Customers", href: "/sales/customers" },
    { name: "Products", href: "/sales/products" },
    { name: "Reporting", href: "/sales/reporting" },
    { name: "Configuration", href: "/sales/configuration" },
];

export default function SalesReportingPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Sales"
                moduleIcon={<BarChart3 size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search reports..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Sales Reporting</h2>
                    <p className="text-sm text-gray-400 mt-1">Analytics and insights for sales performance</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-500/20 p-3 rounded-lg">
                                <DollarSign size={24} className="text-green-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">$2.8M</div>
                        <div className="text-sm text-gray-400">Total Revenue</div>
                        <div className="text-xs text-green-400 mt-2">+15% from last month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
                            <BarChart3 size={24} className="text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">342</div>
                        <div className="text-sm text-gray-400">Orders This Month</div>
                        <div className="text-xs text-green-400 mt-2">+22% from last month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <Users size={24} className="text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">128</div>
                        <div className="text-sm text-gray-400">Active Customers</div>
                        <div className="text-xs text-green-400 mt-2">+8% from last month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <Award size={24} className="text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">$8,200</div>
                        <div className="text-sm text-gray-400">Average Order Value</div>
                        <div className="text-xs text-green-400 mt-2">+5% from last month</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Sales by Product</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Customers</h3>
                        <div className="space-y-3">
                            {[
                                { name: "Acme Corp", revenue: "$125,000", orders: 45 },
                                { name: "Tech Solutions", revenue: "$98,000", orders: 38 },
                                { name: "Global Industries", revenue: "$87,000", orders: 32 },
                            ].map((customer, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div>
                                        <div className="font-medium text-white">{customer.name}</div>
                                        <div className="text-sm text-gray-400">{customer.orders} orders</div>
                                    </div>
                                    <div className="text-green-400 font-semibold">{customer.revenue}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Sales Team Performance</h3>
                        <div className="space-y-3">
                            {[
                                { name: "John Smith", revenue: "$450K", deals: 52 },
                                { name: "Sarah Davis", revenue: "$380K", deals: 48 },
                                { name: "Mike Johnson", revenue: "$320K", deals: 42 },
                            ].map((rep, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {rep.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{rep.name}</div>
                                            <div className="text-sm text-gray-400">{rep.deals} deals</div>
                                        </div>
                                    </div>
                                    <div className="text-green-400 font-semibold">{rep.revenue}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
