"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { LifeBuoy, Users, Mail, Clock } from "lucide-react";

const MENU_ITEMS = [
    { name: "Tickets", href: "/helpdesk" },
    { name: "Teams", href: "/helpdesk/teams" },
    { name: "SLA Policies", href: "/helpdesk/sla" },
    { name: "Reporting", href: "/helpdesk/reporting" },
    { name: "Configuration", href: "/helpdesk/configuration" },
];

type Team = {
    id: string;
    name: string;
    email: string;
    members: number;
    open_tickets: number;
    sla_success: number;
};

const mockTeams: Team[] = [
    { id: "TEAM/001", name: "Customer Support L1", email: "support@company.com", members: 5, open_tickets: 12, sla_success: 95 },
    { id: "TEAM/002", name: "Technical Support L2", email: "tech@company.com", members: 3, open_tickets: 8, sla_success: 88 },
    { id: "TEAM/003", name: "Billing Support", email: "billing@company.com", members: 2, open_tickets: 4, sla_success: 98 },
];

export default function HelpdeskTeamsPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Helpdesk"
                moduleIcon={<LifeBuoy size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search teams..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Helpdesk Teams</h2>
                            <p className="text-sm text-gray-400 mt-1">{mockTeams.length} active teams</p>
                        </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                        <Users size={18} /> New Team
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockTeams.map(team => (
                        <div key={team.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">{team.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Mail size={14} />
                                        <span>{team.email}</span>
                                    </div>
                                </div>
                                <div className="bg-blue-500/20 p-2 rounded">
                                    <Users size={20} className="text-blue-400" />
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between items-center py-2 border-t border-gray-700">
                                    <span className="text-sm text-gray-400">Members</span>
                                    <span className="text-sm text-white font-medium">{team.members}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-t border-gray-700">
                                    <span className="text-sm text-gray-400">Open Tickets</span>
                                    <span className="text-sm text-white font-medium">{team.open_tickets}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-t border-gray-700">
                                    <span className="text-sm text-gray-400">SLA Success</span>
                                    <span className={`text-sm font-medium ${team.sla_success >= 90 ? 'text-green-400' :
                                            team.sla_success >= 80 ? 'text-yellow-400' :
                                                'text-red-400'
                                        }`}>{team.sla_success}%</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-700 flex justify-between">
                                <button className="text-sm text-blue-400 hover:text-blue-300">View Tickets</button>
                                <button className="text-sm text-gray-400 hover:text-white">Settings</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
