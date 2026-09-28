"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { LifeBuoy, Clock, AlertTriangle, Shield } from "lucide-react";

const MENU_ITEMS = [
    { name: "Tickets", href: "/helpdesk" },
    { name: "Teams", href: "/helpdesk/teams" },
    { name: "SLA Policies", href: "/helpdesk/sla" },
    { name: "Reporting", href: "/helpdesk/reporting" },
    { name: "Configuration", href: "/helpdesk/configuration" },
];

type SLA = {
    id: string;
    name: string;
    target_type: string;
    target_duration: string;
    priority: string;
    team: string;
};

const mockSLAs: SLA[] = [
    { id: "SLA/001", name: "Urgent Response", target_type: "First Response", target_duration: "1 hour", priority: "High", team: "All Teams" },
    { id: "SLA/002", name: "Standard Resolution", target_type: "Resolution", target_duration: "24 hours", priority: "Medium", team: "Support L1" },
    { id: "SLA/003", name: "VIP Support", target_type: "First Response", target_duration: "30 mins", priority: "All", team: "VIP Team" },
];

export default function SLAPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Helpdesk"
                moduleIcon={<LifeBuoy size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search policies..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">SLA Policies</h2>
                            <p className="text-sm text-gray-400 mt-1">{mockSLAs.length} active policies</p>
                        </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                        <Shield size={18} /> New Policy
                    </button>
                </div>

                <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#0F172A] border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Policy Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Target Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Target Duration</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Priority</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Team</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockSLAs.map(sla => (
                                <tr key={sla.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">{sla.name}</td>
                                    <td className="px-4 py-3 text-gray-300">{sla.target_type}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-white">
                                            <Clock size={14} className="text-blue-400" />
                                            {sla.target_duration}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${sla.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                                                sla.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {sla.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{sla.team}</td>
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
