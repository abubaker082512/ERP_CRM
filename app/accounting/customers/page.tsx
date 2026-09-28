"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { DollarSign, FileText, User, Calendar } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

type Invoice = {
    id: string;
    customer: string;
    amount: number;
    status: string;
    date: string;
    due_date: string;
};

const mockInvoices: Invoice[] = [
    { id: "INV/2025/001", customer: "Acme Corp", amount: 15000, status: "posted", date: "2025-12-01", due_date: "2025-12-31" },
    { id: "INV/2025/002", customer: "Tech Solutions", amount: 8500, status: "draft", date: "2025-12-02", due_date: "2026-01-01" },
    { id: "INV/2025/003", customer: "Global Industries", amount: 22000, status: "posted", date: "2025-12-03", due_date: "2026-01-02" },
];

export default function AccountingCustomersPage() {
    const [invoices] = useState<Invoice[]>(mockInvoices);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search invoices..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Customer Invoices</h2>
                            <p className="text-sm text-gray-400 mt-1">{invoices.length} invoices • ${invoices.reduce((sum, i) => sum + i.amount, 0).toLocaleString()} total</p>
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Invoice Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Due Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(invoice => (
                                    <tr key={invoice.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{invoice.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{invoice.customer}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(invoice.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(invoice.due_date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${invoice.amount.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${invoice.status === 'posted' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {invoice.status}
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
                                    {invoices.filter(i => i.status === status).map(invoice => (
                                        <div key={invoice.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium text-white">{invoice.id}</span>
                                                <span className="text-green-400 font-semibold">${invoice.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-2">{invoice.customer}</div>
                                            <div className="text-xs text-gray-500">Due: {new Date(invoice.due_date).toLocaleDateString()}</div>
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
