"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Package, ArrowLeft, Clock, MapPin, Activity, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

type Product = {
    id: string;
    name: string;
    description: string;
    list_price: number;
    cost_price: number;
    sku: string;
};

type StockMove = {
    id: string;
    name: string;
    quantity: number;
    state: string;
    created_at: string;
    location_id: string;
    location_dest_id: string;
};

type StockQuant = {
    id: string;
    quantity: number;
    location_id: string;
};

export default function ProductAuditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [moves, setMoves] = useState<StockMove[]>([]);
    const [quants, setQuants] = useState<StockQuant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, stockRes] = await Promise.all([
                fetchAPI(`/products/${params.id}`),
                fetchAPI(`/products/${params.id}/stock`)
            ]);

            if (prodRes.ok && stockRes.ok) {
                setProduct(await prodRes.json());
                const stockData = await stockRes.json();
                setMoves(Array.isArray(stockData.moves) ? stockData.moves : []);
                setQuants(Array.isArray(stockData.quants) ? stockData.quants : []);
            } else {
                setError("Failed to load product audit data");
                setMoves([]);
                setQuants([]);
            }
        } catch (e) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    const totalStock = quants.reduce((sum, q) => sum + (q.quantity || 0), 0);

    if (loading) return <div className="p-8 text-white">Loading product trace...</div>;
    if (error || !product) return <div className="p-8 text-red-400">{error || "Product not found"}</div>;

    return (
        <div className="min-h-screen bg-[#0F172A] text-white">
            {/* Header */}
            <div className="bg-[#1E293B] border-b border-gray-700/60 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-400" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-100">{product.name}</h1>
                            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-700 font-mono">
                                {product.sku || 'NO-SKU'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Inventory Traceability Audit</p>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Product Summary & Current Stock */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="bg-[#1E293B] rounded-xl border border-gray-800 p-6 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <MapPin size={16} /> Current Locations
                        </h2>
                        
                        <div className="mb-6 flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                            <div>
                                <p className="text-xs text-blue-400 font-medium">Total On Hand</p>
                                <p className="text-3xl font-bold text-blue-300">{totalStock}</p>
                            </div>
                            <Package size={32} className="text-blue-500/50" />
                        </div>

                        {quants.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No physical stock recorded in any location.</p>
                        ) : (
                            <div className="space-y-3">
                                {quants.map(q => (
                                    <div key={q.id} className="flex items-center justify-between p-3 bg-[#0F172A] border border-gray-700/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-sm font-medium text-gray-300">WH/Stock</span>
                                        </div>
                                        <span className="font-mono text-gray-200">{q.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-[#1E293B] rounded-xl border border-gray-800 p-6 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Financial Info</h2>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between border-b border-gray-700/50 pb-2">
                                <span className="text-gray-500">Sales Price</span>
                                <span className="text-gray-200">${product.list_price?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700/50 pb-2">
                                <span className="text-gray-500">Cost Price</span>
                                <span className="text-gray-200">${product.cost_price?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Inventory Value</span>
                                <span className="text-green-400 font-medium">${((product.cost_price || 0) * totalStock).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Historical Moves (Audit Log) */}
                <div className="lg:col-span-2">
                    <div className="bg-[#1E293B] rounded-xl border border-gray-800 p-6 shadow-sm min-h-[500px]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Activity size={16} /> Stock Move History
                            </h2>
                            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full border border-gray-700">
                                {moves.length} records
                            </span>
                        </div>

                        {moves.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                                <Clock size={40} className="mb-3 opacity-20" />
                                <p>No historical moves found for this product.</p>
                            </div>
                        ) : (
                            <div className="relative border-l border-gray-700 ml-4 space-y-6 pb-4">
                                {moves.map((move, idx) => {
                                    const isDone = move.state === 'done';
                                    const isOut = move.name?.startsWith('OUT');
                                    const isCancel = move.state === 'cancel';

                                    return (
                                        <div key={move.id} className="relative pl-6">
                                            {/* Timeline dot */}
                                            <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-[#1E293B] flex items-center justify-center 
                                                ${isCancel ? 'bg-red-500' : isDone ? 'bg-green-500' : 'bg-blue-500'}
                                            `}>
                                            </span>

                                            <div className="bg-[#0F172A] border border-gray-700/50 p-4 rounded-lg hover:border-gray-600 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-200">{move.name || 'Manual Move'}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold
                                                            ${isCancel ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                                              isDone ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                                              'bg-blue-500/10 text-blue-400 border border-blue-500/20'}
                                                        `}>
                                                            {move.state}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(move.created_at).toLocaleString()}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-8 mt-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 block text-[10px] uppercase tracking-wider mb-0.5">Quantity</span>
                                                        <span className={`font-mono font-bold ${isOut ? 'text-red-400' : 'text-green-400'}`}>
                                                            {isOut ? '-' : '+'}{move.quantity || 0}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block text-[10px] uppercase tracking-wider mb-0.5">From Location</span>
                                                        <span className="text-gray-300 font-mono text-xs">{move.location_id?.substring(0, 8) || 'Partners/Vendors'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block text-[10px] uppercase tracking-wider mb-0.5">To Location</span>
                                                        <span className="text-gray-300 font-mono text-xs">{move.location_dest_id?.substring(0, 8) || 'WH/Stock'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
