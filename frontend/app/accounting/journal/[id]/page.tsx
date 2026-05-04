"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

type Move = {
    id: string;
    name: string;
    date: string;
    ref: string;
    state: string;
    amount_total: number;
    partner_id?: string;
};

export default function JournalPage() {
    const params = useParams();
    const router = useRouter();
    const journalId = params.id as string;

    const [moves, setMoves] = useState<Move[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!journalId) return;
        fetchMoves();
    }, [journalId]);

    const fetchMoves = async () => {
        try {
            // Ideally, the backend should support filtering by journal_id
            // For now, fetch all and filter client-side, or update backend to filter
            const res = await fetchAPI(`/accounting/moves`);
            if (res.ok) {
                const data = await res.json();
                const journalMoves = data.filter((m: any) => m.journal_id === journalId);
                setMoves(journalMoves);
            }
        } catch (error) {
            console.error("Failed to fetch moves", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A] text-white">
            <div className="bg-[#1E293B] border-b border-gray-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/accounting')} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Journal Entries</h1>
                </div>
                <Link href={`/accounting/journal/${journalId}/new`} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                    <Plus size={18} /> New Entry
                </Link>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="bg-[#1E293B] rounded-xl border border-gray-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0F172A] text-gray-400 text-xs uppercase border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Number</th>
                                <th className="px-6 py-3 font-medium">Reference</th>
                                <th className="px-6 py-3 font-medium">Partner</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading entries...</td>
                                </tr>
                            ) : moves.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <p className="mb-2">No entries found in this journal.</p>
                                        <Link href={`/accounting/journal/${journalId}/new`} className="text-purple-400 hover:text-purple-300 font-medium">
                                            Create the first entry
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                moves.map((move) => (
                                    <tr key={move.id} className="hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => router.push(`/accounting/move/${move.id}`)}>
                                        <td className="px-6 py-4 text-gray-300">{move.date ? new Date(move.date).toLocaleDateString() : 'Draft'}</td>
                                        <td className="px-6 py-4 font-medium text-white">{move.name}</td>
                                        <td className="px-6 py-4 text-gray-400">{move.ref || '-'}</td>
                                        <td className="px-6 py-4 text-gray-300">{move.partner_id || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${move.state === 'posted' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'}`}>
                                                {move.state}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-white">${move.amount_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
