"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { CheckSquare, Clock, CheckCircle } from "lucide-react";

const MENU_ITEMS = [
    { name: "My Tasks", href: "/todo" },
    { name: "History", href: "/todo/history" },
    { name: "Configuration", href: "/todo/configuration" },
];

type TodoHistory = {
    id: string;
    title: string;
    completed_date: string;
    completed_by: string;
    duration: string;
};

const mockHistory: TodoHistory[] = [
    { id: "TODO/003", title: "Prepare Weekly Report", completed_date: "2025-12-02 14:30", completed_by: "John Doe", duration: "2 days" },
    { id: "TODO/005", title: "Call Supplier X", completed_date: "2025-12-01 09:15", completed_by: "John Doe", duration: "1 hour" },
    { id: "TODO/008", title: "Update CRM records", completed_date: "2025-11-30 16:45", completed_by: "John Doe", duration: "4 hours" },
];

export default function TodoHistoryPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="To Do"
                moduleIcon={<CheckSquare size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search history..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Task History</h2>
                            <p className="text-sm text-gray-400 mt-1">Recently completed tasks</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#0F172A] border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Task</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Completed Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Completed By</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Duration</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockHistory.map(item => (
                                <tr key={item.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">{item.title}</td>
                                    <td className="px-4 py-3 text-gray-400">{item.completed_date}</td>
                                    <td className="px-4 py-3 text-gray-300">{item.completed_by}</td>
                                    <td className="px-4 py-3 text-gray-400">{item.duration}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-green-400">
                                            <CheckCircle size={14} />
                                            <span className="text-sm font-medium">Done</span>
                                        </div>
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
