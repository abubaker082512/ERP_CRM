"use client";
import { fetchAPI } from '@/lib/api';

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState, useEffect } from "react";
import { LifeBuoy, Users, Clock, AlertCircle, CheckCircle, Plus, X } from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

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

const mockTickets: Ticket[] = [];

export default function HelpdeskPage() {
    const { activeBranch, getEntityStorageKey } = useBranchContext();
    const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");
    const [showNewModal, setShowNewModal] = useState(false);
    const [ticketForm, setTicketForm] = useState({ subject: "", customer: "", team: "Support Tier 1", priority: "medium", assigned_to: "Support Agent" });

    useEffect(() => {
        try {
            const saved = localStorage.getItem(getEntityStorageKey("helpdesk_tickets"));
            if (saved) setTickets(JSON.parse(saved));
        } catch {}
    }, [activeBranch, getEntityStorageKey]);

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketForm.subject.trim()) return;
        const newTicket: Ticket = {
            id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
            subject: ticketForm.subject.trim(),
            customer: ticketForm.customer.trim() || "Walk-in Client",
            team: ticketForm.team,
            priority: ticketForm.priority,
            status: "new",
            created: new Date().toISOString(),
            assigned_to: ticketForm.assigned_to,
        };
        const next = [newTicket, ...tickets];
        setTickets(next);
        try { localStorage.setItem(getEntityStorageKey("helpdesk_tickets"), JSON.stringify(next)); } catch {}
        setTicketForm({ subject: "", customer: "", team: "Support Tier 1", priority: "medium", assigned_to: "Support Agent" });
        setShowNewModal(false);
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Helpdesk"
                moduleIcon={<LifeBuoy size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search tickets..."
                onNewClick={() => setShowNewModal(true)}
                newButtonLabel="New Ticket"
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
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
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus size={16} /> New Ticket
                    </button>
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

            {showNewModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Create Support Ticket</h3>
                            <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="space-y-3 text-sm">
                            <div>
                                <label className="block text-gray-300 mb-1">Subject *</label>
                                <input type="text" required value={ticketForm.subject} onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })} placeholder="e.g. Invoice PDF export issue" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">Customer</label>
                                <input type="text" value={ticketForm.customer} onChange={e => setTicketForm({ ...ticketForm, customer: e.target.value })} placeholder="Acme Client" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">Priority</label>
                                    <select value={ticketForm.priority} onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })} className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Support Team</label>
                                    <input type="text" value={ticketForm.team} onChange={e => setTicketForm({ ...ticketForm, team: e.target.value })} className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300">Cancel</button>
                                <button type="submit" className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold">Create Ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
