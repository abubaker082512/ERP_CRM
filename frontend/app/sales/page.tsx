"use client";

import { useState, useEffect } from 'react';
import SalesHeader from '@/components/sales/SalesHeader';
import { Plus, Settings, Clock, MoreHorizontal, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

type SalesOrder = {
    id: string;
    name: string;
    customer_name: string;
    date_order: string;
    amount_total: number;
    state: string;
};

export default function SalesPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<SalesOrder[]>([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/sales');
            if (res.ok) setOrders(await res.json());
        } catch (error) {
            console.error("Failed to fetch orders", error);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <SalesHeader />

            <div className="flex-1 overflow-auto p-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push('/sales/quotations/new')}
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
                                <th className="px-6 py-3">Number</th>
                                <th className="px-6 py-3">Creation Date</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Salesperson</th>
                                <th className="px-6 py-3">Activities</th>
                                <th className="px-6 py-3 text-right">Total</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((q) => (
                                <tr key={q.id} className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer">
                                    <td className="px-6 py-4 font-medium text-white">{q.name}</td>
                                    <td className="px-6 py-4">{new Date(q.date_order).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{q.customer_name}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">A</div>
                                        <span>Mitchell Admin</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Clock size={16} className="text-gray-500" />
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-white">${q.amount_total.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${q.state === 'sale' ? 'bg-green-500/20 text-green-400' :
                                                q.state === 'sent' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {q.state}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
