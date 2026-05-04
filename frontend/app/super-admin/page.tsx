"use client";
import { fetchAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import { ShieldCheck, Users, Building2, TrendingUp, Search, RefreshCw, Plus, ExternalLink } from 'lucide-react';

type Workspace = {
    id: string;
    name: string;
    owner_email: string;
    member_count: number;
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
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [error, setError] = useState<string | null>(null);

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
            console.log("[SuperAdmin] Backend is alive.");

            console.log("[SuperAdmin] Attempting to fetch workspaces...");
            const wsRes = await fetchAPI("/super-admin/workspaces");
            if (!wsRes.ok) {
                const txt = await wsRes.text();
                throw new Error(`Workspaces API failed: ${txt || wsRes.status}`);
            }
            const wsData = await wsRes.json();
            console.log("[SuperAdmin] Workspaces fetched successfully.");
            setWorkspaces(wsData);

            console.log("[SuperAdmin] Attempting to fetch stats...");
            const statsRes = await fetchAPI("/super-admin/stats");
            if (!statsRes.ok) {
                const txt = await statsRes.text();
                throw new Error(`Stats API failed: ${txt || statsRes.status}`);
            }
            const statsData = await statsRes.json();
            console.log("[SuperAdmin] Stats fetched successfully.");
            setStats(statsData);
        } catch (err: any) {
            console.error("[SuperAdmin] Fetch error:", err);
            setError(err.message || "Failed to connect to the backend server.");
        } finally {
            setLoading(false);
        }
    };

    const filteredWorkspaces = workspaces.filter(ws => 
        ws.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ws.owner_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <ShieldCheck className="text-purple-500" size={32} /> SaaS Command Center
                        </h1>
                        <p className="text-gray-400 mt-2">Platform-wide oversight and company management</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={fetchData}
                            className="flex items-center gap-2 bg-[#1E293B] hover:bg-gray-800 px-4 py-2 rounded-lg text-sm border border-gray-700 transition-all"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                        </button>
                        <button className="galaxy-btn-primary !py-2 !px-4 text-sm flex items-center gap-2">
                            <Plus size={16} /> New Company
                        </button>
                    </div>
                </div>
                
                    <div className="mb-8 bg-purple-500/10 border border-purple-500/50 text-purple-400 p-4 rounded-xl flex items-center gap-3">
                        <ShieldCheck size={20} />
                        <div>
                            <p className="font-bold text-sm">Backend Synchronized</p>
                            <p className="text-xs">Live data connection established.</p>
                        </div>
                    </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <StatCard label="Total Companies" value={stats?.total_workspaces ?? 0} icon={<Building2 />} color="text-blue-400" bg="bg-blue-500/10" />
                    <StatCard label="Total Users" value={stats?.total_users ?? 0} icon={<Users />} color="text-purple-400" bg="bg-purple-500/10" />
                    <StatCard label="Total Revenue" value={`$${(stats?.platform_revenue ?? 0).toLocaleString()}`} icon={<TrendingUp />} color="text-green-400" bg="bg-green-500/10" />
                    <StatCard label="Active Trials" value={stats?.active_trials ?? 0} icon={<ShieldCheck />} color="text-orange-400" bg="bg-orange-500/10" />
                </div>

                {/* Companies Table */}
                <div className="galaxy-card overflow-hidden">
                    <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1E293B]/50">
                        <h2 className="text-xl font-bold">Manage Companies</h2>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                            <input 
                                type="text" 
                                placeholder="Filter by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0F172A] text-gray-500 text-xs uppercase tracking-widest font-bold">
                                <tr>
                                    <th className="px-6 py-4">Company Name</th>
                                    <th className="px-6 py-4">Owner Email</th>
                                    <th className="px-6 py-4 text-center">Users</th>
                                    <th className="px-6 py-4">Created At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading companies...</td></tr>
                                ) : filteredWorkspaces.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No companies found.</td></tr>
                                ) : filteredWorkspaces.map(ws => (
                                    <tr key={ws.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 font-bold border border-white/5">
                                                    {ws.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-200">{ws.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{ws.owner_email}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-gray-800 px-2 py-1 rounded text-xs font-mono text-gray-300">
                                                {ws.member_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(ws.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => window.location.href = `/settings?workspace=${ws.id}`}
                                                className="flex items-center gap-1 ml-auto text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
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
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        </div>
    );
}
