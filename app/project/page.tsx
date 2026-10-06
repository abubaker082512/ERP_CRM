"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import Link from "next/link";
import {
    FolderKanban,
    CheckSquare,
    Clock,
    TrendingUp,
    Users,
    Plus,
    Calendar,
    DollarSign,
    Tag,
    User,
    CheckCircle2,
    AlertCircle,
    Flag,
    MoreHorizontal,
    X,
    ExternalLink,
    Filter,
    Flame,
    Building2
} from "lucide-react";

const MENU_ITEMS = [
    { name: "Projects", href: "/project" },
    { name: "Tasks", href: "/project/tasks" },
    { name: "Timesheets", href: "/project/timesheets" },
    { name: "Reporting", href: "/project/reporting" },
    { name: "Configuration", href: "/project/configuration" },
];

export type Project = {
    id: string;
    name: string;
    manager: string;
    customer: string;
    status: "planning" | "in_progress" | "review" | "done" | "on_hold";
    priority: "low" | "medium" | "high" | "urgent";
    tasks: number;
    completed_tasks: number;
    progress: number;
    start_date: string;
    deadline: string;
    budget: number;
    spent: number;
    assignees: { name: string; avatarBg: string }[];
    tags: string[];
    description?: string;
};

const INITIAL_PROJECTS: Project[] = [
    {
        id: "PRJ/2026/001",
        name: "Enterprise Website & ERP Portal Redesign",
        manager: "Salim Ghauri",
        customer: "Acme Global Corp",
        status: "in_progress",
        priority: "high",
        tasks: 16,
        completed_tasks: 7,
        progress: 45,
        start_date: "2025-12-01",
        deadline: "2026-04-15",
        budget: 45000,
        spent: 18500,
        assignees: [
            { name: "John Doe", avatarBg: "bg-blue-600" },
            { name: "Sarah Vance", avatarBg: "bg-purple-600" },
            { name: "Bilal Mahmood", avatarBg: "bg-emerald-600" },
            { name: "Elena Belmont", avatarBg: "bg-amber-600" }
        ],
        tags: ["Next.js", "UI/UX", "Tailwind", "Supabase"],
        description: "Full modern overhaul of customer dashboard, unified accounting portals, and responsive design."
    },
    {
        id: "PRJ/2026/002",
        name: "Mobile CRM & Field Agent iOS/Android App",
        manager: "Jane Smith",
        customer: "Tech Dynamics Solutions",
        status: "planning",
        priority: "medium",
        tasks: 12,
        completed_tasks: 2,
        progress: 18,
        start_date: "2026-01-10",
        deadline: "2026-06-30",
        budget: 32000,
        spent: 6000,
        assignees: [
            { name: "Jane Smith", avatarBg: "bg-pink-600" },
            { name: "Marcus Jenkins", avatarBg: "bg-cyan-600" },
            { name: "Hamza Javed", avatarBg: "bg-indigo-600" }
        ],
        tags: ["Flutter", "iOS", "Android", "REST API"],
        description: "Native field sales tracking, offline leads synchronization, and real-time push notifications."
    },
    {
        id: "PRJ/2026/003",
        name: "Supply Chain & Multi-Warehouse Automation",
        manager: "Bob Wilson",
        customer: "Global Industries Group",
        status: "done",
        priority: "urgent",
        tasks: 28,
        completed_tasks: 28,
        progress: 100,
        start_date: "2025-09-01",
        deadline: "2026-02-28",
        budget: 85000,
        spent: 81200,
        assignees: [
            { name: "Bob Wilson", avatarBg: "bg-amber-600" },
            { name: "Asif Peer", avatarBg: "bg-teal-600" },
            { name: "Rachel Hayes", avatarBg: "bg-rose-600" }
        ],
        tags: ["Inventory", "Barcode", "Logistics", "SAP S/4"],
        description: "Automated replenishment thresholds, multi-currency vendor RFQ engine, and RFID tracking."
    },
    {
        id: "PRJ/2026/004",
        name: "AI Business Intelligence & Sales Copilot",
        manager: "Alexander Hayes",
        customer: "Beraxis Internal Labs",
        status: "in_progress",
        priority: "urgent",
        tasks: 20,
        completed_tasks: 14,
        progress: 70,
        start_date: "2026-01-01",
        deadline: "2026-05-15",
        budget: 50000,
        spent: 34000,
        assignees: [
            { name: "Alexander Hayes", avatarBg: "bg-purple-600" },
            { name: "Zainab Siddiqui", avatarBg: "bg-rose-600" },
            { name: "David Cooper", avatarBg: "bg-blue-600" }
        ],
        tags: ["OpenAI", "Python", "FastAPI", "Vector DB"],
        description: "Autonomous lead enrichment, speech-to-text meeting summaries, and predictive CRM analytics."
    }
];

const AVAILABLE_TEAM_MEMBERS = [
    { name: "Salim Ghauri", avatarBg: "bg-blue-600" },
    { name: "Sarah Vance", avatarBg: "bg-purple-600" },
    { name: "Bilal Mahmood", avatarBg: "bg-emerald-600" },
    { name: "Jane Smith", avatarBg: "bg-pink-600" },
    { name: "Marcus Jenkins", avatarBg: "bg-cyan-600" },
    { name: "Bob Wilson", avatarBg: "bg-amber-600" },
    { name: "Elena Belmont", avatarBg: "bg-rose-600" },
    { name: "Hamza Javed", avatarBg: "bg-indigo-600" },
    { name: "Zainab Siddiqui", avatarBg: "bg-teal-600" }
];

export default function ProjectPage() {
    const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");

    // Filter state
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Create New Project Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newCustomer, setNewCustomer] = useState("");
    const [newManager, setNewManager] = useState("Salim Ghauri");
    const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 10));
    const [newDeadline, setNewDeadline] = useState(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    const [newBudget, setNewBudget] = useState("");
    const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
    const [newStatus, setNewStatus] = useState<"planning" | "in_progress" | "review" | "done" | "on_hold">("planning");
    const [newDescription, setNewDescription] = useState("");
    const [newTags, setNewTags] = useState("Next.js, ERP");
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>(["Salim Ghauri", "Sarah Vance"]);
    const [successMsg, setSuccessMsg] = useState("");

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        const assigneesList = AVAILABLE_TEAM_MEMBERS.filter(m => selectedAssignees.includes(m.name));
        const tagsList = newTags.split(",").map(t => t.trim()).filter(Boolean);

        const newProj: Project = {
            id: `PRJ/2026/00${projects.length + 1}`,
            name: newName.trim(),
            manager: newManager,
            customer: newCustomer.trim() || "Enterprise Client",
            status: newStatus,
            priority: newPriority,
            tasks: 8,
            completed_tasks: 0,
            progress: 0,
            start_date: newStartDate,
            deadline: newDeadline,
            budget: parseFloat(newBudget) || 25000,
            spent: 0,
            assignees: assigneesList.length > 0 ? assigneesList : [AVAILABLE_TEAM_MEMBERS[0]],
            tags: tagsList.length > 0 ? tagsList : ["Project"],
            description: newDescription.trim() || "Active project roadmap and milestones."
        };

        setProjects([newProj, ...projects]);
        setSuccessMsg(`🎉 Project "${newProj.name}" created successfully!`);
        setTimeout(() => setSuccessMsg(""), 6000);

        // Reset form
        setShowCreateModal(false);
        setNewName("");
        setNewCustomer("");
        setNewBudget("");
        setNewDescription("");
    };

    const toggleAssignee = (memberName: string) => {
        if (selectedAssignees.includes(memberName)) {
            setSelectedAssignees(selectedAssignees.filter(n => n !== memberName));
        } else {
            setSelectedAssignees([...selectedAssignees, memberName]);
        }
    };

    const filteredProjects = projects.filter(p => {
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        const matchesQuery = !searchQuery || 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesQuery;
    });

    const getRemainingDays = (deadline: string) => {
        const diff = new Date(deadline).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 0) return `${Math.abs(days)}d overdue`;
        if (days === 0) return "Due today";
        return `${days} days remaining`;
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Project"
                moduleIcon={<FolderKanban size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search projects, tasks, assignees..."
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                onNewClick={() => setShowCreateModal(true)}
                newButtonText="New Project"
            />

            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
                {/* Header & Main Controls */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-white tracking-tight">
                                Project Portfolio Management
                            </h2>
                            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                {projects.length} Active Projects
                            </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">
                            Track timelines, assignees, milestones, budget spend, and sprint progress across your engineering & operations teams.
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
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                        >
                            <Plus size={16} />
                            <span>Create New Project</span>
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

                {/* Key Metrics Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#1E293B] border border-gray-700/80 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center justify-between text-gray-400 mb-2 text-xs font-semibold">
                            <span>Total Portfolio Budget</span>
                            <DollarSign size={16} className="text-emerald-400" />
                        </div>
                        <div className="text-xl md:text-2xl font-black text-white">
                            ${projects.reduce((acc, p) => acc + p.budget, 0).toLocaleString()}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">
                            ${projects.reduce((acc, p) => acc + p.spent, 0).toLocaleString()} utilized
                        </div>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-700/80 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center justify-between text-gray-400 mb-2 text-xs font-semibold">
                            <span>In Progress Projects</span>
                            <Clock size={16} className="text-blue-400" />
                        </div>
                        <div className="text-xl md:text-2xl font-black text-blue-400">
                            {projects.filter(p => p.status === "in_progress").length}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">Active sprint execution</div>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-700/80 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center justify-between text-gray-400 mb-2 text-xs font-semibold">
                            <span>Total Tasks</span>
                            <CheckSquare size={16} className="text-purple-400" />
                        </div>
                        <div className="text-xl md:text-2xl font-black text-purple-300">
                            {projects.reduce((acc, p) => acc + p.tasks, 0)}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">
                            {projects.reduce((acc, p) => acc + p.completed_tasks, 0)} completed
                        </div>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-700/80 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center justify-between text-gray-400 mb-2 text-xs font-semibold">
                            <span>Team Resources</span>
                            <Users size={16} className="text-amber-400" />
                        </div>
                        <div className="text-xl md:text-2xl font-black text-amber-300">
                            {AVAILABLE_TEAM_MEMBERS.length} Engineers
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">Cross-functional allocated</div>
                    </div>
                </div>

                {/* Filter Pills Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <span className="text-gray-400 font-semibold mr-1">Status:</span>
                    {[
                        { id: "all", label: "All Projects" },
                        { id: "planning", label: "Planning" },
                        { id: "in_progress", label: "In Progress" },
                        { id: "review", label: "Review" },
                        { id: "done", label: "Completed" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                                statusFilter === tab.id
                                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                    : "bg-[#1E293B] text-gray-400 hover:text-white border border-gray-700/60"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ========================================================================= */}
                {/* KANBAN VIEW                                                               */}
                {/* ========================================================================= */}
                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map(project => {
                            const isDone = project.status === "done";
                            return (
                                <div
                                    key={project.id}
                                    className="bg-[#1E293B] border border-gray-700/80 hover:border-purple-500/50 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group"
                                >
                                    <div>
                                        {/* Card Header & Status */}
                                        <div className="flex justify-between items-start mb-3 gap-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[10px] text-gray-400">{project.id}</span>
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                                        project.priority === "urgent"
                                                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                                            : project.priority === "high"
                                                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                                    }`}>
                                                        {project.priority}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-white text-base leading-snug group-hover:text-purple-300 transition-colors">
                                                    {project.name}
                                                </h3>
                                                <div className="text-xs text-cyan-400 font-medium flex items-center gap-1">
                                                    <Building2 size={12} />
                                                    <span>{project.customer}</span>
                                                </div>
                                            </div>

                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize shrink-0 ${
                                                project.status === "done"
                                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                    : project.status === "in_progress"
                                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                            }`}>
                                                {project.status.replace("_", " ")}
                                            </span>
                                        </div>

                                        {project.description && (
                                            <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                                                {project.description}
                                            </p>
                                        )}

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {project.tags.map((tag, i) => (
                                                <span key={i} className="text-[10px] bg-black/40 text-gray-300 border border-white/10 px-2 py-0.5 rounded-md">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Timeline & Budget Stats */}
                                        <div className="p-3 bg-[#0F172A]/70 rounded-xl border border-gray-700/60 space-y-2 mb-4 text-xs">
                                            {/* Timeline */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 flex items-center gap-1">
                                                    <Calendar size={13} className="text-purple-400" /> Timeline
                                                </span>
                                                <span className="font-semibold text-gray-200">
                                                    {new Date(project.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} → {new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-gray-500">Duration</span>
                                                <span className={`font-semibold ${isDone ? "text-emerald-400" : "text-amber-400"}`}>
                                                    {isDone ? "Completed on schedule" : getRemainingDays(project.deadline)}
                                                </span>
                                            </div>

                                            {/* Budget Tracking */}
                                            <div className="flex items-center justify-between pt-1.5 border-t border-gray-800">
                                                <span className="text-gray-400 flex items-center gap-1">
                                                    <DollarSign size={13} className="text-emerald-400" /> Budget
                                                </span>
                                                <span className="font-mono font-bold text-white">
                                                    ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-1.5 mb-4">
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="text-gray-400">
                                                    Tasks: {project.completed_tasks}/{project.tasks} ({project.progress}%)
                                                </span>
                                                <span className="text-white font-mono">{project.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        isDone
                                                            ? "bg-emerald-500"
                                                            : project.progress > 50
                                                            ? "bg-blue-500"
                                                            : "bg-purple-500"
                                                    }`}
                                                    style={{ width: `${project.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer: Assignees & Quick Action */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-700/60">
                                        {/* Multi-Assignee Avatar Stack */}
                                        <div className="flex items-center">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {project.assignees.map((assignee, idx) => (
                                                    <div
                                                        key={idx}
                                                        title={assignee.name}
                                                        className={`inline-block h-7 w-7 rounded-full text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-[#1E293B] shadow ${assignee.avatarBg}`}
                                                    >
                                                        {assignee.name.split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[11px] text-gray-400 ml-2 font-medium">
                                                {project.manager} (Lead)
                                            </span>
                                        </div>

                                        <Link
                                            href={`/project/tasks?project=${encodeURIComponent(project.name)}`}
                                            className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            View Tasks →
                                        </Link>
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
                                    <th className="px-4 py-3.5">Project & Customer</th>
                                    <th className="px-4 py-3.5">Manager & Team</th>
                                    <th className="px-4 py-3.5">Timeline & Deadline</th>
                                    <th className="px-4 py-3.5">Budget</th>
                                    <th className="px-4 py-3.5">Task Progress</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.map(project => (
                                    <tr key={project.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-white">{project.name}</div>
                                            <div className="text-xs text-cyan-400 mt-0.5">{project.customer}</div>
                                            <div className="text-[10px] text-gray-500 font-mono mt-0.5">{project.id}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {project.assignees.map((a, idx) => (
                                                        <div
                                                            key={idx}
                                                            title={a.name}
                                                            className={`w-6 h-6 rounded-full text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-[#1E293B] ${a.avatarBg}`}
                                                        >
                                                            {a.name.split(" ").map(n => n[0]).join("")}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-gray-300 font-medium">
                                                    {project.manager}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-gray-200 font-medium">
                                                {new Date(project.deadline).toLocaleDateString()}
                                            </div>
                                            <div className="text-[11px] text-amber-400 font-semibold">
                                                {getRemainingDays(project.deadline)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 font-mono">
                                            <div className="text-white font-bold">${project.spent.toLocaleString()}</div>
                                            <div className="text-[11px] text-gray-400">of ${project.budget.toLocaleString()}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="w-32 space-y-1">
                                                <div className="flex justify-between text-[11px] text-gray-400">
                                                    <span>{project.completed_tasks}/{project.tasks}</span>
                                                    <span>{project.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-800 rounded-full h-1.5">
                                                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${project.progress}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                                project.status === "done"
                                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                    : project.status === "in_progress"
                                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                            }`}>
                                                {project.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Link
                                                href={`/project/tasks?project=${encodeURIComponent(project.name)}`}
                                                className="text-xs text-purple-400 hover:text-purple-300 font-bold"
                                            >
                                                Tasks →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create New Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                                    <FolderKanban size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Create New Project</h3>
                                    <p className="text-xs text-gray-400">Configure project timeline, team assignees, budget & milestones</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-white text-sm p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Project Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. NextGen Mobile Banking Platform"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Customer / Client</label>
                                    <input
                                        type="text"
                                        value={newCustomer}
                                        onChange={(e) => setNewCustomer(e.target.value)}
                                        placeholder="e.g. Acme Corp, Systems Ltd"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Project Manager / Lead</label>
                                    <select
                                        value={newManager}
                                        onChange={(e) => setNewManager(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                                    >
                                        {AVAILABLE_TEAM_MEMBERS.map(m => (
                                            <option key={m.name} value={m.name}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Project Timeline (Start Date & Deadline) */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newStartDate}
                                        onChange={(e) => setNewStartDate(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Deadline / Target Delivery</label>
                                    <input
                                        type="date"
                                        required
                                        value={newDeadline}
                                        onChange={(e) => setNewDeadline(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Budget ($)</label>
                                    <input
                                        type="number"
                                        value={newBudget}
                                        onChange={(e) => setNewBudget(e.target.value)}
                                        placeholder="e.g. 35000"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
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
                                        <option value="planning">Planning</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="review">Review</option>
                                        <option value="on_hold">On Hold</option>
                                    </select>
                                </div>
                            </div>

                            {/* Assignee Team Members Chips */}
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1.5">Assign Team Members</label>
                                <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#1E293B] border border-white/10 rounded-xl">
                                    {AVAILABLE_TEAM_MEMBERS.map(m => {
                                        const isSelected = selectedAssignees.includes(m.name);
                                        return (
                                            <button
                                                type="button"
                                                key={m.name}
                                                onClick={() => toggleAssignee(m.name)}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-purple-600 text-white shadow"
                                                        : "bg-black/30 text-gray-400 hover:text-white"
                                                }`}
                                            >
                                                <span className={`w-3.5 h-3.5 rounded-full ${m.avatarBg} text-[8px] flex items-center justify-center text-white font-bold`}>
                                                    {m.name[0]}
                                                </span>
                                                <span>{m.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Tags (Comma Separated)</label>
                                <input
                                    type="text"
                                    value={newTags}
                                    onChange={(e) => setNewTags(e.target.value)}
                                    placeholder="e.g. Next.js, AI, Mobile, Security"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Project Description</label>
                                <textarea
                                    rows={2}
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Brief scope, target deliverables, and milestone objectives..."
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
                                    Launch Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
