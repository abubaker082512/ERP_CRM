"use client";
import { fetchAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import {
    ShieldCheck, Users, Building2, TrendingUp, Search,
    RefreshCw, ExternalLink, CreditCard, Calendar,
    CheckCircle, ShieldAlert, Trash2, Bitcoin, DollarSign,
    Ban, Zap, ArrowUpRight, Clock, AlertTriangle
} from 'lucide-react';

type Workspace = { id: string; name: string; owner_email: string; member_count: number; created_at: string; };
type GlobalUser = { id: string; email: string; created_at: string; subscription_status?: string; workspace_name?: string; };
type Tenant = { id: string; email: string; subscription_status: string; trial_ends_at: string; created_at: string; };
type SalesOrder = { id: string; name: string; customer_name: string; amount_total: number; state: string; created_at: string; };
type PaymentRecord = {
    tenant_id: string; email: string; payment_status: string;
    plan: string; amount_usd: number; currency: string;
    activated_at: string; registered_at: string;
};
type GlobalStats = {
    total_workspaces: number; total_users: number; platform_revenue: number;
    active_trials: number; paid_subscribers: number; crypto_revenue: number;
    cc_revenue?: number; total_saas_revenue?: number;
};

const STATUS_STYLES: Record<string, string> = {
    active:    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    trialing:  "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    past_due:  "bg-red-500/10 text-red-400 border border-red-500/20",
    canceled:  "bg-red-500/10 text-red-400 border border-red-500/20",
    new:       "bg-gray-700/40 text-gray-400 border border-gray-700",
};

export default function SuperAdminPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [users, setUsers] = useState<GlobalUser[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [sales, setSales] = useState<SalesOrder[]>([]);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [stats, setStats] = useState<GlobalStats | null>(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "billing" | "payments" | "sales">("overview");

    const [searchTerm, setSearchTerm] = useState("");
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [salesSearchTerm, setSalesSearchTerm] = useState("");
    const [billingSearchTerm, setBillingSearchTerm] = useState("");
    const [paymentSearchTerm, setPaymentSearchTerm] = useState("");

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [wsRes, statsRes, usersRes, salesRes, tenantsRes, paymentsRes] = await Promise.all([
                fetchAPI("/super-admin/workspaces"),
                fetchAPI("/super-admin/stats"),
                fetchAPI("/super-admin/users"),
                fetchAPI("/super-admin/sales"),
                fetchAPI("/super-admin/tenants"),
                fetchAPI("/super-admin/payments"),
            ]);

            if (wsRes.ok)       setWorkspaces(await wsRes.json());
            if (statsRes.ok)    setStats(await statsRes.json());
            if (usersRes.ok)    setUsers(await usersRes.json());
            if (salesRes.ok)    setSales(await salesRes.json());
            if (tenantsRes.ok)  setTenants(await tenantsRes.json());
            if (paymentsRes.ok) setPayments(await paymentsRes.json());
        } catch (err: any) {
            setError(err.message || "Failed to connect to the backend.");
        } finally {
            setLoading(false);
        }
    };

    const handleTenantAction = async (tenantId: string, action: "activate" | "deactivate" | "extend-trial") => {
        setActionLoading(`${tenantId}-${action}`);
        try {
            const res = await fetchAPI(`/super-admin/tenants/${tenantId}/${action}`, { method: "POST" });
            if (res.ok) await fetchData();
            else { const e = await res.json().catch(() => ({ detail: "Action failed" })); alert(`Error: ${e.detail}`); }
        } catch (e: any) { alert(`Exception: ${e.message}`); }
        finally { setActionLoading(null); }
    };

    const handleDeleteUser = async (userId: string, email: string) => {
        if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
        const res = await fetchAPI(`/super-admin/users/${userId}`, { method: 'DELETE' });
        if (res.ok) fetchData();
        else alert('Failed to delete user');
    };

    // Filters
    const filteredWorkspaces = workspaces.filter(ws =>
        ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.owner_email.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredUsers = users.filter(u => u.email.toLowerCase().includes(userSearchTerm.toLowerCase()));
    const filteredSales = sales.filter(s =>
        s.name.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        s.customer_name.toLowerCase().includes(salesSearchTerm.toLowerCase()));
    const filteredTenants = tenants.filter(t =>
        t.email.toLowerCase().includes(billingSearchTerm.toLowerCase()) ||
        t.subscription_status.toLowerCase().includes(billingSearchTerm.toLowerCase()));
    const filteredPayments = payments.filter(p =>
        p.email.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
        p.payment_status.toLowerCase().includes(paymentSearchTerm.toLowerCase()));

    const paidPayments = filteredPayments.filter(p => p.payment_status === "active");
    const pendingPayments = filteredPayments.filter(p => p.payment_status !== "active");
    const monthlySaaSRevenue = paidPayments.reduce((acc, p) => acc + (p.amount_usd || 0), 0);

    return (
        <div className="space-y-8 pb-16">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
                            <ShieldCheck className="text-purple-500" size={32} /> SaaS Command Center
                        </h1>
                        <p className="text-gray-400 mt-1 text-sm">Platform-wide oversight · Subscriptions · Crypto Payments · Revenue</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 bg-[#1E293B] hover:bg-gray-800 px-4 py-2 rounded-lg text-sm border border-gray-700 transition-all text-white font-medium"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
                        <ShieldAlert size={20} />
                        <div><p className="font-bold text-sm">Connection Error</p><p className="text-xs">{error}</p></div>
                    </div>
                )}

                {/* Stats Grid — 8 cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
                    <StatCard label="Companies"       value={stats?.total_workspaces ?? 0}                                              icon={<Building2 size={18}/>}   color="text-blue-400"   bg="bg-blue-500/10" />
                    <StatCard label="Total Users"     value={stats?.total_users ?? 0}                                                   icon={<Users size={18}/>}       color="text-purple-400" bg="bg-purple-500/10" />
                    <StatCard label="Active Trials"   value={stats?.active_trials ?? 0}                                                 icon={<Clock size={18}/>}       color="text-amber-400"  bg="bg-amber-500/10" />
                    <StatCard label="Paid Users"      value={stats?.paid_subscribers ?? 0}                                              icon={<CheckCircle size={18}/>} color="text-emerald-400" bg="bg-emerald-500/10" />
                    <StatCard label="Crypto Rev"      value={`$${(stats?.crypto_revenue ?? 0).toLocaleString()}`}                      icon={<Bitcoin size={18}/>}     color="text-orange-400" bg="bg-orange-500/10" />
                    <StatCard label="Card Rev"        value={`$${(stats?.cc_revenue ?? 0).toLocaleString()}`}                          icon={<CreditCard size={18}/>}  color="text-cyan-400"    bg="bg-cyan-500/10" />
                    <StatCard label="Total SaaS"      value={`$${(stats?.total_saas_revenue ?? 0).toLocaleString()}`}                  icon={<TrendingUp size={18}/>}  color="text-pink-400"    bg="bg-pink-500/10" />
                    <StatCard label="ERP Revenue"     value={`$${(stats?.platform_revenue ?? 0).toLocaleString(undefined,{minimumFractionDigits:0})}`} icon={<DollarSign size={18}/>} color="text-green-400" bg="bg-green-500/10" />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-1">
                    <TabBtn active={activeTab === "overview"}  onClick={() => setActiveTab("overview")}  label="Overview"      count={workspaces.length} />
                    <TabBtn active={activeTab === "payments"}  onClick={() => setActiveTab("payments")}  label="💳 Payments"   count={payments.length} />
                    <TabBtn active={activeTab === "billing"}   onClick={() => setActiveTab("billing")}   label="Billing Ctrl"  count={tenants.length} />
                    <TabBtn active={activeTab === "users"}     onClick={() => setActiveTab("users")}     label="Users"         count={users.length} />
                    <TabBtn active={activeTab === "sales"}     onClick={() => setActiveTab("sales")}     label="ERP Sales"     count={sales.length} />
                </div>

                {/* ── OVERVIEW TAB ── */}
                {activeTab === "overview" && (
                    <div className="galaxy-card overflow-hidden">
                        <TableHeader title="All Companies" subtitle="Tenant spaces and company databases">
                            <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Filter by name or email..." />
                        </TableHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0F172A] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Company</th>
                                        <th className="px-6 py-4">Owner Email</th>
                                        <th className="px-6 py-4 text-center">Members</th>
                                        <th className="px-6 py-4">Created</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {loading ? <LoadingRow cols={5} /> : filteredWorkspaces.length === 0 ? <EmptyRow cols={5} /> :
                                        filteredWorkspaces.map(ws => (
                                            <tr key={ws.id} className="hover:bg-white/3 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 font-bold border border-white/5">
                                                            {ws.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-gray-200">{ws.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 text-sm">{ws.owner_email}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="bg-purple-950/40 text-purple-400 px-2.5 py-1 rounded-full text-xs font-bold border border-purple-500/20">{ws.member_count} seats</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{fmtDate(ws.created_at)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => window.location.href = `/settings?workspace=${ws.id}`} className="text-purple-400 hover:text-purple-300 text-sm font-bold flex items-center gap-1 ml-auto">
                                                        <ExternalLink size={13} /> Manage
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── PAYMENTS TAB ── */}
                {activeTab === "payments" && (
                    <div className="space-y-6">
                        {/* Payment summary cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="galaxy-card p-5 border-l-4 border-emerald-500">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Paid Subscribers</p>
                                <p className="text-3xl font-black text-emerald-400">{paidPayments.length}</p>
                                <p className="text-xs text-gray-600 mt-1">Active subscriptions</p>
                            </div>
                            <div className="galaxy-card p-5 border-l-4 border-amber-500">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Pending / Trial</p>
                                <p className="text-3xl font-black text-amber-400">{pendingPayments.length}</p>
                                <p className="text-xs text-gray-600 mt-1">Users not yet converted</p>
                            </div>
                            <div className="galaxy-card p-5 border-l-4 border-purple-500">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Monthly SaaS Revenue</p>
                                <p className="text-3xl font-black text-purple-400">${monthlySaaSRevenue.toLocaleString()}</p>
                                <p className="text-xs text-gray-600 mt-1">Combined Plisio & Freemius billing</p>
                            </div>
                        </div>

                        {/* Payments table */}
                        <div className="galaxy-card overflow-hidden">
                            <TableHeader title="Crypto Payment Records" subtitle="All Plisio subscription payments via Beraxis">
                                <SearchBox value={paymentSearchTerm} onChange={setPaymentSearchTerm} placeholder="Search by email or status..." />
                            </TableHeader>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0F172A] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                                        <tr>
                                            <th className="px-6 py-4">User / Tenant</th>
                                            <th className="px-6 py-4">Plan</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Payment Method</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Registered</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {loading ? <LoadingRow cols={7} /> : filteredPayments.length === 0 ? <EmptyRow cols={7} /> :
                                            filteredPayments.map(p => {
                                                const isPaid = p.payment_status === "active";
                                                return (
                                                    <tr key={p.tenant_id} className="hover:bg-white/3 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold border text-sm ${isPaid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-gray-700/30 text-gray-400 border-gray-700"}`}>
                                                                    {p.email.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <span className="font-semibold text-gray-200 block text-sm">{p.email}</span>
                                                                    <span className="text-[10px] text-gray-600 font-mono">{p.tenant_id?.slice(0,16)}...</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-semibold text-gray-300">{p.plan}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`font-mono font-bold text-lg ${isPaid ? "text-emerald-400" : "text-gray-600"}`}>
                                                                {isPaid ? `$${p.amount_usd.toFixed(2)}` : "—"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                                                {p.currency.includes("Plisio") ? (
                                                                    <Bitcoin size={14} className="text-orange-400 shrink-0" />
                                                                ) : p.currency.includes("Freemius") ? (
                                                                    <CreditCard size={14} className="text-cyan-400 shrink-0" />
                                                                ) : (
                                                                    <Zap size={14} className="text-amber-400 shrink-0" />
                                                                )}
                                                                <span>{p.currency}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${STATUS_STYLES[p.payment_status] || STATUS_STYLES.new}`}>
                                                                {isPaid && <CheckCircle size={10} />}
                                                                {!isPaid && p.payment_status === "trialing" && <Clock size={10} />}
                                                                {p.payment_status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{fmtDate(p.registered_at)}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            {!isPaid ? (
                                                                <button
                                                                    onClick={() => handleTenantAction(p.tenant_id, "activate")}
                                                                    disabled={actionLoading !== null}
                                                                    className="px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all disabled:opacity-50"
                                                                >
                                                                    {actionLoading === `${p.tenant_id}-activate` ? "..." : "Activate"}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleTenantAction(p.tenant_id, "deactivate")}
                                                                    disabled={actionLoading !== null}
                                                                    className="px-3 py-1.5 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 text-xs font-bold transition-all disabled:opacity-50"
                                                                >
                                                                    {actionLoading === `${p.tenant_id}-deactivate` ? "..." : "Revoke"}
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                            {/* Legend */}
                            <div className="px-6 py-4 border-t border-gray-800 flex flex-wrap gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1.5"><CheckCircle size={11} className="text-emerald-400"/>Active = paid subscription</span>
                                <span className="flex items-center gap-1.5"><Clock size={11} className="text-amber-400"/>Trialing = free trial period</span>
                                <span className="flex items-center gap-1.5"><AlertTriangle size={11} className="text-red-400"/>Past due = payment expired or cancelled</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── BILLING CONTROL TAB ── */}
                {activeTab === "billing" && (
                    <div className="galaxy-card overflow-hidden">
                        <TableHeader title="Billing Control & Tenant Audits" subtitle="Override subscription status, extend trials, block access">
                            <SearchBox value={billingSearchTerm} onChange={setBillingSearchTerm} placeholder="Filter by email or status..." />
                        </TableHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0F172A] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Tenant Account</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Trial / Expiry Date</th>
                                        <th className="px-6 py-4 text-right">Admin Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {loading ? <LoadingRow cols={4} /> : filteredTenants.length === 0 ? <EmptyRow cols={4} /> :
                                        filteredTenants.map(t => {
                                            const isExpired = t.subscription_status === "trialing" && t.trial_ends_at && new Date() > new Date(t.trial_ends_at);
                                            return (
                                                <tr key={t.id} className="hover:bg-white/3 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-gray-200 block text-sm">{t.email}</span>
                                                        <span className="text-[10px] text-gray-600 font-mono">{t.id}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${STATUS_STYLES[t.subscription_status] || STATUS_STYLES.new}`}>
                                                            {t.subscription_status === "active" && <CheckCircle size={10}/>}
                                                            {t.subscription_status} {isExpired && "(Expired)"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {t.trial_ends_at
                                                            ? <span className="flex items-center gap-1.5 text-gray-400"><Calendar size={13} className="text-gray-500"/>{fmtDate(t.trial_ends_at)}</span>
                                                            : <span className="text-gray-600">—</span>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            {t.subscription_status !== "active" ? (
                                                                <ActionBtn onClick={() => handleTenantAction(t.id, "activate")} loading={actionLoading === `${t.id}-activate`} label="Activate" color="emerald"/>
                                                            ) : (
                                                                <ActionBtn onClick={() => handleTenantAction(t.id, "deactivate")} loading={actionLoading === `${t.id}-deactivate`} label="Block" color="red"/>
                                                            )}
                                                            <ActionBtn onClick={() => handleTenantAction(t.id, "extend-trial")} loading={actionLoading === `${t.id}-extend-trial`} label="+14d Trial" color="amber"/>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── USERS TAB ── */}
                {activeTab === "users" && (
                    <div className="galaxy-card overflow-hidden">
                        <TableHeader title="Platform User Accounts" subtitle="All registered users across the entire platform">
                            <SearchBox value={userSearchTerm} onChange={setUserSearchTerm} placeholder="Filter by email..." />
                        </TableHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0F172A] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">User Email</th>
                                        <th className="px-6 py-4">Workspace</th>
                                        <th className="px-6 py-4">Plan Status</th>
                                        <th className="px-6 py-4">Joined</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {loading ? <LoadingRow cols={5}/> : filteredUsers.length === 0 ? <EmptyRow cols={5}/> :
                                        filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-white/3 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 font-bold border border-white/5 text-sm">
                                                            {u.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-gray-200 block text-sm">{u.email}</span>
                                                            <span className="text-[10px] text-gray-600 font-mono">{u.id?.slice(0,16)}...</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-400">
                                                    {u.workspace_name
                                                        ? <span className="flex items-center gap-1.5"><Building2 size={12} className="text-gray-500"/>{u.workspace_name}</span>
                                                        : <span className="text-gray-600">—</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${STATUS_STYLES[u.subscription_status || "new"] || STATUS_STYLES.new}`}>
                                                        {u.subscription_status === "active" && <CheckCircle size={10}/>}
                                                        {u.subscription_status || "new"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{u.created_at ? fmtDate(u.created_at) : "N/A"}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDeleteUser(u.id, u.email)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Delete user">
                                                        <Trash2 size={14}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── ERP SALES TAB ── */}
                {activeTab === "sales" && (
                    <div className="galaxy-card overflow-hidden">
                        <TableHeader title="Platform-wide ERP Sales Orders" subtitle="All sales transactions generated by tenants in their ERP modules">
                            <SearchBox value={salesSearchTerm} onChange={setSalesSearchTerm} placeholder="Search by order or customer..." />
                        </TableHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0F172A] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Order Ref</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {loading ? <LoadingRow cols={5}/> : filteredSales.length === 0 ? <EmptyRow cols={5}/> :
                                        filteredSales.map(order => (
                                            <tr key={order.id} className="hover:bg-white/3 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                                            <CreditCard size={16}/>
                                                        </div>
                                                        <span className="font-bold text-gray-200">{order.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 text-sm font-semibold">{order.customer_name}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-emerald-400">${order.amount_total.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{order.created_at ? fmtDate(order.created_at) : "N/A"}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.state === "sale" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                                                        {order.state === "sale" ? "Confirmed" : "Quotation"}
                                                    </span>
                                                </td>
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

// ── Helpers ──────────────────────────────────────────
function fmtDate(d: string) {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" }); }
    catch { return d; }
}

function StatCard({ label, value, icon, color, bg }: any) {
    return (
        <div className="galaxy-card p-5 group hover:scale-[1.02] transition-transform">
            <div className={`${bg} ${color} p-2.5 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform`}>{icon}</div>
            <p className="text-2xl font-black text-white mb-0.5 tracking-tight">{value}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
        </div>
    );
}

function TabBtn({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
    return (
        <button onClick={onClick} className={`px-4 py-3 border-b-2 font-bold text-sm transition-all flex items-center gap-2 ${active ? "border-purple-500 text-purple-400 bg-purple-500/5" : "border-transparent text-gray-400 hover:text-gray-200"}`}>
            {label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? "bg-purple-500/20 text-purple-400" : "bg-gray-800 text-gray-500"}`}>{count}</span>
        </button>
    );
}

function TableHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
    return (
        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1E293B]/20">
            <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            </div>
            {children}
        </div>
    );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16}/>
            <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
                className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white"/>
        </div>
    );
}

function ActionBtn({ onClick, loading, label, color }: { onClick: () => void; loading: boolean; label: string; color: string }) {
    const styles: Record<string, string> = {
        emerald: "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/30",
        red:     "bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border-red-500/30",
        amber:   "bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black border-amber-500/30",
    };
    return (
        <button onClick={onClick} disabled={loading} className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-50 ${styles[color]}`}>
            {loading ? "..." : label}
        </button>
    );
}

function LoadingRow({ cols }: { cols: number }) {
    return <tr><td colSpan={cols} className="px-6 py-14 text-center text-gray-600 text-sm">Loading data...</td></tr>;
}
function EmptyRow({ cols }: { cols: number }) {
    return <tr><td colSpan={cols} className="px-6 py-14 text-center text-gray-600 text-sm">No records found.</td></tr>;
}
