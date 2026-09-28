"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { Package, TruckIcon, CheckCircle, Clock, AlertCircle } from "lucide-react";

const MENU_ITEMS = [
    { name: "Products", href: "/inventory" },
    { name: "Operations", href: "/inventory/operations" },
    { name: "Warehouses", href: "/inventory/warehouses" },
    { name: "Reporting", href: "/inventory/reporting" },
    { name: "Configuration", href: "/inventory/configuration" },
];

type Operation = {
    id: string;
    type: "receipt" | "delivery" | "transfer";
    product: string;
    quantity: number;
    status: "draft" | "in_progress" | "done";
    date: string;
};

const mockOperations: Operation[] = [
    { id: "OP001", type: "receipt", product: "Product A", quantity: 100, status: "done", date: "2025-12-01" },
    { id: "OP002", type: "delivery", product: "Product B", quantity: 50, status: "in_progress", date: "2025-12-02" },
    { id: "OP003", type: "transfer", product: "Product C", quantity: 25, status: "draft", date: "2025-12-03" },
];

export default function InventoryOperationsPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Inventory"
                moduleIcon={<Package size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search operations..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Inventory Operations</h2>
                    <p className="text-sm text-gray-400 mt-1">{mockOperations.length} operations</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Receipts</span>
                            <TruckIcon size={16} className="text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {mockOperations.filter(o => o.type === 'receipt').length}
                        </div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Deliveries</span>
                            <Package size={16} className="text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {mockOperations.filter(o => o.type === 'delivery').length}
                        </div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Transfers</span>
                            <TruckIcon size={16} className="text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {mockOperations.filter(o => o.type === 'transfer').length}
                        </div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">In Progress</span>
                            <Clock size={16} className="text-yellow-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {mockOperations.filter(o => o.status === 'in_progress').length}
                        </div>
                    </div>
                </div>

                {/* Operations List */}
                <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#0F172A] border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Operation #</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Product</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Quantity</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockOperations.map(operation => (
                                <tr key={operation.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">{operation.id}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${operation.type === 'receipt' ? 'bg-blue-500/20 text-blue-400' :
                                                operation.type === 'delivery' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-purple-500/20 text-purple-400'
                                            }`}>
                                            {operation.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{operation.product}</td>
                                    <td className="px-4 py-3 text-gray-300">{operation.quantity}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${operation.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                                operation.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {operation.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">{new Date(operation.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
