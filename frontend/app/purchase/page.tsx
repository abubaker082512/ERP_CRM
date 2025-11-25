"use client";

import { useState, useEffect } from 'react';
import PurchaseHeader from '@/components/purchase/PurchaseHeader';
import { Plus, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PurchaseOrder = {
    id: string;
    name: string;
    partner_id: string; // Ideally fetch name
    date_order: string;
    amount_total: number;
    state: string;
};

export default function PurchasePage() {
    const router = useRouter();
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/purchase');
            if (res.ok) setOrders(await res.json());
        } catch (error) {
            console.error("Failed to fetch purchase orders", error);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <PurchaseHeader />

            <div className="flex-1 overflow-auto p-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push('/purchase/rfq/new')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-sm font-medium"
                        >
                            New
                        </button>
                    </div>
                </div>

                {/* List View */}
                <div className="bg-[#1E293B] rounded border border-gray-700 overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-200 uppercase bg-[#0F172A] border-b border-gray-700">
                            <tr>
                                <th className="px-6 py-3">Reference</th>
                                <th className="px-6 py-3">Vendor</th>
                                <th className="px-6 py-3">Order Date</th>
                                <th className="px-6 py-3">Activities</th>
                                <th className="px-6 py-3 text-right">Total</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o.id} className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer">
                                    <td className="px-6 py-4 font-medium text-white">{o.name}</td>
                                    <td className="px-6 py-4">{o.partner_id}</td> {/* Needs enrichment */}
                                    <td className="px-6 py-4">{new Date(o.date_order).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <Clock size={16} className="text-gray-500" />
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-white">${o.amount_total.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${o.state === 'purchase' ? 'bg-green-500/20 text-green-400' :
                                                o.state === 'sent' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {o.state}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No purchase orders found. Create one to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
