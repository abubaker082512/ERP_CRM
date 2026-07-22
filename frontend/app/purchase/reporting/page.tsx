"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import PurchaseHeader from '@/components/purchase/PurchaseHeader';
import { TrendingUp, ShoppingCart, Percent, ArrowUpRight } from 'lucide-react';

type PurchaseOrder = {
    id: string;
    name: string;
    amount_total: number;
    state: string;
};

export default function PurchaseReportingPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetchAPI("/purchase");
            if (res.ok) setOrders(await res.json());
        } catch (error) {
            console.error("Failed to fetch purchase orders", error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrencySymbol = () => {
        if (typeof window !== "undefined") {
            const cur = localStorage.getItem("settings_currency") || "USD";
            const symbols: Record<string, string> = {
                USD: "$", EUR: "€", GBP: "£", AUD: "$", CAD: "$", JPY: "¥", PKR: "₨", INR: "₹"
            };
            return symbols[cur] || "$";
        }
        return "$";
    };

    const currencySymbol = getCurrencySymbol();

    const confirmedOrders = orders.filter(o => o.state === 'purchase' || o.state === 'done');
    const totalProcurementSpent = confirmedOrders.reduce((sum, o) => sum + (o.amount_total || 0), 0);
    const avgOrderCost = confirmedOrders.length > 0 ? totalProcurementSpent / confirmedOrders.length : 0;
    const rfqCount = orders.filter(o => o.state === 'draft' || o.state === 'sent').length;

    return (
        <div className="flex flex-col h-screen bg-[#0B101E] text-white">
            <PurchaseHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-200">Purchase Reporting & Analytics</h2>
                    <p className="text-xs text-gray-400 mt-1">Analyze supplier expenditure, procurement cost metrics, and outstanding quotations.</p>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-12">Calculating analytics...</div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-purple-900/10 border border-purple-500/15 rounded-2xl p-5">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Total Procurement Expenditure</p>
                                <p className="text-2xl font-bold text-white mt-1.5">{currencySymbol}{totalProcurementSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1 mt-1">
                                    All validated purchase orders
                                </span>
                            </div>
                            <div className="bg-[#1E293B] border border-gray-800 rounded-2xl p-5">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Average Procurement Cost</p>
                                <p className="text-2xl font-bold text-white mt-1.5">{currencySymbol}{avgOrderCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                                    Average per supplier invoice
                                </span>
                            </div>
                            <div className="bg-[#1E293B] border border-gray-800 rounded-2xl p-5">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Outstanding RFQs / Drafts</p>
                                <p className="text-2xl font-bold text-white mt-1.5">{rfqCount} items</p>
                                <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-1 mt-1">
                                    Pending validation
                                </span>
                            </div>
                        </div>

                        <div className="bg-[#0F172A] border border-gray-800 rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-gray-300 mb-6">Recent Spendings per Purchase Order</h4>
                            <div className="space-y-4">
                                {confirmedOrders.length === 0 ? (
                                    <p className="text-xs text-gray-500 text-center py-6">No validated purchase orders found to analyze.</p>
                                ) : (
                                    confirmedOrders.slice(0, 5).map((o, index) => {
                                        const pct = Math.min(100, (o.amount_total / (totalProcurementSpent || 1)) * 100);
                                        return (
                                            <div key={index} className="space-y-2">
                                                <div className="flex justify-between text-xs font-semibold text-gray-300">
                                                    <span>{o.name}</span>
                                                    <span>{currencySymbol}{o.amount_total.toFixed(2)}</span>
                                                </div>
                                                <div className="w-full bg-[#1E293B] h-2.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                                                        style={{ width: `${Math.max(5, pct)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
