"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { ShoppingCart, TrendingUp, DollarSign, Package, AlertTriangle } from "lucide-react";

const MENU_ITEMS = [
    { name: "RFQs", href: "/purchase" },
    { name: "Purchase Orders", href: "/purchase/orders" },
    { name: "Vendors", href: "/purchase/vendors" },
    { name: "Reporting", href: "/purchase/reporting" },
    { name: "Configuration", href: "/purchase/configuration" },
];

export default function PurchaseReportingPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Purchase"
                moduleIcon={<ShoppingCart size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search reports..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Purchase Reporting</h2>
                    <p className="text-sm text-gray-400 mt-1">Analytics and insights for procurement</p>
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
                        <div className="text-3xl font-bold text-white mb-1">$450K</div>
                        <div className="text-sm text-gray-400">Total Spend</div>
                        <div className="text-xs text-green-400 mt-2">+12% from last month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <ShoppingCart size={24} className="text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">128</div>
                        <div className="text-sm text-gray-400">Purchase Orders</div>
                        <div className="text-xs text-green-400 mt-2">+5% from last month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <Package size={24} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">98%</div>
                        <div className="text-sm text-gray-400">On-Time Delivery</div>
                        <div className="text-xs text-green-400 mt-2">+2% improvement</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <AlertTriangle size={24} className="text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">12</div>
                        <div className="text-sm text-gray-400">Late Deliveries</div>
                        <div className="text-xs text-red-400 mt-2">-3 from last month</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Spend by Category</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Vendor Performance</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Vendors by Spend</h3>
                        <div className="space-y-3">
                            {[
                                { name: "Supplier A", spend: "$150,000", orders: 45 },
                                { name: "Supplier B", spend: "$98,000", orders: 32 },
                                { name: "Supplier C", spend: "$87,000", orders: 28 },
                            ].map((vendor, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div>
                                        <div className="font-medium text-white">{vendor.name}</div>
                                        <div className="text-sm text-gray-400">{vendor.orders} orders</div>
                                    </div>
                                    <div className="text-green-400 font-semibold">{vendor.spend}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            {[
                                { action: "PO Created", detail: "PO001 for Supplier A", time: "2 hours ago" },
                                { action: "Goods Received", detail: "PO002 from Supplier B", time: "5 hours ago" },
                                { action: "RFQ Sent", detail: "RFQ003 to Supplier C", time: "1 day ago" },
                            ].map((activity, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div>
                                        <div className="font-medium text-white">{activity.action}</div>
                                        <div className="text-sm text-gray-400">{activity.detail}</div>
                                    </div>
                                    <div className="text-xs text-gray-500">{activity.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
