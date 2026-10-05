"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import {
    TrendingUp,
    ShoppingCart,
    DollarSign,
    Users,
    Package,
    BarChart2,
    RefreshCw,
    Sparkles,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
    Zap,
    Plus,
    FileText,
    Receipt,
    UserPlus,
    Box,
    CheckSquare,
    Bot,
    Send,
    Activity,
    ShieldCheck,
    Building2,
    Layers,
    Target,
    Crown,
    ExternalLink,
    Lock
} from 'lucide-react';

type DashboardSummary = {
    kpis: {
        quotations: number;
        orders: number;
        revenue: number;
        avg_order: number;
        pipeline_value: number;
        won_deals: number;
        pending_moves: number;
        total_contacts?: number;
        invoices_count?: number;
    };
    chart_data: { month: string; value: number }[];
    pipeline_stages?: { stage: string; count: number; value: number }[];
    recent_orders: { id: string; name: string; customer: string; amount: number; state: string; date?: string }[];
    recent_leads: { id: string; name: string; stage: string; revenue: number; customer?: string }[];
    recent_activities?: { id: string; text: string; time: string; type: string }[];
};

const STATE_COLORS: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    sent: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    sale: 'bg-green-500/20 text-green-400 border border-green-500/30',
    done: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    cancel: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const STAGE_COLORS: Record<string, string> = {
    New: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    Qualified: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    Proposition: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    Won: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    Lost: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
};

function fmt(n: number) {
    if (!n || isNaN(n)) return '$0';
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function DashboardPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [userData, setUserData] = useState<any>(null);
    const [trialDays, setTrialDays] = useState<number | null>(null);
    const [selectedModule, setSelectedModule] = useState<string>('CRM');
    const [isFreePlan, setIsFreePlan] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPaidUser, setIsPaidUser] = useState(false);
    const [aiQuery, setAiQuery] = useState('');

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const mod = localStorage.getItem('selectedModule') || 'CRM';
        setSelectedModule(mod);

        const cachedUserStr = localStorage.getItem('user');
        if (cachedUserStr) {
            try {
                const cached = JSON.parse(cachedUserStr);
                setUserData(cached);
                const SUPER_ADMIN_EMAILS = ['admin@beraxis.online', 'admin2@erp-crm.com'];
                const isSuper = SUPER_ADMIN_EMAILS.includes(cached.email);
                setIsAdmin(isSuper);

                if (cached.tenant?.trial_ends_at) {
                    const ends = new Date(cached.tenant.trial_ends_at);
                    const diffDays = Math.ceil((ends.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    setTrialDays(diffDays > 0 ? diffDays : 0);
                }

                try {
                    const meta = JSON.parse(cached.tenant?.stripe_customer_id || '{}');
                    if (cached.tenant?.subscription_status === 'active') {
                        if (meta?.plan === 'One App Free' && !isSuper) {
                            setIsFreePlan(true);
                        } else {
                            setIsPaidUser(true);
                        }
                    } else if (!isSuper) {
                        setIsFreePlan(true);
                    }
                } catch {
                    if (!isSuper) setIsFreePlan(true);
                }
            } catch {}
        }

        fetchDashboardData();
    }, [router]);

    const fetchDashboardData = async () => {
        setSyncing(true);
        try {
            // Fetch auth/me to sync latest tenant & role info
            const meRes = await fetchAPI('/auth/me');
            if (meRes.ok) {
                const meData = await meRes.json();
                setUserData(meData);
                const SUPER_ADMIN_EMAILS = ['admin@beraxis.online', 'admin2@erp-crm.com'];
                const isSuper = SUPER_ADMIN_EMAILS.includes(meData.email);
                setIsAdmin(isSuper);

                if (meData.tenant?.trial_ends_at) {
                    const ends = new Date(meData.tenant.trial_ends_at);
                    const diffDays = Math.ceil((ends.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    setTrialDays(diffDays > 0 ? diffDays : 0);
                }

                try {
                    const meta = JSON.parse(meData.tenant?.stripe_customer_id || '{}');
                    if (meData.tenant?.subscription_status === 'active') {
                        if (meta?.plan === 'One App Free' && !isSuper) {
                            setIsFreePlan(true);
                        } else {
                            setIsPaidUser(true);
                        }
                    } else if (!isSuper) {
                        setIsFreePlan(true);
                    }
                } catch {}
            }

            // Fetch tenant's isolated dashboard summary
            const res = await fetchAPI('/dashboard/summary');
            if (res.ok) {
                const data = await res.json();
                setSummary(data);
            } else {
                // Return clean zero-state for new tenant
                setSummary({
                    kpis: {
                        quotations: 0,
                        orders: 0,
                        revenue: 0,
                        avg_order: 0,
                        pipeline_value: 0,
                        won_deals: 0,
                        pending_moves: 0,
                        total_contacts: 0,
                        invoices_count: 0,
                    },
                    chart_data: [],
                    pipeline_stages: [
                        { stage: 'New Leads', count: 0, value: 0 },
                        { stage: 'Qualified', count: 0, value: 0 },
                        { stage: 'Proposition', count: 0, value: 0 },
                        { stage: 'Won Deals', count: 0, value: 0 },
                    ],
                    recent_orders: [],
                    recent_leads: [],
                    recent_activities: [],
                });
            }
        } catch (err) {
            console.warn('Backend sync notice: using tenant zero-state', err);
            setSummary({
                kpis: {
                    quotations: 0,
                    orders: 0,
                    revenue: 0,
                    avg_order: 0,
                    pipeline_value: 0,
                    won_deals: 0,
                    pending_moves: 0,
                    total_contacts: 0,
                    invoices_count: 0,
                },
                chart_data: [],
                pipeline_stages: [
                    { stage: 'New Leads', count: 0, value: 0 },
                    { stage: 'Qualified', count: 0, value: 0 },
                    { stage: 'Proposition', count: 0, value: 0 },
                    { stage: 'Won Deals', count: 0, value: 0 },
                ],
                recent_orders: [],
                recent_leads: [],
                recent_activities: [],
            });
        } finally {
            setLoading(false);
            setSyncing(false);
        }
    };

    const handleAiSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiQuery.trim()) return;
        router.push(`/ai?q=${encodeURIComponent(aiQuery)}`);
    };

    const kpis = summary?.kpis;
    const companyName = userData?.tenant?.name || userData?.email?.split('@')[1]?.split('.')[0]?.toUpperCase() || 'My Workspace';
    const planBadge = isAdmin
        ? 'Super Admin'
        : isPaidUser
        ? 'Pro Unlimited'
        : trialDays !== null
        ? `Trial (${trialDays}d)`
        : `Free (${selectedModule})`;

    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col">
            {/* Standardized Top Header with Navigation, Back, Apps Launcher & Website */}
            <DashboardHeader
                onSync={fetchDashboardData}
                isSyncing={syncing}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                planBadge={planBadge}
            />

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
                {/* ── SUPER ADMIN MASTER BANNER (Only visible to Platform Super Admin) ── */}
                {isAdmin && (
                    <div className="bg-gradient-to-r from-purple-900/50 via-indigo-950/80 to-purple-900/50 border border-purple-400/40 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-xl flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                                <Crown size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-purple-500/30 border border-purple-400/40 text-purple-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                                        Platform Master Super Admin
                                    </span>
                                    <span className="text-gray-400 text-xs">• Full System Authority</span>
                                </div>
                                <h2 className="text-lg md:text-xl font-bold text-white mt-1">
                                    Global SaaS Management & Tenant Supervision
                                </h2>
                                <p className="text-gray-300 text-xs md:text-sm mt-0.5">
                                    You have master authority to oversee all registered companies, manage subscriptions, view global SaaS revenues, and maintain platform health.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/super-admin"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs md:text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <ShieldCheck size={16} /> Open Super Admin Dashboard
                        </Link>
                    </div>
                )}

                {/* ── TENANT BANNER: Free Tier / Single Module Mode ── */}
                {isFreePlan && !isAdmin && (
                    <div className="bg-gradient-to-r from-purple-900/40 via-purple-950/60 to-pink-900/40 border border-purple-500/30 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-xl flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                                <Zap size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                                        Free Plan Active
                                    </span>
                                    <span className="text-gray-400 text-xs">• {companyName}</span>
                                </div>
                                <h2 className="text-lg md:text-xl font-bold text-white mt-1">
                                    Active Workspace Module: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{selectedModule}</span>
                                </h2>
                                <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                                    Your data is strictly isolated to <span className="text-gray-200 font-medium">{companyName}</span>. Upgrade to unlock all 28 business modules.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/billing"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs md:text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 active:scale-95"
                            >
                                <Zap size={14} /> Upgrade to Unlimited Pro
                            </Link>
                        </div>
                    </div>
                )}

                {/* ── TENANT BANNER: Free Trial Mode ── */}
                {trialDays !== null && !isAdmin && !isPaidUser && !isFreePlan && (
                    <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-xl flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                                <Clock size={24} />
                            </div>
                            <div>
                                <span className="bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                                    Trial Mode • {companyName}
                                </span>
                                <h2 className="text-lg md:text-xl font-bold text-white mt-1">
                                    {trialDays} Days Remaining in Free Trial
                                </h2>
                                <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                                    All 28 enterprise modules and AI features are currently unlocked for your company.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/billing"
                            className="bg-amber-500 hover:bg-amber-400 text-[#0F172A] text-xs md:text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 active:scale-95"
                        >
                            Activate Subscription
                        </Link>
                    </div>
                )}

                {/* ── TENANT BANNER: Paid Company Owner ── */}
                {isPaidUser && !isAdmin && (
                    <div className="bg-[#0F172A]/70 border border-purple-500/20 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-xl flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20 border border-white/10 shrink-0">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                                        Company Executive Suite
                                    </span>
                                    <span className="text-gray-400 text-xs">• Dedicated Company Workspace</span>
                                </div>
                                <h2 className="text-lg md:text-xl font-bold text-white mt-1">
                                    {companyName} Command Center
                                </h2>
                                <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                                    Unified workspace metrics for your organization. Only users authorized in your company can access this data.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/apps"
                                className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                            >
                                <Layers size={14} /> Open App Launcher
                            </Link>
                            <Link
                                href="/settings"
                                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                            >
                                Company Settings
                            </Link>
                        </div>
                    </div>
                )}

                {/* ── Quick Action Business Toolbar ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    <Link
                        href="/crm"
                        className="bg-[#0F172A]/70 hover:bg-purple-900/30 border border-white/5 hover:border-purple-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-2 transition-all group backdrop-blur-md shadow-lg"
                    >
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                            <Target size={18} />
                        </div>
                        <span className="text-xs font-bold text-gray-200 group-hover:text-white">+ New Deal</span>
                    </Link>

                    <Link
                        href="/sales"
                        className="bg-[#0F172A]/70 hover:bg-purple-900/30 border border-white/5 hover:border-purple-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-2 transition-all group backdrop-blur-md shadow-lg"
                    >
                        <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
                            <ShoppingCart size={18} />
                        </div>
                        <span className="text-xs font-bold text-gray-200 group-hover:text-white">+ New Quotation</span>
                    </Link>

                    <Link
                        href="/accounting"
                        className="bg-[#0F172A]/70 hover:bg-purple-900/30 border border-white/5 hover:border-purple-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-2 transition-all group backdrop-blur-md shadow-lg"
                    >
                        <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
                            <Receipt size={18} />
                        </div>
                        <span className="text-xs font-bold text-gray-200 group-hover:text-white">+ New Invoice</span>
                    </Link>

                    <Link
                        href="/contacts"
                        className="bg-[#0F172A]/70 hover:bg-purple-900/30 border border-white/5 hover:border-purple-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-2 transition-all group backdrop-blur-md shadow-lg"
                    >
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                            <UserPlus size={18} />
                        </div>
                        <span className="text-xs font-bold text-gray-200 group-hover:text-white">+ Add Contact</span>
                    </Link>

                    <Link
                        href="/inventory"
                        className="bg-[#0F172A]/70 hover:bg-purple-900/30 border border-white/5 hover:border-purple-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-2 transition-all group backdrop-blur-md shadow-lg"
                    >
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                            <Box size={18} />
                        </div>
                        <span className="text-xs font-bold text-gray-200 group-hover:text-white">+ Add Product</span>
                    </Link>

                    <Link
                        href="/todo"
                        className="bg-[#0F172A]/70 hover:bg-purple-900/30 border border-white/5 hover:border-purple-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-2 transition-all group backdrop-blur-md shadow-lg"
                    >
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                            <CheckSquare size={18} />
                        </div>
                        <span className="text-xs font-bold text-gray-200 group-hover:text-white">+ Create Task</span>
                    </Link>
                </div>

                {/* ── Executive KPI Metric Cards (Real Tenant Scoped Metrics) ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard
                        label="Total Company Revenue"
                        value={loading ? '...' : fmt(kpis?.revenue ?? 0)}
                        subtext={kpis?.revenue ? 'Confirmed sales income' : 'No confirmed sales yet'}
                        icon={<DollarSign size={20} />}
                        color="text-emerald-400"
                        bg="bg-emerald-500/10 border-emerald-500/20"
                        href="/sales"
                    />
                    <KpiCard
                        label="CRM Pipeline Value"
                        value={loading ? '...' : fmt(kpis?.pipeline_value ?? 0)}
                        subtext={kpis?.pipeline_value ? 'Active opportunity value' : 'No active deals yet'}
                        icon={<TrendingUp size={20} />}
                        color="text-cyan-400"
                        bg="bg-cyan-500/10 border-cyan-500/20"
                        href="/crm"
                    />
                    <KpiCard
                        label="Sales Orders"
                        value={loading ? '...' : String(kpis?.orders ?? 0)}
                        subtext={`${kpis?.quotations || 0} active quotations`}
                        icon={<ShoppingCart size={20} />}
                        color="text-orange-400"
                        bg="bg-orange-500/10 border-orange-500/20"
                        href="/sales"
                    />
                    <KpiCard
                        label="Won Deals"
                        value={loading ? '...' : String(kpis?.won_deals ?? 0)}
                        subtext={kpis?.won_deals ? 'Closed deals in pipeline' : 'No won deals recorded'}
                        icon={<CheckCircle2 size={20} />}
                        color="text-purple-400"
                        bg="bg-purple-500/10 border-purple-500/20"
                        href="/crm"
                    />
                    <KpiCard
                        label="Avg. Order Value"
                        value={loading ? '...' : fmt(kpis?.avg_order ?? 0)}
                        subtext="Per confirmed transaction"
                        icon={<Activity size={20} />}
                        color="text-pink-400"
                        bg="bg-pink-500/10 border-pink-500/20"
                        href="/sales"
                    />
                    <KpiCard
                        label="Pending Deliveries"
                        value={loading ? '...' : String(kpis?.pending_moves ?? 0)}
                        subtext="Stock operations in progress"
                        icon={<Package size={20} />}
                        color="text-amber-400"
                        bg="bg-amber-500/10 border-amber-500/20"
                        href="/inventory"
                    />
                    <KpiCard
                        label="Contacts & Accounts"
                        value={loading ? '...' : String(kpis?.total_contacts ?? 0)}
                        subtext="In your company directory"
                        icon={<Users size={20} />}
                        color="text-blue-400"
                        bg="bg-blue-500/10 border-blue-500/20"
                        href="/contacts"
                    />
                    <KpiCard
                        label="Data Isolation & Sync"
                        value="100% Isolated"
                        subtext={`Scoped to ${companyName}`}
                        icon={<ShieldCheck size={20} />}
                        color="text-teal-400"
                        bg="bg-teal-500/10 border-teal-500/20"
                        href="/settings"
                    />
                </div>

                {/* ── Visual Performance Analytics: Revenue Trend & Pipeline Funnel ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Over Time Area Chart */}
                    <div className="lg:col-span-2 bg-[#0F172A]/70 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    Revenue Growth Trend <Sparkles size={16} className="text-purple-400" />
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">Actual sales income for {companyName}</p>
                            </div>
                            <span className="text-xs font-semibold px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full">
                                Real-Time Financials
                            </span>
                        </div>

                        <div className="h-[260px] w-full flex items-center justify-center">
                            {(summary?.chart_data?.length ?? 0) > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={summary?.chart_data || []}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                                        <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                        <YAxis
                                            stroke="#64748B"
                                            tick={{ fontSize: 12, fill: '#94A3B8' }}
                                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                                            labelStyle={{ color: '#F8FAFC', fontWeight: 600 }}
                                            formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Gross Revenue']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#A855F7"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRev)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center p-6 flex flex-col items-center justify-center gap-2 text-gray-400">
                                    <BarChart2 size={36} className="text-gray-600 mb-1" />
                                    <p className="text-sm font-medium text-gray-300">No revenue data yet for {companyName}</p>
                                    <p className="text-xs text-gray-500 max-w-sm">
                                        When you confirm a Sales Order or mark an invoice as paid, your revenue chart will render here automatically.
                                    </p>
                                    <Link
                                        href="/sales"
                                        className="mt-2 text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                                    >
                                        + Create First Quotation <ArrowUpRight size={12} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CRM Deal Pipeline Funnel Chart */}
                    <div className="bg-[#0F172A]/70 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">Sales Pipeline Funnel</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Opportunity stages for {companyName}</p>
                            </div>
                            <Link href="/crm" className="text-xs text-cyan-400 hover:underline">CRM Board →</Link>
                        </div>

                        <div className="h-[220px] w-full flex items-center justify-center">
                            {(summary?.pipeline_stages?.some(s => s.count > 0 || s.value > 0)) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={summary?.pipeline_stages || []} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                                        <XAxis type="number" stroke="#64748B" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                                        <YAxis dataKey="stage" type="category" stroke="#64748B" tick={{ fontSize: 11, fill: '#E2E8F0' }} width={80} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: 12 }}
                                            formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Pipeline Value']}
                                        />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                            {summary?.pipeline_stages?.map((entry, index) => {
                                                const colors = ['#06B6D4', '#3B82F6', '#F59E0B', '#10B981'];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center p-4 flex flex-col items-center justify-center gap-1.5 text-gray-400">
                                    <Target size={32} className="text-gray-600 mb-1" />
                                    <p className="text-xs font-semibold text-gray-300">No deals in pipeline</p>
                                    <p className="text-[11px] text-gray-500">
                                        Add leads in CRM to visualize your deal progression funnel.
                                    </p>
                                    <Link href="/crm" className="text-xs text-cyan-400 font-bold mt-1">
                                        + Add First Deal →
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-400">
                            <span>Won Conversion Rate:</span>
                            <span className="font-bold text-emerald-400">
                                {(kpis?.won_deals && kpis?.orders) ? `${Math.round((kpis.won_deals / Math.max(1, (summary?.recent_leads?.length || 1))) * 100)}%` : '0%'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Operational Live Feeds: Recent Orders & CRM Pipeline ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Sales Orders Table */}
                    <div className="bg-[#0F172A]/70 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-white text-base">Sales Orders & Quotations</h3>
                                <p className="text-xs text-gray-400">{companyName}'s transactions</p>
                            </div>
                            <Link href="/sales" className="text-xs font-semibold text-purple-400 hover:text-purple-300">
                                View All Orders →
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            {(summary?.recent_orders?.length ?? 0) > 0 ? (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-xs text-gray-500 uppercase border-b border-gray-800 text-left">
                                            <th className="pb-3">Reference</th>
                                            <th className="pb-3">Customer</th>
                                            <th className="pb-3 text-right">Amount</th>
                                            <th className="pb-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary?.recent_orders?.map((order) => (
                                            <tr key={order.id} className="border-b border-gray-800/40 hover:bg-white/5 transition-colors">
                                                <td className="py-3.5">
                                                    <Link
                                                        href={`/sales/${order.id}`}
                                                        className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                                                    >
                                                        {order.name || 'Draft'}
                                                        <ArrowUpRight size={12} className="opacity-60" />
                                                    </Link>
                                                </td>
                                                <td className="py-3.5 text-gray-300 font-medium truncate max-w-[140px]">
                                                    {order.customer || 'Customer'}
                                                </td>
                                                <td className="py-3.5 text-right font-bold text-white">
                                                    {fmt(order.amount || 0)}
                                                </td>
                                                <td className="py-3.5 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${STATE_COLORS[order.state] || STATE_COLORS.draft}`}>
                                                        {order.state}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-8 text-gray-400 flex flex-col items-center justify-center gap-2">
                                    <ShoppingCart size={28} className="text-gray-600" />
                                    <p className="text-xs font-semibold text-gray-300">No sales orders or quotations created yet</p>
                                    <Link
                                        href="/sales"
                                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md mt-1"
                                    >
                                        + Create First Quotation
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active CRM Pipeline Opportunities Table */}
                    <div className="bg-[#0F172A]/70 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-white text-base">Key CRM Pipeline Deals</h3>
                                <p className="text-xs text-gray-400">{companyName}'s active opportunities</p>
                            </div>
                            <Link href="/crm" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                                Open Pipeline →
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            {(summary?.recent_leads?.length ?? 0) > 0 ? (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-xs text-gray-500 uppercase border-b border-gray-800 text-left">
                                            <th className="pb-3">Deal / Opportunity</th>
                                            <th className="pb-3">Customer</th>
                                            <th className="pb-3 text-right">Expected</th>
                                            <th className="pb-3 text-center">Stage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary?.recent_leads?.map((lead) => (
                                            <tr key={lead.id} className="border-b border-gray-800/40 hover:bg-white/5 transition-colors">
                                                <td className="py-3.5">
                                                    <Link
                                                        href={`/crm/${lead.id}`}
                                                        className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 truncate max-w-[160px]"
                                                    >
                                                        {lead.name}
                                                        <ArrowUpRight size={12} className="opacity-60" />
                                                    </Link>
                                                </td>
                                                <td className="py-3.5 text-gray-300 font-medium truncate max-w-[120px]">
                                                    {lead.customer || 'Key Account'}
                                                </td>
                                                <td className="py-3.5 text-right font-bold text-emerald-400">
                                                    {fmt(lead.revenue || 0)}
                                                </td>
                                                <td className="py-3.5 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${STAGE_COLORS[lead.stage] || STAGE_COLORS.New}`}>
                                                        {lead.stage}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-8 text-gray-400 flex flex-col items-center justify-center gap-2">
                                    <Target size={28} className="text-gray-600" />
                                    <p className="text-xs font-semibold text-gray-300">No leads or pipeline deals recorded yet</p>
                                    <Link
                                        href="/crm"
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md mt-1"
                                    >
                                        + Add First Deal
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Live System Activity Stream ── */}
                <div className="bg-[#0F172A]/70 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-white text-base flex items-center gap-2">
                                <Activity size={18} className="text-purple-400" /> Company Audit & Activity History
                            </h3>
                            <p className="text-xs text-gray-400">Chronological activity record for {companyName}</p>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">Workspace: {companyName}</span>
                    </div>

                    <div className="space-y-3">
                        {(summary?.recent_activities?.length ?? 0) > 0 ? (
                            summary?.recent_activities?.map((act) => (
                                <div
                                    key={act.id}
                                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/20 transition-all text-xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                                        <span className="text-gray-200 font-medium">{act.text}</span>
                                    </div>
                                    <span className="text-gray-500 text-[11px] whitespace-nowrap ml-4">{act.time}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-gray-500 text-xs">
                                No activity recorded yet for this workspace. As your team creates quotations, manages leads, or updates records, the audit log will populate here.
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Galaxy AI Query Bar ── */}
                <div className="bg-gradient-to-r from-purple-900/30 via-[#0F172A]/90 to-pink-900/30 border border-purple-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-2.5 mb-3">
                        <Bot className="text-purple-400" size={20} />
                        <h3 className="text-base font-bold text-white">Ask Galaxy AI Copilot</h3>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold uppercase px-2 py-0.5 rounded-md border border-purple-400/30">
                            Workspace Intelligence
                        </span>
                    </div>
                    <form onSubmit={handleAiSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            placeholder={`Ask anything about ${companyName}'s sales revenue, leads, or inventory status...`}
                            className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 cursor-pointer"
                        >
                            <Send size={14} /> Ask AI
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

function KpiCard({
    label,
    value,
    subtext,
    icon,
    color,
    bg,
    href,
}: {
    label: string;
    value: string;
    subtext?: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className={`p-5 rounded-3xl border ${bg} backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group flex flex-col justify-between`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-200 transition-colors">
                    {label}
                </span>
                <div className={`${color} p-2 rounded-xl bg-white/5 transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
            </div>
            <div>
                <div className="text-xl md:text-2xl font-black tracking-tight text-white group-hover:text-purple-200 transition-colors">
                    {value}
                </div>
                {subtext && (
                    <p className="text-[11px] text-gray-400 mt-1 truncate">
                        {subtext}
                    </p>
                )}
            </div>
        </Link>
    );
}
