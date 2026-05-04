"use client";
import { fetchAPI } from '@/lib/api';

import { useState, useEffect } from 'react';
import SalesHeader from '@/components/sales/SalesHeader';
import { Clock } from 'lucide-react';
import Link from 'next/link';
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
            const res = await fetchAPI("/sales");
            if (res.ok) {
                const data = await res.json();
                setOrders(Array.isArray(data) ? data : []);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
            setOrders([]);
        }
    };

    return (
        <div className="space-y-6">

            <div className="flex-1 overflow-auto p-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Sales Orders</h2>
                        <p className="text-gray-500 text-sm">Manage quotations and confirmed orders</p>
                    </div>
                    <button
                        onClick={() => router.push('/sales/quotations/new')}
                        className="galaxy-btn-primary"
                    >
                        Create New Order
                    </button>
                </div>

                {/* List View */}
                <div className="galaxy-card overflow-hidden">
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
                                <tr key={q.id} className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer" onClick={() => router.push(`/sales/${q.id}`)}>
                                    <td className="px-6 py-4 font-medium text-white text-purple-400 hover:underline">{q.name}</td>
                                    <td className="px-6 py-4">{new Date(q.date_order).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{q.customer_name}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">A</div>
                                        <span>Admin</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Clock size={16} className="text-gray-500" />
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-white">${q.amount_total.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            q.state === 'sale' ? 'bg-green-500/20 text-green-400' :
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
