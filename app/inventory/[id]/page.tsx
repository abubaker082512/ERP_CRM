"use client";
import { fetchAPI } from '@/lib/api';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InventoryHeader from "@/components/inventory/InventoryHeader";
import { ArrowLeft, Package, Clock, MapPin, Tag } from "lucide-react";

type StockMove = {
    id: string;
    name: string;
    product_id: string;
    quantity: number;
    state: string;
    date: string;
    location_id: string;
    location_dest_id: string;
};

export default function InventoryDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [move, setMove] = useState<StockMove | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetchAPI(`/inventory/moves/${id}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                setMove(data);
                setLoading(false);
            })
            .catch(console.error);
    }, [id]);

    if (loading) return <div className="p-8 text-white">Loading...</div>;
    if (!move) return <div className="p-8 text-white">Stock movement not found.</div>;

    return (
        <div className="flex flex-col h-screen bg-[#0F172A] text-gray-200">
            <InventoryHeader />
            
            <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={18} /> Back to Inventory
                </button>

                <div className="bg-[#1E293B] border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-gray-700 bg-[#1E293B]/50 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">{move.name || "Stock Movement"}</h1>
                            <p className="text-sm text-gray-400">ID: {move.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            move.state === 'done' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                            {move.state}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <Package className="text-purple-400 mt-1" size={20} />
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold tracking-widest block mb-1">Product</label>
                                    <p className="text-lg font-medium text-white">{move.product_id}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Tag className="text-blue-400 mt-1" size={20} />
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold tracking-widest block mb-1">Quantity</label>
                                    <p className="text-2xl font-bold text-white">{move.quantity}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <MapPin className="text-orange-400 mt-1" size={20} />
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold tracking-widest block mb-1">From Location</label>
                                    <p className="text-sm text-gray-300">{move.location_id || "Supplier Location"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="text-green-400 mt-1" size={20} />
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold tracking-widest block mb-1">To Location</label>
                                    <p className="text-sm text-gray-300">{move.location_dest_id || "Main Warehouse"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="text-gray-400 mt-1" size={20} />
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold tracking-widest block mb-1">Date</label>
                                    <p className="text-sm text-gray-300">{new Date(move.date).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {move.state !== 'done' && (
                        <div className="p-6 bg-[#0F172A]/50 border-t border-gray-700 flex justify-end gap-3">
                            <button className="px-6 py-2 border border-gray-600 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all">
                                Cancel
                            </button>
                            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-purple-900/20 transition-all">
                                Validate
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
