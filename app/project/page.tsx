"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState, useEffect } from "react";
import { FolderKanban, CheckSquare, Clock, TrendingUp, Users, Plus, X } from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

const MENU_ITEMS = [
    { name: "Projects", href: "/project" },
    { name: "Tasks", href: "/project/tasks" },
    { name: "Timesheets", href: "/project/timesheets" },
    { name: "Reporting", href: "/project/reporting" },
    { name: "Configuration", href: "/project/configuration" },
];

type Project = {
    id: string;
    name: string;
    manager: string;
    customer: string;
    status: string;
    tasks: number;
    progress: number;
    budget?: number;
    deadline: string;
};

const mockProjects: Project[] = [];

export default function ProjectPage() {
    const { activeBranch, userEmail, getEntityStorageKey } = useBranchContext();
    const [projects, setProjects] = useState<Project[]>(mockProjects);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");
    const [showNewModal, setShowNewModal] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [projForm, setProjForm] = useState({ name: "", manager: "Workspace Owner", customer: "Enterprise Client", budget: "12500", deadline: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] });

    useEffect(() => {
        try {
            const saved = localStorage.getItem(getEntityStorageKey("projects_list"));
            if (saved) setProjects(JSON.parse(saved));
        } catch {}
        if (activeBranch?.id || userEmail) {
            const params = new URLSearchParams({ domain: "projects" });
            if (activeBranch?.id) params.set("company_id", activeBranch.id);
            if (userEmail) params.set("email", userEmail);
            fetch(`/api/industry-ops?${params.toString()}`, { cache: "no-store" })
                .then((r) => (r.ok ? r.json() : null))
                .then((d) => {
                    if (d && Array.isArray(d.items) && d.items.length > 0) {
                        setProjects(d.items);
                        try { localStorage.setItem(getEntityStorageKey("projects_list"), JSON.stringify(d.items)); } catch {}
                    }
                })
                .catch(() => {});
        }
    }, [activeBranch, userEmail, getEntityStorageKey]);

    const persistProjects = (next: Project[]) => {
        setProjects(next);
        try { localStorage.setItem(getEntityStorageKey("projects_list"), JSON.stringify(next)); } catch {}
        if (activeBranch?.id || userEmail) {
            fetch("/api/industry-ops", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: "projects", company_id: activeBranch?.id, email: userEmail, records: next }),
            }).catch(() => {});
        }
    };

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!projForm.name.trim()) return;
        const newProj: Project = {
            id: `PRJ-${String(projects.length + 1).padStart(3, "0")}`,
            name: projForm.name.trim(),
            manager: projForm.manager.trim() || "Workspace Owner",
            customer: projForm.customer.trim() || "Enterprise Client",
            status: "in_progress",
            tasks: 4,
            progress: 25,
            budget: Number(projForm.budget) || 12500,
            deadline: projForm.deadline,
        };
        const next = [newProj, ...projects];
        persistProjects(next);
        setProjForm({ name: "", manager: "Workspace Owner", customer: "Enterprise Client", budget: "12500", deadline: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] });
        setShowNewModal(false);
    };

    const handleBillMilestone = async (project: Project) => {
        const milestoneAmount = Math.round(((project.budget || 12500) * 0.25));
        try {
            const res = await fetch("/api/industry-ops", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "convert_timesheets_to_invoice",
                    company_id: activeBranch?.id,
                    email: userEmail,
                    industryId: "construction_contracting",
                    customerName: project.customer,
                    description: `${project.name} — Progress Milestone / AIA Draw (25%)`,
                    amount: milestoneAmount,
                }),
            });
            const data = await res.json();
            const nextProg = Math.min(100, (project.progress || 0) + 25);
            const next = projects.map((p) =>
                p.id === project.id ? { ...p, progress: nextProg, status: nextProg >= 100 ? "done" : "in_progress" } : p
            );
            persistProjects(next);
            if (data.success) {
                setToastMsg(`Billed Milestone ($${milestoneAmount.toLocaleString()}) for "${project.name}" → Posted to Sales & Accounting!`);
                setTimeout(() => setToastMsg(""), 5000);
            }
        } catch {}
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Project"
                moduleIcon={<FolderKanban size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search projects..."
                onNewClick={() => setShowNewModal(true)}
                newButtonLabel="New Project"
            />

            <div className="flex-1 overflow-auto p-6">
                {toastMsg && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                        {toastMsg}
                    </div>
                )}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Projects</h2>
                            <p className="text-sm text-gray-400 mt-1">{projects.length} active projects</p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus size={16} /> New Project
                    </button>
                </div>

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Manager</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Deadline</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Progress</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map(project => (
                                    <tr key={project.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{project.name}</td>
                                        <td className="px-4 py-3 text-gray-300">{project.manager}</td>
                                        <td className="px-4 py-3 text-gray-300">{project.customer}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(project.deadline).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-700 rounded-full h-1.5">
                                                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                                </div>
                                                <span className="text-xs text-gray-400">{project.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${project.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                                    project.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => handleBillMilestone(project)} className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer">
                                                Bill 25% Milestone
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <div key={project.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-white text-lg mb-1">{project.name}</h3>
                                        <p className="text-sm text-gray-400">{project.customer}</p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${project.status === 'done' ? 'bg-green-500' :
                                            project.status === 'in_progress' ? 'bg-blue-500' :
                                                'bg-yellow-500'
                                        }`}></div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Tasks</span>
                                        <span className="text-white">{project.tasks}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Deadline</span>
                                        <span className="text-white">{new Date(project.deadline).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Manager</span>
                                        <span className="text-white">{project.manager}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-700 space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Progress • Budget ${(project.budget || 12500).toLocaleString()}</span>
                                            <span>{project.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleBillMilestone(project)}
                                        className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                                    >
                                        ✓ Bill 25% Milestone / AIA Draw → Accounting
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showNewModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Create New Project</h3>
                            <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateProject} className="space-y-3 text-sm">
                            <div>
                                <label className="block text-gray-300 mb-1">Project Name *</label>
                                <input type="text" required value={projForm.name} onChange={e => setProjForm({ ...projForm, name: e.target.value })} placeholder="e.g. ERP Rollout Phase 1" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">Customer</label>
                                    <input type="text" value={projForm.customer} onChange={e => setProjForm({ ...projForm, customer: e.target.value })} className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Deadline</label>
                                    <input type="date" value={projForm.deadline} onChange={e => setProjForm({ ...projForm, deadline: e.target.value })} className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300">Cancel</button>
                                <button type="submit" className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold">Create Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
