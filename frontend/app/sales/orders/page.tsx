"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { BarChart3, CheckCircle, Package, DollarSign } from "lucide-react";

const MENU_ITEMS = [
    { name: "Quotations", href: "/sales" },
    { name: "Orders", href: "/sales/orders" },
    { name: "Customers", href: "/sales/customers" },
    { name: "Products", href: "/sales/products" },
    { name: "Reporting", href: "/sales/reporting" },
    { name: "Configuration", href: "/sales/configuration" },
];

type Order = {
    id: string;
    customer: string;
    total: number;
    status: string;
    delivery_date: string;
};

const mockOrders: Order[] = [
    { id: "SO001", customer: "Acme Corp", total: 15000, status: "confirmed", delivery_date: "2025-12-05" },
    { id: "SO002", customer: "Tech Solutions", total: 28000, status: "in_progress", delivery_date: "2025-12-08" },
    { id: "SO003", customer: "Global Industries", total: 42000, status: "delivered", delivery_date: "2025-12-01" },
];

export default function SalesOrdersPage() {
    const [orders] = useState<Order[]>(mockOrders);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Sales"
                moduleIcon={<BarChart3 size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search orders..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Sales Orders</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {orders.length} orders • ${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()} total value
                            </p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Total Orders</span>
                            <Package size={16} className="text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{orders.length}</div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Total Revenue</span>
                            <DollarSign size={16} className="text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            ${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Confirmed</span>
                            <CheckCircle size={16} className="text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {orders.filter(o => o.status === 'confirmed').length}
                        </div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Delivered</span>
                            <CheckCircle size={16} className="text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {orders.filter(o => o.status === 'delivered').length}
                        </div>
                    </div>
                </div>

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Order #</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Delivery Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{order.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{order.customer}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${order.total.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                                                    order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(order.delivery_date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['confirmed', 'in_progress', 'delivered'].map(status => (
                            <div key={status} className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 capitalize">{status.replace('_', ' ')}</h3>
                                <div className="space-y-3">
                                    {orders.filter(o => o.status === status).map(order => (
                                        <div key={order.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                            <div className="font-medium text-white mb-2">{order.id}</div>
                                            <div className="text-sm text-gray-400 mb-2">{order.customer}</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-green-400 font-semibold">${order.total.toLocaleString()}</span>
                                                <span className="text-xs text-gray-500">{new Date(order.delivery_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
