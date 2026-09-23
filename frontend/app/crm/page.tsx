"use client";
import { fetchAPI } from '@/lib/api';

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useEffect, useState } from "react";
import { Plus, Mail, Phone, DollarSign, Calendar, User, TrendingUp, Target } from "lucide-react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Lead = {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    stage: string;
    expected_revenue: number;
    probability: number;
    created_at: string;
};

const STAGES = [
    { id: 'new', name: 'New', color: 'bg-blue-500' },
    { id: 'qualified', name: 'Qualified', color: 'bg-purple-500' },
    { id: 'proposition', name: 'Proposition', color: 'bg-yellow-500' },
    { id: 'won', name: 'Won', color: 'bg-green-500' },
    { id: 'lost', name: 'Lost', color: 'bg-red-500' },
];

const MENU_ITEMS = [
    { name: "My Pipeline", href: "/crm" },
    { name: "My Activities", href: "/crm/activities" },
    { name: "Sales", href: "/crm/sales" },
    { name: "Reporting", href: "/crm/reporting" },
    { name: "Configuration", href: "/crm/configuration" },
];

function LeadCard({ lead }: { lead: Lead }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lead.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleDragStart = (e: React.DragEvent, oppId: string) => {
        e.dataTransfer.setData('opp_id', oppId);
    };

    const handleDrop = async (e: React.DragEvent, newStageId: string) => {
        e.preventDefault();
        const oppId = e.dataTransfer.getData('opp_id');
        if (!oppId) return;

        const opp = leads.find(o => o.id === oppId);
        if (!opp || opp.status === newStageId) return;

        // Optimistic UI update
        const originalStage = opp.status;
        setLeads(prev => prev.map(o => o.id === oppId ? { ...o, status: newStageId } : o));

        try {
            const res = await fetchAPI(`/leads/${oppId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: opp.name, 
                    status: newStageId, 
                    type: opp.type 
                })
            });

            if (!res.ok) throw new Error("Failed to update stage");
        } catch (error) {
            setLeads(prev => prev.map(o => o.id === oppId ? { ...o, status: originalStage } : o));
            alert("Failed to move opportunity.");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 mb-3 hover:border-blue-500 transition-all cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="font-semibold text-white mb-1">{lead.name}</h4>
                    <p className="text-sm text-gray-400">{lead.company}</p>
                </div>
                <div className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                    <TrendingUp size={12} />
                    {lead.probability}%
                </div>
            </div>

            <div className="space-y-2 text-sm text-gray-400">
                {lead.email && (
                    <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <span className="truncate">{lead.email}</span>
                    </div>
                )}
                {lead.phone && (
                    <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>{lead.phone}</span>
                    </div>
                )}
                {lead.expected_revenue > 0 && (
                    <div className="flex items-center gap-2">
                        <DollarSign size={14} />
                        <span className="font-semibold text-green-400">${lead.expected_revenue.toLocaleString()}</span>
                    </div>
                )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(lead.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                    <User size={12} />
                    Unassigned
                </div>
                ) : (
                    <div className="galaxy-card overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#1E293B] text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-4">Lead Name</th>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Probability</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {leads.filter(l => l.type === 'lead').map(lead => (
                                    <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link href={`/crm/${lead.id}`} className="text-purple-400 hover:underline font-medium">{lead.name}</Link>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{lead.company_name || '—'}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{lead.email || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded-full bg-gray-700 text-[10px] font-bold uppercase text-gray-300">{lead.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-purple-500 h-full" style={{ width: `${lead.probability}%` }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function LeadListItem({ lead }: { lead: Lead }) {
    return (
        <tr className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <div>
                        <div className="font-medium text-white">{lead.name}</div>
                        <div className="text-sm text-gray-400">{lead.company}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-gray-300">{lead.email}</td>
            <td className="px-4 py-3 text-gray-300">{lead.phone}</td>
            <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${lead.stage === 'won' ? 'bg-green-500/20 text-green-400' :
                        lead.stage === 'lost' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                    }`}>
                    {STAGES.find(s => s.id === lead.stage)?.name || lead.stage}
                </span>
            </td>
            <td className="px-4 py-3 text-green-400 font-semibold">
                ${lead.expected_revenue.toLocaleString()}
            </td>
            <td className="px-4 py-3 text-gray-300">{lead.probability}%</td>
            <td className="px-4 py-3 text-gray-400 text-sm">
                {new Date(lead.created_at).toLocaleDateString()}
            </td>
        </tr>
    );
}

export default function CRMPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");
    const [newLead, setNewLead] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        expected_revenue: 0,
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/v1/leads/");
            if (res.ok) {
                const data = await res.json();
                setLeads(data);
            }
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    };

    const createLead = async () => {
        if (!newLead.name.trim()) return;

        try {
            const res = await fetch("http://localhost:8000/api/v1/leads/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newLead,
                    stage: 'new',
                }),
            });

            if (res.ok) {
                await fetchLeads();
                setIsModalOpen(false);
                setNewLead({ name: '', email: '', phone: '', company: '', expected_revenue: 0 });
            }
        } catch (error) {
            console.error("Error creating lead:", error);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const leadId = active.id as string;
        const newStage = over.id as string;

        try {
            const res = await fetch(`http://localhost:8000/api/v1/leads/${leadId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stage: newStage }),
            });

            if (res.ok) {
                setLeads(leads.map(lead =>
                    lead.id === leadId ? { ...lead, stage: newStage } : lead
                ));
            }
        } catch (error) {
            console.error("Error updating lead:", error);
        }

        setActiveId(null);
    };

    const getLeadsByStage = (stageId: string) => {
        return leads.filter(lead => lead.stage === stageId);
    };

    const activeLead = activeId ? leads.find(lead => lead.id === activeId) : null;

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="CRM"
                moduleIcon={<Target size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search leads, opportunities..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">My Pipeline</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {leads.length} leads • ${leads.reduce((sum, lead) => sum + lead.expected_revenue, 0).toLocaleString()} expected revenue
                            </p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["kanban", "list"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        <Plus size={18} /> New Lead
                    </button>
                </div>

                {currentView === "kanban" && (
                    <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {STAGES.map(stage => {
                                const stageLeads = getLeadsByStage(stage.id);
                                const stageRevenue = stageLeads.reduce((sum, lead) => sum + lead.expected_revenue, 0);

                                return (
                                    <SortableContext
                                        key={stage.id}
                                        id={stage.id}
                                        items={stageLeads.map(l => l.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                                                    <h3 className="font-semibold text-white">{stage.name}</h3>
                                                </div>
                                                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                                    {stageLeads.length}
                                                </span>
                                            </div>

                                            {stageRevenue > 0 && (
                                                <div className="mb-3 text-sm text-gray-400">
                                                    ${stageRevenue.toLocaleString()}
                                                </div>
                                            )}

                                            <div className="space-y-3 min-h-[200px]">
                                                {stageLeads.map(lead => (
                                                    <LeadCard key={lead.id} lead={lead} />
                                                ))}
                                            </div>
                                        </div>
                                    </SortableContext>
                                );
                            })}
                        </div>

                        <DragOverlay>
                            {activeLead ? <LeadCard lead={activeLead} /> : null}
                        </DragOverlay>
                    </DndContext>
                )}

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                                        <input type="checkbox" className="w-4 h-4 mr-2" />
                                        Lead
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Phone</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Stage</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Expected Revenue</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Probability</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map(lead => (
                                    <LeadListItem key={lead.id} lead={lead} />
                                ))}
                                {leads.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                            No leads found. Create your first lead to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Lead Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Create Lead</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={newLead.name}
                                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newLead.email}
                                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={newLead.phone}
                                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                                <input
                                    type="text"
                                    value={newLead.company}
                                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Expected Revenue</label>
                                <input
                                    type="number"
                                    value={newLead.expected_revenue}
                                    onChange={(e) => setNewLead({ ...newLead, expected_revenue: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="10000"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">
                                Cancel
                            </button>
                            <button onClick={createLead} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
