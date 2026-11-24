"use client";
import { useBranchContext } from '@/lib/branchContext';
import { useState, useEffect } from 'react';
import CRMHeader from '@/components/crm/CRMHeader';
import {
    Plus, Star, Clock, Trophy, XCircle, Activity, Filter, Layers, ListFilter,
    ChevronRight, ChevronLeft, Pencil, Download, FileSpreadsheet, Trash2, Check, X,
    PhoneCall, PhoneOff, Headphones, ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import ActivityHistory from '@/components/shared/ActivityHistory';
import * as XLSX from 'xlsx';

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
    phone?: string;
    disposition?: string;
    callback_at?: string;
    assigned_agent?: string;
    call_duration_sec?: number;
    call_notes?: string;
};

const DISPOSITION_CODES = [
    'Interested / Qualified',
    'Callback Requested',
    'Voicemail',
    'No Answer',
    'Wrong Number',
    'Do Not Call (DNC)',
    'Closed Won',
];

type StageColumn = {
    id: string;
    name: string;
    color: string;
    barBg: string;
};

const initialStages: StageColumn[] = [
    { name: 'New', id: 'New', color: 'border-blue-500/50 text-blue-400', barBg: 'bg-blue-500' },
    { name: 'Qualified', id: 'Qualified', color: 'border-purple-500/50 text-purple-400', barBg: 'bg-purple-500' },
    { name: 'Proposition', id: 'Proposition', color: 'border-amber-500/50 text-amber-400', barBg: 'bg-amber-500' },
    { name: 'Won', id: 'Won', color: 'border-emerald-500/50 text-emerald-400', barBg: 'bg-emerald-500' },
    { name: 'Lost', id: 'Lost', color: 'border-rose-500/50 text-rose-400', barBg: 'bg-rose-500' },
];

const STAGE_COLOR_PRESETS = [
    { label: 'Blue', color: 'border-blue-500/50 text-blue-400', barBg: 'bg-blue-500' },
    { label: 'Purple', color: 'border-purple-500/50 text-purple-400', barBg: 'bg-purple-500' },
    { label: 'Amber', color: 'border-amber-500/50 text-amber-400', barBg: 'bg-amber-500' },
    { label: 'Emerald', color: 'border-emerald-500/50 text-emerald-400', barBg: 'bg-emerald-500' },
    { label: 'Cyan', color: 'border-cyan-500/50 text-cyan-400', barBg: 'bg-cyan-500' },
    { label: 'Rose', color: 'border-rose-500/50 text-rose-400', barBg: 'bg-rose-500' },
];

export default function CRMPage() {
    const { activeBranch, getEntityStorageKey } = useBranchContext();
    const companyId = activeBranch?.id || "default";
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stages, setStages] = useState<StageColumn[]>(initialStages);
    const [editingStageId, setEditingStageId] = useState<string | null>(null);
    const [editingStageName, setEditingStageName] = useState('');
    const [isAddingStage, setIsAddingStage] = useState(false);
    const [newStageName, setNewStageName] = useState('');
    const [newStageColorIdx, setNewStageColorIdx] = useState(4);
    const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
    const [activeView, setActiveView] = useState<'pipeline' | 'leads' | 'activity'>('pipeline');
    const [tableFilter, setTableFilter] = useState<'all' | 'lead' | 'opportunity' | 'won' | 'lost'>('all');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [newDealStage, setNewDealStage] = useState('New');
    const [newOppName, setNewOppName] = useState('');
    const [newOppRevenue, setNewOppRevenue] = useState('');
    const [draggedOppId, setDraggedOppId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Call Center CRM Dialer & Disposition State
    const [callCenterMode, setCallCenterMode] = useState(false);
    const [activeCallDeal, setActiveCallDeal] = useState<Lead | null>(null);
    const [callSeconds, setCallSeconds] = useState(0);
    const [callDisposition, setCallDisposition] = useState(DISPOSITION_CODES[0]);
    const [callCallbackAt, setCallCallbackAt] = useState('');
    const [callNotes, setCallNotes] = useState('');
    const [newOppPhone, setNewOppPhone] = useState('');

    useEffect(() => {
        if (activeBranch?.industryId === 'call_center') setCallCenterMode(true);
    }, [activeBranch?.industryId]);

    useEffect(() => {
        if (!activeCallDeal) { setCallSeconds(0); return; }
        const t = setInterval(() => setCallSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, [activeCallDeal?.id]);

    const handleLogCallDisposition = () => {
        if (!activeCallDeal) return;
        let nextStage = activeCallDeal.status;
        let nextProb = activeCallDeal.probability;
        if (callDisposition === 'Interested / Qualified') { nextStage = stages.find(s => s.id.toLowerCase() === 'qualified')?.id || nextStage; nextProb = 55; }
        else if (callDisposition === 'Closed Won') { nextStage = stages.find(s => s.id.toLowerCase() === 'won')?.id || nextStage; nextProb = 100; }
        else if (callDisposition === 'Do Not Call (DNC)' || callDisposition === 'Wrong Number') { nextStage = stages.find(s => s.id.toLowerCase() === 'lost')?.id || nextStage; nextProb = 0; }

        const updated: Lead = {
            ...activeCallDeal,
            status: nextStage,
            probability: nextProb,
            disposition: callDisposition,
            callback_at: callCallbackAt || activeCallDeal.callback_at,
            call_duration_sec: callSeconds,
            call_notes: callNotes || activeCallDeal.call_notes,
        };
        persistLeads(leads.map(l => l.id === updated.id ? updated : l));
        fetch('/api/crm/leads', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...updated, company_id: companyId }),
        }).catch(() => {});
        setActiveCallDeal(null);
        setCallNotes('');
        setCallCallbackAt('');
    };

    const persistStages = (next: StageColumn[]) => {
        setStages(next);
        try {
            localStorage.setItem(getEntityStorageKey("crm_stages"), JSON.stringify(next));
        } catch {}
    };

    const persistLeads = (next: Lead[]) => {
        setLeads(next);
        try {
            localStorage.setItem(getEntityStorageKey("crm_leads"), JSON.stringify(next));
        } catch {}
    };

    const toggleSelectDeal = (id: string) => {
        setSelectedDealIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const exportDeals = (rows: Lead[], format: 'xlsx' | 'csv', prefix = 'crm_deals') => {
        if (!rows || rows.length === 0) return;
        const formatted = rows.map(r => ({
            ID: r.id,
            Name: r.name,
            Type: r.type,
            Stage: r.status,
            Expected_Revenue: r.expected_revenue || 0,
            Probability_Pct: r.probability || 0,
            Company: r.company_name || activeBranch?.name || '',
            Email: r.email || '',
        }));
        const stamp = new Date().toISOString().slice(0, 10);
        if (format === 'xlsx') {
            const ws = XLSX.utils.json_to_sheet(formatted);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'CRM Deals');
            XLSX.writeFile(wb, `${prefix}_${stamp}.xlsx`);
        } else {
            const headers = Object.keys(formatted[0]);
            const csvLines = [
                headers.join(','),
                ...formatted.map(row =>
                    headers.map(h => `"${String((row as any)[h] ?? '').replace(/"/g, '""')}"`).join(',')
                ),
            ].join('\n');
            const blob = new Blob([csvLines], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${prefix}_${stamp}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handleRenameStage = (stageId: string) => {
        const trimmed = editingStageName.trim();
        if (!trimmed) { setEditingStageId(null); return; }
        const oldStage = stages.find(s => s.id === stageId);
        const nextStages = stages.map(s => s.id === stageId ? { ...s, id: trimmed, name: trimmed } : s);
        persistStages(nextStages);
        if (oldStage) {
            const updatedLeads = leads.map(l =>
                l.status?.toLowerCase() === oldStage.id.toLowerCase() ? { ...l, status: trimmed } : l
            );
            persistLeads(updatedLeads);
        }
        setEditingStageId(null);
    };

    const handleAddStage = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newStageName.trim();
        if (!trimmed) return;
        if (stages.some(s => s.id.toLowerCase() === trimmed.toLowerCase())) {
            setIsAddingStage(false);
            setNewStageName('');
            return;
        }
        const preset = STAGE_COLOR_PRESETS[newStageColorIdx] || STAGE_COLOR_PRESETS[0];
        persistStages([...stages, { id: trimmed, name: trimmed, color: preset.color, barBg: preset.barBg }]);
        setNewStageName('');
        setIsAddingStage(false);
    };

    const handleDeleteStage = (stageId: string) => {
        if (stages.length <= 1) return;
        const nextStages = stages.filter(s => s.id !== stageId);
        persistStages(nextStages);
        const fallbackStage = nextStages[0].id;
        const updatedLeads = leads.map(l =>
            l.status?.toLowerCase() === stageId.toLowerCase() ? { ...l, status: fallbackStage } : l
        );
        persistLeads(updatedLeads);
    };

    const handleDeleteDeal = (oppId: string) => {
        persistLeads(leads.filter(l => l.id !== oppId));
        setSelectedDealIds(prev => prev.filter(id => id !== oppId));
    };

    const fetchLeads = async () => {
        try {
            const rawStages = localStorage.getItem(getEntityStorageKey("crm_stages"));
            if (rawStages) {
                const parsedStages = JSON.parse(rawStages);
                if (Array.isArray(parsedStages) && parsedStages.length > 0) setStages(parsedStages);
            } else {
                setStages(initialStages);
            }
        } catch {
            setStages(initialStages);
        }
        const storageKey = getEntityStorageKey("crm_leads");
        let localList: Lead[] = [];
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) localList = parsed;
            }
        } catch {}
        if (localList.length > 0) setLeads(localList);

        try {
            const res = await fetch(`/api/crm/leads?company_id=${encodeURIComponent(companyId)}`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                const apiList: Lead[] = Array.isArray(data?.leads) ? data.leads : [];
                if (apiList.length > 0) {
                    const merged = [...localList];
                    apiList.forEach((item) => {
                        if (!merged.some((m) => m.id === item.id)) merged.push(item);
                    });
                    persistLeads(merged);
                }
            }
        } catch {} finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [companyId]);

    const handleAddOpportunity = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newOppName.trim()) return;

        const created: Lead = {
            id: `DEAL-${Date.now()}`,
            name: newOppName.trim(),
            expected_revenue: parseFloat(newOppRevenue) || 0,
            status: newDealStage || 'New',
            type: activeView === 'leads' ? 'lead' : 'opportunity',
            probability: newDealStage === 'Won' ? 100 : newDealStage === 'Proposition' ? 70 : newDealStage === 'Qualified' ? 40 : 20,
            priority: 2,
            company_name: activeBranch?.name || '',
            phone: newOppPhone.trim() || undefined,
        };

        const next = [created, ...leads];
        persistLeads(next);
        setNewOppName('');
        setNewOppRevenue('');
        setNewOppPhone('');
        setIsNewModalOpen(false);

        fetch('/api/crm/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...created, company_id: companyId }),
        }).catch(() => {});
    };

    const getStageTotal = (stageId: string) => {
        return leads
            .filter(o => o.status?.toLowerCase() === stageId.toLowerCase())
            .reduce((sum, o) => sum + (o.expected_revenue || 0), 0);
    };

    const moveDealStage = (oppId: string, newStageId: string) => {
        const opp = leads.find(o => o.id === oppId);
        if (!opp || opp.status === newStageId) return;

        const next = leads.map(o => o.id === oppId ? { ...o, status: newStageId } : o);
        persistLeads(next);

        fetch('/api/crm/leads', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...opp, status: newStageId, company_id: companyId }),
        }).catch(() => {});
    };

    const handleDragStart = (e: React.DragEvent, oppId: string) => {
        setDraggedOppId(oppId);
        e.dataTransfer.setData('opp_id', oppId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent, newStageId: string) => {
        e.preventDefault();
        const oppId = e.dataTransfer.getData('opp_id') || draggedOppId;
        setDraggedOppId(null);
        if (!oppId) return;
        moveDealStage(oppId, newStageId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const filteredTableLeads = leads.filter(item => {
        if (tableFilter === 'lead') return item.type === 'lead' || item.type === 'opportunity' || !item.type;
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
                    <button
                        onClick={() => setCallCenterMode(v => !v)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                            callCenterMode
                                ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                        }`}
                    >
                        <Headphones size={14} /> Call Center Mode
                    </button>
                    <Link href="/call-center" className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                        <PhoneCall size={13} /> Lead Sheet
                    </Link>
                    <Link href="/forms" className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                        <ClipboardList size={13} /> Public Forms
                    </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {selectedDealIds.length > 0 ? (
                        <>
                            <button
                                onClick={() => exportDeals(leads.filter(l => selectedDealIds.includes(l.id)), 'xlsx', 'crm_selected_deals')}
                                className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 px-3 py-2 rounded-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                            >
                                <FileSpreadsheet size={15} /> Export Selected ({selectedDealIds.length}) Excel
                            </button>
                            <button
                                onClick={() => exportDeals(leads.filter(l => selectedDealIds.includes(l.id)), 'csv', 'crm_selected_deals')}
                                className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 px-3 py-2 rounded-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                            >
                                <Download size={15} /> Selected CSV
                            </button>
                            <button
                                onClick={() => setSelectedDealIds([])}
                                className="text-xs text-gray-400 hover:text-white px-2 py-2 cursor-pointer"
                            >
                                Clear
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => exportDeals(leads, 'xlsx', 'crm_all_deals')}
                                disabled={leads.length === 0}
                                className="bg-white/5 hover:bg-white/10 disabled:opacity-40 text-gray-200 border border-white/10 px-3 py-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                            >
                                <FileSpreadsheet size={15} className="text-emerald-400" /> Excel
                            </button>
                            <button
                                onClick={() => exportDeals(leads, 'csv', 'crm_all_deals')}
                                disabled={leads.length === 0}
                                className="bg-white/5 hover:bg-white/10 disabled:opacity-40 text-gray-200 border border-white/10 px-3 py-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                            >
                                <Download size={15} className="text-cyan-400" /> CSV
                            </button>
                        </>
                    )}
                    <button 
                        onClick={() => {
                            setActiveView('pipeline');
                            setNewDealStage(stages[0]?.id || 'New');
                            setIsNewModalOpen(true);
                        }} 
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-purple-900/20 transition-all cursor-pointer"
                    >
                        <Plus size={18} /> New {activeView === 'leads' ? 'Lead' : 'Opportunity'}
                    </button>
                </div>
            </div>

            {/* Call Center KPI Strip & Active Dialer Bar */}
            {(callCenterMode || activeCallDeal) && (
                <div className="px-6 py-3 bg-[#111622] border-b border-gray-800 space-y-3">
                    {callCenterMode && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 flex items-center justify-between">
                                <span className="text-gray-400">Contacted Deals</span>
                                <span className="font-bold text-cyan-400">
                                    {leads.filter(l => l.disposition).length} / {leads.length}
                                </span>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 flex items-center justify-between">
                                <span className="text-gray-400">Conversion (Won)</span>
                                <span className="font-bold text-emerald-400">
                                    {leads.length > 0 ? Math.round((leads.filter(l => l.status?.toLowerCase() === 'won').length / leads.length) * 100) : 0}%
                                </span>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 flex items-center justify-between">
                                <span className="text-gray-400">Callbacks Due</span>
                                <span className="font-bold text-amber-400">
                                    {leads.filter(l => l.disposition === 'Callback Requested' || l.callback_at).length}
                                </span>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 flex items-center justify-between">
                                <span className="text-gray-400">Avg Handle Time</span>
                                <span className="font-bold text-purple-300">
                                    {(() => {
                                        const timed = leads.filter(l => (l.call_duration_sec || 0) > 0);
                                        if (timed.length === 0) return '00:00';
                                        const avg = Math.round(timed.reduce((s, l) => s + (l.call_duration_sec || 0), 0) / timed.length);
                                        return `${String(Math.floor(avg / 60)).padStart(2, '0')}:${String(avg % 60).padStart(2, '0')}`;
                                    })()}
                                </span>
                            </div>
                        </div>
                    )}

                    {activeCallDeal && (
                        <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-xl p-3 flex flex-wrap items-center gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="font-bold text-white">{activeCallDeal.name}</span>
                                <span className="font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded">
                                    {String(Math.floor(callSeconds / 60)).padStart(2, '0')}:{String(callSeconds % 60).padStart(2, '0')}
                                </span>
                                {activeCallDeal.phone && (
                                    <a href={`tel:${activeCallDeal.phone}`} className="text-emerald-300 underline font-mono">{activeCallDeal.phone}</a>
                                )}
                            </div>
                            <select
                                value={callDisposition}
                                onChange={(e) => setCallDisposition(e.target.value)}
                                className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                            >
                                {DISPOSITION_CODES.map(code => <option key={code} value={code}>{code}</option>)}
                            </select>
                            <input
                                type="datetime-local"
                                value={callCallbackAt}
                                onChange={(e) => setCallCallbackAt(e.target.value)}
                                className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                                title="Optional callback time"
                            />
                            <input
                                value={callNotes}
                                onChange={(e) => setCallNotes(e.target.value)}
                                placeholder="Call notes / rebuttal outcome..."
                                className="flex-1 min-w-[160px] bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                            />
                            <button onClick={handleLogCallDisposition} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer">
                                Log Call &amp; Update Stage
                            </button>
                            <button onClick={() => setActiveCallDeal(null)} className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer">
                                <PhoneOff size={13} /> End
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
                {activeView === 'pipeline' && (
                    <div className="flex h-full gap-4 min-w-max pb-2">
                        {stages.map((stage) => {
                            const stageOpps = leads.filter(
                                o => o.status?.toLowerCase() === stage.id.toLowerCase()
                            );
                            return (
                                <div 
                                    key={stage.id} 
                                    className="w-80 flex flex-col h-full group galaxy-card !bg-white/5 p-3 rounded-xl border border-white/5"
                                    onDrop={(e) => handleDrop(e, stage.id)}
                                    onDragOver={handleDragOver}
                                >
                                    {/* Column Header (Editable) */}
                                    <div className="flex items-center justify-between mb-2 px-1 gap-1">
                                        {editingStageId === stage.id ? (
                                            <div className="flex items-center gap-1 flex-1">
                                                <input
                                                    type="text"
                                                    value={editingStageName}
                                                    onChange={(e) => setEditingStageName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleRenameStage(stage.id);
                                                        if (e.key === 'Escape') setEditingStageId(null);
                                                    }}
                                                    autoFocus
                                                    className="bg-gray-900 border border-purple-500 rounded px-2 py-0.5 text-sm text-white outline-none w-full"
                                                />
                                                <button onClick={() => handleRenameStage(stage.id)} className="text-emerald-400 p-1 cursor-pointer"><Check size={14} /></button>
                                                <button onClick={() => setEditingStageId(null)} className="text-gray-400 p-1 cursor-pointer"><X size={14} /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    className="flex items-center gap-2 font-semibold text-gray-200 cursor-pointer"
                                                    onDoubleClick={() => { setEditingStageId(stage.id); setEditingStageName(stage.name); }}
                                                    title="Double-click to rename heading"
                                                >
                                                    <h3>{stage.name}</h3>
                                                    <span className="text-gray-500 text-xs px-2 py-0.5 rounded-full bg-white/5">
                                                        {stageOpps.length}
                                                    </span>
                                                </div>
                                                <div className="opacity-70 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                                                    <button
                                                        onClick={() => { setEditingStageId(stage.id); setEditingStageName(stage.name); }}
                                                        className="text-gray-400 hover:text-purple-300 p-1 cursor-pointer"
                                                        title="Rename stage heading"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setNewDealStage(stage.id);
                                                            setIsNewModalOpen(true);
                                                        }}
                                                        className="text-gray-400 hover:text-white p-1 cursor-pointer"
                                                        title="Add deal to column"
                                                    >
                                                        <Plus size={15} />
                                                    </button>
                                                    {stageOpps.length > 0 && (
                                                        <button
                                                            onClick={() => exportDeals(stageOpps, 'xlsx', `crm_${stage.name.toLowerCase().replace(/\s+/g, '_')}`)}
                                                            className="text-gray-400 hover:text-emerald-400 p-1 cursor-pointer"
                                                            title={`Export "${stage.name}" to Excel`}
                                                        >
                                                            <FileSpreadsheet size={13} />
                                                        </button>
                                                    )}
                                                    {stages.length > 1 && (
                                                        <button
                                                            onClick={() => handleDeleteStage(stage.id)}
                                                            className="text-gray-500 hover:text-rose-400 p-1 cursor-pointer"
                                                            title="Remove column"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
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
                                        {stage.id === newDealStage && isNewModalOpen && (
                                            <form onSubmit={handleAddOpportunity} className="bg-[#1E293B] rounded-xl border border-purple-500/50 p-4 shadow-xl animate-in fade-in slide-in-from-top-2">
                                                <div className="mb-3">
                                                    <label className="text-xs text-purple-400 font-medium mb-1 block">Organization / Lead Name <span className="text-purple-400">*</span></label>
                                                    <input
                                                        type="text"
                                                        required
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
                                                            type="submit"
                                                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer"
                                                        >
                                                            Add
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsNewModalOpen(false)}
                                                            className="bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium uppercase cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        )}

                                        {/* Opportunity Cards */}
                                        {stageOpps.map((opp) => {
                                            const stageIdx = stages.findIndex(s => s.id.toLowerCase() === stage.id.toLowerCase());
                                            const prevStage = stageIdx > 0 ? stages[stageIdx - 1].id : null;
                                            const nextStage = stageIdx < stages.length - 1 ? stages[stageIdx + 1].id : null;
                                            const isSelected = selectedDealIds.includes(opp.id);
                                            return (
                                            <div 
                                                key={opp.id} 
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, opp.id)}
                                                className={`block galaxy-card !p-3.5 !rounded-xl cursor-grab active:cursor-grabbing group relative shadow-md transition-all border ${isSelected ? 'border-emerald-500/70 !bg-emerald-950/20' : 'border-white/5 !bg-white/[0.07] hover:!bg-white/[0.12] hover:border-purple-500/40'}`}
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectDeal(opp.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="Select deal for Excel/CSV export"
                                                        className="mt-1 accent-emerald-500 cursor-pointer shrink-0"
                                                    />
                                                    <Link href={`/crm/${opp.id}`} draggable={false} className="block flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="text-sm font-semibold text-gray-100 truncate pr-2 group-hover:text-purple-400 transition-colors">
                                                                {opp.name}
                                                            </h4>
                                                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
                                                                opp.status?.toLowerCase() === 'won' ? 'bg-emerald-400' :
                                                                opp.status?.toLowerCase() === 'lost' ? 'bg-rose-500' :
                                                                opp.priority > 1 ? 'bg-amber-400 animate-pulse' : 'bg-blue-400'
                                                            }`}></div>
                                                        </div>
                                                        <div className="text-sm text-gray-200 font-bold">
                                                            ${(opp.expected_revenue || 0).toLocaleString()}
                                                        </div>
                                                    </Link>
                                                </div>

                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3].map(i => (
                                                            <Star key={i} size={11} className={i <= (opp.priority || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setActiveCallDeal(opp); setCallDisposition(opp.disposition || DISPOSITION_CODES[0]); setCallNotes(opp.call_notes || ''); }}
                                                            title="Click-to-Call & Log Disposition"
                                                            className="ml-1 p-1 rounded hover:bg-cyan-500/20 text-cyan-300 cursor-pointer"
                                                        >
                                                            <PhoneCall size={12} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); exportDeals([opp], 'xlsx', `deal_${opp.name.toLowerCase().replace(/\s+/g, '_')}`); }}
                                                            title="Export this deal to Excel"
                                                            className="ml-1.5 p-1 rounded hover:bg-white/10 text-emerald-400 cursor-pointer"
                                                        >
                                                            <FileSpreadsheet size={12} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); exportDeals([opp], 'csv', `deal_${opp.name.toLowerCase().replace(/\s+/g, '_')}`); }}
                                                            title="Export this deal to CSV"
                                                            className="p-1 rounded hover:bg-white/10 text-cyan-400 cursor-pointer"
                                                        >
                                                            <Download size={12} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteDeal(opp.id); }}
                                                            title="Delete deal"
                                                            className="p-1 rounded hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {prevStage && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); moveDealStage(opp.id, prevStage); }}
                                                                title={`Move back to ${prevStage}`}
                                                                className="p-1 rounded bg-white/5 hover:bg-white/15 text-gray-300 cursor-pointer"
                                                            >
                                                                <ChevronLeft size={12} />
                                                            </button>
                                                        )}
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(opp.status)}`}>
                                                            {opp.status}
                                                        </span>
                                                        {nextStage && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); moveDealStage(opp.id, nextStage); }}
                                                                title={`Advance to ${nextStage}`}
                                                                className="p-1 rounded bg-white/5 hover:bg-white/15 text-gray-300 cursor-pointer"
                                                            >
                                                                <ChevronRight size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}

                                        {stageOpps.length === 0 && !isNewModalOpen && (
                                            <div className="py-8 text-center border border-dashed border-white/5 rounded-xl text-xs text-gray-500">
                                                No opportunities
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add New Stage / Column */}
                        <div className="w-72 shrink-0">
                            {isAddingStage ? (
                                <form onSubmit={handleAddStage} className="galaxy-card !bg-[#1E293B] p-4 rounded-xl border border-purple-500/40 space-y-3">
                                    <div className="text-xs font-bold text-purple-300 uppercase">New Stage Heading</div>
                                    <input
                                        type="text"
                                        required
                                        value={newStageName}
                                        onChange={(e) => setNewStageName(e.target.value)}
                                        placeholder="e.g. Negotiation"
                                        autoFocus
                                        className="w-full bg-gray-900 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
                                    />
                                    <div className="flex items-center gap-1.5">
                                        {STAGE_COLOR_PRESETS.map((p, idx) => (
                                            <button
                                                key={p.label}
                                                type="button"
                                                onClick={() => setNewStageColorIdx(idx)}
                                                className={`w-5 h-5 rounded-full ${p.barBg} ${newStageColorIdx === idx ? 'ring-2 ring-white' : 'opacity-60'} cursor-pointer`}
                                                title={p.label}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-1.5 rounded-lg text-xs font-bold cursor-pointer">Add Column</button>
                                        <button type="button" onClick={() => setIsAddingStage(false)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs cursor-pointer">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setIsAddingStage(true)}
                                    className="w-full py-4 border border-dashed border-white/15 hover:border-purple-500/50 rounded-xl text-xs font-bold text-gray-400 hover:text-purple-300 flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/[0.02]"
                                >
                                    <Plus size={16} /> Add Stage / Column
                                </button>
                            )}
                        </div>
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
                                        <th className="px-4 py-4 w-10">
                                            <input
                                                type="checkbox"
                                                checked={filteredTableLeads.length > 0 && filteredTableLeads.every(i => selectedDealIds.includes(i.id))}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedDealIds(Array.from(new Set([...selectedDealIds, ...filteredTableLeads.map(i => i.id)])));
                                                    } else {
                                                        const ids = new Set(filteredTableLeads.map(i => i.id));
                                                        setSelectedDealIds(selectedDealIds.filter(id => !ids.has(id)));
                                                    }
                                                }}
                                                className="accent-emerald-500 cursor-pointer"
                                            />
                                        </th>
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
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDealIds.includes(item.id)}
                                                    onChange={() => toggleSelectDeal(item.id)}
                                                    className="accent-emerald-500 cursor-pointer"
                                                />
                                            </td>
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
                                            <td className="px-6 py-4 text-right space-x-1.5">
                                                <button
                                                    onClick={() => exportDeals([item], 'xlsx', `deal_${item.name.toLowerCase().replace(/\s+/g, '_')}`)}
                                                    className="inline-flex items-center gap-1 text-[11px] bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 px-2 py-1 rounded-lg cursor-pointer"
                                                    title="Export row to Excel"
                                                >
                                                    <FileSpreadsheet size={12} /> XLSX
                                                </button>
                                                <button
                                                    onClick={() => exportDeals([item], 'csv', `deal_${item.name.toLowerCase().replace(/\s+/g, '_')}`)}
                                                    className="inline-flex items-center gap-1 text-[11px] bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 px-2 py-1 rounded-lg cursor-pointer"
                                                    title="Export row to CSV"
                                                >
                                                    <Download size={12} /> CSV
                                                </button>
                                                <Link 
                                                    href={`/crm/${item.id}`}
                                                    className="inline-block text-xs bg-white/5 hover:bg-purple-600 text-gray-300 hover:text-white px-3 py-1 rounded-lg transition-all"
                                                >
                                                    Details →
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
