"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Users, Package, BarChart2, RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';

type DashboardSummary = {
    kpis: {
        quotations: number;
        orders: number;
        revenue: number;
        avg_order: number;
        pipeline_value: number;
        won_deals: number;
        pending_moves: number;
    };
    chart_data: { month: string; value: number }[];
    recent_orders: { id: string; name: string; customer: string; amount: number; state: string }[];
    recent_leads: { id: string; name: string; stage: string; revenue: number }[];
};

const STATE_COLORS: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    sent: 'bg-blue-500/20 text-blue-400',
    sale: 'bg-green-500/20 text-green-400',
    done: 'bg-purple-500/20 text-purple-400',
    cancel: 'bg-red-500/20 text-red-400',
};

const STAGE_COLORS: Record<string, string> = {
    New: 'bg-blue-500/20 text-blue-400',
    Qualified: 'bg-yellow-500/20 text-yellow-400',
    Proposition: 'bg-orange-500/20 text-orange-400',
    Won: 'bg-green-500/20 text-green-400',
};

function fmt(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toLocaleString()}`;
}

export default function DashboardPage() {
    const router = useRouter();
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchDashboard();
    }, [router]);

    const fetchDashboard = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetchAPI('/dashboard/summary');
            if (res.ok) {
                setSummary(await res.json());
            } else {
                setError('Failed to load dashboard data');
            }
        } catch (e) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const kpis = summary?.kpis;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        Executive Overview <Sparkles className="text-purple-400" size={18} />
                    </h1>
                    <p className="text-gray-500 text-sm">Real-time system performance and business metrics</p>
                </div>
                <button
                    onClick={fetchDashboard}
                    className="galaxy-btn-primary !py-1.5 !px-4 text-sm flex items-center gap-2"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Syncing...' : 'Sync Data'}
                </button>
            </div>
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                        {error} — showing cached or empty state.
                    </div>
                )}

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard
                        label="Quotations"
                        value={loading ? '...' : String(kpis?.quotations ?? 0)}
                        icon={<ShoppingCart size={20} />}
                        color="text-blue-400"
                        bg="bg-blue-500/10"
                        href="/sales"
                    />
                    <KpiCard
                        label="Sales Orders"
                        value={loading ? '...' : String(kpis?.orders ?? 0)}
                        icon={<ShoppingCart size={20} />}
                        color="text-green-400"
                        bg="bg-green-500/10"
                        href="/sales"
                    />
                    <KpiCard
                        label="Total Revenue"
                        value={loading ? '...' : fmt(kpis?.revenue ?? 0)}
                        icon={<DollarSign size={20} />}
                        color="text-purple-400"
                        bg="bg-purple-500/10"
                        href="/accounting"
                    />
                    <KpiCard
                        label="Avg. Order Value"
                        value={loading ? '...' : fmt(kpis?.avg_order ?? 0)}
                        icon={<TrendingUp size={20} />}
                        color="text-orange-400"
                        bg="bg-orange-500/10"
                        href="/sales"
                    />
                    <KpiCard
                        label="CRM Pipeline"
                        value={loading ? '...' : fmt(kpis?.pipeline_value ?? 0)}
                        icon={<Users size={20} />}
                        color="text-pink-400"
                        bg="bg-pink-500/10"
                        href="/crm"
                    />
                    <KpiCard
                        label="Deals Won"
                        value={loading ? '...' : String(kpis?.won_deals ?? 0)}
                        icon={<TrendingUp size={20} />}
                        color="text-green-400"
                        bg="bg-green-500/10"
                        href="/crm"
                    />
                    <KpiCard
                        label="Pending Deliveries"
                        value={loading ? '...' : String(kpis?.pending_moves ?? 0)}
                        icon={<Package size={20} />}
                        color="text-yellow-400"
                        bg="bg-yellow-500/10"
                        href="/inventory"
                    />
                    <KpiCard
                        label="Active Modules"
                        value="15+"
                        icon={<BarChart2 size={20} />}
                        color="text-gray-400"
                        bg="bg-gray-500/10"
                        href="/apps"
                    />
                </div>

                {/* ── Revenue Chart ── */}
                <div className="galaxy-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-100">Revenue Over Time</h3>
                        <span className="text-xs text-gray-500">Confirmed Sales Orders</span>
                    </div>
                    {loading ? (
                        <div className="h-[280px] flex items-center justify-center text-gray-500">Loading chart...</div>
                    ) : (summary?.chart_data?.length ?? 0) === 0 ? (
                        <div className="h-[280px] flex flex-col items-center justify-center text-gray-500 gap-2">
                            <BarChart2 size={40} className="opacity-30" />
                            <p>No revenue data yet. Confirm a Sales Order to see it here.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={summary!.chart_data}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis dataKey="month" stroke="#6B7280" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #374151', borderRadius: 8 }}
                                    labelStyle={{ color: '#F8FAFC' }}
                                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* ── Recent Orders & Leads ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Sales Orders */}
                    <div className="galaxy-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-200">Recent Sales Orders</h3>
                            <Link href="/sales" className="text-xs text-purple-400 hover:text-purple-300">View All →</Link>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                                    <th className="pb-2 text-left">Reference</th>
                                    <th className="pb-2 text-left">Customer</th>
                                    <th className="pb-2 text-right">Amount</th>
                                    <th className="pb-2 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} className="py-6 text-center text-gray-500">Loading...</td></tr>
                                ) : (summary?.recent_orders?.length ?? 0) === 0 ? (
                                    <tr><td colSpan={4} className="py-6 text-center text-gray-500">No sales orders yet</td></tr>
                                ) : summary!.recent_orders.map(order => (
                                    <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                                        <td className="py-3">
                                            <Link href={`/sales/${order.id}`} className="text-purple-400 hover:text-purple-300 font-medium">
                                                {order.name || 'Draft'}
                                            </Link>
                                        </td>
                                        <td className="py-3 text-gray-400 truncate max-w-[100px]">{order.customer || '—'}</td>
                                        <td className="py-3 text-right text-white font-medium">{fmt(order.amount || 0)}</td>
                                        <td className="py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATE_COLORS[order.state] || STATE_COLORS.draft}`}>
                                                {order.state}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Recent CRM Leads */}
                    <div className="galaxy-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-200">CRM Pipeline</h3>
                            <Link href="/crm" className="text-xs text-purple-400 hover:text-purple-300">View Kanban →</Link>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                                    <th className="pb-2 text-left">Opportunity</th>
                                    <th className="pb-2 text-center">Stage</th>
                                    <th className="pb-2 text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={3} className="py-6 text-center text-gray-500">Loading...</td></tr>
                                ) : (summary?.recent_leads?.length ?? 0) === 0 ? (
                                    <tr><td colSpan={3} className="py-6 text-center text-gray-500">No leads yet</td></tr>
                                ) : summary!.recent_leads.map(lead => (
                                    <tr key={lead.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                                        <td className="py-3">
                                            <Link href={`/crm/${lead.id}`} className="text-pink-400 hover:text-pink-300 font-medium truncate block max-w-[140px]">
                                                {lead.name}
                                            </Link>
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_COLORS[lead.stage] || STAGE_COLORS.New}`}>
                                                {lead.stage}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right text-white font-medium">{fmt(lead.revenue || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

    );
}

function KpiCard({ label, value, icon, color, bg, href }: {
    label: string; value: string; icon: React.ReactNode;
    color: string; bg: string; href: string;
}) {
    return (
        <Link href={href} className="galaxy-card p-5 group">
            <div className="flex items-center justify-between mb-4">
                <div className={`${bg} ${color} p-2 rounded-lg`}>{icon}</div>
            </div>
            <p className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
        </Link>
    );
}
