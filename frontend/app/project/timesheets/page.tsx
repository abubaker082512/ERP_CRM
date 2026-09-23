"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { FolderKanban, Clock, Play, Plus } from "lucide-react";

const MENU_ITEMS = [
    { name: "Projects", href: "/project" },
    { name: "Tasks", href: "/project/tasks" },
    { name: "Timesheets", href: "/project/timesheets" },
    { name: "Reporting", href: "/project/reporting" },
    { name: "Configuration", href: "/project/configuration" },
];

type Timesheet = {
    id: string;
    date: string;
    employee: string;
    project: string;
    task: string;
    description: string;
    duration: number;
};

const mockTimesheets: Timesheet[] = [
    { id: "TS/001", date: "2025-12-01", employee: "John Doe", project: "Website Redesign", task: "Design Homepage", description: "Created mockups", duration: 4.5 },
    { id: "TS/002", date: "2025-12-01", employee: "Jane Smith", project: "Mobile App Dev", task: "Setup Database", description: "Schema design", duration: 3.0 },
    { id: "TS/003", date: "2025-12-02", employee: "Bob Wilson", project: "ERP Implementation", task: "User Testing", description: "Testing sales module", duration: 6.0 },
];

export default function TimesheetsPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Project"
                moduleIcon={<FolderKanban size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search timesheets..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Timesheets</h2>
                            <p className="text-sm text-gray-400 mt-1">{mockTimesheets.length} entries this week</p>
                        </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                        <Plus size={18} /> Add Time
                    </button>
                </div>

                <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#0F172A] border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Employee</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Project</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Task</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Description</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Duration (Hours)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockTimesheets.map(entry => (
                                <tr key={entry.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                    <td className="px-4 py-3 text-gray-400">{new Date(entry.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 font-medium text-white">{entry.employee}</td>
                                    <td className="px-4 py-3 text-gray-300">{entry.project}</td>
                                    <td className="px-4 py-3 text-gray-300">{entry.task}</td>
                                    <td className="px-4 py-3 text-gray-400">{entry.description}</td>
                                    <td className="px-4 py-3 text-white font-medium">{entry.duration}</td>
                                    <td className="px-4 py-3">
                                        <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
