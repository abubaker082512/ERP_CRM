"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { FolderKanban, CheckSquare, Clock, User, Calendar } from "lucide-react";

const MENU_ITEMS = [
    { name: "Projects", href: "/project" },
    { name: "Tasks", href: "/project/tasks" },
    { name: "Timesheets", href: "/project/timesheets" },
    { name: "Reporting", href: "/project/reporting" },
    { name: "Configuration", href: "/project/configuration" },
];

type Task = {
    id: string;
    title: string;
    project: string;
    assignee: string;
    status: string;
    priority: string;
    deadline: string;
};

const mockTasks: Task[] = [
    { id: "TSK/001", title: "Design Homepage", project: "Website Redesign", assignee: "John Doe", status: "in_progress", priority: "high", deadline: "2025-12-10" },
    { id: "TSK/002", title: "Setup Database", project: "Mobile App Dev", assignee: "Jane Smith", status: "todo", priority: "medium", deadline: "2025-12-15" },
    { id: "TSK/003", title: "User Testing", project: "ERP Implementation", assignee: "Bob Wilson", status: "done", priority: "low", deadline: "2025-11-30" },
];

export default function ProjectTasksPage() {
    const [tasks] = useState<Task[]>(mockTasks);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Project"
                moduleIcon={<FolderKanban size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search tasks..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Tasks</h2>
                            <p className="text-sm text-gray-400 mt-1">{tasks.length} active tasks</p>
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Title</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Project</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Assignee</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Deadline</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Priority</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{task.title}</td>
                                        <td className="px-4 py-3 text-gray-300">{task.project}</td>
                                        <td className="px-4 py-3 text-gray-300">{task.assignee}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(task.deadline).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                    task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${task.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                                    task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {task.status.replace('_', ' ')}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['todo', 'in_progress', 'done'].map(status => (
                            <div key={status} className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 capitalize">{status.replace('_', ' ')}</h3>
                                <div className="space-y-3">
                                    {tasks.filter(t => t.status === status).map(task => (
                                        <div key={task.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium text-white">{task.title}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                    }`}>{task.priority}</span>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-2">{task.project}</div>
                                            <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-700">
                                                <div className="flex items-center gap-1">
                                                    <User size={12} />
                                                    {task.assignee}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(task.deadline).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
