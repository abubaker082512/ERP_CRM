"use client";

import { fetchAPI } from '@/lib/api';
import { useEffect, useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
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
    TrendingUp
} from "lucide-react";

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

export default function PlanningPage() {
    const [shifts, setShifts] = useState<ShiftSlot[]>(INITIAL_SHIFTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState("all");

    // Modal Form State
    const [employeeName, setEmployeeName] = useState("Salim Ghauri");
    const [role, setRole] = useState("Principal Architect");
    const [projectName, setProjectName] = useState("Enterprise Website & ERP Portal Redesign");
    const [startDatetime, setStartDatetime] = useState("2026-03-09T09:00");
    const [endDatetime, setEndDatetime] = useState("2026-03-09T17:00");
    const [isPublished, setIsPublished] = useState(true);

    const [toastMsg, setToastMsg] = useState("");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleCreateShift = (e: React.FormEvent) => {
        e.preventDefault();
        const start = new Date(startDatetime);
        const end = new Date(endDatetime);
        const durationHours = Math.max(1, parseFloat(((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1)));

        const newShift: ShiftSlot = {
            id: `shift_${Date.now()}`,
            employee_name: employeeName,
            role,
            project_name: projectName,
            start_datetime: startDatetime,
            end_datetime: endDatetime,
            is_published: isPublished,
            hours: durationHours,
            color: employeeName.includes("Sarah") ? "pink" : employeeName.includes("Alexander") ? "cyan" : "purple"
        };

        setShifts([newShift, ...shifts]);
        setIsModalOpen(false);
        showToast(`📅 Scheduled shift for ${newShift.employee_name} (${durationHours} hrs)!`);
    };

    const togglePublishStatus = (id: string) => {
        setShifts(shifts.map(s => s.id === id ? { ...s, is_published: !s.is_published } : s));
    };

    const totalPlannedHours = shifts.reduce((acc, curr) => acc + curr.hours, 0);
    const activeStaffCount = new Set(shifts.map(s => s.employee_name)).size;
    const publishedCount = shifts.filter(s => s.is_published).length;

    const filteredShifts = selectedEmployeeFilter === "all"
        ? shifts
        : shifts.filter(s => s.employee_name === selectedEmployeeFilter);

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <AppHeader title="Resource Planning & Shift Scheduling" />

            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
                {/* Hero Banner */}
                <div className="bg-gradient-to-r from-cyan-900/40 via-[#1E293B] to-purple-900/30 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                                    <CalendarRange size={22} />
                                </span>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    Team Resource Planning & Work Allocation
                                </h2>
                            </div>
                            <p className="text-xs md:text-sm text-gray-300">
                                Schedule sprint engineering shifts, allocate project workloads, and monitor weekly team capacity.
                            </p>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-3 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer active:scale-95"
                        >
                            <Plus size={16} />
                            <span>Schedule New Shift</span>
                        </button>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#1E293B] border border-gray-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-xs text-gray-400 font-semibold uppercase">Total Planned Capacity</span>
                            <div className="text-2xl font-bold text-cyan-400 mt-1">{totalPlannedHours.toFixed(1)} hrs</div>
                            <span className="text-[11px] text-cyan-300 font-medium">Across all scheduled sprints</span>
                        </div>
                        <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                            <Clock size={24} />
                        </div>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-xs text-gray-400 font-semibold uppercase">Active Team Members</span>
                            <div className="text-2xl font-bold text-purple-400 mt-1">{activeStaffCount} Engineers</div>
                            <span className="text-[11px] text-purple-300 font-medium">Allocated to active projects</span>
                        </div>
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                            <Users size={24} />
                        </div>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-xs text-gray-400 font-semibold uppercase">Published Shifts</span>
                            <div className="text-2xl font-bold text-emerald-400 mt-1">{publishedCount} / {shifts.length}</div>
                            <span className="text-[11px] text-emerald-300 font-medium">Synced with team calendar</span>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                </div>

                {/* Toast Notification */}
                {toastMsg && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold flex items-center justify-between shadow-lg backdrop-blur-md animate-in fade-in">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            <span>{toastMsg}</span>
                        </div>
                        <button onClick={() => setToastMsg("")} className="text-gray-400 hover:text-white cursor-pointer">
                            ✕
                        </button>
                    </div>
                )}

                {/* Filter Controls & List */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {["all", "Salim Ghauri", "Sarah Vance", "Alexander Hayes", "Bob Wilson", "Jane Smith"].map((emp) => (
                            <button
                                key={emp}
                                onClick={() => setSelectedEmployeeFilter(emp)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    selectedEmployeeFilter === emp
                                        ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                                        : "bg-[#1E293B] text-gray-400 hover:text-white border border-gray-700/60"
                                }`}
                            >
                                {emp === "all" ? "All Team Members" : emp}
                            </button>
                        ))}
                    </div>

                    <span className="text-xs text-gray-400 font-semibold">
                        {filteredShifts.length} Shift Allocations
                    </span>
                </div>

                {/* Shift Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShifts.map((shift) => (
                        <div
                            key={shift.id}
                            className="bg-[#1E293B] border border-gray-700 hover:border-cyan-500/60 rounded-2xl p-6 transition-all group shadow-xl flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm">
                                            {shift.employee_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors">
                                                {shift.employee_name}
                                            </h3>
                                            <span className="text-xs text-gray-400 font-medium">{shift.role}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => togglePublishStatus(shift.id)}
                                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                                            shift.is_published
                                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                                                : "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                                        }`}
                                    >
                                        {shift.is_published ? "Published" : "Draft"}
                                    </button>
                                </div>

                                <div className="bg-[#0F172A] p-3.5 rounded-xl border border-gray-800 space-y-2 text-xs">
                                    <div>
                                        <span className="text-[10px] text-gray-500 uppercase font-bold block">Assigned Project</span>
                                        <span className="text-cyan-300 font-semibold">{shift.project_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-gray-300 pt-1 border-t border-gray-800/80">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={13} className="text-cyan-400" />
                                            <span>
                                                {new Date(shift.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <span className="font-bold text-white font-mono">{shift.hours} hrs</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={13} className="text-purple-400" />
                                    <span>{new Date(shift.start_datetime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                                </div>
                                <span className="text-cyan-400 font-bold hover:text-cyan-300 cursor-pointer">
                                    Edit Slot →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shift Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
                                    <CalendarRange size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Schedule New Shift</h3>
                                    <p className="text-xs text-gray-400">Assign resource capacity and sprint timelines</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateShift} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Team Member *</label>
                                <select
                                    value={employeeName}
                                    onChange={(e) => {
                                        setEmployeeName(e.target.value);
                                        const roles: Record<string, string> = {
                                            "Salim Ghauri": "Principal Architect",
                                            "Sarah Vance": "Lead UI/UX Designer",
                                            "Alexander Hayes": "AI & ML Engineer",
                                            "Bob Wilson": "Supply Chain Engineer",
                                            "Jane Smith": "Mobile App Engineer"
                                        };
                                        if (roles[e.target.value]) setRole(roles[e.target.value]);
                                    }}
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                                >
                                    <option value="Salim Ghauri">Salim Ghauri (Principal Architect)</option>
                                    <option value="Sarah Vance">Sarah Vance (Lead UI/UX Designer)</option>
                                    <option value="Alexander Hayes">Alexander Hayes (AI & ML Engineer)</option>
                                    <option value="Bob Wilson">Bob Wilson (Supply Chain Engineer)</option>
                                    <option value="Jane Smith">Jane Smith (Mobile App Engineer)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Target Project</label>
                                <select
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                                >
                                    <option value="Enterprise Website & ERP Portal Redesign">Enterprise Website & ERP Portal Redesign</option>
                                    <option value="Mobile CRM & Field Agent iOS/Android App">Mobile CRM & Field Agent iOS/Android App</option>
                                    <option value="Supply Chain & Multi-Warehouse Automation">Supply Chain & Multi-Warehouse Automation</option>
                                    <option value="AI Business Intelligence & Sales Copilot">AI Business Intelligence & Sales Copilot</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Start Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={startDatetime}
                                        onChange={(e) => setStartDatetime(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">End Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={endDatetime}
                                        onChange={(e) => setEndDatetime(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="publishShift"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    className="accent-cyan-500 w-4 h-4 rounded cursor-pointer"
                                />
                                <label htmlFor="publishShift" className="text-gray-300 font-semibold cursor-pointer">
                                    Publish immediately to team schedule
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 transition-all cursor-pointer active:scale-95"
                                >
                                    Save Shift
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
