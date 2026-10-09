"use client";
import { fetchAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import {
    ShieldCheck, Users, Building2, TrendingUp, Search,
    RefreshCw, ExternalLink, CreditCard, Calendar,
    CheckCircle, ShieldAlert, Trash2, Bitcoin, DollarSign,
    Ban, Zap, ArrowUpRight, Clock, AlertTriangle, Tag, Plus,
    Percent, Sparkles, X, Check, Copy, ToggleLeft, ToggleRight,
    Edit3
} from 'lucide-react';

export type Workspace = { id: string; name: string; owner_email: string; member_count: number; created_at: string; plan?: string; };
export type GlobalUser = { id: string; email: string; created_at: string; subscription_status?: string; workspace_name?: string; role?: string; };
export type Tenant = { id: string; email: string; subscription_status: string; trial_ends_at: string; created_at: string; };
export type SalesOrder = { id: string; name: string; customer_name: string; amount_total: number; state: string; created_at: string; };
export type PaymentRecord = {
    tenant_id: string; email: string; payment_status: string;
    plan: string; amount_usd: number; currency: string;
    activated_at: string; registered_at: string;
};
export type PromoCode = {
    id: string;
    code: string;
    description: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    target_package: "all" | "standard" | "custom" | "starter";
    max_uses: number;
    used_count: number;
    min_order_amount?: number;
    expiry_date?: string;
    status: "active" | "paused" | "expired";
    created_at: string;
};
export type GlobalStats = {
    total_workspaces: number; total_users: number; platform_revenue: number;
    active_trials: number; paid_subscribers: number; crypto_revenue: number;
    cc_revenue?: number; total_saas_revenue?: number;
};

const STATUS_STYLES: Record<string, string> = {
    active:    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    trialing:  "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    past_due:  "bg-red-500/10 text-red-400 border border-red-500/20",
    canceled:  "bg-red-500/10 text-red-400 border border-red-500/20",
    paused:    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    expired:   "bg-red-500/10 text-red-400 border border-red-500/20",
    new:       "bg-gray-700/40 text-gray-400 border border-gray-700",
};

export default function SuperAdminPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [users, setUsers] = useState<GlobalUser[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [sales, setSales] = useState<SalesOrder[]>([]);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [promocodes, setPromocodes] = useState<PromoCode[]>([]);
    const [stats, setStats] = useState<GlobalStats | null>(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "promocodes" | "users" | "billing" | "payments" | "sales">("overview");

    const [searchTerm, setSearchTerm] = useState("");
    const [promoSearchTerm, setPromoSearchTerm] = useState("");
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [salesSearchTerm, setSalesSearchTerm] = useState("");
    const [billingSearchTerm, setBillingSearchTerm] = useState("");
    const [paymentSearchTerm, setPaymentSearchTerm] = useState("");

    // Modal States for CRUD
    const [isCreatePromoOpen, setIsCreatePromoOpen] = useState(false);
    const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Form states
    const [promoForm, setPromoForm] = useState({
        code: "",
        description: "",
        discount_type: "percentage" as "percentage" | "fixed_amount",
        discount_value: "20",
        target_package: "all" as "all" | "standard" | "custom" | "starter",
        max_uses: "500",
        min_order_amount: "0",
        expiry_date: "2026-12-31",
        status: "active" as "active" | "paused"
    });

    const [wsForm, setWsForm] = useState({
        name: "",
        owner_email: "",
        plan: "Standard Plan",
        member_count: 5
    });

    const [userForm, setUserForm] = useState({
        email: "",
        role: "admin",
        workspace_id: ""
    });

    useEffect(() => { 
        fetchData(); 
        fetchPromos();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

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

    const fetchPromos = async () => {
        try {
            const res = await fetch("/api/admin/promocodes");
            if (res.ok) {
                const data = await res.json();
                if (data.promocodes) {
                    setPromocodes(data.promocodes);
                }
            }
        } catch (err) {
            console.error("Failed to fetch promocodes", err);
        }
    };

    // ── PROMO CODE CRUD HANDLERS ──────────────────────────────────────────
    const handleCreatePromo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/promocodes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(promoForm)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                showToast(`🎉 Promo code '${data.promo.code}' created successfully!`);
                setIsCreatePromoOpen(false);
                setPromoForm({
                    code: "",
                    description: "",
                    discount_type: "percentage",
                    discount_value: "20",
                    target_package: "all",
                    max_uses: "500",
                    min_order_amount: "0",
                    expiry_date: "2026-12-31",
                    status: "active"
                });
                fetchPromos();
            } else {
                alert(`Error: ${data.error || "Failed to create promo code"}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleTogglePromoStatus = async (promo: PromoCode) => {
        const nextStatus = promo.status === "active" ? "paused" : "active";
        try {
            const res = await fetch("/api/admin/promocodes", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: promo.id, status: nextStatus })
            });
            if (res.ok) {
                showToast(`Promo '${promo.code}' status changed to ${nextStatus}.`);
                fetchPromos();
            }
        } catch (err) {
            alert("Failed to toggle promo status");
        }
    };

    const handleDeletePromo = async (id: string, code: string) => {
        if (!confirm(`Are you sure you want to delete promo code '${code}'?`)) return;
        try {
            const res = await fetch(`/api/admin/promocodes?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast(`🗑️ Promo code '${code}' deleted.`);
                fetchPromos();
            }
        } catch (err) {
            alert("Failed to delete promo code");
        }
    };

    // ── WORKSPACE CRUD HANDLERS ───────────────────────────────────────────
    const handleCreateWorkspace = (e: React.FormEvent) => {
        e.preventDefault();
        if (!wsForm.name.trim() || !wsForm.owner_email.trim()) return;

        const newWs: Workspace = {
            id: `ws_${Date.now()}`,
            name: wsForm.name.trim(),
            owner_email: wsForm.owner_email.trim(),
            member_count: Number(wsForm.member_count) || 1,
            plan: wsForm.plan,
            created_at: new Date().toISOString()
        };

        const updated = [newWs, ...workspaces];
        setWorkspaces(updated);
        setIsCreateWorkspaceOpen(false);
        setWsForm({ name: "", owner_email: "", plan: "Standard Plan", member_count: 5 });
        showToast(`🏢 Company Workspace '${newWs.name}' created!`);
    };

    const handleDeleteWorkspace = (id: string, name: string) => {
        if (!confirm(`Archive / Delete Company '${name}'?`)) return;
        setWorkspaces(workspaces.filter(w => w.id !== id));
        showToast(`🗑️ Company '${name}' removed.`);
    };

    // ── USER CRUD HANDLERS ────────────────────────────────────────────────
    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userForm.email.trim()) return;

        const newUser: GlobalUser = {
            id: `usr_${Date.now()}`,
            email: userForm.email.trim(),
            role: userForm.role,
            subscription_status: "active",
            workspace_name: workspaces.find(w => w.id === userForm.workspace_id)?.name || "Beraxis HQ",
            created_at: new Date().toISOString()
        };

        setUsers([newUser, ...users]);
        setIsCreateUserOpen(false);
        setUserForm({ email: "", role: "admin", workspace_id: "" });
        showToast(`👤 User '${newUser.email}' invited and active!`);
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
        setUsers(users.filter(u => u.id !== userId));
        showToast(`🗑️ User ${email} deleted.`);
    };

    // Filters
    const filteredWorkspaces = workspaces.filter(ws =>
        ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.owner_email.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredPromocodes = promocodes.filter(p =>
        p.code.toLowerCase().includes(promoSearchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(promoSearchTerm.toLowerCase()) ||
        p.target_package.toLowerCase().includes(promoSearchTerm.toLowerCase()));
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
                        <p className="text-gray-400 mt-1 text-sm">Platform-wide oversight · Subscriptions · Promocodes · DirectPay Card · Tenant Databases</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 bg-[#1E293B] hover:bg-gray-800 px-4 py-2 rounded-xl text-sm border border-gray-700 transition-all text-white font-medium cursor-pointer"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                        </button>
                    </div>
                </div>

                {toastMessage && (
                    <div className="mb-6 bg-purple-600/20 border border-purple-500/40 text-purple-300 p-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-purple-600/10 animate-in fade-in">
                        <Sparkles size={20} className="text-purple-400" />
                        <p className="font-semibold text-sm">{toastMessage}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
                        <ShieldAlert size={20} />
                        <div><p className="font-bold text-sm">Connection Error</p><p className="text-xs">{error}</p></div>
                    </div>
                )}

                {/* Stats Grid — 8 cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
                    <StatCard label="Companies"       value={stats?.total_workspaces ?? workspaces.length}                             icon={<Building2 size={18}/>}   color="text-blue-400"   bg="bg-blue-500/10" />
                    <StatCard label="Total Users"     value={stats?.total_users ?? users.length}                                        icon={<Users size={18}/>}       color="text-purple-400" bg="bg-purple-500/10" />
                    <StatCard label="Active Promos"   value={promocodes.filter(p => p.status === 'active').length}                      icon={<Tag size={18}/>}         color="text-pink-400"   bg="bg-pink-500/10" />
                    <StatCard label="Paid Users"      value={stats?.paid_subscribers ?? paidPayments.length}                           icon={<CheckCircle size={18}/>} color="text-emerald-400" bg="bg-emerald-500/10" />
                    <StatCard label="DirectPay Card"  value={`$${(stats?.cc_revenue ?? monthlySaaSRevenue).toLocaleString()}`}         icon={<CreditCard size={18}/>}  color="text-cyan-400"    bg="bg-cyan-500/10" />
                    <StatCard label="Crypto Rev"      value={`$${(stats?.crypto_revenue ?? 0).toLocaleString()}`}                      icon={<Bitcoin size={18}/>}     color="text-orange-400" bg="bg-orange-500/10" />
                    <StatCard label="Total SaaS"      value={`$${(stats?.total_saas_revenue ?? monthlySaaSRevenue).toLocaleString()}`}  icon={<TrendingUp size={18}/>}  color="text-purple-400"  bg="bg-purple-500/10" />
                    <StatCard label="ERP Volume"      value={`$${(stats?.platform_revenue ?? 48290).toLocaleString(undefined,{minimumFractionDigits:0})}`} icon={<DollarSign size={18}/>} color="text-green-400" bg="bg-green-500/10" />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-1">
                    <TabBtn active={activeTab === "overview"}    onClick={() => setActiveTab("overview")}    label="Overview"      count={workspaces.length} />
                    <TabBtn active={activeTab === "promocodes"}  onClick={() => setActiveTab("promocodes")}  label="🎟️ Promo Codes" count={promocodes.length} />
                    <TabBtn active={activeTab === "payments"}    onClick={() => setActiveTab("payments")}    label="💳 DirectPay Subscriptions" count={payments.length} />
                    <TabBtn active={activeTab === "billing"}     onClick={() => setActiveTab("billing")}     label="Billing Ctrl"  count={tenants.length} />
                    <TabBtn active={activeTab === "users"}       onClick={() => setActiveTab("users")}       label="Users"         count={users.length} />
                    <TabBtn active={activeTab === "sales"}       onClick={() => setActiveTab("sales")}       label="ERP Sales"     count={sales.length} />
                </div>

                {/* ── 1. PROMO CODES TAB (FULL CRUD) ── */}
                {activeTab === "promocodes" && (
                    <div className="space-y-6">
                        <TableHeader 
                            title="Super Admin Promo Codes & Discount Engine" 
                            subtitle="Create specific percentage or fixed dollar discounts for Standard, Custom, or All plans"
                        >
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <SearchBox value={promoSearchTerm} onChange={setPromoSearchTerm} placeholder="Filter by code or package..." />
                                <button
                                    onClick={() => setIsCreatePromoOpen(true)}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                    <Plus size={16} /> Create Promo Code
                                </button>
                            </div>
                        </TableHeader>

                        <div className="galaxy-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0F172A] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                                        <tr>
                                            <th className="px-6 py-4">Promo Code</th>
                                            <th className="px-6 py-4">Discount Type & Value</th>
                                            <th className="px-6 py-4">Eligible Package</th>
                                            <th className="px-6 py-4 text-center">Redemptions</th>
                                            <th className="px-6 py-4">Expires</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {filteredPromocodes.length === 0 ? <EmptyRow cols={7} /> :
                                            filteredPromocodes.map(promo => {
                                                const isPercent = promo.discount_type === "percentage";
                                                return (
                                                    <tr key={promo.id} className="hover:bg-white/3 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="font-mono font-black text-sm text-purple-300 bg-purple-950/40 px-3 py-1 rounded-lg border border-purple-500/30 tracking-wider">
                                                                    {promo.code}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(promo.code);
                                                                        showToast(`Copied '${promo.code}' to clipboard!`);
                                                                    }}
                                                                    className="text-gray-500 hover:text-white p-1 rounded transition-colors"
                                                                    title="Copy Code"
                                                                >
                                                                    <Copy size={13} />
                                                                </button>
                                                            </div>
                                                            <p className="text-[11px] text-gray-400 mt-1">{promo.description}</p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-base font-black font-mono ${isPercent ? "text-emerald-400" : "text-cyan-400"}`}>
                                                                    {isPercent ? `${promo.discount_value}% OFF` : `$${promo.discount_value} FLAT`}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-300">
                                                                {promo.target_package === "all" ? "🌐 All Packages" : 
                                                                 promo.target_package === "standard" ? "💼 Standard Plan Only" : 
                                                                 "👑 Custom Enterprise Only"}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-xs font-mono font-bold text-gray-300">
                                                                {promo.used_count} / {promo.max_uses > 0 ? promo.max_uses : "∞"}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                                                            {promo.expiry_date ? fmtDate(promo.expiry_date) : "Never"}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${STATUS_STYLES[promo.status] || STATUS_STYLES.new}`}>
                                                                {promo.status}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleTogglePromoStatus(promo)}
                                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                                                        promo.status === "active"
                                                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-black"
                                                                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
                                                                    }`}
                                                                >
                                                                    {promo.status === "active" ? "Pause" : "Activate"}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeletePromo(promo.id, promo.code)}
                                                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                                                    title="Delete Promo"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 2. OVERVIEW / WORKSPACES TAB ── */}
                {activeTab === "overview" && (
                    <div className="galaxy-card overflow-hidden">
                        <TableHeader title="All Companies & Workspace Databases" subtitle="Tenant spaces, company branches, and database partitions">
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Filter by name or email..." />
                                <button
                                    onClick={() => setIsCreateWorkspaceOpen(true)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                    <Plus size={16} /> New Company
                                </button>
                            </div>
                        </TableHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0F172A] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Company</th>
                                        <th className="px-6 py-4">Owner Email</th>
                                        <th className="px-6 py-4">Active Plan</th>
                                        <th className="px-6 py-4 text-center">Members</th>
                                        <th className="px-6 py-4">Created</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {loading ? <LoadingRow cols={6} /> : filteredWorkspaces.length === 0 ? <EmptyRow cols={6} /> :
                                        filteredWorkspaces.map(ws => (
                                            <tr key={ws.id} className="hover:bg-white/3 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 font-bold border border-white/5">
                                                            {ws.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-gray-200">{ws.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 text-sm">{ws.owner_email}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                        {ws.plan || "Standard Plan"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="bg-purple-950/40 text-purple-400 px-2.5 py-1 rounded-full text-xs font-bold border border-purple-500/20">{ws.member_count} seats</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{fmtDate(ws.created_at)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => window.location.href = `/settings?workspace=${ws.id}`} className="text-purple-400 hover:text-purple-300 text-xs font-bold flex items-center gap-1 cursor-pointer">
                                                            <ExternalLink size={13} /> Manage
                                                        </button>
                                                        <button onClick={() => handleDeleteWorkspace(ws.id, ws.name)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Delete Company">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── 3. PAYMENTS TAB (DIRECTPAY CARD & BILLING) ── */}
                {activeTab === "payments" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="galaxy-card p-5 border-l-4 border-emerald-500">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Paid Subscribers</p>
                                <p className="text-3xl font-black text-emerald-400">{paidPayments.length}</p>
                                <p className="text-xs text-gray-600 mt-1">DirectPay Card subscriptions active</p>
                            </div>
                            <div className="galaxy-card p-5 border-l-4 border-amber-500">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Pending / Trial</p>
                                <p className="text-3xl font-black text-amber-400">{pendingPayments.length}</p>
                                <p className="text-xs text-gray-600 mt-1">Users in evaluation period</p>
                            </div>
                            <div className="galaxy-card p-5 border-l-4 border-purple-500">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Monthly SaaS Volume</p>
                                <p className="text-3xl font-black text-purple-400">${monthlySaaSRevenue.toLocaleString()}</p>
                                <p className="text-xs text-gray-600 mt-1">DirectPay Card & gateway billing</p>
                            </div>
                        </div>

                        <div className="galaxy-card overflow-hidden">
                            <TableHeader title="Subscription Payment Records" subtitle="All DirectPay Card & platform subscription payments">
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
                                                            <div className="flex items-center gap-1.5 text-sm text-gray-300">
                                                                <CreditCard size={14} className="text-purple-400 shrink-0" />
                                                                <span>DirectPay Card</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${STATUS_STYLES[p.payment_status] || STATUS_STYLES.new}`}>
                                                                {isPaid && <CheckCircle size={10} />}
                                                                {p.payment_status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{fmtDate(p.registered_at)}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            {!isPaid ? (
                                                                <button
                                                                    onClick={() => handleTenantAction(p.tenant_id, "activate")}
                                                                    disabled={actionLoading !== null}
                                                                    className="px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                                                >
                                                                    {actionLoading === `${p.tenant_id}-activate` ? "..." : "Activate"}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleTenantAction(p.tenant_id, "deactivate")}
                                                                    disabled={actionLoading !== null}
                                                                    className="px-3 py-1.5 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
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
                        </div>
                    </div>
                )}

                {/* ── 4. BILLING CONTROL TAB ── */}
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

                {/* ── 5. USERS TAB ── */}
                {activeTab === "users" && (
                    <div className="galaxy-card overflow-hidden">
                        <TableHeader title="Platform User Accounts" subtitle="All registered users across the entire platform">
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <SearchBox value={userSearchTerm} onChange={setUserSearchTerm} placeholder="Filter by email..." />
                                <button
                                    onClick={() => setIsCreateUserOpen(true)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                    <Plus size={16} /> Add User
                                </button>
                            </div>
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
                                                    <button onClick={() => handleDeleteUser(u.id, u.email)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer" title="Delete user">
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

                {/* ── 6. ERP SALES TAB ── */}
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

            {/* ── MODAL 1: CREATE PROMO CODE ── */}
            {isCreatePromoOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in">
                    <div className="bg-[#141C2E] border border-purple-500/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 animate-in zoom-in-95 text-white">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                                    <Tag size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Create Promo Code</h3>
                                    <p className="text-xs text-gray-400">Define package-specific percentage or dollar discounts</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCreatePromoOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePromo} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Promo Code *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={promoForm.code} 
                                        onChange={e => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                                        placeholder="e.g. VIP50 or LAUNCH200" 
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-sm focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Discount Type *</label>
                                    <select 
                                        value={promoForm.discount_type} 
                                        onChange={e => setPromoForm({...promoForm, discount_type: e.target.value as any})}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs font-semibold focus:border-purple-500 outline-none cursor-pointer"
                                    >
                                        <option value="percentage">% Percentage Discount</option>
                                        <option value="fixed_amount">$ Fixed Dollar Amount Off</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                                        Discount Value ({promoForm.discount_type === "percentage" ? "%" : "$ USD"}) *
                                    </label>
                                    <input 
                                        type="number" 
                                        required
                                        min="1"
                                        max={promoForm.discount_type === "percentage" ? 100 : 10000}
                                        value={promoForm.discount_value} 
                                        onChange={e => setPromoForm({...promoForm, discount_value: e.target.value})}
                                        placeholder={promoForm.discount_type === "percentage" ? "50 (for 50% off)" : "100 (for $100 off)"} 
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-purple-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Applicable Package *</label>
                                    <select 
                                        value={promoForm.target_package} 
                                        onChange={e => setPromoForm({...promoForm, target_package: e.target.value as any})}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs font-semibold focus:border-purple-500 outline-none cursor-pointer"
                                    >
                                        <option value="all">🌐 All Subscription Packages</option>
                                        <option value="standard">💼 Standard Plan ($24.90/seat)</option>
                                        <option value="custom">👑 Custom Enterprise ($37.40/seat)</option>
                                        <option value="starter">⚡ Starter / Single Module</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Campaign Description</label>
                                <input 
                                    type="text" 
                                    value={promoForm.description} 
                                    onChange={e => setPromoForm({...promoForm, description: e.target.value})}
                                    placeholder="e.g. Q4 Special Offer for Global Gym & Club Chains" 
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Max Redemptions</label>
                                    <input 
                                        type="number" 
                                        value={promoForm.max_uses} 
                                        onChange={e => setPromoForm({...promoForm, max_uses: e.target.value})}
                                        placeholder="500" 
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Expiry Date</label>
                                    <input 
                                        type="date" 
                                        value={promoForm.expiry_date} 
                                        onChange={e => setPromoForm({...promoForm, expiry_date: e.target.value})}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:border-purple-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                <button type="button" onClick={() => setIsCreatePromoOpen(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white font-bold">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-500/25 cursor-pointer">
                                    Deploy Promo Code
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 2: CREATE WORKSPACE ── */}
            {isCreateWorkspaceOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in">
                    <div className="bg-[#141C2E] border border-gray-700/80 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 text-white">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Building2 size={18} className="text-purple-400" /> Add New Company Workspace
                            </h3>
                            <button onClick={() => setIsCreateWorkspaceOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateWorkspace} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Company / Workspace Name *</label>
                                <input required type="text" value={wsForm.name} onChange={e => setWsForm({...wsForm, name: e.target.value})} placeholder="e.g. Apex Global Logistics" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Owner / Administrator Email *</label>
                                <input required type="email" value={wsForm.owner_email} onChange={e => setWsForm({...wsForm, owner_email: e.target.value})} placeholder="admin@apexlogistics.com" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Plan Tier</label>
                                    <select value={wsForm.plan} onChange={e => setWsForm({...wsForm, plan: e.target.value})} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none">
                                        <option value="One App Free">One App Free ($0)</option>
                                        <option value="Standard Plan">Standard Plan ($24.90/mo)</option>
                                        <option value="Custom Enterprise">Custom Enterprise ($37.40/mo)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Allocated Seats</label>
                                    <input type="number" min="1" value={wsForm.member_count} onChange={e => setWsForm({...wsForm, member_count: parseInt(e.target.value) || 1})} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:border-purple-500 outline-none" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                                <button type="button" onClick={() => setIsCreateWorkspaceOpen(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white font-bold">Cancel</button>
                                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-500/25">Create Company</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 3: CREATE USER ── */}
            {isCreateUserOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in">
                    <div className="bg-[#141C2E] border border-gray-700/80 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 text-white">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Users size={18} className="text-purple-400" /> Add & Invite Platform User
                            </h3>
                            <button onClick={() => setIsCreateUserOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">User Email Address *</label>
                                <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} placeholder="user@company.com" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Role</label>
                                    <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none">
                                        <option value="admin">Administrator</option>
                                        <option value="manager">Department Manager</option>
                                        <option value="staff">Staff / Member</option>
                                        <option value="portal">Portal / Read-Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Assigned Company</label>
                                    <select value={userForm.workspace_id} onChange={e => setUserForm({...userForm, workspace_id: e.target.value})} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none">
                                        <option value="">Default Company</option>
                                        {workspaces.map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                                <button type="button" onClick={() => setIsCreateUserOpen(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white font-bold">Cancel</button>
                                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-500/25">Invite User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
        <button onClick={onClick} className={`px-4 py-3 border-b-2 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${active ? "border-purple-500 text-purple-400 bg-purple-500/5" : "border-transparent text-gray-400 hover:text-gray-200"}`}>
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
        <button onClick={onClick} disabled={loading} className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-50 cursor-pointer ${styles[color]}`}>
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
