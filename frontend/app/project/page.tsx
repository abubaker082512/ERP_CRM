"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { FolderKanban, CheckSquare, Clock, TrendingUp, Users } from "lucide-react";

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
    deadline: string;
};

const mockProjects: Project[] = [
    { id: "PRJ/001", name: "Website Redesign", manager: "John Doe", customer: "Acme Corp", status: "in_progress", tasks: 12, progress: 45, deadline: "2025-12-31" },
    { id: "PRJ/002", name: "Mobile App Dev", manager: "Jane Smith", customer: "Tech Solutions", status: "planning", tasks: 8, progress: 10, deadline: "2026-03-15" },
    { id: "PRJ/003", name: "ERP Implementation", manager: "Bob Wilson", customer: "Global Industries", status: "done", tasks: 25, progress: 100, deadline: "2025-11-30" },
];

export default function ProjectPage() {
    const [projects] = useState<Project[]>(mockProjects);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Project"
                moduleIcon={<FolderKanban size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search projects..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
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
                                            <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
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

                                <div className="pt-4 border-t border-gray-700">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Progress</span>
                                        <span>{project.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
