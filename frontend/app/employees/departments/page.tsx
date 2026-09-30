"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { Users, Building, UserPlus } from "lucide-react";

const MENU_ITEMS = [
    { name: "Employees", href: "/employees" },
    { name: "Departments", href: "/employees/departments" },
    { name: "Contracts", href: "/employees/contracts" },
    { name: "Reporting", href: "/employees/reporting" },
    { name: "Configuration", href: "/employees/configuration" },
];

type Department = {
    id: string;
    name: string;
    manager: string;
    employees: number;
    location: string;
};

const mockDepartments: Department[] = [
    { id: "DEP001", name: "Sales", manager: "Sarah Connor", employees: 12, location: "New York" },
    { id: "DEP002", name: "IT", manager: "Mike Ross", employees: 8, location: "San Francisco" },
    { id: "DEP003", name: "Human Resources", manager: "Alice Wonderland", employees: 4, location: "New York" },
    { id: "DEP004", name: "Marketing", manager: "John Doe", employees: 6, location: "London" },
];

export default function DepartmentsPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Employees"
                moduleIcon={<Users size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search departments..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Departments</h2>
                            <p className="text-sm text-gray-400 mt-1">{mockDepartments.length} active departments</p>
                        </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                        <Building size={18} /> New Department
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockDepartments.map(dept => (
                        <div key={dept.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">{dept.name}</h3>
                                    <p className="text-sm text-gray-400">{dept.location}</p>
                                </div>
                                <div className="bg-blue-500/20 p-2 rounded">
                                    <Building size={20} className="text-blue-400" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-t border-gray-700">
                                    <span className="text-sm text-gray-400">Manager</span>
                                    <span className="text-sm text-white font-medium">{dept.manager}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-t border-gray-700">
                                    <span className="text-sm text-gray-400">Employees</span>
                                    <span className="text-sm text-white font-medium">{dept.employees}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
                                <button className="text-sm text-blue-400 hover:text-blue-300">View Employees</button>
                                <button className="text-sm text-gray-400 hover:text-white">Settings</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
