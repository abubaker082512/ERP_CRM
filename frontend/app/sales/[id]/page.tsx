"use client";
import { fetchAPI } from '@/lib/api';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SalesHeader from '@/components/sales/SalesHeader';
import { ArrowLeft, Save, Trash2, DollarSign, User, Package, FileText } from 'lucide-react';
import Link from 'next/link';

type SalesOrderLine = {
    id: string;
    name: string;
    product_uom_qty: number;
    price_unit: number;
    price_subtotal: number;
};

type SalesOrder = {
    id: string;
    name: string;
    customer_name: string;
    state: string;
    amount_total: number;
    date_order: string;
    lines?: SalesOrderLine[];
};

const STATE_BADGES: Record<string, string> = {
    draft:    'bg-gray-500/20 text-gray-400',
    sent:     'bg-blue-500/20 text-blue-400',
    sale:     'bg-green-500/20 text-green-400',
    done:     'bg-purple-500/20 text-purple-400',
    cancel:   'bg-red-500/20 text-red-400',
};

export default function SalesOrderDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [order, setOrder] = useState<SalesOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetchAPI(`/sales/${id}`);
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                setOrder(await res.json());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleSave = async () => {
        if (!order) return;
        setSaving(true);
        setError(null);
        try {
            const payload = {
                name: order.name,
                customer_name: order.customer_name,
                state: order.state,
                amount_total: order.amount_total,
            };
            const res = await fetchAPI(`/sales/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const detail = await res.json();
                throw new Error(detail.detail || `HTTP ${res.status}`);
            }
            const updated = await res.json();
            setOrder({ ...updated, lines: order.lines });
            alert("✅ Sales order saved successfully!");
        } catch (err: any) {
            setError(`Save failed: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this sales order?")) return;
        try {
            const res = await fetchAPI(`/sales/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Delete failed");
        } catch (err: any) {
            alert(`Error: ${err.message}`);
            return;
        }
        router.push('/sales');
    };

    if (loading) return <div className="h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>;

    if (error && !order) return (
        <div className="h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4">
            <p className="text-red-400 text-lg">⚠️ {error}</p>
            <Link href="/sales" className="text-purple-400 hover:underline">← Back to Sales</Link>
        </div>
    );

    if (!order) return <div className="p-8 text-white">Order not found.</div>;

    return (
        <div className="flex flex-col min-h-screen bg-[#0F172A] text-white">
            <SalesHeader />
            <div className="p-6 max-w-5xl mx-auto w-full">
                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/sales" className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{order.name}</h1>
                            <span className={`mt-1 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATE_BADGES[order.state] || STATE_BADGES.draft}`}>
                                {order.state?.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition"
                        >
                            <Trash2 size={16} /> Cancel Order
                        </button>
                        {(order.state === 'draft' || order.state === 'sent') && (
                            <button
                                onClick={async () => {
                                    setSaving(true);
                                    try {
                                        const res = await fetchAPI(`/sales/${id}/confirm`, { method: 'POST' });
                                        if (!res.ok) {
                                            const detail = await res.json();
                                            throw new Error(detail.detail || 'Failed to confirm');
                                        }
                                        setOrder(await res.json());
                                        alert("✅ Order Confirmed! Invoice and Delivery created.");
                                    } catch (err: any) {
                                        setError(`Confirm failed: ${err.message}`);
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-green-500/20"
                            >
                                Confirm Order
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition"
                        >
                            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="col-span-2 space-y-6">
                        <div className="bg-[#1E293B] border border-gray-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold border-b border-gray-800 pb-4 mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-purple-400" /> Order Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Order Reference</label>
                                    <input
                                        type="text"
                                        value={order.name}
                                        onChange={e => setOrder({...order, name: e.target.value})}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Customer Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            value={order.customer_name || ''}
                                            onChange={e => setOrder({...order, customer_name: e.target.value})}
                                            className="w-full bg-[#0F172A] border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Lines */}
                        <div className="bg-[#1E293B] border border-gray-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold border-b border-gray-800 pb-4 mb-4 flex items-center gap-2">
                                <Package size={18} className="text-blue-400" /> Order Lines
                            </h2>
                            {order.lines && order.lines.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-xs text-gray-400 uppercase border-b border-gray-800">
                                                <th className="py-3 text-left">Product</th>
                                                <th className="py-3 text-right">Qty</th>
                                                <th className="py-3 text-right">Unit Price</th>
                                                <th className="py-3 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.lines.map(line => (
                                                <tr key={line.id} className="border-b border-gray-800/50">
                                                    <td className="py-3 text-gray-200">{line.name}</td>
                                                    <td className="py-3 text-right text-gray-300">{line.product_uom_qty}</td>
                                                    <td className="py-3 text-right text-gray-300">${line.price_unit.toFixed(2)}</td>
                                                    <td className="py-3 text-right font-semibold text-white">${line.price_subtotal.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No order lines added.</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <div className="bg-[#1E293B] border border-gray-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold border-b border-gray-800 pb-4 mb-4">Order Status</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Status</label>
                                    <select
                                        value={order.state}
                                        onChange={e => setOrder({...order, state: e.target.value})}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        <option value="draft">Draft / Quotation</option>
                                        <option value="sent">Quotation Sent</option>
                                        <option value="sale">Sales Order</option>
                                        <option value="done">Locked</option>
                                        <option value="cancel">Cancelled</option>
                                    </select>
                                </div>
                                <div className="pt-4 border-t border-gray-800">
                                    <label className="block text-sm text-gray-400 mb-1">Order Total</label>
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={20} className="text-green-400" />
                                        <span className="text-2xl font-bold text-white">{order.amount_total.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Order Date</label>
                                    <p className="text-sm text-gray-300">{new Date(order.date_order).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
