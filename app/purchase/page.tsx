"use client";
import { fetchAPI } from '@/lib/api';

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { ShoppingCart, FileText, DollarSign, Calendar } from "lucide-react";

const MENU_ITEMS = [
    { name: "RFQs", href: "/purchase" },
    { name: "Purchase Orders", href: "/purchase/orders" },
    { name: "Vendors", href: "/purchase/vendors" },
    { name: "Reporting", href: "/purchase/reporting" },
    { name: "Configuration", href: "/purchase/configuration" },
];

type RFQ = {
    id: string;
    vendor: string;
    total: number;
    status: string;
    date: string;
};

const mockRFQs: RFQ[] = [
    { id: "RFQ001", vendor: "Supplier A", total: 15000, status: "draft", date: "2025-12-01" },
    { id: "RFQ002", vendor: "Supplier B", total: 28000, status: "sent", date: "2025-12-02" },
    { id: "RFQ003", vendor: "Supplier C", total: 42000, status: "confirmed", date: "2025-12-03" },
];

export default function PurchasePage() {
    const [rfqs] = useState<RFQ[]>(mockRFQs);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Purchase"
                moduleIcon={<ShoppingCart size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search RFQs..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Requests for Quotation</h2>
                            <p className="text-sm text-gray-400 mt-1">{rfqs.length} RFQs • ${rfqs.reduce((sum, r) => sum + r.total, 0).toLocaleString()} total value</p>
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">RFQ #</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Vendor</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rfqs.map(rfq => (
                                    <tr key={rfq.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{rfq.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{rfq.vendor}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${rfq.total.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${rfq.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                                    rfq.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {rfq.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(rfq.date).toLocaleDateString()}</td>
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
                        {['draft', 'sent', 'confirmed'].map(status => (
                            <div key={status} className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 capitalize">{status}</h3>
                                <div className="space-y-3">
                                    {rfqs.filter(r => r.status === status).map(rfq => (
                                        <div key={rfq.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                            <div className="font-medium text-white mb-2">{rfq.id}</div>
                                            <div className="text-sm text-gray-400 mb-2">{rfq.vendor}</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-green-400 font-semibold">${rfq.total.toLocaleString()}</span>
                                                <span className="text-xs text-gray-500">{new Date(rfq.date).toLocaleDateString()}</span>
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
