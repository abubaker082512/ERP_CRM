"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { Users, FileText, Calendar } from "lucide-react";

const MENU_ITEMS = [
    { name: "Employees", href: "/employees" },
    { name: "Departments", href: "/employees/departments" },
    { name: "Contracts", href: "/employees/contracts" },
    { name: "Reporting", href: "/employees/reporting" },
    { name: "Configuration", href: "/employees/configuration" },
];

type Contract = {
    id: string;
    employee: string;
    role: string;
    type: string;
    start_date: string;
    end_date: string;
    wage: number;
    status: string;
};

const mockContracts: Contract[] = [
    { id: "CNT/001", employee: "John Smith", role: "Sales Manager", type: "Permanent", start_date: "2024-01-01", end_date: "", wage: 85000, status: "running" },
    { id: "CNT/002", employee: "Jane Doe", role: "Software Engineer", type: "Permanent", start_date: "2024-03-15", end_date: "", wage: 95000, status: "running" },
    { id: "CNT/003", employee: "Bob Wilson", role: "HR Specialist", type: "Contractor", start_date: "2025-01-01", end_date: "2025-12-31", wage: 60000, status: "draft" },
];

export default function ContractsPage() {
    const [contracts] = useState<Contract[]>(mockContracts);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Employees"
                moduleIcon={<Users size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search contracts..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Contracts</h2>
                            <p className="text-sm text-gray-400 mt-1">{contracts.length} contracts</p>
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Employee</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Job Position</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Start Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Wage</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contracts.map(contract => (
                                    <tr key={contract.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{contract.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{contract.employee}</td>
                                        <td className="px-4 py-3 text-gray-300">{contract.role}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                                {contract.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(contract.start_date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${contract.wage.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${contract.status === 'running' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {contract.status}
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
                        {['draft', 'running', 'expired'].map(status => (
                            <div key={status} className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 capitalize">{status}</h3>
                                <div className="space-y-3">
                                    {contracts.filter(c => c.status === status).map(contract => (
                                        <div key={contract.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium text-white">{contract.employee}</span>
                                                <span className="text-green-400 font-semibold">${(contract.wage / 1000).toFixed(0)}k</span>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-2">{contract.role}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(contract.start_date).toLocaleDateString()}
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
