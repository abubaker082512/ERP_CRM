"use client";
import { fetchAPI } from '@/lib/api';

import { useState, useEffect } from 'react';
import InventoryHeader from '@/components/inventory/InventoryHeader';
import { Package, MoreHorizontal, TrendingUp, AlertTriangle, Warehouse, RefreshCw } from 'lucide-react';
import Link from 'next/link';

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

type StockQuant = {
    id: string;
    product_id: string;
    location_id: string;
    quantity: number;
    reserved_quantity: number;
};

const STATE_COLORS: Record<string, string> = {
    draft:   'bg-gray-500/20 text-gray-400',
    waiting: 'bg-yellow-500/20 text-yellow-400',
    ready:   'bg-blue-500/20 text-blue-400',
    done:    'bg-green-500/20 text-green-400',
    cancel:  'bg-red-500/20 text-red-400',
};

export default function InventoryPage() {
    const [moves, setMoves] = useState<StockMove[]>([]);
    const [quants, setQuants] = useState<StockQuant[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'moves' | 'stock'>('overview');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [movesRes, quantsRes] = await Promise.all([
                    fetchAPI("/inventory/moves"),
                    fetchAPI("/inventory/quants")
                ]);
                if (movesRes.ok) {
                    const data = await movesRes.json();
                    setMoves(Array.isArray(data) ? data : []);
                }
                if (quantsRes.ok) {
                    const data = await quantsRes.json();
                    setQuants(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Inventory fetch failed", err);
                setMoves([]);
                setQuants([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getMovesCount = (type?: string) => {
        // In a real app, we'd check move.picking_type_code or similar.
        // For now, we filter by state and just return the count.
        return moves.filter(m => m.state !== 'done' && m.state !== 'cancel').length;
    };

    const operations = [
        { id: 1, name: 'Receipts', warehouse: 'Main Warehouse', count: getMovesCount('in'), color: 'text-blue-500', icon: '📥' },
        { id: 2, name: 'Internal Transfers', warehouse: 'Main Warehouse', count: 0, color: 'text-orange-500', icon: '🔄' },
        { id: 3, name: 'Delivery Orders', warehouse: 'Main Warehouse', count: getMovesCount('out'), color: 'text-green-500', icon: '📦' },
        { id: 4, name: 'Returns', warehouse: 'Main Warehouse', count: 0, color: 'text-red-500', icon: '↩️' },
        { id: 5, name: 'Manufacturing', warehouse: 'Main Warehouse', count: 0, color: 'text-purple-500', icon: '🏭' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex-1 overflow-auto p-6">
                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-[#1E293B] rounded-lg p-1 w-fit">
                    {(['overview', 'moves', 'stock'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                                activeTab === tab
                                    ? 'bg-purple-600 text-white shadow'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab === 'overview' ? '📊 Overview' : tab === 'moves' ? '🔀 Transfers' : '📦 Stock Levels'}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-200 mb-6">Inventory Dashboard</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {operations.map((op) => (
                                 <div key={op.id} className="galaxy-card p-5 cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-2xl mb-2">{op.icon}</div>
                                            <h3 className={`font-semibold text-base ${op.color}`}>{op.name}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">{op.warehouse}</p>
                                        </div>
                                        <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('moves')}
                                        className="w-full bg-purple-600/10 hover:bg-purple-600 border border-purple-600/30 hover:border-purple-600 text-purple-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                    >
                                        {op.count} To Process
                                    </button>
                                </div>
                            ))}
                            
                            {/* Summary Stats Cards */}
                            <div className="galaxy-card p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-green-500/20 p-2 rounded-lg">
                                        <TrendingUp className="text-green-400" size={20} />
                                    </div>
                                    <h3 className="font-semibold text-gray-200">Stock Movements</h3>
                                </div>
                                <p className="text-3xl font-bold text-white">{loading ? '...' : moves.length}</p>
                                <p className="text-xs text-gray-400 mt-1">Total recorded transfers</p>
                            </div>
                            
                            <div className="galaxy-card p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-blue-500/20 p-2 rounded-lg">
                                        <Package className="text-blue-400" size={20} />
                                    </div>
                                    <h3 className="font-semibold text-gray-200">Stock Entries</h3>
                                </div>
                                <p className="text-3xl font-bold text-white">{loading ? '...' : quants.length}</p>
                                <p className="text-xs text-gray-400 mt-1">Product-location pairs tracked</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'moves' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-200">Stock Transfers</h2>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
                            >
                                <RefreshCw size={14} /> Refresh
                            </button>
                        </div>
                        <div className="galaxy-card overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-800 bg-[#0F172A]">
                                        <th className="px-6 py-3 text-left">Reference</th>
                                        <th className="px-6 py-3 text-left">Product ID</th>
                                        <th className="px-6 py-3 text-right">Quantity</th>
                                        <th className="px-6 py-3 text-center">State</th>
                                        <th className="px-6 py-3 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                                    ) : moves.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No stock movements found</td></tr>
                                    ) : moves.map(move => (
                                        <tr key={move.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                                            <td className="px-6 py-4 text-gray-400 font-medium">{move.name || '—'}</td>
                                            <td className="px-6 py-4">
                                                <Link href={`/inventory/products/${move.product_id}`} className="text-purple-400 hover:underline font-mono text-xs">
                                                    {move.product_id?.substring(0, 8)}...
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-right text-white font-semibold">{move.quantity}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATE_COLORS[move.state] || STATE_COLORS.draft}`}>
                                                    {move.state}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{move.date ? new Date(move.date).toLocaleDateString() : 'Draft'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'stock' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-200 mb-6">Current Stock Levels</h2>
                        <div className="galaxy-card overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-800 bg-[#0F172A]">
                                        <th className="px-6 py-3 text-left">Product ID</th>
                                        <th className="px-6 py-3 text-left">Location ID</th>
                                        <th className="px-6 py-3 text-right">On Hand</th>
                                        <th className="px-6 py-3 text-right">Reserved</th>
                                        <th className="px-6 py-3 text-right">Available</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                                    ) : quants.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No stock data found</td></tr>
                                    ) : quants.map(q => (
                                        <tr key={q.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                                            <td className="px-6 py-4">
                                                <Link href={`/inventory/products/${q.product_id}`} className="text-purple-400 hover:underline font-mono text-xs">
                                                    {q.product_id?.substring(0, 8)}...
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 font-mono text-xs">{q.location_id?.substring(0, 8)}...</td>
                                            <td className="px-6 py-4 text-right font-bold text-white">{q.quantity}</td>
                                            <td className="px-6 py-4 text-right text-yellow-400">{q.reserved_quantity}</td>
                                            <td className="px-6 py-4 text-right text-green-400">{q.quantity - q.reserved_quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
