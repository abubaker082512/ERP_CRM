"use client";

import { fetchAPI } from '@/lib/api';
import { useState, useEffect, useRef } from 'react';
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import {
    Plus,
    Clock,
    Calendar,
    Play,
    Pause,
    Square,
    Save,
    X,
    CheckCircle2,
    Sparkles,
    Briefcase,
    Zap,
    History,
    TrendingUp,
    Filter,
    Download,
    RotateCcw,
    UserCheck
} from 'lucide-react';

const MENU_ITEMS = [
    { name: "My Timesheets", href: "/timesheets" },
    { name: "All Timesheets", href: "/project/timesheets" },
    { name: "Projects", href: "/project" },
    { name: "Tasks", href: "/project/tasks" },
    { name: "Reporting", href: "/project/reporting" },
];

type Project = {
    id: string;
    name: string;
};

type Timesheet = {
    id: string;
    date: string;
    project_id: string;
    project_name?: string;
    name: string;
    unit_amount: number;
    is_automated?: boolean;
    status?: "draft" | "submitted" | "approved";
};

const INITIAL_TIMESHEETS: Timesheet[] = [
    {
        id: "ts_1",
        date: "2026-03-09T09:30:00Z",
        project_id: "p1",
        project_name: "Enterprise Website & ERP Portal Redesign",
        name: "Sprint 14 UI Components & Theme Styling",
        unit_amount: 3.5,
        is_automated: false,
        status: "approved"
    },
    {
        id: "ts_2",
        date: "2026-03-09T14:00:00Z",
        project_id: "p2",
        project_name: "Mobile CRM & Field Agent iOS/Android App",
        name: "Offline SQLite Cache & Sync Architecture",
        unit_amount: 2.75,
        is_automated: true,
        status: "submitted"
    },
    {
        id: "ts_3",
        date: "2026-03-08T10:15:00Z",
        project_id: "p3",
        project_name: "AI Business Intelligence & Sales Copilot",
        name: "LLM Pipeline & Prompt Optimization",
        unit_amount: 4.0,
        is_automated: false,
        status: "approved"
    }
];

export default function TimesheetPage() {
    const [timesheets, setTimesheets] = useState<Timesheet[]>(INITIAL_TIMESHEETS);
    const [projects, setProjects] = useState<Project[]>([
        { id: "p1", name: "Enterprise Website & ERP Portal Redesign" },
        { id: "p2", name: "Mobile CRM & Field Agent iOS/Android App" },
        { id: "p3", name: "AI Business Intelligence & Sales Copilot" },
        { id: "p4", name: "Supply Chain & Multi-Warehouse Automation" }
    ]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // ==========================================
    // Real-Time Active Session Tracker
    // ==========================================
    const [isAutoTracking, setIsAutoTracking] = useState(true);
    const [sessionSeconds, setSessionSeconds] = useState(0);
    const [loginClockTime, setLoginClockTime] = useState("");
    const [activeSessionProject, setActiveSessionProject] = useState("Enterprise Website & ERP Portal Redesign");
    const [activeSessionTask, setActiveSessionTask] = useState("Active Workspace Operations & Development");
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Manual Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState("Enterprise Website & ERP Portal Redesign");
    const [hours, setHours] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [toastMsg, setToastMsg] = useState("");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    // Initialize real login time from localStorage/session
    useEffect(() => {
        let startTimeStr = localStorage.getItem("beraxis_user_session_start");
        let startTimestamp = 0;

        if (!startTimeStr) {
            startTimestamp = Date.now();
            localStorage.setItem("beraxis_user_session_start", startTimestamp.toString());
        } else {
            startTimestamp = parseInt(startTimeStr, 10);
            // If the stored time is older than 24h, reset to current day's login session
            if (Date.now() - startTimestamp > 24 * 60 * 60 * 1000 || isNaN(startTimestamp)) {
                startTimestamp = Date.now();
                localStorage.setItem("beraxis_user_session_start", startTimestamp.toString());
            }
        }

        const realElapsed = Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000));
        setSessionSeconds(realElapsed);

        const startDate = new Date(startTimestamp);
        setLoginClockTime(startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, []);

    // Real-time timer ticker
    useEffect(() => {
        if (isAutoTracking) {
            timerRef.current = setInterval(() => {
                setSessionSeconds(prev => prev + 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isAutoTracking]);

    const formatSeconds = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSaveAutoSession = () => {
        const loggedHours = parseFloat((sessionSeconds / 3600).toFixed(2));
        if (loggedHours <= 0) {
            showToast("⚠️ Active time is less than a minute. Work a bit longer before logging!");
            return;
        }

        const newLog: Timesheet = {
            id: `ts_${Date.now()}`,
            date: new Date().toISOString(),
            project_id: "auto",
            project_name: activeSessionProject,
            name: `[Auto-Logged Session] ${activeSessionTask}`,
            unit_amount: loggedHours,
            is_automated: true,
            status: "submitted"
        };

        setTimesheets([newLog, ...timesheets]);
        // Reset timer start point
        const now = Date.now();
        localStorage.setItem("beraxis_user_session_start", now.toString());
        setSessionSeconds(0);
        setLoginClockTime(new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        showToast(`⚡ Automatically logged ${loggedHours} hours to "${activeSessionProject}"!`);
    };

    const handleResetSession = () => {
        const now = Date.now();
        localStorage.setItem("beraxis_user_session_start", now.toString());
        setSessionSeconds(0);
        setLoginClockTime(new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        showToast("🔄 Active session timer reset to 00:00:00");
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numHours = parseFloat(hours);
        if (isNaN(numHours) || numHours <= 0) {
            showToast("⚠️ Please enter a valid number of hours.");
            return;
        }

        const newEntry: Timesheet = {
            id: `ts_${Date.now()}`,
            date: new Date(date).toISOString(),
            project_id: "manual",
            project_name: selectedProject,
            name: description.trim() || "Manual Work Log",
            unit_amount: numHours,
            is_automated: false,
            status: "submitted"
        };

        setTimesheets([newEntry, ...timesheets]);
        setIsModalOpen(false);
        setHours("");
        setDescription("");
        showToast(`✅ Logged ${numHours} hours to "${selectedProject}" successfully!`);
    };

    const handleExportCSV = () => {
        const headers = ["Date", "Project", "Description", "Hours Logged", "Type", "Status"];
        const rows = timesheets.map(t => [
            new Date(t.date).toLocaleDateString(),
            `"${t.project_name || t.project_id}"`,
            `"${t.name}"`,
            t.unit_amount,
            t.is_automated ? "Automated" : "Manual",
            t.status || "submitted"
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `beraxis_timesheets_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("📥 Exported Timesheet CSV Report!");
    };

    const totalHoursLogged = timesheets.reduce((acc, curr) => acc + curr.unit_amount, 0);
    const activeLiveHours = parseFloat((sessionSeconds / 3600).toFixed(2));
    const combinedTodayHours = totalHoursLogged + activeLiveHours;

    const filteredTimesheets = timesheets.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.project_name && t.project_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0d14] text-white">
            <StandardModuleHeader
                moduleName="Timesheets"
                moduleIcon={<Clock size={20} className="text-indigo-400" />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search task, project or memo..."
                onSearch={setSearchQuery}
                onNewClick={() => setIsModalOpen(true)}
                newButtonText="+ Log Hours"
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
                                Time & Activity Tracker
                            </h2>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                                Real Session Time Active
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Automatic in-system session logging with billable client project allocations
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={handleExportCSV}
                            className="bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                        >
                            <Download size={15} className="text-emerald-400" /> Export CSV
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
                        >
                            <Plus size={16} /> + Manual Log Hours
                        </button>
                    </div>
                </div>

                {/* Real-time Automated Clock Card */}
                <div className="bg-gradient-to-r from-indigo-950/40 via-gray-900/80 to-purple-950/40 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-3 max-w-xl">
                            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                                <Zap size={15} className="text-amber-400 animate-pulse" />
                                <span>Real In-System Working Time</span>
                                {loginClockTime && (
                                    <span className="text-gray-400 font-normal">
                                        (Clocked In: <span className="text-white font-bold">{loginClockTime}</span>)
                                    </span>
                                )}
                            </div>

                            <div className="flex items-baseline gap-4">
                                <div className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-white drop-shadow-md">
                                    {formatSeconds(sessionSeconds)}
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                                    isAutoTracking
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}>
                                    {isAutoTracking ? "● Live In Progress" : "❚❚ Paused"}
                                </span>
                            </div>

                            {/* Project and Task Selectors */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div>
                                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">Target Project:</label>
                                    <select
                                        value={activeSessionProject}
                                        onChange={(e) => setActiveSessionProject(e.target.value)}
                                        className="w-full bg-gray-950/80 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        {projects.map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">Task Memo / Action:</label>
                                    <input
                                        type="text"
                                        value={activeSessionTask}
                                        onChange={(e) => setActiveSessionTask(e.target.value)}
                                        placeholder="e.g. Code Review & QA Testing"
                                        className="w-full bg-gray-950/80 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[200px]">
                            <button
                                onClick={handleSaveAutoSession}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
                            >
                                <Save size={16} /> Save to Timesheet
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsAutoTracking(!isAutoTracking)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                                >
                                    {isAutoTracking ? <Pause size={14} className="text-amber-400" /> : <Play size={14} className="text-emerald-400" />}
                                    <span>{isAutoTracking ? "Pause" : "Resume"}</span>
                                </button>

                                <button
                                    onClick={handleResetSession}
                                    title="Reset current live session counter"
                                    className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 rounded-xl text-xs flex items-center justify-center transition"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-gray-900/80 to-indigo-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Total Hours Logged</span>
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                <Clock size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-white">{totalHoursLogged.toFixed(2)} hrs</div>
                        <div className="text-[11px] text-gray-400 mt-1">Across {timesheets.length} completed logs</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-emerald-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Live Session Active</span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Zap size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-emerald-400">{activeLiveHours.toFixed(2)} hrs</div>
                        <div className="text-[11px] text-emerald-300 mt-1">Real-time working session</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-purple-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Total Effective Today</span>
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                <TrendingUp size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-purple-300">{combinedTodayHours.toFixed(2)} hrs</div>
                        <div className="text-[11px] text-purple-300 mt-1">Billable effort recorded</div>
                    </div>
                </div>

                {/* Timesheet History Table */}
                <div className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950/40">
                        <div className="flex items-center gap-2">
                            <History size={18} className="text-indigo-400" />
                            <h3 className="font-bold text-white text-sm">Timesheet Log Entries</h3>
                            <span className="text-xs text-gray-400">({filteredTimesheets.length} records)</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] border-b border-gray-800 font-semibold">
                                <tr>
                                    <th className="px-5 py-3.5">Date & Time</th>
                                    <th className="px-4 py-3.5">Project</th>
                                    <th className="px-4 py-3.5">Description / Task</th>
                                    <th className="px-4 py-3.5 text-center">Type</th>
                                    <th className="px-4 py-3.5 text-right">Hours Logged</th>
                                    <th className="px-5 py-3.5 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60">
                                {filteredTimesheets.map((ts) => (
                                    <tr key={ts.id} className="hover:bg-indigo-950/10 transition">
                                        <td className="px-5 py-3.5 font-medium text-gray-300">
                                            {new Date(ts.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3.5 font-bold text-white">
                                            {ts.project_name || "General Workspace"}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-300">
                                            {ts.name}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            {ts.is_automated ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
                                                    <Zap size={11} /> Auto
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                                                    Manual
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-mono font-black text-sm text-indigo-300">
                                            {ts.unit_amount.toFixed(2)} hrs
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                ts.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                            }`}>
                                                {ts.status || "submitted"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Manual Timesheet Log Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                                <Clock size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Log Project Hours</h3>
                                <p className="text-xs text-gray-400">Record manual time against client deliverables</p>
                            </div>
                        </div>

                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Select Project *</label>
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                >
                                    {projects.map(p => (
                                        <option key={p.id} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Hours Logged (e.g. 2.5) *</label>
                                    <input
                                        type="number"
                                        step="0.25"
                                        min="0.1"
                                        required
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Work Description / Memo</label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe specific tasks completed during this time..."
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                                >
                                    Commit Log Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
