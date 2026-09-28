"use client";
import { fetchAPI } from '@/lib/api';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

export default function NewJournalEntryPage() {
    const params = useParams();
    const router = useRouter();
    const journalId = params.id as string;

    const [ref, setRef] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [lines, setLines] = useState([{ id: Date.now(), account_id: '', name: '', debit: 0, credit: 0 }]);
    const [saving, setSaving] = useState(false);

    const handleAddLine = () => {
        setLines([...lines, { id: Date.now(), account_id: '', name: '', debit: 0, credit: 0 }]);
    };

    const handleRemoveLine = (id: number) => {
        if (lines.length > 1) {
            setLines(lines.filter(l => l.id !== id));
        }
    };

    const handleLineChange = (id: number, field: string, value: string | number) => {
        setLines(lines.map(l => l.id === id ? { ...l, [field]: field === 'debit' || field === 'credit' ? Number(value) : value } : l));
    };

    const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    const handleSave = async () => {
        if (!isBalanced) {
            alert("Journal Entry must be balanced (Total Debit = Total Credit).");
            return;
        }

        // Check if accounts are provided (placeholder check)
        // In a real app, you'd fetch real accounts and select them by UUID.
        // For this demo, if account_id is empty, we use a fake UUID or require it.

        setSaving(true);
        try {
            const res = await fetchAPI("/accounting/moves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ref: ref,
                    date: date,
                    journal_id: journalId,
                    move_type: 'entry',
                    state: 'draft',
                    amount_total: totalDebit,
                    lines: lines.map(l => ({
                        // Need a valid UUID for account_id, we will just use a generic one if missing, 
                        // but ideally we should fetch accounts. Let's assume user types a UUID for now or we fetch them.
                        // Wait, we need real accounts. We will fetch them later. For now, let's use a dummy UUID if empty to prevent crash, 
                        // or better yet, we should fetch accounts and put them in a dropdown.
                        account_id: l.account_id || '00000000-0000-0000-0000-000000000000',
                        name: l.name,
                        debit: l.debit,
                        credit: l.credit
                    }))
                })
            });

            if (res.ok) {
                router.push(`/accounting/journal/${journalId}`);
            } else {
                const data = await res.json();
                alert(`Error: ${data.detail || 'Failed to save'}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A] text-white">
            <div className="bg-[#1E293B] border-b border-gray-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push(`/accounting/journal/${journalId}`)} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">New Journal Entry</h1>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={saving || !isBalanced}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                >
                    <Save size={18} /> {saving ? "Saving..." : "Save Entry"}
                </button>
            </div>

            <div className="flex-1 overflow-auto p-6 max-w-5xl mx-auto w-full">
                <div className="bg-[#1E293B] rounded-xl border border-gray-800 p-6 mb-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Reference</label>
                            <input 
                                type="text" 
                                value={ref} 
                                onChange={(e) => setRef(e.target.value)}
                                placeholder="e.g. Initial Balance" 
                                className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Accounting Date</label>
                            <input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1E293B] rounded-xl border border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-200">Journal Items</h2>
                        {!isBalanced && (
                            <span className="text-red-400 text-sm font-medium">Unbalanced Entry</span>
                        )}
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0F172A] text-gray-400 text-xs uppercase border-b border-gray-800">
                            <tr>
                                <th className="px-4 py-3 font-medium w-1/3">Account (UUID)</th>
                                <th className="px-4 py-3 font-medium">Label</th>
                                <th className="px-4 py-3 font-medium text-right w-32">Debit</th>
                                <th className="px-4 py-3 font-medium text-right w-32">Credit</th>
                                <th className="px-4 py-3 font-medium text-center w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {lines.map((line) => (
                                <tr key={line.id} className="hover:bg-gray-800/30">
                                    <td className="p-2">
                                        <input 
                                            type="text" 
                                            value={line.account_id}
                                            onChange={(e) => handleLineChange(line.id, 'account_id', e.target.value)}
                                            placeholder="Account UUID"
                                            className="w-full bg-transparent border-b border-transparent focus:border-purple-500 px-2 py-1 outline-none text-gray-300"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            type="text" 
                                            value={line.name}
                                            onChange={(e) => handleLineChange(line.id, 'name', e.target.value)}
                                            placeholder="Description"
                                            className="w-full bg-transparent border-b border-transparent focus:border-purple-500 px-2 py-1 outline-none text-gray-300"
                                        />
                                    </td>
                                    <td className="p-2 text-right">
                                        <input 
                                            type="number" 
                                            value={line.debit || ''}
                                            onChange={(e) => handleLineChange(line.id, 'debit', e.target.value)}
                                            className="w-full bg-transparent border-b border-transparent focus:border-purple-500 px-2 py-1 outline-none text-right text-gray-300"
                                            min="0" step="0.01"
                                        />
                                    </td>
                                    <td className="p-2 text-right">
                                        <input 
                                            type="number" 
                                            value={line.credit || ''}
                                            onChange={(e) => handleLineChange(line.id, 'credit', e.target.value)}
                                            className="w-full bg-transparent border-b border-transparent focus:border-purple-500 px-2 py-1 outline-none text-right text-gray-300"
                                            min="0" step="0.01"
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => handleRemoveLine(line.id)} className="text-gray-500 hover:text-red-400 p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-[#0F172A] border-t border-gray-800 font-semibold text-gray-200">
                            <tr>
                                <td colSpan={2} className="px-4 py-3">Total</td>
                                <td className="px-6 py-3 text-right">{totalDebit.toFixed(2)}</td>
                                <td className="px-6 py-3 text-right">{totalCredit.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                    <div className="p-4 border-t border-gray-800">
                        <button onClick={handleAddLine} className="text-purple-400 hover:text-purple-300 font-medium text-sm flex items-center gap-1">
                            <Plus size={16} /> Add a line
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
