"use client";
import { fetchAPI } from '@/lib/api';

import { useState, useEffect } from 'react';
import CRMHeader from '@/components/crm/CRMHeader';
import { Plus, Settings, Star, Clock } from 'lucide-react';
import Link from 'next/link';

type Opportunity = {
    id: string;
    name: string;
    expected_revenue: number;
    stage: 'New' | 'Qualified' | 'Proposition' | 'Won';
    win_probability: number;
    priority?: number; // 0, 1, 2, 3 stars
};

const initialStages = [
    { name: 'New', id: 'New' },
    { name: 'Qualified', id: 'Qualified' },
    { name: 'Proposition', id: 'Proposition' },
    { name: 'Won', id: 'Won' },
];

export default function CRMPage() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [newOppName, setNewOppName] = useState('');
    const [newOppRevenue, setNewOppRevenue] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        try {
            const res = await fetchAPI("/opportunities");
            if (res.ok) {
                const data = await res.json();
                setOpportunities(Array.isArray(data) ? data : []);
            } else {
                setOpportunities([]);
            }
        } catch (error) {
            console.error("Failed to fetch opportunities", error);
            setOpportunities([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOpportunity = async () => {
        if (!newOppName.trim()) return;

        try {
            const res = await fetchAPI("/opportunities", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newOppName,
                    expected_revenue: parseFloat(newOppRevenue) || 0,
                    stage: 'New'
                })
            });

            if (res.ok) {
                const newOpp = await res.json();
                setOpportunities([...opportunities, newOpp]);
                setNewOppName('');
                setNewOppRevenue('');
                setIsNewModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to create opportunity", error);
        }
    };

    const getStageTotal = (stageId: string) => {
        return opportunities
            .filter(o => o.stage === stageId)
            .reduce((sum, o) => sum + (o.expected_revenue || 0), 0);
    };

    const handleDragStart = (e: React.DragEvent, oppId: string) => {
        e.dataTransfer.setData('opp_id', oppId);
    };

    const handleDrop = async (e: React.DragEvent, newStageId: string) => {
        e.preventDefault();
        const oppId = e.dataTransfer.getData('opp_id');
        if (!oppId) return;

        const opp = opportunities.find(o => o.id === oppId);
        if (!opp || opp.stage === newStageId) return;

        // Optimistic UI update
        const originalStage = opp.stage;
        setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, stage: newStageId as any } : o));

        try {
            const res = await fetchAPI(`/opportunities/${oppId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage: newStageId })
            });

            if (!res.ok) {
                throw new Error("Failed to update stage");
            }
        } catch (error) {
            console.error(error);
            // Revert on failure
            setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, stage: originalStage } : o));
            alert("Failed to move opportunity. Please try again.");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">

            <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
                <div className="flex h-full gap-4 min-w-max">
                    {initialStages.map((stage) => {
                        const stageOpps = opportunities.filter(o => o.stage === stage.id);
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
                                                    <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1.5"></div>
                                                </div>

                                                <div className="text-sm text-gray-300 font-medium mb-2">
                                                    ${opp.expected_revenue?.toLocaleString()}
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3].map(i => (
                                                            <Star key={i} size={12} className="text-gray-600 hover:text-yellow-500 cursor-pointer" />
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
            </div>
        </div>
    );
}
