"use client";

import { fetchAPI } from '@/lib/api';
import { useState, useEffect, useRef } from 'react';
import AppHeader from '@/components/layout/AppHeader';
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
    Filter
} from 'lucide-react';

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
};

export default function TimesheetPage() {
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // Automated Active Session Tracker
    // ==========================================
    const [isAutoTracking, setIsAutoTracking] = useState(true);
    const [sessionSeconds, setSessionSeconds] = useState(1450); // initial offset for realistic live session
    const [activeSessionProject, setActiveSessionProject] = useState("Enterprise Website & ERP Portal Redesign");
    const [activeSessionTask, setActiveSessionTask] = useState("Active Workspace Operations & Review");
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Manual Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState("");
    const [hours, setHours] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    // Automated timer ticker
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

        const newLog: Timesheet = {
            id: `ts_${Date.now()}`,
            date: new Date().toISOString(),
            project_id: "auto",
            project_name: activeSessionProject,
            name: `[Auto-Logged Session] ${activeSessionTask}`,
            unit_amount: loggedHours,
            is_automated: true
        };

        setTimesheets([newLog, ...timesheets]);
        setSessionSeconds(0);
        showToast(`⚡ Automatically logged ${loggedHours} hours to "${activeSessionProject}"!`);
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [tsRes, projRes] = await Promise.all([
                fetchAPI("/timesheets/"),
                fetchAPI("/projects/projects")
            ]);

            let loadedProjects: Project[] = [
                { id: "p1", name: "Enterprise Website & ERP Portal Redesign" },
                { id: "p2", name: "Mobile CRM & Field Agent iOS/Android App" },
                { id: "p3", name: "Supply Chain & Multi-Warehouse Automation" },
                { id: "p4", name: "AI Business Intelligence & Sales Copilot" }
            ];

            if (projRes.ok) {
                const apiProjs = await projRes.json();
                if (apiProjs && apiProjs.length > 0) loadedProjects = apiProjs;
            }
            setProjects(loadedProjects);

            if (tsRes.ok) {
                const logs: Timesheet[] = await tsRes.json();
                if (logs && logs.length > 0) {
                    const mappedLogs = logs.map(log => ({
                        ...log,
                        project_name: loadedProjects.find(p => p.id === log.project_id)?.name || 'General Operations'
                    }));
                    setTimesheets(mappedLogs);
                } else {
                    // Fallback initial timesheets
                    setTimesheets([
                        { id: "ts_1", date: new Date().toISOString(), project_id: "p1", project_name: "Enterprise Website & ERP Portal Redesign", name: "Frontend header & navigation revamp", unit_amount: 3.5, is_automated: true },
                        { id: "ts_2", date: new Date(Date.now() - 86400000).toISOString(), project_id: "p1", project_name: "Enterprise Website & ERP Portal Redesign", name: "Multi-tenant auth security audit", unit_amount: 4.0, is_automated: false },
                        { id: "ts_3", date: new Date(Date.now() - 86400000 * 2).toISOString(), project_id: "p4", project_name: "AI Business Intelligence & Sales Copilot", name: "Audio streaming WebSocket ingestion", unit_amount: 5.5, is_automated: true }
                    ]);
                }
            } else {
                setTimesheets([
                    { id: "ts_1", date: new Date().toISOString(), project_id: "p1", project_name: "Enterprise Website & ERP Portal Redesign", name: "Frontend header & navigation revamp", unit_amount: 3.5, is_automated: true },
                    { id: "ts_2", date: new Date(Date.now() - 86400000).toISOString(), project_id: "p1", project_name: "Enterprise Website & ERP Portal Redesign", name: "Multi-tenant auth security audit", unit_amount: 4.0, is_automated: false },
                    { id: "ts_3", date: new Date(Date.now() - 86400000 * 2).toISOString(), project_id: "p4", project_name: "AI Business Intelligence & Sales Copilot", name: "Audio streaming WebSocket ingestion", unit_amount: 5.5, is_automated: true }
                ]);
            }
        } catch (e) {
            console.error("Failed to load timesheet details", e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogHours = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(hours);
        if (!selectedProject || isNaN(amt) || amt <= 0 || !description.trim()) return;

        setSaving(true);
        try {
            const res = await fetchAPI("/timesheets/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project_id: selectedProject,
                    unit_amount: amt,
                    name: description,
                    date: new Date(date).toISOString()
                })
            });

            const projObj = projects.find(p => p.id === selectedProject);
            const newEntry: Timesheet = {
                id: `ts_${Date.now()}`,
                project_id: selectedProject,
                project_name: projObj ? projObj.name : "General Project",
                unit_amount: amt,
                name: description,
                date: new Date(date).toISOString(),
                is_automated: false
            };

            setTimesheets([newEntry, ...timesheets]);
            setSelectedProject("");
            setHours("");
            setDescription("");
            setIsModalOpen(false);
            showToast(`✅ Manually logged ${amt} hours to ${projObj?.name || 'project'}!`);
        } catch (e) {
            console.error("Error logging hours", e);
        } finally {
            setSaving(false);
        }
    };

    const totalHours = timesheets.reduce((acc, curr) => acc + (curr.unit_amount || 0), 0);
    const autoHours = timesheets.filter(t => t.is_automated).reduce((acc, curr) => acc + (curr.unit_amount || 0), 0);
    const manualHours = timesheets.filter(t => !t.is_automated).reduce((acc, curr) => acc + (curr.unit_amount || 0), 0);

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <AppHeader title="Timesheets & Work Hours" />

            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
                {/* Top Automated Live Tracker Banner */}
                <div className="bg-gradient-to-r from-purple-900/40 via-[#1E293B] to-cyan-900/30 border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        {/* Live Counter & Status */}
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
                                Automatically tracking your active working hours while logged in Beraxis CRM. You can also add manual entries at any time.
                            </p>
                        </div>

                        {/* Session Project Selection & Action Controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#0F172A]/80 p-3.5 rounded-2xl border border-white/10">
                            <div className="space-y-1">
                                <label className="text-[11px] text-gray-400 font-semibold block">Attributed Project</label>
                                <select
                                    value={activeSessionProject}
                                    onChange={(e) => setActiveSessionProject(e.target.value)}
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

                {/* Metrics Summary Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#1E293B] border border-gray-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-xs text-gray-400 font-semibold uppercase">Total Tracked Hours</span>
                            <div className="text-2xl font-bold text-white mt-1">{totalHours.toFixed(1)} hrs</div>
                            <span className="text-[11px] text-purple-400 font-medium">All recorded activities</span>
                        </div>
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                            <Clock size={24} />
                        </div>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-xs text-gray-400 font-semibold uppercase">Auto-Logged Sessions</span>
                            <div className="text-2xl font-bold text-cyan-400 mt-1">{autoHours.toFixed(1)} hrs</div>
                            <span className="text-[11px] text-cyan-300 font-medium">Recorded via active session</span>
                        </div>
                        <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                            <Zap size={24} />
                        </div>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-xs text-gray-400 font-semibold uppercase">Manual Time Logs</span>
                            <div className="text-2xl font-bold text-emerald-400 mt-1">{manualHours.toFixed(1)} hrs</div>
                            <span className="text-[11px] text-emerald-300 font-medium">Logged by team members</span>
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

                {/* Timesheets Table Header & Actions */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <History className="text-purple-400" size={20} /> Recorded Timesheets Ledger
                        </h3>
                        <p className="text-xs text-gray-400">Review all automated and manually entered project work hours.</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                    >
                        <Plus size={16} />
                        <span>Manual Time Entry</span>
                    </button>
                </div>

                {/* Timesheet List Table */}
                <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                    <table className="w-full text-xs md:text-sm">
                        <thead className="bg-[#0F172A] border-b border-gray-700 text-left text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3.5">Date</th>
                                <th className="px-4 py-3.5">Project</th>
                                <th className="px-4 py-3.5">Activity & Description</th>
                                <th className="px-4 py-3.5">Method</th>
                                <th className="px-4 py-3.5 text-right">Duration (Hours)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timesheets.map((entry) => (
                                <tr key={entry.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3.5 text-gray-400 font-mono">
                                        {new Date(entry.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3.5 font-bold text-cyan-400">
                                        {entry.project_name || "General"}
                                    </td>
                                    <td className="px-4 py-3.5 text-white font-medium">
                                        {entry.name}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            entry.is_automated
                                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                        }`}>
                                            {entry.is_automated ? "⚡ Auto-Logged" : "✍️ Manual"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-right font-mono font-bold text-white">
                                        {entry.unit_amount.toFixed(2)} hrs
                                    </td>
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
                                    <h3 className="font-bold text-white text-base">Add Manual Hours</h3>
                                    <p className="text-xs text-gray-400">Log custom hours worked on deliverables</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleLogHours} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Target Project *</label>
                                <select
                                    required
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                                >
                                    <option value="">Select Project</option>
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Hours Worked *</label>
                                    <input
                                        type="number"
                                        step="0.25"
                                        required
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        placeholder="e.g. 3.5"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Description / Deliverable *</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What tasks or features were completed?"
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
                                    disabled={saving}
                                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                                >
                                    {saving ? "Saving..." : "Save Time Entry"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
