"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { DollarSign, FileText } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

type Bill = {
    id: string;
    vendor: string;
    amount: number;
    status: string;
    date: string;
    due_date: string;
};

const mockBills: Bill[] = [
    { id: "BILL/2025/001", vendor: "Supplier A", amount: 5000, status: "posted", date: "2025-12-01", due_date: "2025-12-15" },
    { id: "BILL/2025/002", vendor: "Supplier B", amount: 1200, status: "draft", date: "2025-12-02", due_date: "2025-12-20" },
    { id: "BILL/2025/003", vendor: "Supplier C", amount: 8500, status: "posted", date: "2025-12-03", due_date: "2025-12-25" },
];

export default function AccountingVendorsPage() {
    const [bills] = useState<Bill[]>(mockBills);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search bills..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Vendor Bills</h2>
                            <p className="text-sm text-gray-400 mt-1">{bills.length} bills • ${bills.reduce((sum, b) => sum + b.amount, 0).toLocaleString()} total</p>
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Number</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Vendor</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Bill Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Due Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map(bill => (
                                    <tr key={bill.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{bill.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{bill.vendor}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(bill.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(bill.due_date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${bill.amount.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${bill.status === 'posted' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {bill.status}
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
                        {['draft', 'posted', 'paid'].map(status => (
                            <div key={status} className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 capitalize">{status}</h3>
                                <div className="space-y-3">
                                    {bills.filter(b => b.status === status).map(bill => (
                                        <div key={bill.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium text-white">{bill.id}</span>
                                                <span className="text-green-400 font-semibold">${bill.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-2">{bill.vendor}</div>
                                            <div className="text-xs text-gray-500">Due: {new Date(bill.due_date).toLocaleDateString()}</div>
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
