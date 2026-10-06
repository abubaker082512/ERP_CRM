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
    Filter
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

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

const INITIAL_EMPLOYEES: Employee[] = [
    { id: "EMP001", name: "Salim Ghauri", role: "Principal Architect", department: "Engineering", email: "salim.ghauri@beraxis.online", phone: "+1 555 0101", location: "San Francisco, CA", status: "active", manager: "Executive Board", avatarBg: "bg-blue-600", salary: 145000, joined_date: "2024-01-15" },
    { id: "EMP002", name: "Sarah Vance", role: "Lead UI/UX Designer", department: "Design", email: "sarah.vance@beraxis.online", phone: "+1 555 0102", location: "New York, NY", status: "active", manager: "Salim Ghauri", avatarBg: "bg-pink-600", salary: 120000, joined_date: "2024-03-01" },
    { id: "EMP003", name: "Bilal Mahmood", role: "ERP Specialist & Controller", department: "Finance", email: "bilal.mahmood@beraxis.online", phone: "+1 555 0103", location: "Chicago, IL", status: "active", manager: "Executive Board", avatarBg: "bg-emerald-600", salary: 130000, joined_date: "2024-02-10" },
    { id: "EMP004", name: "Jane Smith", role: "Mobile Engineering Lead", department: "Engineering", email: "jane.smith@beraxis.online", phone: "+1 555 0104", location: "Austin, TX", status: "active", manager: "Salim Ghauri", avatarBg: "bg-purple-600", salary: 128000, joined_date: "2024-04-12" },
    { id: "EMP005", name: "Marcus Jenkins", role: "DevOps & Cloud Engineer", department: "Operations", email: "marcus.j@beraxis.online", phone: "+1 555 0105", location: "Seattle, WA", status: "active", manager: "Salim Ghauri", avatarBg: "bg-cyan-600", salary: 118000, joined_date: "2024-05-01" },
    { id: "EMP006", name: "Bob Wilson", role: "Supply Chain & Logistics Specialist", department: "Operations", email: "bob.wilson@beraxis.online", phone: "+1 555 0106", location: "Boston, MA", status: "on_leave", manager: "Marcus Jenkins", avatarBg: "bg-amber-600", salary: 95000, joined_date: "2024-06-15" }
];

const DEPARTMENTS = ["All Departments", "Engineering", "Design", "Finance", "Operations", "Sales", "HR"];

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");
    const [selectedDept, setSelectedDept] = useState<string>("All Departments");
    const [searchQuery, setSearchQuery] = useState("");
    const [toastMsg, setToastMsg] = useState("");

    // Create Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [department, setDepartment] = useState("Engineering");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("San Francisco, CA");
    const [manager, setManager] = useState("Salim Ghauri");
    const [salary, setSalary] = useState(100000);

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
        showToast(`🎉 Onboarded "${newEmp.name}" (${newEmp.role}) to Beraxis directory!`);
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

            <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/60 p-4 rounded-2xl border border-gray-800 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                                Human Resources & Employees Directory
                            </h2>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                                {employees.length} Active Staff
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Staff profiles, organization structure, departments, compensation & contract records
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
                            <Download size={15} className="text-emerald-400" /> Export CSV
                        </button>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-1.5"
                        >
                            <Plus size={16} /> + Onboard Employee
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-gray-900/80 to-indigo-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Total Headcount</span>
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                <Users size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-white">{employees.length} Members</div>
                        <div className="text-[11px] text-gray-400 mt-1">{employees.filter(e => e.status === "active").length} actively on duty</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-purple-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Operating Departments</span>
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                <Building2 size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-purple-300">{new Set(employees.map(e => e.department)).size} Teams</div>
                        <div className="text-[11px] text-purple-300 mt-1">Cross-functional team structure</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-emerald-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Annual Payroll Base</span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Briefcase size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-emerald-400">${employees.reduce((sum, e) => sum + e.salary, 0).toLocaleString()}</div>
                        <div className="text-[11px] text-emerald-300 mt-1">Synced with Beraxis Payroll</div>
                    </div>
                </div>

                {/* Department Filter Strip */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {DEPARTMENTS.map(dept => (
                        <button
                            key={dept}
                            onClick={() => setSelectedDept(dept)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                selectedDept === dept
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                    : "bg-gray-800/80 text-gray-400 hover:text-white"
                            }`}
                        >
                            {dept}
                        </button>
                    ))}
                </div>

                {/* Employees View: List or Kanban */}
                {currentView === "list" ? (
                    <div className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] border-b border-gray-800 font-semibold">
                                    <tr>
                                        <th className="px-5 py-3.5">Employee Name</th>
                                        <th className="px-4 py-3.5">Job Position</th>
                                        <th className="px-4 py-3.5">Department</th>
                                        <th className="px-4 py-3.5">Contact Email</th>
                                        <th className="px-4 py-3.5">Phone</th>
                                        <th className="px-4 py-3.5">Reporting Manager</th>
                                        <th className="px-5 py-3.5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/60">
                                    {filteredEmployees.map(emp => (
                                        <tr key={emp.id} className="hover:bg-indigo-950/10 transition">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shadow ${emp.avatarBg}`}>
                                                        {emp.name.split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{emp.name}</div>
                                                        <div className="text-[11px] text-gray-400 font-mono">{emp.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-gray-200">{emp.role}</td>
                                            <td className="px-4 py-3.5">
                                                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold">
                                                    {emp.department}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-300 font-mono text-[11px]">{emp.email}</td>
                                            <td className="px-4 py-3.5 text-gray-400">{emp.phone}</td>
                                            <td className="px-4 py-3.5 text-gray-300">{emp.manager}</td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    emp.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                    "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Kanban Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEmployees.map(emp => (
                            <div
                                key={emp.id}
                                className="bg-gray-900/80 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-xl transition-all duration-200 hover:-translate-y-1 backdrop-blur-xl flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-2xl text-white font-bold text-sm flex items-center justify-center shadow-lg ${emp.avatarBg}`}>
                                                {emp.name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-base">{emp.name}</h3>
                                                <p className="text-xs text-indigo-400 font-medium">{emp.role}</p>
                                            </div>
                                        </div>

                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            emp.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        }`}>
                                            {emp.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-xs bg-gray-950/60 p-3.5 rounded-xl border border-gray-800 mb-4">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Building2 size={14} className="text-gray-500" />
                                            <span>Department: <span className="font-semibold text-white">{emp.department}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Mail size={14} className="text-gray-500" />
                                            <span className="font-mono text-[11px] text-indigo-300">{emp.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <MapPin size={14} className="text-gray-500" />
                                            <span>{emp.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-xs">
                                    <span className="text-gray-400">Reports to: <span className="text-white font-medium">{emp.manager}</span></span>
                                    <span className="font-bold text-emerald-400 font-mono">${(emp.salary / 1000).toFixed(0)}k/yr</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: Onboard Employee */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                                <Users size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Onboard New Employee</h3>
                                <p className="text-xs text-gray-400">Create employee record, role assignment & payroll structure</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateEmployee} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Legal Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Tariq Mansoor"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Job Designation *</label>
                                    <input
                                        type="text"
                                        required
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        placeholder="e.g. Senior Backend Engineer"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Department</label>
                                    <select
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="Engineering">Engineering</option>
                                        <option value="Design">Design</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Sales">Sales</option>
                                        <option value="HR">HR</option>
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
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="tariq.m@beraxis.online"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+1 555 0199"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Office Location</label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="San Francisco, CA"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Annual Base Salary ($)</label>
                                    <input
                                        type="number"
                                        value={salary}
                                        onChange={(e) => setSalary(Number(e.target.value))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                                >
                                    Confirm Onboarding
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
