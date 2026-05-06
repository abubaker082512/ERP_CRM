"use client";
import { fetchAPI } from '@/lib/api';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Package, Truck, Calendar, User, FileText, Trash2 } from "lucide-react";
import Link from "next/link";

const STATE_COLORS: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    waiting: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    assigned: 'bg-indigo-500/20 text-indigo-400',
    done: 'bg-green-500/20 text-green-400',
    cancel: 'bg-red-500/20 text-red-400',
};

export default function PickingDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [picking, setPicking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchPicking();
    }, [id]);

    const fetchPicking = async () => {
        try {
            const res = await fetchAPI(`/inventory/pickings/${id}`);
            if (res.ok) {
                const data = await res.json();
                setPicking(data);
            } else router.push("/inventory");
        } catch { router.push("/inventory"); }
        finally { setLoading(false); }
    };

    const handleValidate = async () => {
        setValidating(true);
        try {
            const res = await fetchAPI(`/inventory/pickings/${id}/validate`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setPicking(data);
                alert("Transfer Validated Successfully!");
            }
        } finally { setValidating(false); }
    };

    if (loading) return <div className="p-8 text-white bg-[#0F172A] h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>;
    if (!picking) return null;

    return (
        <div className="flex flex-col h-screen bg-[#0F172A] text-gray-200">
            <div className="bg-[#1E293B] border-b border-gray-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/inventory" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold">Transfer: {picking.name}</h1>
                </div>
                <div className="flex gap-3">
                    {picking.state !== 'done' && picking.state !== 'cancel' && (
                        <button 
                            onClick={handleValidate} 
                            disabled={validating}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-green-900/20"
                        >
                            <CheckCircle size={16} /> {validating ? "Validating..." : "Validate"}
                        </button>
                    )}
                    <button className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium">
                        <Trash2 size={16} /> Cancel
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6 max-w-6xl mx-auto w-full">
                <div className="galaxy-card overflow-hidden mb-6">
                    <div className="p-8 border-b border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Source</label>
                            <p className="text-sm font-bold text-white uppercase">{picking.origin || "Manual"}</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Partner</label>
                            <div className="flex items-center gap-2 mt-1">
                                <User size={14} className="text-purple-400" />
                                <p className="text-sm font-medium text-white">{picking.partner_id ? "Customer/Vendor" : "—"}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Scheduled Date</label>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar size={14} className="text-blue-400" />
                                <p className="text-sm font-medium text-white">{picking.scheduled_date ? new Date(picking.scheduled_date).toLocaleDateString() : "—"}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Status</label>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 inline-block ${STATE_COLORS[picking.state] || STATE_COLORS.draft}`}>
                                {picking.state}
                            </span>
                        </div>
                    </div>

                    <div className="p-8">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Package size={20} className="text-purple-500" /> Operations
                        </h2>
                        
                        <div className="bg-[#0F172A]/50 rounded-lg border border-gray-800 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-[10px] text-gray-500 uppercase border-b border-gray-800 bg-[#1E293B]">
                                        <th className="px-6 py-3 text-left">Product</th>
                                        <th className="px-6 py-3 text-right">Demand</th>
                                        <th className="px-6 py-3 text-right">Done</th>
                                        <th className="px-6 py-3 text-left">UoM</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {/* Mocking moves for now since they are linked to picking_id in DB */}
                                    <tr className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-300">Enterprise Server X1</td>
                                        <td className="px-6 py-4 text-right font-mono text-blue-400">5.00</td>
                                        <td className="px-6 py-4 text-right font-mono text-green-400">{picking.state === 'done' ? '5.00' : '0.00'}</td>
                                        <td className="px-6 py-4 text-gray-500">Units</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="galaxy-card p-6">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Truck size={16} className="text-purple-400" /> Shipping Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Carrier</span>
                                <span className="text-gray-300">Galaxy Logistics</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Tracking Ref</span>
                                <span className="text-gray-300 font-mono">GLX-998122-TX</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Weight</span>
                                <span className="text-gray-300">12.5 kg</span>
                            </div>
                        </div>
                    </div>
                    <div className="galaxy-card p-6">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <FileText size={16} className="text-blue-400" /> Other Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Shipping Policy</span>
                                <span className="text-gray-300">As soon as possible</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Responsible</span>
                                <span className="text-gray-300">Super Admin</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
