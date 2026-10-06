"use client";

import { fetchAPI } from '@/lib/api';
import { useEffect, useState } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import {
    Plus,
    CalendarRange,
    User,
    Clock,
    CheckCircle2,
    Calendar,
    Users,
    Briefcase,
    Sparkles,
    Shield,
    X,
    Filter,
    Layers,
    TrendingUp,
    UserPlus,
    Trash2,
    Check,
    Lock,
    Download
} from "lucide-react";

const MENU_ITEMS = [
    { name: "Schedules", href: "/planning" },
    { name: "Projects", href: "/project" },
    { name: "Tasks", href: "/project/tasks" },
    { name: "Timesheets", href: "/timesheets" },
    { name: "Reporting", href: "/project/reporting" },
];

export type TeamMember = {
    id: string;
    name: string;
    role: string;
    department: string;
    email: string;
    avatarBg: string;
};

export type ShiftSlot = {
    id: string;
    employee_name: string;
    role: string;
    project_name: string;
    start_datetime: string;
    end_datetime: string;
    is_published: boolean;
    hours: number;
    color: string;
};

const INITIAL_TEAM_MEMBERS: TeamMember[] = [
    { id: "tm_1", name: "Salim Ghauri", role: "Principal Architect", department: "Engineering", email: "salim.ghauri@beraxis.online", avatarBg: "bg-blue-600" },
    { id: "tm_2", name: "Sarah Vance", role: "Lead UI/UX Designer", department: "Design", email: "sarah.vance@beraxis.online", avatarBg: "bg-pink-600" },
    { id: "tm_3", name: "Alexander Hayes", role: "AI & ML Engineer", department: "AI Labs", email: "alex.hayes@beraxis.online", avatarBg: "bg-cyan-600" },
    { id: "tm_4", name: "Bob Wilson", role: "Supply Chain Engineer", department: "Operations", email: "bob.wilson@beraxis.online", avatarBg: "bg-amber-600" },
    { id: "tm_5", name: "Jane Smith", role: "Mobile App Engineer", department: "Engineering", email: "jane.smith@beraxis.online", avatarBg: "bg-emerald-600" },
    { id: "tm_6", name: "Bilal Mahmood", role: "ERP Specialist & Controller", department: "Finance", email: "bilal.m@beraxis.online", avatarBg: "bg-purple-600" }
];

const INITIAL_SHIFTS: ShiftSlot[] = [
    {
        id: "shift_01",
        employee_name: "Salim Ghauri",
        role: "Principal Architect",
        project_name: "Enterprise Website & ERP Portal Redesign",
        start_datetime: "2026-03-09T09:00",
        end_datetime: "2026-03-09T17:00",
        is_published: true,
        hours: 8,
        color: "purple"
    },
    {
        id: "shift_02",
        employee_name: "Sarah Vance",
        role: "Lead UI/UX Designer",
        project_name: "Enterprise Website & ERP Portal Redesign",
        start_datetime: "2026-03-09T10:00",
        end_datetime: "2026-03-09T18:00",
        is_published: true,
        hours: 8,
        color: "pink"
    },
    {
        id: "shift_03",
        employee_name: "Alexander Hayes",
        role: "AI & ML Engineer",
        project_name: "AI Business Intelligence & Sales Copilot",
        start_datetime: "2026-03-10T09:00",
        end_datetime: "2026-03-10T17:30",
        is_published: true,
        hours: 8.5,
        color: "cyan"
    },
    {
        id: "shift_04",
        employee_name: "Bob Wilson",
        role: "Supply Chain Engineer",
        project_name: "Supply Chain & Multi-Warehouse Automation",
        start_datetime: "2026-03-11T08:30",
        end_datetime: "2026-03-11T16:30",
        is_published: false,
        hours: 8,
        color: "amber"
    },
    {
        id: "shift_05",
        employee_name: "Jane Smith",
        role: "Mobile App Engineer",
        project_name: "Mobile CRM & Field Agent iOS/Android App",
        start_datetime: "2026-03-12T09:00",
        end_datetime: "2026-03-12T17:00",
        is_published: true,
        hours: 8,
        color: "emerald"
    }
];

const PROJECTS_LIST = [
    "Enterprise Website & ERP Portal Redesign",
    "Mobile CRM & Field Agent iOS/Android App",
    "AI Business Intelligence & Sales Copilot",
    "Supply Chain & Multi-Warehouse Automation",
    "Infrastructure & Cloud Security Hardening"
];

export default function PlanningPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
    const [shifts, setShifts] = useState<ShiftSlot[]>(INITIAL_SHIFTS);
    const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Modals
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    // Shift Form State
    const [employeeName, setEmployeeName] = useState(INITIAL_TEAM_MEMBERS[0].name);
    const [role, setRole] = useState(INITIAL_TEAM_MEMBERS[0].role);
    const [projectName, setProjectName] = useState(PROJECTS_LIST[0]);
    const [startDatetime, setStartDatetime] = useState("2026-03-09T09:00");
    const [endDatetime, setEndDatetime] = useState("2026-03-09T17:00");
    const [isPublished, setIsPublished] = useState(true);

    // Add Member Form State
    const [newMemberName, setNewMemberName] = useState("");
    const [newMemberRole, setNewMemberRole] = useState("");
    const [newMemberDept, setNewMemberDept] = useState("Engineering");
    const [newMemberEmail, setNewMemberEmail] = useState("");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleCreateShift = (e: React.FormEvent) => {
        e.preventDefault();
        const start = new Date(startDatetime);
        const end = new Date(endDatetime);
        const durationHours = Math.max(1, parseFloat(((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1)));

        const member = teamMembers.find(m => m.name === employeeName);
        const color = member?.avatarBg.includes("pink") ? "pink" : member?.avatarBg.includes("cyan") ? "cyan" : member?.avatarBg.includes("amber") ? "amber" : "purple";

        const newShift: ShiftSlot = {
            id: `shift_${Date.now()}`,
            employee_name: employeeName,
            role: member?.role || role,
            project_name: projectName,
            start_datetime: startDatetime,
            end_datetime: endDatetime,
            is_published: isPublished,
            hours: durationHours,
            color: color
        };

        setShifts([newShift, ...shifts]);
        setIsShiftModalOpen(false);
        showToast(`📅 Scheduled shift for ${newShift.employee_name} (${durationHours} hrs)!`);
    };

    const handleAddTeamMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberName.trim()) return;

        const colors = ["bg-blue-600", "bg-purple-600", "bg-pink-600", "bg-emerald-600", "bg-cyan-600", "bg-amber-600", "bg-indigo-600"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newMem: TeamMember = {
            id: `tm_${Date.now()}`,
            name: newMemberName.trim(),
            role: newMemberRole.trim() || "Software Engineer",
            department: newMemberDept,
            email: newMemberEmail.trim() || `${newMemberName.toLowerCase().replace(/\s+/g, ".")}@beraxis.online`,
            avatarBg: randomColor
        };

        setTeamMembers([...teamMembers, newMem]);
        setNewMemberName("");
        setNewMemberRole("");
        setNewMemberEmail("");
        showToast(`👤 Added "${newMem.name}" (${newMem.role}) to Planning Roster!`);
    };

    const handleRemoveTeamMember = (id: string, name: string) => {
        setTeamMembers(teamMembers.filter(m => m.id !== id));
        if (selectedEmployeeFilter === name) {
            setSelectedEmployeeFilter("all");
        }
        showToast(`🗑️ Removed ${name} from Planning Roster.`);
    };

    const togglePublishStatus = (id: string) => {
        setShifts(shifts.map(s => s.id === id ? { ...s, is_published: !s.is_published } : s));
    };

    const totalPlannedHours = shifts.reduce((acc, curr) => acc + curr.hours, 0);
    const activeStaffCount = new Set(shifts.map(s => s.employee_name)).size;
    const publishedCount = shifts.filter(s => s.is_published).length;

    const filteredShifts = shifts.filter(s => {
        const matchesEmployee = selectedEmployeeFilter === "all" || s.employee_name === selectedEmployeeFilter;
        const matchesSearch =
            s.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.role.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesEmployee && matchesSearch;
    });

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0d14] text-white">
            <StandardModuleHeader
                moduleName="Planning"
                moduleIcon={<CalendarRange size={20} className="text-yellow-400" />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search shift, engineer, or project..."
                onSearch={setSearchQuery}
                onNewClick={() => setIsShiftModalOpen(true)}
                newButtonText="+ Schedule Shift"
            />

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-16 right-6 z-50 bg-yellow-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-yellow-900/50 flex items-center gap-3 border border-yellow-400 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Sparkles size={18} className="animate-spin text-yellow-200" />
                    <span className="text-sm font-medium">{toastMsg}</span>
                </div>
            )}

            <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/60 p-4 rounded-2xl border border-gray-800 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                                Team Resource & Shift Planning
                            </h2>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-semibold">
                                {teamMembers.length} Team Members
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Allocate sprint engineering shifts, balance workloads, and manage company team rosters
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={() => setIsTeamModalOpen(true)}
                            className="bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                        >
                            <Users size={15} className="text-yellow-400" /> Manage Team Roster ({teamMembers.length})
                        </button>
                        <button
                            onClick={() => setIsShiftModalOpen(true)}
                            className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-yellow-600/30 transition transform hover:-translate-y-0.5"
                        >
                            <Plus size={16} /> + Schedule Shift
                        </button>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-gray-900/80 to-yellow-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Total Planned Capacity</span>
                            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                <Clock size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-white">{totalPlannedHours.toFixed(1)} hrs</div>
                        <div className="text-[11px] text-gray-400 mt-1">Across all active scheduled sprints</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-purple-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Active Roster Members</span>
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                <Users size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-purple-300">{teamMembers.length} Members</div>
                        <div className="text-[11px] text-purple-300 mt-1">{activeStaffCount} currently scheduled on shifts</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-emerald-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Published Shifts</span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-emerald-400">{publishedCount} / {shifts.length}</div>
                        <div className="text-[11px] text-emerald-300 mt-1">Synced with Beraxis Calendar</div>
                    </div>
                </div>

                {/* Team Members Filter Strip */}
                <div className="flex items-center justify-between flex-wrap gap-3 bg-gray-900/40 p-3 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                        <button
                            onClick={() => setSelectedEmployeeFilter("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                selectedEmployeeFilter === "all"
                                    ? "bg-yellow-600 text-white shadow-md shadow-yellow-600/30"
                                    : "bg-gray-800 text-gray-400 hover:text-white"
                            }`}
                        >
                            All Members ({shifts.length})
                        </button>
                        {teamMembers.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedEmployeeFilter(m.name)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                                    selectedEmployeeFilter === m.name
                                        ? "bg-yellow-600 text-white shadow-md shadow-yellow-600/30"
                                        : "bg-gray-800 text-gray-400 hover:text-white"
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${m.avatarBg}`} />
                                <span>{m.name}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsTeamModalOpen(true)}
                        className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 cursor-pointer"
                    >
                        <UserPlus size={14} /> Add / Remove People
                    </button>
                </div>

                {/* Shifts Timeline Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredShifts.map((shift) => {
                        const member = teamMembers.find(m => m.name === shift.employee_name);
                        return (
                            <div
                                key={shift.id}
                                className="bg-gray-900/80 border border-gray-800 hover:border-yellow-500/50 rounded-2xl p-5 shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between backdrop-blur-xl"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shadow ${member?.avatarBg || "bg-yellow-600"}`}>
                                                {shift.employee_name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-sm">{shift.employee_name}</h3>
                                                <p className="text-[11px] text-gray-400">{shift.role}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => togglePublishStatus(shift.id)}
                                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border transition cursor-pointer ${
                                                shift.is_published
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            }`}
                                        >
                                            {shift.is_published ? "Published" : "Draft"}
                                        </button>
                                    </div>

                                    <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800 space-y-2 mb-4 text-xs">
                                        <div className="flex items-center gap-1.5 text-yellow-300 font-semibold">
                                            <Briefcase size={13} />
                                            <span className="line-clamp-1">{shift.project_name}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-gray-400 text-[11px]">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} /> {shift.start_datetime.split("T")[0]}
                                            </span>
                                            <span className="flex items-center gap-1 font-mono text-gray-300">
                                                <Clock size={12} /> {shift.start_datetime.split("T")[1]} - {shift.end_datetime.split("T")[1]}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-xs">
                                    <span className="text-gray-400">Shift Duration</span>
                                    <span className="font-bold font-mono text-yellow-400 text-sm">
                                        {shift.hours} hrs
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal 1: Manage Team Roster */}
            {isTeamModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsTeamModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20">
                                <Users size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Manage Planning Team Roster</h3>
                                <p className="text-xs text-gray-400">Add, view, or remove company staff available for scheduling</p>
                            </div>
                        </div>

                        {/* Add Member Form */}
                        <form onSubmit={handleAddTeamMember} className="bg-gray-950/70 p-4 rounded-xl border border-gray-800 mb-5 space-y-3">
                            <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                                <UserPlus size={14} /> + Add New Team Member to Roster
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                        placeholder="e.g. Tariq Mansoor"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">Designation / Role *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newMemberRole}
                                        onChange={(e) => setNewMemberRole(e.target.value)}
                                        placeholder="e.g. Cloud Security Specialist"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">Department</label>
                                    <select
                                        value={newMemberDept}
                                        onChange={(e) => setNewMemberDept(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                                    >
                                        <option value="Engineering">Engineering</option>
                                        <option value="Design">Design</option>
                                        <option value="Operations">Operations</option>
                                        <option value="AI Labs">AI Labs</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Product">Product</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">Work Email</label>
                                    <input
                                        type="email"
                                        value={newMemberEmail}
                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                        placeholder="e.g. tariq.m@beraxis.online"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-yellow-600/30 transition flex items-center gap-1.5"
                                >
                                    <UserPlus size={14} /> Add to Planning
                                </button>
                            </div>
                        </form>

                        {/* Existing Roster List */}
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Active Members ({teamMembers.length})
                            </div>
                            {teamMembers.map((m) => (
                                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-950/50 border border-gray-800 hover:border-gray-700 transition">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shadow ${m.avatarBg}`}>
                                            {m.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-xs">{m.name}</div>
                                            <div className="text-[11px] text-gray-400">{m.role} • <span className="text-yellow-400">{m.department}</span></div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveTeamMember(m.id, m.name)}
                                        className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                                        title="Remove member from planning roster"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 2: Schedule Shift */}
            {isShiftModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsShiftModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20">
                                <CalendarRange size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Schedule Team Shift</h3>
                                <p className="text-xs text-gray-400">Allocate resource capacity to sprint project</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateShift} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Select Team Member *</label>
                                <select
                                    value={employeeName}
                                    onChange={(e) => {
                                        setEmployeeName(e.target.value);
                                        const mem = teamMembers.find(m => m.name === e.target.value);
                                        if (mem) setRole(mem.role);
                                    }}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500"
                                >
                                    {teamMembers.map(m => (
                                        <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Project Allocation *</label>
                                <select
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500"
                                >
                                    {PROJECTS_LIST.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Start Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={startDatetime}
                                        onChange={(e) => setStartDatetime(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">End Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={endDatetime}
                                        onChange={(e) => setEndDatetime(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="publishShift"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    className="w-4 h-4 rounded text-yellow-600 focus:ring-yellow-500"
                                />
                                <label htmlFor="publishShift" className="text-xs text-gray-300 font-medium">
                                    Publish immediately to team calendar & notify member
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsShiftModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-yellow-600/30"
                                >
                                    Confirm Shift Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
