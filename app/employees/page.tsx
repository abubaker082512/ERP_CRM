"use client";
import { fetchAPI } from '@/lib/api';

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState, useEffect } from "react";
import { Users, Briefcase, MapPin, Mail, Phone, Plus, X } from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

const MENU_ITEMS = [
    { name: "Employees", href: "/employees" },
    { name: "Departments", href: "/employees/departments" },
    { name: "Contracts", href: "/employees/contracts" },
    { name: "Reporting", href: "/employees/reporting" },
    { name: "Configuration", href: "/employees/configuration" },
];

type Employee = {
    id: string;
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    location: string;
    status: string;
    manager: string;
};

const mockEmployees: Employee[] = [];

export default function EmployeesPage() {
    const { activeBranch, getEntityStorageKey } = useBranchContext();
    const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");
    const [showNewModal, setShowNewModal] = useState(false);
    const [empForm, setEmpForm] = useState({ name: "", role: "", department: "Operations", email: "", phone: "", location: "HQ", manager: "Workspace Owner" });

    useEffect(() => {
        try {
            const saved = localStorage.getItem(getEntityStorageKey("hr_employees"));
            if (saved) setEmployees(JSON.parse(saved));
        } catch {}
    }, [activeBranch, getEntityStorageKey]);

    const handleCreateEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        if (!empForm.name.trim()) return;
        const newEmp: Employee = {
            id: `EMP-${String(employees.length + 1).padStart(3, "0")}`,
            name: empForm.name.trim(),
            role: empForm.role.trim() || "Staff Member",
            department: empForm.department || "Operations",
            email: empForm.email.trim() || "staff@company.com",
            phone: empForm.phone.trim() || "-",
            location: empForm.location.trim() || "HQ",
            status: "active",
            manager: empForm.manager.trim() || "Workspace Owner",
        };
        const next = [newEmp, ...employees];
        setEmployees(next);
        try { localStorage.setItem(getEntityStorageKey("hr_employees"), JSON.stringify(next)); } catch {}
        setEmpForm({ name: "", role: "", department: "Operations", email: "", phone: "", location: "HQ", manager: "Workspace Owner" });
        setShowNewModal(false);
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Employees"
                moduleIcon={<Users size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search employees..."
                onNewClick={() => setShowNewModal(true)}
                newButtonLabel="New Employee"
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Employees</h2>
                            <p className="text-sm text-gray-400 mt-1">{employees.length} active employees</p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus size={16} /> New Employee
                    </button>
                </div>

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Job Position</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Department</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Phone</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Manager</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(employee => (
                                    <tr key={employee.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                    {employee.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="font-medium text-white">{employee.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{employee.role}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                                                {employee.department}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-sm">{employee.email}</td>
                                        <td className="px-4 py-3 text-gray-400 text-sm">{employee.phone}</td>
                                        <td className="px-4 py-3 text-gray-300">{employee.manager}</td>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {employees.map(employee => (
                            <div key={employee.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all group">
                                <div className="flex flex-col items-center text-center mb-4">
                                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-lg group-hover:scale-105 transition-transform">
                                        {employee.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <h3 className="font-semibold text-white text-lg">{employee.name}</h3>
                                    <p className="text-blue-400 text-sm mb-1">{employee.role}</p>
                                    <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                                        {employee.department}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm border-t border-gray-700 pt-4">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Mail size={14} />
                                        <span className="truncate">{employee.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Phone size={14} />
                                        <span>{employee.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <MapPin size={14} />
                                        <span>{employee.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Users size={14} />
                                        <span>Manager: {employee.manager}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center">
                                    <span className={`text-xs px-2 py-1 rounded-full ${employee.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {employee.status === 'active' ? 'Active' : 'On Leave'}
                                    </span>
                                    <button className="text-xs text-blue-400 hover:text-blue-300">View Profile</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showNewModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Add New Employee</h3>
                            <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateEmployee} className="space-y-3 text-sm">
                            <div>
                                <label className="block text-gray-300 mb-1">Full Name *</label>
                                <input type="text" required value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} placeholder="e.g. Sarah Jenkins" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">Job Position</label>
                                    <input type="text" value={empForm.role} onChange={e => setEmpForm({ ...empForm, role: e.target.value })} placeholder="Accountant" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Department</label>
                                    <input type="text" value={empForm.department} onChange={e => setEmpForm({ ...empForm, department: e.target.value })} className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">Email</label>
                                    <input type="email" value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} placeholder="sarah@company.com" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Phone</label>
                                    <input type="text" value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} placeholder="+1 555-0199" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300">Cancel</button>
                                <button type="submit" className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold">Save Employee</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
