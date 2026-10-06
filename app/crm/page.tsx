"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import CRMHeader from '@/components/crm/CRMHeader';
import { Plus, Settings, Star, Clock, Trophy, XCircle, Activity, Filter, Layers, ListFilter } from 'lucide-react';
import Link from 'next/link';
import ActivityHistory from '@/components/shared/ActivityHistory';

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
    { name: 'New', id: 'New', color: 'border-blue-500/50 text-blue-400', barBg: 'bg-blue-500' },
    { name: 'Qualified', id: 'Qualified', color: 'border-purple-500/50 text-purple-400', barBg: 'bg-purple-500' },
    { name: 'Proposition', id: 'Proposition', color: 'border-amber-500/50 text-amber-400', barBg: 'bg-amber-500' },
    { name: 'Won', id: 'Won', color: 'border-emerald-500/50 text-emerald-400', barBg: 'bg-emerald-500' },
    { name: 'Lost', id: 'Lost', color: 'border-rose-500/50 text-rose-400', barBg: 'bg-rose-500' },
];

export default function CRMPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activeView, setActiveView] = useState<'pipeline' | 'leads' | 'activity'>('pipeline');
    const [tableFilter, setTableFilter] = useState<'all' | 'lead' | 'opportunity' | 'won' | 'lost'>('all');
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
                setLeads([newLead, ...leads]);
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
            .filter(o => o.status?.toLowerCase() === stageId.toLowerCase() && o.type === 'opportunity')
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

    const filteredTableLeads = leads.filter(item => {
        if (tableFilter === 'lead') return item.type === 'lead';
        if (tableFilter === 'opportunity') return item.type === 'opportunity';
        if (tableFilter === 'won') return item.status?.toLowerCase() === 'won';
        if (tableFilter === 'lost') return item.status?.toLowerCase() === 'lost';
        return true;
    });

    const getStatusBadge = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s === 'won') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        if (s === 'lost') return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
        if (s === 'proposition') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        if (s === 'qualified') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <CRMHeader onNewClick={() => setIsNewModalOpen(true)} />
            {/* View Switcher and Action Toolbar */}
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#1E293B]">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setActiveView('pipeline')} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                            activeView === 'pipeline' 
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Layers size={16} /> Pipeline
                    </button>
                    <button 
                        onClick={() => setActiveView('leads')} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                            activeView === 'leads' 
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <ListFilter size={16} /> Leads & Records
                    </button>
                    <button 
                        onClick={() => setActiveView('activity')} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                            activeView === 'activity' 
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Activity size={16} /> Audit History
                    </button>
                </div>
                <button 
                    onClick={() => setIsNewModalOpen(true)} 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-purple-900/20 transition-all cursor-pointer"
                >
                    <Plus size={18} /> New {activeView === 'leads' ? 'Lead' : 'Opportunity'}
                </button>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
                {activeView === 'pipeline' && (
                    <div className="flex h-full gap-4 min-w-max pb-2">
                        {initialStages.map((stage) => {
                            const stageOpps = leads.filter(
                                o => o.status?.toLowerCase() === stage.id.toLowerCase() && o.type === 'opportunity'
                            );
                            return (
                                <div 
                                    key={stage.id} 
                                    className="w-80 flex flex-col h-full group galaxy-card !bg-white/5 p-3 rounded-xl border border-white/5"
                                    onDrop={(e) => handleDrop(e, stage.id)}
                                    onDragOver={handleDragOver}
                                >
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between mb-2 px-1">
                                        <div className="flex items-center gap-2 font-semibold text-gray-200">
                                            <h3>{stage.name}</h3>
                                            <span className="text-gray-500 text-xs px-2 py-0.5 rounded-full bg-white/5">
                                                {stageOpps.length}
                                            </span>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    if (stage.id === 'New') setIsNewModalOpen(true);
                                                }}
                                                className="text-gray-400 hover:text-white p-1"
                                                title="Add to column"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar / Total */}
                                    <div className="mb-4 px-1">
                                        <div className="h-1 bg-gray-700 rounded-full mb-1 overflow-hidden">
                                            <div className={`h-full ${stage.barBg} w-full`}></div>
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
                                            <div className="bg-[#1E293B] rounded-xl border border-purple-500/50 p-4 shadow-xl animate-in fade-in slide-in-from-top-2">
                                                <div className="mb-3">
                                                    <label className="text-xs text-purple-400 font-medium mb-1 block">Organization / Lead Name <span className="text-purple-400">*</span></label>
                                                    <input
                                                        type="text"
                                                        value={newOppName}
                                                        onChange={(e) => setNewOppName(e.target.value)}
                                                        placeholder="e.g. Acme Corp Enterprise Deal"
                                                        className="w-full bg-transparent border-b border-purple-500/50 focus:border-purple-500 outline-none text-sm py-1 text-white placeholder-gray-500"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="text-xs text-gray-400 font-medium mb-1 block">Expected Revenue ($)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-0 top-1 text-gray-500 text-sm">$</span>
                                                        <input
                                                            type="number"
                                                            value={newOppRevenue}
                                                            onChange={(e) => setNewOppRevenue(e.target.value)}
                                                            placeholder="10000"
                                                            className="w-full bg-transparent border-b border-gray-600 focus:border-purple-500 outline-none text-sm py-1 pl-4 text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleAddOpportunity}
                                                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
                                                        >
                                                            Add
                                                        </button>
                                                        <button
                                                            onClick={() => setIsNewModalOpen(false)}
                                                            className="bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium uppercase"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Opportunity Cards */}
                                        {stageOpps.map((opp) => (
                                            <div 
                                                key={opp.id} 
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, opp.id)}
                                                className="block galaxy-card !p-3.5 !rounded-xl !bg-white/[0.07] hover:!bg-white/[0.12] cursor-grab active:cursor-grabbing group relative shadow-md transition-all border border-white/5 hover:border-purple-500/40"
                                            >
                                                <Link href={`/crm/${opp.id}`} className="block">
                                                    <div className="flex justify-between items-start mb-1.5">
                                                        <h4 className="text-sm font-semibold text-gray-100 truncate pr-2 group-hover:text-purple-400 transition-colors">
                                                            {opp.name}
                                                        </h4>
                                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
                                                            opp.status?.toLowerCase() === 'won' ? 'bg-emerald-400' :
                                                            opp.status?.toLowerCase() === 'lost' ? 'bg-rose-500' :
                                                            opp.priority > 1 ? 'bg-amber-400 animate-pulse' : 'bg-blue-400'
                                                        }`}></div>
                                                    </div>

                                                    <div className="text-sm text-gray-200 font-bold mb-2">
                                                        ${(opp.expected_revenue || 0).toLocaleString()}
                                                    </div>

                                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3].map(i => (
                                                                <Star key={i} size={12} className={i <= (opp.priority || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
                                                            ))}
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(opp.status)}`}>
                                                            {opp.status}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </div>
                                        ))}

                                        {stageOpps.length === 0 && !isNewModalOpen && (
                                            <div className="py-8 text-center border border-dashed border-white/5 rounded-xl text-xs text-gray-500">
                                                No opportunities
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeView === 'leads' && (
                    <div className="space-y-4">
                        {/* Table Filters */}
                        <div className="flex items-center justify-between bg-[#1E293B] p-3 rounded-xl border border-gray-800">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-purple-400 ml-2" />
                                <span className="text-xs uppercase font-bold text-gray-400 mr-2">Filter:</span>
                                {(
                                    [
                                        { id: 'all', label: 'All Records' },
                                        { id: 'lead', label: 'Leads' },
                                        { id: 'opportunity', label: 'Opportunities' },
                                        { id: 'won', label: '🏆 Won' },
                                        { id: 'lost', label: '❌ Lost' },
                                    ] as const
                                ).map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setTableFilter(tab.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            tableFilter === tab.id
                                                ? 'bg-purple-600 text-white shadow'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs text-gray-400 mr-2 font-mono">
                                Showing {filteredTableLeads.length} record{filteredTableLeads.length === 1 ? '' : 's'}
                            </span>
                        </div>

                        {/* Leads & Opportunities Table */}
                        <div className="galaxy-card overflow-hidden rounded-xl border border-white/10">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#1E293B] text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Expected Revenue</th>
                                        <th className="px-6 py-4">Status / Stage</th>
                                        <th className="px-6 py-4">Win Probability</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredTableLeads.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <Link 
                                                    href={`/crm/${item.id}`} 
                                                    className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-2"
                                                >
                                                    {item.name}
                                                </Link>
                                                {item.company_name && (
                                                    <span className="text-xs text-gray-400 block mt-0.5">{item.company_name}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs uppercase font-mono text-gray-400">
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-200">
                                                ${(item.expected_revenue || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border ${getStatusBadge(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 bg-gray-800 h-2 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${
                                                                (item.probability || 0) >= 70 ? 'bg-emerald-500' :
                                                                (item.probability || 0) >= 30 ? 'bg-amber-500' : 'bg-rose-500'
                                                            }`} 
                                                            style={{ width: `${item.probability || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-mono text-gray-400">{item.probability || 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link 
                                                    href={`/crm/${item.id}`}
                                                    className="inline-block text-xs bg-white/5 hover:bg-purple-600 text-gray-300 hover:text-white px-3 py-1 rounded-lg transition-all"
                                                >
                                                    View Details & History →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTableLeads.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                No records found matching filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeView === 'activity' && (
                    <div className="max-w-4xl mx-auto">
                        <ActivityHistory
                            module="crm"
                            entityType="opportunity"
                            title="Live CRM Activity & Database Audit History"
                            allowAddNote={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
