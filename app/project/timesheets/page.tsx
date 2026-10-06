"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useState, useEffect, useRef } from "react";
import {
    FolderKanban,
    Clock,
    Play,
    Pause,
    Save,
    Plus,
    X,
    CheckCircle2,
    Zap,
    TrendingUp,
    History
} from "lucide-react";

const MENU_ITEMS = [
    { name: "Projects", href: "/project" },
    { name: "Tasks", href: "/project/tasks" },
    { name: "Timesheets", href: "/project/timesheets" },
    { name: "Reporting", href: "/project/reporting" },
    { name: "Configuration", href: "/project/configuration" },
];

type Timesheet = {
    id: string;
    date: string;
    employee: string;
    project: string;
    task: string;
    description: string;
    duration: number;
    is_automated?: boolean;
};

const INITIAL_TIMESHEETS: Timesheet[] = [
    { id: "TS/001", date: "2026-03-05", employee: "Sarah Vance", project: "Enterprise Website & ERP Portal Redesign", task: "Design Homepage & Layout System", description: "Created responsive grid & tokens", duration: 4.5, is_automated: true },
    { id: "TS/002", date: "2026-03-04", employee: "Salim Ghauri", project: "Enterprise Website & ERP Portal Redesign", task: "Setup Database & JWT Auth Middleware", description: "Configured multi-tenant RLS", duration: 6.0, is_automated: false },
    { id: "TS/003", date: "2026-03-03", employee: "Alexander Hayes", project: "AI Business Intelligence & Sales Copilot", task: "AI Speech-to-Text Meeting Summarizer", description: "Whisper WebSocket stream", duration: 5.25, is_automated: true },
    { id: "TS/004", date: "2026-03-02", employee: "Bob Wilson", project: "Supply Chain & Multi-Warehouse Automation", task: "RFID Warehouse Barcode Integration", description: "Zebra scanner integration", duration: 7.0, is_automated: false },
];

export default function ProjectTimesheetsPage() {
    const [timesheets, setTimesheets] = useState<Timesheet[]>(INITIAL_TIMESHEETS);

    // Auto-logger state
    const [isAutoTracking, setIsAutoTracking] = useState(true);
    const [sessionSeconds, setSessionSeconds] = useState(1820);
    const [activeProject, setActiveProject] = useState("Enterprise Website & ERP Portal Redesign");
    const [activeTask, setActiveTask] = useState("Sprint Operations & Development");
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Manual Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState("Salim Ghauri");
    const [newProject, setNewProject] = useState("Enterprise Website & ERP Portal Redesign");
    const [newTask, setNewTask] = useState("Design Homepage & Layout System");
    const [newDesc, setNewDesc] = useState("");
    const [newHours, setNewHours] = useState("2.5");
    const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
    const [toastMsg, setToastMsg] = useState("");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

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
        if (loggedHours <= 0) return;

        const newEntry: Timesheet = {
            id: `TS/00${timesheets.length + 1}`,
            date: new Date().toISOString().slice(0, 10),
            employee: "Salim Ghauri",
            project: activeProject,
            task: activeTask,
            description: `Auto-recorded session while logged in Beraxis workstation`,
            duration: loggedHours,
            is_automated: true
        };

        setTimesheets([newEntry, ...timesheets]);
        setSessionSeconds(0);
        showToast(`⚡ Automatically logged ${loggedHours} hours to ${activeProject}!`);
    };

    const handleCreateManualEntry = (e: React.FormEvent) => {
        e.preventDefault();
        const durationNum = parseFloat(newHours);
        if (isNaN(durationNum) || durationNum <= 0) return;

        const newEntry: Timesheet = {
            id: `TS/00${timesheets.length + 1}`,
            date: newDate,
            employee: newEmployee,
            project: newProject,
            task: newTask,
            description: newDesc || "Manual time entry",
            duration: durationNum,
            is_automated: false
        };

        setTimesheets([newEntry, ...timesheets]);
        setIsModalOpen(false);
        setNewDesc("");
        showToast(`✅ Manually logged ${durationNum} hours!`);
    };

    const totalHours = timesheets.reduce((acc, curr) => acc + curr.duration, 0);
    const autoHours = timesheets.filter(t => t.is_automated).reduce((acc, curr) => acc + curr.duration, 0);
    const manualHours = timesheets.filter(t => !t.is_automated).reduce((acc, curr) => acc + curr.duration, 0);

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Project"
                moduleIcon={<FolderKanban size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search project timesheets..."
                onNewClick={() => setIsModalOpen(true)}
                newButtonText="Log Hours"
            />

            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
                {/* Top Automated Live Tracker Widget */}
                <div className="bg-gradient-to-r from-purple-900/40 via-[#1E293B] to-cyan-900/30 border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2.5">
                                <span className="relative flex h-3 w-3">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAutoTracking ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isAutoTracking ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                                    {isAutoTracking ? "Live Work Session Auto-Logger" : "Session Auto-Logger Paused"}
                                </span>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300 font-medium">
                                    Automated Log Active
                                </span>
                            </div>

                            <div className="flex items-baseline gap-4">
                                <h1 className="text-4xl md:text-5xl font-mono font-extrabold text-white tracking-tight">
                                    {formatSeconds(sessionSeconds)}
                                </h1>
                                <span className="text-xs text-gray-400 font-medium">
                                    ({(sessionSeconds / 3600).toFixed(2)} hrs logged)
                                </span>
                            </div>

                            <p className="text-xs text-gray-400">
                                Automatically logging hours while active in Beraxis. Elapsed session time can be posted directly to any project.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#0F172A]/80 p-3.5 rounded-2xl border border-white/10">
                            <div className="space-y-1">
                                <label className="text-[11px] text-gray-400 font-semibold block">Attributed Project</label>
                                <select
                                    value={activeProject}
                                    onChange={(e) => setActiveProject(e.target.value)}
                                    className="bg-[#1E293B] border border-gray-700 text-xs font-bold text-white rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
                                >
                                    <option value="Enterprise Website & ERP Portal Redesign">Enterprise Website & ERP Portal Redesign</option>
                                    <option value="Mobile CRM & Field Agent iOS/Android App">Mobile CRM & Field Agent iOS/Android App</option>
                                    <option value="Supply Chain & Multi-Warehouse Automation">Supply Chain & Multi-Warehouse Automation</option>
                                    <option value="AI Business Intelligence & Sales Copilot">AI Business Intelligence & Sales Copilot</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 pt-2 sm:pt-4">
                                <button
                                    onClick={() => setIsAutoTracking(!isAutoTracking)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                        isAutoTracking
                                            ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
                                            : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                                    }`}
                                >
                                    {isAutoTracking ? <Pause size={14} /> : <Play size={14} />}
                                    <span>{isAutoTracking ? "Pause" : "Resume"}</span>
                                </button>

                                <button
                                    onClick={handleSaveAutoSession}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                                >
                                    <Save size={14} />
                                    <span>Log Session</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#1E293B] border border-gray-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-xs text-gray-400 font-semibold uppercase">Total Tracked Hours</span>
                            <div className="text-2xl font-bold text-white mt-1">{totalHours.toFixed(1)} hrs</div>
                            <span className="text-[11px] text-purple-400 font-medium">{timesheets.length} Entries Logged</span>
                        </div>
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                            <Clock size={24} />
                        </div>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-xs text-gray-400 font-semibold uppercase">Auto-Logged Sessions</span>
                            <div className="text-2xl font-bold text-cyan-400 mt-1">{autoHours.toFixed(1)} hrs</div>
                            <span className="text-[11px] text-cyan-300 font-medium">Automatic system tracking</span>
                        </div>
                        <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                            <Zap size={24} />
                        </div>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-xs text-gray-400 font-semibold uppercase">Manual Time Logs</span>
                            <div className="text-2xl font-bold text-emerald-400 mt-1">{manualHours.toFixed(1)} hrs</div>
                            <span className="text-[11px] text-emerald-300 font-medium">Direct engineer entries</span>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                            <TrendingUp size={24} />
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

                {/* Header Actions */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <History className="text-purple-400" size={20} /> Project Timesheets Log
                        </h3>
                        <p className="text-xs text-gray-400">Track task billing, sprint resource utilization, and team logs.</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                    >
                        <Plus size={16} />
                        <span>Log Hours</span>
                    </button>
                </div>

                {/* Timesheet List Table */}
                <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                    <table className="w-full text-xs md:text-sm">
                        <thead className="bg-[#0F172A] border-b border-gray-700 text-left text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3.5">Date</th>
                                <th className="px-4 py-3.5">Employee</th>
                                <th className="px-4 py-3.5">Project</th>
                                <th className="px-4 py-3.5">Task</th>
                                <th className="px-4 py-3.5">Description</th>
                                <th className="px-4 py-3.5">Method</th>
                                <th className="px-4 py-3.5 text-right">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timesheets.map(entry => (
                                <tr key={entry.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3.5 text-gray-400 font-mono">{entry.date}</td>
                                    <td className="px-4 py-3.5 font-bold text-white">{entry.employee}</td>
                                    <td className="px-4 py-3.5 text-cyan-400 font-medium">{entry.project}</td>
                                    <td className="px-4 py-3.5 text-gray-300 font-medium">{entry.task}</td>
                                    <td className="px-4 py-3.5 text-gray-400">{entry.description}</td>
                                    <td className="px-4 py-3.5">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            entry.is_automated
                                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                        }`}>
                                            {entry.is_automated ? "⚡ Auto-Logged" : "✍️ Manual"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-right font-mono font-bold text-white">{entry.duration.toFixed(2)} hrs</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manual Entry Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Add Project Hours</h3>
                                    <p className="text-xs text-gray-400">Log custom work hours against a project</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateManualEntry} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Employee</label>
                                <select
                                    value={newEmployee}
                                    onChange={(e) => setNewEmployee(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                                >
                                    <option value="Salim Ghauri">Salim Ghauri</option>
                                    <option value="Sarah Vance">Sarah Vance</option>
                                    <option value="Jane Smith">Jane Smith</option>
                                    <option value="Bob Wilson">Bob Wilson</option>
                                    <option value="Alexander Hayes">Alexander Hayes</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Target Project</label>
                                <select
                                    value={newProject}
                                    onChange={(e) => setNewProject(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                                >
                                    <option value="Enterprise Website & ERP Portal Redesign">Enterprise Website & ERP Portal Redesign</option>
                                    <option value="Mobile CRM & Field Agent iOS/Android App">Mobile CRM & Field Agent iOS/Android App</option>
                                    <option value="Supply Chain & Multi-Warehouse Automation">Supply Chain & Multi-Warehouse Automation</option>
                                    <option value="AI Business Intelligence & Sales Copilot">AI Business Intelligence & Sales Copilot</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Hours *</label>
                                    <input
                                        type="number"
                                        step="0.25"
                                        required
                                        value={newHours}
                                        onChange={(e) => setNewHours(e.target.value)}
                                        placeholder="e.g. 4.0"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Task Deliverable</label>
                                <input
                                    type="text"
                                    required
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    placeholder="e.g. Design Homepage & Layout System"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Notes / Description</label>
                                <textarea
                                    rows={2}
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    placeholder="Details on what was completed..."
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
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
                                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                                >
                                    Log Time
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
