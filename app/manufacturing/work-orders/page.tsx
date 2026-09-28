"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { Wrench, Clock, Play, Pause, CheckCircle } from "lucide-react";

const MENU_ITEMS = [
    { name: "Manufacturing Orders", href: "/manufacturing" },
    { name: "Work Orders", href: "/manufacturing/work-orders" },
    { name: "Bill of Materials", href: "/manufacturing/bom" },
    { name: "Reporting", href: "/manufacturing/reporting" },
    { name: "Configuration", href: "/manufacturing/configuration" },
];

type WorkOrder = {
    id: string;
    operation: string;
    work_center: string;
    mo_reference: string;
    product: string;
    status: string;
    duration: number;
};

const mockWorkOrders: WorkOrder[] = [
    { id: "WO/001", operation: "Assembly", work_center: "Assembly Line 1", mo_reference: "MO/001", product: "Office Chair", status: "ready", duration: 120 },
    { id: "WO/002", operation: "Painting", work_center: "Paint Shop", mo_reference: "MO/001", product: "Office Chair", status: "pending", duration: 60 },
    { id: "WO/003", operation: "Cutting", work_center: "Cutting Station", mo_reference: "MO/002", product: "Wooden Desk", status: "in_progress", duration: 90 },
];

export default function WorkOrdersPage() {
    const [workOrders] = useState<WorkOrder[]>(mockWorkOrders);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Manufacturing"
                moduleIcon={<Wrench size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search work orders..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Work Orders</h2>
                            <p className="text-sm text-gray-400 mt-1">{workOrders.length} active operations</p>
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Work Order</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Operation</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Work Center</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Product</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Duration</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workOrders.map(wo => (
                                    <tr key={wo.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{wo.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{wo.operation}</td>
                                        <td className="px-4 py-3 text-gray-300">{wo.work_center}</td>
                                        <td className="px-4 py-3 text-gray-300">{wo.product}</td>
                                        <td className="px-4 py-3 text-gray-300">{wo.duration} min</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${wo.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                                                    wo.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {wo.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {wo.status === 'ready' && (
                                                    <button className="p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">
                                                        <Play size={14} />
                                                    </button>
                                                )}
                                                {wo.status === 'in_progress' && (
                                                    <button className="p-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30">
                                                        <Pause size={14} />
                                                    </button>
                                                )}
                                                <button className="p-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30">
                                                    <CheckCircle size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['ready', 'in_progress', 'pending'].map(status => (
                            <div key={status} className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 capitalize">{status.replace('_', ' ')}</h3>
                                <div className="space-y-3">
                                    {workOrders.filter(wo => wo.status === status).map(wo => (
                                        <div key={wo.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium text-white">{wo.operation}</span>
                                                <span className="text-sm text-gray-400">{wo.duration} min</span>
                                            </div>
                                            <div className="text-sm text-gray-300 mb-1">{wo.product}</div>
                                            <div className="text-xs text-gray-500">{wo.work_center}</div>

                                            <div className="mt-3 pt-3 border-t border-gray-700 flex justify-end">
                                                {wo.status === 'ready' && (
                                                    <button className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded flex items-center gap-1">
                                                        <Play size={10} /> Start
                                                    </button>
                                                )}
                                                {wo.status === 'in_progress' && (
                                                    <button className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded flex items-center gap-1">
                                                        <Pause size={10} /> Pause
                                                    </button>
                                                )}
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
