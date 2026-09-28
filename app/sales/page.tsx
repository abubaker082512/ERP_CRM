"use client";
import { fetchAPI } from '@/lib/api';

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useEffect, useState } from "react";
import { Plus, FileText, DollarSign, Calendar, User, BarChart3 } from "lucide-react";

const MENU_ITEMS = [
    { name: "Quotations", href: "/sales" },
    { name: "Orders", href: "/sales/orders" },
    { name: "Customers", href: "/sales/customers" },
    { name: "Products", href: "/sales/products" },
    { name: "Reporting", href: "/sales/reporting" },
    { name: "Configuration", href: "/sales/configuration" },
];

type Quotation = {
    id: string;
    customer: string;
    total: number;
    status: string;
    created_at: string;
};

export default function SalesPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [currentView, setCurrentView] = useState<ViewType>("list");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const res = await fetchAPI("/sales/quotations");
            if (res.ok) {
                const data = await res.json();
                setQuotations(data);
            }
        } catch (error) {
            console.error("Error fetching quotations:", error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Sales"
                moduleIcon={<BarChart3 size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search quotations, orders..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Quotations</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {quotations.length} quotations • ${quotations.reduce((sum, q) => sum + q.total, 0).toLocaleString()} total value
                            </p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        <Plus size={18} /> New Quotation
                    </button>
                </div>

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                                        <input type="checkbox" className="w-4 h-4 mr-2" />
                                        Quotation
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Created</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotations.map(quotation => (
                                    <tr key={quotation.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" className="w-4 h-4" />
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} className="text-blue-400" />
                                                    <span className="font-medium text-white">{quotation.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{quotation.customer}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${quotation.total.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${quotation.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                                    quotation.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {quotation.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-sm">
                                            {new Date(quotation.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                                        </td>
                                    </tr>
                                ))}
                                {quotations.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                                            No quotations found. Create your first quotation to get started.
                                        </td>
                                    </tr>
                                )}
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
                                    {quotations.filter(q => q.status === status).map(quotation => (
                                        <div key={quotation.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText size={16} className="text-blue-400" />
                                                <span className="font-medium text-white">{quotation.id}</span>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-2">{quotation.customer}</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-green-400 font-semibold">${quotation.total.toLocaleString()}</span>
                                                <span className="text-xs text-gray-500">{new Date(quotation.created_at).toLocaleDateString()}</span>
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
