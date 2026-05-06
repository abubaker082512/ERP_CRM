"use client";
import { fetchAPI } from '@/lib/api';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, FileText, Calendar, User, DollarSign, CheckCircle, Trash2 } from "lucide-react";

type MoveLine = {
    id: string;
    account_id: string;
    name: string;
    debit: number;
    credit: number;
};

type Move = {
    id: string;
    name: string;
    date: string;
    ref: string;
    state: string;
    journal_id: string;
    amount_total: number;
    amount_residual: number;
    payment_state: string;
    lines?: MoveLine[];
};

export default function AccountingMoveDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [move, setMove] = useState<Move | null>(null);
    const [loading, setLoading] = useState(true);

    const handleRegisterPayment = async () => {
        if (!move) return;
        try {
            // Get a journal for payments (bank or cash)
            const journals = await fetchAPI('/accounting/journals').then(r => r.json());
            const bankJournal = journals.find((j: any) => j.type === 'bank') || journals[0];

            const res = await fetchAPI('/accounting/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: move.amount_total,
                    payment_type: move.move_type === 'out_invoice' ? 'inbound' : 'outbound',
                    partner_id: (move as any).partner_id,
                    journal_id: bankJournal.id,
                    invoice_ids: [move.id]
                })
            });
            if (res.ok) {
                const updatedMove = await fetchAPI(`/accounting/moves/${id}`).then(r => r.json());
                setMove(updatedMove);
                alert("Payment Registered Successfully!");
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchAPI(`/accounting/moves/${id}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                setMove(data);
                setLoading(false);
            })
            .catch(console.error);
    }, [id]);

    if (loading) return <div className="p-8 text-white bg-[#0F172A] h-screen">Loading...</div>;
    if (!move) return <div className="p-8 text-white bg-[#0F172A] h-screen">Journal Entry not found.</div>;

    const totalDebit = move.lines?.reduce((sum, l) => sum + l.debit, 0) || 0;
    const totalCredit = move.lines?.reduce((sum, l) => sum + l.credit, 0) || 0;

    return (
        <div className="flex flex-col h-screen bg-[#0F172A] text-gray-200">
            <div className="bg-[#1E293B] border-b border-gray-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Journal Entry: {move.name}</h1>
                </div>
                <div className="flex gap-3">
                    {move.payment_state === 'not_paid' && move.state === 'posted' && (
                        <button onClick={() => handleRegisterPayment()} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-green-900/20">
                            <DollarSign size={16} /> Register Payment
                        </button>
                    )}
                    <button className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium">
                        <Trash2 size={16} /> Delete
                    </button>
                    {move.state === 'draft' && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-purple-900/20">
                            <CheckCircle size={16} /> Post Entry
                        </button>
                    )}
                </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6 max-w-6xl mx-auto w-full">
                <div className="bg-[#1E293B] border border-gray-700 rounded-xl overflow-hidden shadow-xl mb-6">
                    <div className="p-8 border-b border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Journal</label>
                            <p className="text-sm font-bold text-white uppercase">{move.journal_id}</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Date</label>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar size={14} className="text-purple-400" />
                                <p className="text-sm font-medium text-white">{new Date(move.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Reference</label>
                            <p className="text-sm font-medium text-white mt-1">{move.ref || "—"}</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Payment</label>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 inline-block ${
                                move.payment_state === 'paid' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                            }`}>
                                {move.payment_state?.replace('_', ' ')}
                            </span>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Due</label>
                            <p className="text-sm font-bold text-white mt-1">${move.amount_residual?.toLocaleString(undefined, {minimumFractionDigits: 2}) || "0.00"}</p>
                        </div>
                    </div>

                    <div className="p-8">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <FileText size={20} className="text-purple-500" /> Entry Lines
                        </h2>
                        
                        <div className="bg-[#0F172A]/50 rounded-lg border border-gray-800 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-[10px] text-gray-500 uppercase border-b border-gray-800 bg-[#1E293B]">
                                        <th className="px-6 py-3 text-left">Account</th>
                                        <th className="px-6 py-3 text-left">Label</th>
                                        <th className="px-6 py-3 text-right">Debit</th>
                                        <th className="px-6 py-3 text-right">Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {(move.lines || []).map(line => (
                                        <tr key={line.id} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-300">{line.account_id}</td>
                                            <td className="px-6 py-4 text-gray-400">{line.name}</td>
                                            <td className="px-6 py-4 text-right font-mono">${line.debit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                            <td className="px-6 py-4 text-right font-mono">${line.credit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        </tr>
                                    ))}
                                    {(!move.lines || move.lines.length === 0) && (
                                        <tr className="hover:bg-gray-800/50 transition-colors text-gray-500 italic">
                                            <td className="px-6 py-4">Account Receiv.</td>
                                            <td className="px-6 py-4">Demo Line</td>
                                            <td className="px-6 py-4 text-right font-mono">${move.amount_total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                            <td className="px-6 py-4 text-right font-mono">$0.00</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-[#1E293B]/30 font-bold border-t border-gray-700">
                                    <tr>
                                        <td colSpan={2} className="px-6 py-4 text-right text-gray-400 uppercase tracking-widest text-[10px]">Total</td>
                                        <td className="px-6 py-4 text-right font-mono text-white">${(totalDebit || move.amount_total).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="px-6 py-4 text-right font-mono text-white">${(totalCredit || move.amount_total).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
