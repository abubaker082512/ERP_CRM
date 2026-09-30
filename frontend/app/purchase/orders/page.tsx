"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { ShoppingCart, CheckCircle, Clock, DollarSign } from "lucide-react";

const MENU_ITEMS = [
    { name: "RFQs", href: "/purchase" },
    { name: "Purchase Orders", href: "/purchase/orders" },
    { name: "Vendors", href: "/purchase/vendors" },
    { name: "Reporting", href: "/purchase/reporting" },
    { name: "Configuration", href: "/purchase/configuration" },
];

type PurchaseOrder = {
    id: string;
    vendor: string;
    total: number;
    status: string;
    order_date: string;
    delivery_date: string;
};

const mockOrders: PurchaseOrder[] = [
    { id: "PO001", vendor: "Supplier A", total: 15000, status: "purchase", order_date: "2025-12-01", delivery_date: "2025-12-10" },
    { id: "PO002", vendor: "Supplier B", total: 28000, status: "done", order_date: "2025-11-25", delivery_date: "2025-12-05" },
    { id: "PO003", vendor: "Supplier C", total: 42000, status: "purchase", order_date: "2025-12-02", delivery_date: "2025-12-15" },
];

export default function PurchaseOrdersPage() {
    const [orders] = useState<PurchaseOrder[]>(mockOrders);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Purchase"
                moduleIcon={<ShoppingCart size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search purchase orders..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Purchase Orders</h2>
                            <p className="text-sm text-gray-400 mt-1">{orders.length} orders • ${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()} total value</p>
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
                            <ShoppingCart size={16} className="text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{orders.length}</div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Total Spend</span>
                            <DollarSign size={16} className="text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            ${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">To Receive</span>
                            <Clock size={16} className="text-yellow-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {orders.filter(o => o.status === 'purchase').length}
                        </div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Completed</span>
                            <CheckCircle size={16} className="text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {orders.filter(o => o.status === 'done').length}
                        </div>
                    </div>
                </div>

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Order #</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Vendor</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Order Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Delivery Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{order.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{order.vendor}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${order.total.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                                    order.status === 'purchase' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {order.status === 'purchase' ? 'Purchase Order' : 'Locked'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(order.order_date).toLocaleDateString()}</td>
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
                        {['purchase', 'done'].map(status => (
                            <div key={status} className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 capitalize">{status === 'purchase' ? 'Purchase Order' : 'Locked'}</h3>
                                <div className="space-y-3">
                                    {orders.filter(o => o.status === status).map(order => (
                                        <div key={order.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                            <div className="font-medium text-white mb-2">{order.id}</div>
                                            <div className="text-sm text-gray-400 mb-2">{order.vendor}</div>
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
