"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import PurchaseHeader from '@/components/purchase/PurchaseHeader';
import { Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PurchaseOrder = {
    id: string;
    name: string;
    partner_id: string;
    date_order: string;
    amount_total: number;
    state: string;
};

export default function PurchaseOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetchAPI("/purchase");
            if (res.ok) {
                const data = await res.json();
                // Filter to only confirmed purchase orders
                const confirmed = data.filter((o: any) => o.state === 'purchase' || o.state === 'done');
                setOrders(confirmed);
            }
        } catch (error) {
            console.error("Failed to fetch purchase orders", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0B101E] text-white">
            <PurchaseHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-200">Confirmed Purchase Orders</h2>
                        <p className="text-xs text-gray-400 mt-1">Confirmed orders sent to suppliers and waiting for receipt validation.</p>
                    </div>
                </div>

                {/* List View */}
                <div className="galaxy-card overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-[#0F172A] border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Reference</th>
                                <th className="px-6 py-4">Vendor ID</th>
                                <th className="px-6 py-4">Order Date</th>
                                <th className="px-6 py-4">Activities</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No confirmed purchase orders found. Go to RFQs to validate a draft request!
                                    </td>
                                </tr>
                            ) : (
                                orders.map((o) => (
                                    <tr key={o.id} onClick={() => router.push(`/purchase/${o.id}`)} className="hover:bg-white/5 cursor-pointer transition-colors">
                                        <td className="px-6 py-4 font-semibold text-purple-400 hover:underline">{o.name}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-400">{o.partner_id}</td>
                                        <td className="px-6 py-4 text-gray-300">{new Date(o.date_order).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <Clock size={16} className="text-gray-500" />
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-white">${o.amount_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                                                {o.state}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
