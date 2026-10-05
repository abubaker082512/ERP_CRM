"use client";
import { fetchAPI } from "@/lib/api";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useEffect, useState } from "react";
import { BarChart3, CheckCircle, Package, DollarSign, ArrowRight, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MENU_ITEMS = [
    { name: "Quotations", href: "/sales" },
    { name: "Orders", href: "/sales/orders" },
    { name: "Customers", href: "/sales/customers" },
    { name: "Products", href: "/sales/products" },
    { name: "Reporting", href: "/sales/reporting" },
    { name: "Configuration", href: "/sales/configuration" },
];

type Order = {
    id: string;
    name: string;
    customer_name?: string;
    amount_total: number;
    state: string;
    date_order?: string;
    created_at: string;
};

export default function SalesOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentView, setCurrentView] = useState<ViewType>("list");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI("/sales");
            if (res.ok) {
                const data = await res.json();
                // Filter for confirmed sales orders or show all
                const all = Array.isArray(data) ? data : [];
                setOrders(all);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const confirmedOrders = orders.filter(o => o.state === 'sale');
    const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (o.amount_total || 0), 0);

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Sales"
                moduleIcon={<BarChart3 size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search orders..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Sales Orders</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {confirmedOrders.length} confirmed orders • ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total revenue
                            </p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                    <Link
                        href="/sales/quotations/new"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-md shadow-purple-900/30 transition-all cursor-pointer"
                    >
                        + New Order
                    </Link>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Total Quotations & Orders</span>
                            <Package size={16} className="text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{orders.length}</div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Confirmed Revenue</span>
                            <DollarSign size={16} className="text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Confirmed Sales</span>
                            <CheckCircle size={16} className="text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {confirmedOrders.length}
                        </div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Draft / Pending</span>
                            <FileText size={16} className="text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {orders.filter(o => o.state !== 'sale').length}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : currentView === "list" ? (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden shadow-xl">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Order #</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Order Date</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr
                                        key={order.id}
                                        onClick={() => router.push(`/sales/${order.id}`)}
                                        className="border-b border-gray-700/60 hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-3 font-semibold text-white">{order.name || order.id}</td>
                                        <td className="px-4 py-3 text-gray-300 font-medium">{order.customer_name || "Customer"}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${(order.amount_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                                                order.state === 'sale' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                order.state === 'sent' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                            }`}>
                                                {order.state === 'sale' ? 'Confirmed (Sale)' : order.state}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(order.date_order || order.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center justify-end gap-1">
                                                View <ArrowRight size={14} />
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                            No sales orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['draft', 'sent', 'sale'].map(status => {
                            const filtered = orders.filter(o => o.state === status || (status === 'draft' && !['sent', 'sale'].includes(o.state)));
                            const statusLabel = status === 'sale' ? 'Confirmed Sale' : status.toUpperCase();

                            return (
                                <div key={status} className="bg-[#1E293B]/70 rounded-lg p-4 border border-gray-700 flex flex-col">
                                    <h3 className="font-semibold text-white mb-3 pb-2 border-b border-gray-700 capitalize">{statusLabel}</h3>
                                    <div className="space-y-3 flex-1">
                                        {filtered.map(order => (
                                            <div
                                                key={order.id}
                                                onClick={() => router.push(`/sales/${order.id}`)}
                                                className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-all cursor-pointer shadow"
                                            >
                                                <div className="font-semibold text-white mb-1">{order.name || order.id}</div>
                                                <div className="text-sm text-gray-400 mb-2">{order.customer_name || "Customer"}</div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-green-400 font-bold">${(order.amount_total || 0).toLocaleString()}</span>
                                                    <span className="text-xs text-gray-500">{new Date(order.date_order || order.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
