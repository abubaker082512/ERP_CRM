"use client";
import { fetchAPI } from '@/lib/api';

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { LifeBuoy, Users, Clock, AlertCircle, CheckCircle } from "lucide-react";

const MENU_ITEMS = [
    { name: "Tickets", href: "/helpdesk" },
    { name: "Teams", href: "/helpdesk/teams" },
    { name: "SLA Policies", href: "/helpdesk/sla" },
    { name: "Reporting", href: "/helpdesk/reporting" },
    { name: "Configuration", href: "/helpdesk/configuration" },
];

type Ticket = {
    id: string;
    subject: string;
    customer: string;
    team: string;
    priority: string;
    status: string;
    created: string;
    assigned_to: string;
};

const mockTickets: Ticket[] = [
    { id: "TICKET/001", subject: "Login Issue", customer: "John Doe", team: "Support L1", priority: "high", status: "new", created: "2025-12-01", assigned_to: "" },
    { id: "TICKET/002", subject: "Billing Question", customer: "Jane Smith", team: "Billing", priority: "medium", status: "in_progress", created: "2025-12-02", assigned_to: "Alice" },
    { id: "TICKET/003", subject: "Feature Request", customer: "Bob Wilson", team: "Product", priority: "low", status: "solved", created: "2025-11-28", assigned_to: "Mike" },
];

export default function HelpdeskPage() {
    const [tickets] = useState<Ticket[]>(mockTickets);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Helpdesk"
                moduleIcon={<LifeBuoy size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search tickets..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Helpdesk Tickets</h2>
                            <p className="text-sm text-gray-400 mt-1">{tickets.length} active tickets</p>
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Subject</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Team</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Priority</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Assigned To</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map(ticket => (
                                    <tr key={ticket.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{ticket.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{ticket.subject}</td>
                                        <td className="px-4 py-3 text-gray-300">{ticket.customer}</td>
                                        <td className="px-4 py-3 text-gray-300">{ticket.team}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${ticket.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                    ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${ticket.status === 'solved' ? 'bg-green-500/20 text-green-400' :
                                                    ticket.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{ticket.assigned_to || "-"}</td>
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
                        {['new', 'in_progress', 'solved'].map(status => (
                            <div key={status} className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 capitalize">{status.replace('_', ' ')}</h3>
                                <div className="space-y-3">
                                    {tickets.filter(t => t.status === status).map(ticket => (
                                        <div key={ticket.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium text-white">{ticket.subject}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs ${ticket.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                        ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                    }`}>{ticket.priority}</span>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-2">{ticket.customer}</div>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>{ticket.team}</span>
                                                <span>{new Date(ticket.created).toLocaleDateString()}</span>
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
