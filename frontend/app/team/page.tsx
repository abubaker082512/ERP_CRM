"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { UserPlus, Mail, Shield, User, Trash2, CheckCircle, Clock } from 'lucide-react';

type Workspace = {
    workspace_id: string;
    role: string;
    workspaces: { name: string };
};

type Invitation = {
    id: string;
    email: string;
    status: string;
    workspace_id: string;
};

export default function TeamPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [inviteEmail, setInviteEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const res = await fetchAPI("/team/my-workspaces");
            if (res.ok) {
                const data = await res.json();
                setWorkspaces(data);
                if (data.length > 0) {
                    setActiveWorkspace(data[0]);
                    fetchInvitations(data[0].workspace_id);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInvitations = async (wsId: string) => {
        try {
            const res = await fetchAPI(`/team/invitations?workspace_id=${wsId}`);
            if (res.ok) setInvitations(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeWorkspace || !inviteEmail.trim()) return;

        setInviting(true);
        setError(null);
        try {
            const res = await fetchAPI("/team/invite", {
                method: "POST",
                body: JSON.stringify({
                    email: inviteEmail,
                    workspace_id: activeWorkspace.workspace_id
                })
            });

            if (res.ok) {
                setInviteEmail("");
                fetchInvitations(activeWorkspace.workspace_id);
                alert("✉️ Invitation sent successfully!");
            } else {
                const detail = await res.json();
                setError(detail.detail || "Failed to send invitation");
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setInviting(false);
        }
    };

    if (loading) return <div className="h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Team Management</h1>
                        <p className="text-gray-400 mt-2">Manage your workspace members and invitations.</p>
                    </div>

                    {workspaces.length > 1 && (
                        <select 
                            className="bg-[#1E293B] border border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                            value={activeWorkspace?.workspace_id}
                            onChange={(e) => {
                                const ws = workspaces.find(w => w.workspace_id === e.target.value);
                                if (ws) {
                                    setActiveWorkspace(ws);
                                    fetchInvitations(ws.workspace_id);
                                }
                            }}
                        >
                            {workspaces.map(ws => (
                                <option key={ws.workspace_id} value={ws.workspace_id}>
                                    {ws.workspaces.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Invite Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#1E293B] border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <UserPlus className="text-purple-400" size={20} /> Invite Member
                            </h2>
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="colleague@company.com"
                                            className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                </div>
                                {error && <p className="text-red-400 text-xs">{error}</p>}
                                <button
                                    disabled={inviting}
                                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/20"
                                >
                                    {inviting ? "Sending..." : "Send Invitation"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Members & Pending List */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Pending Invitations */}
                        <div className="bg-[#1E293B] border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Clock className="text-blue-400" size={20} /> Pending Invitations
                            </h2>
                            <div className="space-y-4">
                                {invitations.filter(i => i.status === 'pending').map(invite => (
                                    <div key={invite.id} className="flex items-center justify-between p-4 bg-[#0F172A] rounded-xl border border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <p className="font-medium">{invite.email}</p>
                                                <p className="text-xs text-gray-500">Sent just now</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
                                                PENDING
                                            </span>
                                            <button className="text-gray-500 hover:text-red-400 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {invitations.filter(i => i.status === 'pending').length === 0 && (
                                    <p className="text-center text-gray-500 py-4 italic text-sm">No pending invitations.</p>
                                )}
                            </div>
                        </div>

                        {/* Current Team Members Mock (In real life, fetch from user_workspaces) */}
                        <div className="bg-[#1E293B] border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Shield className="text-green-400" size={20} /> Workspace Members
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-[#0F172A] rounded-xl border border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                                            Y
                                        </div>
                                        <div>
                                            <p className="font-medium">You (Owner)</p>
                                            <p className="text-xs text-gray-500">Active now</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-500/10 text-purple-400">
                                            OWNER
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
