"use client";
import { fetchAPI } from '@/lib/api';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ManufacturingHeader from "@/components/manufacturing/ManufacturingHeader";
import { ArrowLeft, Wrench, Package, Clock, CheckCircle, BarChart3, ListChecks } from "lucide-react";

type ProductionOrder = {
    id: string;
    name: string;
    product_id: string;
    product_qty: number;
    state: string;
    date_planned_start: string;
    date_planned_finished?: string;
};

type BOMRow = {
    product_id: string;
    product_qty: number;
};

export default function ManufacturingDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<ProductionOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetchAPI(`/mrp/production/${id}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                setOrder(data);
                setLoading(false);
            })
            .catch(console.error);
    }, [id]);

    if (loading) return <div className="p-8 text-white bg-[#0F172A] h-screen">Loading...</div>;
    if (!order) return <div className="p-8 text-white bg-[#0F172A] h-screen">Manufacturing Order not found.</div>;

    return (
        <div className="flex flex-col h-screen bg-[#0F172A] text-gray-200">
            <ManufacturingHeader />
            
            <div className="flex-1 overflow-auto p-6 max-w-6xl mx-auto w-full">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={18} /> Back to Manufacturing
                </button>

                <div className="bg-[#1E293B] border border-gray-700 rounded-xl overflow-hidden shadow-xl mb-6">
                    <div className="p-6 border-b border-gray-700 bg-[#1E293B]/50 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">{order.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Package size={14} /> 
                                <span>Product ID: {order.product_id}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                order.state === 'done' ? 'bg-green-500/20 text-green-400' : 
                                order.state === 'progress' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-gray-700 text-gray-300'
                            }`}>
                                {order.state}
                            </span>
                            <p className="text-xs text-gray-500">Planned finished: {order.date_planned_finished || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 border-b border-gray-800">
                        <div className="bg-[#0F172A]/50 p-4 rounded-lg border border-gray-800">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">To Produce</label>
                            <p className="text-2xl font-bold text-white">{order.product_qty}</p>
                            <p className="text-xs text-gray-400">Units</p>
                        </div>
                        <div className="bg-[#0F172A]/50 p-4 rounded-lg border border-gray-800">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Produced</label>
                            <p className="text-2xl font-bold text-green-400">{order.state === 'done' ? order.product_qty : 0}</p>
                            <p className="text-xs text-gray-400">Units</p>
                        </div>
                        <div className="bg-[#0F172A]/50 p-4 rounded-lg border border-gray-800">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Start Date</label>
                            <p className="text-sm font-bold text-white mt-1">{new Date(order.date_planned_start).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-400">{new Date(order.date_planned_start).toLocaleTimeString()}</p>
                        </div>
                        <div className="bg-[#0F172A]/50 p-4 rounded-lg border border-gray-800">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Priority</label>
                            <p className="text-sm font-bold text-orange-400 mt-1 uppercase">Normal</p>
                            <p className="text-xs text-gray-400">Lead time: 2 days</p>
                        </div>
                    </div>

                    <div className="p-8">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <ListChecks size={20} className="text-orange-500" /> Components / Bill of Materials
                        </h2>
                        
                        <div className="bg-[#0F172A]/50 rounded-lg border border-gray-800 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-gray-500 uppercase border-b border-gray-800 bg-[#1E293B]">
                                        <th className="px-6 py-3 text-left">Component</th>
                                        <th className="px-6 py-3 text-right">To Consume</th>
                                        <th className="px-6 py-3 text-right">Consumed</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    <tr className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-300">Raw Material Alpha</td>
                                        <td className="px-6 py-4 text-right">{order.product_qty * 2}</td>
                                        <td className="px-6 py-4 text-right">{order.state === 'done' ? order.product_qty * 2 : 0}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-green-500 text-xs font-bold uppercase">Available</span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-300">Raw Material Beta</td>
                                        <td className="px-6 py-4 text-right">{order.product_qty * 5}</td>
                                        <td className="px-6 py-4 text-right">{order.state === 'done' ? order.product_qty * 5 : 0}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-green-500 text-xs font-bold uppercase">Available</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="p-6 bg-[#0F172A]/50 border-t border-gray-700 flex justify-end gap-3">
                        {order.state === 'draft' && (
                            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all">
                                Confirm
                            </button>
                        )}
                        {order.state === 'progress' && (
                            <button className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-all">
                                Mark as Done
                            </button>
                        )}
                        <button className="px-6 py-2 border border-gray-600 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all">
                            Print Label
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
