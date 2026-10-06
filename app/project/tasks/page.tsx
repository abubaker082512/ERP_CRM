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
    Flag,
    Mail,
    Send,
    Shield,
    Sliders,
    ListTodo,
    Check,
    Edit3,
    Sparkles,
    Trash2,
    Copy,
    Share2,
    FileText,
    UserPlus,
    Lock
} from "lucide-react";

const MENU_ITEMS = [
    { name: "Projects", href: "/project" },
    { name: "Tasks", href: "/project/tasks" },
    { name: "Timesheets", href: "/project/timesheets" },
    { name: "Reporting", href: "/project/reporting" },
    { name: "Configuration", href: "/project/configuration" },
];

export type ChecklistItem = {
    id: string;
    text: string;
    completed: boolean;
};

export type CompanyMember = {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    avatarBg: string;
    status: "verified" | "invited";
};

export type Task = {
    id: string;
    title: string;
    project: string;
    assignee: string;
    status: "todo" | "in_progress" | "review" | "done";
    priority: "low" | "medium" | "high" | "urgent";
    deadline: string;
    progress: number;
    description?: string;
    checklist: ChecklistItem[];
    notes?: string;
    adminOverride?: boolean;
};

const INITIAL_COMPANY_MEMBERS: CompanyMember[] = [
    { id: "mem_1", name: "Salim Ghauri", email: "salim.ghauri@beraxis.online", role: "Principal Architect", department: "Engineering", avatarBg: "bg-blue-600", status: "verified" },
    { id: "mem_2", name: "Sarah Vance", email: "sarah.vance@beraxis.online", role: "Lead UI/UX Designer", department: "Design", avatarBg: "bg-purple-600", status: "verified" },
    { id: "mem_3", name: "Bilal Mahmood", email: "bilal.mahmood@beraxis.online", role: "ERP Specialist & Controller", department: "Finance", avatarBg: "bg-emerald-600", status: "verified" },
    { id: "mem_4", name: "Jane Smith", email: "jane.smith@beraxis.online", role: "Mobile Engineering Lead", department: "Engineering", avatarBg: "bg-pink-600", status: "verified" },
    { id: "mem_5", name: "Marcus Jenkins", email: "marcus.j@beraxis.online", role: "DevOps & Cloud Engineer", department: "Operations", avatarBg: "bg-cyan-600", status: "verified" },
    { id: "mem_6", name: "Bob Wilson", email: "bob.wilson@beraxis.online", role: "Supply Chain Engineer", department: "Logistics", avatarBg: "bg-amber-600", status: "verified" },
    { id: "mem_7", name: "Elena Belmont", email: "elena.b@beraxis.online", role: "QA Automation Specialist", department: "Quality Assurance", avatarBg: "bg-rose-600", status: "verified" },
    { id: "mem_8", name: "Hamza Javed", email: "hamza.j@beraxis.online", role: "Full-Stack Engineer", department: "Engineering", avatarBg: "bg-indigo-600", status: "verified" },
    { id: "mem_9", name: "Zainab Siddiqui", email: "zainab.s@beraxis.online", role: "AI Prompt & ML Engineer", department: "AI Labs", avatarBg: "bg-teal-600", status: "verified" }
];

const INITIAL_TASKS: Task[] = [
    {
        id: "TSK/001",
        title: "Design Homepage & Layout System",
        project: "Enterprise Website & ERP Portal Redesign",
        assignee: "Sarah Vance",
        status: "in_progress",
        priority: "high",
        deadline: "2026-03-10",
        progress: 65,
        description: "Design responsive grid, topbars, and dark mode palette for Beraxis Suite.",
        checklist: [
            { id: "c1", text: "Wireframe standard module headers & breadcrumbs", completed: true },
            { id: "c2", text: "Create dark mode color tokens & CSS variables", completed: true },
            { id: "c3", text: "Mobile responsive drawer navigation test", completed: false },
            { id: "c4", text: "Cross-browser Safari & Chrome QA pass", completed: false }
        ],
        notes: "Design tokens synced with Tailwind palette. Ready for mobile breakpoint QA."
    },
    {
        id: "TSK/002",
        title: "Setup Database & JWT Auth Middleware",
        project: "Enterprise Website & ERP Portal Redesign",
        assignee: "Salim Ghauri",
        status: "done",
        priority: "urgent",
        deadline: "2026-02-15",
        progress: 100,
        description: "Configure multi-tenant RLS policies and secure session token rotation.",
        checklist: [
            { id: "c1", text: "PostgreSQL multi-schema tenant isolation", completed: true },
            { id: "c2", text: "FastAPI JWT bearer token authentication", completed: true },
            { id: "c3", text: "Role-based access control (RBAC) middleware", completed: true }
        ],
        notes: "Security audit passed with zero vulnerabilities."
    },
    {
        id: "TSK/003",
        title: "Offline Lead Sync Engine",
        project: "Mobile CRM & Field Agent iOS/Android App",
        assignee: "Jane Smith",
        status: "todo",
        priority: "medium",
        deadline: "2026-04-15",
        progress: 10,
        description: "SQLite local cache with two-way conflict resolution engine.",
        checklist: [
            { id: "c1", text: "Design offline delta sync protocol", completed: true },
            { id: "c2", text: "SQLite local database indexed schema", completed: false },
            { id: "c3", text: "Network reconnect background dispatcher", completed: false }
        ],
        notes: "Architecture draft submitted for senior engineering signoff."
    },
    {
        id: "TSK/004",
        title: "RFID Warehouse Barcode Integration",
        project: "Supply Chain & Multi-Warehouse Automation",
        assignee: "Bob Wilson",
        status: "done",
        priority: "high",
        deadline: "2026-02-28",
        progress: 100,
        description: "Connect Zebra RFID scanner SDK to inventory picking & packing flow.",
        checklist: [
            { id: "c1", text: "Zebra Handheld Scanner SDK integration", completed: true },
            { id: "c2", text: "Real-time stock ledger deduction hook", completed: true }
        ],
        notes: "Production firmware tested on 50 handheld scanners across Karachi warehouse."
    },
    {
        id: "TSK/005",
        title: "AI Speech-to-Text Meeting Summarizer",
        project: "AI Business Intelligence & Sales Copilot",
        assignee: "Zainab Siddiqui",
        status: "in_progress",
        priority: "urgent",
        deadline: "2026-03-25",
        progress: 45,
        description: "Whisper API transcription with action item extraction & CRM deal auto-tagging.",
        checklist: [
            { id: "c1", text: "Audio streaming WebSocket ingestion pipeline", completed: true },
            { id: "c2", text: "Action item & decision extractor model prompt", completed: true },
            { id: "c3", text: "CRM Opportunity timeline auto-append", completed: false }
        ],
        notes: "Latency benchmarked at <1.2s per 30s audio segment."
    },
    {
        id: "TSK/006",
        title: "Tax Settlement & P&L Export Engine",
        project: "Enterprise Website & ERP Portal Redesign",
        assignee: "Bilal Mahmood",
        status: "todo",
        priority: "medium",
        deadline: "2026-04-01",
        progress: 0,
        description: "Generate trial balance, tax breakdown spreadsheets, and FBR audit exports.",
        checklist: [
            { id: "c1", text: "FBR tax bracket calculation logic", completed: false },
            { id: "c2", text: "Excel & PDF statement streaming generator", completed: false }
        ],
        notes: "Awaiting final tax advisory regulation updates for 2026."
    }
];

export default function ProjectTasksPage() {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>(INITIAL_COMPANY_MEMBERS);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");
    const [isAdminMode, setIsAdminMode] = useState(true);

    // Create Task Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newProject, setNewProject] = useState("Enterprise Website & ERP Portal Redesign");
    const [newAssignee, setNewAssignee] = useState("Salim Ghauri");
    const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
    const [newStatus, setNewStatus] = useState<"todo" | "in_progress" | "review" | "done">("todo");
    const [newDeadline, setNewDeadline] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    const [newDesc, setNewDesc] = useState("");

    // Task Detail / Edit Drawer
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [newChecklistText, setNewChecklistText] = useState("");

    // Email Progress Report Modal
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailRecipient, setEmailRecipient] = useState("director@beraxis.online");
    const [emailSubject, setEmailSubject] = useState("Beraxis ERP - Executive Project & Task Progress Report");
    const [emailSuccessMsg, setEmailSuccessMsg] = useState("");

    // Invite Colleague Modal
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteName, setInviteName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Software Engineer");
    const [inviteDepartment, setInviteDepartment] = useState("Engineering");

    const [notification, setNotification] = useState("");

    const showToast = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(""), 6000);
    };

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
            progress: newStatus === "done" ? 100 : newStatus === "in_progress" ? 40 : 0,
            description: newDesc.trim(),
            checklist: [
                { id: "c1", text: "Initial requirement analysis & architecture", completed: true },
                { id: "c2", text: "Implementation of core components", completed: false },
                { id: "c3", text: "Peer review & QA sign-off", completed: false }
            ],
            notes: "Created via Beraxis Project Hub."
        };

        setTasks([newTask, ...tasks]);
        showToast(`🎉 Task "${newTask.title}" created and assigned to ${newAssignee}!`);
        setShowCreateModal(false);
        setNewTitle("");
        setNewDesc("");
    };

    const toggleTaskStatus = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setTasks(tasks.map(t => {
            if (t.id === id) {
                const nextStatus: Record<string, "todo" | "in_progress" | "review" | "done"> = {
                    todo: "in_progress",
                    in_progress: "review",
                    review: "done",
                    done: "todo"
                };
                const updatedStatus = nextStatus[t.status] || "done";
                const updatedProgress = updatedStatus === "done" ? 100 : updatedStatus === "review" ? 85 : updatedStatus === "in_progress" ? 50 : 0;
                return { ...t, status: updatedStatus, progress: updatedProgress };
            }
            return t;
        }));
    };

    const toggleChecklistItem = (taskId: string, checkId: string) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                const updatedChecklist = t.checklist.map(item =>
                    item.id === checkId ? { ...item, completed: !item.completed } : item
                );
                const doneCount = updatedChecklist.filter(i => i.completed).length;
                const progressPct = updatedChecklist.length > 0 ? Math.round((doneCount / updatedChecklist.length) * 100) : t.progress;
                const updatedStatus: "todo" | "in_progress" | "review" | "done" =
                    progressPct === 100 ? "done" : progressPct > 0 ? "in_progress" : "todo";

                const updated = {
                    ...t,
                    checklist: updatedChecklist,
                    progress: progressPct,
                    status: updatedStatus
                };
                setSelectedTask(updated);
                return updated;
            }
            return t;
        }));
    };

    const addChecklistItem = (taskId: string) => {
        if (!newChecklistText.trim()) return;
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                const updatedChecklist = [
                    ...t.checklist,
                    { id: `c_${Date.now()}`, text: newChecklistText.trim(), completed: false }
                ];
                const doneCount = updatedChecklist.filter(i => i.completed).length;
                const progressPct = Math.round((doneCount / updatedChecklist.length) * 100);
                const updated = { ...t, checklist: updatedChecklist, progress: progressPct };
                setSelectedTask(updated);
                return updated;
            }
            return t;
        }));
        setNewChecklistText("");
    };

    const deleteChecklistItem = (taskId: string, checkId: string) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                const updatedChecklist = t.checklist.filter(i => i.id !== checkId);
                const doneCount = updatedChecklist.filter(i => i.completed).length;
                const progressPct = updatedChecklist.length > 0 ? Math.round((doneCount / updatedChecklist.length) * 100) : 0;
                const updated = { ...t, checklist: updatedChecklist, progress: progressPct };
                setSelectedTask(updated);
                return updated;
            }
            return t;
        }));
    };

    const updateTaskProgressDirectly = (taskId: string, progressVal: number) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                const status: "todo" | "in_progress" | "review" | "done" =
                    progressVal === 100 ? "done" : progressVal > 75 ? "review" : progressVal > 0 ? "in_progress" : "todo";
                const updated = { ...t, progress: progressVal, status, adminOverride: true };
                setSelectedTask(updated);
                return updated;
            }
            return t;
        }));
    };

    const updateTaskStatusDirectly = (taskId: string, newStatusVal: "todo" | "in_progress" | "review" | "done") => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                const progressVal = newStatusVal === "done" ? 100 : newStatusVal === "review" ? 80 : newStatusVal === "in_progress" ? 50 : 0;
                const updated = { ...t, status: newStatusVal, progress: progressVal, adminOverride: true };
                setSelectedTask(updated);
                return updated;
            }
            return t;
        }));
    };

    const updateTaskAssignee = (taskId: string, newAssigneeName: string) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                const updated = { ...t, assignee: newAssigneeName, adminOverride: true };
                setSelectedTask(updated);
                return updated;
            }
            return t;
        }));
    };

    const updateTaskNotes = (taskId: string, notesText: string) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                const updated = { ...t, notes: notesText };
                setSelectedTask(updated);
                return updated;
            }
            return t;
        }));
    };

    const handleSendInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteName.trim() || !inviteEmail.trim()) return;

        const colors = ["bg-blue-600", "bg-purple-600", "bg-pink-600", "bg-teal-600", "bg-amber-600", "bg-indigo-600", "bg-rose-600"];
        const randomColor = colors[companyMembers.length % colors.length];

        const newMember: CompanyMember = {
            id: `mem_${Date.now()}`,
            name: inviteName.trim(),
            email: inviteEmail.trim().toLowerCase(),
            role: inviteRole.trim(),
            department: inviteDepartment,
            avatarBg: randomColor,
            status: "invited"
        };

        setCompanyMembers([...companyMembers, newMember]);
        setNewAssignee(newMember.name);
        if (selectedTask) {
            updateTaskAssignee(selectedTask.id, newMember.name);
        }

        setShowInviteModal(false);
        setInviteName("");
        setInviteEmail("");
        showToast(`✉️ Invitation email dispatched to ${newMember.email}! Added to company directory and assigned.`);
    };

    // Forward Progress Report
    const generateProgressSummary = () => {
        const total = tasks.length;
        const done = tasks.filter(t => t.status === "done").length;
        const inProg = tasks.filter(t => t.status === "in_progress").length;
        const review = tasks.filter(t => t.status === "review").length;
        const todo = tasks.filter(t => t.status === "todo").length;
        const overallPct = Math.round((done / total) * 100);

        let report = `====================================================\n`;
        report += `BERAXIS ERP — EXECUTIVE SPRINT PROGRESS REPORT\n`;
        report += `Generated On: ${new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
        report += `Overall Sprint Completion: ${overallPct}% (${done}/${total} Deliverables Complete)\n`;
        report += `====================================================\n\n`;

        report += `SUMMARY METRICS:\n`;
        report += `• Completed Tasks: ${done}\n`;
        report += `• In Progress: ${inProg}\n`;
        report += `• In Code/QA Review: ${review}\n`;
        report += `• Pending To-Do: ${todo}\n\n`;

        report += `DETAILED TASK BREAKDOWN:\n`;
        tasks.forEach((t, i) => {
            report += `${i + 1}. [${t.id}] ${t.title}\n`;
            report += `   • Project: ${t.project}\n`;
            report += `   • Assignee: ${t.assignee} | Priority: ${t.priority.toUpperCase()} | Deadline: ${t.deadline}\n`;
            report += `   • Status: ${t.status.toUpperCase()} (${t.progress}% complete)\n`;
            if (t.checklist && t.checklist.length > 0) {
                const doneItems = t.checklist.filter(c => c.completed).length;
                report += `   • Deliverables: ${doneItems}/${t.checklist.length} items complete\n`;
                t.checklist.forEach(c => {
                    report += `     [${c.completed ? "x" : " "}] ${c.text}\n`;
                });
            }
            if (t.notes) {
                report += `   • Notes: ${t.notes}\n`;
            }
            report += `\n`;
        });

        report += `Forwarded directly from Beraxis ERP Workstation.`;
        return report;
    };

    const handleSendEmailReport = (e: React.FormEvent) => {
        e.preventDefault();
        setEmailSuccessMsg(`🚀 Executive progress report successfully dispatched to ${emailRecipient}!`);
        setTimeout(() => {
            setEmailSuccessMsg("");
            setShowEmailModal(false);
        }, 3000);
    };

    const copyReportToClipboard = () => {
        const text = generateProgressSummary();
        navigator.clipboard.writeText(text);
        showToast("📋 Formatted executive report copied to clipboard!");
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
                {/* Header Actions & Admin Controls */}
                <div className="flex items-center justify-between flex-wrap gap-4 bg-[#1E293B]/70 border border-gray-700/80 p-5 rounded-2xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Project Tasks & Sprints</h2>
                            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                {tasks.length} Active Tasks
                            </span>
                            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Shield size={12} /> {companyMembers.length} Verified Company Staff
                            </span>
                            {isAdminMode && (
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                    <Shield size={12} /> Admin Override Active
                                </span>
                            )}
                        </div>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">
                            Only verified members within your Beraxis company can be assigned. Admins can update checklists, override progress, and email executive reports.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Admin / Assignee Mode Switch */}
                        <button
                            onClick={() => setIsAdminMode(!isAdminMode)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                isAdminMode
                                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                            }`}
                            title="Toggle Admin Supervisor Mode for editing all tasks"
                        >
                            <Shield size={14} />
                            <span>{isAdminMode ? "Admin Mode" : "Assignee Mode"}</span>
                        </button>

                        {/* Invite Member Quick Button */}
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                            <UserPlus size={14} />
                            <span>Invite Member</span>
                        </button>

                        {/* Forward Email Progress Report */}
                        <button
                            onClick={() => setShowEmailModal(true)}
                            className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-600/10"
                        >
                            <Mail size={14} />
                            <span>Forward Progress Report</span>
                        </button>

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

                {/* Toast Notification */}
                {notification && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold flex items-center justify-between shadow-lg backdrop-blur-md animate-in fade-in">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            <span>{notification}</span>
                        </div>
                        <button onClick={() => setNotification("")} className="text-gray-400 hover:text-white cursor-pointer">
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

                                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
                                        {colTasks.length === 0 ? (
                                             <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-gray-700/50 rounded-xl">
                                                No tasks in {column.title}
                                            </div>
                                        ) : (
                                            colTasks.map(task => {
                                                const completedChecklistCount = task.checklist.filter(c => c.completed).length;
                                                return (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => setSelectedTask(task)}
                                                        className="bg-[#1E293B] border border-gray-700/80 hover:border-purple-500/60 rounded-xl p-4 shadow-md hover:shadow-xl transition-all space-y-2.5 group cursor-pointer"
                                                    >
                                                        <div className="flex justify-between items-start gap-2">
                                                            <span className="font-mono text-[10px] text-gray-400 font-semibold">{task.id}</span>
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

                                                        <h4 className="font-bold text-white text-xs md:text-sm group-hover:text-purple-300 transition-colors">
                                                            {task.title}
                                                        </h4>

                                                        <div className="text-[11px] text-cyan-400 font-medium truncate">
                                                            {task.project}
                                                        </div>

                                                        {/* Progress bar */}
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[10px] text-gray-400">
                                                                <span>Progress</span>
                                                                <span className="font-bold text-purple-300">{task.progress}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${
                                                                        task.progress === 100
                                                                            ? "bg-emerald-500"
                                                                            : task.progress > 50
                                                                            ? "bg-purple-500"
                                                                            : "bg-blue-500"
                                                                    }`}
                                                                    style={{ width: `${task.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Checklist Mini Summary */}
                                                        {task.checklist.length > 0 && (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 bg-white/5 px-2 py-1 rounded-lg">
                                                                <ListTodo size={12} className="text-purple-400" />
                                                                <span>Checklist: {completedChecklistCount}/{task.checklist.length} done</span>
                                                            </div>
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

                                                        {/* Quick State Actions */}
                                                        <div className="flex gap-1.5 pt-1">
                                                            <button
                                                                onClick={(e) => toggleTaskStatus(task.id, e)}
                                                                className="flex-1 text-center text-[10px] text-purple-300 hover:text-white py-1 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors cursor-pointer font-semibold"
                                                            >
                                                                {task.status === "done" ? "↺ Reopen" : "✓ Advance Stage"}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedTask(task);
                                                                }}
                                                                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-[10px] font-semibold cursor-pointer"
                                                                title="Open Checklist & Notes"
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
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
                                    <th className="px-4 py-3.5">Assignee (Company Staff)</th>
                                    <th className="px-4 py-3.5">Deadline</th>
                                    <th className="px-4 py-3.5">Checklist</th>
                                    <th className="px-4 py-3.5">Progress</th>
                                    <th className="px-4 py-3.5">Priority</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => {
                                    const doneItems = task.checklist.filter(c => c.completed).length;
                                    return (
                                        <tr
                                            key={task.id}
                                            onClick={() => setSelectedTask(task)}
                                            className="border-b border-gray-800 hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                            <td className="px-4 py-3.5 font-bold text-white">
                                                <div className="hover:text-purple-300 transition-colors">{task.title}</div>
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
                                            <td className="px-4 py-3.5 text-gray-400">
                                                <span className="bg-white/5 px-2 py-1 rounded text-xs">
                                                    {doneItems}/{task.checklist.length} done
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${task.progress === 100 ? "bg-emerald-500" : "bg-purple-500"}`}
                                                            style={{ width: `${task.progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-gray-300">{task.progress}%</span>
                                                </div>
                                            </td>
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
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => setSelectedTask(task)}
                                                        className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
                                                    >
                                                        Details
                                                    </button>
                                                    <button
                                                        onClick={() => toggleTaskStatus(task.id)}
                                                        className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 cursor-pointer"
                                                    >
                                                        Advance →
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* TASK DETAIL & ADMIN CHECKLIST DRAWER / MODAL                              */}
            {/* ========================================================================= */}
            {selectedTask && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {/* Drawer Header */}
                        <div className="flex items-start justify-between border-b border-gray-800 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-purple-400 font-bold">{selectedTask.id}</span>
                                    <span className="text-xs text-gray-500">•</span>
                                    <span className="text-xs text-cyan-400 font-semibold">{selectedTask.project}</span>
                                    {isAdminMode && (
                                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-md font-bold">
                                            Admin Edit
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white mt-1">{selectedTask.title}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Assignee, Deadline & Stage Selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#1E293B] p-4 rounded-2xl border border-gray-700/60">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[11px] text-gray-400 font-semibold">Assignee (Internal)</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowInviteModal(true)}
                                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                                    >
                                        + Invite
                                    </button>
                                </div>
                                <select
                                    value={selectedTask.assignee}
                                    onChange={(e) => updateTaskAssignee(selectedTask.id, e.target.value)}
                                    className="bg-[#0F172A] border border-gray-600 rounded-lg px-2 py-1 text-xs text-white focus:border-purple-500 outline-none w-full font-bold cursor-pointer"
                                >
                                    {companyMembers.map(m => (
                                        <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] text-gray-400 font-semibold mb-1">Target Deadline</label>
                                <div className="text-xs font-bold text-white flex items-center gap-1.5 pt-1">
                                    <Calendar size={14} className="text-purple-400" />
                                    <span>{new Date(selectedTask.deadline).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] text-gray-400 font-semibold mb-1">Current Stage</label>
                                <select
                                    value={selectedTask.status}
                                    onChange={(e) => updateTaskStatusDirectly(selectedTask.id, e.target.value as any)}
                                    className="bg-[#0F172A] border border-gray-600 rounded-lg px-2.5 py-1 text-xs text-white focus:border-purple-500 outline-none w-full font-bold cursor-pointer"
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="review">Code & QA Review</option>
                                    <option value="done">Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* Progress Slider */}
                        <div className="space-y-2 bg-[#1E293B] p-4 rounded-2xl border border-gray-700/60">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-300 flex items-center gap-1.5">
                                    <Sliders size={14} className="text-purple-400" /> Overall Task Progress
                                </span>
                                <span className="font-mono font-bold text-purple-400 text-sm">{selectedTask.progress}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={selectedTask.progress}
                                onChange={(e) => updateTaskProgressDirectly(selectedTask.id, parseInt(e.target.value))}
                                className="w-full accent-purple-500 cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>0% (Not Started)</span>
                                <span>50% (In Progress)</span>
                                <span>100% (Completed & Verified)</span>
                            </div>
                        </div>

                        {/* Interactive Checklist (What is Done / What is Not Done) */}
                        <div className="space-y-3 bg-[#1E293B] p-5 rounded-2xl border border-gray-700/60">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-white text-xs md:text-sm flex items-center gap-2">
                                    <ListTodo size={16} className="text-purple-400" />
                                    Deliverable Checklist (Done / Not Done)
                                </h4>
                                <span className="text-xs text-gray-400 font-semibold">
                                    {selectedTask.checklist.filter(c => c.completed).length} of {selectedTask.checklist.length} Completed
                                </span>
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {selectedTask.checklist.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleChecklistItem(selectedTask.id, item.id)}
                                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                                            item.completed
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                                                : "bg-[#0F172A] border-gray-700 text-gray-300 hover:border-purple-500/40"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                                item.completed
                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                    : "border-gray-500 bg-transparent"
                                            }`}>
                                                {item.completed && <Check size={12} strokeWidth={3} />}
                                            </div>
                                            <span className={`text-xs ${item.completed ? "line-through text-gray-400" : "font-medium"}`}>
                                                {item.text}
                                            </span>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteChecklistItem(selectedTask.id, item.id);
                                            }}
                                            className="text-gray-500 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                                            title="Delete deliverable"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add Checklist Item */}
                            <div className="flex gap-2 pt-2">
                                <input
                                    type="text"
                                    value={newChecklistText}
                                    onChange={(e) => setNewChecklistText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addChecklistItem(selectedTask.id)}
                                    placeholder="Add sub-task deliverable (e.g. Write Unit Tests)..."
                                    className="flex-1 bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                                <button
                                    onClick={() => addChecklistItem(selectedTask.id)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    + Add Item
                                </button>
                            </div>
                        </div>

                        {/* Notes & Activity Log */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-300">Notes & Handoff Comments</label>
                            <textarea
                                rows={3}
                                value={selectedTask.notes || ""}
                                onChange={(e) => updateTaskNotes(selectedTask.id, e.target.value)}
                                placeholder="Add notes, blockers, or link PRs..."
                                className="w-full bg-[#1E293B] border border-gray-700 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        {/* Footer Drawer Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                            <button
                                onClick={() => {
                                    setShowEmailModal(true);
                                }}
                                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                                <Mail size={14} /> Email Progress for this Task
                            </button>

                            <button
                                onClick={() => {
                                    setSelectedTask(null);
                                    showToast("✅ Task updates saved successfully!");
                                }}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                            >
                                Save & Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* FORWARD PROGRESS REPORT VIA EMAIL MODAL                                   */}
            {/* ========================================================================= */}
            {showEmailModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Forward Progress Report via Email</h3>
                                    <p className="text-xs text-gray-400">Send direct sprint deliverables & completion metrics to clients and stakeholders</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {emailSuccessMsg ? (
                            <div className="py-8 text-center space-y-3">
                                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={28} />
                                </div>
                                <h4 className="text-base font-bold text-white">Report Dispatched!</h4>
                                <p className="text-xs text-gray-400">{emailSuccessMsg}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSendEmailReport} className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Recipient Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={emailRecipient}
                                        onChange={(e) => setEmailRecipient(e.target.value)}
                                        placeholder="e.g. client@organization.com, director@beraxis.online"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Email Subject *</label>
                                    <input
                                        type="text"
                                        required
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-gray-300 font-semibold">Executive Report Body (Live Formatted)</label>
                                        <button
                                            type="button"
                                            onClick={copyReportToClipboard}
                                            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                                        >
                                            <Copy size={12} /> Copy to Clipboard
                                        </button>
                                    </div>
                                    <textarea
                                        rows={8}
                                        readOnly
                                        value={generateProgressSummary()}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-3 text-white font-mono text-[11px] focus:outline-none select-all"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmailModal(false)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Send size={14} /> Send Email Report
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* CREATE TASK MODAL                                                         */}
            {/* ========================================================================= */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-gray-300 font-semibold">Assignee (Internal)</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowInviteModal(true)}
                                            className="text-cyan-400 hover:text-cyan-300 font-bold text-[10px] cursor-pointer"
                                        >
                                            + Invite
                                        </button>
                                    </div>
                                    <select
                                        value={newAssignee}
                                        onChange={(e) => setNewAssignee(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                                    >
                                        {companyMembers.map(m => (
                                            <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                                        ))}
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

            {/* ========================================================================= */}
            {/* INVITE TEAM MEMBER VIA EMAIL MODAL                                        */}
            {/* ========================================================================= */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
                                    <UserPlus size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Invite Team Member</h3>
                                    <p className="text-xs text-gray-400">Add colleague to company workspace directory</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    placeholder="e.g. Kashif Rauf"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Work Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="e.g. kashif@beraxis.online"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Role / Job Title</label>
                                    <input
                                        type="text"
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        placeholder="e.g. QA Automation"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Department</label>
                                    <select
                                        value={inviteDepartment}
                                        onChange={(e) => setInviteDepartment(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                                    >
                                        <option value="Engineering">Engineering</option>
                                        <option value="Design">Design</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Quality Assurance">Quality Assurance</option>
                                        <option value="AI Labs">AI Labs</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-[#1E293B] p-3 rounded-xl border border-gray-800 space-y-1">
                                <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                                    <Lock size={12} className="text-cyan-400" /> Security & Access Verification
                                </span>
                                <p className="text-[10px] text-gray-400">
                                    An email invitation containing a secure 1-time onboarding link will be sent to the recipient. Once accepted, they will be verified in the company directory.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                    <Send size={14} />
                                    <span>Send Invite Email</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
