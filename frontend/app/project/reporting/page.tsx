"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { FolderKanban, TrendingUp, Clock, CheckSquare } from "lucide-react";

const MENU_ITEMS = [
    { name: "Projects", href: "/project" },
    { name: "Tasks", href: "/project/tasks" },
    { name: "Timesheets", href: "/project/timesheets" },
    { name: "Reporting", href: "/project/reporting" },
    { name: "Configuration", href: "/project/configuration" },
];

export default function ProjectReportingPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Project"
                moduleIcon={<FolderKanban size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search reports..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Project Reporting</h2>
                    <p className="text-sm text-gray-400 mt-1">Project progress and resource utilization</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <FolderKanban size={24} className="text-blue-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">12</div>
                        <div className="text-sm text-gray-400">Active Projects</div>
                        <div className="text-xs text-green-400 mt-2">+2 new this month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <CheckSquare size={24} className="text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">45</div>
                        <div className="text-sm text-gray-400">Tasks Completed</div>
                        <div className="text-xs text-green-400 mt-2">+15% vs last week</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <Clock size={24} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">128h</div>
                        <div className="text-sm text-gray-400">Hours Logged</div>
                        <div className="text-xs text-green-400 mt-2">This week</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <TrendingUp size={24} className="text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">85%</div>
                        <div className="text-sm text-gray-400">Utilization Rate</div>
                        <div className="text-xs text-green-400 mt-2">+5% vs target</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Project Progress</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <FolderKanban size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Task Burndown</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Resource Allocation</h3>
                        <div className="space-y-3">
                            {[
                                { name: "John Doe", project: "Website Redesign", hours: 35 },
                                { name: "Jane Smith", project: "Mobile App Dev", hours: 40 },
                                { name: "Bob Wilson", project: "ERP Implementation", hours: 38 },
                            ].map((resource, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div>
                                        <div className="font-medium text-white">{resource.name}</div>
                                        <div className="text-sm text-gray-400">{resource.project}</div>
                                    </div>
                                    <div className="text-green-400 font-semibold">{resource.hours}h</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Overdue Tasks</h3>
                        <div className="space-y-3">
                            {[
                                { task: "Design Review", project: "Website Redesign", due: "2 days ago" },
                                { task: "API Integration", project: "Mobile App Dev", due: "1 day ago" },
                                { task: "Client Meeting", project: "ERP Implementation", due: "Today" },
                            ].map((task, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div>
                                        <div className="font-medium text-white">{task.task}</div>
                                        <div className="text-sm text-gray-400">{task.project}</div>
                                    </div>
                                    <div className="text-red-400 text-sm font-medium">{task.due}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
