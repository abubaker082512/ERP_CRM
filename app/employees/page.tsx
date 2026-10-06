"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import {
    Users,
    Briefcase,
    MapPin,
    Mail,
    Phone,
    Plus,
    CheckCircle2,
    Clock,
    Building2,
    Sparkles,
    Trash2,
    Download,
    Search,
    Shield,
    X,
    Filter,
    Edit,
    FolderPlus
} from "lucide-react";
import Link from "next/link";

const MENU_ITEMS = [
    { name: "Employees", href: "/employees" },
    { name: "Departments", href: "/employees/departments" },
    { name: "Contracts", href: "/employees/contracts" },
    { name: "Reporting", href: "/employees/reporting" },
    { name: "Configuration", href: "/employees/configuration" },
];

export type Employee = {
    id: string;
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    location: string;
    status: "active" | "on_leave" | "probation";
    manager: string;
    avatarBg: string;
    salary: number;
    joined_date: string;
};

export type DepartmentItem = {
    id: string;
    name: string;
    manager: string;
    headcountTarget: number;
    location: string;
    budget: string;
};

const INITIAL_DEPARTMENTS: DepartmentItem[] = [
    { id: "DEP-01", name: "Engineering", manager: "Salim Ghauri", headcountTarget: 12, location: "San Francisco / Remote", budget: "$450,000" },
    { id: "DEP-02", name: "Design", manager: "Sarah Vance", headcountTarget: 6, location: "New York", budget: "$180,000" },
    { id: "DEP-03", name: "Finance", manager: "Bilal Mahmood", headcountTarget: 4, location: "Chicago", budget: "$220,000" },
    { id: "DEP-04", name: "Operations", manager: "Marcus Jenkins", headcountTarget: 8, location: "Seattle / Dubai", budget: "$310,000" },
    { id: "DEP-05", name: "Sales & Marketing", manager: "Alex Vance", headcountTarget: 10, location: "London / Remote", budget: "$280,000" },
    { id: "DEP-06", name: "Human Resources", manager: "Elena Rostova", headcountTarget: 3, location: "San Francisco", budget: "$140,000" },
];

const INITIAL_EMPLOYEES: Employee[] = [
    { id: "EMP001", name: "Salim Ghauri", role: "Principal Architect", department: "Engineering", email: "salim.ghauri@beraxis.online", phone: "+1 555 0101", location: "San Francisco, CA", status: "active", manager: "Executive Board", avatarBg: "bg-blue-600", salary: 145000, joined_date: "2024-01-15" },
    { id: "EMP002", name: "Sarah Vance", role: "Lead UI/UX Designer", department: "Design", email: "sarah.vance@beraxis.online", phone: "+1 555 0102", location: "New York, NY", status: "active", manager: "Salim Ghauri", avatarBg: "bg-pink-600", salary: 120000, joined_date: "2024-03-01" },
    { id: "EMP003", name: "Bilal Mahmood", role: "ERP Specialist & Controller", department: "Finance", email: "bilal.mahmood@beraxis.online", phone: "+1 555 0103", location: "Chicago, IL", status: "active", manager: "Executive Board", avatarBg: "bg-emerald-600", salary: 130000, joined_date: "2024-02-10" },
    { id: "EMP004", name: "Jane Smith", role: "Mobile Engineering Lead", department: "Engineering", email: "jane.smith@beraxis.online", phone: "+1 555 0104", location: "Austin, TX", status: "active", manager: "Salim Ghauri", avatarBg: "bg-purple-600", salary: 128000, joined_date: "2024-04-12" },
    { id: "EMP005", name: "Marcus Jenkins", role: "DevOps & Cloud Engineer", department: "Operations", email: "marcus.j@beraxis.online", phone: "+1 555 0105", location: "Seattle, WA", status: "active", manager: "Salim Ghauri", avatarBg: "bg-cyan-600", salary: 118000, joined_date: "2024-05-01" },
    { id: "EMP006", name: "Bob Wilson", role: "Supply Chain Specialist", department: "Operations", email: "bob.wilson@beraxis.online", phone: "+1 555 0106", location: "Boston, MA", status: "on_leave", manager: "Marcus Jenkins", avatarBg: "bg-amber-600", salary: 95000, joined_date: "2024-06-15" }
];

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
    const [departments, setDepartments] = useState<DepartmentItem[]>(INITIAL_DEPARTMENTS);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");
    const [selectedDept, setSelectedDept] = useState<string>("All Departments");
    const [searchQuery, setSearchQuery] = useState("");
    const [toastMsg, setToastMsg] = useState("");

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

    // Onboard Employee Form State
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [department, setDepartment] = useState("Engineering");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("San Francisco, CA");
    const [manager, setManager] = useState("Salim Ghauri");
    const [salary, setSalary] = useState(100000);

    // New Department Form State
    const [newDeptName, setNewDeptName] = useState("");
    const [newDeptManager, setNewDeptManager] = useState("");
    const [newDeptLocation, setNewDeptLocation] = useState("San Francisco / Remote");
    const [newDeptBudget, setNewDeptBudget] = useState("$200,000");

    useEffect(() => {
        const savedDepts = localStorage.getItem("company_departments");
        if (savedDepts) {
            try { setDepartments(JSON.parse(savedDepts)); } catch {}
        }
    }, []);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleCreateEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;

        const colors = ["bg-blue-600", "bg-purple-600", "bg-pink-600", "bg-emerald-600", "bg-cyan-600", "bg-amber-600", "bg-indigo-600"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newEmp: Employee = {
            id: `EMP00${employees.length + 1}`,
            name: name.trim(),
            role: role.trim() || "Software Engineer",
            department,
            email: email.trim(),
            phone: phone.trim() || "+1 555 0199",
            location,
            status: "active",
            manager,
            avatarBg: randomColor,
            salary: Number(salary) || 90000,
            joined_date: new Date().toISOString().slice(0, 10)
        };

        setEmployees([newEmp, ...employees]);
        setIsAddModalOpen(false);
        setName("");
        setRole("");
        setEmail("");
        setPhone("");
        showToast(`🎉 Onboarded "${newEmp.name}" (${newEmp.role}) to ${newEmp.department}!`);
    };

    const handleCreateDepartment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeptName.trim()) return;

        const newDept: DepartmentItem = {
            id: `DEP-0${departments.length + 1}`,
            name: newDeptName.trim(),
            manager: newDeptManager.trim() || "Executive Director",
            headcountTarget: 5,
            location: newDeptLocation,
            budget: newDeptBudget
        };

        const updated = [...departments, newDept];
        setDepartments(updated);
        localStorage.setItem("company_departments", JSON.stringify(updated));
        setDepartment(newDept.name);
        setIsDeptModalOpen(false);
        setNewDeptName("");
        setNewDeptManager("");
        showToast(`🏢 Created department "${newDept.name}" successfully!`);
    };

    const handleDeleteDepartment = (deptId: string, deptName: string) => {
        if (confirm(`Are you sure you want to remove the "${deptName}" department?`)) {
            const updated = departments.filter(d => d.id !== deptId);
            setDepartments(updated);
            localStorage.setItem("company_departments", JSON.stringify(updated));
            if (selectedDept === deptName) setSelectedDept("All Departments");
            showToast(`🗑️ Removed department "${deptName}"`);
        }
    };

    const handleExportCSV = () => {
        const headers = ["Employee ID", "Full Name", "Job Role", "Department", "Work Email", "Phone", "Location", "Manager", "Status", "Salary", "Joined Date"];
        const rows = employees.map(e => [
            e.id,
            `"${e.name}"`,
            `"${e.role}"`,
            `"${e.department}"`,
            `"${e.email}"`,
            `"${e.phone}"`,
            `"${e.location}"`,
            `"${e.manager}"`,
            e.status,
            e.salary,
            e.joined_date
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `beraxis_employee_directory_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("📥 Exported Employee Directory CSV!");
    };

    const filteredEmployees = employees.filter(e => {
        const matchesDept = selectedDept === "All Departments" || e.department === selectedDept;
        const matchesSearch =
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.department.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDept && matchesSearch;
    });

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0d14] text-white">
            <StandardModuleHeader
                moduleName="Employees"
                moduleIcon={<Users size={20} className="text-indigo-400" />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search employee name, role, email..."
                onSearch={setSearchQuery}
                onNewClick={() => setIsAddModalOpen(true)}
                newButtonText="+ New Employee"
            />

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-16 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-indigo-900/50 flex items-center gap-3 border border-indigo-400 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Sparkles size={18} className="animate-spin text-indigo-200" />
                    <span className="text-sm font-medium">{toastMsg}</span>
                </div>
            )}

            <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111622] p-4 rounded-2xl border border-gray-800">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                                Employees & Organizational Structure
                            </h2>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                                {employees.length} Staff Members
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Manage your enterprise headcount, compensation, reporting lines, and company departments.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />

                        <button
                            onClick={handleExportCSV}
                            className="bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                        >
                            <Download size={14} className="text-emerald-400" /> Export CSV
                        </button>

                        <button
                            onClick={() => setIsDeptModalOpen(true)}
                            className="bg-gray-800 hover:bg-gray-700 text-purple-300 border border-purple-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        >
                            <Building2 size={14} /> Manage Departments ({departments.length})
                        </button>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                        >
                            <Plus size={15} /> + Onboard Employee
                        </button>
                    </div>
                </div>

                {/* Departments Quick Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                        onClick={() => setSelectedDept("All Departments")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                            selectedDept === "All Departments" ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40" : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
                        }`}
                    >
                        All Departments ({employees.length})
                    </button>
                    {departments.map(d => {
                        const count = employees.filter(e => e.department.toLowerCase() === d.name.toLowerCase()).length;
                        return (
                            <button
                                key={d.id}
                                onClick={() => setSelectedDept(d.name)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                                    selectedDept === d.name ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40" : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
                                }`}
                            >
                                <span>{d.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-800 text-gray-300">{count}</span>
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setIsDeptModalOpen(true)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-purple-400 hover:text-purple-300 hover:bg-purple-600/10 border border-purple-500/20 whitespace-nowrap flex items-center gap-1"
                    >
                        <Plus size={13} /> Add Dept
                    </button>
                </div>

                {/* KANBAN / LIST VIEW */}
                {currentView === "kanban" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredEmployees.map(emp => (
                            <div
                                key={emp.id}
                                className="galaxy-card p-5 border border-gray-800 hover:border-indigo-500/40 bg-[#111622] rounded-2xl transition space-y-4 shadow-xl"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-2xl ${emp.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                                            {emp.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white">{emp.name}</h3>
                                            <p className="text-xs text-indigo-400 font-semibold">{emp.role}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                        emp.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                    }`}>
                                        {emp.status.replace("_", " ")}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-xs text-gray-300 bg-gray-900/60 p-3 rounded-xl border border-gray-800/80">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Department:</span>
                                        <span className="font-semibold text-white">{emp.department}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Reports To:</span>
                                        <span className="font-semibold text-gray-300">{emp.manager}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Compensation:</span>
                                        <span className="font-bold text-emerald-400 font-mono">${emp.salary.toLocaleString()} / yr</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Mail size={12} className="text-gray-500" />
                                        <span className="truncate max-w-[150px]">{emp.email}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500">Joined {emp.joined_date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="galaxy-card bg-[#111622] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-gray-900/90 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-800 tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Employee Name</th>
                                    <th className="px-4 py-3">Designation</th>
                                    <th className="px-4 py-3">Department</th>
                                    <th className="px-4 py-3">Work Contact</th>
                                    <th className="px-4 py-3">Annual Salary</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60">
                                {filteredEmployees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-gray-800/40">
                                        <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-xl ${emp.avatarBg} text-white font-bold flex items-center justify-center text-xs`}>
                                                {emp.name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <span>{emp.name}</span>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-indigo-300 font-semibold">{emp.role}</td>
                                        <td className="px-4 py-3.5 text-xs text-gray-300">{emp.department}</td>
                                        <td className="px-4 py-3.5 text-xs text-gray-400">
                                            <div>{emp.email}</div>
                                            <div className="text-[11px] text-gray-500">{emp.phone}</div>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs font-mono font-bold text-emerald-400">${emp.salary.toLocaleString()}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                emp.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                            }`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL 1: ONBOARD EMPLOYEE */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleCreateEmployee} className="bg-[#111622] border border-gray-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Users size={20} className="text-indigo-400" /> Onboard New Employee
                            </h3>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Full Legal Name *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Dr. Alex Thorne"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Job Role / Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    placeholder="e.g. Senior Backend Engineer"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-semibold text-gray-300">Department</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsDeptModalOpen(true)}
                                        className="text-[10px] text-purple-400 hover:underline font-bold"
                                    >
                                        + New Dept
                                    </button>
                                </div>
                                <select
                                    value={department}
                                    onChange={e => setDepartment(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                >
                                    {departments.map(d => (
                                        <option key={d.id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Work Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+1 555 0199"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Annual Salary (USD)</label>
                                <input
                                    type="number"
                                    value={salary}
                                    onChange={e => setSalary(Number(e.target.value))}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Location / Office</label>
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
                                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
                            >
                                Complete Onboarding
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL 2: MANAGE & ADD DEPARTMENTS */}
            {isDeptModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#111622] border border-gray-700 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Building2 size={20} className="text-purple-400" /> Company Departments Manager
                            </h3>
                            <button type="button" onClick={() => setIsDeptModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Add Department Form */}
                        <form onSubmit={handleCreateDepartment} className="bg-gray-950 p-4 rounded-2xl border border-gray-800 space-y-3">
                            <span className="text-xs font-bold uppercase text-purple-400 tracking-wider block">Add New Department</span>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">Department Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDeptName}
                                        onChange={e => setNewDeptName(e.target.value)}
                                        placeholder="e.g. Artificial Intelligence Labs"
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">Department Head / Manager</label>
                                    <input
                                        type="text"
                                        value={newDeptManager}
                                        onChange={e => setNewDeptManager(e.target.value)}
                                        placeholder="e.g. Dr. Sarah Jenkins"
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                                >
                                    <FolderPlus size={13} /> Save Department
                                </button>
                            </div>
                        </form>

                        {/* Current Departments List */}
                        <div className="flex-1 overflow-y-auto space-y-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Active Departments ({departments.length})</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {departments.map(d => {
                                    const count = employees.filter(e => e.department.toLowerCase() === d.name.toLowerCase()).length;
                                    return (
                                        <div key={d.id} className="p-3.5 bg-gray-900/80 rounded-xl border border-gray-800 flex justify-between items-center">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{d.name}</h4>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Head: {d.manager} • {count} active staff</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteDepartment(d.id, d.name)}
                                                className="p-1 text-gray-500 hover:text-red-400 transition"
                                                title="Delete Department"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-800">
                            <button
                                type="button"
                                onClick={() => setIsDeptModalOpen(false)}
                                className="px-4 py-2 bg-gray-800 text-white rounded-xl text-xs font-bold"
                            >
                                Close Manager
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
