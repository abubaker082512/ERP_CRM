"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import {
    CheckSquare,
    Clock,
    Star,
    Plus,
    Calendar,
    X,
    CheckCircle2,
    Tag,
    Trash2,
    Sliders,
    ListTodo,
    Check,
    Flame,
    Flag,
    Sparkles,
    Briefcase
} from "lucide-react";

const MENU_ITEMS = [
    { name: "My Tasks", href: "/todo" },
    { name: "History", href: "/todo/history" },
    { name: "Project Tasks", href: "/project/tasks" },
    { name: "Settings", href: "/settings" },
];

export type Todo = {
    id: string;
    title: string;
    due_date: string;
    priority: "urgent" | "high" | "medium" | "low";
    status: "pending" | "done";
    starred: boolean;
    category: "Deliverables" | "Administration" | "Review" | "Personal";
    tags: string[];
    subtasks?: { id: string; text: string; completed: boolean }[];
};

const INITIAL_TODOS: Todo[] = [
    {
        id: "TD/001",
        title: "Finalize Multi-Tenant PostgreSQL RLS Policies",
        due_date: "2026-03-09",
        priority: "urgent",
        status: "pending",
        starred: true,
        category: "Deliverables",
        tags: ["Security", "Database", "Sprint 4"],
        subtasks: [
            { id: "st1", text: "Test tenant isolation with foreign keys", completed: true },
            { id: "st2", text: "Benchmark query latency under heavy load", completed: false }
        ]
    },
    {
        id: "TD/002",
        title: "Review Q1 Financial Journal & Tax Summary Statements",
        due_date: "2026-03-10",
        priority: "high",
        status: "pending",
        starred: true,
        category: "Review",
        tags: ["Accounting", "Audit"],
        subtasks: [
            { id: "st1", text: "Reconcile Bank of America operating ledger", completed: true },
            { id: "st2", text: "Sign off vendor invoice breakdown", completed: false }
        ]
    },
    {
        id: "TD/003",
        title: "Update Team Resource Allocation for Mobile CRM Sprint",
        due_date: "2026-03-11",
        priority: "medium",
        status: "pending",
        starred: false,
        category: "Deliverables",
        tags: ["Planning", "Mobile"],
        subtasks: [
            { id: "st1", text: "Assign Jane Smith and Marcus Jenkins", completed: true }
        ]
    },
    {
        id: "TD/004",
        title: "Prepare Client Demo Deck for Acme Global Corp",
        due_date: "2026-03-08",
        priority: "high",
        status: "done",
        starred: false,
        category: "Administration",
        tags: ["Sales", "Pitch"],
        subtasks: [
            { id: "st1", text: "Capture interactive dashboard screenshots", completed: true },
            { id: "st2", text: "Highlight live leads pool integration", completed: true }
        ]
    },
    {
        id: "TD/005",
        title: "Verify Zebra RFID Scanner Firmware for Karachi Warehouse",
        due_date: "2026-03-07",
        priority: "urgent",
        status: "done",
        starred: true,
        category: "Deliverables",
        tags: ["SupplyChain", "Hardware"],
        subtasks: [
            { id: "st1", text: "Scan 500 test pallet barcodes", completed: true }
        ]
    }
];

export default function TodoPage() {
    const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS);
    const [currentView, setCurrentView] = useState<ViewType>("list");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterPriority, setFilterPriority] = useState<string>("all");

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDueDate, setNewDueDate] = useState(new Date().toISOString().slice(0, 10));
    const [newPriority, setNewPriority] = useState<Todo["priority"]>("high");
    const [newCategory, setNewCategory] = useState<Todo["category"]>("Deliverables");
    const [newTags, setNewTags] = useState("Operations");
    const [newSubtask1, setNewSubtask1] = useState("");
    const [newSubtask2, setNewSubtask2] = useState("");

    const [toastMsg, setToastMsg] = useState("");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleCreateTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        const tagList = newTags.split(",").map(t => t.trim()).filter(Boolean);
        const subtasks = [];
        if (newSubtask1.trim()) subtasks.push({ id: `st_${Date.now()}_1`, text: newSubtask1.trim(), completed: false });
        if (newSubtask2.trim()) subtasks.push({ id: `st_${Date.now()}_2`, text: newSubtask2.trim(), completed: false });

        const newTodo: Todo = {
            id: `TD/00${todos.length + 1}`,
            title: newTitle.trim(),
            due_date: newDueDate,
            priority: newPriority,
            status: "pending",
            starred: false,
            category: newCategory,
            tags: tagList.length > 0 ? tagList : ["General"],
            subtasks: subtasks.length > 0 ? subtasks : undefined
        };

        setTodos([newTodo, ...todos]);
        setIsCreateModalOpen(false);
        setNewTitle("");
        setNewSubtask1("");
        setNewSubtask2("");
        showToast(`🎉 Added task: "${newTodo.title}"!`);
    };

    const toggleTodoStatus = (id: string) => {
        setTodos(todos.map(t => {
            if (t.id === id) {
                const nextStatus = t.status === "done" ? "pending" : "done";
                if (nextStatus === "done") {
                    showToast(`✨ Completed: "${t.title}"!`);
                }
                return { ...t, status: nextStatus };
            }
            return t;
        }));
    };

    const toggleStar = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTodos(todos.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
    };

    const deleteTodo = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTodos(todos.filter(t => t.id !== id));
        showToast("Task removed.");
    };

    const totalCount = todos.length;
    const completedCount = todos.filter(t => t.status === "done").length;
    const pendingCount = todos.filter(t => t.status === "pending").length;
    const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const filteredTodos = todos.filter(t => {
        if (filterCategory !== "all" && t.category !== filterCategory) return false;
        if (filterPriority !== "all" && t.priority !== filterPriority) return false;
        return true;
    });

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="To Do"
                moduleIcon={<CheckSquare size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search my tasks, deliverables, tags..."
                onNewClick={() => setIsCreateModalOpen(true)}
                newButtonText="Add Task"
            />

            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
                {/* Progress & Focus Banner */}
                <div className="bg-gradient-to-r from-blue-900/40 via-[#1E293B] to-purple-900/30 border border-blue-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-3 max-w-2xl">
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                                    <CheckSquare size={22} />
                                </span>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    Daily Focus & Operational Checklist
                                </h2>
                            </div>
                            <p className="text-xs md:text-sm text-gray-300">
                                Track personal action items, manage immediate sprint deliverables, and mark subtasks done.
                            </p>

                            {/* Progress bar */}
                            <div className="space-y-1.5 pt-1">
                                <div className="flex justify-between text-xs font-semibold text-gray-300">
                                    <span>Overall Task Velocity</span>
                                    <span className="text-blue-400">{completedCount} of {totalCount} Completed ({completionPct}%)</span>
                                </div>
                                <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                                        style={{ width: `${completionPct}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
                            >
                                <Plus size={16} />
                                <span>Create New Task</span>
                            </button>
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

                {/* Filter Tabs & Views */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {["all", "Deliverables", "Review", "Administration", "Personal"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    filterCategory === cat
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                        : "bg-[#1E293B] text-gray-400 hover:text-white border border-gray-700/60"
                                }`}
                            >
                                {cat === "all" ? "All Categories" : cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* LIST VIEW                                                                 */}
                {/* ========================================================================= */}
                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                        <div className="divide-y divide-gray-800">
                            {filteredTodos.map((todo) => {
                                const isDone = todo.status === "done";
                                return (
                                    <div
                                        key={todo.id}
                                        onClick={() => toggleTodoStatus(todo.id)}
                                        className={`p-4 md:p-5 flex items-start justify-between gap-4 hover:bg-white/5 transition-all cursor-pointer group ${
                                            isDone ? "opacity-60 bg-black/20" : ""
                                        }`}
                                    >
                                        <div className="flex items-start gap-3.5 flex-1">
                                            {/* Custom Checkbox */}
                                            <button
                                                type="button"
                                                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all mt-0.5 cursor-pointer ${
                                                    isDone
                                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                                        : "border-gray-600 hover:border-blue-400 bg-[#0F172A]"
                                                }`}
                                            >
                                                {isDone && <Check size={14} strokeWidth={3} />}
                                            </button>

                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-sm font-bold text-white transition-all ${isDone ? "line-through text-gray-400" : "group-hover:text-blue-300"}`}>
                                                        {todo.title}
                                                    </span>

                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                        todo.priority === "urgent"
                                                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                                            : todo.priority === "high"
                                                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                                    }`}>
                                                        {todo.priority}
                                                    </span>

                                                    <span className="text-[10px] font-semibold bg-white/5 text-gray-400 px-2 py-0.5 rounded">
                                                        {todo.category}
                                                    </span>
                                                </div>

                                                {/* Subtasks */}
                                                {todo.subtasks && todo.subtasks.length > 0 && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                                                        <ListTodo size={13} className="text-blue-400" />
                                                        <span>
                                                            {todo.subtasks.filter(s => s.completed).length} of {todo.subtasks.length} subtasks done
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Tags & Due Date */}
                                                <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
                                                    <div className="flex items-center gap-1 text-gray-400">
                                                        <Calendar size={12} className="text-purple-400" />
                                                        <span>Due {new Date(todo.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {todo.tags.map((t, idx) => (
                                                            <span key={idx} className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">
                                                                #{t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={(e) => toggleStar(todo.id, e)}
                                                className="text-gray-500 hover:text-amber-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                                title="Star task"
                                            >
                                                <Star size={16} className={todo.starred ? "fill-amber-400 text-amber-400" : ""} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(e) => deleteTodo(todo.id, e)}
                                                className="text-gray-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                                title="Delete task"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* KANBAN VIEW                                                               */}
                {/* ========================================================================= */}
                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pending Column */}
                        <div className="bg-[#1E293B]/70 border border-gray-700/80 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-700/60">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                                    <h3 className="font-bold text-white text-sm">To Do / In Progress</h3>
                                </div>
                                <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded-md text-gray-300">
                                    {filteredTodos.filter(t => t.status === "pending").length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {filteredTodos.filter(t => t.status === "pending").map(todo => (
                                    <div
                                        key={todo.id}
                                        onClick={() => toggleTodoStatus(todo.id)}
                                        className="bg-[#1E293B] border border-gray-700 hover:border-blue-500/60 p-4 rounded-xl space-y-2.5 transition-all cursor-pointer group shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                todo.priority === "urgent" ? "bg-rose-500/20 text-rose-300" : "bg-blue-500/20 text-blue-300"
                                            }`}>
                                                {todo.priority}
                                            </span>
                                            <Star size={14} className={todo.starred ? "fill-amber-400 text-amber-400" : "text-gray-500"} />
                                        </div>
                                        <h4 className="font-bold text-white text-xs group-hover:text-blue-300">{todo.title}</h4>
                                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-800">
                                            <span>{todo.category}</span>
                                            <span>{new Date(todo.due_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Completed Column */}
                        <div className="bg-[#1E293B]/70 border border-gray-700/80 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-700/60">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                    <h3 className="font-bold text-white text-sm">Completed</h3>
                                </div>
                                <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded-md text-gray-300">
                                    {filteredTodos.filter(t => t.status === "done").length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {filteredTodos.filter(t => t.status === "done").map(todo => (
                                    <div
                                        key={todo.id}
                                        onClick={() => toggleTodoStatus(todo.id)}
                                        className="bg-[#1E293B] border border-gray-700 hover:border-emerald-500/60 p-4 rounded-xl space-y-2.5 transition-all cursor-pointer opacity-75 shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                                Completed
                                            </span>
                                            <CheckCircle2 size={16} className="text-emerald-400" />
                                        </div>
                                        <h4 className="font-bold text-gray-300 text-xs line-through">{todo.title}</h4>
                                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-800">
                                            <span>{todo.category}</span>
                                            <span className="text-emerald-400 font-bold">Done</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* CREATE TODO MODAL                                                         */}
            {/* ========================================================================= */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
                                    <CheckSquare size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Add New Action Item</h3>
                                    <p className="text-xs text-gray-400">Personal & sprint checklist item</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTodo} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Task Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g. Test Multi-Schema Tenant Isolation"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Category</label>
                                    <select
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value as any)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                                    >
                                        <option value="Deliverables">Deliverables</option>
                                        <option value="Review">Review</option>
                                        <option value="Administration">Administration</option>
                                        <option value="Personal">Personal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Priority</label>
                                    <select
                                        value={newPriority}
                                        onChange={(e) => setNewPriority(e.target.value as any)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">🔥 Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Target Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newDueDate}
                                        onChange={(e) => setNewDueDate(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Tags (Comma Separated)</label>
                                    <input
                                        type="text"
                                        value={newTags}
                                        onChange={(e) => setNewTags(e.target.value)}
                                        placeholder="e.g. Backend, Sprint, DB"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 bg-[#1E293B] p-3.5 rounded-xl border border-white/10">
                                <label className="block text-gray-300 font-semibold">Subtasks / Checklist Steps (Optional)</label>
                                <input
                                    type="text"
                                    value={newSubtask1}
                                    onChange={(e) => setNewSubtask1(e.target.value)}
                                    placeholder="Step 1: e.g. Design schema migration"
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                                <input
                                    type="text"
                                    value={newSubtask2}
                                    onChange={(e) => setNewSubtask2(e.target.value)}
                                    placeholder="Step 2: e.g. Execute integration test pass"
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
                                >
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
