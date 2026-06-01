"use client";
import { fetchAPI } from '@/lib/api';

import { useState, useEffect } from 'react';
import CRMHeader from '@/components/crm/CRMHeader';
import { Plus, Settings, Star, Clock } from 'lucide-react';
import Link from 'next/link';

type Lead = {
    id: string;
    name: string;
    type: 'lead' | 'opportunity';
    expected_revenue: number;
    status: string;
    probability: number;
    priority: number;
    company_name?: string;
    email?: string;
};

const initialStages = [
    { name: 'New', id: 'New' },
    { name: 'Qualified', id: 'Qualified' },
    { name: 'Proposition', id: 'Proposition' },
    { name: 'Won', id: 'Won' },
];

export default function CRMPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activeView, setActiveView] = useState<'leads' | 'pipeline'>('pipeline');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [newOppName, setNewOppName] = useState('');
    const [newOppRevenue, setNewOppRevenue] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchLeads = async () => {
        try {
            const res = await fetchAPI("/leads");
            if (res.ok) {
                const data = await res.json();
                setLeads(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to fetch leads", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleAddOpportunity = async () => {
        if (!newOppName.trim()) return;

        try {
            const res = await fetchAPI("/leads", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newOppName,
                    expected_revenue: parseFloat(newOppRevenue) || 0,
                    status: 'New',
                    type: 'opportunity'
                })
            });

            if (res.ok) {
                const newLead = await res.json();
                setLeads([...leads, newLead]);
                setNewOppName('');
                setNewOppRevenue('');
                setIsNewModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to create opportunity", error);
        }
    };

    const getStageTotal = (stageId: string) => {
        return leads
            .filter(o => o.status === stageId && o.type === 'opportunity')
            .reduce((sum, o) => sum + (o.expected_revenue || 0), 0);
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
        <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#1E293B]">
                <div className="flex gap-4">
                    <button onClick={() => setActiveView('pipeline')} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeView === 'pipeline' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:text-white'}`}>
                        Pipeline
                    </button>
                    <button onClick={() => setActiveView('leads')} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeView === 'leads' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:text-white'}`}>
                        Leads
                    </button>
                </div>
                <button onClick={() => setIsNewModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-purple-900/20 transition-all">
                    <Plus size={18} /> New {activeView === 'leads' ? 'Lead' : 'Opportunity'}
                </button>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
                {activeView === 'pipeline' ? (
                    <div className="flex h-full gap-4 min-w-max">
                    {initialStages.map((stage) => {
                        const stageOpps = leads.filter(o => o.status === stage.id && o.type === 'opportunity');
                        return (
                             <div 
                                key={stage.id} 
                                className="w-80 flex flex-col h-full group galaxy-card !bg-white/5 p-3"
                                onDrop={(e) => handleDrop(e, stage.id)}
                                onDragOver={handleDragOver}
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <div className="flex items-center gap-2 font-semibold text-gray-200">
                                        <h3>{stage.name}</h3>
                                        <span className="text-gray-500 text-sm">{stageOpps.length}</span>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                        <button
                                            onClick={() => {
                                                if (stage.id === 'New') setIsNewModalOpen(true);
                                            }}
                                            className="text-gray-400 hover:text-white p-1"
                                        >
                                            <Plus size={16} />
                                        </button>
                                        <button className="text-gray-400 hover:text-white p-1">
                                            <Settings size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar / Total */}
                                <div className="mb-4 px-1">
                                    <div className="h-1 bg-gray-700 rounded-full mb-1 overflow-hidden">
                                        <div className="h-full bg-purple-500 w-full"></div>
                                    </div>
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-gray-400">Total</span>
                                        <span className="text-gray-200">${getStageTotal(stage.id).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Opportunities Container */}
                                <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-2">
                                    {/* New Opportunity Form (Inline) */}
                                    {stage.id === 'New' && isNewModalOpen && (
                                        <div className="bg-[#1E293B] rounded border border-purple-500/50 p-3 shadow-lg animate-in fade-in slide-in-from-top-2">
                                            <div className="mb-3">
                                                <label className="text-xs text-purple-400 font-medium mb-1 block">Organization / Contact <span className="text-purple-400">*</span></label>
                                                <input
                                                    type="text"
                                                    value={newOppName}
                                                    onChange={(e) => setNewOppName(e.target.value)}
                                                    placeholder="e.g. Acme Corp"
                                                    className="w-full bg-transparent border-b border-purple-500/50 focus:border-purple-500 outline-none text-sm py-1 text-white placeholder-gray-500"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="text-xs text-gray-400 font-medium mb-1 block">Expected Revenue</label>
                                                <div className="relative">
                                                    <span className="absolute left-0 top-1 text-gray-500 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={newOppRevenue}
                                                        onChange={(e) => setNewOppRevenue(e.target.value)}
                                                        className="w-full bg-transparent border-b border-gray-600 focus:border-purple-500 outline-none text-sm py-1 pl-4 text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleAddOpportunity}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium uppercase"
                                                    >
                                                        Add
                                                    </button>
                                                    <button
                                                        onClick={() => setIsNewModalOpen(false)}
                                                        className="bg-transparent border border-gray-600 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded text-xs font-medium uppercase"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => setIsNewModalOpen(false)}
                                                    className="text-gray-500 hover:text-red-400"
                                                >
                                                    <Settings size={16} /> {/* Using Settings as trash placeholder for now or import Trash2 */}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Opportunity Cards */}
                                    {stageOpps.map((opp) => (
                                         <div 
                                            key={opp.id} 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, opp.id)}
                                            className="block galaxy-card !p-3 !rounded-lg !bg-white/10 hover:!bg-white/20 cursor-grab active:cursor-grabbing group relative shadow-sm transition-all border-none"
                                        >
                                            <Link href={`/crm/${opp.id}`} className="block">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-sm font-medium text-gray-200 truncate pr-2 group-hover:text-purple-400 transition-colors">{opp.name}</h4>
                                                    <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${opp.priority > 1 ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                                                </div>

                                                <div className="text-sm text-gray-300 font-medium mb-2">
                                                    ${opp.expected_revenue?.toLocaleString()}
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3].map(i => (
                                                            <Star key={i} size={12} className={i <= (opp.priority || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-600"} />
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} className="text-gray-500" />
                                                        <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-[10px] text-gray-300">
                                                            A
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
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
