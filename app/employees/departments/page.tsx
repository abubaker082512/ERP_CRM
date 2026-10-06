"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { Users, Building, Plus, Trash2, Edit, MapPin, DollarSign, UserCheck, Shield } from "lucide-react";

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
    headcountTarget: number;
    location: string;
    budget: string;
};

const INITIAL_DEPARTMENTS: Department[] = [
    { id: "DEP-01", name: "Engineering", manager: "Salim Ghauri", headcountTarget: 12, location: "San Francisco / Remote", budget: "$450,000" },
    { id: "DEP-02", name: "Design", manager: "Sarah Vance", headcountTarget: 6, location: "New York", budget: "$180,000" },
    { id: "DEP-03", name: "Finance", manager: "Bilal Mahmood", headcountTarget: 4, location: "Chicago", budget: "$220,000" },
    { id: "DEP-04", name: "Operations", manager: "Marcus Jenkins", headcountTarget: 8, location: "Seattle / Dubai", budget: "$310,000" },
    { id: "DEP-05", name: "Sales & Marketing", manager: "Alex Vance", headcountTarget: 10, location: "London / Remote", budget: "$280,000" },
    { id: "DEP-06", name: "Human Resources", manager: "Elena Rostova", headcountTarget: 3, location: "San Francisco", budget: "$140,000" },
];

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [manager, setManager] = useState("");
    const [location, setLocation] = useState("San Francisco / Remote");
    const [budget, setBudget] = useState("$250,000");
    const [headcount, setHeadcount] = useState(5);

    useEffect(() => {
        const saved = localStorage.getItem("company_departments");
        if (saved) {
            try { setDepartments(JSON.parse(saved)); } catch {}
        }
    }, []);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const newDept: Department = {
            id: `DEP-0${departments.length + 1}`,
            name: name.trim(),
            manager: manager.trim() || "Department Lead",
            headcountTarget: Number(headcount) || 5,
            location,
            budget
        };

        const updated = [...departments, newDept];
        setDepartments(updated);
        localStorage.setItem("company_departments", JSON.stringify(updated));
        setIsAddModalOpen(false);
        setName("");
        setManager("");
    };

    const handleDelete = (id: string, deptName: string) => {
        if (confirm(`Are you sure you want to delete ${deptName}?`)) {
            const updated = departments.filter(d => d.id !== id);
            setDepartments(updated);
            localStorage.setItem("company_departments", JSON.stringify(updated));
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0d14] text-white">
            <StandardModuleHeader
                moduleName="Employees"
                moduleIcon={<Users size={20} className="text-indigo-400" />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search departments..."
            />

            <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between bg-[#111622] p-4 rounded-2xl border border-gray-800">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Company Departments & Units</h2>
                        <p className="text-xs text-gray-400 mt-1">Configure business units, leadership assignments, and budget allocations.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
                    >
                        <Plus size={15} /> + New Department
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {departments.map(dept => (
                        <div key={dept.id} className="galaxy-card bg-[#111622] border border-gray-800 rounded-2xl p-5 hover:border-indigo-500/40 transition space-y-4 shadow-xl">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                                        <Building size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">{dept.name}</h3>
                                        <p className="text-xs text-gray-400">Lead: <strong className="text-gray-200">{dept.manager}</strong></p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(dept.id, dept.name)}
                                    className="p-1 text-gray-500 hover:text-red-400 transition"
                                    title="Delete Department"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>

                            <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 space-y-1.5 text-xs text-gray-300">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Location:</span>
                                    <span>{dept.location}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Target Headcount:</span>
                                    <span className="font-bold text-indigo-400">{dept.headcountTarget} Staff</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Annual Budget:</span>
                                    <span className="font-bold text-emerald-400">{dept.budget}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CREATE DEPARTMENT MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleCreate} className="bg-[#111622] border border-gray-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Building size={20} className="text-indigo-400" /> Create Company Department
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Department Name *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Artificial Intelligence Research"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Department Head</label>
                                <input
                                    type="text"
                                    value={manager}
                                    onChange={e => setManager(e.target.value)}
                                    placeholder="e.g. Salim Ghauri"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Headcount</label>
                                <input
                                    type="number"
                                    value={headcount}
                                    onChange={e => setHeadcount(Number(e.target.value))}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Annual Budget</label>
                                <input
                                    type="text"
                                    value={budget}
                                    onChange={e => setBudget(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
                            >
                                Create Department
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
