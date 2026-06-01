"use client";
import { fetchAPI } from '@/lib/api';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Package, Wrench, Calendar, User, FileText, Trash2, Play, Check, XCircle } from "lucide-react";
import Link from "next/link";

const STATE_COLORS: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    progress: 'bg-orange-500/20 text-orange-400',
    to_close: 'bg-indigo-500/20 text-indigo-400',
    done: 'bg-green-500/20 text-green-400',
    cancel: 'bg-red-500/20 text-red-400',
};

export default function ProductionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [workorders, setWorkorders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [moRes, woRes] = await Promise.all([
                fetchAPI(`/mrp/production/${id}`),
                fetchAPI(`/mrp/workorders?production_id=${id}`)
            ]);
            if (moRes.ok) setOrder(await moRes.json());
            if (woRes.ok) setWorkorders(await woRes.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleConfirm = async () => {
        setProcessing(true);
        try {
            const res = await fetchAPI(`/mrp/production/${id}/confirm`, { method: "POST" });
            if (res.ok) fetchData();
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    const handleMarkDone = async () => {
        setProcessing(true);
        try {
            const res = await fetchAPI(`/mrp/production/${id}/done`, { method: "POST" });
            if (res.ok) fetchData();
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel and delete this Manufacturing Order?")) return;
        setProcessing(true);
        try {
            const res = await fetchAPI(`/mrp/production/${id}`, { method: "DELETE" });
            if (res.ok) router.push("/manufacturing");
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    const handleStartWorkOrder = async (woId: string) => {
        const res = await fetchAPI(`/mrp/workorders/${woId}/start`, { method: "POST" });
        if (res.ok) fetchData();
    };

    const handleDoneWorkOrder = async (woId: string) => {
        const res = await fetchAPI(`/mrp/workorders/${woId}/done`, { method: "POST" });
        if (res.ok) fetchData();
    };

    if (loading) return <div className="p-8 text-white bg-[#0F172A] h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>;
    if (!order) return null;

    return (
        <div className="flex flex-col h-screen bg-[#0F172A] text-gray-200">
            <div className="bg-[#1E293B] border-b border-gray-800 p-4 flex items-center justify-between shadow shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/manufacturing" className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg bg-white/5 border border-white/5">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1 className="text-lg font-bold text-white">MO: {order.name}</h1>
                </div>
                <div className="flex gap-2">
                    {order.state === 'draft' && (
                        <button 
                            onClick={handleConfirm}
                            disabled={processing}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-orange-950/20 active:scale-95 disabled:opacity-50"
                        >
                            <CheckCircle size={16} /> Confirm Order
                        </button>
                    )}
                    {(order.state === 'confirmed' || order.state === 'progress') && (
                        <button 
                            onClick={handleMarkDone}
                            disabled={processing}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-green-950/20 active:scale-95 disabled:opacity-50"
                        >
                            <CheckCircle size={16} /> Mark as Done
                        </button>
                    )}
                    {order.state !== 'done' && order.state !== 'cancel' && (
                        <button 
                            onClick={handleCancel}
                            disabled={processing}
                            className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold disabled:opacity-50"
                        >
                            <Trash2 size={16} /> Cancel MO
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6 max-w-6xl mx-auto w-full">
                <div className="galaxy-card overflow-hidden mb-6">
                    <div className="p-8 border-b border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Product</label>
                            <p className="text-sm font-bold text-white uppercase truncate">{(order as any).product_product?.name || "Enterprise Server X1"}</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Quantity</label>
                            <p className="text-sm font-bold text-white uppercase">{order.product_qty} Units</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Scheduled Date</label>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar size={14} className="text-orange-400" />
                                <p className="text-sm font-medium text-white">{new Date(order.date_planned_start).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Status</label>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 inline-block ${STATE_COLORS[order.state] || STATE_COLORS.draft}`}>
                                {order.state}
                            </span>
                        </div>
                    </div>

                    <div className="p-8">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Wrench size={20} className="text-orange-500" /> Work Orders
                        </h2>
                        
                        <div className="bg-[#0F172A]/50 rounded-xl border border-gray-800 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-[10px] text-gray-500 uppercase border-b border-gray-800 bg-[#1E293B]">
                                        <th className="px-6 py-3 text-left">Operation</th>
                                        <th className="px-6 py-3 text-left">Work Center</th>
                                        <th className="px-6 py-3 text-right">Expected</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {workorders.map(wo => (
                                        <tr key={wo.id} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-300">{wo.name}</td>
                                            <td className="px-6 py-4 text-gray-400">{wo.workcenter_id?.substring(0, 8)}...</td>
                                            <td className="px-6 py-4 text-right font-mono text-blue-400">{wo.duration_expected}m</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATE_COLORS[wo.state] || 'bg-gray-700'}`}>
                                                    {wo.state}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {wo.state === 'pending' && (
                                                    <button onClick={() => handleStartWorkOrder(wo.id)} className="text-orange-400 hover:text-orange-300 transition-colors">
                                                        <Play size={16} />
                                                    </button>
                                                )}
                                                {wo.state === 'progress' && (
                                                    <button onClick={() => handleDoneWorkOrder(wo.id)} className="text-green-400 hover:text-green-300 transition-colors">
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {workorders.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">No work orders linked to this MO. Confirming the order will auto-create operations.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Bill of Materials Info */}
                <div className="galaxy-card p-6 border border-gray-800">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <FileText size={16} className="text-orange-400" /> Bill of Materials
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/3 p-3 rounded-lg border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase">BoM Type</p>
                            <p className="text-sm text-white">Manufacture</p>
                        </div>
                        <div className="bg-white/3 p-3 rounded-lg border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase">Components</p>
                            <p className="text-sm text-white">4 Items</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
