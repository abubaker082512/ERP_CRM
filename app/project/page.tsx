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
    Building2,
    Mail,
    Send,
    Shield,
    UserPlus,
    Lock,
    Sparkles
} from "lucide-react";

const MENU_ITEMS = [
    { name: "Projects", href: "/project" },
    { name: "Tasks", href: "/project/tasks" },
    { name: "Timesheets", href: "/project/timesheets" },
    { name: "Reporting", href: "/project/reporting" },
    { name: "Configuration", href: "/project/configuration" },
];

export type CompanyMember = {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    avatarBg: string;
    status: "verified" | "invited";
};

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
    assignees: { name: string; avatarBg: string; role?: string }[];
    tags: string[];
    description?: string;
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
            { name: "Salim Ghauri", avatarBg: "bg-blue-600", role: "Principal Architect" },
            { name: "Sarah Vance", avatarBg: "bg-purple-600", role: "Lead UI/UX Designer" },
            { name: "Bilal Mahmood", avatarBg: "bg-emerald-600", role: "ERP Specialist" },
            { name: "Elena Belmont", avatarBg: "bg-rose-600", role: "QA Automation" }
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
            { name: "Jane Smith", avatarBg: "bg-pink-600", role: "Mobile Engineering Lead" },
            { name: "Marcus Jenkins", avatarBg: "bg-cyan-600", role: "DevOps" },
            { name: "Hamza Javed", avatarBg: "bg-indigo-600", role: "Full-Stack Engineer" }
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
            { name: "Bob Wilson", avatarBg: "bg-amber-600", role: "Supply Chain Engineer" },
            { name: "Salim Ghauri", avatarBg: "bg-blue-600", role: "Principal Architect" }
        ],
        tags: ["Inventory", "Barcode", "Logistics", "SAP S/4"],
        description: "Automated replenishment thresholds, multi-currency vendor RFQ engine, and RFID tracking."
    },
    {
        id: "PRJ/2026/004",
        name: "AI Business Intelligence & Sales Copilot",
        manager: "Salim Ghauri",
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
            { name: "Zainab Siddiqui", avatarBg: "bg-teal-600", role: "AI Prompt & ML Engineer" },
            { name: "Sarah Vance", avatarBg: "bg-purple-600", role: "Lead UI/UX Designer" }
        ],
        tags: ["OpenAI", "Python", "FastAPI", "Vector DB"],
        description: "Autonomous lead enrichment, speech-to-text meeting summaries, and predictive CRM analytics."
    }
];

export default function ProjectPage() {
    const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
    const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>(INITIAL_COMPANY_MEMBERS);
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

    // Invite New Team Member via Email State
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteName, setInviteName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Senior Software Engineer");
    const [inviteDepartment, setInviteDepartment] = useState("Engineering");
    const [inviteAccess, setInviteAccess] = useState("Member");

    const [toastMsg, setToastMsg] = useState("");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 6000);
    };

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        const assigneesList = companyMembers
            .filter(m => selectedAssignees.includes(m.name))
            .map(m => ({ name: m.name, avatarBg: m.avatarBg, role: m.role }));

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
            assignees: assigneesList.length > 0 ? assigneesList : [{ name: companyMembers[0].name, avatarBg: companyMembers[0].avatarBg, role: companyMembers[0].role }],
            tags: tagsList.length > 0 ? tagsList : ["Project"],
            description: newDescription.trim() || "Active project roadmap and milestones."
        };

        setProjects([newProj, ...projects]);
        showToast(`🎉 Project "${newProj.name}" created successfully with ${assigneesList.length} internal company assignees!`);

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

        // Add to company roster
        setCompanyMembers([...companyMembers, newMember]);
        // Auto-select for the current project
        setSelectedAssignees([...selectedAssignees, newMember.name]);

        setShowInviteModal(false);
        setInviteName("");
        setInviteEmail("");
        showToast(`✉️ Invitation email dispatched to ${newMember.email}! Added to company directory and assigned to project.`);
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
                searchPlaceholder="Search projects by name, customer, manager..."
                onNewClick={() => setShowCreateModal(true)}
                newButtonText="New Project"
            />

            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
                {/* Header & Metrics Bar */}
                <div className="flex items-center justify-between flex-wrap gap-4 bg-[#1E293B]/70 border border-gray-700/80 p-5 rounded-2xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Projects Management Hub</h2>
                            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                {projects.length} Active Projects
                            </span>
                            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Shield size={12} /> {companyMembers.length} Internal Company Staff
                            </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">
                            Only verified members within your Beraxis company can be assigned. Invite new colleagues via email on demand.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Filter Pill */}
                        <div className="flex items-center gap-1.5 bg-[#0F172A] p-1 rounded-xl border border-gray-700">
                            {["all", "in_progress", "planning", "done"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                                        statusFilter === status
                                            ? "bg-purple-600 text-white shadow"
                                            : "text-gray-400 hover:text-white"
                                    }`}
                                >
                                    {status === "all" ? "All Projects" : status.replace("_", " ")}
                                </button>
                            ))}
                        </div>

                        {/* Invite Member Quick Button */}
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Invite new employee or colleague to company via email"
                        >
                            <UserPlus size={14} />
                            <span>Invite Member via Email</span>
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
                            <span>Create Project</span>
                        </button>
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

                {/* ========================================================================= */}
                {/* KANBAN VIEW                                                               */}
                {/* ========================================================================= */}
                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => {
                            const isOverdue = getRemainingDays(project.deadline).includes("overdue");
                            return (
                                <div
                                    key={project.id}
                                    className="bg-[#1E293B] border border-gray-700/80 hover:border-purple-500/60 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col justify-between group"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="font-mono text-[10px] text-gray-500 font-semibold">{project.id}</span>
                                                <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors mt-0.5 line-clamp-1">
                                                    {project.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium mt-0.5">
                                                    <Building2 size={12} />
                                                    <span>{project.customer}</span>
                                                </div>
                                            </div>

                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                project.priority === "urgent"
                                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                                    : project.priority === "high"
                                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                            }`}>
                                                {project.priority}
                                            </span>
                                        </div>

                                        {project.description && (
                                            <p className="text-xs text-gray-400 line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1">
                                            {project.tags.map((t, idx) => (
                                                <span key={idx} className="text-[10px] bg-white/5 text-gray-300 px-2 py-0.5 rounded-md font-medium">
                                                    #{t}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Progress Bar & Tasks */}
                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="text-gray-400">Deliverables</span>
                                                <span className="text-purple-300">{project.completed_tasks}/{project.tasks} Tasks ({project.progress}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        project.progress === 100
                                                            ? "bg-emerald-500"
                                                            : project.progress > 50
                                                            ? "bg-purple-500"
                                                            : "bg-blue-500"
                                                    }`}
                                                    style={{ width: `${project.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Budget & Spent */}
                                        <div className="grid grid-cols-2 gap-2 bg-[#0F172A] p-3 rounded-xl border border-gray-800 text-xs">
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase block font-semibold">Budget Allocated</span>
                                                <span className="font-bold text-white font-mono">${project.budget.toLocaleString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase block font-semibold">Spend to Date</span>
                                                <span className="font-bold text-emerald-400 font-mono">${project.spent.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assignees Avatars & Action */}
                                    <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                                        <div>
                                            <div className="flex -space-x-2 overflow-hidden items-center">
                                                {project.assignees.map((assignee, idx) => (
                                                    <div
                                                        key={idx}
                                                        title={`${assignee.name} (${assignee.role || 'Company Staff'})`}
                                                        className={`inline-block h-7 w-7 rounded-full text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-[#1E293B] shadow ${assignee.avatarBg}`}
                                                    >
                                                        {assignee.name.split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                ))}
                                                <span className="text-[11px] text-gray-400 ml-3 font-medium">
                                                    {project.manager} (Lead)
                                                </span>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/project/tasks?project=${encodeURIComponent(project.name)}`}
                                            className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            Tasks →
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
                                                            title={`${a.name} (${a.role || 'Staff'})`}
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

            {/* ========================================================================= */}
            {/* CREATE NEW PROJECT MODAL                                                  */}
            {/* ========================================================================= */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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
                                        {companyMembers.map(m => (
                                            <option key={m.name} value={m.name}>{m.name} ({m.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Project Timeline */}
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

                            {/* Assignee Team Members Chips - Company Members Only */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-gray-300 font-semibold flex items-center gap-1.5">
                                        <Shield size={14} className="text-cyan-400" />
                                        <span>Assign Team Members (Company Staff Only)</span>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => setShowInviteModal(true)}
                                        className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                                    >
                                        <UserPlus size={13} /> + Invite via Email
                                    </button>
                                </div>

                                <p className="text-[10px] text-gray-400">
                                    Only verified colleagues created inside our Beraxis company directory can be assigned. Outsiders cannot access project internals.
                                </p>

                                <div className="flex flex-wrap gap-1.5 p-3 bg-[#1E293B] border border-white/10 rounded-2xl max-h-36 overflow-y-auto">
                                    {companyMembers.map(m => {
                                        const isSelected = selectedAssignees.includes(m.name);
                                        return (
                                            <button
                                                type="button"
                                                key={m.id}
                                                onClick={() => toggleAssignee(m.name)}
                                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                                                    isSelected
                                                        ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/20"
                                                        : "bg-[#0F172A] border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
                                                }`}
                                            >
                                                <span className={`w-4 h-4 rounded-full ${m.avatarBg} text-[9px] flex items-center justify-center text-white font-bold`}>
                                                    {m.name[0]}
                                                </span>
                                                <div className="text-left">
                                                    <div>{m.name}</div>
                                                    <div className="text-[9px] opacity-75 font-normal">{m.role}</div>
                                                </div>
                                                {m.status === "invited" && (
                                                    <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded font-bold">
                                                        Invited
                                                    </span>
                                                )}
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
                                        placeholder="e.g. Senior Frontend Dev"
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
                                        <option value="Finance">Finance & Accounting</option>
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
                                    An email invitation containing a secure 1-time onboarding link will be sent to the recipient. Once accepted, they will be fully verified in the company directory.
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
