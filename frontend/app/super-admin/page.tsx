"use client";
import { fetchAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import { 
    ShieldCheck, Users, Building2, TrendingUp, Search, 
    RefreshCw, Plus, ExternalLink, CreditCard, Calendar, 
    Ban, CheckCircle, ShieldAlert, Trash2, UserX
} from 'lucide-react';

type Workspace = {
    id: string;
    name: string;
    owner_email: string;
    member_count: number;
    created_at: string;
};

type GlobalUser = {
    id: string;
    email: string;
    created_at: string;
    subscription_status?: string;
    workspace_name?: string;
};

type Tenant = {
    id: string;
    email: string;
    subscription_status: string;
    trial_ends_at: string;
    created_at: string;
};

type SalesOrder = {
    id: string;
    name: string;
    customer_name: string;
    amount_total: number;
    state: string;
    created_at: string;
};

type GlobalStats = {
    total_workspaces: number;
    total_users: number;
    platform_revenue: number;
    active_trials: number;
};

export default function SuperAdminPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [users, setUsers] = useState<GlobalUser[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [sales, setSales] = useState<SalesOrder[]>([]);
    const [stats, setStats] = useState<GlobalStats | null>(null);
    
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"companies" | "users" | "sales" | "billing">("companies");
    
    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [salesSearchTerm, setSalesSearchTerm] = useState("");
    const [billingSearchTerm, setBillingSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("[SuperAdmin] Pinging backend...");
            const pingRes = await fetchAPI("/ping");
            if (!pingRes.ok) throw new Error("Backend server is not responding to ping.");

            // Fetch workspaces
            const wsRes = await fetchAPI("/super-admin/workspaces");
            if (wsRes.ok) {
                const wsData = await wsRes.json();
                setWorkspaces(wsData);
            }

            // Fetch stats
            const statsRes = await fetchAPI("/super-admin/stats");
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            // Fetch users
            const usersRes = await fetchAPI("/super-admin/users");
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(usersData);
            }

            // Fetch sales
            const salesRes = await fetchAPI("/super-admin/sales");
            if (salesRes.ok) {
                const salesData = await salesRes.json();
                setSales(salesData);
            }

            // Fetch tenants
            const tenantsRes = await fetchAPI("/super-admin/tenants");
            if (tenantsRes.ok) {
                const tenantsData = await tenantsRes.json();
                setTenants(tenantsData);
            }
        } catch (err: any) {
            console.error("[SuperAdmin] Fetch error:", err);
            setError(err.message || "Failed to connect to the backend server.");
        } finally {
            setLoading(false);
        }
    };

    const handleTenantAction = async (tenantId: string, action: "activate" | "deactivate" | "extend-trial") => {
        setActionLoading(`${tenantId}-${action}`);
        try {
            const res = await fetchAPI(`/super-admin/tenants/${tenantId}/${action}`, {
                method: "POST"
            });
            if (res.ok) {
                // Refresh data
                await fetchData();
            } else {
                const err = await res.json().catch(() => ({ detail: "Action failed" }));
                alert(`Error: ${err.detail || 'Could not process request'}`);
            }
        } catch (e: any) {
            alert(`Exception: ${e.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    // Filter Logic
    const filteredWorkspaces = workspaces.filter(ws => 
        ws.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ws.owner_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    const filteredSales = sales.filter(s => 
        s.name.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        s.customer_name.toLowerCase().includes(salesSearchTerm.toLowerCase())
    );

    const filteredTenants = tenants.filter(t => 
        t.email.toLowerCase().includes(billingSearchTerm.toLowerCase()) ||
        t.subscription_status.toLowerCase().includes(billingSearchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-16">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
                            <ShieldCheck className="text-purple-500" size={32} /> SaaS Command Center
                        </h1>
                        <p className="text-gray-400 mt-2">Platform-wide oversight, subscription controls, and financial reports</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={fetchData}
                            className="flex items-center gap-2 bg-[#1E293B] hover:bg-gray-800 px-4 py-2 rounded-lg text-sm border border-gray-700 transition-all text-white font-medium"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
                        <ShieldAlert size={20} />
                        <div>
                            <p className="font-bold text-sm">Connection Error</p>
                            <p className="text-xs">{error}</p>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <StatCard label="Total Companies" value={stats?.total_workspaces ?? 0} icon={<Building2 />} color="text-blue-400" bg="bg-blue-500/10" />
                    <StatCard label="Total Users" value={stats?.total_users ?? 0} icon={<Users />} color="text-purple-400" bg="bg-purple-500/10" />
                    <StatCard label="Total Revenue" value={`$${(stats?.platform_revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<TrendingUp />} color="text-green-400" bg="bg-green-500/10" />
                    <StatCard label="Active Trials" value={stats?.active_trials ?? 0} icon={<ShieldCheck />} color="text-orange-400" bg="bg-orange-500/10" />
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-800 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
                    <TabButton active={activeTab === "companies"} onClick={() => setActiveTab("companies")} label="Companies" count={workspaces.length} />
                    <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} label="User Accounts" count={users.length} />
                    <TabButton active={activeTab === "sales"} onClick={() => setActiveTab("sales")} label="Live Sales" count={sales.length} />
                    <TabButton active={activeTab === "billing"} onClick={() => setActiveTab("billing")} label="Billing Control" count={tenants.length} />
                </div>

                {/* Companies Tab */}
                {activeTab === "companies" && (
                    <div className="galaxy-card overflow-hidden">
                        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1E293B]/20">
                            <div>
                                <h2 className="text-xl font-bold">Manage Companies</h2>
                                <p className="text-xs text-gray-500 mt-1">Tenant spaces and company databases</p>
                            </div>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Filter by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0F172A] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-850">
                                    <tr>
                                        <th className="px-6 py-4">Company Name</th>
                                        <th className="px-6 py-4">Owner Email</th>
                                        <th className="px-6 py-4 text-center">Active Seats</th>
                                        <th className="px-6 py-4">Created At</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-850">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-550">Loading companies...</td></tr>
                                    ) : filteredWorkspaces.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-550">No companies found.</td></tr>
                                    ) : filteredWorkspaces.map(ws => (
                                        <tr key={ws.id} className="hover:bg-gray-800/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 font-bold border border-white/5 shadow-inner">
                                                        {ws.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-gray-200">{ws.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm font-medium">{ws.owner_email}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-purple-950/40 text-purple-400 px-2.5 py-1 rounded-full text-xs font-bold border border-purple-500/20">
                                                    {ws.member_count} Members
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(ws.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => window.location.href = `/settings?workspace=${ws.id}`}
                                                    className="flex items-center gap-1.5 ml-auto text-purple-400 hover:text-purple-300 text-sm font-bold transition-colors"
                                                >
                                                    <ExternalLink size={14} /> Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                    <div className="galaxy-card overflow-hidden">
                        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1E293B]/20">
                            <div>
                                <h2 className="text-xl font-bold">Platform User Accounts</h2>
                                <p className="text-xs text-gray-500 mt-1">All registered users across the entire platform</p>
                            </div>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Filter by email..."
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0F172A] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-850">
                                    <tr>
                                        <th className="px-6 py-4">User Email</th>
                                        <th className="px-6 py-4">Workspace</th>
                                        <th className="px-6 py-4">Plan Status</th>
                                        <th className="px-6 py-4">Joined Date</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-850">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-550">Loading users...</td></tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-550">No users found.</td></tr>
                                    ) : filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-800/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 font-bold border border-white/5 text-sm">
                                                        {u.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-200 block">{u.email}</span>
                                                        <span className="text-[10px] text-gray-600 font-mono">{u.id.slice(0, 16)}...</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {u.workspace_name ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <Building2 size={13} className="text-gray-500" />
                                                        {u.workspace_name}
                                                    </span>
                                                ) : <span className="text-gray-600">—</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                                    u.subscription_status === 'active'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : u.subscription_status === 'trialing'
                                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                        : u.subscription_status === 'past_due' || u.subscription_status === 'canceled'
                                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        : 'bg-gray-700/40 text-gray-400 border border-gray-700'
                                                }`}>
                                                    {u.subscription_status === 'active' && <CheckCircle size={10} />}
                                                    {u.subscription_status || 'new'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {u.created_at ? new Date(u.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
                                                        const res = await fetchAPI(`/super-admin/users/${u.id}`, { method: 'DELETE' });
                                                        if (res.ok) fetchData();
                                                        else alert('Failed to delete user');
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Delete user"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Live Sales Tab */}
                {activeTab === "sales" && (
                    <div className="galaxy-card overflow-hidden">
                        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1E293B]/20">
                            <div>
                                <h2 className="text-xl font-bold">Platform-wide Live Sales</h2>
                                <p className="text-xs text-gray-500 mt-1">Track payments and revenue generation</p>
                            </div>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search by order or customer..."
                                    value={salesSearchTerm}
                                    onChange={(e) => setSalesSearchTerm(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0F172A] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-850">
                                    <tr>
                                        <th className="px-6 py-4">Order ID / Ref</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Amount Total</th>
                                        <th className="px-6 py-4">Order Date</th>
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-850">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-550">Loading sales orders...</td></tr>
                                    ) : filteredSales.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-550">No sales transactions found.</td></tr>
                                    ) : filteredSales.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-800/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                                        <CreditCard size={18} />
                                                    </div>
                                                    <span className="font-bold text-gray-200">{order.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 text-sm font-semibold">{order.customer_name}</td>
                                            <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                                                ${order.amount_total.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                    order.state === "sale" 
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}>
                                                    {order.state === "sale" ? "confirmed" : "quotation"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Billing Control Tab */}
                {activeTab === "billing" && (
                    <div className="galaxy-card overflow-hidden">
                        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1E293B]/20">
                            <div>
                                <h2 className="text-xl font-bold">Billing Control & Tenant Audits</h2>
                                <p className="text-xs text-gray-500 mt-1">Track pending payments, trial statuses, and override settings</p>
                            </div>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Filter by email or status..."
                                    value={billingSearchTerm}
                                    onChange={(e) => setBillingSearchTerm(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0F172A] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-850">
                                    <tr>
                                        <th className="px-6 py-4">Tenant Account</th>
                                        <th className="px-6 py-4">Subscription Status</th>
                                        <th className="px-6 py-4">Trial / Subscription Ends</th>
                                        <th className="px-6 py-4 text-right">Administrative Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-850">
                                    {loading ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-550">Loading billing accounts...</td></tr>
                                    ) : filteredTenants.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-550">No billing records found.</td></tr>
                                    ) : filteredTenants.map(t => {
                                        const isPastDue = t.subscription_status === 'past_due' || t.subscription_status === 'canceled';
                                        const isTrial = t.subscription_status === 'trialing';
                                        const isTrialExpired = isTrial && t.trial_ends_at && new Date() > new Date(t.trial_ends_at);
                                        
                                        return (
                                            <tr key={t.id} className="hover:bg-gray-800/10 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-250 block">{t.email}</span>
                                                    <span className="text-[10px] text-gray-650 font-mono block mt-0.5">{t.id}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                                                        t.subscription_status === 'active' 
                                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                                            : isTrialExpired
                                                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                                            : isTrial 
                                                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                    }`}>
                                                        {t.subscription_status === 'active' && <CheckCircle size={12} />}
                                                        {t.subscription_status} {isTrialExpired && "(Expired)"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {t.trial_ends_at ? (
                                                        <div className="flex items-center gap-1.5 text-gray-400">
                                                            <Calendar size={14} className="text-gray-550" />
                                                            <span>{new Date(t.trial_ends_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-550">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2.5">
                                                        {t.subscription_status !== 'active' ? (
                                                            <button 
                                                                onClick={() => handleTenantAction(t.id, "activate")}
                                                                disabled={actionLoading !== null}
                                                                className="px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                {actionLoading === `${t.id}-activate` ? "Processing..." : "Activate"}
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleTenantAction(t.id, "deactivate")}
                                                                disabled={actionLoading !== null}
                                                                className="px-3 py-1.5 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-650 hover:text-white border border-red-500/30 text-xs font-bold transition-all disabled:opacity-50"
                                                            >
                                                                {actionLoading === `${t.id}-deactivate` ? "Processing..." : "Block Access"}
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleTenantAction(t.id, "extend-trial")}
                                                            disabled={actionLoading !== null}
                                                            className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black border border-amber-500/30 text-xs font-bold transition-all disabled:opacity-50"
                                                        >
                                                            {actionLoading === `${t.id}-extend-trial` ? "Processing..." : "Extend Trial (+14d)"}
                                                        </button>
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
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color, bg }: any) {
    return (
        <div className="galaxy-card p-6 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`${bg} ${color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</p>
        </div>
    );
}

function TabButton({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count: number }) {
    return (
        <button 
            onClick={onClick}
            className={`px-5 py-3 border-b-2 font-bold text-sm transition-all flex items-center gap-2 ${
                active 
                    ? "border-purple-500 text-purple-400 bg-purple-500/5" 
                    : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
        >
            <span>{label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                active ? "bg-purple-500/20 text-purple-400" : "bg-gray-800 text-gray-500"
            }`}>
                {count}
            </span>
        </button>
    );
}
