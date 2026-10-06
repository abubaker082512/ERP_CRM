"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import {
    FolderKanban,
    CheckSquare,
    Clock,
    User,
    Calendar,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    Flag
} from "lucide-react";

const MENU_ITEMS = [
    { name: "Projects", href: "/project" },
    { name: "Tasks", href: "/project/tasks" },
    { name: "Timesheets", href: "/project/timesheets" },
    { name: "Reporting", href: "/project/reporting" },
    { name: "Configuration", href: "/project/configuration" },
];

export type Task = {
    id: string;
    title: string;
    project: string;
    assignee: string;
    status: "todo" | "in_progress" | "review" | "done";
    priority: "low" | "medium" | "high" | "urgent";
    deadline: string;
    description?: string;
};

const INITIAL_TASKS: Task[] = [
    { id: "TSK/001", title: "Design Homepage & Layout System", project: "Enterprise Website & ERP Portal Redesign", assignee: "Sarah Vance", status: "in_progress", priority: "high", deadline: "2026-03-10", description: "Design responsive grid, topbars, and dark mode palette." },
    { id: "TSK/002", title: "Setup Database & JWT Auth Middleware", project: "Enterprise Website & ERP Portal Redesign", assignee: "Salim Ghauri", status: "done", priority: "urgent", deadline: "2026-02-15", description: "Configure multi-tenant RLS policies." },
    { id: "TSK/003", title: "Offline Lead Sync Engine", project: "Mobile CRM & Field Agent iOS/Android App", assignee: "Jane Smith", status: "todo", priority: "medium", deadline: "2026-04-15", description: "SQLite local cache with conflict resolution." },
    { id: "TSK/004", title: "RFID Warehouse Barcode Integration", project: "Supply Chain & Multi-Warehouse Automation", assignee: "Bob Wilson", status: "done", priority: "high", deadline: "2026-02-28", description: "Connect Zebra scanner API to stock picking." },
    { id: "TSK/005", title: "AI Speech-to-Text Meeting Summarizer", project: "AI Business Intelligence & Sales Copilot", assignee: "Alexander Hayes", status: "in_progress", priority: "urgent", deadline: "2026-03-25", description: "Whisper API transcription with action item extraction." },
    { id: "TSK/006", title: "Tax Settlement & P&L Export Engine", project: "Enterprise Website & ERP Portal Redesign", assignee: "Bilal Mahmood", status: "todo", priority: "medium", deadline: "2026-04-01", description: "Generate trial balance and tax breakdown spreadsheets." }
];

export default function ProjectTasksPage() {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newProject, setNewProject] = useState("Enterprise Website & ERP Portal Redesign");
    const [newAssignee, setNewAssignee] = useState("Salim Ghauri");
    const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
    const [newStatus, setNewStatus] = useState<"todo" | "in_progress" | "review" | "done">("todo");
    const [newDeadline, setNewDeadline] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    const [newDesc, setNewDesc] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        const newTask: Task = {
            id: `TSK/00${tasks.length + 1}`,
            title: newTitle.trim(),
            project: newProject,
            assignee: newAssignee,
            priority: newPriority,
            status: newStatus,
            deadline: newDeadline,
            description: newDesc.trim()
        };

        setTasks([newTask, ...tasks]);
        setSuccessMsg(`🎉 Task "${newTask.title}" created successfully!`);
        setTimeout(() => setSuccessMsg(""), 6000);

        setShowCreateModal(false);
        setNewTitle("");
        setNewDesc("");
    };

    const toggleTaskStatus = (id: string) => {
        setTasks(tasks.map(t => {
            if (t.id === id) {
                const nextStatus: Record<string, "todo" | "in_progress" | "review" | "done"> = {
                    todo: "in_progress",
                    in_progress: "done",
                    review: "done",
                    done: "todo"
                };
                return { ...t, status: nextStatus[t.status] || "done" };
            }
            return t;
        }));
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Project"
                moduleIcon={<FolderKanban size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search tasks by title, project, assignee..."
                onNewClick={() => setShowCreateModal(true)}
                newButtonText="New Task"
            />

            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Project Tasks & Sprints</h2>
                            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                {tasks.length} Active Tasks
                            </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">
                            Manage task assignments, priorities, deadlines, and milestone deliverables across all projects.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["kanban", "list"]}
                            onViewChange={setCurrentView}
                        />

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                        >
                            <Plus size={16} />
                            <span>Add New Task</span>
                        </button>
                    </div>
                </div>

                {/* Success Notification */}
                {successMsg && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold flex items-center justify-between shadow-lg backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            <span>{successMsg}</span>
                        </div>
                        <button onClick={() => setSuccessMsg("")} className="text-gray-400 hover:text-white cursor-pointer">
                            ✕
                        </button>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* KANBAN VIEW                                                               */}
                {/* ========================================================================= */}
                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { id: "todo", title: "To Do", bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-300" },
                            { id: "in_progress", title: "In Progress", bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
                            { id: "review", title: "Code & QA Review", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
                            { id: "done", title: "Completed", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" }
                        ].map(column => {
                            const colTasks = tasks.filter(t => t.status === column.id);
                            return (
                                <div key={column.id} className="bg-[#1E293B]/70 border border-gray-700/80 rounded-2xl p-4 flex flex-col space-y-3">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-700/60">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${column.text.replace("text-", "bg-")}`} />
                                            <h3 className="font-bold text-white text-sm">{column.title}</h3>
                                        </div>
                                        <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded-md text-gray-300">
                                            {colTasks.length}
                                        </span>
                                    </div>

                                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                                        {colTasks.length === 0 ? (
                                            <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-gray-700/50 rounded-xl">
                                                No tasks in {column.title}
                                            </div>
                                        ) : (
                                            colTasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    className="bg-[#1E293B] border border-gray-700/80 hover:border-purple-500/50 rounded-xl p-4 shadow-md transition-all space-y-2 group"
                                                >
                                                    <div className="flex justify-between items-start gap-2">
                                                        <span className="font-mono text-[10px] text-gray-400">{task.id}</span>
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                            task.priority === "urgent"
                                                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                                                : task.priority === "high"
                                                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                                        }`}>
                                                            {task.priority}
                                                        </span>
                                                    </div>

                                                    <h4 className="font-bold text-white text-xs group-hover:text-purple-300 transition-colors">
                                                        {task.title}
                                                    </h4>

                                                    <div className="text-[11px] text-cyan-400 font-medium truncate">
                                                        {task.project}
                                                    </div>

                                                    {task.description && (
                                                        <p className="text-[11px] text-gray-400 line-clamp-2">
                                                            {task.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-[11px] text-gray-400">
                                                        <div className="flex items-center gap-1.5 font-medium text-gray-300">
                                                            <div className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[9px] flex items-center justify-center">
                                                                {task.assignee.charAt(0)}
                                                            </div>
                                                            <span>{task.assignee.split(" ")[0]}</span>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={11} className="text-purple-400" />
                                                            <span>{new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                                        </div>
                                                    </div>

                                                    {/* Quick State Toggle */}
                                                    <button
                                                        onClick={() => toggleTaskStatus(task.id)}
                                                        className="w-full text-center text-[10px] text-gray-400 hover:text-white py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer mt-1 font-semibold"
                                                    >
                                                        {task.status === "done" ? "↺ Move to Todo" : "✓ Advance Stage"}
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ========================================================================= */}
                {/* LIST VIEW                                                                 */}
                {/* ========================================================================= */}
                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                        <table className="w-full text-xs md:text-sm">
                            <thead className="bg-[#0F172A] border-b border-gray-700 text-left text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3.5">Task Title</th>
                                    <th className="px-4 py-3.5">Project</th>
                                    <th className="px-4 py-3.5">Assignee</th>
                                    <th className="px-4 py-3.5">Deadline</th>
                                    <th className="px-4 py-3.5">Priority</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3.5 font-bold text-white">
                                            <div>{task.title}</div>
                                            <div className="text-[10px] text-gray-500 font-mono">{task.id}</div>
                                        </td>
                                        <td className="px-4 py-3.5 text-cyan-400 font-medium">{task.project}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5 text-gray-300 font-medium">
                                                <div className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[9px] flex items-center justify-center">
                                                    {task.assignee.charAt(0)}
                                                </div>
                                                <span>{task.assignee}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-300">{new Date(task.deadline).toLocaleDateString()}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                                                task.priority === "urgent"
                                                    ? "bg-rose-500/20 text-rose-300"
                                                    : task.priority === "high"
                                                    ? "bg-amber-500/20 text-amber-300"
                                                    : "bg-blue-500/20 text-blue-300"
                                            }`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                                task.status === "done"
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : task.status === "in_progress"
                                                    ? "bg-blue-500/20 text-blue-400"
                                                    : "bg-amber-500/20 text-amber-400"
                                            }`}>
                                                {task.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button
                                                onClick={() => toggleTaskStatus(task.id)}
                                                className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
                                            >
                                                Advance →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                                    <CheckSquare size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Add New Task</h3>
                                    <p className="text-xs text-gray-400">Assign task deliverable to sprint roadmap</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-white text-sm p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Task Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g. Implement Bank Reconciliation Algorithm"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
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
                                    <label className="block text-gray-300 font-semibold mb-1">Assignee</label>
                                    <select
                                        value={newAssignee}
                                        onChange={(e) => setNewAssignee(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                                    >
                                        <option value="Salim Ghauri">Salim Ghauri</option>
                                        <option value="Sarah Vance">Sarah Vance</option>
                                        <option value="Jane Smith">Jane Smith</option>
                                        <option value="Bob Wilson">Bob Wilson</option>
                                        <option value="Bilal Mahmood">Bilal Mahmood</option>
                                        <option value="Alexander Hayes">Alexander Hayes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Deadline</label>
                                    <input
                                        type="date"
                                        required
                                        value={newDeadline}
                                        onChange={(e) => setNewDeadline(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Priority</label>
                                    <select
                                        value={newPriority}
                                        onChange={(e) => setNewPriority(e.target.value as any)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">🔥 Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Initial Status</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value as any)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="review">Code Review</option>
                                        <option value="done">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Description / Acceptance Criteria</label>
                                <textarea
                                    rows={2}
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    placeholder="Steps, deliverables, and requirements..."
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                                >
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
