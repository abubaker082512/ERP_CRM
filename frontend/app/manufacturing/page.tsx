"use client";
import { fetchAPI } from '@/lib/api';

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { Wrench, Settings, Package, Clock, AlertTriangle } from "lucide-react";

const MENU_ITEMS = [
    { name: "Manufacturing Orders", href: "/manufacturing" },
    { name: "Work Orders", href: "/manufacturing/work-orders" },
    { name: "Bill of Materials", href: "/manufacturing/bom" },
    { name: "Reporting", href: "/manufacturing/reporting" },
    { name: "Configuration", href: "/manufacturing/configuration" },
];

type ManufacturingOrder = {
    id: string;
    product: string;
    quantity: number;
    status: string;
    deadline: string;
    source: string;
};

const mockOrders: ManufacturingOrder[] = [
    { id: "MO/001", product: "Office Chair", quantity: 50, status: "confirmed", deadline: "2025-12-10", source: "SO/005" },
    { id: "MO/002", product: "Wooden Desk", quantity: 20, status: "in_progress", deadline: "2025-12-08", source: "Stock" },
    { id: "MO/003", product: "Cabinet", quantity: 15, status: "done", deadline: "2025-12-01", source: "SO/002" },
];

export default function ManufacturingPage() {
    const [orders] = useState<ManufacturingOrder[]>(mockOrders);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Manufacturing"
                moduleIcon={<Wrench size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search orders..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Manufacturing Orders</h2>
                            <p className="text-sm text-gray-400 mt-1">{orders.length} active orders</p>
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Reference</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Product</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Quantity</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Source</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Deadline</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{order.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{order.product}</td>
                                        <td className="px-4 py-3 text-white font-medium">{order.quantity}</td>
                                        <td className="px-4 py-3 text-gray-400">{order.source}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(order.deadline).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                                    order.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
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
                        {['confirmed', 'in_progress', 'done'].map(status => (
                            <div key={status} className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 capitalize">{status.replace('_', ' ')}</h3>
                                <div className="space-y-3">
                                    {orders.filter(o => o.status === status).map(order => (
                                        <div key={order.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium text-white">{order.product}</span>
                                                <span className="text-blue-400 font-semibold">{order.quantity} units</span>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-2">{order.id}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={12} />
                                                Deadline: {new Date(order.deadline).toLocaleDateString()}
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
