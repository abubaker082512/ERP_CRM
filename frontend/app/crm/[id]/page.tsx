"use client";
import { fetchAPI } from '@/lib/api';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';
import CRMHeader from '@/components/crm/CRMHeader';

type Opportunity = {
    id: string;
    name: string;
    expected_revenue: number;
    stage: string;
    win_probability: number;
    notes?: string;
    priority?: number;
};

export default function OpportunityDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [opp, setOpp] = useState<Opportunity | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOpp = async () => {
            try {
                const res = await fetchAPI(`/opportunities/${id}`);
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                setOpp(await res.json());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOpp();
    }, [id]);

    const handleSave = async () => {
        if (!opp) return;
        setSaving(true);
        setError(null);
        try {
            const payload = {
                name: opp.name,
                expected_revenue: opp.expected_revenue,
                stage: opp.stage,
                win_probability: opp.win_probability,
                notes: opp.notes ?? null,
                priority: opp.priority ?? 0,
            };
            const res = await fetchAPI(`/opportunities/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const detail = await res.json();
                throw new Error(detail.detail || `HTTP ${res.status}`);
            }
            const updated = await res.json();
            setOpp(updated);
            alert("✅ Opportunity saved successfully!");
        } catch (err: any) {
            setError(`Save failed: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this opportunity?")) return;
        try {
            const res = await fetchAPI(`/opportunities/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Delete failed");
        } catch (err: any) {
            alert(`Delete error: ${err.message}`);
            return;
        }
        router.push('/crm');
    };

    if (loading) return <div className="h-screen bg-[#0F172A] flex items-center justify-center text-white text-lg">Loading...</div>;

    if (error && !opp) return (
        <div className="h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white gap-4">
            <p className="text-red-400 text-lg">⚠️ {error}</p>
            <Link href="/crm" className="text-purple-400 hover:underline">← Back to CRM</Link>
        </div>
    );

    if (!opp) return <div className="p-8 text-white">Opportunity not found.</div>;

    return (
        <div className="flex flex-col h-screen bg-[#0F172A] text-white">
            <CRMHeader onNewClick={() => router.push('/crm')} />

            <div className="p-6 max-w-4xl mx-auto w-full overflow-y-auto">
                {/* Error Banner */}
                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/crm" className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold">{opp.name}</h1>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284c7] disabled:opacity-60 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-6">
                        <div className="bg-[#1E293B] border border-gray-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold border-b border-gray-800 pb-4 mb-4">General Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Opportunity Name</label>
                                    <input
                                        type="text"
                                        value={opp.name}
                                        onChange={e => setOpp({...opp, name: e.target.value})}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0EA5E9] outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Expected Revenue ($)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                            <input
                                                type="number"
                                                value={opp.expected_revenue}
                                                onChange={e => setOpp({...opp, expected_revenue: Number(e.target.value)})}
                                                className="w-full bg-[#0F172A] border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#0EA5E9] outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">AI Win Probability</label>
                                        <div className="relative">
                                            <Activity className="absolute left-3 top-2.5 text-[#0EA5E9]" size={16} />
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={opp.win_probability}
                                                disabled
                                                className="w-full bg-[#1e293b] text-gray-400 border border-gray-800 rounded-lg pl-10 pr-4 py-2 outline-none cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Internal Notes</label>
                                    <textarea
                                        value={opp.notes || ''}
                                        onChange={e => setOpp({...opp, notes: e.target.value})}
                                        rows={4}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0EA5E9] outline-none resize-none"
                                        placeholder="Add notes for this opportunity..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#1E293B] border border-gray-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold border-b border-gray-800 pb-4 mb-4">Pipeline Status</h2>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Current Stage</label>
                                <select
                                    value={opp.stage}
                                    onChange={e => setOpp({...opp, stage: e.target.value})}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0EA5E9] outline-none cursor-pointer"
                                >
                                    <option value="New">New</option>
                                    <option value="Qualified">Qualified</option>
                                    <option value="Proposition">Proposition</option>
                                    <option value="Won">Won</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
